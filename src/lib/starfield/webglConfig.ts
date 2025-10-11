/**
 * WebGL Starfield Rendering Configuration
 *
 * Centralized settings for tuning the visual appearance of stars rendered via WebGL.
 * All sizing and gradient values have been carefully calibrated to match the original
 * Canvas2D implementation while taking advantage of GPU acceleration.
 *
 * Organization:
 * - Visual rendering properties (most frequently tuned) at top
 * - System configuration (star counts, bounds) at bottom
 *
 * Performance:
 * - FPS limiting is controlled globally by AnimationController (default: 60 FPS)
 * - To adjust: AnimationController.setTargetFPS(fps) or set to 0 for uncapped
 * - Tab visibility pausing recommended for multi-tab scenarios
 */

export const WEBGL_STARFIELD_CONFIG = {
	/**
	 * ═══════════════════════════════════════════════════════════════════
	 * FOREGROUND STARS - Main starfield parallax layer
	 * ═══════════════════════════════════════════════════════════════════
	 * Primary stars that create the depth and motion effect
	 *
	 * Properties:
	 * - sizeMultiplier: Scales the base star size from the Star3D model
	 *   • Higher values = larger, more visible stars
	 *   • Lower values = smaller, more subtle stars
	 *   • Current: 3.0 (retina DPR=2 baseline)
	 *
	 * - minPixelSize: Minimum rendered size in pixels to prevent sub-pixel flickering
	 *   • Stars smaller than this will be clamped to this minimum size
	 *   • Prevents rapid flickering/disappearing when stars are calculated < 1 pixel
	 *   • Set to 0 to allow natural flickering (useful for distant/subtle effects)
	 *   • Current: 1.5 (retina baseline)
	 *
	 * - intensity: Brightness range for stars (min to max)
	 *   • Each star picks a random intensity in this range at creation
	 *   • minIntensity: Dimmest stars (0.0 = invisible, 1.0 = full brightness)
	 *   • maxIntensity: Brightest stars (typically 1.0)
	 *   • Current: 0.3 to 1.0 for more uniform brightness distribution
	 */
	foreground: {
		sizeMultiplier: 5.0,
		minPixelSize: 1.5,
		intensity: {
			min: 0.5,
			max: 1.0,
		},

		/**
		 * TWINKLING EFFECT - Diagonal wave pattern that creates slow-rippling fade
		 * This recreates the Canvas2D rendering artifact that became a feature
		 *
		 * Properties:
		 * - enabled: Whether to apply the twinkling wave effect
		 *
		 * - timeSpeed: How fast the wave pattern animates over time
		 *   • Higher values = faster twinkling
		 *   • Lower values = slower, more subtle effect
		 *   • Current: 0.003 for subtle wave motion
		 *
		 * - spatialFrequencyX: How the wave varies across horizontal space
		 *   • Controls the spacing of diagonal bands
		 *   • Combined with Y creates the diagonal wave angle
		 *
		 * - spatialFrequencyY: How the wave varies across vertical space
		 *   • Negative value reverses the diagonal direction
		 *   • Equal magnitude to X creates 45° diagonal
		 *   • Current: -0.01 for lower-right to upper-left wave motion
		 *
		 * - amplitude: Strength of the brightness variation (dynamic uniform, DPR-scaled)
		 *   • sin() ranges -1 to 1, multiplied by amplitude
		 *   • Higher values = more dramatic twinkling
		 *   • Lower values = subtle shimmer
		 *   • Set to 0.0 for no twinkling
		 *   • DPR 1.0: 0.25 (more dramatic on standard displays)
		 *   • DPR 2.0: 0.125 (subtle on retina displays)
		 *   • Can be changed without page refresh (hot-reload supported)
		 *
		 * - baseIntensity: Center point of brightness variation (dynamic uniform, DPR-scaled)
		 *   • Stars oscillate around this value
		 *   • Range: baseIntensity - amplitude to baseIntensity + amplitude
		 *   • 0.75 with amplitude 0.125 = stars range 0.625 to 0.875 (dim effect)
		 *   • Higher values = brighter overall
		 *   • Lower values = dimmer overall
		 *   • Both DPR levels: 0.75 (consistent dimming)
		 *   • Can be changed without page refresh (hot-reload supported)
		 *
		 * Note: Base values below are overridden by RETINA_CONFIG/STANDARD_CONFIG per DPR
		 */
		twinkle: {
			enabled: true,
			timeSpeed: 0.0025,
			spatialFrequencyX: 0.005,
			spatialFrequencyY: -0.005,
			amplitude: 0.125, // Overridden by DPR configs
			baseIntensity: 0.75, // Overridden by DPR configs
		},

		/**
		 * GRADIENT FALLOFF - Multi-zone radial gradient for individual star appearance
		 * Creates depth and luminosity with bright core and softer outer glow
		 *
		 * Phase 1 Quality Improvements (DPR 1.0 tuning baseline):
		 * - Better anti-aliasing for softer circular edges (especially on low DPR)
		 * - Multi-zone gradient with bright core and outer glow zones
		 *
		 * Properties:
		 * - circleEdgeStart: Where the edge antialiasing begins (0.0 = center, 1.0 = edge)
		 *   • Controls the size of the solid core before fade starts
		 *   • Higher values = sharper, more defined stars
		 *   • Lower values = softer, more bloomy stars
		 *   • Current: 0.6
		 *
		 * - circleEdgeEnd: Where the edge antialiasing completes
		 *   • Works with circleEdgeStart to define the antialiasing range
		 *   • Extended to 1.0 for softer edges on low DPR displays
		 *   • Smaller range (closer to start) = sharper edge
		 *   • Larger range (farther from start) = smoother, more blurred edge
		 *   • Current: 1.0 (improved from 0.9)
		 *
		 * - coreBrightness: Brightness multiplier at the very center of the star
		 *   • 1.0 = full brightness at center
		 *   • Creates the "hot spot" luminosity effect
		 *   • Current: 1.0
		 *
		 * - coreRadius: Radius where the bright core zone ends (0.0-1.0)
		 *   • Inside this radius, stars maintain peak brightness
		 *   • Beyond this, brightness falls off to create outer glow
		 *   • Current: 0.3 (30% of star radius is bright core)
		 *
		 * - glowFalloff: Exponent for outer glow falloff beyond core radius
		 *   • Higher values = steeper falloff, tighter appearance
		 *   • Lower values = gentler falloff, more extended glow
		 *   • 1.0 = linear, 2.0 = quadratic, 3.0 = cubic
		 *   • Current: 2.0 (smooth quadratic falloff)
		 *
		 * - coreGlowMix: How much core intensity bleeds into the glow zone (0.0-1.0)
		 *   • 0.0 = sharp boundary between core and glow
		 *   • 1.0 = smooth continuous gradient from core to glow
		 *   • Controls the "softness" of the core-to-glow transition
		 *   • Current: 0.5 (balanced blend)
		 */
		gradient: {
			circleEdgeStart: 0.6,
			circleEdgeEnd: 1.0,
			coreBrightness: 1.0,
			coreRadius: 0.2,
			glowFalloff: 3.0,
			coreGlowMix: 0.3,
		},
	},

	/**
	 * ═══════════════════════════════════════════════════════════════════
	 * CORE STARS - Main galactic cluster
	 * ═══════════════════════════════════════════════════════════════════
	 * The primary mass of stars forming the main galactic core
	 */
	core: {
		/**
		 * RENDERING - Visual appearance and shader parameters
		 *
		 * Properties:
		 * - sizeMultiplier: Converts radius to diameter to match Canvas2D ctx.arc()
		 *   • Canvas2D uses radius, WebGL gl_PointSize uses diameter (2x conversion)
		 *   • Current: 5.0 (retina DPR=2 baseline)
		 *
		 * - minPixelSize: Minimum rendered size in pixels
		 *   • Prevents rapid sub-pixel flickering (< 1px stars appear unstable)
		 *   • Current: 0.3 (retina baseline)
		 *   • Set to 0 to allow natural flickering (can be visually jarring)
		 *
		 * - intensity: Brightness range for core stars (min to max)
		 *   • Each star picks a random intensity in this range at creation
		 *   • minIntensity: Dimmest stars (0.0 = invisible, 1.0 = full brightness)
		 *   • maxIntensity: Brightest stars (typically 1.0)
		 *   • Current: 0.2 to 1.0 for wide brightness variation in cluster
		 */
		rendering: {
			sizeMultiplier: 8.0,
			minPixelSize: 0.3,
			intensity: {
				min: 0.2,
				max: 1.0,
			},

			/**
			 * GRADIENT FALLOFF - Multi-zone rendering for nebula-like cluster glow
			 * Creates a more complex, natural-looking star with core, mid, and outer zones
			 *
			 * Properties:
			 * - circleEdgeStart/End: Controls how sharp the edge transition is
			 *   • Higher values create more concentrated, brighter core stars
			 *   • Current: 0.8 / 0.95
			 *
			 * - coreSizeThreshold: Radius where the bright core ends (0.0-1.0)
			 *   • Inside this radius, stars are at full brightness
			 *   • Current: 0.2 creates a small, intense core
			 *
			 * - midSizeThreshold: Radius where the mid-zone falloff ends
			 *   • Between core and mid, alpha falls off quadratically
			 *   • Beyond mid, alpha falls off linearly to create subtle outer glow
			 *   • Current: 0.7 creates most of the visible star in the mid zone
			 *
			 * - outerGlowAlpha: Maximum alpha for the outer glow zone
			 *   • Controls how much subtle halo extends beyond the main star
			 *   • Lower values = tighter stars, higher = more nebula-like
			 *   • Current: 0.15 creates minimal but visible glow
			 */
			gradient: {
				circleEdgeStart: 0.8,
				circleEdgeEnd: 0.95,
				coreSizeThreshold: 0.2,
				midSizeThreshold: 0.7,
				outerGlowAlpha: 0.15,
			},
		},

		/**
		 * GEOMETRY - Physical dimensions and shape of the galactic core
		 * These define the elliptical distribution of core stars
		 *
		 * Properties:
		 * - standardDeviation: Standard deviation (σ) for Gaussian distribution
		 *   • Controls how concentrated stars are toward the center
		 *   • Lower values (0.3-0.5) = tight, concentrated cluster
		 *   • Higher values (1.0-2.0) = more spread out, diffuse cluster
		 *   • Current: 1.0 (standard normal distribution)
		 *   • Applied to Box-Muller transform: mag = σ × √(-2.0 × ln(u₁))
		 *   • With σ=1.0: ~68% within 1σ, ~95% within 2σ, ~99.7% within 3σ
		 *
		 * - semiMajorAxis: Horizontal radius of the ellipse (a)
		 *   • Defines the actual width of the lenticular galaxy shape
		 *   • Current: 756000 units (horizontal spread)
		 *
		 * - semiMinorAxis: Vertical radius of the ellipse (b)
		 *   • Defines the actual height/thickness of the lenticular galaxy shape
		 *   • Current: 226800 units (vertical spread)
		 *   • Aspect ratio: 756k / 226.8k = 3.33 (wide lenticular shape)
		 *
		 * - distance: Z-depth range for core stars
		 *   • Stars spawn randomly within this range
		 *   • Larger range = more depth variation
		 *   • Current: min 300000, max 3000000
		 */
		geometry: {
			standardDeviation: 1.0,
			semiMajorAxis: 756000,
			semiMinorAxis: 226800,
			distance: {
				min: 300000,
				max: 3000000,
			},
		},

		/**
		 * PHYSICS - Motion and projection parameters
		 *
		 * Properties:
		 * - approachSpeed: Forward motion speed in units/ms
		 *   • Used as fallback when no motionVector is provided
		 *   • Current: 50
		 *
		 * - rollSpeed: Rotation speed in degrees per second
		 *   • Negative values = clockwise rotation
		 *   • Positive values = counter-clockwise rotation
		 *   • Current: -1.5 for cinematic slow rotation
		 *
		 * - focalLength: Perspective projection focal length
		 *   • Lower values = wider field of view, more spread
		 *   • Higher values = narrower FOV, more compressed
		 *   • Current: 300
		 */
		physics: {
			approachSpeed: 50,
			rollSpeed: -1.5,
			focalLength: 300,
		},

		/**
		 * NEBULA GLOW - Additive haze layer at cluster center
		 * Creates a soft, luminous core effect for the galactic cluster
		 *
		 * Properties:
		 * - enabled: Whether to render the glow layer
		 *   • Turn off for performance or stylistic choice
		 *   • Current: true
		 *
		 * - centerDepth: Z-position of the glow center
		 *   • Should match the visual center of your star cluster
		 *   • Current: 1650000 (midpoint of 300k-3M range)
		 *
		 * - baseSize: Base size of the glow in 3D units
		 *   • Size in 3D space that gets projected to screen (horizontal width)
		 *   • Larger values = bigger glow sphere in 3D space
		 *   • ⚠️ Limited by WebGL max point size (~256px on most GPUs)
		 *   • Current: 1200000 units (retina optimized)
		 *
		 * - aspectRatio: Width to height ratio for elliptical glow
		 *   • Matches the lenticular galaxy shape (semiMajorAxis / semiMinorAxis)
		 *   • 1.0 = circular, >1.0 = wider than tall (lenticular)
		 *   • Current: 3.33 (400000 / 120000)
		 *
		 * - color: RGB color of the glow (0.0-1.0 range)
		 *   • Core color of the nebula effect
		 *   • Current: [0.7, 0.85, 1.0] (soft cyan-blue)
		 *
		 * - opacity: Maximum opacity of the glow center
		 *   • 0.0 = invisible, 1.0 = fully opaque
		 *   • Adjust this for brightness
		 *   • Current: 0.5 for visible luminous effect (retina)
		 *
		 * - falloffExponent: How quickly the glow fades from center to edge
		 *   • THIS controls the PERCEIVED size more than baseSize!
		 *   • Lower values (1.0-1.5) = larger, softer, more spread out haze
		 *   • Higher values (2.0-3.0) = smaller, tighter, more concentrated glow
		 *   • 1.0 = linear, 2.0 = quadratic, 3.0 = cubic
		 *   • Current: 1.025 for very large, soft nebula glow (nearly linear)
		 *
		 * - noise: Procedural noise for cloud-like texture
		 *   • enabled: Whether to add noise to the glow
		 *   • scale: Size of cloud features (higher = finer grain, lower = larger clouds)
		 *   • strength: Intensity of variation (0.0 = none, 1.0 = extreme)
		 *   • animated: Whether noise drifts over time
		 *   • speed: Drift velocity [x, y] - slow values like 0.01 recommended
		 *   • Current: scale 8.0, strength 0.5, gentle diagonal drift
		 *
		 * - occlusion: Stars behind the glow are dimmed by density variations
		 *   • enabled: Whether to apply occlusion to stars behind the glow
		 *   • strength: How much stars are dimmed (0.0 = no occlusion, 1.0 = full dimming)
		 *   • noiseScale: Size of density variations (independent from glow visual noise)
		 *   • Current: enabled, strength 0.4 for subtle flickering effect
		 */
		/**
		 * GLOW - Procedural nebula gradient effect
		 *
		 * Renders a smooth, elliptical glow at the cluster center using a
		 * full-screen quad with procedural gradient shader. This approach:
		 * - No WebGL point size limits or FBO compatibility issues
		 * - Smooth gradients on all display types (no banding)
		 * - Single-pass rendering (no post-processing overhead)
		 * - Unlimited size and perfect quality
		 *
		 * Properties:
		 * - enabled: Toggle the glow effect
		 *
		 * - centerDepth: Z-position of the glow center in 3D space
		 *   • Should match the visual center of your star cluster
		 *   • Current: 800000 (midpoint of core star depth range)
		 *   • Note: Only used for documentation, glow is now fixed-size in screen space
		 *
		 * - baseSize: Size multiplier for glow coverage
		 *   • Multiplies the cluster's projected size to determine glow extent
		 *   • 1.0 = matches cluster size exactly, >1.0 = extends beyond cluster
		 *   • Current: 2.5 (glow extends 2.5x beyond cluster core)
		 *
		 * - aspectRatio: Width to height ratio for elliptical shape
		 *   • Matches the lenticular galaxy shape
		 *   • 1.0 = circular, >1.0 = wider than tall
		 *   • Current: 3.33 for lenticular appearance
		 *
		 * - rotationOffset: Initial rotation angle offset in degrees
		 *   • Adjusts for any angular mismatch between glow and stars
		 *   • Positive = counter-clockwise, negative = clockwise
		 *   • Current: 0 (can adjust if needed for alignment)
		 *
		 * - color: RGB color of the glow (0.0-1.0 range)
		 *   • Core color of the nebula effect
		 *   • Current: [0.7, 0.85, 1.0] (soft cyan-blue)
		 *
		 * - opacity: Maximum opacity at the glow center (DPR-scaled)
		 *   • 0.0 = invisible, 1.0 = fully opaque
		 *   • Current: 0.12 (retina), 0.05 (standard) - auto-scaled by DPR
		 *   • Retina needs higher values due to pixel blending
		 *
		 * - falloffExponent: Controls steepness of inverse square falloff (DPR-scaled)
		 *   • Uses formula: intensity = 1 / (1 + distance² × falloff)
		 *   • Lower values (1-3) = large, soft, spread out glow
		 *   • Higher values (5-10) = tight, concentrated glow with rapid edge falloff
		 *   • Current: 6.0 (retina), 8.0 (standard) - auto-scaled by DPR
		 *
		 * - noise: Procedural noise for cloud-like texture
		 *   • scale: Size of noise features (DPR-scaled)
		 *     - Higher = finer detail, lower = larger clouds
		 *     - Current: 1.5 (retina), 2.0 (standard) - auto-scaled by DPR
		 *     - Retina uses lower values to maintain same visual feature size
		 *   • strength: Maximum intensity of noise modulation (0.0-1.0, DPR-scaled)
		 *     - 0.0 = no noise (smooth gradient), 1.0 = full noise
		 *     - Increases radially (core smooth, edges wispy)
		 *     - Current: 0.8 for both retina and standard
		 *   • speed: Animation drift velocity [x, y] in units/second
		 *     - Uses circular motion for organic drift
		 *     - Current: [0.05, 0.08] for slow, gentle drift
		 */
		glow: {
			enabled: true,
			centerDepth: 800000,
			baseSize: 5.0, // Multiplier (extends 2.5x beyond cluster)
			aspectRatio: 2.5,
			color: [0.7, 0.85, 1.0],
			opacity: 0.12, // Retina baseline (DPR-scaled via getScaledStarfieldConfig)
			falloffExponent: 6.0, // Inverse square falloff - retina (DPR-scaled)
			noise: {
				scale: 1.5, // Retina baseline (DPR-scaled)
				strength: 0.8, // Retina baseline (DPR-scaled)
				speed: [0.01, 0.03],
			},
		},
	},

	/**
	 * ═══════════════════════════════════════════════════════════════════
	 * OUTER STARS - Outer elliptical distribution
	 * ═══════════════════════════════════════════════════════════════════
	 * Sparse outer stars creating the extended galactic halo
	 */
	outer: {
		/**
		 * RENDERING - Visual appearance and shader parameters
		 *
		 * Properties:
		 * - sizeMultiplier: Converts radius to diameter, slightly larger than core
		 *   • Outer stars are closer, so appear slightly larger than distant core stars
		 *   • Current: 4.0 (retina DPR=2 baseline)
		 *
		 * - minPixelSize: Allow full natural size variance
		 *   • Set to 0 to allow the full range from Star3D.project()
		 *   • This allows natural flickering and the "growing" effect as stars approach
		 *   • Current: 2.0 (retina baseline)
		 *
		 * - intensity: Brightness range for outer stars (min to max)
		 *   • Each star picks a random intensity in this range at creation
		 *   • Then multiplied by modifiers.intensity for final brightness
		 *   • minIntensity: Dimmest stars (0.0 = invisible, 1.0 = full brightness)
		 *   • maxIntensity: Brightest stars (typically 1.0)
		 *   • Current: 0.2 to 1.0, then multiplied by modifiers.intensity (1.5)
		 *   • Effective range: 0.3 to 1.5 (50% brighter than core stars)
		 */
		rendering: {
			sizeMultiplier: 2.0,
			minPixelSize: 2.0,
			intensity: {
				min: 0.2,
				max: 1.0,
			},
			// Uses same gradient falloff as core stars
		},

		/**
		 * GEOMETRY - Physical dimensions and distribution
		 *
		 * Properties:
		 * - standardDeviation: Standard deviation (σ) for Gaussian distribution
		 *   • Controls how concentrated stars are toward the center
		 *   • Lower values (0.3-0.5) = tight, concentrated cluster
		 *   • Higher values (1.0-2.0) = more spread out, diffuse cluster
		 *   • Current: 1.0 (standard normal distribution, same as core)
		 *   • Applied to Box-Muller transform: mag = σ × √(-2.0 × ln(u₁))
		 *   • Note: Outer stars are 4-20x closer (150k-600k vs 300k-3M)
		 *   •       so projection magnifies their spread significantly on screen
		 *
		 * - semiMajorAxis: Horizontal radius of the ellipse (a)
		 *   • Defines the actual width of the outer star halo
		 *   • Current: 756000 units (horizontal spread, before concentration)
		 *
		 * - semiMinorAxis: Vertical radius of the ellipse (b)
		 *   • Defines the actual height/thickness of the outer star halo
		 *   • Current: 226800 units (vertical spread, before concentration)
		 *
		 * - distance: Z-depth range for outer stars
		 *   • Current: 150000-600000 (2-5x closer than core!)
		 *   • Being closer makes outer stars appear larger and creates dramatic growth effect
		 *
		 * - concentration: How tightly packed outer stars are (0-1)
		 *   • Lower values = more concentrated toward center
		 *   • Higher values = more spread out
		 *   • Multiplied by ellipse axis radii to get effective distribution size
		 *   • Current: 0.4 (effective size: 756k × 0.4 = 302k units)
		 */
		geometry: {
			standardDeviation: 1.0,
			semiMajorAxis: 756000,
			semiMinorAxis: 226800,
			distance: {
				min: 150000,
				max: 600000,
			},
			concentration: 0.4,
		},

		/**
		 * MODIFIERS - Additional multipliers applied in CenterClusterStar3D class
		 * These are separate from rendering.sizeMultiplier and applied at the Star3D level
		 *
		 * Properties:
		 * - intensity: Brightness multiplier for outer stars
		 *   • 1.0 = same as core stars
		 *   • >1.0 = brighter outer halo
		 *   • Applied to star intensity calculation
		 *   • Current: 1.0
		 *
		 * - size: Size multiplier applied in the Star3D projection
		 *   • 1.0 = matches Canvas2D configuration for dense flickering effect
		 *   • This is separate from rendering.sizeMultiplier
		 *   • Applied before rendering.sizeMultiplier
		 *   • Current: 1.0
		 */
		modifiers: {
			intensity: 1.5,
			size: 1.0,
		},
	},

	/**
	 * ═══════════════════════════════════════════════════════════════════
	 * SYSTEM CONFIGURATION
	 * ═══════════════════════════════════════════════════════════════════
	 * Star counts and rendering bounds (changed less frequently)
	 */

	/**
	 * STAR COUNTS - Number of stars to render in each layer
	 * Adjust these to balance visual density with performance
	 *
	 * Properties:
	 * - foreground: Number of main starfield stars
	 *   • These create the primary parallax effect
	 *   • Use ForegroundToggle component in dev mode to toggle on/off
	 *   • Current: 4000 (retina baseline, spawn area now constant across displays)
	 *
	 * - core: Number of main galactic core stars
	 *   • Form the primary mass of the galactic cluster
	 *   • Current: 2000
	 *
	 * - outer: Number of outer halo stars
	 *   • Create the extended galactic halo
	 *   • Current: 200 (retina baseline, spawn area now constant across displays)
	 */
	starCounts: {
		foreground: 3000,
		core: 1000,
		outer: 500,
	},

	/**
	 * RENDERING BOUNDS - How far beyond the viewport to render stars
	 * Controls the visibility margin for course changes and transitions
	 *
	 * Properties:
	 * - marginMultiplier: Multiplier for the larger screen dimension
	 *   • 1.0 = 100% margin (stars rendered up to 1 full screen away)
	 *   • 1.5 = 150% margin (stars rendered up to 1.5 screens away)
	 *   • Higher values ensure smooth transitions but render more off-screen stars
	 *   • Current: 2.5 to handle extreme course changes and portrait mode
	 */
	renderingBounds: {
		marginMultiplier: 2.5,
	},
}

