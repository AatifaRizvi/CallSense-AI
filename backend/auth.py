from fastapi import Header, HTTPException
from database import supabase


def get_current_user(authorization: str = Header(None)):
    """
    Extracts the logged-in user from the Supabase JWT sent in the
    Authorization header (format: 'Bearer <token>'), then looks up
    their role from user_profiles.
    Returns (user_id, is_admin).
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    try:
        user_res = supabase.auth.get_user(token)
        user = user_res.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    profile_res = (
        supabase.table("user_profiles")
        .select("role")
        .eq("id", user.id)
        .maybe_single()
        .execute()
    )
    role = (profile_res.data or {}).get("role", "user") if profile_res else "user"

    return user.id, role == "admin"