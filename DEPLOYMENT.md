# Cloudflare Pages Deployment Guide

This guide documents the setup for deploying the Next.js Hockey app to Cloudflare Workers using OpenNext.

## Problem Statement

The original deployment was failing because:
1. Cloudflare Pages deprecated support for `next export`
2. The app requires server-side functionality (API routes, database queries)
3. Build was failing due to database connection issues during static generation

## Solution Implemented

### 1. Upgraded Next.js
- Upgraded from Next.js 13.5.9 to 14.2.32 (required for OpenNext compatibility)

### 2. Fixed Build Issues
- Added error handling to all `getStaticProps` functions to handle database connection failures gracefully
- Changed `getStaticPaths` fallback from `false` to `'blocking'` for database-dependent dynamic pages
- This allows pages to be generated on-demand when the database is available

### 3. Installed OpenNext for Cloudflare
```bash
npm install --save-dev @opennextjs/cloudflare wrangler
```

### 4. Configuration Files

#### wrangler.toml
```toml
name = "nextjs-hockey"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[build]
command = "npx @opennextjs/cloudflare@latest build"

[[assets]]
bucket = ".open-next/static"
binding = "ASSETS"
```

#### open-next.config.ts
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare/config";

export default defineCloudflareConfig({
  // Minimal configuration to handle build issues
});
```

### 5. Package.json Scripts
Added new scripts for Cloudflare deployment:
```json
{
  "scripts": {
    "build:cloudflare": "npx @opennextjs/cloudflare@latest build",
    "deploy": "npx wrangler deploy"
  }
}
```

## Current Status

✅ **Next.js build succeeds** - App builds without errors
✅ **Static generation works** - Pages with error handling build successfully  
✅ **Dynamic pages use ISR** - Database-dependent pages use Incremental Static Regeneration
✅ **OpenNext setup complete** - Configuration files and dependencies installed

## Known Issues

The OpenNext build process encounters bundling issues with:
- Sentry dependencies (@sentry/nextjs)
- PostgreSQL dependencies (pg, pg-pool, pg-cloudflare)

These dependencies are not compatible with the Cloudflare Workers edge runtime.

## Deployment Instructions

1. **Standard Next.js build (works):**
   ```bash
   npm run build
   ```

2. **OpenNext Cloudflare build (in progress):**
   ```bash
   npm run build:cloudflare
   ```

3. **Deploy to Cloudflare (when build works):**
   ```bash
   npm run deploy
   ```

## Alternative Approaches

If OpenNext continues to have issues, consider:

1. **Use Cloudflare Pages Functions** instead of Workers
2. **Remove problematic dependencies** for edge compatibility
3. **Use environment-specific builds** with different configurations for different deployment targets
4. **Deploy to Vercel** which has better Next.js compatibility

## Files Modified

- `package.json` - Updated Next.js version and added scripts
- `pages/drafts/[id].js` - Added error handling and fallback: 'blocking'
- `pages/teams/[id].js` - Added error handling and fallback: 'blocking'  
- `pages/drafts/index.js` - Added error handling for getStaticProps
- `pages/players/index.js` - Added error handling for getStaticProps
- `pages/teams/index.js` - Added error handling for getStaticProps
- `.gitignore` - Added .open-next/ to ignore build artifacts

## Files Added

- `wrangler.toml` - Cloudflare Workers configuration
- `open-next.config.ts` - OpenNext configuration