import {
	AnimationController,
	type AnimationSubscriber,
} from '@/lib/animation/AnimationController'
import { renderTwinkleStar, Star3D, TwinkleVariant } from '@/lib/starfield'
import { type MotionVector } from '@/types/transitions'
import { useEffect, useRef, useState } from 'react'

interface UseStarFieldProps {
	starCount: number
	speed: number
	rollSpeed: number
	opacity: number
	variant: TwinkleVariant
	motionVector?: MotionVector
}

export const useStarField = ({
	starCount,
	speed,
	rollSpeed,
	opacity,
	variant,
	motionVector,
}: UseStarFieldProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const starsRef = useRef<Star3D[]>([])
	// Keep latest speed in a ref so changing speed doesn't re-create stars
	const speedRef = useRef(speed)
	// Keep latest rollSpeed in a ref so changing it doesn't re-create animation loop
	const rollSpeedRef = useRef(rollSpeed)
	// Keep latest motionVector in a ref so changing it doesn't re-create animation loop
	const motionVectorRef = useRef(motionVector)
	// Unique ID for this starfield instance
	const instanceIdRef = useRef(
		`starfield-${Math.random().toString(36).substr(2, 9)}`,
	)
	const [isClient, setIsClient] = useState(false)

	// Update speedRef whenever speed prop changes
	useEffect(() => {
		speedRef.current = speed
	}, [speed])

	// Update rollSpeedRef whenever rollSpeed prop changes
	useEffect(() => {
		rollSpeedRef.current = rollSpeed
	}, [rollSpeed])

	// Update motionVectorRef whenever motionVector prop changes
	useEffect(() => {
		motionVectorRef.current = motionVector
	}, [motionVector])

	// Ensure we're only running client-side
	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
		// Capture the instance ID at the start of the effect to avoid stale closures
		const instanceId = instanceIdRef.current

		// Double check we're on the client
		if (!isClient) {
			return
		}

		// Additional client-side checks
		if (
			typeof document === 'undefined' ||
			typeof requestAnimationFrame === 'undefined'
		) {
			return
		}

		const width = window.innerWidth || 1920
		const height = window.innerHeight || 1080

		starsRef.current = Array.from(
			{ length: starCount },
			() => new Star3D(width, height),
		)

		const resizeCanvas = () => {
			if (canvasRef.current) {
				const dpr = window.devicePixelRatio || 1
				const displayWidth = canvasRef.current.offsetWidth
				const displayHeight = canvasRef.current.offsetHeight

				// Set canvas resolution to match physical pixels
				canvasRef.current.width = displayWidth * dpr
				canvasRef.current.height = displayHeight * dpr

				starsRef.current.forEach(star => {
					star.updateCanvasSize(
						canvasRef.current!.width,
						canvasRef.current!.height,
					)
				})
			}
		}

		resizeCanvas()
		window.addEventListener('resize', resizeCanvas)

		// Create animation subscriber for centralized controller
		const subscriber: AnimationSubscriber = {
			id: instanceIdRef.current,
			priority: 10, // Standard priority for starfield
			enabled: true,
			update: (currentTime: number, deltaTime: number) => {
				if (!canvasRef.current) {
					return
				}

				const canvas = canvasRef.current
				const ctx = canvas.getContext('2d')
				if (!ctx) {
					return
				}

				// Clear canvas with deep space black
				ctx.fillStyle = 'transparent'
				ctx.clearRect(0, 0, canvas.width, canvas.height)

				starsRef.current.forEach(star => {
					// Fast visibility pre-check using current position + aspect-ratio margin
					if (star.isLikelyVisible()) {
						// Full update with rotation for potentially visible stars
						const forwardSpeed =
							motionVectorRef.current?.forward ?? speedRef.current
						const lateralSpeed = motionVectorRef.current?.lateral ?? 0
						const verticalSpeed = motionVectorRef.current?.vertical ?? 0

						star.update(
							forwardSpeed,
							rollSpeedRef.current,
							deltaTime,
							lateralSpeed,
							verticalSpeed,
						)

						const projected = star.project(canvas.width, canvas.height)
						if (projected.visible) {
							renderTwinkleStar(
								ctx,
								projected.x,
								projected.y,
								projected.size,
								projected.opacity * opacity,
								currentTime,
								variant,
							)
						}
					} else {
						// Minimal update for off-screen stars (no rotation, just forward movement)
						star.updateMinimal(
							motionVectorRef.current?.forward ?? speedRef.current,
							deltaTime,
						)
					}
				})
			},
		}

		// Subscribe to the centralized animation controller
		AnimationController.subscribe(subscriber)

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			// Unsubscribe from the centralized animation controller
			AnimationController.unsubscribe(instanceId)
		}
	}, [isClient, starCount, opacity, variant])

	return canvasRef
}

// Convenience hook with preset configurations
export const useStarFieldPreset = (
	variant: TwinkleVariant,
	opacity: number = 1.0,
) => {
	// Mobile detection: screen width < 768px (common mobile breakpoint)
	const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

	// Reduce star count by 50% on mobile for better performance
	const starCount = isMobile ? 2000 : 5000

	return useStarField({
		starCount,
		speed: 1000,
		rollSpeed: -1.5,
		opacity,
		variant,
	})
}
