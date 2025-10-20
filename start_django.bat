@echo off
setlocal enabledelayedexpansion
echo ========================================
echo Starting Django Development Server
echo ========================================
echo.

REM Change to the server directory
cd /d "%~dp0server"

REM Check if virtual environment exists and activate it
if exist "venv\Scripts\activate.bat" (
    echo Activating virtual environment venv
    call venv\Scripts\activate.bat
) else if exist ".venv\Scripts\activate.bat" (
    echo Activating virtual environment .venv
    call .venv\Scripts\activate.bat
) else if exist "env\Scripts\activate.bat" (
    echo Activating virtual environment env
    call env\Scripts\activate.bat
) else if exist "..\venv\Scripts\activate.bat" (
    echo Activating virtual environment from parent directory
    call ..\venv\Scripts\activate.bat
) else if exist "..\.venv\Scripts\activate.bat" (
    echo Activating virtual environment from parent directory
    call ..\.venv\Scripts\activate.bat
) else (
    echo WARNING: No virtual environment found!
    echo Using global Python installation.
    echo.
)

REM Check if critical dependencies are installed
echo Checking dependencies...
python -c "import django; import pymysql; import corsheaders; import rest_framework" 2>nul
if errorlevel 1 (
    echo.
    echo ERROR: Required dependencies are not installed!
    echo.
    echo Installing dependencies from requirements.txt...
    python -m pip install -r requirements.txt
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
    echo.
    echo Dependencies installed successfully!
    echo.
) else (
    echo Dependencies are installed.
)
echo.

REM Check for unapplied migrations
echo Checking for database migrations...
python manage.py migrate --check >nul 2>&1
if errorlevel 1 (
    echo.
    echo WARNING: You have unapplied migrations!
    echo.
    echo Would you like to apply migrations now? (Y/N^)
    set /p RUN_MIGRATE=
    if /i "!RUN_MIGRATE!"=="Y" (
        echo.
        echo Running migrations...
        python manage.py migrate
        echo.
        echo Migrations applied successfully!
    ) else (
        echo.
        echo Skipping migrations. Server may not work properly.
    )
    echo.
) else (
    echo Database is up to date.
    echo.
)

echo Running Django development server
echo Press Ctrl+C to stop the server
echo.

REM Start Django development server
python manage.py runserver

pause

