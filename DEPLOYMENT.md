# Daily Focus Coach - Deployment Guide

## 🌐 Live Production Deployment

**Current Live App**: https://daily-project-coach.vercel.app
- **Platform**: Vercel
- **Status**: ✅ Live and fully functional
- **Last Updated**: January 1, 2025
- **Auto-Deploy**: Enabled on GitHub pushes to main branch

This guide provides step-by-step instructions for deploying the Daily Focus Coach application to various hosting platforms.

## Quick Deployment Options

### 1. Vercel (Recommended)

**One-Click Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/daily-focus-coach)

**Manual Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

**Configuration:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Development Command: `npm run dev`

### 2. Netlify

**One-Click Deploy:**
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/daily-focus-coach)

**Manual Deployment:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

### 3. GitHub Pages

**Setup GitHub Actions:**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        
      - name: Setup Pages
        uses: actions/configure-pages@v4
        
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Configure Repository:**
1. Go to Settings > Pages
2. Select "GitHub Actions" as source
3. Push to main branch to trigger deployment

## Environment-Specific Deployments

### Development Environment

```bash
# Start development server
npm run dev

# Available at http://localhost:5173
```

### Staging Environment

```bash
# Build for staging
npm run build

# Preview staging build
npm run preview

# Deploy to staging (example with Vercel)
vercel --target staging
```

### Production Environment

```bash
# Build for production
NODE_ENV=production npm run build

# Deploy to production
vercel --prod
```

## Custom Domain Setup

### Vercel Custom Domain

1. **Add Domain in Vercel Dashboard:**
   - Go to Project Settings > Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

### Netlify Custom Domain

1. **Add Domain in Netlify:**
   - Go to Site Settings > Domain Management
   - Add custom domain
   - Configure DNS

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: your-site-name.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5
   ```

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)

Most platforms provide automatic SSL:
- **Vercel**: Automatic SSL with Let's Encrypt
- **Netlify**: Automatic SSL with Let's Encrypt
- **GitHub Pages**: Automatic SSL for github.io domains

### Custom SSL Certificate

For custom domains, upload your SSL certificate in the platform's dashboard.

## Environment Variables

### Production Environment Variables

```bash
# Vercel
vercel env add VITE_APP_NAME production
vercel env add VITE_API_URL production

# Netlify
netlify env:set VITE_APP_NAME "Daily Focus Coach"
netlify env:set VITE_API_URL "https://api.dailyfocuscoach.com"
```

### Required Environment Variables

```bash
# Supabase Configuration (REQUIRED for authentication and cloud sync)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Application Configuration
VITE_APP_NAME=Daily Focus Coach
VITE_APP_VERSION=1.0.0

# API Configuration (if using external APIs)
VITE_API_URL=https://api.dailyfocuscoach.com

# Analytics (optional)
VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
```

### Vercel Environment Variables Setup

**For your current deployment, add these to Vercel:**

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables
2. **Add the following variables:**

```bash
VITE_SUPABASE_URL=https://xzbkkledybntzvpfcgeb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmtrbGVkeWJudHp2cGZjZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzQ0NzIsImV4cCI6MjA2OTY1MDQ3Mn0._BSFXJAGtX0yfKFtjVBY28uqK_VyuA6n5_JVbaxYxfQ
```

3. **Set Environment** to "Production, Preview, and Development"
4. **Click "Save"**

**Via Vercel CLI:**
```bash
# Add Supabase environment variables
vercel env add VITE_SUPABASE_URL production
# Paste: https://xzbkkledybntzvpfcgeb.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh6YmtrbGVkeWJudHp2cGZjZ2ViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzQ0NzIsImV4cCI6MjA2OTY1MDQ3Mn0._BSFXJAGtX0yfKFtjVBY28uqK_VyuA6n5_JVbaxYxfQ
```

## Performance Optimization for Production

### Build Optimization

```bash
# Optimize build for production
npm run build

# Analyze bundle size
npm run build -- --analyze
```

### CDN Configuration

**Vercel Edge Network:**
- Automatic global CDN
- Edge caching for static assets
- Automatic compression

**Netlify CDN:**
- Global CDN with edge locations
- Asset optimization
- Automatic image optimization

### Caching Headers

Configure caching in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## Monitoring and Analytics

### Performance Monitoring

**Vercel Analytics:**
```json
// vercel.json
{
  "analytics": {
    "enable": true
  }
}
```

**Google Analytics:**
```html
<!-- Add to index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Error Tracking

**Sentry Integration:**
```bash
npm install @sentry/react @sentry/tracing
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: import.meta.env.MODE,
});
```

## Rollback Strategy

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Netlify Rollback

1. Go to Netlify Dashboard
2. Select Site > Deploys
3. Click "Publish deploy" on previous version

### GitHub Pages Rollback

```bash
# Revert to previous commit
git revert HEAD

# Push to trigger new deployment
git push origin main
```

## Backup and Recovery

### Database Backup (if applicable)

```bash
# Export local storage data
npm run export-data

# Backup to cloud storage
aws s3 cp backup.json s3://your-backup-bucket/
```

### Configuration Backup

```bash
# Backup deployment configuration
tar -czf deployment-config.tar.gz \
  vercel.json \
  netlify.toml \
  .github/workflows/ \
  package.json
```

## Security Considerations

### Content Security Policy

```html
<!-- Add to index.html -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
               font-src 'self' https://fonts.gstatic.com;
               img-src 'self' data: https:;
               connect-src 'self' https://api.openai.com;">
```

### Environment Security

```bash
# Never commit sensitive data
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore

# Use platform-specific secret management
# Vercel: Environment Variables in dashboard
# Netlify: Environment Variables in site settings
```

## Troubleshooting Deployment Issues

### Common Issues

**1. Build Failures:**
```bash
# Check build logs
npm run build

# Common fixes:
# - Update Node.js version
# - Clear node_modules and reinstall
# - Check for TypeScript errors
```

**2. Routing Issues:**
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

```toml
# netlify.toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**3. Environment Variable Issues:**
```bash
# Verify environment variables
echo $VITE_APP_NAME

# Check if variables are prefixed with VITE_
# Only VITE_ prefixed variables are available in client
```

**4. Performance Issues:**
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for large dependencies
npm ls --depth=0 --long
```

### Debug Deployment

**Vercel Debug:**
```bash
# Enable debug mode
vercel --debug

# Check function logs
vercel logs
```

**Netlify Debug:**
```bash
# Check build logs
netlify logs

# Test locally
netlify dev
```

## Deployment Checklist

### Pre-Deployment

- [ ] Run tests: `npm test`
- [ ] Check TypeScript: `npx tsc --noEmit`
- [ ] Run linting: `npm run lint`
- [ ] Build successfully: `npm run build`
- [ ] Test production build: `npm run preview`
- [ ] Update version in package.json
- [ ] Update CHANGELOG.md

### Post-Deployment

- [ ] Verify application loads correctly
- [ ] Test core functionality
- [ ] Check performance metrics
- [ ] Verify analytics tracking
- [ ] Test on mobile devices
- [ ] Check error monitoring
- [ ] Update documentation

### Production Checklist

- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Environment variables set
- [ ] Analytics configured
- [ ] Error tracking enabled
- [ ] Performance monitoring active
- [ ] Backup strategy in place
- [ ] Rollback plan documented

---

This deployment guide covers the most common deployment scenarios for the Daily Focus Coach application. For platform-specific issues, refer to the respective platform documentation.
