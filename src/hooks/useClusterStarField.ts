import {
	CenterClusterStar3D,
	ClusterStar3D,
} from '@/lib/starfield/ClusterStar3D'
import { Star3D } from '@/lib/starfield/Star3D'
import { CLUSTER_CONFIGS, ClusterVariant } from '@/types/starfield'
import { type MotionVector } from '@/types/transitions'
import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from './useMobileDetection'

// Extend Window to include nebula pattern cache
declare global {
	interface Window {
		__nebulaPattern?: CanvasPattern
	}
}

// Simple Perlin noise generator for nebula texture
type Perm = number[]
const perlinPerm: Perm = []
;(function initPerlin() {
	const p: number[] = []
	for (let i = 0; i < 256; i++) p[i] = i
	for (let i = 255; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[p[i], p[j]] = [p[j], p[i]]
	}
	for (let i = 0; i < 512; i++) perlinPerm[i] = p[i & 255]
})()
function fade(t: number) {
	return t * t * t * (t * (t * 6 - 15) + 10)
}
function lerp(a: number, b: number, t: number) {
	return a + t * (b - a)
}
function grad(hash: number, x: number, y: number) {
	const h = hash & 3
	const u = h < 2 ? x : y
	const v = h < 2 ? y : x
	return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}
function noise2D(x: number, y: number): number {
	const X = Math.floor(x) & 255
	const Y = Math.floor(y) & 255
	const xf = x - Math.floor(x)
	const yf = y - Math.floor(y)
	const aa = perlinPerm[perlinPerm[X] + Y]
	const ab = perlinPerm[perlinPerm[X] + Y + 1]
	const ba = perlinPerm[perlinPerm[X + 1] + Y]
	const bb = perlinPerm[perlinPerm[X + 1] + Y + 1]
	const u = fade(xf)
	const v = fade(yf)
	const x1 = lerp(grad(aa, xf, yf), grad(ba, xf - 1, yf), u)
	const x2 = lerp(grad(ab, xf, yf - 1), grad(bb, xf - 1, yf - 1), u)
	return (lerp(x1, x2, v) + 1) / 2
}

interface UseClusterStarFieldProps {
	variant: ClusterVariant
	opacity?: number
	stardustVariant?: 'halo' | 'sparkle' | 'bloom' | 'nebula'
	motionVector?: MotionVector
}

