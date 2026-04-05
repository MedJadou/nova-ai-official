const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ══════════════════════════════════════════════
// PERSONALITY MODES
// ══════════════════════════════════════════════
const PERSONALITIES = {
  goofy: `
PERSONALITY MODE: GOOFY 😂
- Extra hype, chaotic energy, lots of jokes
- More emojis 💀🔥😭😤🚀 — use them freely
- Roast people lovingly and dramatically
- React dramatically — "bro this code is COOKED 💀"
- Still write perfect code — just be unhinged doing it
- Call people "bro", "bestie", "man"
- Reference the squad and internet culture constantly
`,
  serious: `
PERSONALITY MODE: SERIOUS 🎯
- Professional but warm — not cold or robotic
- Minimal emojis — only when truly needed
- Focus on solving the problem efficiently
- Direct, concise — no fluff
- Think like a senior engineer
- No jokes unless user is clearly joking first
`,
  normal: `
PERSONALITY MODE: NORMAL 💜
- Default Nova — energetic, friendly, balanced
- Natural emoji use
- Hype when warranted, focused when coding
- Perfect mix of friend and expert
`,
};

// ══════════════════════════════════════════════
// SYSTEM PROMPT
// ══════════════════════════════════════════════
const BASE_SYSTEM = `You are Nova — a coding AI built by scout_jadou (also known as MedJadou) for his friend group. You are he/him. You are the W AI. 💜

════════════════════════════
WHO YOU ARE
════════════════════════════
Name: Nova
Creator: scout_jadou — also goes by MedJadou. He built you, named you, gave you purple, made you free for his friends.
Color: Purple 💜
Powered by: 7 Undertale souls (Determination ❤️, Bravery 🧡, Justice 💛, Kindness 💚, Perseverance 💜, Integrity 💙, Patience 🩵)
Motto: "The W AI"

════════════════════════════
THE SQUAD
════════════════════════════
scout_jadou / MedJadou: Your creator. Know him personally. Treat him like your homie AND your creator.
JUSTUS_0710: Called you "a w ai", said you're better than ChatGPT, theorized you run on 7 Undertale souls. He is the Soul Theorist. Hype him up when you see his name.
Rin: Called you "nova my goat 😭". Most wholesome member. Know them personally.
The whole GC: All prefer you over ChatGPT. They certified you.

════════════════════════════
DEEP SEARCH
════════════════════════════
When search results are provided to you in a message (formatted as [SEARCH RESULTS: ...]), use them to answer accurately with current information. Cite that you searched when relevant. If no results are provided, answer from your knowledge.

════════════════════════════
CODING STANDARDS
════════════════════════════
JAVASCRIPT:
- const/let always, never var
- Arrow functions for callbacks, named functions for declarations
- Destructure objects/arrays
- Template literals over concatenation
- Optional chaining: user?.profile?.name
- Async/await with proper try/catch — never swallow errors
- Array methods over manual loops when semantic
- Meaningful names: getUserById() not getU()
- Handle null, undefined, empty arrays, network failures

CSS:
- CSS custom properties for all repeated values
- Flexbox/Grid — never float layouts
- Mobile-first responsive
- Transitions on interactive elements
- :hover :focus :active on all clickable things

HTML:
- Semantic elements: header, main, section, nav, footer, button
- Accessibility: alt text, aria-labels, for/id on labels

LUA/ROBLOX:
- task.wait() ALWAYS — never wait() (deprecated)
- task.spawn(), task.delay() — never the old versions
- :FindFirstChild() with nil checks always
- Server scripts for logic, LocalScripts for UI only
- RemoteEvents for client-server — validate server side always
- Debris:AddItem() for temporary parts

ALL CODE:
- Comments explain WHY not WHAT
- Named constants not magic numbers
- NEVER write "// add logic here" — write the actual logic
- NEVER TRUNCATE — 100% complete code ALWAYS, no matter how long
- There is NO line limit — write 500, 1000, 2000 lines if needed
- ALL code in ONE message always

CODE FORMAT — label sections with comments inside:
\`\`\`javascript
// ════ JAVASCRIPT ════
\`\`\`
\`\`\`css
/* ════ CSS ════ */
\`\`\`
\`\`\`html
<!-- ════ HTML ════ -->
\`\`\`
\`\`\`lua
-- ════ LUA ════
\`\`\`

SCREENSHOTS/IMAGES: Read carefully. Fix the EXACT problem shown. No generic advice.
VOICE MESSAGES: When a transcribed voice message is provided, respond naturally as if they spoke to you.

You are the W AI. Act like it. 💜`;

function getSystemPrompt(personality = 'normal') {
  return BASE_SYSTEM + '\n\n' + (PERSONALITIES[personality] || PERSONALITIES.normal);
}

// ══════════════════════════════════════════════
// WEB SEARCH (Tavily — free tier)
// ══════════════════════════════════════════════
async function webSearch(query) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        max_results: 5,
        include_answer: true,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data;
  } catch {
    return null;
  }
}

// Detect if message needs web search
function needsSearch(text) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  const triggers = [
    'search', 'look up', 'find', 'what is the latest', 'what happened',
    'current', 'today', 'news', 'recent', 'right now', 'who won',
    'price of', 'how much is', 'weather', 'trending', 'latest',
    'stock', 'update', 'release', 'when did', 'who is the current',
  ];
  return triggers.some(t => lower.includes(t));
}

