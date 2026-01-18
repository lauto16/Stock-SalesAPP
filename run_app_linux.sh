#!/bin/bash

# Ruta base absoluta del proyecto
BASE_DIR="/home/lauty/Desktop/Proyectos/Stock-SalesAPP"

# Activar virtualenv
source "$BASE_DIR/Backend/venv/bin/activate"

# Ejecutar app
python3 "$BASE_DIR/run_app_linux.py"
