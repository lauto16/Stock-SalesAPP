@echo off
cd /d %~dp0

echo Instalando dependencias...
call npm install

echo Iniciando servidor Vite...
call npm run dev

pause