from consts import BASE_PATH
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
