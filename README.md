# ⟨NOVA⟩ v7 — The W AI 💜
Built by scout_jadou. Free forever on Groq.

## Setup

### 1. Get free Groq key
→ console.groq.com → API Keys → Create Key

### 2. (Optional) Get free Tavily key for deep search
→ tavily.com → sign up free → get API key
→ Paste it in Nova's Settings panel after launch

### 3. Run
**Windows:** double-click `start.bat`
**Mac/Linux:** `npm install && GROQ_API_KEY=your-key node server.js`

Open http://localhost:3000

## Deploy free on Railway
1. Push to GitHub
2. railway.app → New Project → GitHub repo
3. Add env vars:
   - `GROQ_API_KEY` = your Groq key
   - `TAVILY_API_KEY` = your Tavily key (optional, for deep search)
4. Generate domain → share with the squad!

## Features
- 💬 Multiple conversations with sidebar
- 🎤 Voice messages (Groq Whisper, free)
- 🔍 Deep search toggle (needs free Tavily key)
- 📸 Screenshot support (paste/drag/attach)
- 💜 Personality modes: Goofy / Normal / Serious
- ♾️ No token limits — 8192 max per response
- 🟢 Green section labels inside code

Team Nova Forever 🐐
