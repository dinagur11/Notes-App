import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright-tests',
  timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    headless: true,
    baseURL: 'http://localhost:3000',
  },
});