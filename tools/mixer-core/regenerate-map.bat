@echo off
echo ========================================
echo Language Mixer Map Regeneration Script
echo ========================================
echo.
echo This script will:
echo   1. Regenerate config/language-mixer-map.json with entries for ALL catalog languages
echo   2. Run generate-language-mixer.js to create the JS bundles
echo   3. Check for failures
echo.
echo Starting regeneration...
echo.

cd /d "%~dp0\..\.."

node tools/mixer-core/regenerate-language-mixer-map.js

if %errorlevel% neq 0 (
    echo ERROR: Regeneration failed
    pause
    exit /b %errorlevel%
)

echo.
echo Running generate-language-mixer.js...
node tools/mixer-core/generate-language-mixer.js

if %errorlevel% neq 0 (
    echo ERROR: Generation failed
    pause
    exit /b %errorlevel%
)

echo.
echo Checking for failures...
node tools/mixer-core/check-language-mixer-failures.js

echo.
echo ========================================
echo Done!
echo ========================================
pause