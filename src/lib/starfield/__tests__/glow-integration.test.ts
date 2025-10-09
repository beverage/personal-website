import { describe, expect, it } from 'vitest'
import {
	WEBGL_STARFIELD_CONFIG,
	getScaledStarfieldConfig,
} from '../webglConfig'

/**
 * Glow Configuration Validation Tests
 *
 * Note: Full WebGL rendering tests require a real browser environment (Playwright/Cypress).
 * These tests focus on configuration validation that can run in JSDOM.
 */
describe('Glow Effect - Configuration Validation', () => {
	describe('base configuration', () => {
		it('has glow enabled by default', () => {
			expect(WEBGL_STARFIELD_CONFIG.core.glow.enabled).toBe(true)
		})

		it('has valid base glow configuration', () => {
			const glow = WEBGL_STARFIELD_CONFIG.core.glow

			// Opacity should be between 0 and 1
			expect(glow.opacity).toBeGreaterThanOrEqual(0)
			expect(glow.opacity).toBeLessThanOrEqual(1)

			// Falloff exponent should be positive
			expect(glow.falloffExponent).toBeGreaterThan(0)

			// Base size should be positive
			expect(glow.baseSize).toBeGreaterThan(0)

			// Aspect ratio should be positive
			expect(glow.aspectRatio).toBeGreaterThan(0)

			// Color should be RGB array
			expect(glow.color).toHaveLength(3)
			glow.color.forEach(value => {
				expect(value).toBeGreaterThanOrEqual(0)
				expect(value).toBeLessThanOrEqual(1)
			})

			// Noise configuration should exist
			expect(glow.noise).toBeDefined()
			expect(glow.noise.scale).toBeGreaterThan(0)
			expect(glow.noise.strength).toBeGreaterThanOrEqual(0)
			expect(glow.noise.speed).toHaveLength(2)
		})
	})

	describe('DPR configuration scaling', () => {
		it('DPR-scaled glow parameters are within valid ranges', () => {
			const dprValues = [1.0, 1.5, 2.0, 2.5, 3.0]

			dprValues.forEach(dpr => {
				const config = getScaledStarfieldConfig(dpr)
				const glow = config.core.glow

				// Opacity should be between 0 and 1
				expect(glow.opacity).toBeGreaterThanOrEqual(0)
				expect(glow.opacity).toBeLessThanOrEqual(1)

				// Falloff exponent should be positive
				expect(glow.falloffExponent).toBeGreaterThan(0)

				// Noise scale should be positive
				expect(glow.noise.scale).toBeGreaterThan(0)

				// Noise strength should be between 0 and 1 (or slightly above)
				expect(glow.noise.strength).toBeGreaterThanOrEqual(0)
				expect(glow.noise.strength).toBeLessThanOrEqual(1.5)

				// Aspect ratio should be positive
				expect(glow.aspectRatio).toBeGreaterThan(0)

				// Base size should be positive
				expect(glow.baseSize).toBeGreaterThan(0)
			})
		})

		it('smoothly interpolates opacity between standard and retina', () => {
			const standard = getScaledStarfieldConfig(1.0)
			const midpoint = getScaledStarfieldConfig(1.5)
			const retina = getScaledStarfieldConfig(2.0)

			// Midpoint should be between standard and retina
			expect(midpoint.core.glow.opacity).toBeGreaterThan(
				standard.core.glow.opacity,
			)
			expect(midpoint.core.glow.opacity).toBeLessThan(retina.core.glow.opacity)

			// Should be roughly halfway
			const expectedMidpoint =
				(standard.core.glow.opacity + retina.core.glow.opacity) / 2
			expect(midpoint.core.glow.opacity).toBeCloseTo(expectedMidpoint, 2)
		})

		it('returns higher opacity for retina displays', () => {
			const standard = getScaledStarfieldConfig(1.0)
			const retina = getScaledStarfieldConfig(2.0)

			expect(retina.core.glow.opacity).toBeGreaterThan(
				standard.core.glow.opacity,
			)
		})

		it('returns lower falloff exponent for retina displays', () => {
			const standard = getScaledStarfieldConfig(1.0)
			const retina = getScaledStarfieldConfig(2.0)

			expect(retina.core.glow.falloffExponent).toBeLessThan(
				standard.core.glow.falloffExponent,
			)
		})

		it('returns lower noise scale for retina displays', () => {
			const standard = getScaledStarfieldConfig(1.0)
			const retina = getScaledStarfieldConfig(2.0)

			expect(retina.core.glow.noise.scale).toBeLessThan(
				standard.core.glow.noise.scale,
			)
		})

		it('preserves non-DPR-dependent properties', () => {
			const standard = getScaledStarfieldConfig(1.0)
			const retina = getScaledStarfieldConfig(2.0)

			// These should be the same regardless of DPR
			expect(standard.core.glow.baseSize).toBe(retina.core.glow.baseSize)
			expect(standard.core.glow.aspectRatio).toBe(retina.core.glow.aspectRatio)
			expect(standard.core.glow.color).toEqual(retina.core.glow.color)
			expect(standard.core.glow.noise.speed).toEqual(
				retina.core.glow.noise.speed,
			)
		})
	})

	describe('edge cases and extremes', () => {
		it('handles very low DPR values', () => {
			const config = getScaledStarfieldConfig(0.5)

			expect(config.core.glow).toBeDefined()
			expect(config.core.glow.opacity).toBeGreaterThan(0)
			expect(config.core.glow.falloffExponent).toBeGreaterThan(0)
		})

		it('handles very high DPR values', () => {
			const config = getScaledStarfieldConfig(4.0)

			expect(config.core.glow).toBeDefined()
			expect(config.core.glow.opacity).toBeGreaterThan(0)
			expect(config.core.glow.falloffExponent).toBeGreaterThan(0)
		})

		it('handles fractional DPR values', () => {
			const dprValues = [1.25, 1.33, 1.5, 1.67, 1.75, 2.25, 2.5, 2.75]

			dprValues.forEach(dpr => {
				const config = getScaledStarfieldConfig(dpr)

				expect(config.core.glow).toBeDefined()
				expect(config.core.glow.opacity).toBeGreaterThan(0)
				expect(config.core.glow.falloffExponent).toBeGreaterThan(0)
				expect(config.core.glow.noise.scale).toBeGreaterThan(0)
			})
		})
	})
})
