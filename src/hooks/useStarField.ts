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
	const animationRef = useRef<number>(0)
	const lastTimeRef = useRef<number>(0)
	const [isClient, setIsClient] = useState(false)

	// Ensure we're only running client-side
	useEffect(() => {
		setIsClient(true)
	}, [])

	useEffect(() => {
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

		const animate = (currentTime: number) => {
			if (!canvasRef.current) {
				return
			}

			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')
			if (!ctx) {
				return
			}

			let deltaTime = lastTimeRef.current
				? (currentTime - lastTimeRef.current) / 1000
				: 0
			// Clamp deltaTime to prevent visual jumps after tab switching
			if (deltaTime > 0.1) deltaTime = 0.1
			lastTimeRef.current = currentTime

			// Removed noisy debug logging

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

			// Performance stats removed for cleaner debugging

			animationRef.current = requestAnimationFrame(animate)
		}

		const resizeCanvas = () => {
			if (canvasRef.current) {
				canvasRef.current.width = canvasRef.current.offsetWidth
				canvasRef.current.height = canvasRef.current.offsetHeight

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

		animationRef.current = requestAnimationFrame(animate)

		return () => {
			window.removeEventListener('resize', resizeCanvas)
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current)
			}
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
