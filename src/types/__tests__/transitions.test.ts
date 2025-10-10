import { describe, expect, it } from 'vitest'
import {
	COURSE_CHANGE_PRESETS,
	DEFAULT_PARALLAX_FACTORS,
	EASING_FUNCTIONS,
} from '../transitions'

describe('Transition Configuration', () => {
	describe('COURSE_CHANGE_PRESETS', () => {
		it('contains all expected variants', () => {
			expect(COURSE_CHANGE_PRESETS).toHaveProperty('gentle-drift')
			expect(COURSE_CHANGE_PRESETS).toHaveProperty('banking-turn')
			expect(COURSE_CHANGE_PRESETS).toHaveProperty('sharp-maneuver')
		})

		it('has valid configuration structure for all presets', () => {
			Object.entries(COURSE_CHANGE_PRESETS).forEach(([variant, config]) => {
				expect(config.variant).toBe(variant)
				expect(config.duration).toBeGreaterThan(0)
				expect(config.parallaxIntensity).toBeGreaterThanOrEqual(0)
				expect(config.maxLateralSpeed).toBeGreaterThanOrEqual(0)
				expect(config.rollIntensity).toBeGreaterThanOrEqual(0)
				expect(config.settlingDuration).toBeGreaterThanOrEqual(0)

				// Validate easing curve
				expect([
					'ease-in-out',
					'ease-out',
					'ease-in',
					'linear',
					'fast-in-slow-out',
					'custom',
				]).toContain(config.easingCurve)

				// Validate content fade configuration
				expect(config.contentFade).toBeDefined()
				expect(config.contentFade.fadeOutRatio).toBeGreaterThan(0)
				expect(config.contentFade.starfieldOnlyRatio).toBeGreaterThanOrEqual(0)
				expect(config.contentFade.fadeInRatio).toBeGreaterThan(0)

				// Phase ratios should sum to approximately 1
				const sum =
					config.contentFade.fadeOutRatio +
					config.contentFade.starfieldOnlyRatio +
					config.contentFade.fadeInRatio
				expect(sum).toBeCloseTo(1, 2)
			})
		})

		it('has custom easing parameters when using custom curve', () => {
			Object.values(COURSE_CHANGE_PRESETS).forEach(config => {
				if (config.easingCurve === 'custom') {
					expect(config.customEasing).toBeDefined()
					expect(config.customEasing!.accelerationPower).toBeGreaterThan(0)
					expect(config.customEasing!.decelerationPower).toBeGreaterThan(0)
				}
			})
		})

		it('has reasonable duration values', () => {
			Object.values(COURSE_CHANGE_PRESETS).forEach(config => {
				// Durations should be reasonable (between 500ms and 10s)
				expect(config.duration).toBeGreaterThanOrEqual(500)
				expect(config.duration).toBeLessThanOrEqual(10000)
				expect(config.settlingDuration).toBeLessThanOrEqual(3000)
			})
		})

		it('has different characteristics for each variant', () => {
			const gentleDrift = COURSE_CHANGE_PRESETS['gentle-drift']
			const bankingTurn = COURSE_CHANGE_PRESETS['banking-turn']
			const sharpManeuver = COURSE_CHANGE_PRESETS['sharp-maneuver']

			// Banking turn should be the longest duration
			expect(bankingTurn.duration).toBeGreaterThan(gentleDrift.duration)
			expect(bankingTurn.duration).toBeGreaterThan(sharpManeuver.duration)

			// Sharp maneuver should be the fastest and most intense
			expect(sharpManeuver.duration).toBeLessThan(gentleDrift.duration)
			expect(sharpManeuver.parallaxIntensity).toBeGreaterThan(
				gentleDrift.parallaxIntensity,
			)
			expect(sharpManeuver.maxLateralSpeed).toBeGreaterThan(
				gentleDrift.maxLateralSpeed,
			)
			expect(sharpManeuver.rollIntensity).toBeGreaterThan(
				gentleDrift.rollIntensity,
			)
		})
	})

	describe('EASING_FUNCTIONS', () => {
		const testProgress = [0, 0.25, 0.5, 0.75, 1]

		it('contains all expected easing functions', () => {
			expect(EASING_FUNCTIONS).toHaveProperty('linear')
			expect(EASING_FUNCTIONS).toHaveProperty('ease-in')
			expect(EASING_FUNCTIONS).toHaveProperty('ease-out')
			expect(EASING_FUNCTIONS).toHaveProperty('ease-in-out')
			expect(EASING_FUNCTIONS).toHaveProperty('fast-in-slow-out')
			expect(EASING_FUNCTIONS).toHaveProperty('custom')
		})

		it('linear function returns input unchanged', () => {
			testProgress.forEach(t => {
				expect(EASING_FUNCTIONS.linear(t)).toBe(t)
			})
		})

		it('easing functions return values between 0 and 1 for inputs between 0 and 1', () => {
			const midpoints = [0.1, 0.3, 0.5, 0.7, 0.9]

			Object.entries(EASING_FUNCTIONS).forEach(([name, fn]) => {
				midpoints.forEach(t => {
					let result
					if (name === 'custom') {
						result = fn(t, 2, 2)
					} else {
						result = fn(t)
					}
					expect(result).toBeGreaterThanOrEqual(0)
					expect(result).toBeLessThanOrEqual(1)
				})
			})
		})

		it('ease-in starts slow and accelerates', () => {
			const result1 = EASING_FUNCTIONS['ease-in'](0.25)
			const result2 = EASING_FUNCTIONS['ease-in'](0.75)

			// Should be closer to 0 than linear at 0.25 (slow start)
			expect(result1).toBeLessThan(0.25)
			// Should be less than linear at 0.75 but accelerating towards 1
			expect(result2).toBeLessThan(0.75)
			// But should be much greater than the early value, showing acceleration
			expect(result2).toBeGreaterThan(result1 * 10) // Significant acceleration
		})

		it('ease-out starts fast and decelerates', () => {
			const result1 = EASING_FUNCTIONS['ease-out'](0.25)
			const result2 = EASING_FUNCTIONS['ease-out'](0.75)

			// Should be higher than linear at 0.25 (fast start)
			expect(result1).toBeGreaterThan(0.25)
			// Should be higher than linear at 0.75 too, but decelerating
			expect(result2).toBeGreaterThan(0.75)
			// Deceleration: the change from 0.25 to 0.75 should be smaller than linear would suggest
			const linearChange = 0.5 // Linear would add 0.5
			const actualChange = result2 - result1
			expect(actualChange).toBeLessThan(linearChange) // Deceleration
		})

		it('custom function uses acceleration and deceleration parameters', () => {
			// Test with different parameters
			const slowStart = EASING_FUNCTIONS.custom(0.5, 4, 1) // High acceleration power
			const fastStart = EASING_FUNCTIONS.custom(0.5, 1, 4) // High deceleration power

			expect(slowStart).not.toBe(fastStart)
			expect(slowStart).toBeGreaterThanOrEqual(0)
			expect(slowStart).toBeLessThanOrEqual(1)
			expect(fastStart).toBeGreaterThanOrEqual(0)
			expect(fastStart).toBeLessThanOrEqual(1)
		})
	})

	describe('DEFAULT_PARALLAX_FACTORS', () => {
		it('has correct structure', () => {
			expect(DEFAULT_PARALLAX_FACTORS).toHaveProperty('foreground')
			expect(DEFAULT_PARALLAX_FACTORS).toHaveProperty('center')
			expect(DEFAULT_PARALLAX_FACTORS).toHaveProperty('background')
		})

		it('has logical parallax ordering', () => {
			// Foreground should have strongest effect, background weakest
			expect(DEFAULT_PARALLAX_FACTORS.foreground).toBeGreaterThanOrEqual(
				DEFAULT_PARALLAX_FACTORS.center,
			)
			expect(DEFAULT_PARALLAX_FACTORS.center).toBeGreaterThanOrEqual(
				DEFAULT_PARALLAX_FACTORS.background,
			)
			expect(DEFAULT_PARALLAX_FACTORS.background).toBeGreaterThan(0)
		})

		it('has reasonable values', () => {
			Object.values(DEFAULT_PARALLAX_FACTORS).forEach(value => {
				expect(value).toBeGreaterThan(0)
				expect(value).toBeLessThanOrEqual(2) // Should not exceed 2x for reasonable parallax
			})
		})
	})

	describe('Type Safety', () => {
		it('course change variants are properly typed', () => {
			// This will fail at compile time if types are wrong
			const variants = Object.keys(COURSE_CHANGE_PRESETS) as Array<
				keyof typeof COURSE_CHANGE_PRESETS
			>

			expect(variants).toContain('gentle-drift')
			expect(variants).toContain('banking-turn')
			expect(variants).toContain('sharp-maneuver')
		})
	})
})