/**
 * ═══════════════════════════════════════════════════════════════════
 * VIEWPORT-BASED SCALING
 * ═══════════════════════════════════════════════════════════════════
 * Dynamically scales star rendering parameters based on viewport size
 * to maintain consistent visual appearance across different displays
 */

/**
 * DPR-based scaling configurations
 * Baseline: DPR = 2.0 (retina displays)
 * All config values in WEBGL_STARFIELD_CONFIG are optimized for DPR = 2.0
 */

// Tuned values for DPR = 2.0 (retina baseline)
const RETINA_CONFIG = {
	foreground: {
		sizeMultiplier: 5.0,
		minPixelSize: 1.5,
		twinkle: { amplitude: 0.125, baseIntensity: 0.75 },
	},
	core: { sizeMultiplier: 8.0, minPixelSize: 0.3 },
	glow: {
		opacity: 0.15,
		falloffExponent: 6.0,
		noise: { scale: 1.5, strength: 0.8 },
	},
}

// Tuned values for DPR = 1.0 (standard displays)
const STANDARD_CONFIG = {
	foreground: {
		sizeMultiplier: 3.0,
		minPixelSize: 2.5,
		twinkle: { amplitude: 0.25, baseIntensity: 0.75 },
	},
	core: { sizeMultiplier: 5.0, minPixelSize: 2.0 },
	glow: {
		opacity: 0.075,
		falloffExponent: 8.0,
		noise: { scale: 2.0, strength: 0.8 },
	},
}

