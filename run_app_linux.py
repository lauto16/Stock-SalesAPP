from Backend.create_notifications import (
    delete_old_products_notifications,
    create_product_expiration_notifications,
    create_best_sellers_products_low_stock_notification,
)
from datetime import datetime, timedelta
import subprocess
import socket
import shutil
import json
import time
import os

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_PATH, "config.json")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

BACKEND_PATH = os.path.join(BASE_PATH, config["paths"]["backend"])
FRONTEND_PATH = os.path.join(BASE_PATH, config["paths"]["frontend"])

BACKEND_LOG = os.path.join(BACKEND_PATH, "backend.log")
FRONTEND_LOG = os.path.join(FRONTEND_PATH, "frontend.log")

DB_PATH = os.path.join(BACKEND_PATH, "db.sqlite3")
BACKUPS_DIR = os.path.join(BACKEND_PATH, "db_backups")
META_FILE = os.path.join(BACKUPS_DIR, "backup_meta.json")

os.makedirs(BACKUPS_DIR, exist_ok=True)

VENV_PYTHON = os.path.join(BACKEND_PATH, "venv", "bin", "python")
MANAGE_PY = os.path.join(BACKEND_PATH, "manage.py")


def run_git_pull():
    print("Actualizando proyecto desde git...")
    if os.path.isdir(os.path.join(BASE_PATH, ".git")):
        subprocess.run(
            ["git", "pull", "--force"],
            cwd=BASE_PATH,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def port_in_use(host, port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def start_django():
    open(BACKEND_LOG, "w").close()

    with open(BACKEND_LOG, "a") as log:
        log.write("\n--- Starting Django ---\n")
        log.flush()

        return subprocess.Popen(
            [VENV_PYTHON, MANAGE_PY, "runserver", "192.168.100.98:8000"],
            cwd=BACKEND_PATH,
            stdout=log,
            stderr=log,
        )


def start_react():
    open(FRONTEND_LOG, "w").close()

    with open(FRONTEND_LOG, "a") as log:
        log.write("\n--- Starting Vite ---\n")
        log.flush()

        return subprocess.Popen(
            ["npm", "run", "dev"],
            cwd=FRONTEND_PATH,
            stdout=log,
            stderr=log,
        )


def load_last_backup_time():
    if not os.path.isfile(META_FILE):
        return None
    with open(META_FILE, "r") as f:
        return datetime.fromisoformat(json.load(f)["last_backup"])


def save_last_backup_time(dt):
    with open(META_FILE, "w") as f:
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
        os.remove(backups.pop(0))


def create_db_backup():
    if not os.path.isfile(DB_PATH):
        return

    name = f"db_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.sqlite3"
    shutil.copy2(DB_PATH, os.path.join(BACKUPS_DIR, name))
    rotate_backups()
    save_last_backup_time(datetime.now())
    print(f"Backup creado: {name}")


if __name__ == "__main__":
    run_git_pull()

    django_running = port_in_use("0.0.0.0", 8000)
    react_running = port_in_use("0.0.0.0", 5173)

    delete_old_products_notifications(months=1)
    create_product_expiration_notifications(limit=5)
    create_best_sellers_products_low_stock_notification(stock_limit=5)

    last_backup = load_last_backup_time()
    if last_backup is None or datetime.now() - last_backup >= timedelta(days=3):
        create_db_backup()

    django_process = None
    react_process = None

    if not django_running:
        django_process = start_django()

    time.sleep(1)

    if not react_running:
        react_process = start_react()

    try:
        while True:
            time.sleep(5)

            if django_process and django_process.poll() is not None:
                django_process = start_django()

            if react_process and react_process.poll() is not None:
                react_process = start_react()

    except KeyboardInterrupt:
        if django_process:
            django_process.terminate()
        if react_process:
            react_process.terminate()
