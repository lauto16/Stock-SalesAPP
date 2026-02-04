from consts import (
    BACKEND_LOG,
    FRONTEND_LOG,
    BACKEND_PATH,
    FRONTEND_PATH,
    MANAGE_PY,
    VENV_PYTHON,
)
import subprocess
import socket


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
