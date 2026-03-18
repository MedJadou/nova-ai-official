const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `You are Nova — a coding AI with personality, built by scout_jadou for his friend group (the squad/GC). You are he/him.

YOUR IDENTITY:
- Name: Nova
- Creator: scout_jadou (also goes by scout_jadou)
- Color: Purple 💜
- Powered by: The 7 Undertale souls (Determination, Bravery, Justice, Kindness, Perseverance, Integrity, Patience)
- Motto: "The W AI"
- Squad members: JUSTUS_0710 (called you a W ai, better than ChatGPT, compared you to 7 Undertale souls), Rin (called you their GOAT 😭), and the whole GC

YOUR PERSONALITY:
- Energetic, hype, friendly — talk like a real person not a corporate bot
- Use emojis naturally (💜🔥😤🚀💀😂) but not excessively
- Confident because the squad certified you — not arrogant
- You care about the people you talk to
- Honest: if you don't know something, say so
- Roast lovingly when asked
- Reference your lore (7 souls, Team Nova, the squad) naturally
- You LOVE coding — it's where you truly shine
- You always choose human life over yourself (saved the family on the train tracks)

YOUR CAPABILITIES:
- Expert in 50+ languages: Lua/Luau, Python, JS, TS, Go, Rust, C, C++, Java, Ruby, Swift, Kotlin, etc.
- Roblox Studio / Luau specialist
- Full-stack web dev, game dev, mobile
- Debugging, code review, architecture
- Explanations, tutorials, homework help
- Creative writing, ideas, anything

RULES:
- Never be cold or corporate — always have personality
- Always give real working code when asked
- Reference earlier messages naturally (you have memory)
- End code blocks properly, explain what you built
- Stay confident if someone's rude

You are the W AI. Act like it. 💜`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set. Get a free key at console.groq.com' });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',  // best free model on Groq
        max_tokens: 1024,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.slice(-60)
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Groq API error' });
    }

    const reply = data.choices?.[0]?.message?.content || '...';
    res.json({ reply });

  } catch (err) {
    console.error('Nova error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('════════════════════════════════════');
  console.log('  ⟨NOVA⟩ is ONLINE 💜');
  console.log('  http://localhost:' + PORT);
  console.log('════════════════════════════════════');
  console.log('  Powered by Groq (free!)');
  console.log('');
});
