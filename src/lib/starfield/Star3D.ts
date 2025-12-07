import { WEBGL_STARFIELD_CONFIG } from './webglConfig'

// Constants for performance
const SQRT_2 = Math.sqrt(2)
// Kept at 120k - rotation pivot at z=-25k provides subtle motion without needing larger spawn area
// Maintains good density while ensuring rotation coverage
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
		const intensityConfig = WEBGL_STARFIELD_CONFIG.foreground.intensity
		this.intensity =
			Math.random() * (intensityConfig.max - intensityConfig.min) +
			intensityConfig.min
		this.cachedScaleFactor = this.calculateScaleFactor()
		this.reset()
	}

	private calculateScaleFactor(): number {
		// Use REFERENCE CSS dimensions (1512×884 retina baseline) to keep spawn area constant
		// This ensures consistent angular coverage across all display sizes
		const REFERENCE_WIDTH = 1512
		const REFERENCE_HEIGHT = 884
		const maxDimension = Math.max(REFERENCE_WIDTH, REFERENCE_HEIGHT)
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
		// Spawn from camera forward (0 to 50k) with fade-in handling distant stars
		this.z = Math.random() * 50000
	}

	// Fast visibility pre-check using current projected position
	isLikelyVisible(focalLength = 200): boolean {
		if (this.z <= 0) return false

		// Project to current screen coordinates (same as project() method)
		const screenX = this.canvasWidth / 2 + (this.x / this.z) * focalLength
		const screenY = this.canvasHeight / 2 + (this.y / this.z) * focalLength

		// Use generous margin to handle transitions and course changes
		// Increased to 3.0x to accommodate larger spawn area after devicePixelRatio fix
		const margin = Math.max(this.canvasWidth, this.canvasHeight) * 3.0

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
			// Recycle to far end (50k) with fade-in zone
			this.z = 50000 + overshoot
			this.x = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
			this.y = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		}
	}

	update(
		forwardSpeed: number,
		rollSpeed: number,
		deltaTime: number,
		lateralSpeed: number = 0,
		verticalSpeed: number = 0,
		depthParallaxFactor: number = 0,
	) {
		// Forward motion (toward viewer)
		this.z -= forwardSpeed * deltaTime

		// Depth-modulated lateral motion (left/right during course changes)
		// Closer stars (lower z) move faster, creating continuous depth perception
		// Reference depth chosen so mid-range stars move at base speed
		const referenceDepth = 5000
		const depthModulation =
			depthParallaxFactor > 0
				? 1 + (referenceDepth / this.z - 1) * depthParallaxFactor
				: 1
		this.x += lateralSpeed * depthModulation * deltaTime

		// Vertical motion (up/down, minimal during course changes)
		this.y += verticalSpeed * deltaTime

		const wrapThreshold = 50
		if (this.z <= wrapThreshold) {
			const overshoot = wrapThreshold - this.z
			// Recycle to far end (50k) with fade-in zone
			this.z = 50000 + overshoot
			this.x = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
			this.y = (Math.random() - 0.5) * BASE_SPAWN_SIZE * this.cachedScaleFactor
		}

		// Apply continuous roll rotation (XY plane only)
		// Pivot at z=-25k makes angular motion less apparent from camera's perspective
		const rollAngle = (rollSpeed * deltaTime * Math.PI) / 180
		const cos = Math.cos(rollAngle)
		const sin = Math.sin(rollAngle)
		const newX = this.x * cos - this.y * sin
		const newY = this.x * sin + this.y * cos
		this.x = newX
		this.y = newY
		// Z stays unchanged (rotation is only in XY plane)
	}

	project(screenWidth: number, screenHeight: number, focalLength = 200) {
		const screenX = screenWidth / 2 + (this.x / this.z) * focalLength
		const screenY = screenHeight / 2 + (this.y / this.z) * focalLength

		const size = Math.max(0.5, Math.min(2, (20000 / this.z) * 1.5))
		let opacity = this.intensity * Math.min(1, 50000 / this.z)

		// Add near-clip fade zone to prevent "blinking" appearance
		// Stars fade in as they get very close (z < 5000)
		if (this.z < 5000) {
			const fadeFactor = this.z / 5000 // 0 at camera, 1 at z=5000
			opacity *= fadeFactor
		}

		// Add far-clip fade zone to prevent stars "popping in" at max distance
		// Stars fade in as they spawn at z=40k-50k
		if (this.z > 40000) {
			const fadeFactor = (50000 - this.z) / 10000 // 0 at z=50k, 1 at z=40k
			opacity *= fadeFactor
		}

		return {
			x: screenX,
			y: screenY,
			size,
			opacity: Math.max(0.05, Math.min(1, opacity)),
			visible:
				screenX >= -10 &&
				screenX <= screenWidth + 10 &&
				screenY >= -10 &&
				screenY <= screenHeight + 10 &&
				this.z > 0,
		}
	}
}
