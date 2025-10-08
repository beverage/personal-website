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
		// Use REFERENCE dimensions (1512×884) instead of actual canvas for consistent spawn area
		const REFERENCE_WIDTH = 1512
		const REFERENCE_HEIGHT = 884
		const maxDimension = Math.max(REFERENCE_WIDTH, REFERENCE_HEIGHT)
		const scaleFactor = (maxDimension / 800) * Math.sqrt(2) // Account for diagonal rotation
		const bound = (120000 * scaleFactor) / 2 // Half of the total range

		expect(star.x).toBeGreaterThanOrEqual(-bound)
		expect(star.x).toBeLessThanOrEqual(bound)
		expect(star.y).toBeGreaterThanOrEqual(-bound)
		expect(star.y).toBeLessThanOrEqual(bound)
		expect(star.z).toBeGreaterThanOrEqual(0)
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
		// Verify projection is in expected quadrant (should be offset from center)
		expect(projected.x).toBeGreaterThan(width / 2)
		expect(projected.y).toBeGreaterThan(height / 2)
		expect(projected.visible).toBe(true)

		// Verify projection calculation is reasonable
		expect(projected.x).toBeLessThan(width)
		expect(projected.y).toBeLessThan(height)
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
		// Margin is now Math.max(width, height) * 3.0 = 5760px for larger spawn area
		star.x = (star.z * (width / 2 + 1000)) / 200 // Within generous margin
		star.y = 0
		star.z = 1000
		expect(star.isLikelyVisible()).toBe(true)

		// Star far off screen (well beyond generous 3.0x margin)
		star.x = (star.z * (width / 2 + 6000)) / 200 // Beyond 3.0x screen dimension
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

	describe('intensity configuration', () => {
		it('respects configured intensity range from config', () => {
			// Create multiple stars to test distribution
			const stars = Array.from({ length: 100 }, () => new Star3D(width, height))

			stars.forEach(s => {
				// Current config has min: 0.5, max: 1.0
				expect(s.intensity).toBeGreaterThanOrEqual(0.5)
				expect(s.intensity).toBeLessThanOrEqual(1.0)
			})

			// Check that we get variety (not all the same value)
			const intensities = stars.map(s => s.intensity)
			const uniqueIntensities = new Set(
				intensities.map(i => Math.round(i * 100)),
			)
			expect(uniqueIntensities.size).toBeGreaterThan(10) // Should have variety
		})
	})

	describe('distance-based fade', () => {
		it('applies fade at far distances (40k-50k zone)', () => {
			star.z = 45000 // In fade-in zone
			const projected = star.project(width, height)

			// Opacity should be reduced by fade factor
			// At z=45000, fade = (50000 - 45000) / 10000 = 0.5
			expect(projected.opacity).toBeLessThan(star.intensity)
			expect(projected.opacity).toBeGreaterThan(0)
		})

		it('no fade in mid-range distances', () => {
			star.z = 25000 // Outside fade zones (5k-40k is clear)
			const projected = star.project(width, height)

			// Should have close to full intensity (accounting for near-camera fade cutoff at 5k)
			expect(projected.opacity).toBeCloseTo(star.intensity, 1)
		})

		it('applies near-camera fade (< 5000)', () => {
			star.z = 2500 // In near fade zone
			const projected = star.project(width, height)

			// Opacity should be reduced
			// At z=2500, fade = 2500 / 5000 = 0.5
			expect(projected.opacity).toBeLessThan(star.intensity)
			expect(projected.opacity).toBeGreaterThan(0)
		})
	})
})
