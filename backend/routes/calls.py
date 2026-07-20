from fastapi import APIRouter, Query, Header
from typing import Optional
from database import supabase
from auth import get_current_user

router = APIRouter()

@router.get("/calls")
def get_calls(
    sentiment: Optional[str] = Query(None),
    outcome:   Optional[str] = Query(None),
    language:  Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search:    Optional[str] = Query(None),
    page:      int = Query(1, ge=1),
    limit:     int = Query(20, le=100),
    authorization: str = Header(None),
):
    user_id, is_admin = get_current_user(authorization)

    query = supabase.table("analysis_results").select("*").eq("source_type", "call")

    if not is_admin:
        query = query.eq("user_id", user_id)

    if sentiment:
        query = query.eq("sentiment", sentiment)
    if outcome:
        query = query.eq("outcome", outcome)
    if language:
        query = query.ilike("language", f"%{language}%")
    if risk_level:
        query = query.eq("risk_level", risk_level)
    if search:
        query = query.or_(
            f"record_id.ilike.%{search}%,"
            f"input_text.ilike.%{search}%"
     )

    # Pagination
    offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    res = query.execute()

    return {
        "page":    page,
        "limit":   limit,
        "results": res.data,
        "count":   len(res.data),
    }

@router.get("/calls/{record_id}")
def get_call_detail(record_id: str, authorization: str = Header(None)):
    """full detail of single call."""
    user_id, is_admin = get_current_user(authorization)

    query = supabase.table("analysis_results").select("*").eq("record_id", record_id)
    if not is_admin:
        query = query.eq("user_id", user_id)

    res = query.execute()
    if not res.data:
        return {"error": "Call not found"}
    return res.data[0]