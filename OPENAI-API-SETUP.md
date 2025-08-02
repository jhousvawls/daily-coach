# OpenAI API Key Setup Guide

This guide explains how to set up the OpenAI API key for the Daily Focus Coach app to enable AI-generated quotes and focus synthesis.

## 🎯 Overview

The app supports two ways to provide an OpenAI API key:

1. **Shared API Key (Recommended)** - Set as environment variable for all users
2. **User API Key** - Individual users can enter their own API key in Settings

## 🔧 Option 1: Shared API Key (Recommended)

### For Vercel Deployment

1. **Get OpenAI API Key**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Set Environment Variable in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add new variable:
     - **Name**: `VITE_OPENAI_API_KEY`
     - **Value**: Your OpenAI API key (sk-...)
     - **Environment**: Production, Preview, Development

3. **Redeploy**
   - Trigger a new deployment for the environment variable to take effect
   - The app will automatically use this key for all users

### For Local Development

1. **Create `.env.local` file**
   ```bash
   # In the daily-focus-coach directory
   touch .env.local
   ```

2. **Add API Key**
   ```env
   VITE_OPENAI_API_KEY=sk-your-openai-api-key-here
   ```

3. **Restart Development Server**
   ```bash
   npm run dev
   ```

## 🔧 Option 2: User API Keys

If no environment variable is set, users can:

1. Click the Settings gear icon
2. Enter their OpenAI API key in the "OpenAI API Key" field
3. Save settings

## ✅ How It Works

### Priority Order
1. **Environment Variable** (`VITE_OPENAI_API_KEY`) - Used first if available
2. **User API Key** - Used if no environment variable is set
3. **Fallback Quotes** - Static quotes if no API key is available

### Features Enabled with API Key
- **Daily Inspirational Quotes** - AI-generated quotes on app load
- **Quote Refresh** - Generate new quotes with different moods
- **Focus Synthesis** - AI-powered brain dump to focus conversion

### Debugging
The app logs detailed information to the browser console:
- API key availability (environment vs user)
- Quote generation attempts
- Success/failure states
- Fallback behavior

## 🚀 Benefits of Shared API Key

### ✅ Immediate Functionality
- Quotes work right when users open the app
- No setup required for users
- Better first-time user experience

### ✅ Cost Control
- You control API usage and costs
- Can set usage limits on OpenAI dashboard
- Monitor usage across all users

### ✅ Security
- API key not stored in user's browser
- Centralized key management
- Can rotate keys without affecting users

## 📊 Usage Monitoring

### OpenAI Dashboard
- Monitor API usage at [OpenAI Usage](https://platform.openai.com/usage)
- Set usage limits to control costs
- View request patterns and costs

### Expected Usage
- **Daily Quotes**: ~1 request per user per day
- **Quote Refresh**: ~1-5 requests per user per day
- **Focus Synthesis**: Variable based on user activity

## 🔒 Security Best Practices

### Environment Variables
- Never commit API keys to version control
- Use different keys for development/production
- Rotate keys periodically

### Usage Limits
- Set monthly usage limits on OpenAI dashboard
- Monitor for unusual usage patterns
- Consider rate limiting if needed

## 🐛 Troubleshooting

### Quotes Not Loading
1. Check browser console for error messages
2. Verify environment variable is set correctly
3. Ensure API key is valid and has credits
4. Check OpenAI API status

### Environment Variable Not Working
1. Ensure variable name is exactly `VITE_OPENAI_API_KEY`
2. Redeploy after setting environment variable
3. Check Vercel environment variable settings
4. Verify the key starts with `sk-`

### API Errors
- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **402 Payment Required**: No credits remaining

## 📝 Example Environment Variable

```env
# .env.local (for local development)
VITE_OPENAI_API_KEY=sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz

# Vercel Environment Variables
# Name: VITE_OPENAI_API_KEY
# Value: sk-proj-abcd1234efgh5678ijkl9012mnop3456qrst7890uvwx1234yz
```

## 🎉 Result

Once set up correctly:
- Users see AI-generated quotes immediately
- Quote refresh functionality works
- Focus synthesis from brain dumps works
- No user setup required
- Professional, seamless experience

The app will automatically detect the environment variable and use it for all AI features, providing a smooth experience for all users!
