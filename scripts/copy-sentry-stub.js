#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Copy our Sentry stub to the OpenNext directory
const srcPath = path.join(__dirname, '../lib/sentry-cloudflare-stub.js');
const destDir = path.join(__dirname, '../.open-next/server-functions/default/lib');
const destPath = path.join(destDir, 'sentry-cloudflare-stub.js');

// Create directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy the file
fs.copyFileSync(srcPath, destPath);
console.log('Copied Sentry stub to OpenNext bundle');
