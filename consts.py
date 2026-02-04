import json
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_PATH, "config.json")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

REPO_URL = config["repoURL"]

BACKEND_PATH = os.path.join(BASE_PATH, config["paths"]["backend"])
FRONTEND_PATH = os.path.join(BASE_PATH, config["paths"]["frontend"])
BACKEND_LOG = os.path.join(BACKEND_PATH, "backend.log")
FRONTEND_LOG = os.path.join(FRONTEND_PATH, "frontend.log")
DB_PATH = os.path.join(BACKEND_PATH, "db.sqlite3")
BACKUPS_DIR = os.path.join(BACKEND_PATH, "db_backups")
META_FILE = os.path.join(BACKUPS_DIR, "backup_meta.json")

os.makedirs(BACKUPS_DIR, exist_ok=True)

VENV_PYTHON = os.path.join(BACKEND_PATH, "venv", "Scripts", "python.exe")
MANAGE_PY = os.path.join(BACKEND_PATH, "manage.py")