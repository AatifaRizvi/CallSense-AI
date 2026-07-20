"""
Regenerates the 'title' field ONLY for rows where the existing title
contains Hindi/Devanagari characters (i.e., it's broken/non-English).
Rows that already have a clean English title are left untouched.

"""

import re
import time
from database import supabase
from llm_analyzer import generate_english_title

PAGE_SIZE = 1000  # Supabase's per-request row cap

# Matches any Devanagari character (Hindi script)
DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")


def needs_fix(title: str) -> bool:
    """A title needs fixing if it's missing, or contains Devanagari script."""
    if not title or not title.strip():
        return True
    return bool(DEVANAGARI_RE.search(title))


def fetch_all_rows():
    all_rows = []
    offset = 0
    while True:
        res = (
            supabase.table("analysis_results")
            .select("id, input_text, title")
            .range(offset, offset + PAGE_SIZE - 1)
            .execute()
        )
        batch = res.data or []
        all_rows.extend(batch)
        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE
    return all_rows


def main():
    rows = fetch_all_rows()
    to_fix = [r for r in rows if needs_fix(r.get("title"))]

    print(f"Total records: {len(rows)}")
    print(f"Already clean (skipping): {len(rows) - len(to_fix)}")
    print(f"Need fixing: {len(to_fix)}\n")

    for i, row in enumerate(to_fix, start=1):
        row_id = row["id"]
        text = row.get("input_text") or ""

        if not text.strip():
            print(f"[{i}/{len(to_fix)}] id={row_id} — no input_text, skipping")
            continue

        new_title = generate_english_title(text)

        supabase.table("analysis_results").update(
            {"title": new_title}
        ).eq("id", row_id).execute()

        old_title = row.get("title") or "(empty)"
        print(f"[{i}/{len(to_fix)}] id={row_id}  \"{old_title}\"  ->  \"{new_title}\"")

        time.sleep(0.3)

    print(f"\nDone. Fixed {len(to_fix)} records, left {len(rows) - len(to_fix)} untouched.")


if __name__ == "__main__":
    main()


if __name__ == "__main__":
    main()