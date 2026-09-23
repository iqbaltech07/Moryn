import sys
from pathlib import Path

# Add services/ai-engine to sys.path so app and its modules resolve seamlessly
ai_engine_dir = Path(__file__).resolve().parent / "services" / "ai-engine"
if str(ai_engine_dir) not in sys.path:
    sys.path.insert(0, str(ai_engine_dir))

from app.main import app

__all__ = ["app"]
