// Constants for performance
const BASE_SCALE_DENOMINATOR = 800

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
		this.intensity = Math.random() * 0.8 + 0.2
		this.reset()
	}

	updateCanvasSize(width: number, height: number) {
		this.canvasWidth = width
		this.canvasHeight = height
	}

	reset() {
		const maxDimension = Math.max(this.canvasWidth, this.canvasHeight)
		const scaleFactor = maxDimension / BASE_SCALE_DENOMINATOR

		// Generate elliptical cluster distribution using Box-Muller transform
		// This creates a natural stellar cluster density falloff from center
		const effectiveSemiMajorAxis = this.clusterSemiMajorAxis * scaleFactor
		const effectiveSemiMinorAxis = this.clusterSemiMinorAxis * scaleFactor

		// Box-Muller transform for gaussian distribution around center
		const u1 = Math.random()
		const u2 = Math.random()
		const mag = Math.sqrt(-2.0 * Math.log(u1))
		const angle = 2.0 * Math.PI * u2

		// Scale by ellipse axes to create elliptical distribution
		this.x = mag * Math.cos(angle) * effectiveSemiMajorAxis
		this.y = mag * Math.sin(angle) * effectiveSemiMinorAxis

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
			const maxDimension = Math.max(this.canvasWidth, this.canvasHeight)
			const scaleFactor = maxDimension / BASE_SCALE_DENOMINATOR
			const effectiveSemiMajorAxis = this.clusterSemiMajorAxis * scaleFactor
			const effectiveSemiMinorAxis = this.clusterSemiMinorAxis * scaleFactor

			const u1 = Math.random()
			const u2 = Math.random()
			const mag = Math.sqrt(-2.0 * Math.log(u1))
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

		// Distant stars remain very small but visible
		const size = Math.max(0.3, Math.min(1.5, (200000 / this.z) * 2))
		const opacity = this.intensity * Math.min(0.8, 1000000 / this.z)

		return {
			x: screenX,
			y: screenY,
			size,
			opacity: Math.max(0.05, Math.min(0.6, opacity)),
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
		this.intensity = Math.random() * 0.8 + 0.2
		this.reset()
	}

	updateCanvasSize(width: number, height: number) {
		this.canvasWidth = width
		this.canvasHeight = height
	}

	reset() {
		const maxDimension = Math.max(this.canvasWidth, this.canvasHeight)
		const scaleFactor = maxDimension / BASE_SCALE_DENOMINATOR

		// Generate concentrated elliptical distribution for center stars
		const effectiveSemiMajorAxis =
			this.clusterSemiMajorAxis * scaleFactor * this.concentration
		const effectiveSemiMinorAxis =
			this.clusterSemiMinorAxis * scaleFactor * this.concentration

		// Box-Muller transform for gaussian distribution around center
		// Don't apply concentration to magnitude - only to axis sizes above
		const u1 = Math.random()
		const u2 = Math.random()
		const mag = Math.sqrt(-2.0 * Math.log(u1))
		const angle = 2.0 * Math.PI * u2

		// Scale by ellipse axes to create elliptical distribution
		this.x = mag * Math.cos(angle) * effectiveSemiMajorAxis
		this.y = mag * Math.sin(angle) * effectiveSemiMinorAxis

		// Use specified distance range for center stars
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

			// Regenerate center star position using concentrated distribution
			const maxDimension = Math.max(this.canvasWidth, this.canvasHeight)
			const scaleFactor = maxDimension / BASE_SCALE_DENOMINATOR
			const effectiveSemiMajorAxis =
				this.clusterSemiMajorAxis * scaleFactor * this.concentration
			const effectiveSemiMinorAxis =
				this.clusterSemiMinorAxis * scaleFactor * this.concentration

			const u1 = Math.random()
			const u2 = Math.random()
			const mag = Math.sqrt(-2.0 * Math.log(u1))
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
		const baseSize = Math.max(0.3, Math.min(1.5, (200000 / this.z) * 2))
		const size = baseSize * this.sizeMultiplier

		// Calculate opacity with intensity multiplier
		const baseOpacity = this.intensity * Math.min(0.8, 1000000 / this.z)
		const opacity = baseOpacity * this.intensityMultiplier

		return {
			x: screenX,
			y: screenY,
			size,
			opacity: Math.max(0.05, Math.min(0.8, opacity)), // Allow higher opacity for center stars
			visible:
				screenX >= -5 &&
				screenX <= screenWidth + 5 &&
				screenY >= -5 &&
				screenY <= screenHeight + 5 &&
				this.z > 0,
		}
	}
}
