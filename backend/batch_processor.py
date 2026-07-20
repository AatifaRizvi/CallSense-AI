"""
batch_processor.py

Processes calls_transcript.csv and master_reviews.csv through the LLM analyzer.
Supports RESUME — skips already-processed rows, retries Unknown/failed ones.

Usage:
    python batch_processor.py                      # process both
    python batch_processor.py --source calls       # only calls
    python batch_processor.py --source reviews     # only reviews
    python batch_processor.py --limit 5            # test with 5 rows
    python batch_processor.py --retry-unknown      # reprocess Unknown rows only
"""

import os
import time
import argparse
import pandas as pd
from llm_analyzer import analyze_text

# Paths
CALLS_PATH   = "../data/processed/calls_transcript.csv"
REVIEWS_PATH = "../data/processed/master_reviews.csv"
OUTPUT_PATH  = "../data/processed/analysis_results.csv"

API_DELAY        = 0.5 # seconds between requests
RATE_LIMIT_WAIT  = 65    # seconds to wait when 429 hit


def analyze_with_rate_limit_handling(text: str, source_type: str) -> dict:
    for wait_attempt in range(3):
        result = analyze_text(text, source_type=source_type)
        if result.get("sentiment") != "Unknown":
            return result
        print(f"\n  Rate limit hit — waiting {RATE_LIMIT_WAIT}s before retry ({wait_attempt+1}/3)...")
        time.sleep(RATE_LIMIT_WAIT)
    print("  Still failing after waits — saving as Unknown.")
    return result


def load_existing_results() -> pd.DataFrame:
    if os.path.exists(OUTPUT_PATH):
        df = pd.read_csv(OUTPUT_PATH)
        print(f"Found existing results: {len(df)} rows")
        return df
    return pd.DataFrame()


FAILED_SENTINELS = {"Unknown", "Analysis failed"}


def get_skip_ids(existing_df: pd.DataFrame, retry_unknown: bool) -> set:
    if existing_df.empty:
        return set()
    if retry_unknown:
        return set(existing_df[~existing_df["sentiment"].isin(FAILED_SENTINELS)]["record_id"].tolist())
    return set(existing_df["record_id"].tolist())


def process_calls(df: pd.DataFrame, skip_ids: set) -> pd.DataFrame:
    records = []
    to_process = df[~df["call_id"].isin(skip_ids)]

    if to_process.empty:
        print("All calls already processed.")
        return pd.DataFrame()

    print(f"\nProcessing {len(to_process)} calls (skipping {len(df)-len(to_process)} already done)...")

    for idx, (_, row) in enumerate(to_process.iterrows()):
        print(f"  [{idx+1}/{len(to_process)}] {row['call_id']} ({row['language']})", end=" ... ", flush=True)
        analysis = analyze_with_rate_limit_handling(row["transcript"], "call")
        records.append({
            "record_id":         row["call_id"],
            "source_type":       "call",
            "source_file":       row["file_name"],
            "language":          row["language"],
            "input_text":        row["transcript"],
            "duration_sec":      row.get("duration_sec"),
            "sentiment":         analysis["sentiment"],
            "category":          analysis["category"],
            "intent":            analysis["intent"],
            "summary":           analysis["summary"],
            "objection":         analysis["objection"],
            "action_item":       analysis["action_item"],
            "outcome":           analysis["outcome"],
            "risk_level":        analysis["risk_level"],
            "language_detected": analysis["language_detected"],
        })
        icon = "✓" if analysis["sentiment"] != "Unknown" else ""
        print(f"{icon}  sentiment={analysis['sentiment']}  outcome={analysis['outcome']}")
        time.sleep(API_DELAY)

    return pd.DataFrame(records)


