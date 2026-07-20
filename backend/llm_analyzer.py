import os
import json
import time
import re
from dotenv import load_dotenv
from groq import Groq

from prompts import CALL_SYSTEM_PROMPT, REVIEW_SYSTEM_PROMPT

load_dotenv()

# Load all 3 Groq API keys
GROQ_KEYS = [
    os.getenv("GROQ_API_KEY"),
    os.getenv("GROQ_API_KEY_II"),
    os.getenv("GROQ_API_KEY_III"),
]

GROQ_KEYS = [k for k in GROQ_KEYS if k]

if not GROQ_KEYS:
    raise ValueError("No Groq API keys found! Set GROQ_API_KEY, GROQ_API_KEY_II, GROQ_API_KEY_III in .env")

print(f"Loaded {len(GROQ_KEYS)} Groq API key(s)")

# Create one client per key
GROQ_CLIENTS = [Groq(api_key=key) for key in GROQ_KEYS]

MODEL = "llama-3.1-8b-instant" 

# Expected keys in every response
EXPECTED_KEYS = [
    "title", "sentiment", "category", "intent", "summary",
    "objection", "action_item", "outcome", "risk_level", "language_detected"
]

FALLBACK_RESPONSE = {
    "title": "Untitled",
    "sentiment": "Unknown",
    "category": "Other",
    "intent": "Unknown",
    "summary": "Analysis failed",
    "objection": "None",
    "action_item": "Manual review required",
    "outcome": "No Action",
    "risk_level": "Medium",
    "language_detected": "Unknown"
}

# Track which key we are currently using
_current_key_index = 0


def _next_client():
    global _current_key_index
    client = GROQ_CLIENTS[_current_key_index]
    _current_key_index = (_current_key_index + 1) % len(GROQ_CLIENTS)
    return client, _current_key_index


def _clean_json_string(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _parse_response(raw_text: str) -> dict:
    cleaned = _clean_json_string(raw_text)
    result = json.loads(cleaned)
    for key in EXPECTED_KEYS:
        if key not in result:
            result[key] = FALLBACK_RESPONSE[key]
    return result


def analyze_text(text: str, source_type: str = "call") -> dict:
    """
    Analyze a single transcript or review text.
    Rotates through 3 Groq API keys automatically.
    When one key hits token/rate limit, switches to next key.

    Args:
        text:        Raw transcript or review text
        source_type: 'call' or 'review'

    Returns:
        dict with sentiment, category, intent, summary,
              objection, action_item, outcome, risk_level, language_detected
    """
    source_label  = "Sales Call Transcript" if source_type == "call" else "Customer Review"
    system_prompt = CALL_SYSTEM_PROMPT if source_type == "call" else REVIEW_SYSTEM_PROMPT

    prompt = f"""{system_prompt}

--- {source_label} ---

{text}

---

Return ONLY the JSON object."""

    total_attempts = len(GROQ_CLIENTS) * 2

    for attempt in range(total_attempts):
        key_index = attempt % len(GROQ_CLIENTS)
        client    = GROQ_CLIENTS[key_index]

        try:
            response = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1
            )

            raw = response.choices[0].message.content

            print("\n GROQ RESPONSE ")
            print(raw)
            print("\n")

            return _parse_response(raw)

        except json.JSONDecodeError as e:
            print(f"  [Key #{key_index+1}] JSON parse error: {e}")
            time.sleep(1)
            continue

        except Exception as e:
            err = str(e)

            if "429" in err or "rate_limit" in err.lower():
                # Token or request limit on this key
                if key_index < len(GROQ_CLIENTS) - 1:
                    # More keys available — switch immediately
                    print(f"  [Key #{key_index+1}] Rate/token limited — switching to Key #{key_index+2}...")
                    time.sleep(1)
                else:
                    # All keys exhausted in this round — wait before next round
                    print(f"  All keys rate limited — waiting 65s before retry...")
                    time.sleep(65)
            else:
                print(f"  [Key #{key_index+1}] Error: {e}")
                time.sleep(2)

    print("  All attempts failed — returning fallback.")
    return FALLBACK_RESPONSE.copy()


def generate_english_title(text: str, max_words: int = 6) -> str:
    """
    Generates a short, clear ENGLISH title summarizing the given text,
    regardless of what language the original text is written in
    (English, Hindi, or Hinglish). Uses the same key-rotation as analyze_text.

    Args:
        text: The raw transcript or review text (any supported language)

    Returns:
        A short English title string. Falls back to "Untitled" on failure.
    """
    if not text or not text.strip():
        return "Untitled"

    prompt = f"""Write a short HEADLINE (not a summary, not a full sentence) for the
text below, in English ONLY, even if the original text is in Hindi or Hinglish.

Rules:
- Maximum {max_words} words.
- No verbs like "is", "was", "describes" — use a noun phrase, like a news headline.
- No punctuation at the end, no quotes.
- Do not explain what the text is about — just name the topic.

Examples of GOOD headlines:
- "BLDC Fan Speed Disappointing"
- "Pricing Objection on Annual Plan"
- "Aveeno Baby Wash Eczema Relief"
- "AirTag Lost Luggage Recovery"

Examples of BAD output (too long / summary-style, do NOT do this):
- "Customer complains that the product did not meet expectations and support was slow"
- "This review discusses the user's experience with battery life issues over several weeks"

--- Text ---
{text[:1500]}
---

Headline:"""

    total_attempts = len(GROQ_CLIENTS) * 2

    for attempt in range(total_attempts):
        key_index = attempt % len(GROQ_CLIENTS)
        client    = GROQ_CLIENTS[key_index]

        try:
            response = client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                max_tokens=16,
            )
            title = response.choices[0].message.content.strip()
            # Strip surrounding quotes/punctuation if the model added them
            title = title.strip('"').strip("'").strip(".").strip()
            # Safety net: if the model still rambles, hard-truncate to max_words
            words = title.split()
            if len(words) > max_words:
                title = " ".join(words[:max_words])
            return title if title else "Untitled"

        except Exception as e:
            err = str(e)
            if "429" in err or "rate_limit" in err.lower():
                if key_index < len(GROQ_CLIENTS) - 1:
                    print(f"  [Key #{key_index+1}] Rate limited — switching key...")
                    time.sleep(1)
                else:
                    print("  All keys rate limited — waiting 65s...")
                    time.sleep(65)
            else:
                print(f"  [Key #{key_index+1}] Error generating title: {e}")
                time.sleep(2)

    return "Untitled"