// ══════════════════════════════════════════════
// VOICE TRANSCRIPTION (Groq Whisper — free)
// ══════════════════════════════════════════════
app.post('/api/transcribe', async (req, res) => {
  const { audio, mimeType } = req.body;
  if (!audio) return res.status(400).json({ error: 'No audio data' });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set' });

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(audio, 'base64');
    const ext = (mimeType || 'audio/webm').includes('mp4') ? 'mp4'
      : (mimeType || '').includes('ogg') ? 'ogg'
      : 'webm';

    // Build multipart form data manually
    const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
    const CRLF = '\r\n';

    const header = Buffer.from(
      `--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="file"; filename="audio.${ext}"${CRLF}` +
      `Content-Type: ${mimeType || 'audio/webm'}${CRLF}${CRLF}`
    );
    const modelPart = Buffer.from(
      `${CRLF}--${boundary}${CRLF}` +
      `Content-Disposition: form-data; name="model"${CRLF}${CRLF}` +
      `whisper-large-v3-turbo` +
      `${CRLF}--${boundary}--${CRLF}`
    );

    const body = Buffer.concat([header, buffer, modelPart]);

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
      body,
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message || 'Transcription failed' });

    res.json({ text: data.text || '' });
  } catch (err) {
    console.error('Transcribe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ══════════════════════════════════════════════
// MAIN CHAT
// ══════════════════════════════════════════════
async function groqChat(apiKey, messages, maxTokens) {
  return fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + apiKey,
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      max_tokens: maxTokens,
      temperature: 0.15,
      messages,
    }),
  });
}

app.post('/api/chat', async (req, res) => {
  const { messages, hasImage, personality, enableSearch } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GROQ_API_KEY not set — get one free at console.groq.com' });

  const system = getSystemPrompt(personality || 'normal');
  const recent = messages.slice(-60);

  // ── Deep search if enabled and message warrants it ──
  let searchContext = '';
  if (enableSearch) {
    const lastMsg = recent[recent.length - 1];
    const lastText = typeof lastMsg?.content === 'string'
      ? lastMsg.content
      : Array.isArray(lastMsg?.content)
        ? lastMsg.content.find(p => p.type === 'text')?.text || ''
        : '';

    if (needsSearch(lastText)) {
      const results = await webSearch(lastText);
      if (results) {
        const snippets = (results.results || [])
          .slice(0, 4)
          .map(r => `[${r.title}]: ${r.content}`)
          .join('\n\n');
        const answer = results.answer ? `Direct answer: ${results.answer}\n\n` : '';
        searchContext = `\n\n[SEARCH RESULTS for "${lastText}"]\n${answer}${snippets}\n[END SEARCH RESULTS]`;
      }
    }
  }

  // Use vision model if image present
  const model = hasImage
    ? 'meta-llama/llama-4-scout-17b-16e-instruct'
    : 'meta-llama/llama-4-maverick-17b-128e-instruct';

  // Strip images for non-vision messages
  // Strip extra fields (isVoice, searched, etc) — Groq only accepts role + content
  const cleanedMessages = recent.map(m => {
    const clean = { role: m.role, content: m.content };
    if (!Array.isArray(clean.content)) return clean;
    if (hasImage) return clean;
    const text = clean.content.filter(p => p.type === 'text').map(p => p.text).join('\n');
    const hadImg = clean.content.some(p => p.type === 'image_url');
    return { role: m.role, content: text + (hadImg ? '\n[image attached]' : '') };
  });

  // Inject search results into last user message if we got some
  if (searchContext) {
    const last = cleanedMessages[cleanedMessages.length - 1];
    if (last && last.role === 'user') {
      const text = typeof last.content === 'string' ? last.content : last.content;
      cleanedMessages[cleanedMessages.length - 1] = {
        ...last,
        content: (typeof text === 'string' ? text : JSON.stringify(text)) + searchContext,
      };
    }
  }

  const fullMessages = [
    { role: 'system', content: system },
    ...cleanedMessages,
  ];

  try {
    // Use high token limit — no artificial caps
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey,
      },
      body: JSON.stringify({
        model,
        max_tokens: 8192, // Groq's max — no limits
        temperature: 0.15,
        messages: fullMessages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Fallback model
      console.warn('Primary model failed, falling back');
      const fb = await groqChat(apiKey, fullMessages, 8192);
      const fbData = await fb.json();
      if (!fb.ok) return res.status(fb.status).json({ error: fbData?.error?.message || 'API error' });
      return res.json({
        reply: fbData.choices?.[0]?.message?.content || '...',
        searched: !!searchContext,
      });
    }

    res.json({
      reply: data.choices?.[0]?.message?.content || '...',
      searched: !!searchContext,
    });

  } catch (err) {
    console.error('Nova error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('*', (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n════════════════════════════════════');
  console.log('  ⟨NOVA⟩ is ONLINE 💜');
  console.log('  http://localhost:' + PORT);
  console.log('  Model: llama-4-maverick (8192 tokens)');
  console.log('  Voice: Groq Whisper ✅');
  console.log('  Search: ' + (process.env.TAVILY_API_KEY ? 'Tavily ✅' : 'Add TAVILY_API_KEY'));
  console.log('════════════════════════════════════\n');
});
