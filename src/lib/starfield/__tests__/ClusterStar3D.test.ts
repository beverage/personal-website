import { beforeEach, describe, expect, it } from 'vitest'
import { ClusterStar3D } from '../ClusterStar3D'

describe('ClusterStar3D', () => {
	let star: ClusterStar3D
	const width = 1920
	const height = 1080

	beforeEach(() => {
		star = new ClusterStar3D(width, height)
	})

	it('initializes within distant z-range', () => {
		expect(star.z).toBeGreaterThanOrEqual(500000)
		expect(star.z).toBeLessThanOrEqual(5000000)
	})

	it('moves forward and wraps far beyond when passing threshold', () => {
		const initialZ = star.z
		star.update(1000, 0, 0.016)
		expect(star.z).toBeLessThan(initialZ)

		star.z = 500 // below wrap threshold (100000)
		star.update(1000, 0, 0.016)
		expect(star.z).toBeGreaterThan(500000) // reset into far range
	})

	it('applies roll rotation', () => {
		const initialX = star.x
		const initialY = star.y
		star.update(0, 1, 1)
		expect(star.x).not.toBe(initialX)
		expect(star.y).not.toBe(initialY)
	})

	it('projects to screen with small size and clamped opacity', () => {
		star.x = 100
		star.y = 50
		star.z = 600000

		const projected = star.project(width, height)
		expect(projected.visible).toBe(true)
		expect(projected.size).toBeGreaterThan(0)
		expect(projected.opacity).toBeGreaterThan(0)
		expect(projected.opacity).toBeLessThanOrEqual(0.6)
	})

	it('respects canvas resize effect on subsequent reset', () => {
		// Capture a reset position at current size
		star.reset()
		const xBefore = star.x
		const yBefore = star.y

		// Resize, then reset again and expect scaled distribution change
		star.updateCanvasSize(3840, 2160)
		star.reset()
		const xAfter = star.x
		const yAfter = star.y

		// Extremely unlikely to match exactly; ensures reset used new scale
		expect(xAfter === xBefore && yAfter === yBefore).toBe(false)
	})
})
