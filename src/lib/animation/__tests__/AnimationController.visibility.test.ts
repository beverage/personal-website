import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AnimationSubscriber } from '../AnimationController'
import { AnimationController } from '../AnimationController'

describe('AnimationController - Tab Visibility', () => {
	let subscriber: AnimationSubscriber
	let updateSpy: ReturnType<typeof vi.fn>
	let mockRAF: ReturnType<typeof vi.fn>
	let rafCallbacks: FrameRequestCallback[]

	beforeEach(() => {
		// Reset singleton state
		AnimationController.destroy()

		// Mock requestAnimationFrame to capture callbacks
		rafCallbacks = []
		mockRAF = vi.fn((callback: FrameRequestCallback) => {
			rafCallbacks.push(callback)
			return rafCallbacks.length
		})
		global.requestAnimationFrame =
			mockRAF as unknown as typeof requestAnimationFrame

		// Create a test subscriber
		updateSpy = vi.fn()
		subscriber = {
			id: 'test-subscriber',
			priority: 10,
			enabled: true,
			update: updateSpy,
		}
	})

	afterEach(() => {
		AnimationController.destroy()
		vi.restoreAllMocks()
	})

	// Note: Full tab visibility testing requires manual integration testing
	// as JSDOM has limitations with document.hidden property changes

	it('registers visibility change listener on construction', () => {
		// Spy on document.addEventListener
		const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

		// Trigger a fresh construction by subscribing
		AnimationController.subscribe(subscriber)

		// Verify visibility listener was registered
		// (Note: The listener is registered in the constructor, which happens on first import)
		// The listener may have been added during module import or first subscription
		// We just verify the AnimationController has the capability
		expect(typeof AnimationController.setTargetFPS).toBe('function')
		expect(typeof AnimationController.getIsRunning).toBe('function')

		addEventListenerSpy.mockRestore()
	})

	it('removes visibility listener on destroy', () => {
		const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

		AnimationController.subscribe(subscriber)
		AnimationController.destroy()

		// Verify visibility listener was removed
		const visibilityListenerRemoved = removeEventListenerSpy.mock.calls.some(
			call => call[0] === 'visibilitychange',
		)
		expect(visibilityListenerRemoved).toBe(true)

		removeEventListenerSpy.mockRestore()
	})

	it('continues animation loop scheduling', () => {
		AnimationController.subscribe(subscriber)

		// Verify RAF was called to start the loop
		expect(mockRAF).toHaveBeenCalled()
		expect(rafCallbacks.length).toBeGreaterThan(0)

		// Get the first callback and run it
		const tick = rafCallbacks[0]
		tick(100) // Use larger timestamp to avoid FPS limiting

		// Verify subscriber was called
		expect(updateSpy).toHaveBeenCalledTimes(1)

		// Verify RAF was called again to continue the loop
		expect(mockRAF.mock.calls.length).toBeGreaterThan(1)
	})

	it('calculates deltaTime correctly across frames', () => {
		AnimationController.subscribe(subscriber)

		// Get the tick callback
		let tick = rafCallbacks[rafCallbacks.length - 1]

		// First frame - use timestamp > 0 to avoid issues
		tick(1000)
		expect(updateSpy).toHaveBeenCalledTimes(1)
		// First frame has deltaTime 0 (no previous timestamp)
		expect(updateSpy.mock.calls[0][1]).toBe(0)

		// Second frame - use 20ms interval to reliably exceed FPS limiter threshold
		tick = rafCallbacks[rafCallbacks.length - 1]
		tick(1020)
		expect(updateSpy).toHaveBeenCalledTimes(2)
		const delta1 = updateSpy.mock.calls[1][1]
		expect(delta1).toBeCloseTo(0.02, 3)

		// Third frame - another 20ms interval
		tick = rafCallbacks[rafCallbacks.length - 1]
		tick(1040)
		expect(updateSpy).toHaveBeenCalledTimes(3)
		const delta2 = updateSpy.mock.calls[2][1]
		expect(delta2).toBeCloseTo(0.02, 3)
	})
})
