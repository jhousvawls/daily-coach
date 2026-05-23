# Daily Focus Coach — Getting Started Guide

**Hey Wes!** 👋 Here's everything you need to start using Daily Focus Coach — both the web app and the ChatGPT integration.

---

## 🌐 The Web App

### Access
Open this URL in any browser (works great on phone too):

**https://daily-coach-psi.vercel.app**

> 💡 **Tip:** On your phone, tap **Share → Add to Home Screen** to install it as an app.

### Your Login
| | |
|---|---|
| **Email** | `wes.chalk@wpengine.com` |
| **Password** | `Wes@123` |

Click **Sign In** (top-right of the header) and enter your credentials. Your data will sync to the cloud automatically — so you can use it on your phone, laptop, or any browser.

---

### 👀 See a Fully Populated Example First

Want to see what a filled-out dashboard looks like before you start building your own? 

Log in with the **demo account**:

| | |
|---|---|
| **Email** | `demo@dailyfocuscoach.com` |
| **Password** | `demo2025!` |

The demo has sample data pre-loaded:
- **16 agencies** organized into Core / Expansion / Maintain buckets with priority levers
- **3 quarterly focus areas** with progress bars (ARPU Enablement, BAM Expansion, Standardization)
- **5 big goals** (personal + professional) with progress tracking
- **4 tiny goals** as quick action items
- **A daily focus task** for today

> ⚠️ **Sign out of the demo account before signing in with your own credentials.** Click your name in the top-right → Sign Out.

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

## 💾 Where Is My Data Stored?

Your data is stored in **two places** for maximum reliability:

1. **Browser localStorage** — instant, works offline, loads immediately
2. **Cloud (Supabase)** — syncs automatically when you're signed in

This means:
- ✅ The app works **even without internet** (offline-first)
- ✅ Your data **syncs across devices** when you sign in
- ✅ If you clear your browser cache, your data is **safe in the cloud**
- ✅ No manual saving needed — everything auto-syncs in the background

---

## 🤖 Using ChatGPT with Daily Coach

You can manage your goals, focus, agencies, and more through **natural conversation with ChatGPT** — no setup, no terminal, no installs.

### How to Access

John will share a **Custom GPT link** with you. Just click it and start talking! It works directly in the ChatGPT web app.

> 💡 The first time you use it, ChatGPT will ask to "Allow" the Daily Focus Coach actions — click **Allow** to let it read/write your data.

---

### What You Can Ask ChatGPT

Once you open the Custom GPT, just talk naturally:

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

### What It Can Do

| Category | Capabilities |
|----------|-------------|
| **Daily Focus** | View, set, and complete today's focus task |
| **Big Goals** | Create, list, complete, and delete personal & professional goals |
| **Tiny Goals** | Create, list, and toggle quick checkbox items |
| **Agency Focus** | View agencies by bucket, add agencies, add/toggle priority levers |
| **Quarterly Focus** | View focus areas, add new ones, update progress (0-100%) |
| **Dashboard** | Get a full summary of everything in one shot |

> 📝 **Note:** Changes you make through ChatGPT show up in the web app too — they share the same database!

---

## ❓ Troubleshooting

**Can't sign in to the web app?**
→ Make sure you're using `wes.chalk@wpengine.com` and `Wes@123` (case-sensitive password).

**ChatGPT says "couldn't complete the action" or shows an error?**
→ Try again — occasionally the API takes a moment to respond. If it keeps failing, let John know.

**ChatGPT asks to "Allow" actions?**
→ Click **Allow** or **Always allow** — this lets the GPT read and write your data through the API.

**Web app looks different than expected?**
→ Hard refresh: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

**Data not syncing across devices?**
→ Make sure you're signed in on both devices. Data only syncs when authenticated.

**Changes in ChatGPT not showing in the web app?**
→ Refresh the web app — ChatGPT writes directly to the same database, so it should appear immediately.

---

## 🙋 Need Help?

Reach out to John — happy to walk through anything!
