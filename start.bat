@echo off
echo.
echo ════════════════════════════════════
echo   ^<NOVA^> Startup 💜  (Groq - Free!)
echo ════════════════════════════════════
echo.

if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    echo.
)

if "%GROQ_API_KEY%"=="" (
    echo Get your FREE Groq key at: https://console.groq.com
    echo (Sign up ^> API Keys ^> Create Key)
    echo.
    set /p GROQ_API_KEY="Paste your Groq API key here: "
    echo.
)

echo Starting Nova...
echo.
echo Open http://localhost:3000 in your browser!
echo Share this with the squad too ^(on your local network^)
echo.
node server.js
pause
