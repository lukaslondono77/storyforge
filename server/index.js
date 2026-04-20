// server/index.js
// Express backend:
//  - /api/auth/*   → email/password signup & login (JWT)
//  - /api/stories/* → proxies GitHub API using the bot token (writers never see it)
//  - /*             → serves the React build

const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const fetch    = require("node-fetch");
const path     = require("path");
const fs       = require("fs");

const app  = express();
const PORT = process.env.PORT || 4000;

const JWT_SECRET    = process.env.JWT_SECRET    || "change-me-in-production";
const GH_TOKEN      = process.env.GITHUB_BOT_TOKEN;   // your personal access token
const GH_OWNER      = process.env.GITHUB_REPO_OWNER;
const GH_REPO       = process.env.GITHUB_REPO_NAME;

app.use(express.json());

// ─── Simple file-based user store (no DB needed) ────────────────────────────
// Users are stored in server/users.json inside the repo on Render's disk.
// For persistence across deploys, mount a Render Disk or migrate to a KV store.
const USERS_FILE = path.join(__dirname, "users.json");

function readUsers() {
  try { return JSON.parse(fs.readFileSync(USERS_FILE, "utf8")); }
  catch { return []; }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUser(email) {
  return readUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

// ─── Auth middleware ─────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ─── GitHub helpers (bot token, invisible to writers) ───────────────────────
const GH_HEADERS = {
  Authorization: `Bearer ${GH_TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "Content-Type": "application/json",
};

function encode(str) { return Buffer.from(str, "utf8").toString("base64"); }
function decode(b64) { return Buffer.from(b64, "base64").toString("utf8"); }
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function ghGet(path) {
  const r = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`, { headers: GH_HEADERS });
  if (r.status === 404) return null;
  return r.json();
}

async function ghPut(path, content, sha, message) {
  const body = { message, content: encode(content), ...(sha ? { sha } : {}) };
  const r = await fetch(`https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${path}`,
    { method: "PUT", headers: GH_HEADERS, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

function storyToMarkdown(story) {
  return [
    "---",
    `title: "${story.title.replace(/"/g, '\\"')}"`,
    `author: "${story.author.replace(/"/g, '\\"')}"`,
    `authorId: "${story.authorId}"`,
    `genre: "${story.genre}"`,
    `tier: "${story.tier}"`,
    `excerpt: "${story.excerpt.replace(/"/g, '\\"')}"`,
    `accentColor: "${story.accentColor || "#c8a96e"}"`,
    `date: "${story.date || new Date().toISOString()}"`,
    `subscribers: ${story.subscribers || 0}`,
    `reads: ${story.reads || 0}`,
    "---",
    "",
    story.body,
  ].join("\n");
}

function parseMd(content, filename, sha) {
  try {
    const match = content.match(/^---\n([\s\S]+?)\n---\n?([\s\S]*)$/);
    if (!match) return null;
    const [, fm, body] = match;
    const meta = {};
    fm.split("\n").forEach(line => {
      const i = line.indexOf(":");
      if (i === -1) return;
      const key = line.slice(0, i).trim();
      let val = line.slice(i + 1).trim().replace(/^"|"$/g, "");
      if (val !== "" && !isNaN(val)) val = Number(val);
      meta[key] = val;
    });
    return { ...meta, body: body.trim(), slug: filename.replace(".md", ""), sha };
  } catch { return null; }
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// POST /api/auth/register
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Name, email and password are required." });
  if (password.length < 6)
    return res.status(400).json({ error: "Password must be at least 6 characters." });
  if (findUser(email))
    return res.status(409).json({ error: "An account with this email already exists." });

  const users = readUsers();
  const user  = {
    id:           Date.now().toString(),
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash: await bcrypt.hash(password, 10),
    createdAt:    new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = findUser(email);
  if (!user) return res.status(401).json({ error: "No account found with that email." });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Incorrect password." });

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// GET /api/auth/me  (verify token + return user)
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// ═══════════════════════════════════════════════════════════════════════════
// STORY ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/stories  — list all stories (public)
app.get("/api/stories", async (req, res) => {
  try {
    const files = await ghGet("stories");
    if (!files || !Array.isArray(files)) return res.json([]);

    const stories = await Promise.all(
      files.filter(f => f.name.endsWith(".md")).map(async f => {
        const file = await ghGet(`stories/${f.name}`);
        if (!file) return null;
        const content = decode(file.content);
        return parseMd(content, f.name, file.sha);
      })
    );
    res.json(stories.filter(Boolean));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/stories/:slug  — single story (public)
app.get("/api/stories/:slug", async (req, res) => {
  try {
    const file = await ghGet(`stories/${req.params.slug}.md`);
    if (!file) return res.status(404).json({ error: "Story not found" });
    const story = parseMd(decode(file.content), `${req.params.slug}.md`, file.sha);
    res.json(story);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/stories  — publish a new story (auth required)
app.post("/api/stories", requireAuth, async (req, res) => {
  try {
    const story = {
      ...req.body,
      author:      req.user.name,
      authorId:    req.user.id,
      date:        new Date().toISOString(),
      subscribers: 0,
      reads:       0,
    };
    const slug    = slugify(story.title);
    const content = storyToMarkdown(story);
    await ghPut(`stories/${slug}.md`, content, null, `Publish: ${story.title}`);
    res.json({ slug, message: "Published!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/stories/:slug  — update a story (auth required, must be owner)
app.put("/api/stories/:slug", requireAuth, async (req, res) => {
  try {
    const existing = await ghGet(`stories/${req.params.slug}.md`);
    if (!existing) return res.status(404).json({ error: "Story not found" });
    const parsed = parseMd(decode(existing.content), `${req.params.slug}.md`, existing.sha);
    if (parsed.authorId !== req.user.id)
      return res.status(403).json({ error: "You can only edit your own stories." });

    const updated = { ...parsed, ...req.body, author: req.user.name, authorId: req.user.id };
    const content = storyToMarkdown(updated);
    await ghPut(`stories/${req.params.slug}.md`, content, existing.sha, `Update: ${updated.title}`);
    res.json({ slug: req.params.slug, message: "Updated!" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/stories/:slug/read  — increment read count
app.post("/api/stories/:slug/read", async (req, res) => {
  try {
    const file = await ghGet(`stories/${req.params.slug}.md`);
    if (!file) return res.status(404).json({ error: "Not found" });
    const story   = parseMd(decode(file.content), `${req.params.slug}.md`, file.sha);
    story.reads   = (story.reads || 0) + 1;
    await ghPut(`stories/${req.params.slug}.md`, storyToMarkdown(story), file.sha, `Read: ${req.params.slug}`);
    res.json({ reads: story.reads });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// SERVE REACT
// ═══════════════════════════════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, "..", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => console.log(`✦ StoryForge running on port ${PORT}`));
