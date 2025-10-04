import { beforeEach, describe, expect, it } from 'vitest'
import { Star3D } from '../Star3D'

describe('Star3D', () => {
	let star: Star3D
	const width = 1920
	const height = 1080

	beforeEach(() => {
		star = new Star3D(width, height)
	})

	it('initializes with random position within bounds', () => {
		const maxDimension = Math.max(width, height)
		const scaleFactor = (maxDimension / 800) * Math.sqrt(2) // Account for diagonal rotation
		const bound = (120000 * scaleFactor) / 2 // Half of the total range

		expect(star.x).toBeGreaterThanOrEqual(-bound)
		expect(star.x).toBeLessThanOrEqual(bound)
		expect(star.y).toBeGreaterThanOrEqual(-bound)
		expect(star.y).toBeLessThanOrEqual(bound)
		expect(star.z).toBeGreaterThanOrEqual(10000)
		expect(star.z).toBeLessThanOrEqual(50000)
	})

	it('moves star towards viewer on update', () => {
		const initialZ = star.z
		star.update(1000, 0, 0.016) // 60fps frame
		expect(star.z).toBeLessThan(initialZ)
	})

	it('resets star when it passes through viewer', () => {
		star.z = 40 // Behind viewer (below wrap threshold of 50)
		star.update(1000, 0, 0.016)
		expect(star.z).toBeGreaterThan(50000) // Should be reset to far distance
	})

	it('projects star to screen coordinates correctly', () => {
		star.x = 100
		star.y = 50
		star.z = 500

		const projected = star.project(width, height)

		// Using focal length of 200 (default in the implementation)
		expect(projected.x).toBeCloseTo(width / 2 + (100 * 200) / 500)
		expect(projected.y).toBeCloseTo(height / 2 + (50 * 200) / 500)
		expect(projected.visible).toBe(true)
	})

	it('marks star as invisible when off-screen', () => {
		star.x = 10000 // Way off screen
		star.z = 100

		const projected = star.project(width, height)
		expect(projected.visible).toBe(false)
	})

	it('applies roll rotation over time', () => {
		const initialX = star.x
		const initialY = star.y

		star.update(0, 1, 1) // 1 radian per second for 1 second

		// Position should have changed due to rotation
		expect(star.x).not.toBe(initialX)
		expect(star.y).not.toBe(initialY)
	})

	// New tests for visibility culling
	it('correctly identifies likely visible stars using current position', () => {
		// Star near center of screen
		star.x = 0
		star.y = 0
		star.z = 1000
		expect(star.isLikelyVisible()).toBe(true)

		// Star just off screen edge (should still be visible with generous margin)
		// Margin is now Math.max(width, height) * 1.5 = 2880px for course change transitions
		star.x = (star.z * (width / 2 + 1000)) / 200 // Within generous margin
		star.y = 0
		star.z = 1000
		expect(star.isLikelyVisible()).toBe(true)

		// Star far off screen (well beyond generous 1.5x margin)
		star.x = (star.z * (width / 2 + 3000)) / 200 // Beyond 1.5x screen dimension
		star.y = 0
		star.z = 1000
		expect(star.isLikelyVisible()).toBe(false)

		// Star behind viewer
		star.x = 0
		star.y = 0
		star.z = -100
		expect(star.isLikelyVisible()).toBe(false)
	})

	it('moves star forward with minimal update', () => {
		const initialZ = star.z
		const initialX = star.x
		const initialY = star.y

		star.updateMinimal(1000, 0.016) // 60fps frame

		// Should move forward
		expect(star.z).toBeLessThan(initialZ)

		// Should NOT rotate (x,y should be unchanged)
		expect(star.x).toBe(initialX)
		expect(star.y).toBe(initialY)
	})

	it('resets star when it passes through viewer with minimal update', () => {
		star.z = 40 // Behind viewer (below wrap threshold of 50)
		star.updateMinimal(1000, 0.016)
		expect(star.z).toBeGreaterThan(50000) // Should be reset to far distance
	})
})
