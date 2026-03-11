$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$buildTools = Join-Path $root 'android-sdk\build-tools\36.1.0'
$aapt = Join-Path $buildTools 'aapt.exe'
$zipalign = Join-Path $buildTools 'zipalign.exe'
$apksigner = Join-Path $buildTools 'apksigner.bat'

$baseApk = Join-Path $root 'android\app\build\outputs\apk\release\app-release.apk'
$workDir = Join-Path $root '.codex-temp\apk-patch'
$patchedApk = Join-Path $workDir 'kmap-release-patched.apk'
$alignedApk = Join-Path $workDir 'kmap-release-aligned.apk'
$finalApk = Join-Path $root 'android\app\build\outputs\apk\release\kmap-release-signed-20260311.apk'
$sourceRoot = Join-Path $root 'android\app\src\main'
$keystorePropertiesPath = Join-Path $root 'android\keystore.properties'

if (-not (Test-Path $baseApk)) {
  throw "未找到基础 APK：$baseApk"
}

if (-not (Test-Path $keystorePropertiesPath)) {
  throw "未找到签名配置：$keystorePropertiesPath"
}

$keystoreProperties = @{}
Get-Content $keystorePropertiesPath | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') {
    return
  }

  $name, $value = $_ -split '=', 2
  $keystoreProperties[$name.Trim()] = $value.Trim()
}

$storeFile = Join-Path (Join-Path $root 'android') $keystoreProperties.storeFile
$storePassword = $keystoreProperties.storePassword
$keyAlias = $keystoreProperties.keyAlias
$keyPassword = $keystoreProperties.keyPassword

New-Item -ItemType Directory -Force -Path $workDir | Out-Null
Copy-Item -Force $baseApk $patchedApk

$removeList = (jar tf $patchedApk) | Where-Object {
  $_ -like 'assets/public/*' -or $_ -eq 'assets/capacitor.config.json'
}

if ($removeList.Count -gt 0) {
  & $aapt remove $patchedApk $removeList | Out-Host
}

Push-Location $sourceRoot
try {
  $addList = Get-ChildItem 'assets\public' -Recurse -File | ForEach-Object {
    $_.FullName.Substring($PWD.Path.Length + 1).Replace('\', '/')
  }
  $addList += 'assets/capacitor.config.json'

  & $aapt add $patchedApk $addList | Out-Host
} finally {
  Pop-Location
}

if (Test-Path $alignedApk) {
  Remove-Item -Force $alignedApk
}

if (Test-Path $finalApk) {
  Remove-Item -Force $finalApk
}

& $zipalign -f -p 4 $patchedApk $alignedApk | Out-Host
& $apksigner sign --ks $storeFile --ks-pass "pass:$storePassword" --key-pass "pass:$keyPassword" --ks-key-alias $keyAlias --out $finalApk $alignedApk | Out-Host
& $apksigner verify --print-certs $finalApk | Out-Host

Get-Item $finalApk | Select-Object FullName, Length, LastWriteTime
