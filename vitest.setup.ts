import '@testing-library/jest-dom'
import * as matchers from '@testing-library/jest-dom/matchers'
import { cleanup } from '@testing-library/react'
import { afterEach, expect } from 'vitest'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
	cleanup()
})

// Minimal matchMedia polyfill for hooks using it
if (typeof window !== 'undefined' && !window.matchMedia) {
	// @ts-expect-error jsdom polyfill
	window.matchMedia = () => ({
		matches: false,
		media: '',
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})
}
