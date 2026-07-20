from fastapi import APIRouter, Header
from database import supabase
from auth import get_current_user

router = APIRouter()


@router.get("/history")
def get_history(authorization: str = Header(None)):
    user_id, is_admin = get_current_user(authorization)

    query = (
        supabase.table("analysis_history")
        .select("*")
        .order("created_at", desc=True)
        .limit(50)
    )

    # Non-admins only ever see their own history
    if not is_admin:
        query = query.eq("user_id", user_id)

    res = query.execute()

    return {"results": res.data or []}
