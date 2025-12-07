import subprocess
import os
import time
import socket
import json

"""When called tries to initialize a django instance on 0.0.0.0:8000 and a react instance 0.0.0.0:5173"""

BASE_PATH = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_PATH, "config.json")

with open(CONFIG_PATH, "r", encoding="utf-8") as f:
    config = json.load(f)

REPO_URL = config["repoURL"]

BACKEND_PATH = os.path.join(BASE_PATH, config["paths"]["backend"])
FRONTEND_PATH = os.path.join(BASE_PATH, config["paths"]["frontend"])
BACKEND_LOG = os.path.join(BACKEND_PATH, "backend.log")
FRONTEND_LOG = os.path.join(FRONTEND_PATH, "frontend.log")

VENV_PYTHON = os.path.join(BACKEND_PATH, "venv", "Scripts", "python.exe")
MANAGE_PY = os.path.join(BACKEND_PATH, "manage.py")


def run_git_pull():
    """Ejecuta git pull en BASE_PATH"""
    print("Actualizando proyecto desde git...")
    try:
        git_dir = os.path.join(BASE_PATH, ".git")

        if os.path.isdir(git_dir):
            print("Repositorio detectado. Ejecutando git pull...")
            subprocess.Popen(
                ["git", "pull", "--force"],
                cwd=BASE_PATH,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW
            ).wait()
        else:
            print("No es un repo git")
    except Exception as e:
        print(e)
        pass

def port_in_use(host, port):
    """Returns True if port is in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0

def start_django():
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
            creationflags=subprocess.CREATE_NO_WINDOW
        )

def start_react():
    """Starts react instance"""
    with open(FRONTEND_LOG, "a", encoding="utf-8") as log:
        log.write("\n\n--- Starting Vite (npm run dev) ---\n")
        log.flush()

        return subprocess.Popen(
            ["cmd.exe", "/c", "npm", "run", "dev"],
            cwd=FRONTEND_PATH,
            stdout=log,
            stderr=log,
            creationflags=subprocess.CREATE_NO_WINDOW
        )


if __name__ == "__main__":
    print("Ejecutando git pull antes de iniciar servicios...")
    run_git_pull()

    print("Verificando si los servicios ya están ejecutándose...")

    django_running = port_in_use("0.0.0.0", 8000)
    react_running = port_in_use("0.0.0.0", 5173)

    django_process = None
    react_process = None

    if django_running:
        print("Django YA está ejecutándose en 0.0.0.0:8000. No se iniciará una nueva instancia.")
    else:
        print("Iniciando Django...")
        django_process = start_django()

    time.sleep(1)
    
    if react_running:
        print("Vite/React YA está ejecutándose en el puerto 5173. No se iniciará otra instancia.")
    else:
        print("Iniciando Vite...")
        react_process = start_react()

    print("Servicios inicializados. Supervisando procesos lanzados por este script...")

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