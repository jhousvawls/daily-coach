# Vercel Environment Variables Setup
## Fix Missing Supabase Environment Variables Error

*Issue Date: August 14, 2025*  
*Error: Missing Supabase environment variables. Please check your .env.local file.*

---

## 🚨 Issue Summary

**Error Message:**
```
Uncaught (in promise) Error: Missing Supabase environment variables. Please check your .env.local file.
```

**Root Cause:** Supabase environment variables are not configured in Vercel production environment

**Impact:** PWA works locally but fails in production due to missing database connection

---

## 🔧 Quick Fix Steps

### **Step 1: Get Your Supabase Credentials**

1. **Go to Supabase Dashboard**: https://supabase.com
2. **Select Your Project**: Daily Focus Coach project
3. **Navigate to Settings → API**
4. **Copy These Values**:
   - **Project URL**: `https://xzbkkledybntzvpfcgeb.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with eyJ)

### **Step 2: Add Environment Variables to Vercel**

**Method A: Vercel Dashboard (Recommended)**

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Your Project**: daily-focus-coach (or your project name)
3. **Go to Settings Tab**: Click "Settings" in the top navigation
4. **Click Environment Variables**: In the left sidebar
5. **Add Variables**:

   **Variable 1:**
   - **Name**: `VITE_SUPABASE_URL`
   - **Value**: `https://xzbkkledybntzvpfcgeb.supabase.co`
   - **Environment**: Production, Preview, Development (check all)

   **Variable 2:**
   - **Name**: `VITE_SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full anon key)
   - **Environment**: Production, Preview, Development (check all)

6. **Save Variables**: Click "Save" for each variable

**Method B: Vercel CLI**

```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Enter: https://xzbkkledybntzvpfcgeb.supabase.co
# Select: Production, Preview, Development

vercel env add VITE_SUPABASE_ANON_KEY
# Enter: your-full-anon-key-here
# Select: Production, Preview, Development
```

### **Step 3: Redeploy Application**

**Option A: Trigger Redeploy from Vercel Dashboard**
1. **Go to Deployments Tab**: In your Vercel project
2. **Find Latest Deployment**: Should be the most recent one
3. **Click Three Dots (...)**: Next to the deployment
4. **Click "Redeploy"**: This will rebuild with new environment variables

**Option B: Push New Commit to Trigger Redeploy**
```bash
# Make a small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with environment variables"
git push origin main
```

### **Step 4: Verify Fix**

1. **Wait for Deployment**: 2-5 minutes for Vercel to rebuild
2. **Open Your PWA**: Visit your live URL
3. **Check Console**: Should no longer show environment variable errors
4. **Test Functionality**: Verify app works correctly

---

## 🔍 Detailed Troubleshooting

### **Finding Your Supabase Credentials**

**If you don't remember your Supabase project details:**

1. **Check Previous Setup**: Look for any existing `.env.local` file locally
2. **Supabase Dashboard**: Login and check your projects
3. **Email Confirmation**: Check email for Supabase project creation confirmation
4. **Browser History**: Look for supabase.com URLs in browser history

### **Vercel Environment Variables Best Practices**

**Variable Naming:**
- ✅ Use `VITE_` prefix for client-side variables
- ✅ Use descriptive names: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- ❌ Don't use `SUPABASE_SERVICE_ROLE_KEY` in client-side (security risk)

**Environment Selection:**
- ✅ **Production**: For live app users
- ✅ **Preview**: For preview deployments (pull requests)
- ✅ **Development**: For development builds (optional)

**Security:**
- ✅ **Anon Key**: Safe to use in client-side (public)
- ❌ **Service Role Key**: Never use in client-side (admin access)
- ✅ **URL**: Safe to expose (public endpoint)

### **Common Issues and Solutions**

**Issue 1: Variables Not Taking Effect**
- **Solution**: Redeploy after adding variables
- **Reason**: Vercel needs to rebuild with new environment

**Issue 2: Wrong Variable Names**
- **Solution**: Ensure exact names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- **Reason**: Vite requires `VITE_` prefix for client-side variables

**Issue 3: Wrong Environment Selection**
- **Solution**: Select "Production" environment when adding variables
- **Reason**: Production deployments need production environment variables

**Issue 4: Incorrect Supabase URL**
- **Solution**: Use full URL including `https://` and `.supabase.co`
- **Example**: `https://xzbkkledybntzvpfcgeb.supabase.co`

---

## 🛠️ Alternative Solutions

### **Option 1: Hardcode for Quick Fix (Not Recommended)**

**Only use this as a temporary fix:**

```typescript
// In src/services/supabase.ts - TEMPORARY ONLY
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xzbkkledybntzvpfcgeb.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'
```

**⚠️ Warning**: This exposes credentials in code. Use environment variables instead.

### **Option 2: Local Development Fallback**

**Add fallback for development:**

```typescript
// Better approach with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  // Provide helpful error message to users
}
```

---

## 📋 Verification Checklist

After fixing the environment variables:

- [ ] **Vercel Variables Set**: Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] **Environment Selected**: Production environment checked
- [ ] **Deployment Triggered**: New deployment with environment variables
- [ ] **No Console Errors**: Environment variable error gone
- [ ] **App Functionality**: Database features working
- [ ] **PWA Update**: Latest version with fixes working

---

## 🚀 Expected Results

**After Fix:**
- ✅ **No Environment Errors**: Console clean of variable errors
- ✅ **Database Connection**: Supabase features working
- ✅ **PWA Functionality**: All features operational
- ✅ **Performance**: Fast database queries (from our optimizations)
- ✅ **Security**: Secure database functions (from our fixes)

---

## 📞 Support Commands

**Check Environment Variables in Vercel:**
```bash
vercel env ls
```

**Pull Environment Variables Locally:**
```bash
vercel env pull .env.local
```

**Test Local Build:**
```bash
npm run build
npm run preview
```

---

## 🎯 Prevention

**For Future Deployments:**

1. **Always Set Environment Variables**: Before deploying apps with external services
2. **Use .env.example**: Keep template updated with required variables
3. **Document Requirements**: Clear setup instructions
4. **Test Production**: Verify environment variables work in production
5. **Monitor Deployments**: Check for environment-related errors

---

*This issue is common when deploying apps with external services. The fix is straightforward - just add the missing environment variables to Vercel and redeploy.*

**🎉 Once fixed, your PWA will have both the latest updates AND working database connectivity!**
