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
	// jsdom polyfill
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

// Animation frame polyfills for tests
if (typeof global !== 'undefined') {
	// Provide global cancelAnimationFrame for tests
	if (!global.cancelAnimationFrame) {
		global.cancelAnimationFrame = () => {}
	}

	// Ensure requestAnimationFrame exists too
	if (!global.requestAnimationFrame) {
		global.requestAnimationFrame = (cb: FrameRequestCallback) => {
			return setTimeout(() => cb(performance.now()), 16) as unknown as number
		}
	}
}
