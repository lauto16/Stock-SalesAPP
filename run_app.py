from notifications import run_notifications, notification_scheduler
from services import start_react, start_django, port_in_use
from backups import create_db_backup, load_last_backup_time
from update import run_git_pull, run_migrations
from datetime import datetime, timedelta
import threading
import time


def main():
    """When called tries to initialize a django instance on 0.0.0.0:8000 and a react instance 0.0.0.0:5173, also does
    a git pull --force, creates a db.sqlite3 backup every three days and runs the creations of notifications every 1 hour"""
    
    print("Ejecutando git pull antes de iniciar servicios...")
    run_git_pull()
    run_migrations()

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
        target=notification_scheduler, args=(3600,), daemon=True
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


if __name__ == "__main__":
    main()
