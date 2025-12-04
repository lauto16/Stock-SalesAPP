import subprocess
import os
import time
import socket


BASE_PATH = os.path.dirname(os.path.abspath(__file__))
BACKEND_PATH = os.path.join(BASE_PATH, "Backend")
VENV_PYTHON = os.path.join(BACKEND_PATH, "venv", "Scripts", "python.exe")
MANAGE_PY = os.path.join(BACKEND_PATH, "manage.py")
BACKEND_LOG = os.path.join(BACKEND_PATH, "backend.log")

FRONTEND_PATH = os.path.join(BASE_PATH, "Frontend", "TiendaClick")
FRONTEND_LOG = os.path.join(FRONTEND_PATH, "frontend.log")


def port_in_use(host, port):
    """Devuelve True si el puerto está ocupado, False si está libre."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


def start_django():
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
    print("Verificando si los servicios ya están ejecutándose...")

    django_running = port_in_use("0.0.0.0", 8000)
    react_running = port_in_use("0.0.0.0", 5173)

    django_process = None
    react_process = None

    # Django
    if django_running:
        print("Django YA está ejecutándose en 0.0.0.0:8000. No se iniciará una nueva instancia.")
    else:
        print("Iniciando Django...")
        django_process = start_django()

    time.sleep(1)

    # React
    if react_running:
        print("Vite/React YA está ejecutándose en el puerto 5173. No se iniciará otra instancia.")
    else:
        print("Iniciando Vite...")
        react_process = start_react()

    print("Servicios inicializados. Supervisando procesos lanzados por este script...")

    try:
        while True:
            time.sleep(5)

            # Reinicio automático SI y SOLO SI este script lo inició
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
