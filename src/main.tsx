/**
 * React Application Entry Point
 *
 * This file initializes the React application and mounts it to the DOM.
 * Fully migrated from vanilla JS to React + TypeScript.
 */

import '@radix-ui/themes/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './css/tailwind.css';
import logger from './utils/logger';

// Initialize configuration (must be imported before App)
// This sets up window.appConfig which is needed by PTEVocabularyManager

// Initialize voice selector (legacy, removed)
// import { ttsEngine } from './services/audio/TTSEngine';Selector';

// Mount React app to #root div
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

logger.log('✅ React app mounted successfully');

// Initialize analytics (PostHog) if API key is configured
import { analyticsService } from './services/analytics/analyticsService';
const posthogKey = import.meta.env['VITE_POSTHOG_API_KEY'];
if (posthogKey && posthogKey !== 'phc_your-api-key-here') {
  analyticsService.initialize(posthogKey, {
    api_host: import.meta.env['VITE_POSTHOG_HOST'] || 'https://app.posthog.com',
  });
}

// Register service worker for offline caching and PWA functionality
// Using vite-plugin-pwa for automatic updates
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    logger.log('🔄 New content available, click on reload button to update.');
    if (confirm('🎉 New version available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    logger.log('✅ App ready to work offline');
  },
});

// Export for testing
export { App };
