import { useGlow } from '@/contexts/GlowContext'
import {
	AnimationController,
	type AnimationSubscriber,
} from '@/lib/animation/AnimationController'
import {
	CenterClusterStar3D,
	ClusterStar3D,
} from '@/lib/starfield/ClusterStar3D'
import { WebGLClusterRenderer } from '@/lib/starfield/WebGLClusterRenderer'
import { WEBGL_STARFIELD_CONFIG } from '@/lib/starfield/webglConfig'
import { type MotionVector } from '@/types/transitions'
import { useEffect, useRef, useState } from 'react'

interface UseWebGLClusterStarFieldProps {
	opacity: number
	motionVector?: MotionVector
}

export const useWebGLClusterStarField = ({
	opacity,
	motionVector,
}: UseWebGLClusterStarFieldProps) => {
	const { glowEnabled } = useGlow()
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const coreStarsRef = useRef<ClusterStar3D[]>([])
	const outerStarsRef = useRef<CenterClusterStar3D[]>([])
	const glowEnabledRef = useRef(glowEnabled)
	const rendererRef = useRef<WebGLClusterRenderer | null>(null)
	// Keep latest motionVector in a ref so changing it doesn't re-create animation loop
	const motionVectorRef = useRef(motionVector)
	// Unique ID for this cluster starfield instance
	const instanceIdRef = useRef(
		`webgl-cluster-starfield-${Math.random().toString(36).substr(2, 9)}`,
	)
	const [isClient, setIsClient] = useState(false)

	// Ensure we're only running client-side
	useEffect(() => {
		setIsClient(true)
	}, [])

	// Update motionVectorRef whenever motionVector prop changes
	useEffect(() => {
		motionVectorRef.current = motionVector
	}, [motionVector])

	useEffect(() => {
		glowEnabledRef.current = glowEnabled
	}, [glowEnabled])

	useEffect(() => {
		// Capture the instance ID at the start of the effect to avoid stale closures
		const instanceId = instanceIdRef.current

		if (!isClient) return

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
			// Initialize WebGL cluster renderer
			rendererRef.current = new WebGLClusterRenderer(canvas)
		} catch (error) {
			console.error('Failed to initialize WebGL cluster renderer:', error)
			return
		}

		const width = window.innerWidth || 1920
		const height = window.innerHeight || 1080

		// Initialize star layers with configuration
		// All values now come from WEBGL_STARFIELD_CONFIG for independent tuning
		const coreStarCount = WEBGL_STARFIELD_CONFIG.starCounts.core
		const outerStarCount = WEBGL_STARFIELD_CONFIG.starCounts.outer
		const coreGeom = WEBGL_STARFIELD_CONFIG.core.geometry
		const outerGeom = WEBGL_STARFIELD_CONFIG.outer.geometry
		const outerModifiers = WEBGL_STARFIELD_CONFIG.outer.modifiers

		// Core stars (main galactic mass)
		coreStarsRef.current = Array.from(
			{ length: coreStarCount },
			() =>
				new ClusterStar3D(
					width,
					height,
					coreGeom.semiMajorAxis,
					coreGeom.semiMinorAxis,
					coreGeom.distance,
				),
		)

		// Outer stars (extended halo) if configured
		if (outerStarCount > 0) {
			outerStarsRef.current = Array.from(
				{ length: outerStarCount },
				() =>
					new CenterClusterStar3D(
						width,
						height,
						outerGeom.semiMajorAxis,
						outerGeom.semiMinorAxis,
						outerGeom.distance,
						outerGeom.concentration,
						outerModifiers.intensity,
						outerModifiers.size,
					),
			)
		}

		const resizeCanvas = () => {
			if (canvasRef.current) {
				const dpr = window.devicePixelRatio || 1
				const displayWidth = canvasRef.current.offsetWidth
				const displayHeight = canvasRef.current.offsetHeight

				// Set canvas resolution to match physical pixels
				canvasRef.current.width = displayWidth * dpr
				canvasRef.current.height = displayHeight * dpr

				// Update all stars with new canvas size
				coreStarsRef.current.forEach(star => {
					star.updateCanvasSize(
						canvasRef.current!.width,
						canvasRef.current!.height,
					)
				})

				outerStarsRef.current.forEach(star => {
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

				// Update core stars
				coreStarsRef.current.forEach(star => {
					const forwardSpeed =
						motionVectorRef.current?.forward ??
						WEBGL_STARFIELD_CONFIG.core.physics.approachSpeed
					const lateralSpeed = motionVectorRef.current?.lateral ?? 0
					const verticalSpeed = motionVectorRef.current?.vertical ?? 0

					star.update(
						forwardSpeed,
						WEBGL_STARFIELD_CONFIG.core.physics.rollSpeed,
						deltaTime,
						lateralSpeed,
						verticalSpeed,
					)
				})

				// Update outer stars
				outerStarsRef.current.forEach(star => {
					const forwardSpeed =
						motionVectorRef.current?.forward ??
						WEBGL_STARFIELD_CONFIG.core.physics.approachSpeed
					const lateralSpeed = motionVectorRef.current?.lateral ?? 0
					const verticalSpeed = motionVectorRef.current?.vertical ?? 0

					star.update(
						forwardSpeed,
						WEBGL_STARFIELD_CONFIG.core.physics.rollSpeed,
						deltaTime,
						lateralSpeed,
						verticalSpeed,
					)
				})

				// Render using WebGL with rotating glow
				rendererRef.current.render(
					coreStarsRef.current,
					outerStarsRef.current,
					canvas,
					opacity,
					WEBGL_STARFIELD_CONFIG.core.physics.focalLength,
					glowEnabledRef.current,
					WEBGL_STARFIELD_CONFIG.core.physics.rollSpeed,
					deltaTime,
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
	}, [isClient, opacity])

	return canvasRef
}
