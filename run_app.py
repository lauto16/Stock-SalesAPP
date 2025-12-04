import subprocess
import os
import time

BASE_PATH = os.getcwd()
BACKEND_PATH = os.path.join(BASE_PATH, "Backend")
VENV_PYTHON = os.path.join(BACKEND_PATH, "venv", "Scripts", "python.exe")
MANAGE_PY = os.path.join(BACKEND_PATH, "manage.py")
BACKEND_LOG = os.path.join(BACKEND_PATH, "backend.log")
FRONTEND_PATH = os.path.join(BASE_PATH, "Frontend", "TiendaClick")
FRONTEND_LOG = os.path.join(FRONTEND_PATH, "frontend.log")

print(f'BASE_PATH:  {BASE_PATH}')
print(f'BACKEND_PATH:  {BACKEND_PATH}')
print(f'VENV_PYTHON:  {VENV_PYTHON}')
print(f'MANAGE_PY:  {MANAGE_PY}')
print(f'BACKEND_LOG:  {BACKEND_LOG}')
print(f'FRONTEND_PATH:  {FRONTEND_PATH}')
print(f'FRONTEND_LOG:  {FRONTEND_LOG}')

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
    print("Iniciando Django y Vite en modo oculto...")
    print(f"Logs: {BACKEND_LOG} / {FRONTEND_LOG}")
    django_process = start_django()
    time.sleep(1)
    react_process = start_react()

    print("Procesos iniciados. El script queda escuchando...")

    try:
        while True:
            time.sleep(5)
            if django_process.poll() is not None:
                print("Django murió, reiniciando...")
                django_process = start_django()

            if react_process.poll() is not None:
                print("React murió, reiniciando...")
                react_process = start_react()

    except KeyboardInterrupt:
        print("Cerrando procesos...")
        django_process.terminate()
        react_process.terminate()
        print("Listo.")