@echo off
cd /d "%~dp0"

echo Tworze swieza wersje offline...
call npm.cmd run build

if errorlevel 1 (
  echo.
  echo Build nie wyszedl. Zostaw to okno otwarte i sprawdz komunikat powyzej.
  pause
  exit /b 1
)

echo.
echo Pakuje ZIP do folderu paczki-offline...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'; $outDir = Join-Path (Get-Location) 'paczki-offline'; New-Item -ItemType Directory -Force -Path $outDir | Out-Null; $zip = Join-Path $outDir ('Kanban-offline-' + $stamp + '.zip'); Compress-Archive -Path (Join-Path (Get-Location) 'dist-local\*') -DestinationPath $zip -CompressionLevel Optimal; Write-Host ('Gotowa paczka: ' + $zip)"

if errorlevel 1 (
  echo.
  echo Nie udalo sie utworzyc ZIP-a.
  pause
  exit /b 1
)

echo.
echo Gotowe. Paczka jest w folderze paczki-offline.
pause
