'use client'

/**
 * Animation State Machine for coordinating complex animations
 * Prevents race conditions and ensures smooth transitions between animation states
 */

export enum AnimationState {
	IDLE = 'idle',
	COURSE_CHANGE = 'course-change',
	PORTFOLIO_SCROLL = 'portfolio-scroll',
}

export interface StateTransition {
	from: AnimationState
	to: AnimationState
	timestamp: number
}

export interface StateConfig {
	canTransitionTo: AnimationState[]
	onEnter?: () => void
	onExit?: () => void
	getPriority?: (subscriberId: string) => number
}

export interface AnimationStateMachineConfig {
	debugMode: boolean
	transitionHistory: boolean
	maxHistorySize: number
}

class AnimationStateMachineClass {
	private currentState: AnimationState = AnimationState.IDLE
	private transitionHistory: StateTransition[] = []
	private config: AnimationStateMachineConfig
	private subscribers = new Set<(state: AnimationState) => void>()

	// Define valid state transitions and their behaviors
	private readonly stateMachine: Record<AnimationState, StateConfig> = {
		[AnimationState.IDLE]: {
			canTransitionTo: [
				AnimationState.COURSE_CHANGE,
				AnimationState.PORTFOLIO_SCROLL,
			],
			onEnter: () => {
				if (this.config.debugMode) {
					console.log('🎯 Animation State: IDLE - Normal operation')
				}
			},
			getPriority: (subscriberId: string) => {
				// Normal priorities during idle state
				if (subscriberId.includes('cluster')) return 5
				if (subscriberId.includes('starfield')) return 10
				return 1
			},
		},
		[AnimationState.COURSE_CHANGE]: {
			canTransitionTo: [AnimationState.IDLE],
			onEnter: () => {
				if (this.config.debugMode) {
					console.log(
						'🎯 Animation State: COURSE_CHANGE - Boosting starfield priority',
					)
				}
			},
			onExit: () => {
				if (this.config.debugMode) {
					console.log(
						'🎯 Animation State: Exiting COURSE_CHANGE - Restoring normal priorities',
					)
				}
			},
			getPriority: (subscriberId: string) => {
				// Boost starfield animations during course changes for smooth banking
				if (subscriberId.includes('starfield')) return 100
				if (subscriberId.includes('cluster')) return 90
				return 1 // Minimize other animations
			},
		},
		[AnimationState.PORTFOLIO_SCROLL]: {
			canTransitionTo: [AnimationState.IDLE, AnimationState.COURSE_CHANGE],
			onEnter: () => {
				if (this.config.debugMode) {
					console.log(
						'🎯 Animation State: PORTFOLIO_SCROLL - Optimizing for scroll performance',
					)
				}
			},
			onExit: () => {
				if (this.config.debugMode) {
					console.log(
						'🎯 Animation State: Exiting PORTFOLIO_SCROLL - Restoring normal priorities',
					)
				}
			},
			getPriority: (subscriberId: string) => {
				// Optimize priorities for portfolio scrolling
				if (subscriberId.includes('portfolio')) return 100 // Max priority for portfolio animations
				if (subscriberId.includes('starfield')) return 50 // Reduced priority for performance
				if (subscriberId.includes('cluster')) return 40 // Reduced priority for performance
				return 1 // Minimal priority for other animations
			},
		},
	}

	constructor(config: Partial<AnimationStateMachineConfig> = {}) {
		this.config = {
			debugMode: false,
			transitionHistory: false,
			maxHistorySize: 50,
			...config,
		}
	}

	/**
	 * Get the current animation state
	 */
	getCurrentState(): AnimationState {
		return this.currentState
	}

