@echo off
title Direct MongoDB Connection Test
color 0A

echo =================================================
echo          Direct MongoDB Connection Test
echo =================================================
echo.
echo This test uses a minimal connection approach
echo with disabled certificate verification.
echo.

cd %~dp0
echo Compiling TypeScript files...
call npx tsc src/utils/direct-mongo-connect.ts --esModuleInterop --skipLibCheck --target es2020 --module CommonJS
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Compilation failed. Please check for TypeScript errors.
    pause
    exit /b 1
)

echo.
echo Running direct connection test...
echo.
node src/utils/direct-mongo-connect.js
set TEST_RESULT=%ERRORLEVEL%

echo.
if %TEST_RESULT% NEQ 0 (
    color 0C
    echo *** Direct test failed with errors. Please check the output above. ***
) else (
    echo *** Direct test completed. Check the output above for results. ***
)

echo.
echo Press any key to exit...
pause > nul 