import { describe, expect, it } from 'vitest'
import { isWithinRenderBounds } from '../renderUtils'

describe('isWithinRenderBounds', () => {
	const canvasWidth = 1920
	const canvasHeight = 1080
	const margin = 100

	describe('stars within canvas', () => {
		it('returns true for star at canvas center', () => {
			const x = canvasWidth / 2
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star at top-left corner', () => {
			expect(
				isWithinRenderBounds(0, 0, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star at bottom-right corner', () => {
			expect(
				isWithinRenderBounds(
					canvasWidth,
					canvasHeight,
					canvasWidth,
					canvasHeight,
					margin,
				),
			).toBe(true)
		})
	})

	describe('stars within margin', () => {
		it('returns true for star just outside left edge within margin', () => {
			const x = -50 // Within 100px margin
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star just outside right edge within margin', () => {
			const x = canvasWidth + 50 // Within 100px margin
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star just outside top edge within margin', () => {
			const x = canvasWidth / 2
			const y = -50 // Within 100px margin
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star just outside bottom edge within margin', () => {
			const x = canvasWidth / 2
			const y = canvasHeight + 50 // Within 100px margin
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})

		it('returns true for star at exact margin boundary', () => {
			const x = -margin // Exactly at left margin
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(true)
		})
	})

	describe('stars beyond margin', () => {
		it('returns false for star beyond left margin', () => {
			const x = -150 // Beyond 100px margin
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(false)
		})

		it('returns false for star beyond right margin', () => {
			const x = canvasWidth + 150 // Beyond 100px margin
			const y = canvasHeight / 2
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(false)
		})

		it('returns false for star beyond top margin', () => {
			const x = canvasWidth / 2
			const y = -150 // Beyond 100px margin
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(false)
		})

		it('returns false for star beyond bottom margin', () => {
			const x = canvasWidth / 2
			const y = canvasHeight + 150 // Beyond 100px margin
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(false)
		})

		it('returns false for star way off screen diagonally', () => {
			const x = canvasWidth + 500
			const y = canvasHeight + 500
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, margin),
			).toBe(false)
		})
	})

	describe('edge cases', () => {
		it('handles zero margin correctly', () => {
			// Just inside canvas
			expect(
				isWithinRenderBounds(
					canvasWidth - 1,
					canvasHeight - 1,
					canvasWidth,
					canvasHeight,
					0,
				),
			).toBe(true)

			// Just outside canvas
			expect(
				isWithinRenderBounds(
					canvasWidth + 1,
					canvasHeight / 2,
					canvasWidth,
					canvasHeight,
					0,
				),
			).toBe(false)
		})

		it('handles negative coordinates within margin', () => {
			const x = -50
			const y = -50
			expect(isWithinRenderBounds(x, y, canvasWidth, canvasHeight, 100)).toBe(
				true,
			)
		})

		it('handles large margins correctly', () => {
			const largeMargin = 5000
			const x = -4000 // Within 5000px margin
			const y = -4000
			expect(
				isWithinRenderBounds(x, y, canvasWidth, canvasHeight, largeMargin),
			).toBe(true)

			const x2 = -6000 // Beyond 5000px margin
			expect(
				isWithinRenderBounds(x2, y, canvasWidth, canvasHeight, largeMargin),
			).toBe(false)
		})

		it('handles fractional coordinates', () => {
			const x = canvasWidth + 50.5
			const y = canvasHeight / 2
			expect(isWithinRenderBounds(x, y, canvasWidth, canvasHeight, 100)).toBe(
				true,
			)
		})
	})
})
