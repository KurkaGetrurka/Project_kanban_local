@echo off
cd /d "%~dp0"

echo Tworze wersje offline...
call npm.cmd run build

if errorlevel 1 (
  echo.
  echo Build nie wyszedl. Zostaw to okno otwarte i sprawdz komunikat powyzej.
  pause
  exit /b 1
)

echo.
echo Gotowe. Otwieram aplikacje z folderu dist-local.
start "" "%~dp0dist-local\index.html"
pause
