import { WEBGL_STARFIELD_CONFIG } from './webglConfig'

// Projection constants used by both WebGL and Canvas2D renderers
const SIZE_MIN = 0.3
const SIZE_MAX = 1.5
const SIZE_SCALE_FACTOR = 200000
const SIZE_SCALE_MULTIPLIER = 2
const OPACITY_BASE_MAX = 1.0
const OPACITY_SCALE_FACTOR = 1000000

export class ClusterStar3D {
	canvasWidth: number
	canvasHeight: number
	x: number
	y: number
	z: number
	intensity: number
	private clusterSemiMajorAxis: number
	private clusterSemiMinorAxis: number
	private clusterDistance: { min: number; max: number }

	constructor(
		canvasWidth: number = 1920,
		canvasHeight: number = 1080,
		clusterSemiMajorAxis: number = 30000,
		clusterSemiMinorAxis: number = 30000,
		clusterDistance: { min: number; max: number } = {
			min: 500000,
			max: 5000000,
		},
	) {
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.clusterSemiMajorAxis = clusterSemiMajorAxis
		this.clusterSemiMinorAxis = clusterSemiMinorAxis
		this.clusterDistance = clusterDistance
		this.x = 0
		this.y = 0
		this.z = 0
		const intensityConfig = WEBGL_STARFIELD_CONFIG.core.rendering.intensity
		this.intensity =
			Math.random() * (intensityConfig.max - intensityConfig.min) +
			intensityConfig.min
		this.reset()
	}

	updateCanvasSize(width: number, height: number) {
		this.canvasWidth = width
		this.canvasHeight = height
	}

	reset() {
		// Gaussian distributed cluster using Box-Muller transform
		// This creates a natural elliptical galaxy-like distribution
		const sigma = WEBGL_STARFIELD_CONFIG.core.geometry.standardDeviation

		// Box-Muller transform for gaussian distribution around center
		const u1 = Math.random()
		const u2 = Math.random()
		const mag = sigma * Math.sqrt(-2.0 * Math.log(u1))
		const angle = 2.0 * Math.PI * u2

		// Scale by ellipse axes to create elliptical distribution
		this.x = mag * Math.cos(angle) * this.clusterSemiMajorAxis
		this.y = mag * Math.sin(angle) * this.clusterSemiMinorAxis

		// Much more distant z-range for slow movement effect
		const range = this.clusterDistance.max - this.clusterDistance.min
		this.z = this.clusterDistance.min + Math.random() * range
	}

	update(
		forwardSpeed: number,
		rollSpeed: number,
		deltaTime: number,
		lateralSpeed: number = 0,
		verticalSpeed: number = 0,
	) {
		// Forward motion - move at same absolute speed but appears much slower due to distance
		this.z -= forwardSpeed * deltaTime

		// Lateral motion (left/right during course changes) - minimal due to distance
		this.x += lateralSpeed * deltaTime

		// Vertical motion (up/down, minimal during course changes)
		this.y += verticalSpeed * deltaTime

		// Much more distant wrap point - stars cycle very slowly
		const wrapThreshold = 100000 // 2000x farther than foreground
		if (this.z <= wrapThreshold) {
			const overshoot = wrapThreshold - this.z
			this.z = this.clusterDistance.max + overshoot // Reset to very far distance

			// Regenerate cluster position using same elliptical gaussian distribution
			const sigma = WEBGL_STARFIELD_CONFIG.core.geometry.standardDeviation

			const u1 = Math.random()
			const u2 = Math.random()
			const mag = sigma * Math.sqrt(-2.0 * Math.log(u1))
			const angle = 2.0 * Math.PI * u2

			this.x = mag * Math.cos(angle) * this.clusterSemiMajorAxis
			this.y = mag * Math.sin(angle) * this.clusterSemiMinorAxis
		}

		// Apply same rotation as foreground stars for consistency
		const rollAngle = (rollSpeed * deltaTime * Math.PI) / 180
		const cos = Math.cos(rollAngle)
		const sin = Math.sin(rollAngle)
		const newX = this.x * cos - this.y * sin
		const newY = this.x * sin + this.y * cos
		this.x = newX
		this.y = newY
	}

	project(screenWidth: number, screenHeight: number, focalLength = 400) {
		const screenX = screenWidth / 2 + (this.x / this.z) * focalLength
		const screenY = screenHeight / 2 + (this.y / this.z) * focalLength

		// Distant stars remain very small but visible
		const size = Math.max(
			SIZE_MIN,
			Math.min(SIZE_MAX, (SIZE_SCALE_FACTOR / this.z) * SIZE_SCALE_MULTIPLIER),
		)
		const opacity =
			this.intensity * Math.min(OPACITY_BASE_MAX, OPACITY_SCALE_FACTOR / this.z)

		return {
			x: screenX,
			y: screenY,
			size,
			opacity,
			visible:
				screenX >= -5 &&
				screenX <= screenWidth + 5 &&
				screenY >= -5 &&
				screenY <= screenHeight + 5 &&
				this.z > 0,
		}
	}
}

export class CenterClusterStar3D {
	canvasWidth: number
	canvasHeight: number
	x: number
	y: number
	z: number
	intensity: number
	private clusterSemiMajorAxis: number
	private clusterSemiMinorAxis: number
	private clusterDistance: { min: number; max: number }
	private concentration: number
	private intensityMultiplier: number
	private sizeMultiplier: number

