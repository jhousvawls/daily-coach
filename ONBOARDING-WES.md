# Daily Focus Coach — Getting Started Guide

**Hey Wes!** 👋 Here's everything you need to start using Daily Focus Coach — both the web app and the ChatGPT integration.

---

## 🌐 The Web App

### Access
Open this URL in any browser (works great on phone too):

**https://daily-focus-coach-9eyd3we4p-johns-projects-58c2e0cf.vercel.app**

> 💡 **Tip:** On your phone, tap **Share → Add to Home Screen** to install it as an app.

---

### Daily Workflow

#### 1. Set Your Focus
The big card at the top asks: *"What is the most important thing you can work on today?"*
- Type your focus and hit **Set Focus**
- When you're done, hit the ✅ checkmark to mark it complete
- Use the 🤖 **AI button** to brain-dump everything on your mind — the AI will pick your #1 priority

#### 2. Big Goals
Two categories: **Personal** and **Professional**
- Click **+ Add Goal** to create one
- Each goal tracks progress (0–100%) and can have subtasks
- Mark complete when done 🎉

#### 3. Tiny Goals
Quick checkbox items for small daily tasks:
- Type it, hit enter
- Click to toggle complete ✅

#### 4. Agency Focus
Organize your agencies into three buckets:
- **Core** — your top-priority agencies
- **Expansion** — agencies with growth potential
- **Maintain** — steady-state agencies

Each agency can have **priority levers** (action items) that you can check off.

#### 5. Key Focus Areas
Quarterly priorities with visual progress bars (0–100%). Great for tracking things like:
- Pipeline Growth
- Partner Enablement
- Revenue Targets

#### 6. Customize Your Layout 🔀
Don't like the default section order? Move things around!
1. Click **"Customize Layout"** (top-right of the dashboard)
2. Drag any section up or down using the grip handles
3. Click **"Done"** to save your layout
4. Click **"Reset"** to go back to the default order

Your custom layout is saved and remembered next time you open the app.

---

### Other Features

| Feature | Where to Find It |
|---------|-----------------|
| **Daily Quote** | Top of dashboard — pick a mood (motivational, funny, dad jokes, etc.) |
| **Dark Mode** | Settings (gear icon) → General tab |
| **Date Navigation** | Arrow buttons above the dashboard to view past days |
| **Achievements** | Settings → Achievements tab (streaks, completion stats) |
| **Data Export** | Settings → Advanced tab → Export |

---

## 🤖 Using ChatGPT with Daily Coach (MCP Integration)

This lets you manage your goals, focus, agencies, and more through **natural conversation with ChatGPT**.

### Prerequisites
You'll need these installed on your computer:
- **Node.js** (version 18 or higher) — [download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step-by-Step Setup

#### 1. Clone and build the MCP server

Open Terminal and run:

```bash
# Clone the repo
git clone https://github.com/jhousvawls/daily-coach.git
cd daily-coach

# Go to the MCP server directory
cd ../daily-coach-mcp  # or wherever John shares the MCP server folder

# Install dependencies
npm install

# Build it
npm run build
```

> 📍 **Note:** John may share the built MCP server with you directly — ask him for the path. The server file is at:
> `/path/to/daily-coach-mcp/build/index.js`

#### 2. Install the MCP-to-ChatGPT bridge

```bash
npm install -g mcp-remote
```

#### 3. Start the bridge

```bash
mcp-remote --port 3100 -- node /path/to/daily-coach-mcp/build/index.js
```

> ⚠️ Keep this terminal window running while you use ChatGPT.

#### 4. Connect ChatGPT

1. Open **ChatGPT** in your browser
2. Go to **Settings** → **Connected Tools** → **Add MCP Server**
3. Enter this URL: `http://localhost:3100/sse`
4. Click **Connect**

That's it! ChatGPT now has access to all 18 Daily Coach tools.

---

### What You Can Ask ChatGPT

Once connected, just talk naturally:

| What You Want | What to Say |
|--------------|-------------|
| See everything | *"Show me my dashboard"* |
| Set today's focus | *"Set my focus to: Finalize the Acme proposal"* |
| Check today's focus | *"What's my focus for today?"* |
| Mark focus done | *"Mark today's focus as complete"* |
| Add a goal | *"Add a professional goal: Close 3 new agency deals this quarter"* |
| Add a tiny goal | *"Add a tiny goal: Send follow-up email to Nike"* |
| See all goals | *"Show my goals"* |
| Add an agency | *"Add Acme Corp to my core agencies"* |
| Add a lever to an agency | *"Add a priority lever to Acme: Schedule technical deep-dive"* |
| Check off a lever | *"Mark the technical deep-dive lever as done for Acme"* |
| See agency focus | *"Show my agency focus"* |
| Add a quarterly focus area | *"Add a focus area: Pipeline Growth"* |
| Update progress | *"Update Pipeline Growth to 65%"* |
| See quarterly focus | *"Show my quarterly focus areas"* |

### All Available Tools (18)

| Category | Tools |
|----------|-------|
| **Goals** | `list_goals`, `add_goal`, `complete_goal`, `delete_goal` |
| **Tiny Goals** | `list_tiny_goals`, `add_tiny_goal`, `toggle_tiny_goal` |
| **Daily Focus** | `get_today_focus`, `set_today_focus`, `complete_today_focus` |
| **Agency Focus** | `get_agency_focus`, `add_agency`, `add_agency_lever`, `toggle_agency_lever` |
| **Quarterly Focus** | `get_quarterly_focus`, `add_focus_area`, `update_focus_progress` |
| **Dashboard** | `get_dashboard_summary` |

---

## 💾 Where Is My Data Stored?

All your data lives in a local file on your computer:

```
~/.daily-coach/data.json
```

- It's **not in the cloud** — it stays on your machine
- The web app uses your browser's localStorage (also local)
- No account needed, no passwords

---

## ❓ Troubleshooting

**ChatGPT says "Can't connect to MCP server"**
→ Make sure the `mcp-remote` terminal is still running. Restart it if needed.

**"node: command not found"**
→ Install Node.js from https://nodejs.org/ (choose the LTS version)

**ChatGPT doesn't show the tools**
→ Try disconnecting and reconnecting the MCP server in ChatGPT settings.

**Web app looks different than expected**
→ Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

---

## 🙋 Need Help?

Reach out to John — happy to walk through anything!
