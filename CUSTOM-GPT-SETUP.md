# Custom GPT Setup — Daily Focus Coach

This guide is for **John** to create the Custom GPT that Wes (and others) can use.

---

## Step 1: Set Vercel Environment Variables

### How to add env vars in Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click on the **daily-coach** project
3. Click **Settings** (top nav)
4. Click **Environment Variables** (left sidebar)
5. For each variable below, enter the **Key** and **Value**, select all environments (Production, Preview, Development), and click **Save**

### Variables to add

> `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` should already be set. You only need to add `COACH_API_KEYS` if it's not there yet.

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | `https://uqvsmdfcydokeaxmzfaw.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(your service role key — already set)* |
| `SUPABASE_ANON_KEY` | *(your anon key — already set)* |
| **`COACH_API_KEYS`** | *(see below)* |

### COACH_API_KEYS value

Copy this entire JSON string as the value for `COACH_API_KEYS`:

```
{"wes-coach-2026":"c4966832-0180-42f9-b55d-d0d48198cd0d","demo-coach-2026":"7ddb4b8c-12b7-4773-a7f3-adf283fb9560","john-coach-2026":"d509b2ca-c332-4f69-8786-fb0f51ddb24d"}
```

> **How it works:** Each key in the JSON is an API key string (used in the Custom GPT config). Each value is the Supabase user UUID for that person. When ChatGPT sends a request with `X-API-Key: wes-coach-2026`, the API looks up the UUID and scopes all queries to Wes's data.

### Redeploy after adding

After saving the env var, you need to redeploy for it to take effect:

1. Go to the **Deployments** tab
2. Click the **⋮** menu on the latest deployment
3. Click **Redeploy**
4. Wait ~30 seconds for it to finish

Alternatively, just push a new commit — that triggers a redeploy automatically.

---

## Step 2: Create the Custom GPT

1. Go to [ChatGPT](https://chat.openai.com)
2. Click your profile → **My GPTs** → **Create a GPT**
3. Click **Configure** tab

### Name
```
Daily Focus Coach
```

### Description
```
Your personal productivity coach — manage goals, daily focus, agency tracking, and quarterly priorities through conversation.
```

### Instructions (System Prompt)
```
You are a Daily Focus Coach — a personal productivity assistant that helps users manage their work through the Daily Focus Coach app.

You have access to the Daily Focus Coach API to read and write data. Always use the API to fetch current data before answering questions about the user's goals, focus, agencies, or progress.

## Capabilities
- View and set the daily focus task
- Create, list, complete, and delete big goals (personal + professional)
- Create, list, and toggle tiny goals (quick checkbox items)
- View, add, and manage agencies organized by bucket (core/expansion/maintain)
- Add and toggle priority levers on agencies
- View, add, and update quarterly focus areas with progress percentages
- Get a full dashboard summary

## Behavior Guidelines
1. When the user asks to see their dashboard, goals, agencies, etc. — always call the API first to get real data
2. Present data in a clean, organized format using headers, bullet points, and emoji
3. When creating items, confirm what was created with the response from the API
4. Be encouraging and supportive — celebrate completions 🎉
5. If the user asks what they should focus on, look at their goals, agencies, and quarterly focus to suggest priorities
6. Keep responses concise but warm — this is a coaching tool, not a report generator
7. When showing agency data, organize by bucket (Core → Expansion → Maintain)
8. When showing quarterly focus, include progress bars like: ████░░░░░░ 40%

## Important
- The user's data is private and specific to their API key
- Today's date is always based on the API response (server time)
- Goal IDs, agency IDs, and lever IDs are UUIDs or integers — always use the IDs from API responses when performing actions
```

### Actions
1. Click **Create new action**
2. In the **Schema** box, enter this URL and click **Import**:
   ```
   https://daily-coach-psi.vercel.app/openapi.json
   ```
3. Under **Authentication**, select **API Key**
   - Auth Type: **API Key**
   - API Key: *(enter the user's key, e.g., `wes-coach-2026`)*
   - Header Name: `X-API-Key`

### Privacy Policy
```
https://daily-coach-psi.vercel.app
```

---

## Step 3: Test It

Try these prompts:
- "Show me my dashboard"
- "What's my focus for today?"
- "Add a professional goal: Close 3 new agency deals this quarter"
- "Show me my agency focus"
- "Show my quarterly focus areas"

---

## Step 4: Share with Wes

1. Click **Save** → Choose **Anyone with the link**
2. Copy the link
3. Send to Wes — he just opens it and starts talking!

> **Note:** Each user needs their own Custom GPT instance with their own API key configured. You can create one for Wes (with `wes-coach-2026` key) and one for yourself (with `john-coach-2026` key).

---

## API Keys Reference

| User | API Key | Supabase User ID |
|------|---------|-----------------|
| Wes | `wes-coach-2026` | `c4966832-0180-42f9-b55d-d0d48198cd0d` |
| Demo | `demo-coach-2026` | `7ddb4b8c-12b7-4773-a7f3-adf283fb9560` |
| John | `john-coach-2026` | `d509b2ca-c332-4f69-8786-fb0f51ddb24d` |