def process_reviews(df: pd.DataFrame, skip_ids: set) -> pd.DataFrame:
    records = []
    to_process = df[~df["master_id"].isin(skip_ids)]

    if to_process.empty:
        print("All reviews already processed.")
        return pd.DataFrame()

    print(f"\nProcessing {len(to_process)} reviews (skipping {len(df)-len(to_process)} already done)...")

    for idx, (_, row) in enumerate(to_process.iterrows()):
        print(f"  [{idx+1}/{len(to_process)}] {row['master_id']} ({row['language']})", end=" ... ", flush=True)
        analysis = analyze_with_rate_limit_handling(row["review_text"], "review")
        records.append({
            "record_id":         row["master_id"],
            "source_type":       "review",
            "source_file":       None,
            "language":          row["language"],
            "input_text":        row["review_text"],
            "duration_sec":      None,
            "rating":            row.get("rating"),
            "title":             row.get("title"),
            "designation":       row.get("designation"),
            "company":           row.get("company"),
            "date":              row.get("date"),
            "review_source":     row.get("source"),
            "sentiment":         analysis["sentiment"],
            "category":          analysis["category"],
            "intent":            analysis["intent"],
            "summary":           analysis["summary"],
            "objection":         analysis["objection"],
            "action_item":       analysis["action_item"],
            "outcome":           analysis["outcome"],
            "risk_level":        analysis["risk_level"],
            "language_detected": analysis["language_detected"],
        })
        icon = "✓" if analysis["sentiment"] != "Unknown" else ""
        print(f"{icon}  sentiment={analysis['sentiment']}  category={analysis['category']}")
        time.sleep(API_DELAY)

    return pd.DataFrame(records)


def save_results(existing_df: pd.DataFrame, new_df: pd.DataFrame, retry_unknown: bool) -> pd.DataFrame:
    if new_df.empty:
        return existing_df
    if existing_df.empty:
        final_df = new_df
    else:
        if retry_unknown:
            reprocessed_ids = set(new_df["record_id"].tolist())
            existing_clean = existing_df[~existing_df["record_id"].isin(reprocessed_ids)]
            final_df = pd.concat([existing_clean, new_df], ignore_index=True)
        else:
            final_df = pd.concat([existing_df, new_df], ignore_index=True)
    final_df.to_csv(OUTPUT_PATH, index=False)
    return final_df


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", choices=["calls", "reviews", "both"], default="both")
    parser.add_argument("--limit", type=int, default=None)
    parser.add_argument("--retry-unknown", action="store_true",
                        help="Reprocess rows that previously returned Unknown sentiment")
    args = parser.parse_args()

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    existing_df = load_existing_results()
    skip_ids    = get_skip_ids(existing_df, args.retry_unknown)

    if args.retry_unknown and not existing_df.empty:
        unknown_count = len(existing_df[existing_df["sentiment"].isin(FAILED_SENTINELS)])
        print(f"Retry mode: {unknown_count} failed/unknown rows will be reprocessed")

    if args.source in ("calls", "both"):
        calls_df = pd.read_csv(CALLS_PATH)
        if args.limit:
            calls_df = calls_df.head(args.limit)
        new_calls = process_calls(calls_df, skip_ids)
        if not new_calls.empty:
            existing_df = save_results(existing_df, new_calls, args.retry_unknown)
            print(f"Saved {len(new_calls)} call results")

    if args.source in ("reviews", "both"):
        reviews_df = pd.read_csv(REVIEWS_PATH)
        if args.limit:
            reviews_df = reviews_df.head(args.limit)
        new_reviews = process_reviews(reviews_df, skip_ids)
        if not new_reviews.empty:
            existing_df = save_results(existing_df, new_reviews, args.retry_unknown)
            print(f"Saved {len(new_reviews)} review results")

    if not existing_df.empty:
        print(f"\nTotal in analysis_results.csv: {len(existing_df)} rows")
        print(f"\nSentiment breakdown:\n{existing_df['sentiment'].value_counts()}")
        print(f"\nOutcome breakdown:\n{existing_df['outcome'].value_counts()}")
        unknown = len(existing_df[existing_df["sentiment"].isin(FAILED_SENTINELS)])
        if unknown > 0:
            print(f"\n{unknown} rows still failed/unknown — run again or use --retry-unknown")


if __name__ == "__main__":
    main()