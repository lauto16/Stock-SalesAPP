@echo off
setlocal

REM Ruta base del proyecto
set PROJECT_DIR=C:\Users\lauty\Desktop\Proyectos\Stock-SalesAPP\StockSalesApp

REM 1. Abrir Git Bash para actualizar el repo
start "" "C:\Program Files\Git\bin\bash.exe" -c "cd '/c/Users/lauty/Desktop/Proyectos/Stock-SalesAPP/StockSalesApp/' && git checkout main && git pull && git checkout lauty && git merge main && exec bash"

REM Esperar unos segundos para que el pull y el merge terminen
timeout /t 5 /nobreak >nul

REM 2. Abrir VS Code en la raíz del proyecto
start "" code "%PROJECT_DIR%"

REM 3. Abrir cmd para el FRONTEND
start "" cmd /k "cd /d %PROJECT_DIR%\Frontend\TiendaClick && npm install && npm run dev"

REM 4. Abrir cmd para el BACKEND
start "" cmd /k "cd /d %PROJECT_DIR%\Backend\venv\Scripts && call activate && cd /d %PROJECT_DIR%\Backend && python manage.py runserver 0.0.0.0:8000"

endlocal