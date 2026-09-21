import sys
from pathlib import Path

# Ensure root directory of ai-engine is in sys.path so app imports resolve smoothly
root_path = Path(__file__).resolve().parent.parent
if str(root_path) not in sys.path:
    sys.path.insert(0, str(root_path))

from app.main import app
