$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $root "scripts\start-system-dev-keepalive.ps1"
$taskName = "SchoolSystemDevAutoStart"

if (-not (Test-Path $scriptPath)) {
  throw "Missing script: $scriptPath"
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn
$principal = New-ScheduledTaskPrincipal -UserId $env:UserName -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null

Write-Host "Scheduled task created: $taskName"
Write-Host "It will start the backend and frontend each time you log in."
