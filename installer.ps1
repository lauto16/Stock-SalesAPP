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

# ============================
# Instalar Git si no existe
# ============================
Log "Verificando instalación de Git..."

if (!(Get-Command git.exe -ErrorAction SilentlyContinue)) {
    Log "Git no encontrado. Instalando Git..."

    $GitURL = "https://github.com/git-for-windows/git/releases/latest/download/Git-2.45.1-64-bit.exe"
    $GitInstaller = "$env:TEMP\git_installer.exe"

    Invoke-WebRequest $GitURL -OutFile $GitInstaller

    Start-Process $GitInstaller -Wait -ArgumentList "/VERYSILENT", "/NORESTART"

    if (!(Get-Command git.exe -ErrorAction SilentlyContinue)) {
        Log "ERROR: Git no pudo instalarse."
        exit
    }

    Log "Git instalado correctamente."
} else {
    Log "Git ya está instalado."
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
            Log $cmd
            return $cmd
        }
    }
    return $null
}

$PythonCmd = "py"

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


# ======================================================
# === Crear tarea programada: ejecutar run_app.py al inicio ===
# ======================================================

Log "Creando tarea programada RunApp..."

$PythonVenv = Join-Path $TargetDir "Backend/venv/Scripts/python.exe"
$RunAppPy  = Join-Path $TargetDir "run_app.py"

if (!(Test-Path $PythonVenv)) {
    Log "ERROR: No se encontró el Python del venv en $PythonVenv"
    exit
}

if (!(Test-Path $RunAppPy)) {
    Log "ERROR: No se encontró run_app.py en $RunAppPy"
    exit
}

# Acción: ejecutar python.exe run_app.py
$Action = New-ScheduledTaskAction -Execute $PythonVenv -Argument $RunAppPy
$Trigger = New-ScheduledTaskTrigger -AtLogOn

Register-ScheduledTask `
    -TaskName "RunAppOnLogin" `
    -Action $Action `
    -Trigger $Trigger `
    -Description "Ejecuta run_app.py al iniciar sesión" `
    -Force

Log "Tarea programada creada: RunAppOnLogin para run_app.py"


Log "Ejecutando set_local_ip.py para obtener IP local..."

$SetIPScript = Join-Path $TargetDir "set_local_ip.py"

if (!(Test-Path $SetIPScript)) {
    Log "ERROR: No se encontró set_local_ip.py en el repositorio."
    exit
}

# Ejecutar Python para generar config.json
& $PythonCmd $SetIPScript -d $TargetDir

Log "Python generó/actualizó config.json con la IP local."

# ======================================================
# === Leer nuevamente config.json con la IP actual =====
# ======================================================

$ConfigFile = Join-Path $TargetDir "config.json"

if (!(Test-Path $ConfigFile)) {
    Log "ERROR: config.json no existe después de ejecutar set_local_ip.py"
    exit
}

try {
    $configUpdated = Get-Content $ConfigFile -Raw | ConvertFrom-Json
    $LocalIP = $configUpdated.local_ip
    Log "IP detectada: $LocalIP"
}
catch {
    Log "ERROR leyendo config.json actualizado: $_"
    $LocalIP = "localhost"
}

# ======================================================
# === Actualizar TiendaClick.url con la IP real =========
# ======================================================

$URLFile = Join-Path $TargetDir "TiendaClick.url"
$DesktopShortcut = Join-Path $BasePath "TiendaClick.url"

if (!(Test-Path $URLFile)) {
    Log "ERROR: No se encontró TiendaClick.url dentro del repo clonado."
} else {

    $urlContent = Get-Content $URLFile -Raw
    $newUrl = $urlContent.Replace("__IP__", $LocalIP)
    Set-Content -Path $URLFile -Value $newUrl -Encoding UTF8
    Copy-Item $URLFile $DesktopShortcut -Force

    Log "TiendaClick.url actualizado con IP $LocalIP y copiado al escritorio."
}

Log "Proceso de configuración de accesos finalizado correctamente."