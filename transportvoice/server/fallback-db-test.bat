@echo off
title MongoDB Atlas Fallback Connection Test
color 0A

echo =================================================
echo      MongoDB Atlas Fallback Connection Test
echo =================================================
echo.
echo This test uses an alternative connection method
echo that may resolve SSL/TLS issues.
echo.

cd %~dp0
echo Compiling TypeScript files...
call npx tsc src/utils/fallback-mongo-client.ts src/utils/fallback-db-test.ts --esModuleInterop --skipLibCheck --target es2020 --module CommonJS
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo Compilation failed. Please check for TypeScript errors.
    pause
    exit /b 1
)

echo.
echo Running fallback connection test...
echo.
node src/utils/fallback-db-test.js
set TEST_RESULT=%ERRORLEVEL%

echo.
if %TEST_RESULT% NEQ 0 (
    color 0C
    echo *** Fallback test failed with errors. Please check the output above. ***
    echo.
    echo If both regular and fallback tests are failing, try temporarily adding to .env:
    echo NODE_TLS_REJECT_UNAUTHORIZED=0
) else (
    echo *** Fallback test completed. Check the output above for results. ***
)

echo.
 