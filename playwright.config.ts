import { defineConfig, devices } from '@playwright/test';

// BASE_URL lets CI run the tests against a preview deploy.
// Without it, the tests build output is served locally with `astro preview`.
const baseURL = process.env.BASE_URL || 'http://localhost:4321';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : { command: 'npx astro preview --port 4321', url: baseURL, reuseExistingServer: true },
});
