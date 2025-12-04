Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# ============================
# Cargar configuración desde JSON
# ============================
$BasePath = Split-Path -Parent $MyInvocation.MyCommand.Definition
$configPath = Join-Path $BasePath "config.json"

if (!(Test-Path $configPath)) {
    Write-Host "[ERROR] No se encontró config.json en $BasePath"
    exit
}

$config = Get-Content $configPath | ConvertFrom-Json

# Variables desde JSON
$RepoURL        = $config.repoURL
$NodeURL        = $config.node.url
$NodeInstaller  = $config.node.installerName
$PythonURL      = $config.python.url
$PythonInstaller = $config.python.installerName
$FrontendPath   = $config.paths.frontend
$BackendPath    = $config.paths.backend
$ShortcutURL    = $config.shortcutURL
$ProjectFolder  = $config.projectFolder

$TargetDir = Join-Path $BasePath $ProjectFolder

function Log($msg) {
    Write-Host "[+] $msg"
}

# Eliminar carpeta si existe
if (Test-Path $TargetDir) {
    Log "Eliminando carpeta existente $ProjectFolder..."
    Remove-Item -Recurse -Force $TargetDir
}

# Clonar repo
Log "Clonando repositorio..."
git clone $RepoURL $TargetDir
if ($LASTEXITCODE -ne 0) { Log "ERROR: git clone falló"; exit }

Log "Repositorio clonado correctamente."

Set-Location $TargetDir

# ============================
# Instalar Node si es necesario
# ============================
Log "Verificando Node.js..."
if (!(Get-Command node.exe -ErrorAction SilentlyContinue)) {
    Log "Node no encontrado. Instalando Node.js..."

    $nodeInstallerPath = "$env:TEMP/$NodeInstaller"
    Invoke-WebRequest $NodeURL -OutFile $nodeInstallerPath
    Start-Process msiexec.exe -Wait -ArgumentList "/i `"$nodeInstallerPath`" /qn"

    Log "Node instalado."
} else {
    Log "Node.js ya está instalado."
}

# ============================
# Frontend
# ============================
$FrontendApp = Join-Path $TargetDir $FrontendPath

if (Test-Path $FrontendApp) {
    Log "Instalando dependencias del Frontend..."
    Set-Location $FrontendApp
    npm install
    Log "npm install completado."
} else {
    Log "ERROR: No se encontró la app frontend."
}

Set-Location $TargetDir

# ============================
# Detectar Python o instalarlo
# ============================
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

    $pythonInstallerPath = "$env:TEMP/$PythonInstaller"
    Invoke-WebRequest $PythonURL -OutFile $pythonInstallerPath
    Start-Process $pythonInstallerPath -Wait -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1 Include_pip=1"

    $PythonCmd = Detect-Python
    if (-not $PythonCmd) {
        Log "ERROR: Python no pudo instalarse."
        exit
    }
}

Log "Python detectado como comando: $PythonCmd"

# ============================
# Backend
# ============================
Set-Location (Join-Path $TargetDir $BackendPath)

Log "Instalando virtualenv..."
& $PythonCmd -m pip install virtualenv

Log "Creando entorno virtual..."
& $PythonCmd -m virtualenv venv

Log "Activando entorno virtual..."
. ".\venv\Scripts\activate.ps1"

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

# ============================
# Crear superusuario
# ============================
Log "Creación de superusuario:"
& $PythonCmd manage.py createsuperuser

do {
    $Pin = Read-Host "Ingrese un PIN de 4 dígitos para el usuario administrador"
} until ($Pin -match '^\d{4}$')

Log "PIN aceptado."

Log "Actualizando PIN..."
& $PythonCmd update_pin.py $Pin

# ============================
# Crear acceso directo URL
# ============================
$shortcutContent = "[InternetShortcut]`nURL=$ShortcutURL"
Set-Content -Path "$BasePath/$ProjectFolder.url" -Value $shortcutContent

Pause
