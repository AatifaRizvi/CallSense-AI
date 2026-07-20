from fastapi import APIRouter, Header
from database import supabase
from auth import get_current_user

router = APIRouter()

PAGE_SIZE = 1000  # Supabase/PostgREST caps each request at this many rows


def fetch_all_rows(is_admin: bool, user_id: str):
    all_rows = []
    offset = 0

    while True:
        query = supabase.table("analysis_results").select(
            "source_type, sentiment, outcome, category, language, risk_level, user_id"
        )
        if not is_admin:
            query = query.eq("user_id", user_id)

        query = query.range(offset, offset + PAGE_SIZE - 1)
        res = query.execute()
        batch = res.data or []
        all_rows.extend(batch)

        if len(batch) < PAGE_SIZE:
            break
        offset += PAGE_SIZE

    return all_rows


@router.get("/stats")
def get_stats(authorization: str = Header(None)):
    user_id, is_admin = get_current_user(authorization)

    data = fetch_all_rows(is_admin, user_id)
    total = len(data)

    calls   = [r for r in data if r["source_type"] == "call"]
    reviews = [r for r in data if r["source_type"] == "review"]

    def count_by(rows, key):
        result = {}
        for r in rows:
            val = r.get(key) or "Unknown"
            result[val] = result.get(val, 0) + 1
        return result
    
    # Win rate (calls only)
    closed_won = sum(
        1 for r in calls
        if (r.get("outcome") or "").strip().lower() == "closed won"
    )

    win_rate = round((closed_won / len(calls) * 100), 1) if calls else 0

    return {
        "total":          total,
        "total_calls":    len(calls),
        "total_reviews":  len(reviews),
        "win_rate":       win_rate,
        "sentiment":      count_by(data, "sentiment"),
        "outcome":        count_by(calls, "outcome"),
        "category":       count_by(data, "category"),
        "language":       count_by(data, "language"),
        "risk_level":     count_by(data, "risk_level"),
        "is_admin":       is_admin,
    }