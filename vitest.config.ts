import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const dirname =
	typeof __dirname !== 'undefined'
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url))

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	esbuild: {
		jsx: 'automatic',
		jsxImportSource: 'react',
	},
	test: {
		environment: 'jsdom',
		setupFiles: ['./vitest.setup.ts'],
		globals: true,
		include: ['src/**/*.{test,spec}.{ts,tsx}'],
		exclude: ['src/**/*.stories.{ts,tsx}', 'node_modules'],
		coverage: {
			provider: 'v8',
			reportsDirectory: './coverage',
			reporter: ['text', 'lcov', 'json-summary'],
			include: ['src/**/*.{ts,tsx}'],
			exclude: [
				'**/*.stories.*',
				'src/stories/**',
				'.storybook/**',
				'**/*.d.ts',
				'**/*.config.{js,cjs,mjs,ts}',
				'eslint.config.mjs',
				'next.config.ts',
				'postcss.config.mjs',
				'playwright.config.ts',
				'vitest.config.ts',
				'vitest.setup.ts',
				'storybook-static/**',
				'.next/**',
				'src/**/index.ts',
				'src/app/layout.tsx',
				'src/app/page.tsx',
				'src/app/variants/**',
			],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(dirname, './src'),
		},
	},
})
