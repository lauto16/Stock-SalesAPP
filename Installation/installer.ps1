Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

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
$FrontendPath   = $config.paths.frontend
$BackendPath    = $config.paths.backend
$ShortcutURL    = $config.shortcutURL
$ProjectFolder  = $config.projectFolder
$PythonCmd      = $config.python_command_name

$TargetDir = Join-Path $BasePath $ProjectFolder

function Log($msg) {
    Write-Host "[+] $msg"
}

# Clonar repo
Log "Clonando repositorio..."
git clone $RepoURL $TargetDir
if ($LASTEXITCODE -ne 0) { Log "ERROR: git clone falló"; exit }

Log "Repositorio clonado correctamente."

Set-Location $TargetDir

# ============================
# Frontend
# ============================
$FrontendApp = Join-Path $TargetDir $FrontendPath

if (Test-Path $FrontendApp) {
    Log "Instalando dependencias del Frontend..."
    Set-Location $FrontendApp
    npm install
    Log "npm install completado."
    Log "Ejecutando build del Frontend..."
    npm run build
    Log "Build del Frontend completado."
} else {
    Log "ERROR: No se encontró la app frontend."
}

Set-Location $TargetDir

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

Log "Ejecutando installer_db_population_manager.py..."
& $PythonCmd installer_db_population_manager.py

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

$PythonW  = Join-Path $TargetDir "Backend/venv/Scripts/pythonw.exe"
$RunAppPy = Join-Path $TargetDir "run_app.py"

if (!(Test-Path $PythonW)) {
    Log "ERROR: No se encontró pythonw.exe en $PythonW"
    exit
}

if (!(Test-Path $RunAppPy)) {
    Log "ERROR: No se encontró run_app.py en $RunAppPy"
    exit
}

$WorkDir = $TargetDir

$Action = New-ScheduledTaskAction `
    -Execute $PythonW `
    -Argument "`"$RunAppPy`"" `
    -WorkingDirectory $WorkDir

$Trigger = New-ScheduledTaskTrigger -AtLogOn

$User = "$env:USERNAME"
$Principal = New-ScheduledTaskPrincipal `
    -UserId $User `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName "RunAppOnLogin" `
    -Action $Action `
    -Trigger $Trigger `
    -Principal $Principal `
    -Description "Ejecuta run_app.py al iniciar sesión sin consola" `
    -Force

Log "Tarea programada creada con éxito."

Log "Ejecutando set_local_ip.py para obtener IP local..."

$SetIPScript = Join-Path $BasePath "set_local_ip.py"

if (!(Test-Path $SetIPScript)) {
    Log "ERROR: No se encontró set_local_ip.py en el repositorio."
    Log $SetIPScript
    exit
}

# Ejecutar Python para generar config.json
& $PythonCmd $SetIPScript -d $BasePath

Log "Python generó/actualizó config.json con la IP local."

# ======================================================
# === Leer nuevamente config.json con la IP actual =====
# ======================================================

$ConfigFile = Join-Path $BasePath "config.json"

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
    $newUrl = $urlContent.Replace("__ip__", $LocalIP)
    Set-Content -Path $URLFile -Value $newUrl -Encoding UTF8
    Copy-Item $URLFile $DesktopShortcut -Force

    Log "TiendaClick.url actualizado con IP $LocalIP y copiado al escritorio."
}

Log "Proceso de configuración de accesos finalizado correctamente."
