import { defineConfig } from '@playwright/test'

export default defineConfig({
	testDir: './tests/e2e',
	testMatch: '**/*.spec.ts',
	/* Only run E2E files under tests/e2e so unit tests in src/** are ignored */
	reporter: [['html', { open: 'never' }]],
	use: {
		baseURL: process.env.BASE_URL || 'http://localhost:3000',
		trace: 'on-first-retry',
		screenshot: 'only-on-failure',
		video: 'retain-on-failure',
	},
	/* In CI, fail on test.only */
	forbidOnly: !!process.env.CI,
})
