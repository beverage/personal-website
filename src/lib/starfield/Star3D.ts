// Constants for performance
const SQRT_2 = Math.sqrt(2)
const BASE_SPAWN_SIZE = 120000
const BASE_SCALE_DENOMINATOR = 800

export class Star3D {
	canvasWidth: number
	canvasHeight: number
	x: number
	y: number
	z: number
	intensity: number
	private cachedScaleFactor: number

	constructor(canvasWidth: number = 1920, canvasHeight: number = 1080) {
		this.canvasWidth = canvasWidth
		this.canvasHeight = canvasHeight
		this.x = 0
		this.y = 0
		this.z = 0
		this.intensity = Math.random() * 0.7 + 0.3
		this.cachedScaleFactor = this.calculateScaleFactor()
		this.reset()
	}

	private calculateScaleFactor(): number {
		const maxDimension = Math.max(this.canvasWidth, this.canvasHeight)
		return (maxDimension / BASE_SCALE_DENOMINATOR) * SQRT_2
	}

	updateCanvasSize(width: number, height: number) {
		this.canvasWidth = width
		this.canvasHeight = height
		this.cachedScaleFactor = this.calculateScaleFactor()
	}

	reset() {
		this.x = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		this.y = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		this.z = 10000 + Math.random() * 40000
	}

	// Fast visibility pre-check using current projected position
	isLikelyVisible(focalLength = 200): boolean {
		if (this.z <= 0) return false

		// Project to current screen coordinates (same as project() method)
		const screenX = this.canvasWidth / 2 + (this.x / this.z) * focalLength
		const screenY = this.canvasHeight / 2 + (this.y / this.z) * focalLength

		// Calculate margin based on screen aspect ratio
		const aspectRatio =
			Math.max(this.canvasWidth, this.canvasHeight) /
			Math.min(this.canvasWidth, this.canvasHeight)
		const margin = 50 * aspectRatio // 50px base margin scaled by aspect ratio

		// Check if within screen bounds plus margin
		return (
			screenX >= -margin &&
			screenX <= this.canvasWidth + margin &&
			screenY >= -margin &&
			screenY <= this.canvasHeight + margin
		)
	}

	// Minimal update for off-screen stars (only forward movement and wrap)
	updateMinimal(forwardSpeed: number, deltaTime: number) {
		this.z -= forwardSpeed * deltaTime

		const wrapThreshold = 50
		if (this.z <= wrapThreshold) {
			const overshoot = wrapThreshold - this.z
			this.z = 50000 + overshoot
			this.x = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
			this.y = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		}
	}

	update(forwardSpeed: number, rollSpeed: number, deltaTime: number) {
		this.z -= forwardSpeed * deltaTime

		const wrapThreshold = 50
		if (this.z <= wrapThreshold) {
			const overshoot = wrapThreshold - this.z
			this.z = 50000 + overshoot
			this.x = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
			this.y = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		}

		const rollAngle = (rollSpeed * deltaTime * Math.PI) / 180
		const cos = Math.cos(rollAngle)
		const sin = Math.sin(rollAngle)
		const newX = this.x * cos - this.y * sin
		const newY = this.x * sin + this.y * cos
		this.x = newX
		this.y = newY
	}

	project(screenWidth: number, screenHeight: number, focalLength = 200) {
		const screenX = screenWidth / 2 + (this.x / this.z) * focalLength
		const screenY = screenHeight / 2 + (this.y / this.z) * focalLength

		const size = Math.max(0.5, Math.min(2, (20000 / this.z) * 1.5))
		const opacity = this.intensity * Math.min(1, 50000 / this.z)

		return {
			x: screenX,
			y: screenY,
			size,
			opacity: Math.max(0.1, Math.min(1, opacity)),
			visible:
				screenX >= -10 &&
				screenX <= screenWidth + 10 &&
				screenY >= -10 &&
				screenY <= screenHeight + 10 &&
				this.z > 0,
		}
	}
}
