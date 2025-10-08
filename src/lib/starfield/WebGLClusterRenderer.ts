import { CenterClusterStar3D, ClusterStar3D } from './ClusterStar3D'
import { isWithinRenderBounds } from './renderUtils'
import { getScaledStarfieldConfig, WEBGL_STARFIELD_CONFIG } from './webglConfig'

/**
 * WebGL-based cluster starfield renderer with nebula/halo effects
 */
export class WebGLClusterRenderer {
	private gl: WebGLRenderingContext | WebGL2RenderingContext
	private program: WebGLProgram | null = null
	private positionBuffer: WebGLBuffer | null = null
	private sizeBuffer: WebGLBuffer | null = null
	private colorBuffer: WebGLBuffer | null = null
	private opacityBuffer: WebGLBuffer | null = null
	private canvas: HTMLCanvasElement
	private isContextLost = false

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas

		// Try WebGL2 first, fall back to WebGL1
		const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')

		if (!gl) {
			throw new Error('WebGL not supported')
		}

		this.gl = gl

		// Setup context loss handlers
		canvas.addEventListener('webglcontextlost', this.handleContextLost, false)
		canvas.addEventListener(
			'webglcontextrestored',
			this.handleContextRestored,
			false,
		)

		// Initialize WebGL resources
		this.init()
	}

	private init(): void {
		const { gl } = this

		// Enable blending for transparency
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		// Create shader program
		this.program = this.createShaderProgram()
		if (!this.program) {
			throw new Error('Failed to create shader program')
		}

		// Create buffers
		this.positionBuffer = gl.createBuffer()
		this.sizeBuffer = gl.createBuffer()
		this.colorBuffer = gl.createBuffer()
		this.opacityBuffer = gl.createBuffer()
	}

	private createShaderProgram(): WebGLProgram | null {
		const { gl } = this
		const gradient = WEBGL_STARFIELD_CONFIG.core.rendering.gradient

		// Vertex shader: transforms star positions and passes data to fragment shader
		// Note: Size multipliers are now applied CPU-side for per-group control
		const vertexShaderSource = `
			attribute vec2 a_position;
			attribute float a_size;
			attribute vec3 a_color;
			attribute float a_opacity;
			
			varying vec3 v_color;
			varying float v_opacity;
			
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				// Size already includes group-specific multiplier from CPU
				gl_PointSize = a_size;
				v_color = a_color;
				v_opacity = a_opacity;
			}
		`

		// Fragment shader: renders nebula/halo effect with radial gradient
		const fragmentShaderSource = `
			precision mediump float;
			varying vec3 v_color;
			varying float v_opacity;
			
			void main() {
				// Calculate distance from center of point
				vec2 coord = gl_PointCoord - vec2(0.5);
				float dist = length(coord) * 2.0;
				
				// Tighter circular edge - less bloom
				float circle = 1.0 - smoothstep(${gradient.circleEdgeStart.toFixed(2)}, ${gradient.circleEdgeEnd.toFixed(2)}, dist);
				
				// Much steeper falloff for crisp, defined stars like Canvas2D
				float alpha;
				if (dist < ${gradient.coreSizeThreshold.toFixed(2)}) {
					// Bright core
					alpha = 1.0;
				} else if (dist < ${gradient.midSizeThreshold.toFixed(2)}) {
					// Very steep falloff
					alpha = 1.0 - pow((dist - ${gradient.coreSizeThreshold.toFixed(2)}) / ${(gradient.midSizeThreshold - gradient.coreSizeThreshold).toFixed(2)}, 2.0);
				} else {
					// Minimal outer glow - tighter than before
					alpha = ${gradient.outerGlowAlpha.toFixed(2)} * (1.0 - (dist - ${gradient.midSizeThreshold.toFixed(2)}) / ${(1.0 - gradient.midSizeThreshold).toFixed(2)});
				}
				
				// Apply circular mask and opacity multiplier
				alpha *= circle * v_opacity;
				
				// Apply color with alpha
				gl_FragColor = vec4(v_color, alpha);
			}
		`

		// Compile shaders
		const vertexShader = this.compileShader(
			gl.VERTEX_SHADER,
			vertexShaderSource,
		)
		const fragmentShader = this.compileShader(
			gl.FRAGMENT_SHADER,
			fragmentShaderSource,
		)

		if (!vertexShader || !fragmentShader) {
			return null
		}

		// Link program
		const program = gl.createProgram()
		if (!program) {
			return null
		}

		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)

		// Check for linking errors
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Shader program link error:', gl.getProgramInfoLog(program))
			gl.deleteProgram(program)
			return null
		}

		// Clean up shaders (they're now part of the program)
		gl.deleteShader(vertexShader)
		gl.deleteShader(fragmentShader)

		return program
	}

	private compileShader(type: number, source: string): WebGLShader | null {
		const { gl } = this

		const shader = gl.createShader(type)
		if (!shader) {
			return null
		}

		gl.shaderSource(shader, source)
		gl.compileShader(shader)

		// Check for compilation errors
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.error('Shader compilation error:', gl.getShaderInfoLog(shader))
			gl.deleteShader(shader)
			return null
		}

		return shader
	}

	/**
	 * Render core and outer stars using WebGL with nebula/halo effects
	 */
	render(
		coreStars: ClusterStar3D[],
		outerStars: CenterClusterStar3D[],
		canvas: HTMLCanvasElement,
		opacity: number,
		focalLength: number = 300,
	): void {
		if (this.isContextLost || !this.program) {
			return
		}

		const { gl, program } = this

		// Get DPR-scaled config for consistent appearance across displays
		const dpr = window.devicePixelRatio || 1
		const scaledConfig = getScaledStarfieldConfig(dpr)

		// Set viewport to match canvas size
		gl.viewport(0, 0, canvas.width, canvas.height)

		// Clear canvas
		gl.clearColor(0.0, 0.0, 0.0, 0.0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		// Prepare star data for GPU
		const positions: number[] = []
		const sizes: number[] = []
		const colors: number[] = []
		const opacities: number[] = []

		// Calculate visibility margin from config
		// This ensures stars are visible during extreme course changes
		const margin =
			Math.max(canvas.width, canvas.height) *
			scaledConfig.renderingBounds.marginMultiplier

		// Add core stars
		const coreConfig = scaledConfig.core.rendering
		coreStars.forEach(star => {
			// Skip stars behind the camera
			if (star.z <= 0) return

			const projected = star.project(canvas.width, canvas.height, focalLength)

			// Check if star is within generous bounds
			if (
				isWithinRenderBounds(
					projected.x,
					projected.y,
					canvas.width,
					canvas.height,
					margin,
				)
			) {
				// Convert pixel coordinates to WebGL normalized device coordinates (-1 to 1)
				const x = (projected.x / canvas.width) * 2 - 1
				const y = -(projected.y / canvas.height) * 2 + 1 // Flip Y axis

				// Pre-multiply size with core-specific multiplier
				const multipliedSize = projected.size * coreConfig.sizeMultiplier

				// Apply DPR compensation for consistent visual size across displays
				// Divide by DPR first, then multiply by DPR for canvas pixels
				const dprCompensatedSize = multipliedSize / dpr
				const baseSize =
					coreConfig.minPixelSize > 0
						? Math.max(coreConfig.minPixelSize, dprCompensatedSize)
						: dprCompensatedSize
				const finalSize = baseSize * dpr

				positions.push(x, y)
				sizes.push(finalSize)
				// Core stars are white/blue
				colors.push(0.9, 0.95, 1.0)
				opacities.push(projected.opacity * opacity)
			}
		})

		// Add outer stars
		const outerConfig = scaledConfig.outer.rendering
		outerStars.forEach(star => {
			// Skip stars behind the camera
			if (star.z <= 0) return

			const projected = star.project(canvas.width, canvas.height, focalLength)

			// Check if star is within generous bounds
			if (
				isWithinRenderBounds(
					projected.x,
					projected.y,
					canvas.width,
					canvas.height,
					margin,
				)
			) {
				const x = (projected.x / canvas.width) * 2 - 1
				const y = -(projected.y / canvas.height) * 2 + 1

				// Pre-multiply size with outer-specific multiplier
				const multipliedSize = projected.size * outerConfig.sizeMultiplier

				// Apply DPR compensation for consistent visual size across displays
				// Divide by DPR first, then multiply by DPR for canvas pixels
				const dprCompensatedSize = multipliedSize / dpr
				const baseSize =
					outerConfig.minPixelSize > 0
						? Math.max(outerConfig.minPixelSize, dprCompensatedSize)
						: dprCompensatedSize
				const finalSize = baseSize * dpr

				positions.push(x, y)
				sizes.push(finalSize)
				// Outer stars can be brighter/more colorful
				colors.push(1.0, 0.98, 0.95)
				opacities.push(projected.opacity * opacity)
			}
		})

		const starCount = positions.length / 2

		if (starCount === 0) {
			return
		}

		// Use shader program
		gl.useProgram(program)

		// Upload position data
		const positionLocation = gl.getAttribLocation(program, 'a_position')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW)
		gl.enableVertexAttribArray(positionLocation)
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

		// Upload size data
		const sizeLocation = gl.getAttribLocation(program, 'a_size')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.DYNAMIC_DRAW)
		gl.enableVertexAttribArray(sizeLocation)
		gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0)

		// Upload color data
		const colorLocation = gl.getAttribLocation(program, 'a_color')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW)
		gl.enableVertexAttribArray(colorLocation)
		gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0)

		// Upload opacity data
		const opacityLocation = gl.getAttribLocation(program, 'a_opacity')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.opacityBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(opacities), gl.DYNAMIC_DRAW)
		gl.enableVertexAttribArray(opacityLocation)
		gl.vertexAttribPointer(opacityLocation, 1, gl.FLOAT, false, 0, 0)

		// Draw all stars in one call
		gl.drawArrays(gl.POINTS, 0, starCount)
	}

	private handleContextLost = (event: Event): void => {
		event.preventDefault()
		this.isContextLost = true
		console.warn('WebGL context lost - pausing cluster rendering')
	}

	private handleContextRestored = (): void => {
		console.log('WebGL context restored - reinitializing cluster renderer')
		this.isContextLost = false
		this.init()
	}

	/**
	 * Clean up GPU resources
	 */
	dispose(): void {
		const { gl, canvas } = this

		// Remove event listeners
		canvas.removeEventListener('webglcontextlost', this.handleContextLost)
		canvas.removeEventListener(
			'webglcontextrestored',
			this.handleContextRestored,
		)

		// Delete GPU resources
		if (this.program) {
			gl.deleteProgram(this.program)
			this.program = null
		}

		if (this.positionBuffer) {
			gl.deleteBuffer(this.positionBuffer)
			this.positionBuffer = null
		}

		if (this.sizeBuffer) {
			gl.deleteBuffer(this.sizeBuffer)
			this.sizeBuffer = null
		}

		if (this.colorBuffer) {
			gl.deleteBuffer(this.colorBuffer)
			this.colorBuffer = null
		}

		if (this.opacityBuffer) {
			gl.deleteBuffer(this.opacityBuffer)
			this.opacityBuffer = null
		}
	}
}
