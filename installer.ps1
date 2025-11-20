Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
# ===============================
# INSTALLER SIN GUI
# ===============================

$RepoURL = "https://github.com/lauto16/Stock-SalesAPP.git"

# Ruta donde está el script
$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TargetDir = Join-Path $BasePath "TiendaClick"

function Log($msg) {
    Write-Host "[+] $msg"
}

# --------------------------------------
# 1) BORRAR CARPETA SI EXISTE
# --------------------------------------
if (Test-Path $TargetDir) {
    Log "Eliminando carpeta existente TiendaClick..."
    Remove-Item -Recurse -Force $TargetDir
}

# --------------------------------------
# 2) CLONAR REPO
# --------------------------------------
Log "Clonando repositorio..."
git clone $RepoURL $TargetDir
if ($LASTEXITCODE -ne 0) { Log "ERROR: git clone falló"; exit }

Log "Repositorio clonado correctamente."

Set-Location $TargetDir


# --------------------------------------
# 3) VERIFICAR NODE.JS
# --------------------------------------
Log "Verificando Node.js..."
if (!(Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Log "Node no encontrado. Instalando Node.js..."

    $nodeInstaller = "$env:TEMP/node-installer.msi"
    Invoke-WebRequest "https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi" -OutFile $nodeInstaller
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstaller`" /qn"

    Log "Node instalado."
} else {
    Log "Node.js ya está instalado."
}

# --------------------------------------
# 4) NPM INSTALL EN Frontend/TiendaClick
# --------------------------------------
$FrontendApp = Join-Path $TargetDir "Frontend\TiendaClick"

if (Test-Path $FrontendApp) {
    Log "Instalando dependencias del Frontend..."
    Set-Location $FrontendApp
    npm install
    Log "npm install completado."
} else {
    Log "ERROR: No se encontró la app frontend."
}


# --------------------------------------
# 5) VERIFICAR PYTHON
# --------------------------------------
Set-Location $TargetDir

function Detect-Python {
    foreach ($cmd in @("python", "python3", "py")) {
        if (Get-Command $cmd -ErrorAction SilentlyContinue) {
            return $cmd
        }
    }
    return $null
}

$PythonCmd = Detect-Python

if (-not $PythonCmd) {
    Log "Python no encontrado. Instalando Python..."

    $pyInstaller = "$env:TEMP/python-installer.exe"
    Invoke-WebRequest "https://www.python.org/ftp/python/3.12.1/python-3.12.1-amd64.exe" -OutFile $pyInstaller
    Start-Process $pyInstaller -Wait -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1"

    $PythonCmd = Detect-Python
    if (-not $PythonCmd) {
        Log "ERROR: Python no pudo instalarse."
        exit
    }
}

Log "Python detectado como comando: $PythonCmd"


# --------------------------------------
# 6) CREAR VENV
# --------------------------------------
Set-Location "$TargetDir\Backend"

Log "Instalando virtualenv..."
& $PythonCmd -m pip install virtualenv

Log "Creando entorno virtual..."
& $PythonCmd -m virtualenv venv

Log "Activando entorno virtual..."
$Activate = ".\venv\Scripts\activate.ps1"
. $Activate


# --------------------------------------
# 7) INSTALAR REQUIREMENTS
# --------------------------------------
Log "Instalando requirements.txt..."
pip install -r requirements.txt


# --------------------------------------
# 8) CREAR DB SQLITE
# --------------------------------------
Log "Creando archivo db.sqlite3..."
New-Item -ItemType File -Path "db.sqlite3" -Force | Out-Null


# --------------------------------------
# 9) MIGRACIONES
# --------------------------------------
Log "Ejecutando makemigrations..."
& $PythonCmd manage.py makemigrations

Log "Ejecutando migrate..."
& $PythonCmd manage.py migrate

# --------------------------------------
# 9.5) EJECUTAR populate_role_permissions_manager.py
# --------------------------------------
Log "Ejecutando populate_role_permissions_manager.py..."
& $PythonCmd populate_role_permissions_manager.py

# --------------------------------------
# 10) CREAR SUPERUSER (manual)
# --------------------------------------
Log "Creación de superusuario:"
& $PythonCmd manage.py createsuperuser

# --------------------------------------
# 9.6) PEDIR PIN
# --------------------------------------
do {
    $Pin = Read-Host "Ingrese un PIN de 4 dígitos para el usuario administrador"
} until ($Pin -match '^\d{4}$')

Log "PIN aceptado."

# --------------------------------------
# 9.7) ACTUALIZAR PIN DEL USUARIO
# --------------------------------------
Log "Actualizando PIN del usuario administrador..."

& $PythonCmd update_pin.py $Pin

# --------------------------------------
# FIN
# --------------------------------------
Log "===================================="
Log " INSTALACIÓN COMPLETADA "
Log "===================================="

Pause