Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$RepoURL = "https://github.com/lauto16/Stock-SalesAPP.git"
$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$TargetDir = Join-Path $BasePath "TiendaClick"

function Log($msg) {
    Write-Host "[+] $msg"
}

if (Test-Path $TargetDir) {
    Log "Eliminando carpeta existente TiendaClick..."
    Remove-Item -Recurse -Force $TargetDir
}

Log "Clonando repositorio..."
git clone $RepoURL $TargetDir
if ($LASTEXITCODE -ne 0) { Log "ERROR: git clone falló"; exit }

Log "Repositorio clonado correctamente."

Set-Location $TargetDir

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
$FrontendApp = Join-Path $TargetDir "Frontend\TiendaClick"

if (Test-Path $FrontendApp) {
    Log "Instalando dependencias del Frontend..."
    Set-Location $FrontendApp
    npm install
    Log "npm install completado."
} else {
    Log "ERROR: No se encontró la app frontend."
}

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

Set-Location "$TargetDir\Backend"

Log "Instalando virtualenv..."
& $PythonCmd -m pip install virtualenv

Log "Creando entorno virtual..."
& $PythonCmd -m virtualenv venv

Log "Activando entorno virtual..."
$Activate = ".\venv\Scripts\activate.ps1"
. $Activate

Log "Instalando requirements.txt..."
pip install -r requirements.txt

Log "Creando archivo db.sqlite3..."
New-Item -ItemType File -Path "db.sqlite3" -Force | Out-Null

Log "Ejecutando makemigrations..."
& $PythonCmd manage.py makemigrations

Log "Ejecutando migrate..."
& $PythonCmd manage.py migrate

Log "Ejecutando populate_role_permissions_manager.py..."
& $PythonCmd populate_role_permissions_manager.py

# --------------------------------------
# 10) CREAR SUPERUSER (manual)
# --------------------------------------
Log "Creación de superusuario:"
& $PythonCmd manage.py createsuperuser

do {
    $Pin = Read-Host "Ingrese un PIN de 4 dígitos para el usuario administrador"
} until ($Pin -match '^\d{4}$')

Log "PIN aceptado."

Log "Actualizando PIN del usuario administrador..."

& $PythonCmd update_pin.py $Pin

Log " INSTALACIÓN COMPLETADA "

Pause
