// Empty Sentry stub for Cloudflare builds
// This file provides no-op implementations of Sentry functions

const noop = () => {};
const noopWithReturn = (value) => value;

module.exports = {
  // Core Sentry functions
  init: noop,
  captureException: noop,
  captureMessage: noop,
  captureEvent: noop,
  addBreadcrumb: noop,
  withScope: (callback) => callback({}),
  configureScope: noop,
  setUser: noop,
  setTag: noop,
  setTags: noop,
  setContext: noop,
  setLevel: noop,
  
  // Next.js specific wrappers
  wrapApiHandlerWithSentry: noopWithReturn,
  wrapPageComponentWithSentry: noopWithReturn,
  wrapDocumentGetInitialPropsWithSentry: noopWithReturn,
  wrapAppGetInitialPropsWithSentry: noopWithReturn,
  wrapErrorGetInitialPropsWithSentry: noopWithReturn,
  wrapGetInitialPropsWithSentry: noopWithReturn,
  wrapGetServerSidePropsWithSentry: noopWithReturn,
  wrapGetStaticPropsWithSentry: noopWithReturn,
  
  // Tracing
  startTransaction: () => ({ finish: noop, setStatus: noop, setTag: noop }),
  trace: (name, callback) => callback(),
  
  // Error boundary
  ErrorBoundary: ({ children }) => children,
  withErrorBoundary: noopWithReturn,
  
  // Default export
  default: {
    init: noop,
    captureException: noop,
    captureMessage: noop,
  }
};
