// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://786c788dc1566c74ea2ab4b08d0128c8@o513474.ingest.us.sentry.io/4509891733159936",

  integrations: [
    Sentry.replayIntegration(),
  ],

  tracesSampleRate: 0,
  enableLogs: false,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});