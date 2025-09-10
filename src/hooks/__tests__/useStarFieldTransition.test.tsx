import { COURSE_CHANGE_PRESETS, EASING_FUNCTIONS } from '@/types/transitions'
import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useStarFieldTransition } from '../useStarFieldTransition'

describe('useStarFieldTransition - Core Logic Tests', () => {
	// Simple mock setup - no animation execution
	beforeEach(() => {
		global.requestAnimationFrame = vi.fn(() => 1)
		global.cancelAnimationFrame = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const defaultProps = {
		config: COURSE_CHANGE_PRESETS['banking-turn'],
		baseForwardSpeed: 300,
	}

	describe('Initialization & State', () => {
		it('initializes with correct idle state', () => {
			const { result } = renderHook(() => useStarFieldTransition(defaultProps))

			expect(result.current.transitionState.phase).toBe('idle')
			expect(result.current.transitionState.direction).toBe(null)
			expect(result.current.transitionState.progress).toBe(0)
			expect(result.current.isTransitioning).toBe(false)
			expect(result.current.currentContentOpacity).toBe(1)
			expect(result.current.newContentOpacity).toBe(0)
		})

		it('provides startTransition function', () => {
			const { result } = renderHook(() => useStarFieldTransition(defaultProps))

			expect(typeof result.current.startTransition).toBe('function')
		})

		it('initializes banking roll correctly', () => {
			const { result } = renderHook(() => useStarFieldTransition(defaultProps))

			expect(result.current.bankingRoll.foregroundRollSpeed).toBe(-1.5)
			expect(result.current.bankingRoll.backgroundRollSpeed).toBe(-1.5)
		})
	})

	describe('Motion Vector Calculations (Idle State)', () => {
		it('returns base forward motion when idle', () => {
			const { result } = renderHook(() => useStarFieldTransition(defaultProps))

			const expectedBase = {
				forward: 300,
				lateral: 0,
				vertical: 0,
			}

			expect(result.current.motionVectors.foreground).toEqual(expectedBase)
			expect(result.current.motionVectors.center).toEqual(expectedBase)
			expect(result.current.motionVectors.background).toEqual(expectedBase)
		})

		it('respects custom base forward speed', () => {
			const customSpeed = 500
			const { result } = renderHook(() =>
				useStarFieldTransition({
					...defaultProps,
					baseForwardSpeed: customSpeed,
				}),
			)

			expect(result.current.motionVectors.foreground.forward).toBe(customSpeed)
			expect(result.current.motionVectors.center.forward).toBe(customSpeed)
			expect(result.current.motionVectors.background.forward).toBe(customSpeed)
		})

		it('applies parallax factors to structure but remains idle', () => {
			const customParallax = {
				foreground: 1.0,
				center: 0.5,
				background: 0.1,
			}

			const { result } = renderHook(() =>
				useStarFieldTransition({
					...defaultProps,
					parallaxFactors: customParallax,
				}),
			)

			// In idle state, all should have same forward motion, no lateral
			expect(result.current.motionVectors.foreground.forward).toBe(300)
			expect(result.current.motionVectors.center.forward).toBe(300)
			expect(result.current.motionVectors.background.forward).toBe(300)

			expect(result.current.motionVectors.foreground.lateral).toBe(0)
			expect(result.current.motionVectors.center.lateral).toBe(0)
			expect(result.current.motionVectors.background.lateral).toBe(0)
		})
	})

	describe('Configuration Handling', () => {
		it('works with all available presets without errors', () => {
			Object.keys(COURSE_CHANGE_PRESETS).forEach(presetName => {
				const config =
					COURSE_CHANGE_PRESETS[
						presetName as keyof typeof COURSE_CHANGE_PRESETS
					]

				expect(() => {
					const { result } = renderHook(() =>
						useStarFieldTransition({ ...defaultProps, config }),
					)

					// Should initialize without errors
					expect(result.current.transitionState.phase).toBe('idle')
				}).not.toThrow()
			})
		})

		it('handles custom easing configurations', () => {
			const customConfig = {
				...defaultProps.config,
				easingCurve: 'custom' as const,
				customEasing: {
					accelerationPower: 3,
					decelerationPower: 2,
				},
			}

			expect(() => {
				const { result } = renderHook(() =>
					useStarFieldTransition({ ...defaultProps, config: customConfig }),
				)

				expect(result.current.transitionState.phase).toBe('idle')
			}).not.toThrow()
		})

		it('validates easing functions exist', () => {
			// Test that all easing curves referenced in presets exist
			Object.values(COURSE_CHANGE_PRESETS).forEach(config => {
				expect(EASING_FUNCTIONS).toHaveProperty(config.easingCurve)
			})
		})
	})

	describe('Callback Integration', () => {
		it('accepts callback props without errors', () => {
			const onTransitionComplete = vi.fn()
			const onContentFadeComplete = vi.fn()

			expect(() => {
				const { result } = renderHook(() =>
					useStarFieldTransition({
						...defaultProps,
						onTransitionComplete,
						onContentFadeComplete,
					}),
				)

				// Should initialize properly with callbacks
				expect(result.current.transitionState.phase).toBe('idle')
			}).not.toThrow()
		})
	})

	describe('Hook Lifecycle', () => {
		it('initializes and unmounts cleanly', () => {
			const { result, unmount } = renderHook(() =>
				useStarFieldTransition(defaultProps),
			)

			// Should initialize
			expect(result.current.transitionState.phase).toBe('idle')

			// Should unmount without errors
			expect(unmount).not.toThrow()
		})

		it('handles prop changes without errors', () => {
			const { result, rerender } = renderHook(
				props => useStarFieldTransition(props),
				{ initialProps: defaultProps },
			)

			expect(result.current.transitionState.phase).toBe('idle')

			// Change props
			const newProps = {
				...defaultProps,
				baseForwardSpeed: 500,
			}

			expect(() => {
				rerender(newProps)
			}).not.toThrow()

			expect(result.current.motionVectors.foreground.forward).toBe(500)
		})
	})
})