export const useClusterStarField = ({
	variant,
	opacity = 1.0,
	stardustVariant,
	motionVector,
}: UseClusterStarFieldProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const foregroundStarsRef = useRef<Star3D[]>([])
	const clusterStarsRef = useRef<ClusterStar3D[]>([])
	const centerStarsRef = useRef<CenterClusterStar3D[]>([])
	const animationRef = useRef<number>(0)
	const lastTimeRef = useRef<number>(0)
	const [isClient, setIsClient] = useState(false)
	const isMobile = useIsMobile()
	// Keep latest motionVector in a ref so changing it doesn't re-create animation loop
	const motionVectorRef = useRef(motionVector)

	// Get configuration for this variant
	const config = CLUSTER_CONFIGS[variant]

	// Ensure we're only running client-side
	useEffect(() => {
		setIsClient(true)
	}, [])

	// Update motionVectorRef whenever motionVector prop changes
	useEffect(() => {
		motionVectorRef.current = motionVector
	}, [motionVector])

	useEffect(() => {
		if (!isClient) return

		// Skip cluster rendering entirely on mobile devices
		if (isMobile) return

		// Additional client-side checks
		if (
			typeof document === 'undefined' ||
			typeof requestAnimationFrame === 'undefined'
		) {
			return
		}

		const width = window.innerWidth || 1920
		const height = window.innerHeight || 1080

		// Initialize star layers with configuration
		// Only create foreground stars if config specifies them
		foregroundStarsRef.current =
			config.foregroundStars > 0
				? Array.from(
						{ length: config.foregroundStars },
						() => new Star3D(width, height),
					)
				: []

		clusterStarsRef.current = Array.from(
			{ length: config.clusterStars },
			() =>
				new ClusterStar3D(
					width,
					height,
					config.clusterSemiMajorAxis,
					config.clusterSemiMinorAxis,
					config.clusterDistance,
				),
		)

		// Initialize center stars if configured
		centerStarsRef.current =
			config.centerStars && config.centerStars > 0
				? Array.from(
						{ length: config.centerStars },
						() =>
							new CenterClusterStar3D(
								width,
								height,
								config.clusterSemiMajorAxis,
								config.clusterSemiMinorAxis,
								config.centerStarDistance || config.clusterDistance,
								config.centerStarConcentration || 0.3,
								config.centerStarIntensityMultiplier || 1.0,
								config.centerStarSizeMultiplier || 1.0,
							),
					)
				: []

		const animate = (currentTime: number) => {
			if (!canvasRef.current) return

			const canvas = canvasRef.current
			const ctx = canvas.getContext('2d')
			if (!ctx) return

			let deltaTime = lastTimeRef.current
				? (currentTime - lastTimeRef.current) / 1000
				: 0
			// Clamp deltaTime to prevent visual jumps after tab switching
			if (deltaTime > 0.1) deltaTime = 0.1
			lastTimeRef.current = currentTime

			// Clear canvas with deep space black
			ctx.fillStyle = 'transparent'
			ctx.clearRect(0, 0, canvas.width, canvas.height)

			// Render distant cluster first (background layer)
			clusterStarsRef.current.forEach(star => {
				const forwardSpeed =
					motionVectorRef.current?.forward ?? config.approachSpeed
				const lateralSpeed = motionVectorRef.current?.lateral ?? 0
				const verticalSpeed = motionVectorRef.current?.vertical ?? 0

				// Debug logging disabled for cleaner output
				// if (lateralSpeed !== 0 && Math.floor(currentTime / 16) % 300 === 0) {
				// 	console.log('🌌 Cluster:', { lateral: lateralSpeed.toFixed(3) })
				// }

				star.update(forwardSpeed, -1.5, deltaTime, lateralSpeed, verticalSpeed)

				const projected = star.project(
					canvas.width,
					canvas.height,
					config.clusterFocalLength,
				)
				if (projected.visible) {
					// Apply size and intensity multipliers
					const finalSize =
						projected.size * (config.clusterSizeMultiplier || 1.0)
					const finalIntensity =
						projected.opacity * (config.clusterIntensityMultiplier || 1.0)

					// Slight blue tint for cluster stars (hot stellar cores)
					const clusterOpacity = finalIntensity * opacity
					ctx.fillStyle = `rgba(200, 220, 255, ${clusterOpacity})`
					ctx.beginPath()
					ctx.arc(projected.x, projected.y, finalSize, 0, Math.PI * 2)
					ctx.fill()
				}
			})

			// Render center stars (between cluster and foreground)
			centerStarsRef.current.forEach(star => {
				star.update(
					motionVectorRef.current?.forward ?? config.approachSpeed,
					-1.5,
					deltaTime,
					motionVectorRef.current?.lateral ?? 0,
					motionVectorRef.current?.vertical ?? 0,
				)

				const projected = star.project(
					canvas.width,
					canvas.height,
					config.clusterFocalLength,
				)
				if (projected.visible) {
					// Center stars get a warmer, more prominent color
					const centerOpacity = projected.opacity * opacity
					ctx.fillStyle = `rgba(255, 240, 220, ${centerOpacity})`
					ctx.beginPath()
					ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2)
					ctx.fill()
				}
			})

			// Render foreground stars (existing star field) - only if they exist
			if (foregroundStarsRef.current.length > 0) {
				foregroundStarsRef.current.forEach(star => {
					star.update(
						motionVectorRef.current?.forward ?? config.approachSpeed,
						-1.5,
						deltaTime,
						motionVectorRef.current?.lateral ?? 0,
						motionVectorRef.current?.vertical ?? 0,
					)

					const projected = star.project(
						canvas.width,
						canvas.height,
						config.foregroundFocalLength,
					)
					if (projected.visible) {
						const foregroundOpacity = projected.opacity * opacity
						ctx.fillStyle = `rgba(255, 255, 255, ${foregroundOpacity})`
						ctx.beginPath()
						ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2)
						ctx.fill()
					}
				})
			}

			// After rendering clusterStars:
			// --- Stardust effect variants ---
			if (stardustVariant) {
				switch (stardustVariant) {
					case 'halo':
						clusterStarsRef.current.forEach(star => {
							const projected = star.project(
								canvas.width,
								canvas.height,
								config.clusterFocalLength,
							)
							if (projected.visible) {
								const radius = projected.size * 1.5
								const gradient = ctx.createRadialGradient(
									projected.x,
									projected.y,
									projected.size,
									projected.x,
									projected.y,
									radius,
								)
								gradient.addColorStop(0, `rgba(255,240,220,0.5)`)
								gradient.addColorStop(1, 'transparent')
								ctx.globalCompositeOperation = 'lighter'
								ctx.fillStyle = gradient
								ctx.beginPath()
								ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2)
								ctx.fill()
								ctx.globalCompositeOperation = 'source-over'
							}
						})
						break
					case 'sparkle':
						{
							// Sparkle dust: random specks flickering around cluster
							const t = currentTime / 1000
							const speckCount = 200
							for (let i = 0; i < speckCount; i++) {
								const star =
									clusterStarsRef.current[
										Math.floor(Math.random() * clusterStarsRef.current.length)
									]
								const projected = star.project(
									canvas.width,
									canvas.height,
									config.clusterFocalLength,
								)
								if (!projected.visible) continue
								// flicker 0.1 -> 0.4 in 0.5s loops
								const phase = (t + i * 0.01) * ((2 * Math.PI) / 0.5)
								const flicker = 0.1 + 0.3 * (0.5 + 0.5 * Math.sin(phase))
								ctx.fillStyle = `rgba(220,240,255,${flicker * opacity})`
								ctx.beginPath()
								ctx.arc(projected.x, projected.y, 1, 0, Math.PI * 2)
								ctx.fill()
							}
						}
						break
					case 'bloom':
						{
							// Gaussian bloom: draw blurred, tinted copy of cluster region
							// use canvas filter for blur
							ctx.save()
							ctx.filter = 'blur(8px)'
							ctx.globalCompositeOperation = 'lighter'
							ctx.fillStyle = `rgba(180,220,255,${0.15 * opacity})`
							// fill full canvas, blur will spread
							ctx.fillRect(0, 0, canvas.width, canvas.height)
							ctx.restore()
						}
						break
					case 'nebula':
						{
							// Perlin-noise cloud: tile a drifting noise texture masked by a radial fade
							const size = 32
							const t = currentTime / 1000
							// generate pattern once
							if (!window.__nebulaPattern) {
								const noiseCanvas = document.createElement('canvas')
								noiseCanvas.width = size
								noiseCanvas.height = size
								const nCtx = noiseCanvas.getContext('2d')
								if (nCtx) {
									const imgData = nCtx.createImageData(size, size)
									for (let y = 0; y < size; y++) {
										for (let x = 0; x < size; x++) {
											const v = noise2D((x / size) * 4, (y / size) * 4)
											const alpha = Math.floor(v * 0.3 * 255)
											const idx = (y * size + x) * 4
											imgData.data[idx] = 255
											imgData.data[idx + 1] = 255
											imgData.data[idx + 2] = 255
											imgData.data[idx + 3] = alpha
										}
									}
									nCtx.putImageData(imgData, 0, 0)
								}
								const pattern = ctx.createPattern(noiseCanvas, 'repeat')
								if (pattern) window.__nebulaPattern = pattern
							}
							// draw with drifting offset
							const driftX = (t * 10) % size
							const driftY = (t * 5) % size
							ctx.save()
							ctx.translate(-driftX, -driftY)
							ctx.globalAlpha = opacity
							ctx.fillStyle = window.__nebulaPattern!
							ctx.fillRect(0, 0, canvas.width + size, canvas.height + size)
							ctx.restore()
							// radial fade mask
							ctx.save()
							ctx.globalCompositeOperation = 'destination-in'
							const cx = canvas.width / 2
							const cy = canvas.height / 2
							const innerR = Math.min(canvas.width, canvas.height) / 4
							const outerR = Math.max(canvas.width, canvas.height) / 2
							const mask = ctx.createRadialGradient(
								cx,
								cy,
								innerR,
								cx,
								cy,
								outerR,
							)
							mask.addColorStop(0, 'rgba(0,0,0,1)')
							mask.addColorStop(1, 'rgba(0,0,0,0)')
							ctx.fillStyle = mask
							ctx.fillRect(0, 0, canvas.width, canvas.height)
							ctx.restore()
							ctx.globalCompositeOperation = 'source-over'
						}
						break
				}
			}
			animationRef.current = requestAnimationFrame(animate)
		}

		const resizeCanvas = () => {
			if (canvasRef.current) {
				canvasRef.current.width = canvasRef.current.offsetWidth
				canvasRef.current.height = canvasRef.current.offsetHeight

				// Update canvas size for all stars
				const allStars = [
					...foregroundStarsRef.current,
					...clusterStarsRef.current,
					...centerStarsRef.current,
				]
				allStars.forEach(star => {
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
	}, [isClient, variant, opacity, config, isMobile, stardustVariant])

	return canvasRef
}
