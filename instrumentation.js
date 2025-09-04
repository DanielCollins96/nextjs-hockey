// Conditionally import Sentry only when not building for Cloudflare
let Sentry;
try {
  if (process.env.BUILD_TARGET !== 'cloudflare') {
    Sentry = require('@sentry/nextjs');
  }
} catch (e) {
  // Sentry not available
  console.warn('Sentry not available:', e.message);
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      // Only import Sentry in Node.js runtime (not in Cloudflare Workers)
      if (process.env.BUILD_TARGET !== 'cloudflare') {
        const { register } = await import('@sentry/nextjs');
        await register();
      }
    } catch (error) {
      console.log('Sentry registration skipped:', error.message);
    }
  }
}

export async function onRequestError(err, request, context) {
  try {
    if (process.env.BUILD_TARGET !== 'cloudflare') {
      const { captureRequestError } = await import('@sentry/nextjs');
      captureRequestError(err, request, context);
    } else {
      // Fallback logging for Cloudflare
      console.error('Request error:', err, { url: request.url });
    }
  } catch (error) {
    console.error('Error in error handler:', error);
  }
}
