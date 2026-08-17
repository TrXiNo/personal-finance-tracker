@echo off
cd /d "%~dp0"
start "Uvicorn Backend" cmd /k python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:8000
