@echo off
title MongoDB Atlas Connection Test
color 0A

echo =================================================
echo            MongoDB Atlas Connection Test
echo =================================================
echo.

cd %~dp0
echo Compiling TypeScript files...
call npx tsc src/utils/db-test.ts --esModuleInterop --skipLibCheck --target es2020 --module CommonJS
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Compilation failed. Please check for TypeScript errors.
    pause
    exit /b 1
)

echo.
echo Running database test...
echo.
node src/utils/db-test.js
set TEST_RESULT=%ERRORLEVEL%

echo.
if %TEST_RESULT% NEQ 0 (
    color 0C
    echo *** Test failed with errors. Please check the output above. ***
) else (
    echo *** Test completed. Check the output above for results. ***
)

echo.
echo Press any key to exit...
pause > nul 