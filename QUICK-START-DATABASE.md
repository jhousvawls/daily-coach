# Quick Start: Database Implementation

## 🚀 Ready to Add Cross-Device Sync? Start Here!

This guide gets you from zero to cloud sync in the fastest way possible.

## Step 1: Create Supabase Project (5 minutes)

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up/Login** with GitHub
3. **Create New Project**
   - Name: `daily-focus-coach`
   - Database Password: Generate strong password (save it!)
   - Region: Choose closest to your users
4. **Wait for setup** (2-3 minutes)
5. **Copy credentials** from Settings > API:
   - Project URL
   - Anon public key

## Step 2: Set Up Database (2 minutes)

1. **Open Supabase SQL Editor**
2. **Copy entire contents** of `database-setup.sql`
3. **Paste and run** the script
4. **Verify success** - should see 5 tables created

## Step 3: Configure Environment (1 minute)

Create `.env.local` in your project root:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Install Dependencies (30 seconds)

```bash
cd daily-focus-coach
npm install @supabase/supabase-js
```

## Step 5: Test Connection (2 minutes)

Create a quick test file to verify everything works:

```typescript
// test-supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// Test the connection
async function testConnection() {
  const { data, error } = await supabase.from('goals').select('count')
  if (error) {
    console.error('Connection failed:', error)
  } else {
    console.log('✅ Supabase connected successfully!')
  }
}

testConnection()
```

## Step 6: Follow Implementation Plan

Now you're ready to implement! Follow the detailed steps in:

1. **[DATABASE-CHECKLIST.md](DATABASE-CHECKLIST.md)** - Day-by-day tasks
2. **[DATABASE-IMPLEMENTATION-PLAN.md](DATABASE-IMPLEMENTATION-PLAN.md)** - Technical details

## Next Immediate Steps

### Day 1 Tasks (Today!)
- [ ] ✅ Supabase project created
- [ ] ✅ Database schema set up
- [ ] ✅ Environment variables configured
- [ ] ✅ Dependencies installed
- [ ] 🔄 Create `src/services/supabase.ts`
- [ ] 🔄 Create `src/services/auth.ts`
- [ ] 🔄 Create basic authentication UI

### Quick Implementation Order
1. **Authentication** (Day 1-2)
2. **Data sync** (Day 3-4)
3. **Real-time updates** (Day 5-6)
4. **Testing & polish** (Day 7-8)

## File Templates to Create

### `src/services/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `src/services/auth.ts`
```typescript
import { supabase } from './supabase'

export const authService = {
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password })
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password })
  },

  async signOut() {
    return await supabase.auth.signOut()
  },

  async getCurrentUser() {
    return await supabase.auth.getUser()
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user ?? null)
    })
  }
}
```

## Troubleshooting

### Common Issues

**❌ "Invalid API key"**
- Check environment variables are correct
- Restart dev server after adding .env.local

**❌ "Table doesn't exist"**
- Verify database-setup.sql ran successfully
- Check Supabase dashboard > Table Editor

**❌ "RLS policy violation"**
- User must be authenticated to access data
- Check authentication is working first

**❌ "CORS errors"**
- Add your domain to Supabase > Settings > API > CORS

### Getting Help

1. **Check the logs** in Supabase dashboard
2. **Review** DATABASE-IMPLEMENTATION-PLAN.md for details
3. **Follow** DATABASE-CHECKLIST.md step by step
4. **Test incrementally** - don't skip verification steps

## Success Indicators

You'll know it's working when:
- ✅ No console errors about Supabase
- ✅ Can sign up/login users
- ✅ Data appears in Supabase dashboard
- ✅ Changes sync between browser tabs
- ✅ Works offline and syncs when back online

## Production Deployment

When ready for production:

1. **Create production Supabase project**
2. **Add environment variables to Vercel**:
   ```
   VITE_SUPABASE_URL=your-prod-url
   VITE_SUPABASE_ANON_KEY=your-prod-key
   ```
3. **Update authentication URLs** in Supabase dashboard
4. **Deploy and test**

---

**🎯 Goal: Get basic authentication working today, then build incrementally!**

**Time Investment: ~2-3 hours for basic setup, 1-2 weeks for full implementation**

**Result: Your Daily Focus Coach will work seamlessly across iPhone, desktop, and any device with real-time sync!**
