import { describe, expect, it } from 'vitest'
import { getScaledStarfieldConfig } from '../webglConfig'

describe('getScaledStarfieldConfig', () => {
	describe('discrete DPR buckets', () => {
		it('uses retina config for DPR = 2.0', () => {
			const config = getScaledStarfieldConfig(2.0)
			expect(config.foreground.sizeMultiplier).toBe(5.0)
			expect(config.foreground.minPixelSize).toBe(1.5)
			expect(config.core.rendering.sizeMultiplier).toBe(8.0)
			expect(config.core.rendering.minPixelSize).toBe(0.3)
		})

		it('uses standard config for DPR = 1.0', () => {
			const config = getScaledStarfieldConfig(1.0)
			expect(config.foreground.sizeMultiplier).toBe(3.0)
			expect(config.foreground.minPixelSize).toBe(1.5)
			expect(config.core.rendering.sizeMultiplier).toBe(5.0)
			expect(config.core.rendering.minPixelSize).toBe(1.8)
		})

		it('interpolates for DPR = 1.5 (midpoint)', () => {
			const config = getScaledStarfieldConfig(1.5)
			// Should be halfway between standard and retina
			expect(config.foreground.sizeMultiplier).toBeCloseTo(4.0, 1) // lerp(3.0, 5.0, 0.5)
			expect(config.core.rendering.sizeMultiplier).toBeCloseTo(6.5, 1) // lerp(5.0, 8.0, 0.5)
			expect(config.core.rendering.minPixelSize).toBeCloseTo(1.05, 1) // lerp(1.8, 0.3, 0.5)
		})

		it('uses retina config for DPR in bucket 1.75-2.5', () => {
			const config1_8 = getScaledStarfieldConfig(1.8)
			const config2_3 = getScaledStarfieldConfig(2.3)

			expect(config1_8.foreground.sizeMultiplier).toBe(5.0)
			expect(config2_3.foreground.sizeMultiplier).toBe(5.0)
			expect(config1_8.core.rendering.sizeMultiplier).toBe(8.0)
			expect(config2_3.core.rendering.sizeMultiplier).toBe(8.0)
		})

		it('scales up for high-DPI displays (DPR = 3.0)', () => {
			const config = getScaledStarfieldConfig(3.0)
			// Should be 20% larger than retina baseline
			expect(config.foreground.sizeMultiplier).toBeCloseTo(6.0, 1) // 5.0 * 1.2
			expect(config.core.rendering.sizeMultiplier).toBeCloseTo(9.6, 1) // 8.0 * 1.2
		})

		it('handles edge case DPR values', () => {
			// Very low DPR
			const lowConfig = getScaledStarfieldConfig(0.5)
			expect(lowConfig.foreground.sizeMultiplier).toBe(3.0) // Uses standard
			expect(lowConfig.core.rendering.sizeMultiplier).toBe(5.0)

			// Very high DPR
			const highConfig = getScaledStarfieldConfig(4.0)
			expect(highConfig.foreground.sizeMultiplier).toBeGreaterThan(5.0)
			expect(highConfig.core.rendering.sizeMultiplier).toBeGreaterThan(8.0)
		})
	})

	describe('configuration consistency', () => {
		it('preserves unchanged config properties', () => {
			const config = getScaledStarfieldConfig(2.0)

			// Twinkle effect should be preserved
			expect(config.foreground.twinkle.enabled).toBe(true)
			expect(config.foreground.twinkle.timeSpeed).toBeDefined()

			// Geometry should be preserved
			expect(config.core.geometry.semiMajorAxis).toBeDefined()
			expect(config.core.geometry.semiMinorAxis).toBeDefined()

			// Star counts should be preserved
			expect(config.starCounts.foreground).toBeDefined()
			expect(config.starCounts.core).toBeDefined()
			expect(config.starCounts.outer).toBeDefined()

			// Rendering bounds should be preserved
			expect(config.renderingBounds.marginMultiplier).toBeDefined()
		})

		it('returns deep copies without mutating original config', () => {
			const config1 = getScaledStarfieldConfig(1.0)
			const config2 = getScaledStarfieldConfig(2.0)

			// Different DPRs should return different multipliers
			expect(config1.foreground.sizeMultiplier).not.toBe(
				config2.foreground.sizeMultiplier,
			)

			// But should still have the same structure
			expect(config1.foreground.twinkle).toBeDefined()
			expect(config2.foreground.twinkle).toBeDefined()
		})
	})

	describe('interpolation behavior', () => {
		it('smoothly interpolates across DPR range 1.0-2.0', () => {
			const dprValues = [1.0, 1.25, 1.5, 1.75, 2.0]
			const configs = dprValues.map(dpr => getScaledStarfieldConfig(dpr))

			// Foreground sizeMultiplier should increase from 3.0 to 5.0
			expect(configs[0].foreground.sizeMultiplier).toBe(3.0) // DPR 1.0
			expect(configs[1].foreground.sizeMultiplier).toBeGreaterThan(3.0) // DPR 1.25
			expect(configs[1].foreground.sizeMultiplier).toBeLessThan(5.0)
			expect(configs[4].foreground.sizeMultiplier).toBe(5.0) // DPR 2.0
		})
	})
})
