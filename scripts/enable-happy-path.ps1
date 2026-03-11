param(
  [switch]$PersistUser
)

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

Write-Host "Happy is configured for the current shell."
Write-Host "PATH includes: $happyBin"
Write-Host "HAPPY_HOME_DIR: $happyHome"
Write-Host ""
Write-Host "Available in this shell:"
Write-Host "  happy --help"
Write-Host "  happy daemon status"

if ($PersistUser) {
  try {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $userEntries = @($userPath -split ';' | Where-Object { $_ })
    if ($userEntries -notcontains $happyBin) {
      $newUserPath = if ([string]::IsNullOrWhiteSpace($userPath)) {
        $happyBin
      } else {
        '{0};{1}' -f $happyBin, $userPath
      }
      [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')
      Write-Host ""
      Write-Host "User PATH updated. Reopen the terminal to use it."
    } else {
      Write-Host ""
      Write-Host "User PATH already contains the Happy directory."
    }
  } catch {
    Write-Warning "Failed to update user PATH: $($_.Exception.Message)"
    Write-Host "Run this in a normal PowerShell window:"
    Write-Host "  powershell -ExecutionPolicy Bypass -File .\\scripts\\enable-happy-path.ps1 -PersistUser"
  }
}
