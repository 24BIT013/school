$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"

Write-Host "Starting School System (Dev Mode)..."

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Installing frontend dependencies..."
  Push-Location $frontend
  try {
    npm.cmd install
  } finally {
    Pop-Location
  }
}

Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backend'; python manage.py runserver 127.0.0.1:8000"
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontend'; npm.cmd run dev -- --host 127.0.0.1 --port 5173"

Write-Host "Backend:  http://127.0.0.1:8000/api/"
Write-Host "Frontend: http://127.0.0.1:5173/"
