@echo off
title MongoDB Atlas Database Setup
color 0A

echo =================================================
echo            MongoDB Atlas Database Setup
echo =================================================
echo.

cd %~dp0
echo Compiling TypeScript files...
call npx tsc src/utils/db-setup.ts --esModuleInterop --skipLibCheck --target es2020 --module CommonJS
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Compilation failed. Please check for TypeScript errors.
    pause
    exit /b 1
)

echo.
echo Running database setup...
echo.
node src/utils/db-setup.js
set SETUP_RESULT=%ERRORLEVEL%

echo.
if %SETUP_RESULT% NEQ 0 (
    color 0C
    echo *** Setup failed with errors. Please check the output above. ***
) else (
    echo *** Setup completed. Check the output above for results. ***
)

echo.
echo Press any key to exit...
pause > nul 