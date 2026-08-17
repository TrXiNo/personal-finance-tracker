@echo off
title Personal Finance Tracker Launcher

REM Proje klasorune gec
cd /d "%~dp0"

echo ==========================================
echo   Personal Finance Tracker baslatiliyor...
echo ==========================================
echo.

REM Backend'i ayri CMD penceresinde baslat
start "Finance Backend" cmd /k "cd /d ""%~dp0"" && python -m uvicorn backend.main:app --reload"

REM Frontend'i ayri CMD penceresinde baslat
start "Finance Frontend" cmd /k "cd /d ""%~dp0"" && python -m http.server 5500 --directory frontend"

REM Sunucularin baslamasi icin kisa bekleme
timeout /t 2 /nobreak >nul

REM Uygulamayi varsayilan tarayicida ac
start "" "http://127.0.0.1:5500"

echo.
echo Backend : http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5500
echo API Docs: http://127.0.0.1:8000/docs
echo.
echo Sunucular ayri pencerelerde calisiyor.
echo Kapatmak icin ilgili CMD pencerelerinde CTRL+C kullanabilirsin.
echo.

pause
