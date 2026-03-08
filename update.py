from consts import BASE_PATH, BACKEND_LOG, VENV_PYTHON, MANAGE_PY, BACKEND_PATH, FRONTEND_PATH
import subprocess
import os


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


def run_migrations():
    open(BACKEND_LOG, "w", encoding="utf-8").close()
    print("Corriendo migraciones de base de datos...")
    with open(BACKEND_LOG, "a", encoding="utf-8") as log:
        log.write("\n\n--- Running Django migrations ---\n")
        log.flush()

        migrate = subprocess.Popen(
            [
                VENV_PYTHON,
                MANAGE_PY,
                "migrate",
                "--noinput",
            ],
            cwd=BACKEND_PATH,
            stdout=log,
            stderr=log,
            creationflags=subprocess.CREATE_NO_WINDOW,
        )

        migrate.wait()

def install_backend_requirements():
    """Installs backend dependencies"""
    print("Instalando dependencias del backend...")

    try:
        subprocess.Popen(
            [
                VENV_PYTHON,
                "-m",
                "pip",
                "install",
                "-r",
                "requirements.txt",
                "--upgrade"
            ],
            cwd=BACKEND_PATH,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW,
        ).wait()

    except Exception as e:
        print(e)


def install_frontend_dependencies():
    """Executes npm install"""
    print("Instalando dependencias del frontend...")

    try:
        subprocess.Popen(
            ["npm", "i"],
            cwd=FRONTEND_PATH,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            creationflags=subprocess.CREATE_NO_WINDOW,
        ).wait()

    except Exception as e:
        print(e)