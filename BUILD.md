# Daily Focus Coach - Build Documentation

This document provides comprehensive instructions for building, deploying, and maintaining the Daily Focus Coach application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Build Process](#build-process)
4. [Deployment](#deployment)
5. [Environment Configuration](#environment-configuration)
6. [Performance Optimization](#performance-optimization)
7. [Troubleshooting](#troubleshooting)
8. [CI/CD Pipeline](#cicd-pipeline)

## Prerequisites

### System Requirements

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **Modern Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Development Tools (Recommended)

- **VS Code**: With TypeScript and Tailwind CSS extensions
- **React Developer Tools**: Browser extension for debugging
- **OpenAI API Key**: For AI functionality (optional for development)

### Verify Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Git version
git --version
```

## Development Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd daily-focus-coach

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### 2. Start Development Server

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173 (or next available port)
```

### 3. Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Build Process

### Development Build

The development build includes:
- Hot module replacement (HMR)
- Source maps for debugging
- Unminified code for readability
- Development-only warnings and checks

```bash
npm run dev
```

### Production Build

The production build optimizes for:
- Minified and compressed code
- Tree shaking to remove unused code
- Asset optimization and compression
- Code splitting for better loading performance

```bash
# Create production build
npm run build

# Output will be in the 'dist' directory
ls -la dist/
```

### Build Output Structure

```
dist/
├── index.html              # Main HTML file
├── assets/
│   ├── index-[hash].js     # Main JavaScript bundle
│   ├── index-[hash].css    # Compiled CSS
│   └── [other-assets]      # Images, fonts, etc.
├── manifest.json           # PWA manifest
└── vite.svg               # Default favicon
```

### Build Analysis

```bash
# Analyze bundle size
npm run build -- --analyze

# Preview the production build locally
npm run preview
```

## Deployment

### Static Hosting Platforms

#### Vercel (Recommended)

1. **Connect Repository**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Automatic Deployment**:
   - Connect GitHub repository to Vercel
   - Automatic deployments on push to main branch
   - Preview deployments for pull requests

3. **Environment Variables**:
   ```bash
   # Set environment variables in Vercel dashboard
   VITE_APP_NAME=Daily Focus Coach
   VITE_APP_VERSION=1.0.0
   ```

#### Netlify

1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

2. **Deploy via CLI**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Build and deploy
   npm run build
   netlify deploy --prod --dir=dist
   ```

#### GitHub Pages

1. **Setup GitHub Actions**:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: 18
             cache: 'npm'
         - run: npm ci
         - run: npm run build
         - uses: actions/deploy-pages@v1
           with:
             artifact_name: github-pages
             path: dist
   ```

### Self-Hosted Deployment

#### Docker Deployment

1. **Create Dockerfile**:
   ```dockerfile
   # Dockerfile
   FROM node:18-alpine AS builder
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and Run**:
   ```bash
   # Build Docker image
   docker build -t daily-focus-coach .
   
   # Run container
   docker run -p 80:80 daily-focus-coach
   ```

#### Traditional Server

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Upload dist folder** to your web server

3. **Configure web server** (Apache/Nginx) for SPA routing:
   ```nginx
   # nginx.conf
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

## Environment Configuration

### Environment Variables

Create `.env` files for different environments:

#### `.env.development`
```bash
VITE_APP_NAME=Daily Focus Coach (Dev)
VITE_API_URL=http://localhost:3000
VITE_DEBUG=true
```

#### `.env.production`
```bash
VITE_APP_NAME=Daily Focus Coach
VITE_API_URL=https://api.dailyfocuscoach.com
VITE_DEBUG=false
```

#### `.env.local` (Git ignored)
```bash
VITE_OPENAI_API_KEY=your-api-key-here
```

### Build-time Configuration

Modify `vite.config.ts` for build customization:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Customize build output
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Optimize chunks
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react']
        }
      }
    },
    
    // Source maps for production debugging
    sourcemap: true,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    open: true
  },
  
  // Preview server configuration
  preview: {
    port: 4173,
    host: true
  }
})
```

## Performance Optimization

### Bundle Size Optimization

1. **Analyze Bundle**:
   ```bash
   npm install -D rollup-plugin-visualizer
   npm run build
   npx vite-bundle-analyzer
   ```

2. **Code Splitting**:
   ```typescript
   // Lazy load components
   const Settings = lazy(() => import('./components/Settings'))
   const Dashboard = lazy(() => import('./components/Dashboard'))
   ```

3. **Tree Shaking**:
   ```typescript
   // Import only what you need
   import { useState, useEffect } from 'react'
   import { CheckCircle2 } from 'lucide-react'
   ```

### Runtime Performance

1. **React Optimization**:
   ```typescript
   // Use React.memo for expensive components
   const ExpensiveComponent = React.memo(({ data }) => {
     return <div>{/* expensive rendering */}</div>
   })
   
   // Use useMemo for expensive calculations
   const expensiveValue = useMemo(() => {
     return heavyCalculation(data)
   }, [data])
   ```

2. **Image Optimization**:
   ```bash
   # Install image optimization plugin
   npm install -D vite-plugin-imagemin
   ```

### Caching Strategy

1. **Service Worker** (for PWA):
   ```javascript
   // public/sw.js
   const CACHE_NAME = 'daily-focus-coach-v1'
   const urlsToCache = [
     '/',
     '/static/js/bundle.js',
     '/static/css/main.css'
   ]
   
   self.addEventListener('install', event => {
     event.waitUntil(
       caches.open(CACHE_NAME)
         .then(cache => cache.addAll(urlsToCache))
     )
   })
   ```

## Troubleshooting

### Common Build Issues

#### 1. TypeScript Errors

```bash
# Check for type errors
npx tsc --noEmit

