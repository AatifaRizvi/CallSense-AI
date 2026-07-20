import pandas as pd
import re
from pathlib import Path

INPUT_FILE = "data/raw/english_calls.txt"
OUTPUT_FILE = "data/processed/english_calls.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# Split by conversation headers
conversations = re.split(
    r"===\s*Conversation\s*\d+\s*===",
    text
)

rows = []
call_id = 1

for conv in conversations:

    conv = conv.strip()

    if len(conv) < 50:
        continue

    outcome_match = re.search(
        r"Outcome:\s*(Positive|Negative|Neutral)",
        conv,
        re.IGNORECASE
    )

    outcome = outcome_match.group(1).title() if outcome_match else ""

    objection_match = re.search(
        r"Objection:\s*(.*?)\s*Sentiment:",
        conv,
        re.IGNORECASE | re.DOTALL
    )

    objection = (
        objection_match.group(1).strip()
        if objection_match else ""
    )

    sentiment_match = re.search(
        r"Sentiment:\s*(Positive|Negative|Neutral)",
        conv,
        re.IGNORECASE
    )

    sentiment = (
        sentiment_match.group(1).title()
        if sentiment_match else ""
    )

    risk_match = re.search(
        r"Risk\s*Level:\s*(Low|Medium|High)",
        conv,
        re.IGNORECASE
    )

    risk_level = (
        risk_match.group(1).title()
        if risk_match else ""
    )

    # Remove metadata from conversation
    conversation_text = re.sub(
        r"Objection:.*",
        "",
        conv,
        flags=re.IGNORECASE | re.DOTALL
    ).strip()

    rows.append({
        "id": call_id,
        "outcome": outcome,
        "objection": objection,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "conversation": conversation_text
    })

    call_id += 1

df = pd.DataFrame(rows)

Path("data/processed").mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig"
)

print(f"\nCSV Created: {OUTPUT_FILE}")
print(f"Total Conversations: {len(df)}")
print(df.head())