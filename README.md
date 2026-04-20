# ✦ StoryForge

A creative writing subscription platform for non-technical writers.
**Writers sign up with email and password** — they never touch GitHub.
Stories are stored as Markdown files in a GitHub repo you own (invisible to writers).

---

## Deploy to Render in 4 steps

### Step 1 — Create the GitHub content repo

1. Go to [github.com](https://github.com) → click **New repository**
2. Name it `storyforge-content`
3. Set it to **Public**
4. Click **Create repository**
5. Create two empty folders by adding files:
   - Click "creating a new file" → type `stories/.gitkeep` → commit
   - Do the same for `authors/.gitkeep`

### Step 2 — Create a GitHub Personal Access Token (bot token)

This is the secret key your server uses to save stories — writers never see it.

1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Give it a name: `storyforge-bot`
4. Check the box: **public_repo**
5. Click **Generate token**
6. Copy the token (starts with `ghp_`) — save it somewhere safe

### Step 3 — Push to GitHub & deploy on Render

1. Create a new GitHub repo for this code (e.g. `storyforge-app`)
2. Upload all these files to it
3. Go to [render.com](https://render.com) → **New → Web Service**
4. Connect your `storyforge-app` repo
5. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Node version:** 18

### Step 4 — Set environment variables on Render

In your Render service → **Environment** tab, add:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | A long random string (e.g. `myapp_super_secret_2026_xyz`) |
| `GITHUB_BOT_TOKEN` | Your token from Step 2 (starts with `ghp_`) |
| `GITHUB_REPO_OWNER` | Your GitHub username |
| `GITHUB_REPO_NAME` | `storyforge-content` |

Click **Save** → Render will redeploy automatically.

---

## How writers use it

1. Visit your Render URL
2. Click **"Start writing"** → enter name, email, password
3. Click **"Write"** in the nav → write their story in the editor
4. Click **"Publish story"** → done ✦

Their story appears instantly on the Discover page. They can set stories as free or paid, edit anytime, and track reads on their Dashboard.

**They never see GitHub.** The files appear there automatically.

---

## Local development

```bash
# Clone and install
npm install

# Copy env file and fill in values
cp .env.example .env

# Start the server (serves the React build)
npm start

# OR for development with hot reload:
# Terminal 1:
npm run dev:client   # React on port 3000

# Terminal 2:
PORT=4000 npm run dev:server   # Express on port 4000
```

---

## Adding real payments later (Stripe)

When you're ready to accept real subscriptions:

1. Sign up at [stripe.com](https://stripe.com)
2. Add `stripe` npm package
3. Create a `/api/checkout` endpoint that creates a Stripe Checkout session
4. Add a Stripe webhook that updates subscriber counts in the GitHub files
5. Replace the `localStorage.setItem("sf_plan", ...)` calls with server-verified sessions

The GitHub-as-database architecture stays the same — you just add a payment layer on top.

---

## File structure

```
storyforge/
├── server/
│   └── index.js          ← Express: auth + GitHub proxy
├── src/
│   ├── lib/
│   │   ├── auth.js       ← Login/register context
│   │   └── api.js        ← API calls to backend
│   ├── components/
│   │   └── Header.js
│   ├── pages/
│   │   ├── Auth.js       ← Register + Login
│   │   ├── Discover.js   ← Browse all stories
│   │   ├── StoryDetail.js← Read a story (paywall for paid)
│   │   ├── Write.js      ← Editor (also used for editing)
│   │   ├── Dashboard.js  ← Writer stats
│   │   └── Plans.js      ← Subscription tiers
│   ├── App.js
│   ├── styles.css
│   └── index.js
├── public/
│   └── index.html
├── package.json
└── .env.example
```
