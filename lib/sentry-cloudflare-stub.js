/**
 * Cloudflare Workers compatible Sentry stub
 * Provides the same API as @sentry/nextjs but works in the Workers environment
 * You can enhance this to integrate with Cloudflare's analytics or logging
 */

// Mock Sentry functions that maintain the same API
const mockSentry = {
  captureException: (error, context) => {
    // Log to console for now, you could integrate with Cloudflare Analytics
    console.error('Sentry (Cloudflare):', error, context);
    
    // In production, you could send to Cloudflare Analytics API
    // or another logging service compatible with Workers
    return 'mock-event-id';
  },
  
  captureMessage: (message, level = 'info') => {
    console.log(`Sentry (Cloudflare) [${level}]:`, message);
    return 'mock-event-id';
  },
  
  addBreadcrumb: (breadcrumb) => {
    // Store breadcrumbs in memory or send to logging service
    console.log('Sentry breadcrumb:', breadcrumb);
  },
  
  setUser: (user) => {
    console.log('Sentry user set:', user);
  },
  
  setTag: (key, value) => {
    console.log(`Sentry tag ${key}:`, value);
  },
  
  setContext: (key, context) => {
    console.log(`Sentry context ${key}:`, context);
  },
  
  withScope: (callback) => {
    // Create a mock scope
    const mockScope = {
      setUser: mockSentry.setUser,
      setTag: mockSentry.setTag,
      setContext: mockSentry.setContext,
      addBreadcrumb: mockSentry.addBreadcrumb,
    };
    callback(mockScope);
  },
  
  init: (options) => {
    console.log('Sentry initialized for Cloudflare Workers:', options?.dsn ? 'with DSN' : 'without DSN');
  },
  
  // Error boundary components
  ErrorBoundary: ({ children, fallback }) => {
    // Simple error boundary for Cloudflare
    return children;
  },
  
  withErrorBoundary: (component, options) => {
    return component;
  },
  
  // Next.js specific functions
  withSentryConfig: (config, sentryOptions) => {
    return config; // Return unchanged for Cloudflare
  },
};

// Export all the functions that @sentry/nextjs typically exports
module.exports = mockSentry;

// Also export as default for ES6 imports
module.exports.default = mockSentry;

// Export individual functions for named imports
Object.keys(mockSentry).forEach(key => {
  module.exports[key] = mockSentry[key];
});
