from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import get_settings

API_KEY_HEADER = APIKeyHeader(name="x-internal-secret", auto_error=False)

def verify_internal_secret(api_key: str = Security(API_KEY_HEADER)) -> bool:
    settings = get_settings()
    # In debug mode without secret set, allow local development calls
    if not settings.INTERNAL_SERVICE_SECRET:
        return True
    
    if not api_key or api_key != settings.INTERNAL_SERVICE_SECRET:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Unauthorized: Invalid internal service secret",
        )
    return True
