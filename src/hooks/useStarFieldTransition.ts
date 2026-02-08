'use client'

import {
	type BankingRoll,
	type CourseChangeConfig,
	type MotionVector,
	type ParallaxFactors,
	type TransitionState,
	DEFAULT_PARALLAX_FACTORS,
	EASING_FUNCTIONS,
	settlingEase,
} from '@/types/transitions'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseStarFieldTransitionProps {
	config: CourseChangeConfig
	parallaxFactors?: ParallaxFactors
	baseForwardSpeed?: number
	onTransitionComplete?: () => void
	onContentFadeComplete?: () => void
}

interface UseStarFieldTransitionReturn {
	transitionState: TransitionState
	motionVectors: {
		foreground: MotionVector
		center: MotionVector
		background: MotionVector
	}
	bankingRoll: BankingRoll
	startTransition: (direction: 'left' | 'right') => void
	currentContentOpacity: number // Opacity for currently visible content (Hero, Projects, Contact)
	newContentOpacity: number // Opacity for content being transitioned to
	isTransitioning: boolean
	controlsReady: boolean // True when controlsRevealDelay has elapsed (or idle)
}

export const useStarFieldTransition = ({
	config,
	parallaxFactors = DEFAULT_PARALLAX_FACTORS,
	baseForwardSpeed = 300,
	onTransitionComplete,
	onContentFadeComplete,
}: UseStarFieldTransitionProps): UseStarFieldTransitionReturn => {
	const [transitionState, setTransitionState] = useState<TransitionState>({
		phase: 'idle',
		direction: null,
		progress: 0,
		startTime: 0,
	})

	const animationFrameRef = useRef<number>(0)
	const transitionStartTimeRef = useRef<number>(0) // Tracks original start time across phases
	const [controlsReady, setControlsReady] = useState<boolean>(true)

	// Cleanup animation frame on unmount
	useEffect(() => {
		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [])

	// Start a course change transition
	const startTransition = useCallback(
		(direction: 'left' | 'right') => {
			// Ignore if already transitioning
			if (transitionState.phase !== 'idle') {
				return
			}

			const startTime = performance.now()
			transitionStartTimeRef.current = startTime
			setControlsReady(false)
			setTransitionState({
				phase: 'transitioning',
				direction,
				progress: 0,
				startTime,
			})
		},
		[transitionState.phase],
	)

	// Calculate content opacity based on 3-phase fade system using LINEAR time distribution
	const calculateContentOpacity = useCallback(
		(rawProgress: number) => {
			const { fadeOutRatio, starfieldOnlyRatio, fadeInRatio } =
				config.contentFade

			// CRITICAL: Use LINEAR progress for accurate phase timing (ignore easing curves)
			// This separates phase timing from opacity smoothing, ensuring fade phases get
			// exactly the time allocation specified in the config ratios
			const linearProgress = rawProgress

			// Phase 1: Current content fades out (0 → fadeOutRatio)
			if (linearProgress <= fadeOutRatio) {
				const fadeOutProgress = linearProgress / fadeOutRatio // 0 → 1
				// Apply smooth cubic ease-out curve for natural fade
				const easedFadeOut = 1 - Math.pow(1 - fadeOutProgress, 3)
				return {
					currentContentOpacity: 1 - easedFadeOut, // 1 → 0 with smooth easing
					newContentOpacity: 0, // Hidden
				}
			}

			// Phase 2: Pure starfield (fadeOutRatio → fadeOutRatio + starfieldOnlyRatio)
			const starfieldEnd = fadeOutRatio + starfieldOnlyRatio
			if (linearProgress <= starfieldEnd) {
				return {
					currentContentOpacity: 0, // Hidden
					newContentOpacity: 0, // Hidden
				}
			}

			// Phase 3: New content fades in (starfieldEnd → 1.0)
			const fadeInProgress = (linearProgress - starfieldEnd) / fadeInRatio // 0 → 1
			// Apply smooth cubic ease-in curve for natural fade (matches fade-out)
			const easedFadeIn = Math.pow(fadeInProgress, 3)
			return {
				currentContentOpacity: 0, // Hidden
				newContentOpacity: easedFadeIn, // 0 → 1 with smooth easing
			}
		},
		[config.contentFade],
	)

	// Animation loop for transition progress
	useEffect(() => {
		if (transitionState.phase === 'idle') return

		const animate = (currentTime: number) => {
			const elapsed = currentTime - transitionState.startTime

			// SAFETY: Prevent negative elapsed time (timing race condition)
			if (elapsed < 0) {
				animationFrameRef.current = requestAnimationFrame(animate)
				return // Skip this frame, startTime not set properly yet
			}

			// Check if controls should be revealed (time-based, independent of phase)
			const totalElapsed = currentTime - transitionStartTimeRef.current
			if (!controlsReady && totalElapsed >= config.controlsRevealDelay) {
				setControlsReady(true)
			}

			const easingFn = EASING_FUNCTIONS[config.easingCurve]

			// Ensure easing function exists
			if (!easingFn) {
				console.error('Easing function not found:', config.easingCurve)
				return
			}

			if (transitionState.phase === 'transitioning') {
				const progress = Math.min(elapsed / config.duration, 1)

				// Apply easing with custom parameters if needed
				let easedProgress =
					config.easingCurve === 'custom' && config.customEasing
						? easingFn(
								progress,
								config.customEasing.accelerationPower,
								config.customEasing.decelerationPower,
							)
						: easingFn(progress)

				// Clamp easing values to valid range as safety measure
				if (isNaN(easedProgress) || easedProgress < 0 || easedProgress > 1) {
					easedProgress = isNaN(easedProgress)
						? progress
						: Math.max(0, Math.min(1, easedProgress))
				}

				// Calculate lateral velocity multiplier (for both motion and banking)
				// This represents the current turn rate
				const lateralVelocityMultiplier = easedProgress

				// Update banking roll proportional to lateral velocity (reduced frequency for smoothness)
				if (Math.floor(elapsed / 50) !== Math.floor((elapsed - 16) / 50)) {
					// Update every ~50ms instead of every frame
					const directionMultiplier =
						transitionState.direction === 'left' ? 1 : -1
					// Bank angle proportional to turn rate (lateral velocity), not accumulated distance
					const bankingRollAmount =
						((config.rollIntensity * Math.PI) / 180) *
						lateralVelocityMultiplier *
						directionMultiplier
					setBankingRoll({
						foregroundRollSpeed: -1.5 + bankingRollAmount, // Add banking to foreground
						backgroundRollSpeed: -1.5, // Keep background cluster unchanged
					})
				}

				// Update content opacity based on 3-phase fade system using RAW progress for timing
				const contentOpacity = calculateContentOpacity(progress) // Use raw progress for accurate phase timing
				setCurrentContentOpacity(contentOpacity.currentContentOpacity)
				setNewContentOpacity(contentOpacity.newContentOpacity)

				// Trigger fade complete callback when new content becomes fully visible
				if (
					contentOpacity.newContentOpacity === 1 &&
					contentOpacity.currentContentOpacity === 0
				) {
					onContentFadeComplete?.()
				}

				setTransitionState(prev => ({
					...prev,
					progress: easedProgress,
				}))

				if (progress >= 1) {
					// Transition to settling phase
					setTransitionState(prev => ({
						...prev,
						phase: 'settling',
						startTime: currentTime,
						progress: 0,
					}))
				}
			} else if (transitionState.phase === 'settling') {
				const progress = Math.min(elapsed / config.settlingDuration, 1)
				const easedProgress = settlingEase(progress)

				// Calculate remaining lateral velocity during settling (drift to zero)
				const remainingLateralVelocity = 1 - easedProgress

				// Update banking roll during settling (reduce roll as lateral velocity decreases)
				if (Math.floor(elapsed / 50) !== Math.floor((elapsed - 16) / 50)) {
					// Update every ~50ms instead of every frame
					const directionMultiplier =
						transitionState.direction === 'left' ? 1 : -1
					// Bank angle proportional to remaining lateral velocity
					const bankingRollAmount =
						((config.rollIntensity * Math.PI) / 180) *
						remainingLateralVelocity *
						directionMultiplier
					setBankingRoll({
						foregroundRollSpeed: -1.5 + bankingRollAmount, // Gradually return to base roll
						backgroundRollSpeed: -1.5, // Keep background cluster unchanged
					})
				}

				setTransitionState(prev => ({
					...prev,
					progress: easedProgress,
				}))

				if (progress >= 1) {
					// Return to idle state and reset banking roll
					setTransitionState({
						phase: 'idle',
						direction: null,
						progress: 0,
						startTime: 0,
					})
					setBankingRoll({
						foregroundRollSpeed: -1.5, // Reset to base roll
						backgroundRollSpeed: -1.5,
					})
					// Reset content opacity to idle state (current content visible, new content hidden)
					setCurrentContentOpacity(1)
					setNewContentOpacity(0)
					setControlsReady(true)
					onTransitionComplete?.()
					return
				}
			}

			animationFrameRef.current = requestAnimationFrame(animate)
		}

		animationFrameRef.current = requestAnimationFrame(animate)

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current)
			}
		}
	}, [
		transitionState.phase,
		transitionState.startTime,
		transitionState.direction,
		config.duration,
		config.settlingDuration,
		config.easingCurve,
		config.customEasing,
		config.rollIntensity,
		config.contentFade,
		config.controlsRevealDelay,
		controlsReady,
		calculateContentOpacity,
		onTransitionComplete,
		onContentFadeComplete,
	])

	// Store banking roll state that gets updated by animation loop
	const [bankingRoll, setBankingRoll] = useState<BankingRoll>({
		foregroundRollSpeed: -1.5,
		backgroundRollSpeed: -1.5,
	})

	// Store content opacity state for 3-phase fade system
	const [currentContentOpacity, setCurrentContentOpacity] = useState<number>(1)
	const [newContentOpacity, setNewContentOpacity] = useState<number>(0)

	// Calculate motion vectors based on current state
	const calculateMotionVectors = useCallback((): {
		foreground: MotionVector
		center: MotionVector
		background: MotionVector
	} => {
		const baseVector: MotionVector = {
			forward: baseForwardSpeed,
			lateral: 0,
			vertical: 0,
		}

		if (transitionState.phase === 'idle') {
			return {
				foreground: baseVector,
				center: baseVector,
				background: baseVector,
			}
		}

		// Calculate lateral speed based on phase and progress
		let lateralMultiplier = 0

		if (transitionState.phase === 'transitioning') {
			// Full lateral movement during main transition
			lateralMultiplier = transitionState.progress
		} else if (transitionState.phase === 'settling') {
			// Reduce lateral movement during settling
			lateralMultiplier = 1 - transitionState.progress
		}

		const directionMultiplier = transitionState.direction === 'left' ? 1 : -1
		const baseLateralSpeed =
			config.maxLateralSpeed * lateralMultiplier * directionMultiplier

		return {
			foreground: {
				forward: baseForwardSpeed,
				lateral: baseLateralSpeed * parallaxFactors.foreground,
				vertical: 0,
			},
			center: {
				forward: baseForwardSpeed,
				lateral: baseLateralSpeed * parallaxFactors.center,
				vertical: 0,
			},
			background: {
				forward: baseForwardSpeed,
				lateral: baseLateralSpeed * parallaxFactors.background,
				vertical: 0,
			},
		}
	}, [
		transitionState.phase,
		transitionState.progress,
		transitionState.direction,
		config.maxLateralSpeed,
		parallaxFactors,
		baseForwardSpeed,
	])

	const motionVectors = calculateMotionVectors()
	const isTransitioning = transitionState.phase !== 'idle'

	return {
		transitionState,
		motionVectors,
		bankingRoll,
		startTransition,
		currentContentOpacity,
		newContentOpacity,
		isTransitioning,
		controlsReady,
	}
}
