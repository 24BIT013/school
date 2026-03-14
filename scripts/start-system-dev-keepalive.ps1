$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"

Write-Host "Starting School System (Keepalive Dev Mode)..."
Write-Host "Press Ctrl+C to stop this supervisor."

function Start-BackendJob {
  Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    while ($true) {
      python manage.py runserver 127.0.0.1:8000
      Start-Sleep -Seconds 2
    }
  } -ArgumentList $backend
}

function Start-FrontendJob {
  Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    if (-not (Test-Path (Join-Path $path "node_modules"))) {
      npm.cmd install
    }
    while ($true) {
      npm.cmd run dev -- --host 127.0.0.1 --port 5173
      Start-Sleep -Seconds 2
    }
  } -ArgumentList $frontend
}

$backendJob = Start-BackendJob
$frontendJob = Start-FrontendJob

Write-Host "Backend:  http://127.0.0.1:8000/api/"
Write-Host "Frontend: http://127.0.0.1:5173/"

try {
  while ($true) {
    Start-Sleep -Seconds 5

    if ($backendJob.State -ne "Running") {
      Receive-Job -Job $backendJob -Keep | Out-Host
      Remove-Job -Job $backendJob -Force
      $backendJob = Start-BackendJob
      Write-Host "Backend restarted."
    }

    if ($frontendJob.State -ne "Running") {
      Receive-Job -Job $frontendJob -Keep | Out-Host
      Remove-Job -Job $frontendJob -Force
      $frontendJob = Start-FrontendJob
      Write-Host "Frontend restarted."
    }
  }
} finally {
  Get-Job | Remove-Job -Force -ErrorAction SilentlyContinue
}
