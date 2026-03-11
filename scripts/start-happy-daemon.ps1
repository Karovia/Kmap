$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$happyBin = Join-Path $repoRoot '.npm-global'
$happyHome = Join-Path $repoRoot '.happy'
$happyCmd = Join-Path $happyBin 'happy.cmd'

if (-not (Test-Path $happyCmd)) {
  throw "Happy executable not found: $happyCmd"
}

$pathEntries = @($env:PATH -split ';' | Where-Object { $_ })
if ($pathEntries -notcontains $happyBin) {
  $env:PATH = "$happyBin;$env:PATH"
}

$env:HAPPY_HOME_DIR = $happyHome

Write-Host "Starting Happy daemon..."
& $happyCmd daemon start

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Current status:"
& $happyCmd daemon status

Write-Host ""
Write-Host "Note: if you run this inside Codex / a sandbox, the environment may clean up background child processes when the command ends."
Write-Host "To keep Happy running, execute this script from your own terminal window."
