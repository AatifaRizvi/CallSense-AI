from fastapi import APIRouter, Header
from typing import Optional
from database import supabase

router = APIRouter()

@router.get("/profile")
def get_profile(authorization: Optional[str] = Header(None)):
    """Get current user profile with role."""
    try:
        if not authorization:
            return {"error": "No token"}
        
        token = authorization.replace("Bearer ", "")
        user = supabase.auth.get_user(token)
        user_id = user.user.id
        
        res = supabase.table("user_profiles")\
            .select("*")\
            .eq("id", user_id)\
            .single()\
            .execute()
        
        return res.data
    except Exception as e:
        return {"role": "user", "error": str(e)}