import { beforeEach, describe, expect, it } from 'vitest'
import { CenterClusterStar3D } from '../ClusterStar3D'

describe('CenterClusterStar3D', () => {
	let star: CenterClusterStar3D
	const width = 1920
	const height = 1080

	beforeEach(() => {
		star = new CenterClusterStar3D(
			width,
			height,
			30000,
			30000,
			{ min: 300000, max: 3000000 },
			0.3,
			2.0,
			1.5,
		)
	})

	it('initializes within configured distant range', () => {
		expect(star.z).toBeGreaterThanOrEqual(300000)
		expect(star.z).toBeLessThanOrEqual(3000000)
	})

	it('applies rotation and forward movement', () => {
		const initial = { x: star.x, y: star.y, z: star.z }
		star.update(1000, 10, 0.016)
		expect(star.z).toBeLessThan(initial.z)
		expect(star.x).not.toBe(initial.x)
		expect(star.y).not.toBe(initial.y)
	})

	it('wraps and regenerates position when near threshold', () => {
		// Calculate the dynamic wrap threshold from implementation: min(100000, minDist * 0.5)
		star.z = 100 // ensure below threshold
		star.update(1000, 0, 0.016)
		expect(star.z).toBeGreaterThan(300000) // pushed back into far range
	})

	it('project reflects size and intensity multipliers', () => {
		star.x = 100
		star.y = 60
		star.z = 400000
		const p = star.project(width, height)
		expect(p.size).toBeGreaterThan(0)
		expect(p.opacity).toBeGreaterThan(0)
		// Opacity is now unclamped, but limited by OPACITY_BASE_MAX and intensity multiplier
		// With intensityMultiplier of 2.0, can reach up to 2.0
		expect(p.opacity).toBeLessThanOrEqual(2.0)
	})
})