	/**
	 * Request a state transition
	 * Returns true if transition was successful, false if invalid
	 */
	requestTransition(to: AnimationState): boolean {
		const fromState = this.currentState
		const stateConfig = this.stateMachine[fromState]

		// Check if transition is valid
		if (!stateConfig.canTransitionTo.includes(to)) {
			if (this.config.debugMode) {
				console.warn(
					`❌ Invalid transition: ${fromState} → ${to}. Valid transitions: ${stateConfig.canTransitionTo.join(', ')}`,
				)
			}
			return false
		}

		// Execute exit hook for current state
		this.stateMachine[fromState].onExit?.()

		// Update state
		this.currentState = to

		// Record transition history
		if (this.config.transitionHistory) {
			this.transitionHistory.push({
				from: fromState,
				to,
				timestamp: Date.now(),
			})

			// Limit history size
			if (this.transitionHistory.length > this.config.maxHistorySize) {
				this.transitionHistory.shift()
			}
		}

		// Execute enter hook for new state
		this.stateMachine[to].onEnter?.()

		// Notify subscribers
		this.notifySubscribers(to)

		if (this.config.debugMode) {
			console.log(`✅ Transition successful: ${fromState} → ${to}`)
		}

		return true
	}

	/**
	 * Get animation priority for a subscriber based on current state
	 */
	getPriority(subscriberId: string): number {
		const stateConfig = this.stateMachine[this.currentState]
		return stateConfig.getPriority?.(subscriberId) ?? 10
	}

	/**
	 * Check if a transition is valid without executing it
	 */
	canTransitionTo(to: AnimationState): boolean {
		return this.stateMachine[this.currentState].canTransitionTo.includes(to)
	}

	/**
	 * Get all valid transitions from current state
	 */
	getValidTransitions(): AnimationState[] {
		return this.stateMachine[this.currentState].canTransitionTo
	}

	/**
	 * Subscribe to state changes
	 */
	subscribe(callback: (state: AnimationState) => void): () => void {
		this.subscribers.add(callback)

		// Return unsubscribe function
		return () => {
			this.subscribers.delete(callback)
		}
	}

	/**
	 * Get transition history (if enabled)
	 */
	getTransitionHistory(): StateTransition[] {
		return [...this.transitionHistory]
	}

	/**
	 * Reset to idle state (useful for testing or error recovery)
	 */
	reset(): void {
		if (this.currentState !== AnimationState.IDLE) {
			this.stateMachine[this.currentState].onExit?.()
		}

		this.currentState = AnimationState.IDLE
		this.transitionHistory = []
		this.stateMachine[AnimationState.IDLE].onEnter?.()
		this.notifySubscribers(AnimationState.IDLE)

		if (this.config.debugMode) {
			console.log('🔄 Animation State Machine reset to IDLE')
		}
	}

	/**
	 * Enable/disable debug mode
	 */
	setDebugMode(enabled: boolean): void {
		this.config.debugMode = enabled
	}

	/**
	 * Notify all subscribers of state change
	 */
	private notifySubscribers(newState: AnimationState): void {
		this.subscribers.forEach(callback => {
			try {
				callback(newState)
			} catch (error) {
				console.error('Error in state machine subscriber:', error)
			}
		})
	}
}

// Singleton instance
export const AnimationStateMachine = new AnimationStateMachineClass({
	debugMode: process.env.NODE_ENV === 'development',
	transitionHistory: process.env.NODE_ENV === 'development',
})

// React hook for using the animation state machine
export const useAnimationStateMachine = () => {
	const [currentState, setCurrentState] = useState(
		AnimationStateMachine.getCurrentState(),
	)

	useEffect(() => {
		// Subscribe to state changes
		const unsubscribe = AnimationStateMachine.subscribe(setCurrentState)
		return unsubscribe
	}, [])

	return {
		currentState,
		requestTransition: AnimationStateMachine.requestTransition.bind(
			AnimationStateMachine,
		),
		canTransitionTo: AnimationStateMachine.canTransitionTo.bind(
			AnimationStateMachine,
		),
		getValidTransitions: AnimationStateMachine.getValidTransitions.bind(
			AnimationStateMachine,
		),
		getPriority: AnimationStateMachine.getPriority.bind(AnimationStateMachine),
	}
}

// Import useState and useEffect
import { useEffect, useState } from 'react'
