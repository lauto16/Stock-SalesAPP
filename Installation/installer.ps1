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
# === Crear tarea programada: ejecutar TiendaClick.vbs al inicio ===
# ======================================================
Log "Creando tarea programada TiendaClick..."

$VbsScript = Join-Path $BaseDir "iniciar_oculto.vbs"

if (!(Test-Path $VbsScript)) {
    Log "ERROR: No se encontró iniciar_oculto.vbs en $VbsScript"
    exit
}

# Definir la acción: ejecutar el .vbs con wscript
$Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$VbsScript`""

# Trigger: al iniciar sesión
$Trigger = New-ScheduledTaskTrigger -AtLogOn

# Usuario actual
$User = "$env:USERNAME"

# Principal: sin elevación, interactivo
$Principal = New-ScheduledTaskPrincipal `
    -UserId $User `
    -LogonType Interactive `
    -RunLevel Limited

# Configuración avanzada
$Settings = New-ScheduledTaskSettingsSet `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
    -DeleteExpiredTaskAfter (New-TimeSpan -Days 30) `
    -DontStopOnIdleEnd `
    -StartWhenAvailable

# Registrar la tarea
Register-ScheduledTask `
    -TaskName "TiendaClickOnLogin" `
    -Action $Action `
    -Trigger $Trigger `
    -Principal $Principal `
    -Settings $Settings `
    -Description "Ejecuta TiendaClick al iniciar sesión sin mostrar ventanas" `
    -Force

Log "Tarea programada 'TiendaClickOnLogin' creada con éxito."
Log "  - Se ejecutará al iniciar sesión"
Log "  - Sin límite de tiempo de ejecución"
Log "  - Tareas expiradas se eliminarán después de 30 días"
Log "  - Funcionará con batería o corriente alterna"

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
