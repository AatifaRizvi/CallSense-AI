import pandas as pd
import re
from pathlib import Path

input_file = "../data/raw/hinglish_calls.txt"
output_file = "../data/processed/hinglish_calls.csv"

# Read TXT
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# CLEANING

# Remove PDF words
text = re.sub(r"\bPDF\b", "", text)

# Remove weird spaces
text = re.sub(r"\s+\n", "\n", text)

# Remove extra blank lines
text = re.sub(r"\n{3,}", "\n\n", text)

# SPLIT CONVERSATIONS
conversations = re.split(
    r"Scenario\s*\d+\s*:",
    text,
    flags=re.IGNORECASE
)

rows = []

for idx, conv in enumerate(conversations[1:], start=1):

    conv = conv.strip()

    objection = ""
    sentiment = ""
    risk_level = ""

    objection_match = re.search(
        r"Objection:\s*(.*)",
        conv,
        re.IGNORECASE
    )

    sentiment_match = re.search(
        r"Sentiment:\s*(.*)",
        conv,
        re.IGNORECASE
    )

    risk_match = re.search(
        r"Risk\s*Level:\s*(.*)",
        conv,
        re.IGNORECASE
    )

    if objection_match:
        objection = objection_match.group(1).strip()

    if sentiment_match:
        sentiment = sentiment_match.group(1).strip()

    if risk_match:
        risk_level = risk_match.group(1).strip()

    # Remove metadata from conversation
    conversation_text = re.sub(
        r"Objection:.*",
        "",
        conv,
        flags=re.IGNORECASE | re.DOTALL
    ).strip()

    rows.append({
        "id": idx,
        "objection": objection,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "conversation": conversation_text
    })

df = pd.DataFrame(rows)

Path(output_file).parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    output_file,
    index=False,
    encoding="utf-8-sig"
)

print(f"CSV Saved: {output_file}")
print(f"Rows: {len(df)}")
print(df.head())