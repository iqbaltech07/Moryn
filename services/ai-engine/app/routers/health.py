from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
async def health_check():
    settings = get_settings()
    return {
        "status": "online",
        "app": settings.APP_NAME,
        "keys_loaded": len(settings.gemini_keys),
        "openrouter_enabled": bool(settings.OPENROUTER_API_KEY),
        "default_model": settings.DEFAULT_GEMINI_MODEL,
    }
