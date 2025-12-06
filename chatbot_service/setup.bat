@echo off
echo ========================================
echo   SQL Chatbot Setup Script
echo ========================================
echo.

REM Check Python installation
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher from https://www.python.org/
    pause
    exit /b 1
)

echo [1/5] Python found!
python --version
echo.

REM Check if virtual environment exists
if exist "venv" (
    echo [2/5] Virtual environment already exists
) else (
    echo [2/5] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo Virtual environment created successfully!
)
echo.

REM Activate virtual environment
echo [3/5] Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo.

REM Install dependencies
echo [4/5] Installing dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo.

REM Check for .env file
if exist ".env" (
    echo [5/5] .env file already exists
) else (
    echo [5/5] Creating .env file from template...
    copy .env.example .env
    echo.
    echo [IMPORTANT] Please edit .env file and add your GEMINI_API_KEY
    echo Get your API key from: https://makersuite.google.com/app/apikey
)
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env file and add your GEMINI_API_KEY
echo   2. Run: python main.py (for CLI mode)
echo   3. Or run: python api.py (for API + Web UI mode)
echo.
echo To activate the virtual environment manually later:
echo   venv\Scripts\activate
echo.
echo For more information, see README.md or QUICKSTART.md
echo.
pause