# Common fixes:
# - Update @types packages
# - Check tsconfig.json configuration
# - Verify import paths
```

#### 2. Tailwind CSS Not Working

```bash
# Verify Tailwind configuration
npx tailwindcss -i ./src/index.css -o ./dist/output.css --watch

# Check:
# - tailwind.config.js content paths
# - PostCSS configuration
# - CSS import order
```

#### 3. Build Size Too Large

```bash
# Analyze bundle
npm run build -- --analyze

# Solutions:
# - Enable tree shaking
# - Use dynamic imports
# - Remove unused dependencies
```

#### 4. Memory Issues During Build

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

### Development Issues

#### 1. Hot Reload Not Working

```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

#### 2. Port Already in Use

```bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Production Issues

#### 1. Routing Issues (404 on Refresh)

Configure server for SPA routing:
```nginx
# Nginx
try_files $uri $uri/ /index.html;
```

```apache
# Apache (.htaccess)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

#### 2. CORS Issues

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
```

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 18
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Type checking
      run: npx tsc --noEmit
    
    - name: Build application
      run: npm run build
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: dist/

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: dist/
    
    - name: Deploy to production
      run: |
        # Add your deployment script here
        echo "Deploying to production..."
```

### Quality Gates

```yaml
# Add to CI pipeline
- name: Bundle size check
  run: |
    npm run build
    SIZE=$(du -sk dist | cut -f1)
    if [ $SIZE -gt 1000 ]; then
      echo "Bundle size too large: ${SIZE}KB"
      exit 1
    fi

- name: Lighthouse CI
  run: |
    npm install -g @lhci/cli
    lhci autorun
```

## Monitoring and Analytics

### Build Monitoring

1. **Bundle Analysis**:
   ```bash
   # Generate bundle report
   npm run build -- --analyze
   
   # Monitor bundle size over time
   echo "$(date): $(du -sk dist | cut -f1)KB" >> build-size.log
   ```

2. **Performance Metrics**:
   ```javascript
   // Add to index.html
   <script>
     window.addEventListener('load', () => {
       const perfData = performance.getEntriesByType('navigation')[0]
       console.log('Load time:', perfData.loadEventEnd - perfData.fetchStart)
     })
   </script>
   ```

### Error Tracking

```typescript
// Add error boundary and reporting
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    // Log to monitoring service
    console.error('Application error:', error, errorInfo)
  }
}
```

## Security Considerations

### Build Security

1. **Dependency Scanning**:
   ```bash
   # Audit dependencies
   npm audit
   
   # Fix vulnerabilities
   npm audit fix
   ```

2. **Environment Variables**:
   ```bash
   # Never commit sensitive data
   echo ".env.local" >> .gitignore
   
   # Use VITE_ prefix for client-side variables only
   VITE_PUBLIC_API_URL=https://api.example.com
   ```

3. **Content Security Policy**:
   ```html
   <!-- Add to index.html -->
   <meta http-equiv="Content-Security-Policy" 
         content="default-src 'self'; script-src 'self' 'unsafe-inline';">
   ```

## Maintenance

### Regular Updates

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Update major versions carefully
npm install package@latest
```

### Backup Strategy

```bash
# Backup build configuration
tar -czf config-backup.tar.gz \
  package.json \
  package-lock.json \
  vite.config.ts \
  tsconfig.json \
  tailwind.config.js \
  postcss.config.js
```

---

This build documentation provides comprehensive guidance for developing, building, and deploying the Daily Focus Coach application. For additional support, refer to the main README.md or create an issue in the project repository.
