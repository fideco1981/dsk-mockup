'use strict';

// Real-browser accessibility scan (issue 015). Run: npm run test:a11y
// One-time setup: npm run test:a11y:setup (= npx playwright install chromium)
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'a11y',
  fullyParallel: true, // one spec file: without this, at most one worker per project
  workers: '100%',
  reporter: 'list',
  use: { browserName: 'chromium', reducedMotion: 'reduce' },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'] } },
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
  ],
});
