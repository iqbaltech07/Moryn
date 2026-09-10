import os
from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Server configs
    APP_NAME: str = "Moryn AI Engine"
    API_V1_STR: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    DEBUG: bool = True

    # Security: Shared secret with Next.js BFF proxy
    INTERNAL_SERVICE_SECRET: str = "moryn_internal_ai_secret_dev"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "https://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # AI API Keys
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_API_KEY_SECONDARY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None

    # Model Defaults
    DEFAULT_GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_FALLBACK_MODELS: List[str] = [
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ]
    DEFAULT_OPENROUTER_MODEL: str = "gemini-3.6-flash"
    GEMINI_EMBEDDING_MODEL: str = "gemini-embedding-001"

    # Support multiple .env locations (local .env, then root ../../.env)
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def gemini_keys(self) -> List[str]:
        keys = []
        if self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip():
            keys.append(self.GEMINI_API_KEY.strip())
        if self.GEMINI_API_KEY_SECONDARY and self.GEMINI_API_KEY_SECONDARY.strip():
            keys.append(self.GEMINI_API_KEY_SECONDARY.strip())
        return keys

@lru_cache()
def get_settings() -> Settings:
    return Settings()
