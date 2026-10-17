import { defineConfig, devices } from '@playwright/test'

/*
 * End-to-end smoke tests against the running dev server and backend.
 *
 *   HRMS_TEST_ID=<employee ID or super-admin email> HRMS_TEST_PASSWORD=<password> npm run test:e2e
 *
 * Uses the Chrome already installed on the machine (channel: 'chrome'), so no browser download.
 * BASE_URL defaults to the Vite dev server; start it with `npm run dev` first.
 * Credentials come from the environment only — never commit them.
 */
export default defineConfig({
    testDir: './e2e',
    outputDir: './e2e/.results',
    timeout: 60_000,
    fullyParallel: false,
    workers: 1,
    reporter: [['list']],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:4500',
        channel: 'chrome',
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } } },
        { name: 'mobile', use: { ...devices['Pixel 7'], channel: 'chrome' } },
    ],
})
