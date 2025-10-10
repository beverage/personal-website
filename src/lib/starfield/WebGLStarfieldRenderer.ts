import { isWithinRenderBounds } from './renderUtils'
import { Star3D } from './Star3D'
import { getScaledStarfieldConfig, WEBGL_STARFIELD_CONFIG } from './webglConfig'

/**
 * WebGL-based starfield renderer for GPU-accelerated performance
 * Renders stars as points with circular alpha falloff
 */
export class WebGLStarfieldRenderer {
	private gl: WebGLRenderingContext | WebGL2RenderingContext
	private program: WebGLProgram | null = null
	private positionBuffer: WebGLBuffer | null = null
	private sizeBuffer: WebGLBuffer | null = null
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
		this.opacityBuffer = gl.createBuffer()
	}

	private createShaderProgram(): WebGLProgram | null {
		const { gl } = this
		const config = WEBGL_STARFIELD_CONFIG.foreground

		// Vertex shader: transforms star positions and passes data to fragment shader
		// Note: Size multiplier and minPixelSize clamping are now applied CPU-side
		const vertexShaderSource = `
			attribute vec2 a_position;
			attribute float a_size;
			attribute float a_opacity;
			
			varying float v_opacity;
			varying vec2 v_screenPos;
			
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				// Size already includes multiplier and minPixelSize clamping from CPU
				gl_PointSize = a_size;
				v_opacity = a_opacity;
				// Pass normalized screen position for twinkling calculation
				v_screenPos = a_position;
			}
		`

		// Fragment shader: renders circular stars with multi-zone radial gradient and optional twinkling
		const fragmentShaderSource = `
			precision mediump float;
			uniform float u_time;
			uniform vec2 u_resolution;
			uniform float u_twinkleEnabled;
			uniform float u_twinkleAmplitude;
			uniform float u_twinkleBaseIntensity;
			varying float v_opacity;
			varying vec2 v_screenPos;
			
			void main() {
				// Calculate distance from center of point
				vec2 coord = gl_PointCoord - vec2(0.5);
				float dist = length(coord) * 2.0;
				
				// Better anti-aliasing - softer circular edge (Improvement #1)
				float circle = 1.0 - smoothstep(${config.gradient.circleEdgeStart.toFixed(2)}, ${config.gradient.circleEdgeEnd.toFixed(2)}, dist);
				
				// Multi-zone radial gradient (Improvement #2)
				// Creates bright core with outer glow for depth and luminosity
				float core = 1.0 - smoothstep(0.0, ${config.gradient.coreRadius.toFixed(2)}, dist); // Bright core
				float glow = 1.0 - smoothstep(${config.gradient.coreRadius.toFixed(2)}, 1.0, dist); // Outer glow
				
				// Apply glow falloff for smooth transition
				glow = pow(glow, ${config.gradient.glowFalloff.toFixed(1)});
				
				// Mix core and glow with configurable blending
				float intensity = mix(glow, ${config.gradient.coreBrightness.toFixed(1)}, core * ${config.gradient.coreGlowMix.toFixed(2)});
				
				// Apply circular mask and opacity
				float alpha = circle * intensity * v_opacity;
				
				// Optional twinkling effect (controlled by uniforms)
				if (u_twinkleEnabled > 0.5) {
					// Diagonal wave twinkling effect (Canvas2D rendering artifact turned feature)
					// Convert normalized device coords to pixel space for spatial wave
					vec2 pixelPos = (v_screenPos * 0.5 + 0.5) * u_resolution;
					float twinkle = sin(
						u_time * ${config.twinkle.timeSpeed.toFixed(6)} + 
						pixelPos.x * ${config.twinkle.spatialFrequencyX.toFixed(6)} + 
						pixelPos.y * ${config.twinkle.spatialFrequencyY.toFixed(6)}
					) * u_twinkleAmplitude + u_twinkleBaseIntensity;
					
					alpha *= twinkle;
				}
				
				// Star color (slight blue-white tint)
				vec3 color = vec3(0.9, 0.95, 1.0);
				
				gl_FragColor = vec4(color, alpha);
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
	 * Render stars using WebGL
	 */
	render(
		stars: Star3D[],
		canvas: HTMLCanvasElement,
		currentTime: number = 0,
		twinkleEnabled: boolean = true,
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
		const opacities: number[] = []

		// Calculate visibility margin from config
		// This ensures stars are visible during extreme course changes
		const margin =
			Math.max(canvas.width, canvas.height) *
			scaledConfig.renderingBounds.marginMultiplier

		stars.forEach(star => {
			// Skip stars behind the camera
			if (star.z <= 0) return

			// Project star to screen coordinates
			const projected = star.project(canvas.width, canvas.height)

			// Check if star is within rendering bounds
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

				// Apply size multiplier with DPR compensation for consistent visual size
				// Divide sizeMultiplier by DPR so stars appear the same size across displays
				const dprCompensatedMultiplier =
					scaledConfig.foreground.sizeMultiplier / dpr
				let finalSize = projected.size * dprCompensatedMultiplier * dpr

				// Apply minPixelSize clamp CPU-side (DPR-aware)
				if (scaledConfig.foreground.minPixelSize > 0) {
					finalSize = Math.max(scaledConfig.foreground.minPixelSize, finalSize)
				}

				positions.push(x, y)
				sizes.push(finalSize)
				opacities.push(projected.opacity)
			}
		})

		const starCount = positions.length / 2

		if (starCount === 0) {
			return
		}

		// Use shader program
		gl.useProgram(program)

		// Set uniforms for twinkling effect
		const timeLocation = gl.getUniformLocation(program, 'u_time')
		if (timeLocation) {
			gl.uniform1f(timeLocation, currentTime)
		}

		const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
		if (resolutionLocation) {
			// Use CSS pixel dimensions (DPR-compensated) for consistent wavelength across displays
			gl.uniform2f(resolutionLocation, canvas.width / dpr, canvas.height / dpr)
		}

		// Set twinkle toggle uniform
		const twinkleEnabledLocation = gl.getUniformLocation(
			program,
			'u_twinkleEnabled',
		)
		if (twinkleEnabledLocation) {
			gl.uniform1f(twinkleEnabledLocation, twinkleEnabled ? 1.0 : 0.0)
		}

		// Set dynamic twinkle parameters (allows hot-reload tuning)
		const twinkleAmplitudeLocation = gl.getUniformLocation(
			program,
			'u_twinkleAmplitude',
		)
		if (twinkleAmplitudeLocation) {
			gl.uniform1f(
				twinkleAmplitudeLocation,
				scaledConfig.foreground.twinkle.amplitude,
			)
		}

		const twinkleBaseIntensityLocation = gl.getUniformLocation(
			program,
			'u_twinkleBaseIntensity',
		)
		if (twinkleBaseIntensityLocation) {
			gl.uniform1f(
				twinkleBaseIntensityLocation,
				scaledConfig.foreground.twinkle.baseIntensity,
			)
		}

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
		console.warn('WebGL context lost - pausing rendering')
	}

	private handleContextRestored = (): void => {
		console.log('WebGL context restored - reinitializing')
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

		if (this.opacityBuffer) {
			gl.deleteBuffer(this.opacityBuffer)
			this.opacityBuffer = null
		}
	}
}