	constructor(
		canvasWidth: number = 1920,
		canvasHeight: number = 1080,
		clusterSemiMajorAxis: number = 30000,
		clusterSemiMinorAxis: number = 30000,
		clusterDistance: { min: number; max: number } = {
			min: 500000,
			max: 5000000,
		},
		concentration: number = 0.3,
		intensityMultiplier: number = 1.0,
		sizeMultiplier: number = 1.0,
	) {
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.clusterSemiMajorAxis = clusterSemiMajorAxis
		this.clusterSemiMinorAxis = clusterSemiMinorAxis
		this.clusterDistance = clusterDistance
		this.concentration = concentration
		this.intensityMultiplier = intensityMultiplier
		this.sizeMultiplier = sizeMultiplier
		this.x = 0
		this.y = 0
		this.z = 0
		const intensityConfig = WEBGL_STARFIELD_CONFIG.outer.rendering.intensity
		this.intensity =
			Math.random() * (intensityConfig.max - intensityConfig.min) +
			intensityConfig.min
		this.reset()
	}

	updateCanvasSize(width: number, height: number) {
		this.canvasWidth = width
		this.canvasHeight = height
	}

	reset() {
		// Gaussian distributed outer stars with higher concentration
		const sigma = WEBGL_STARFIELD_CONFIG.outer.geometry.standardDeviation

		// Generate concentrated elliptical distribution for outer stars
		const effectiveSemiMajorAxis =
			this.clusterSemiMajorAxis * this.concentration
		const effectiveSemiMinorAxis =
			this.clusterSemiMinorAxis * this.concentration

		// Box-Muller transform for gaussian distribution around center
		// Don't apply concentration to magnitude - only to axis sizes above
		const u1 = Math.random()
		const u2 = Math.random()
		const mag = sigma * Math.sqrt(-2.0 * Math.log(u1))
		const angle = 2.0 * Math.PI * u2

		// Scale by ellipse axes to create elliptical distribution
		this.x = mag * Math.cos(angle) * effectiveSemiMajorAxis
		this.y = mag * Math.sin(angle) * effectiveSemiMinorAxis

		// Use specified distance range for outer stars
		const range = this.clusterDistance.max - this.clusterDistance.min
		this.z = this.clusterDistance.min + Math.random() * range
	}

	update(
		forwardSpeed: number,
		rollSpeed: number,
		deltaTime: number,
		lateralSpeed: number = 0,
		verticalSpeed: number = 0,
	) {
		// Forward motion - move at same absolute speed but appears much slower due to distance
		this.z -= forwardSpeed * deltaTime

		// Lateral motion (left/right during course changes) - minimal due to distance
		this.x += lateralSpeed * deltaTime

		// Vertical motion (up/down, minimal during course changes)
		this.y += verticalSpeed * deltaTime

		// Wrap threshold should match the distance range used
		const wrapThreshold = Math.min(100000, this.clusterDistance.min * 0.5)
		if (this.z <= wrapThreshold) {
			const overshoot = wrapThreshold - this.z
			this.z = this.clusterDistance.max + overshoot // Reset to far distance

			// Regenerate outer star position using concentrated distribution
			const sigma = WEBGL_STARFIELD_CONFIG.outer.geometry.standardDeviation
			const effectiveSemiMajorAxis =
				this.clusterSemiMajorAxis * this.concentration
			const effectiveSemiMinorAxis =
				this.clusterSemiMinorAxis * this.concentration

			const u1 = Math.random()
			const u2 = Math.random()
			const mag = sigma * Math.sqrt(-2.0 * Math.log(u1))
			const angle = 2.0 * Math.PI * u2

			this.x = mag * Math.cos(angle) * effectiveSemiMajorAxis
			this.y = mag * Math.sin(angle) * effectiveSemiMinorAxis
		}

		// Apply same rotation as foreground stars for consistency
		const rollAngle = (rollSpeed * deltaTime * Math.PI) / 180
		const cos = Math.cos(rollAngle)
		const sin = Math.sin(rollAngle)
		const newX = this.x * cos - this.y * sin
		const newY = this.x * sin + this.y * cos
		this.x = newX
		this.y = newY
	}

	project(screenWidth: number, screenHeight: number, focalLength = 400) {
		const screenX = screenWidth / 2 + (this.x / this.z) * focalLength
		const screenY = screenHeight / 2 + (this.y / this.z) * focalLength

		// Calculate size with multiplier
		const baseSize = Math.max(
			SIZE_MIN,
			Math.min(SIZE_MAX, (SIZE_SCALE_FACTOR / this.z) * SIZE_SCALE_MULTIPLIER),
		)
		const size = baseSize * this.sizeMultiplier

		// Calculate opacity with intensity multiplier
		const baseOpacity =
			this.intensity * Math.min(OPACITY_BASE_MAX, OPACITY_SCALE_FACTOR / this.z)
		const opacity = baseOpacity * this.intensityMultiplier

		return {
			x: screenX,
			y: screenY,
			size,
			opacity: Math.max(0.05, Math.min(0.8, opacity)), // Allow higher opacity for outer stars
			visible:
				screenX >= -5 &&
				screenX <= screenWidth + 5 &&
				screenY >= -5 &&
				screenY <= screenHeight + 5 &&
				this.z > 0,
		}
	}
}
