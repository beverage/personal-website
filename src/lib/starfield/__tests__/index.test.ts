import { describe, expect, it } from 'vitest'
import * as starLib from '../index'

describe('starfield index exports', () => {
	it('re-exports types and classes/utilities', () => {
		// Classes
		expect(typeof starLib.Star3D).toBe('function')
		expect(typeof starLib.ClusterStar3D).toBe('function')
		expect(typeof starLib.CenterClusterStar3D).toBe('function')

		// Renderer utilities
		expect(typeof starLib.renderTwinkleStar).toBe('function')
		expect(typeof starLib.getTwinkleConfig).toBe('function')
		expect(typeof starLib.getClusterConfig).toBe('function')
		expect(typeof starLib.getVariantInfo).toBe('function')
	})
})