/**
 * Interpolates between two values based on a factor (0-1)
 */
function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t
}

/**
 * Calculates DPR-scaled configuration values for star rendering
 * Uses discrete buckets with interpolation for smooth transitions
 *
 * @param dpr - Device pixel ratio (window.devicePixelRatio)
 * @returns Scaled configuration object with DPR-adjusted values
 */
export function getScaledStarfieldConfig(dpr: number) {
	let foregroundSizeMultiplier: number
	let foregroundMinPixelSize: number
	let foregroundTwinkleAmplitude: number
	let foregroundTwinkleBaseIntensity: number
	let coreSizeMultiplier: number
	let coreMinPixelSize: number
	let glowOpacity: number
	let glowFalloffExponent: number
	let glowNoiseScale: number
	let glowNoiseStrength: number

	if (dpr >= 2.5) {
		// DPR >= 2.5: Scale up from retina baseline
		// For DPR = 3.0, make stars slightly larger than retina
		const factor = (dpr - 2.0) / 1.0 // 0 at DPR=2, 1 at DPR=3
		foregroundSizeMultiplier = lerp(
			RETINA_CONFIG.foreground.sizeMultiplier,
			RETINA_CONFIG.foreground.sizeMultiplier * 1.2,
			factor,
		)
		foregroundMinPixelSize = RETINA_CONFIG.foreground.minPixelSize
		foregroundTwinkleAmplitude = RETINA_CONFIG.foreground.twinkle.amplitude
		foregroundTwinkleBaseIntensity =
			RETINA_CONFIG.foreground.twinkle.baseIntensity
		coreSizeMultiplier = lerp(
			RETINA_CONFIG.core.sizeMultiplier,
			RETINA_CONFIG.core.sizeMultiplier * 1.2,
			factor,
		)
		coreMinPixelSize = RETINA_CONFIG.core.minPixelSize
		glowOpacity = RETINA_CONFIG.glow.opacity
		glowFalloffExponent = RETINA_CONFIG.glow.falloffExponent
		glowNoiseScale = RETINA_CONFIG.glow.noise.scale
		glowNoiseStrength = RETINA_CONFIG.glow.noise.strength
	} else if (dpr >= 1.75) {
		// DPR 1.75-2.5: Use retina config
		foregroundSizeMultiplier = RETINA_CONFIG.foreground.sizeMultiplier
		foregroundMinPixelSize = RETINA_CONFIG.foreground.minPixelSize
		foregroundTwinkleAmplitude = RETINA_CONFIG.foreground.twinkle.amplitude
		foregroundTwinkleBaseIntensity =
			RETINA_CONFIG.foreground.twinkle.baseIntensity
		coreSizeMultiplier = RETINA_CONFIG.core.sizeMultiplier
		coreMinPixelSize = RETINA_CONFIG.core.minPixelSize
		glowOpacity = RETINA_CONFIG.glow.opacity
		glowFalloffExponent = RETINA_CONFIG.glow.falloffExponent
		glowNoiseScale = RETINA_CONFIG.glow.noise.scale
		glowNoiseStrength = RETINA_CONFIG.glow.noise.strength
	} else if (dpr >= 1.25) {
		// DPR 1.25-1.75: Interpolate between standard and retina
		const factor = (dpr - 1.0) / 1.0 // 0 at DPR=1, 1 at DPR=2
		foregroundSizeMultiplier = lerp(
			STANDARD_CONFIG.foreground.sizeMultiplier,
			RETINA_CONFIG.foreground.sizeMultiplier,
			factor,
		)
		foregroundMinPixelSize = STANDARD_CONFIG.foreground.minPixelSize
		foregroundTwinkleAmplitude = lerp(
			STANDARD_CONFIG.foreground.twinkle.amplitude,
			RETINA_CONFIG.foreground.twinkle.amplitude,
			factor,
		)
		foregroundTwinkleBaseIntensity = lerp(
			STANDARD_CONFIG.foreground.twinkle.baseIntensity,
			RETINA_CONFIG.foreground.twinkle.baseIntensity,
			factor,
		)
		coreSizeMultiplier = lerp(
			STANDARD_CONFIG.core.sizeMultiplier,
			RETINA_CONFIG.core.sizeMultiplier,
			factor,
		)
		coreMinPixelSize = lerp(
			STANDARD_CONFIG.core.minPixelSize,
			RETINA_CONFIG.core.minPixelSize,
			factor,
		)
		glowOpacity = lerp(
			STANDARD_CONFIG.glow.opacity,
			RETINA_CONFIG.glow.opacity,
			factor,
		)
		glowFalloffExponent = lerp(
			STANDARD_CONFIG.glow.falloffExponent,
			RETINA_CONFIG.glow.falloffExponent,
			factor,
		)
		glowNoiseScale = lerp(
			STANDARD_CONFIG.glow.noise.scale,
			RETINA_CONFIG.glow.noise.scale,
			factor,
		)
		glowNoiseStrength = lerp(
			STANDARD_CONFIG.glow.noise.strength,
			RETINA_CONFIG.glow.noise.strength,
			factor,
		)
	} else {
		// DPR < 1.25: Use standard config
		foregroundSizeMultiplier = STANDARD_CONFIG.foreground.sizeMultiplier
		foregroundMinPixelSize = STANDARD_CONFIG.foreground.minPixelSize
		foregroundTwinkleAmplitude = STANDARD_CONFIG.foreground.twinkle.amplitude
		foregroundTwinkleBaseIntensity =
			STANDARD_CONFIG.foreground.twinkle.baseIntensity
		coreSizeMultiplier = STANDARD_CONFIG.core.sizeMultiplier
		coreMinPixelSize = STANDARD_CONFIG.core.minPixelSize
		glowOpacity = STANDARD_CONFIG.glow.opacity
		glowFalloffExponent = STANDARD_CONFIG.glow.falloffExponent
		glowNoiseScale = STANDARD_CONFIG.glow.noise.scale
		glowNoiseStrength = STANDARD_CONFIG.glow.noise.strength
	}

	return {
		...WEBGL_STARFIELD_CONFIG,
		foreground: {
			...WEBGL_STARFIELD_CONFIG.foreground,
			minPixelSize: foregroundMinPixelSize,
			sizeMultiplier: foregroundSizeMultiplier,
			twinkle: {
				...WEBGL_STARFIELD_CONFIG.foreground.twinkle,
				amplitude: foregroundTwinkleAmplitude,
				baseIntensity: foregroundTwinkleBaseIntensity,
			},
		},
		core: {
			...WEBGL_STARFIELD_CONFIG.core,
			rendering: {
				...WEBGL_STARFIELD_CONFIG.core.rendering,
				minPixelSize: coreMinPixelSize,
				sizeMultiplier: coreSizeMultiplier,
			},
			glow: {
				...WEBGL_STARFIELD_CONFIG.core.glow,
				opacity: glowOpacity,
				falloffExponent: glowFalloffExponent,
				noise: {
					...WEBGL_STARFIELD_CONFIG.core.glow.noise,
					scale: glowNoiseScale,
					strength: glowNoiseStrength,
				},
			},
		},
	}
}
