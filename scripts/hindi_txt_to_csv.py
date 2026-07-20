import pandas as pd
import re
from pathlib import Path
import csv

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = BASE_DIR / "data" / "raw" / "hindi_calls.txt"
OUTPUT_FILE = BASE_DIR / "data" / "processed" / "hindi_calls.csv"

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    text = f.read()

# Split on:
# Call 1:
# कॉल 1:
# संवाद 11 (Call 11):

pattern = r"(?=कॉल\s*\d+\s*:|Call\s*\d+\s*:|संवाद\s*\d+\s*\(Call\s*\d+\)\s*:)"

blocks = re.split(pattern, text)

rows = []

for block in blocks:

    block = block.strip()

    if len(block) < 30:
        continue

    objection = ""
    sentiment = ""
    risk_level = ""

    obj = re.search(
        r"Objection:\s*(.+)",
        block,
        flags=re.IGNORECASE
    )

    sen = re.search(
        r"Sentiment:\s*(.+)",
        block,
        flags=re.IGNORECASE
    )

    risk = re.search(
        r"Risk\s*Level:\s*(.+)",
        block,
        flags=re.IGNORECASE
    )

    if obj:
        objection = obj.group(1).strip()

    if sen:
        sentiment = sen.group(1).strip()

    if risk:
        risk_level = risk.group(1).strip()

    rows.append({
        "id": len(rows) + 1,
        "objection": objection,
        "sentiment": sentiment,
        "risk_level": risk_level,
        "conversation": block
    })

df = pd.DataFrame(rows)

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig",
    quoting=csv.QUOTE_ALL
)

print(f"Rows Found : {len(df)}")
print(f"Saved      : {OUTPUT_FILE}")
print(df.head())