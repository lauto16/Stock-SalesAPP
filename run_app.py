from Backend.create_notifications import delete_old_products_notifications, create_product_expiration_notifications, create_best_sellers_products_low_stock_notification
from datetime import datetime, timedelta
import subprocess
import threading
import socket
import shutil
import json
import time
import os

"""When called tries to initialize a django instance on 0.0.0.0:8000 and a react instance 0.0.0.0:5173, also does
a git pull --force, creates a db.sqlite3 backup every three days and runs the creations of notifications every 1 hour"""

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


def run_git_pull():
    """Runs git checkout main + git pull on BASE_PATH"""
    print("Actualizando programa desde git...")
    try:
        git_dir = os.path.join(BASE_PATH, ".git")

        if os.path.isdir(git_dir):
            print("Repositorio detectado. Cambiando a main...")

            subprocess.Popen(
                ["git", "fetch"],
                cwd=BASE_PATH,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW,
            ).wait()

            subprocess.Popen(
                ["git", "checkout", "main"],
                cwd=BASE_PATH,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW,
            ).wait()

            print("Ejecutando git pull...")

            subprocess.Popen(
                ["git", "pull", "--force"],
                cwd=BASE_PATH,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW,
            ).wait()

        else:
            print("No es un repo git")
    except Exception as e:
        print(e)


def port_in_use(host, port):
    """Returns True if port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def start_django():
    open(BACKEND_LOG, "w", encoding="utf-8").close()
    """Starts django instance"""
    with open(BACKEND_LOG, "a", encoding="utf-8") as log:
        log.write("\n\n--- Starting Django Server ---\n")
        log.flush()

        return subprocess.Popen(
            [
                VENV_PYTHON,
                MANAGE_PY,
                "runserver",
                "0.0.0.0:8000",
            ],
            cwd=BACKEND_PATH,
            stdout=log,
            stderr=log,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )


def start_react():
    open(FRONTEND_LOG, "w", encoding="utf-8").close()
    """Starts react instance"""
    with open(FRONTEND_LOG, "a", encoding="utf-8") as log:
        log.write("\n\n--- Starting Vite (npm run dev) ---\n")
        log.flush()

        return subprocess.Popen(
            ["cmd.exe", "/c", "npm", "run", "dev"],
            cwd=FRONTEND_PATH,
            stdout=log,
            stderr=log,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )


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


def run_notifications():
    print("Ejecutando notificaciones...")
    try:
        delete_old_products_notifications(months=1)
        create_product_expiration_notifications(limit=5)
        create_best_sellers_products_low_stock_notification(stock_limit=5)
        print("Notificaciones generadas correctamente.")
    except Exception as e:
        print("Error ejecutando notificaciones:", e)



def notification_scheduler(interval_seconds=3600):
    while True:
        try:
            time.sleep(interval_seconds)
            run_notifications()
        except Exception as e:
            print("Scheduler error:", e)


if __name__ == "__main__":
    print("Ejecutando git pull antes de iniciar servicios...")
    run_git_pull()

    print("Verificando si los servicios ya están ejecutándose...")

    django_running = port_in_use("0.0.0.0", 8000)
    react_running = port_in_use("0.0.0.0", 5173)

    django_process = None
    react_process = None
    
    last_backup = load_last_backup_time()

    if last_backup is None or datetime.now() - last_backup >= timedelta(days=3):
        create_db_backup()

    if django_running:
        print(
            "Django YA está ejecutándose en 0.0.0.0:8000. No se iniciará una nueva instancia."
        )
    else:
        print("Iniciando Django...")
        django_process = start_django()

    time.sleep(1)

    if react_running:
        print(
            "Vite/React YA está ejecutándose en el puerto 5173. No se iniciará otra instancia."
        )
    else:
        print("Iniciando Vite...")
        react_process = start_react()

    print("Servicios inicializados. Supervisando procesos lanzados por este script...")

    run_notifications()

    notif_thread = threading.Thread(
        target=notification_scheduler,
        args=(3600,),
        daemon=True
    )
    notif_thread.start()
    
    try:
        while True:
            time.sleep(5)

            if django_process is not None and django_process.poll() is not None:
                print("Django murió, reiniciando...")
                django_process = start_django()

            if react_process is not None and react_process.poll() is not None:
                print("React murió, reiniciando...")
                react_process = start_react()

    except KeyboardInterrupt:
        print("Cerrando procesos iniciados por este script...")

        if django_process:
            django_process.terminate()

        if react_process:
            react_process.terminate()

        print("Listo.")
