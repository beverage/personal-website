import { beforeEach, describe, expect, it } from 'vitest'
import { AnimationState, AnimationStateMachine } from '../AnimationStateMachine'

describe('AnimationStateMachine', () => {
	beforeEach(() => {
		// Reset to idle state before each test
		AnimationStateMachine.reset()
	})

	describe('initial state', () => {
		it('should start in IDLE state', () => {
			expect(AnimationStateMachine.getCurrentState()).toBe(AnimationState.IDLE)
		})
	})

	describe('state transitions', () => {
		it('should allow valid transitions from IDLE', () => {
			const validTransitions = AnimationStateMachine.getValidTransitions()
			expect(validTransitions).toContain(AnimationState.COURSE_CHANGE)
			expect(validTransitions).toContain(AnimationState.PORTFOLIO_SCROLL)
		})

		it('should successfully transition from IDLE to COURSE_CHANGE', () => {
			const success = AnimationStateMachine.requestTransition(
				AnimationState.COURSE_CHANGE,
			)
			expect(success).toBe(true)
			expect(AnimationStateMachine.getCurrentState()).toBe(
				AnimationState.COURSE_CHANGE,
			)
		})

		it('should successfully transition from IDLE to PORTFOLIO_SCROLL', () => {
			const success = AnimationStateMachine.requestTransition(
				AnimationState.PORTFOLIO_SCROLL,
			)
			expect(success).toBe(true)
			expect(AnimationStateMachine.getCurrentState()).toBe(
				AnimationState.PORTFOLIO_SCROLL,
			)
		})

		it('should reject invalid transitions', () => {
			// Try to go directly from COURSE_CHANGE to PORTFOLIO_SCROLL (not allowed)
			AnimationStateMachine.requestTransition(AnimationState.COURSE_CHANGE)
			const success = AnimationStateMachine.requestTransition(
				AnimationState.PORTFOLIO_SCROLL,
			)

			expect(success).toBe(false)
			expect(AnimationStateMachine.getCurrentState()).toBe(
				AnimationState.COURSE_CHANGE,
			)
		})

		it('should return to IDLE from COURSE_CHANGE', () => {
			AnimationStateMachine.requestTransition(AnimationState.COURSE_CHANGE)
			const success = AnimationStateMachine.requestTransition(
				AnimationState.IDLE,
			)

			expect(success).toBe(true)
			expect(AnimationStateMachine.getCurrentState()).toBe(AnimationState.IDLE)
		})
	})

	describe('priority system', () => {
		it('should return different priorities based on state', () => {
			// IDLE state priorities
			expect(AnimationStateMachine.getPriority('starfield-123')).toBe(10)
			expect(AnimationStateMachine.getPriority('cluster-456')).toBe(5)

			// COURSE_CHANGE state priorities
			AnimationStateMachine.requestTransition(AnimationState.COURSE_CHANGE)
			expect(AnimationStateMachine.getPriority('starfield-123')).toBe(100)
			expect(AnimationStateMachine.getPriority('cluster-456')).toBe(90)
		})

		it('should handle portfolio scroll priorities', () => {
			AnimationStateMachine.requestTransition(AnimationState.PORTFOLIO_SCROLL)

			expect(AnimationStateMachine.getPriority('portfolio-123')).toBe(100)
			expect(AnimationStateMachine.getPriority('starfield-456')).toBe(50)
			expect(AnimationStateMachine.getPriority('cluster-789')).toBe(40)
		})

		it('should default to priority 1 for unknown subscriber types', () => {
			expect(AnimationStateMachine.getPriority('unknown-animation')).toBe(1)
		})
	})

	describe('state validation', () => {
		it('should correctly identify valid transitions', () => {
			expect(
				AnimationStateMachine.canTransitionTo(AnimationState.COURSE_CHANGE),
			).toBe(true)
			expect(
				AnimationStateMachine.canTransitionTo(AnimationState.PORTFOLIO_SCROLL),
			).toBe(true)

			AnimationStateMachine.requestTransition(AnimationState.COURSE_CHANGE)
			expect(AnimationStateMachine.canTransitionTo(AnimationState.IDLE)).toBe(
				true,
			)
			expect(
				AnimationStateMachine.canTransitionTo(AnimationState.PORTFOLIO_SCROLL),
			).toBe(false)
		})
	})

	describe('subscriber management', () => {
		it('should handle subscribers correctly', () => {
			const mockCallback = vi.fn()
			const unsubscribe = AnimationStateMachine.subscribe(mockCallback)

			// Transition should notify subscriber
			AnimationStateMachine.requestTransition(AnimationState.COURSE_CHANGE)
			expect(mockCallback).toHaveBeenCalledWith(AnimationState.COURSE_CHANGE)

			// Unsubscribe should work
			unsubscribe()
			AnimationStateMachine.requestTransition(AnimationState.IDLE)
			expect(mockCallback).toHaveBeenCalledTimes(1) // No additional calls
		})
	})
})
