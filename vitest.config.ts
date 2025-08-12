import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const dirname =
	typeof __dirname !== 'undefined'
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		globals: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['src/**/*.stories.{ts,tsx}', 'node_modules'],
	},
	resolve: {
		alias: {
			'@': path.resolve(dirname, './src'),
		},
	},
})
