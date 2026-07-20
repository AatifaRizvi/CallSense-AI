import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_DIR = BASE_DIR / "data" / "raw" / "eng_raw_reviews"

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "english_reviews.csv"
)

print("Looking in:", INPUT_DIR)

csv_files = list(INPUT_DIR.glob("*.csv"))

print("Found files:")
for f in csv_files:
    print(" -", f.name)

if len(csv_files) == 0:
    raise Exception(
        f"No CSV files found in:\n{INPUT_DIR}"
    )

all_dfs = []

for file in csv_files:

    try:
        df = pd.read_csv(
            file,
            encoding="utf-8",
            on_bad_lines="skip"
        )

        print(
            f"Loaded {file.name} -> {len(df)} rows"
        )

        all_dfs.append(df)

    except Exception as e:
        print(
            f"Skipping {file.name}: {e}"
        )

if len(all_dfs) == 0:
    raise Exception(
        "All files failed to load."
    )

final_df = pd.concat(
    all_dfs,
    ignore_index=True
)

final_df.drop_duplicates(
    inplace=True
)

OUTPUT_FILE.parent.mkdir(
    parents=True,
    exist_ok=True
)

final_df.to_csv(
    OUTPUT_FILE,
    index=False,
    encoding="utf-8-sig"
)

print("\nDone!")
print("Rows:", len(final_df))
print("Saved to:", OUTPUT_FILE)