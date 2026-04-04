@echo off
echo.
echo ════════════════════════════════════
echo   ^<NOVA^> v7 Startup 💜
echo   Groq + Voice + Search + Multi-chat
echo ════════════════════════════════════
echo.

if not exist "node_modules\" (
    echo Installing dependencies...
    npm install
    echo.
)

if "%GROQ_API_KEY%"=="" (
    echo Get your FREE Groq key at: https://console.groq.com
    echo.
    set /p GROQ_API_KEY="Paste your Groq API key: "
    echo.
)

if "%TAVILY_API_KEY%"=="" (
    echo Optional: Get free Tavily key at https://tavily.com for deep search
    echo Press Enter to skip.
    set /p TAVILY_API_KEY="Tavily key (optional): "
    echo.
)

echo Starting Nova...
echo Open http://localhost:3000
echo.
node server.js
pause
