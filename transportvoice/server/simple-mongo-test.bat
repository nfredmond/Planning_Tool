@echo off
title Simple MongoDB Connection Test
color 0A

echo =================================================
echo          Simple MongoDB Connection Test
echo =================================================
echo.
echo This test uses a minimal JavaScript approach
echo with no TypeScript compilation required.
echo.

cd %~dp0
echo Running simple connection test...
echo.
node src/utils/simple-mongo-test.js

echo.
echo Test completed. Check the output above for results.
echo.
echo Press any key to exit...
pause > nul 