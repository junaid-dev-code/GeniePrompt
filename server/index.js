import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';
import OpenAI from 'openai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'prompt-genie-dev-secret';

// DeepSeek client (OpenAI-compatible API)
let aiClient = null;
if (process.env.DEEPSEEK_API_KEY) {
  aiClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });
}

// ── Database ────────────────────────────────────────────────────────────────
const db = new Database(join(__dirname, 'data.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    enabled INTEGER DEFAULT 1,
    scope TEXT DEFAULT 'global',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS prompts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    original_input TEXT DEFAULT '',
    improved_output TEXT DEFAULT '',
    is_template INTEGER DEFAULT 0,
    template_body TEXT DEFAULT NULL,
    folder TEXT DEFAULT 'default',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, name)
  );
`);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(header.slice(7), JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const result = db.prepare('INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)').run(email, password_hash, full_name || '');
    const token = jwt.sign({ userId: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '30d' });
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, email, full_name: full_name || '', role: 'user' },
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', authMiddleware, (req, res) => {
  // JWT is stateless — client discards the token
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// ── Memories Routes ─────────────────────────────────────────────────────────
app.get('/api/memories', authMiddleware, (req, res) => {
  const memories = db.prepare('SELECT * FROM memories WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(memories);
});

app.get('/api/memories/active', authMiddleware, (req, res) => {
  const memories = db.prepare('SELECT * FROM memories WHERE user_id = ? AND enabled = 1 ORDER BY created_at DESC').all(req.userId);
  res.json(memories);
});

app.post('/api/memories', authMiddleware, (req, res) => {
  const { text, enabled } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Memory text is required' });
  }
  const result = db.prepare('INSERT INTO memories (user_id, text, enabled) VALUES (?, ?, ?)').run(req.userId, text.trim(), enabled !== false ? 1 : 0);
  const memory = db.prepare('SELECT * FROM memories WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(memory);
});

app.put('/api/memories/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM memories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  const { text, enabled, scope } = req.body;
  const updates = {};
  if (text !== undefined) updates.text = text;
  if (enabled !== undefined) updates.enabled = enabled ? 1 : 0;
  if (scope !== undefined) updates.scope = scope;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  const setClause = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
  updates.id = existing.id;
  updates.updated_at = new Date().toISOString();
  db.prepare(`UPDATE memories SET ${setClause}, updated_at = @updated_at WHERE id = @id`).run(updates);

  const updated = db.prepare('SELECT * FROM memories WHERE id = ?').get(existing.id);
  res.json(updated);
});

app.delete('/api/memories/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM memories WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: 'Memory not found' });
  }
  db.prepare('DELETE FROM memories WHERE id = ?').run(req.params.id);
  res.json({ message: 'Memory deleted' });
});

// ── Prompts Routes ──────────────────────────────────────────────────────────
app.post('/api/prompts/generate', authMiddleware, async (req, res) => {
  try {
    const { userPrompt } = req.body;
    if (!userPrompt || !userPrompt.trim()) {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    // Fetch active memories for this user
    const memories = db.prepare('SELECT text FROM memories WHERE user_id = ? AND enabled = 1').all(req.userId);
    const memoryText = memories.map(m => m.text).join('\n');

    const systemPrompt = `You are a world-class prompt engineer. Your job is to take a user's rough, vague, or lazy prompt and transform it into a precise, highly effective prompt that will produce outstanding results from any AI model.

You must follow these rules strictly:

1. PRESERVE INTENT: Never change what the user is asking for. Only improve HOW they ask it.
2. BE SPECIFIC: Replace vague words with precise ones. "Write an email" becomes "Write a professional cold email to a VP of Engineering at a Series B startup".
3. ADD STRUCTURE: Use numbered steps, sections, and clear formatting so the AI knows exactly what to produce.
4. DEFINE OUTPUT FORMAT: Explicitly state the desired format — markdown, bullet points, JSON, numbered list, paragraph, etc.
5. SET CONSTRAINTS: Add word limits, tone requirements, audience context, and any boundaries the AI should respect.
6. PROVIDE CONTEXT: Include relevant background, role definition ("You are a senior..."), and situational details.
7. USE ACTION VERBS: Start instructions with clear action verbs — "Analyze", "Generate", "Compare", "Draft".
8. ELIMINATE AMBIGUITY: Remove any phrasing that could be interpreted multiple ways.
9. INCLUDE SUCCESS CRITERIA: Define what a great output looks like so the AI can self-evaluate.
10. NO META-COMMENTARY: Output ONLY the improved prompt. No explanations, no "Here is the improved prompt", no preamble. Just the prompt itself.`;

    let userMessage = `Original prompt: "${userPrompt}"`;
    if (memoryText) {
      userMessage += `\n\nThe user has these persistent preferences (memories) that MUST be applied to every prompt they generate. Incorporate these into the improved prompt:\n${memoryText}`;
    }

    if (aiClient) {
      const completion = await aiClient.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 3000,
        temperature: 0.7,
      });
      const improvedPrompt = completion.choices[0]?.message?.content || userPrompt;
      return res.json({ improvedPrompt });
    }

    // Fallback when no AI key configured
    const improvedPrompt = `${userPrompt.trim()}\n\nPlease provide a detailed, well-structured response with clear sections and actionable information.${memoryText ? `\n\nPreferences to apply: ${memoryText}` : ''}`;
    res.json({ improvedPrompt });
  } catch (err) {
    console.error('Generate error:', err);
    res.status(500).json({ error: 'Prompt generation failed' });
  }
});

app.get('/api/prompts', authMiddleware, (req, res) => {
  const { search } = req.query;
  let prompts;
  if (search) {
    const like = `%${search}%`;
    prompts = db.prepare(
      'SELECT * FROM prompts WHERE user_id = ? AND (title LIKE ? OR original_input LIKE ? OR improved_output LIKE ?) ORDER BY created_at DESC'
    ).all(req.userId, like, like, like);
  } else {
    prompts = db.prepare('SELECT * FROM prompts WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  }
  res.json(prompts);
});

app.post('/api/prompts/save', authMiddleware, (req, res) => {
  const { title, original_input, improved_output, is_template, template_body, folder } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }
  const result = db.prepare(
    'INSERT INTO prompts (user_id, title, original_input, improved_output, is_template, template_body, folder) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(req.userId, title.trim(), original_input || '', improved_output || '', is_template ? 1 : 0, template_body || null, folder || 'default');
  const prompt = db.prepare('SELECT * FROM prompts WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(prompt);
});

app.delete('/api/prompts/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM prompts WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: 'Prompt not found' });
  }
  db.prepare('DELETE FROM prompts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Prompt deleted' });
});

// ── Folders Routes ──────────────────────────────────────────────────────────
app.get('/api/prompts/folders', authMiddleware, (req, res) => {
  const folders = db.prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(folders);
});

app.post('/api/prompts/folders', authMiddleware, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required' });
  }
  try {
    const result = db.prepare('INSERT INTO folders (user_id, name) VALUES (?, ?)').run(req.userId, name.trim());
    const folder = db.prepare('SELECT * FROM folders WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(folder);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Folder already exists' });
    }
    throw err;
  }
});

app.delete('/api/prompts/folders/:id', authMiddleware, (req, res) => {
  const existing = db.prepare('SELECT * FROM folders WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!existing) {
    return res.status(404).json({ error: 'Folder not found' });
  }
  db.prepare('DELETE FROM folders WHERE id = ?').run(req.params.id);
  res.json({ message: 'Folder deleted' });
});

// Serve frontend
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist', 'index.html'));
});

// ── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ PromptGenie server running on http://localhost:${PORT}`);
});
