'use client'

/**
 * Centralized animation controller that manages all RAF loops in the application.
 * This consolidates multiple requestAnimationFrame loops into a single efficient loop
 * while preserving exact visual output and timing.
 *
 * Integrates with AnimationStateMachine for dynamic priority management.
 */

import { AnimationStateMachine } from './AnimationStateMachine'

export interface AnimationSubscriber {
	id: string
	update: (timestamp: number, deltaTime: number) => void
	priority: number // Higher numbers = higher priority
	enabled: boolean
}

export interface AnimationControllerConfig {
	maxDeltaTime: number // Clamp deltaTime to prevent jumps after tab switching
	targetFPS: number // Target frames per second (0 = uncapped)
	debugMode: boolean
}

class AnimationControllerClass {
	private subscribers = new Map<string, AnimationSubscriber>()
	private animationId: number | null = null
	private lastTimestamp: number | null = null
	private lastRenderTime: number = 0
	private isRunning = false
	private pausedByVisibility = false
	private config: AnimationControllerConfig

	constructor(config: Partial<AnimationControllerConfig> = {}) {
		this.config = {
			maxDeltaTime: 0.1, // 100ms max to prevent visual jumps
			targetFPS: 60, // 60 FPS by default
			debugMode: false,
			...config,
		}

		// Subscribe to state machine changes to update priorities automatically
		AnimationStateMachine.subscribe(() => {
			this.updatePrioritiesFromState()
		})

		// Set up page visibility listener for performance optimization
		// Don't render when tab is hidden to save CPU/GPU and battery
		if (typeof document !== 'undefined') {
			document.addEventListener('visibilitychange', this.handleVisibilityChange)
		}
	}

	/**
	 * Subscribe to the animation loop
	 */
	subscribe(subscriber: AnimationSubscriber): void {
		this.subscribers.set(subscriber.id, subscriber)

		// Set initial priority based on current state
		subscriber.priority = AnimationStateMachine.getPriority(subscriber.id)

		// Start the loop if this is the first subscriber
		if (!this.isRunning && this.subscribers.size === 1) {
			this.start()
		}
	}

	/**
	 * Unsubscribe from the animation loop
	 */
	unsubscribe(id: string): void {
		this.subscribers.delete(id)

		// Stop the loop if no more subscribers
		if (this.subscribers.size === 0) {
			this.stop()
		}
	}

	/**
	 * Enable/disable a specific subscriber without removing it
	 */
	setEnabled(id: string, enabled: boolean): void {
		const subscriber = this.subscribers.get(id)
		if (subscriber) {
			subscriber.enabled = enabled
		}
	}

	/**
	 * Update subscriber priority
	 */
	setPriority(id: string, priority: number): void {
		const subscriber = this.subscribers.get(id)
		if (subscriber) {
			subscriber.priority = priority
		}
	}

	/**
	 * Update all subscriber priorities using a callback function
	 * Useful for state-based priority adjustments
	 */
	updateAllPriorities(getPriority: (id: string) => number): void {
		this.subscribers.forEach((subscriber, id) => {
			subscriber.priority = getPriority(id)
		})
	}

	/**
	 * Update priorities based on current animation state
	 * This integrates with the AnimationStateMachine for dynamic priority management
	 */
	updatePrioritiesFromState(): void {
		this.subscribers.forEach((subscriber, id) => {
			subscriber.priority = AnimationStateMachine.getPriority(id)
		})
	}

	/**
	 * Update target FPS at runtime
	 * @param fps - Target frames per second (0 = uncapped)
	 */
	setTargetFPS(fps: number): void {
		this.config.targetFPS = fps
		if (this.config.debugMode) {
			console.log(
				`🎯 AnimationController: Target FPS set to ${fps === 0 ? 'uncapped' : fps}`,
			)
		}
	}

	/**
	 * Get current target FPS
	 */
	getTargetFPS(): number {
		return this.config.targetFPS
	}

