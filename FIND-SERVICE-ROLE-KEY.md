# How to Find Your Supabase Service Role Key
## Step-by-Step Guide with Screenshots

### 🔍 Quick Steps:

1. **Go to Supabase Dashboard**
   - Open [https://supabase.com](https://supabase.com)
   - Sign in to your account

2. **Navigate to Your Project**
   - Click on your "Daily Focus Coach" project (or whatever you named it)

3. **Go to Settings → API**
   - In the left sidebar, click **"Settings"**
   - Then click **"API"** in the settings menu

4. **Find the Service Role Key**
   - Scroll down to the **"Project API keys"** section
   - Look for **"service_role"** (NOT "anon")
   - Click the **"Copy"** button or **eye icon** to reveal the key
   - It starts with `eyJ...` and is much longer than the anon key

### 🔑 What You're Looking For:

**Service Role Key:**
- ✅ Starts with: `eyJ...`
- ✅ Very long (several hundred characters)
- ✅ Located under "service_role" section
- ✅ Has admin permissions

**NOT the Anon Key:**
- ❌ Also starts with `eyJ...` but shorter
- ❌ Located under "anon" section  
- ❌ Has limited permissions

### 📍 Exact Location in Dashboard:

```
Supabase Dashboard
├── Your Project Name
    ├── Table Editor
    ├── Authentication  
    ├── Storage
    ├── Edge Functions
    ├── SQL Editor
    └── Settings ← Click here
        ├── General
        ├── Database
        ├── API ← Then click here
        │   ├── Configuration
        │   └── Project API keys ← Look here
        │       ├── anon (public) ← NOT this one
        │       └── service_role ← THIS ONE! 🎯
        ├── Auth
        └── Storage
```

### 🚨 Security Note:

**IMPORTANT:** The service role key has admin access to your database. Keep it secure and never share it publicly or commit it to version control.

### 🔄 Alternative: Use Anon Key

If you can't find the service role key or prefer not to use it:
1. In the terminal, type `anon` instead of `service`
2. Use the "anon" key from the same API page
3. Some operations may require manual application if permissions are insufficient

### 📋 Copy and Paste:

Once you find the service role key:
1. Click the copy button next to it
2. Go back to your terminal
3. Paste it where it says "Service Role Key:"
4. Press Enter

The script will then test the connection and apply all the Supabase fixes automatically!
