import { useTwinkle } from '@/contexts/TwinkleContext'
import {
	AnimationController,
	type AnimationSubscriber,
} from '@/lib/animation/AnimationController'
import { Star3D } from '@/lib/starfield/Star3D'
import { WebGLStarfieldRenderer } from '@/lib/starfield/WebGLStarfieldRenderer'
import { type MotionVector } from '@/types/transitions'
import { useEffect, useRef, useState } from 'react'

interface UseWebGLStarFieldProps {
	starCount: number
	speed: number
	rollSpeed: number
	motionVector?: MotionVector
}

export const useWebGLStarField = ({
	starCount,
	speed,
	rollSpeed,
	motionVector,
}: UseWebGLStarFieldProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const starsRef = useRef<Star3D[]>([])
	const rendererRef = useRef<WebGLStarfieldRenderer | null>(null)
	// Keep latest speed in a ref so changing speed doesn't re-create stars
	const speedRef = useRef(speed)
	// Keep latest rollSpeed in a ref so changing it doesn't re-create animation loop
	const rollSpeedRef = useRef(rollSpeed)
	// Keep latest motionVector in a ref so changing it doesn't re-create animation loop
	const motionVectorRef = useRef(motionVector)
	// Unique ID for this starfield instance
	const instanceIdRef = useRef(
		`webgl-starfield-${Math.random().toString(36).substr(2, 9)}`,
	)
	const [isClient, setIsClient] = useState(false)
	const { twinkleEnabled } = useTwinkle()
	const twinkleEnabledRef = useRef(twinkleEnabled)

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

	// Update twinkleEnabledRef whenever twinkleEnabled changes
	useEffect(() => {
		twinkleEnabledRef.current = twinkleEnabled
	}, [twinkleEnabled])

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

		const canvas = canvasRef.current
		if (!canvas) {
			return
		}

		try {
			// Initialize WebGL renderer
			rendererRef.current = new WebGLStarfieldRenderer(canvas)
		} catch (error) {
			console.error('Failed to initialize WebGL renderer:', error)
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
				if (!canvasRef.current || !rendererRef.current) {
					return
				}

				const canvas = canvasRef.current

				// Update all stars
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
					} else {
						// Minimal update for off-screen stars (no rotation, just forward movement)
						star.updateMinimal(
							motionVectorRef.current?.forward ?? speedRef.current,
							deltaTime,
						)
					}
				})

				// Render using WebGL
				rendererRef.current.render(
					starsRef.current,
					canvas,
					currentTime,
					twinkleEnabledRef.current,
				)
			},
		}

		// Subscribe to the centralized animation controller
		AnimationController.subscribe(subscriber)

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			// Unsubscribe from the centralized animation controller
			AnimationController.unsubscribe(instanceId)
			// Dispose WebGL resources
			if (rendererRef.current) {
				rendererRef.current.dispose()
				rendererRef.current = null
			}
		}
	}, [isClient, starCount])

	return canvasRef
}