	/**
	 * Handle page visibility changes
	 * Pause rendering when tab is hidden to save resources
	 */
	private handleVisibilityChange = (): void => {
		if (typeof document === 'undefined') return

		if (document.hidden) {
			this.pausedByVisibility = true
			if (this.config.debugMode) {
				console.log('🔇 AnimationController: Paused (tab hidden)')
			}
		} else {
			this.pausedByVisibility = false
			// Reset timestamp to avoid huge deltaTime jump when resuming
			this.lastTimestamp = null
			if (this.config.debugMode) {
				console.log('🔊 AnimationController: Resumed (tab visible)')
			}
		}
	}

	/**
	 * Get current subscriber count
	 */
	getSubscriberCount(): number {
		return this.subscribers.size
	}

	/**
	 * Check if controller is running
	 */
	getIsRunning(): boolean {
		return this.isRunning
	}

	/**
	 * Start the animation loop
	 */
	private start(): void {
		if (this.isRunning) return

		this.isRunning = true
		this.lastTimestamp = null
		this.tick = this.tick.bind(this)
		this.animationId = requestAnimationFrame(this.tick)
	}

	/**
	 * Stop the animation loop
	 */
	private stop(): void {
		if (!this.isRunning) return

		this.isRunning = false
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId)
			this.animationId = null
		}
		this.lastTimestamp = null
	}

	/**
	 * Main animation loop tick
	 */
	private tick(timestamp: number): void {
		if (!this.isRunning) return

		// Pause rendering when tab is hidden to save CPU/GPU/battery
		if (this.pausedByVisibility) {
			// Still schedule rAF to keep checking for visibility changes
			this.animationId = requestAnimationFrame(this.tick)
			return
		}

		// FPS limiting: Check if enough time has passed since last render
		if (this.config.targetFPS > 0) {
			const frameDelay = 1000 / this.config.targetFPS
			const timeSinceLastRender = timestamp - this.lastRenderTime

			if (timeSinceLastRender < frameDelay) {
				// Not enough time passed, skip this frame but schedule next
				this.animationId = requestAnimationFrame(this.tick)
				return
			}

			// Update last render time
			this.lastRenderTime = timestamp
		}

		// Calculate deltaTime
		let deltaTime = 0
		if (this.lastTimestamp !== null) {
			deltaTime = (timestamp - this.lastTimestamp) / 1000
			// Clamp deltaTime to prevent visual jumps after tab switching
			deltaTime = Math.min(deltaTime, this.config.maxDeltaTime)
		}
		this.lastTimestamp = timestamp

		// Get subscribers sorted by priority (higher priority first)
		const sortedSubscribers = Array.from(this.subscribers.values())
			.filter(subscriber => subscriber.enabled)
			.sort((a, b) => b.priority - a.priority)

		// Update each enabled subscriber
		for (const subscriber of sortedSubscribers) {
			try {
				subscriber.update(timestamp, deltaTime)
			} catch (error) {
				console.error(`Animation subscriber ${subscriber.id} error:`, error)
				// Continue with other subscribers even if one fails
			}
		}

		// Schedule next frame
		this.animationId = requestAnimationFrame(this.tick)
	}

	/**
	 * Force stop all animations (for cleanup)
	 */
	destroy(): void {
		this.subscribers.clear()
		this.stop()
		// Remove visibility listener
		if (typeof document !== 'undefined') {
			document.removeEventListener(
				'visibilitychange',
				this.handleVisibilityChange,
			)
		}
	}
}

// Singleton instance
export const AnimationController = new AnimationControllerClass()

// React hook for using the animation controller
export const useAnimationController = () => {
	return {
		subscribe: AnimationController.subscribe.bind(AnimationController),
		unsubscribe: AnimationController.unsubscribe.bind(AnimationController),
		setEnabled: AnimationController.setEnabled.bind(AnimationController),
		setPriority: AnimationController.setPriority.bind(AnimationController),
		updateAllPriorities:
			AnimationController.updateAllPriorities.bind(AnimationController),
		updatePrioritiesFromState:
			AnimationController.updatePrioritiesFromState.bind(AnimationController),
		getSubscriberCount:
			AnimationController.getSubscriberCount.bind(AnimationController),
		getIsRunning: AnimationController.getIsRunning.bind(AnimationController),
		setTargetFPS: AnimationController.setTargetFPS.bind(AnimationController),
		getTargetFPS: AnimationController.getTargetFPS.bind(AnimationController),
	}
}
