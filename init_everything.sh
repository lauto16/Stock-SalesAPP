#!/bin/bash

# Ruta base del proyecto
PROJECT_DIR="/home/lauty/Desktop/Proyectos/Stock-SalesAPP"

# 1. Actualizar el repo desde Git
cd "$PROJECT_DIR" || exit
git checkout main
git pull
git checkout lauty
git merge main

# Esperar unos segundos para que el pull y el merge terminen
sleep 5

# 2. Abrir VS Code en la raíz del proyecto
code "$PROJECT_DIR" &

# 3. Iniciar el FRONTEND (TiendaClick)
cd "$PROJECT_DIR/Frontend/TiendaClick" || exit
gnome-terminal -- bash -c "npm install && npm run dev; exec bash" &

# 4. Iniciar el BACKEND (Django)
cd "$PROJECT_DIR/Backend" || exit
gnome-terminal -- bash -c "source ./venv/bin/activate && python manage.py runserver 192.168.100.9:8000; exec bash" &
