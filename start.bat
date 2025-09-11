@echo off
echo Starting NIGGA SCIENCE Imageboard...
echo.

echo Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Failed to install server dependencies
    pause
    exit /b 1
)

echo Installing client dependencies...
cd ..\client
call npm install
if errorlevel 1 (
    echo Failed to install client dependencies
    pause
    exit /b 1
)

echo.
echo Starting server...
start "NIGGA SCIENCE Server" cmd /k "cd /d %~dp0server && npm run dev"

echo Waiting for server to start...
timeout /t 3 /nobreak > nul

echo Starting client...
start "NIGGA SCIENCE Client" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo NIGGA SCIENCE is starting up!
echo Server: http://localhost:5000
echo Client: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul
