from consts import META_FILE, BACKUPS_DIR, DB_PATH
from datetime import datetime
import shutil
import json
import os


def load_last_backup_time():
    if not os.path.isfile(META_FILE):
        return None
    with open(META_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)
        return datetime.fromisoformat(data["last_backup"])


def save_last_backup_time(dt):
    with open(META_FILE, "w", encoding="utf-8") as f:
        json.dump({"last_backup": dt.isoformat()}, f)


def rotate_backups():
    backups = sorted(
        [
            os.path.join(BACKUPS_DIR, f)
            for f in os.listdir(BACKUPS_DIR)
            if f.endswith(".sqlite3")
        ],
        key=os.path.getctime,
    )

    while len(backups) > 7:
        os.remove(backups[0])
        backups.pop(0)


def create_db_backup():
    if not os.path.isfile(DB_PATH):
        return

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_name = f"db_backup_{timestamp}.sqlite3"
    backup_path = os.path.join(BACKUPS_DIR, backup_name)

    shutil.copy2(DB_PATH, backup_path)
    rotate_backups()
    save_last_backup_time(datetime.now())
    print(f"Backup de DB creado: {backup_name}")

