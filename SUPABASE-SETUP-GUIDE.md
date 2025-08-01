# Supabase Setup Guide - Daily Focus Coach

This guide will walk you through setting up Supabase for your Daily Focus Coach application, enabling cross-device synchronization.

## 📋 Prerequisites

- A GitHub account (recommended for easy Supabase signup)
- Your Daily Focus Coach project with the Supabase integration code

## 🚀 Step 1: Create Supabase Account & Project

### 1.1 Sign Up for Supabase
1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

### 1.2 Access Your Existing Project
1. Go to your Supabase dashboard
2. Select your existing project: **"daily-coach"**
3. If you don't see it, make sure you're logged into the correct account

## 🗄️ Step 2: Set Up Database Schema

### 2.1 Access SQL Editor
1. In your Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**

### 2.2 Run Database Setup Script
1. Copy the entire contents of `database-setup.sql` from your project
2. Paste it into the SQL Editor
3. Click **"Run"** (or press Ctrl/Cmd + Enter)
4. You should see: **"Success. No rows returned"**

### 2.3 Verify Tables Created
1. Click **"Table Editor"** in the left sidebar
2. You should see 5 tables:
   - `goals`
   - `tiny_goals`
   - `daily_tasks`
   - `recurring_tasks`
   - `user_preferences`

## 🔐 Step 3: Configure Authentication

### 3.1 Enable Email Authentication
1. Go to **"Authentication"** → **"Settings"** in the left sidebar
2. Under **"Auth Providers"**, ensure **Email** is enabled
3. Configure email settings:
   - **Enable email confirmations**: ✅ (recommended)
   - **Enable email change confirmations**: ✅ (recommended)
   - **Enable secure email change**: ✅ (recommended)

### 3.2 Configure Site URL (Important!)
1. In **Authentication** → **"URL Configuration"**
2. Under **"Site URL"**, set to: `https://daily-project-coach-84jv50smu-johns-projects-58c2e0cf.vercel.app`
3. Under **"Redirect URLs"**, add these URLs:
   - `https://daily-project-coach-84jv50smu-johns-projects-58c2e0cf.vercel.app`
   - `http://localhost:3000`
   - `http://localhost:5173`
   - `http://localhost:5180`
4. Click **"Save"**

### 3.3 Optional: Enable Google OAuth
1. In **"Auth Providers"**, click **"Google"**
2. Enable Google provider
3. Add your Google OAuth credentials (requires Google Cloud Console setup)
4. This is optional - email auth works fine for now

## 🔑 Step 4: Get API Credentials

### 4.1 Find Your Credentials
1. Go to **"Settings"** → **"API"** in the left sidebar
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (long string starting with `eyJ`)

### 4.2 Create Environment File
1. In your project root (`daily-focus-coach/`), copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Save the file

## 🧪 Step 5: Test the Connection

### 5.1 Start Development Server
```bash
cd daily-focus-coach
npm run dev
```

### 5.2 Test Authentication
1. Open your app in the browser
2. Click **"Sign In"** in the header
3. Try creating a new account:
   - Enter an email and password
   - Click **"Create Account"**
   - Check for any console errors

### 5.3 Verify Database Connection
1. After signing up, check your Supabase dashboard
2. Go to **"Authentication"** → **"Users"**
3. You should see your new user listed
4. Go to **"Table Editor"** → **"user_preferences"**
5. You might see a new row created

## 🔧 Step 6: Configure Row Level Security (RLS)

The database setup script already configured RLS, but let's verify:

### 6.1 Check RLS Policies
1. Go to **"Authentication"** → **"Policies"**
2. You should see policies for each table:
   - "Users can only access their own data" for each table
3. If missing, re-run the database setup script

### 6.2 Test Data Isolation
1. Create a test goal or task in your app
2. Sign out and create another account
3. Verify you can't see the first user's data

## 🌐 Step 7: Production Deployment Setup

### 7.1 Create Production Project (Optional)
For production, you might want a separate Supabase project:
1. Repeat Steps 1-4 with a new project name like `daily-focus-coach-prod`
2. Use different environment variables for production

### 7.2 Configure Vercel Environment Variables
If deploying to Vercel:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add:
   - `VITE_SUPABASE_URL` = your production Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your production anon key

## 🐛 Troubleshooting

### Common Issues

**❌ "Invalid API key" Error**
- Check that environment variables are correct
- Restart your development server after adding `.env.local`
- Ensure no extra spaces in the environment file

**❌ "Table doesn't exist" Error**
- Verify the database setup script ran successfully
- Check the Table Editor to confirm tables exist
- Re-run the database setup script if needed

**❌ "RLS policy violation" Error**
- User must be authenticated to access data
- Check that authentication is working first
- Verify RLS policies exist in Authentication → Policies

**❌ CORS Errors**
- Add your domain to Supabase → Settings → API → CORS
- For development, add `http://localhost:5173`
- For production, add your actual domain

**❌ Authentication Redirect Issues**
- Check Site URL and Redirect URLs in Authentication → Settings
- Must match your actual domain exactly
- Include protocol (http:// or https://)

### Getting Help

1. **Check Supabase Logs**: Dashboard → Logs
2. **Browser Console**: Look for JavaScript errors
3. **Network Tab**: Check for failed API requests
4. **Supabase Docs**: [docs.supabase.com](https://docs.supabase.com)

## ✅ Verification Checklist

Before proceeding, ensure:

- [ ] ✅ Supabase project created
- [ ] ✅ Database tables created (5 tables visible)
- [ ] ✅ RLS policies configured
- [ ] ✅ Authentication enabled and configured
- [ ] ✅ Environment variables set in `.env.local`
- [ ] ✅ Development server starts without errors
- [ ] ✅ Can create user account
- [ ] ✅ User appears in Supabase dashboard
- [ ] ✅ No console errors during authentication

## 🎯 Next Steps

Once Supabase is configured:

1. **Test the Authentication UI** - Sign up, sign in, sign out
2. **Implement Data Sync** - Connect cloud storage with local storage
3. **Test Cross-Device Sync** - Use multiple browsers/devices
4. **Deploy to Production** - Configure production environment variables

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check your browser's developer console for errors
4. Verify all environment variables are correct

---

**🎉 Congratulations!** Once you complete this setup, your Daily Focus Coach will be ready for cross-device synchronization with Supabase!
