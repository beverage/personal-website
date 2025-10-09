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
	private depthBuffer: WebGLBuffer | null = null
	private canvas: HTMLCanvasElement
	private isContextLost = false

	// Glow quad rendering resources
	private glowProgram: WebGLProgram | null = null
	private glowQuadBuffer: WebGLBuffer | null = null
	private glowRotationAngle = 0 // Accumulated rotation in radians
	private noiseTime = 0 // Accumulated time for noise animation

	// Glow noise configuration constants
	private static readonly NOISE_DRIFT_RADIUS = 2.0 // Amplitude of circular drift in noise space

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

		// Create shader programs
		this.program = this.createShaderProgram()
		if (!this.program) {
			throw new Error('Failed to create shader program')
		}

		// Create glow shader program
		this.glowProgram = this.createGlowShaderProgram()
		if (!this.glowProgram) {
			console.warn(
				'Failed to create glow shader program - glow effects disabled',
			)
		}

		// Create buffers for stars
		this.positionBuffer = gl.createBuffer()
		this.sizeBuffer = gl.createBuffer()
		this.colorBuffer = gl.createBuffer()
		this.opacityBuffer = gl.createBuffer()
		this.depthBuffer = gl.createBuffer()

		// Create glow quad buffer (position + UV interleaved)
		this.glowQuadBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glowQuadBuffer)
		const quadVertices = new Float32Array([
			-1,
			-1,
			0,
			0, // Bottom-left (position + UV)
			1,
			-1,
			1,
			0, // Bottom-right
			-1,
			1,
			0,
			1, // Top-left
			1,
			1,
			1,
			1, // Top-right
		])
		gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW)
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
			attribute float a_depth; // 3D Z-depth (kept for potential future use)
			
			varying vec3 v_color;
			varying float v_opacity;
			
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				gl_PointSize = a_size;
				v_color = a_color;
				v_opacity = a_opacity;
			}
		`

		// Fragment shader: renders stars with radial gradient
		const fragmentShaderSource = `
			precision mediump float;
			varying vec3 v_color;
			varying float v_opacity;
			
			void main() {
				// Calculate distance from center of point
				vec2 coord = gl_PointCoord - vec2(0.5);
				float dist = length(coord) * 2.0;
				
				// Star rendering: multi-zone falloff for crisp appearance
				float circle = 1.0 - smoothstep(${gradient.circleEdgeStart.toFixed(2)}, ${gradient.circleEdgeEnd.toFixed(2)}, dist);
				
				float alpha;
				if (dist < ${gradient.coreSizeThreshold.toFixed(2)}) {
					// Bright core
					alpha = 1.0;
				} else if (dist < ${gradient.midSizeThreshold.toFixed(2)}) {
					// Steep falloff in mid zone
					alpha = 1.0 - pow((dist - ${gradient.coreSizeThreshold.toFixed(2)}) / ${(gradient.midSizeThreshold - gradient.coreSizeThreshold).toFixed(2)}, 2.0);
				} else {
					// Minimal outer glow
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
	 * Create shader program for rendering the nebula glow as a textured quad
	 * Uses procedural radial gradient in fragment shader for smooth, unlimited-size glow
	 */
	private createGlowShaderProgram(): WebGLProgram | null {
		const { gl } = this

		const vertexShader = `
			attribute vec2 a_position;
			attribute vec2 a_uv;
			varying vec2 v_uv;
			
			void main() {
				gl_Position = vec4(a_position, 0.0, 1.0);
				v_uv = a_uv;
			}
		`

		// Fragment shader: procedural elliptical gradient with simplex noise and radial turbulence
		const fragmentShader = `
			precision highp float;
			
			uniform vec2 u_center;        // Glow center in UV space (0-1)
			uniform float u_radius;       // Base radius in UV space
			uniform float u_aspectRatio;  // Width/height ratio for elliptical shape
			uniform float u_canvasAspect; // Canvas width/height for correcting UV space
			uniform vec3 u_color;         // RGB color
			uniform float u_opacity;      // Overall opacity
			uniform float u_falloff;      // Falloff exponent (higher = tighter)
			uniform float u_rotation;     // Rotation angle in radians
			uniform float u_noiseScale;   // Scale of noise features
			uniform float u_noiseStrength; // Intensity of noise effect
			uniform vec2 u_noiseOffset;   // Animated offset for noise scrolling
			uniform vec2 u_resolution;    // Screen resolution for dithering
			
			varying vec2 v_uv;
			
			// Interleaved gradient noise for dithering (breaks up banding)
			float interleavedGradientNoise(vec2 screenPos) {
				vec3 magic = vec3(0.06711056, 0.00583715, 52.9829189);
				return fract(magic.z * fract(dot(screenPos, magic.xy)));
			}
			
			// Simplex 2D noise (Stefan Gustavson's implementation)
			vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
			
			float snoise(vec2 v) {
				const vec4 C = vec4(0.211324865405187, 0.366025403784439,
						-0.577350269189626, 0.024390243902439);
				vec2 i  = floor(v + dot(v, C.yy) );
				vec2 x0 = v -   i + dot(i, C.xx);
				vec2 i1;
				i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
				vec4 x12 = x0.xyxy + C.xxzz;
				x12.xy -= i1;
				i = mod(i, 289.0);
				vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
					+ i.x + vec3(0.0, i1.x, 1.0 ));
				vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
					dot(x12.zw,x12.zw)), 0.0);
				m = m*m ;
				m = m*m ;
				vec3 x = 2.0 * fract(p * C.www) - 1.0;
				vec3 h = abs(x) - 0.5;
				vec3 ox = floor(x + 0.5);
				vec3 a0 = x - ox;
				m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
				vec3 g;
				g.x  = a0.x  * x0.x  + h.x  * x0.y;
				g.yz = a0.yz * x12.xz + h.yz * x12.yw;
				return 130.0 * dot(m, g);
			}
			
			void main() {
				// Get coordinates relative to center
				vec2 centered = v_uv - u_center;
				
				// Correct for canvas aspect ratio (convert UV to uniform physical space)
				// If canvas is wide, X coordinates are compressed in UV space
				vec2 corrected = vec2(centered.x * u_canvasAspect, centered.y);
				
				// Rotate into ellipse's local coordinate system
				// Transform screen coords by the same angle as the ellipse rotation
				float cosAngle = cos(u_rotation);
				float sinAngle = sin(u_rotation);
				vec2 localSpace = vec2(
					corrected.x * cosAngle - corrected.y * sinAngle,
					corrected.x * sinAngle + corrected.y * cosAngle
				);
				
				// Apply elliptical aspect ratio in the ellipse's local space
				// The ellipse is always oriented with major axis along X in its own frame
				vec2 elliptical = vec2(localSpace.x / u_aspectRatio, localSpace.y);
				
				// Calculate distance from center in elliptical space
				float dist = length(elliptical) / u_radius;
				
				// For noise, use the same local space coordinates so noise rotates with the ellipse
				vec2 rotatedScreen = localSpace;
				
				// Base radial falloff - inverse square for natural light falloff
				// Bright center with rapid edge falloff
				float intensity = 1.0 / (1.0 + dist * dist * u_falloff);
				
				// Apply noise for cloud-like appearance
				// Sample noise from screen-rotated space so clouds rotate with glow shape
				// Normalize by radius to get consistent scale regardless of glow size
				vec2 noiseCoord = ((rotatedScreen / u_radius) + u_noiseOffset) * u_noiseScale;
				float noise = snoise(noiseCoord) * 0.5 + 0.5; // Remap from [-1,1] to [0,1]
				
				// Apply noise across the entire glow (not just edges)
				// Strength gradually increases from center to edge
				float noiseBlend = smoothstep(0.0, 1.0, dist) * u_noiseStrength;
				float noiseModulation = mix(1.0, noise, noiseBlend);
				
				// Apply noise to intensity
				intensity *= noiseModulation;
				
				// Apply color and opacity
				float alpha = intensity * u_opacity;
				vec3 color = u_color * alpha;
				
				// Apply dithering to break up banding in dark areas
				// Use screen-space position for spatial dithering pattern
				vec2 screenPos = v_uv * u_resolution;
				float dither = interleavedGradientNoise(screenPos);
				// Scale dither: 1/255 is one color step in 8-bit color
				dither = (dither - 0.5) / 255.0;
				color += dither;
				
				gl_FragColor = vec4(color, alpha);
			}
		`

		const vs = this.compileShader(gl.VERTEX_SHADER, vertexShader)
		const fs = this.compileShader(gl.FRAGMENT_SHADER, fragmentShader)

		if (!vs || !fs) return null

		const program = gl.createProgram()
		if (!program) return null

		gl.attachShader(program, vs)
		gl.attachShader(program, fs)
		gl.linkProgram(program)

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.error('Glow shader link error:', gl.getProgramInfoLog(program))
			return null
		}

		gl.deleteShader(vs)
		gl.deleteShader(fs)
		return program
	}

	/**
	 * Render the nebula glow as a full-screen quad with procedural gradient
	 */
	private renderGlowQuad(
		canvas: HTMLCanvasElement,
		opacity: number,
		focalLength: number,
		glowConfig: typeof WEBGL_STARFIELD_CONFIG.core.glow,
	): void {
		const { gl, glowProgram } = this
		if (!glowProgram) return

		if (!glowConfig.enabled) return

		// Calculate glow center position in screen space
		const centerZ = glowConfig.centerDepth
		if (centerZ <= 0) return

		// Glow is centered on screen
		const centerX = canvas.width / 2
		const centerY = canvas.height / 2

		// Calculate glow size to match the cluster's projected size
		// Use the cluster's geometry and project it at its center depth
		const coreGeom = WEBGL_STARFIELD_CONFIG.core.geometry

		// Project the cluster's semi-minor axis (height) at the glow's center depth
		// This gives us the vertical extent of the cluster as it appears on screen
		const projectedHeight = (coreGeom.semiMinorAxis * focalLength) / centerZ

		// Scale by the baseSize multiplier from config (to tune coverage)
		const dpr = window.devicePixelRatio || 1
		const glowHeightPixels = projectedHeight * glowConfig.baseSize * dpr

		// Convert to UV space (0-1 normalized coordinates)
		const centerU = centerX / canvas.width
		const centerV = 1.0 - centerY / canvas.height // Flip Y for UV
		const radiusV = glowHeightPixels / canvas.height // Base radius in UV space (vertical)

		// Use glow shader
		gl.useProgram(glowProgram)

		// Calculate noise animation offset using circular motion for organic drift
		const noiseConfig = glowConfig.noise
		const noiseOffsetX =
			Math.cos(this.noiseTime * noiseConfig.speed[0]) *
			WebGLClusterRenderer.NOISE_DRIFT_RADIUS
		const noiseOffsetY =
			Math.sin(this.noiseTime * noiseConfig.speed[1]) *
			WebGLClusterRenderer.NOISE_DRIFT_RADIUS

		// Calculate canvas aspect ratio
		const canvasAspect = canvas.width / canvas.height

		// Set uniforms
		gl.uniform2f(
			gl.getUniformLocation(glowProgram, 'u_center'),
			centerU,
			centerV,
		)
		gl.uniform1f(gl.getUniformLocation(glowProgram, 'u_radius'), radiusV)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_aspectRatio'),
			glowConfig.aspectRatio,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_canvasAspect'),
			canvasAspect,
		)
		gl.uniform3fv(
			gl.getUniformLocation(glowProgram, 'u_color'),
			glowConfig.color,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_opacity'),
			glowConfig.opacity * opacity,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_falloff'),
			glowConfig.falloffExponent,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_rotation'),
			this.glowRotationAngle,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_noiseScale'),
			noiseConfig.scale,
		)
		gl.uniform1f(
			gl.getUniformLocation(glowProgram, 'u_noiseStrength'),
			noiseConfig.strength,
		)
		gl.uniform2f(
			gl.getUniformLocation(glowProgram, 'u_noiseOffset'),
			noiseOffsetX,
			noiseOffsetY,
		)
		gl.uniform2f(
			gl.getUniformLocation(glowProgram, 'u_resolution'),
			canvas.width,
			canvas.height,
		)

		// Setup vertex attributes
		gl.bindBuffer(gl.ARRAY_BUFFER, this.glowQuadBuffer)

		const posLoc = gl.getAttribLocation(glowProgram, 'a_position')
		const uvLoc = gl.getAttribLocation(glowProgram, 'a_uv')

		gl.enableVertexAttribArray(posLoc)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 16, 0)

		gl.enableVertexAttribArray(uvLoc)
		gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 16, 8)

		// Render full-screen quad
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	}

	/**
	 * Render core and outer stars using WebGL with procedural nebula glow effect
	 */
	render(
		coreStars: ClusterStar3D[],
		outerStars: CenterClusterStar3D[],
		canvas: HTMLCanvasElement,
		opacity: number,
		focalLength: number = 300,
		glowEnabled: boolean = true,
		rollSpeed: number = 0,
		deltaTime: number = 0,
	): void {
		if (this.isContextLost || !this.program) {
			return
		}

		const { gl, program } = this

		// Update glow rotation to match star rotation
		const rollAngle = (rollSpeed * deltaTime * Math.PI) / 180
		this.glowRotationAngle += rollAngle

		// Update noise animation time (convert deltaTime from ms to seconds)
		this.noiseTime += deltaTime / 1000

		// Get DPR-scaled config for consistent appearance across displays
		const dpr = window.devicePixelRatio || 1
		const scaledConfig = getScaledStarfieldConfig(dpr)

		// Set viewport to match canvas size
		gl.viewport(0, 0, canvas.width, canvas.height)

		// Clear canvas
		gl.clearColor(0.0, 0.0, 0.0, 0.0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		// ═══════════════════════════════════════════════════════════════
		// RENDER STARS FIRST
		// ═══════════════════════════════════════════════════════════════
		// (Glow will be rendered to FBO and blurred in post-process)

		// Prepare star data for GPU
		const positions: number[] = []
		const sizes: number[] = []
		const colors: number[] = []
		const opacities: number[] = []
		const depths: number[] = []

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
				depths.push(star.z)
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
				depths.push(star.z)
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

		// Upload depth data (Z coordinate for occlusion)
		const depthLocation = gl.getAttribLocation(program, 'a_depth')
		gl.bindBuffer(gl.ARRAY_BUFFER, this.depthBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(depths), gl.DYNAMIC_DRAW)
		gl.enableVertexAttribArray(depthLocation)
		gl.vertexAttribPointer(depthLocation, 1, gl.FLOAT, false, 0, 0)

		// Draw all stars in one call
		gl.drawArrays(gl.POINTS, 0, starCount)

		// ═══════════════════════════════════════════════════════════════
		// RENDER GLOW QUAD
		// ═══════════════════════════════════════════════════════════════
		if (glowEnabled) {
			// Use additive blending for the glow effect
			gl.blendFunc(gl.ONE, gl.ONE)

			this.renderGlowQuad(canvas, opacity, focalLength, scaledConfig.core.glow)

			// Restore normal blending for subsequent renders
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
		}
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

		// Delete GPU resources - star shader and buffers
		if (this.program) {
			gl.deleteProgram(this.program)
			this.program = null
		}

		if (this.glowProgram) {
			gl.deleteProgram(this.glowProgram)
			this.glowProgram = null
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

		if (this.depthBuffer) {
			gl.deleteBuffer(this.depthBuffer)
			this.depthBuffer = null
		}

		if (this.glowQuadBuffer) {
			gl.deleteBuffer(this.glowQuadBuffer)
			this.glowQuadBuffer = null
		}
	}
}
