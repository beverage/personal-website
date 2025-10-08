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
		 * - amplitude: Strength of the brightness variation
		 *   • 0.25 means 25% variation range
		 *   • Higher values = more dramatic twinkling
		 *   • Lower values = subtle shimmer
		 *   • Current: 0.1
		 *
		 * - baseIntensity: Minimum brightness level (when wave is at minimum)
		 *   • 0.5 means stars can fade to 50% brightness
		 *   • Higher values = always brighter, less dramatic effect
		 *   • Lower values = can fade more, more dramatic
		 *   • Range: baseIntensity to baseIntensity + amplitude*2
		 *   • Current: 0.75
		 */
		twinkle: {
			enabled: true,
			timeSpeed: 0.003,
			spatialFrequencyX: 0.01,
			spatialFrequencyY: -0.01,
			amplitude: 0.1,
			baseIntensity: 0.5,
		},

		/**
		 * GRADIENT FALLOFF - Controls how the star's brightness fades from center to edge
		 * These values create the circular "glow" appearance of each star
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
		 *   • Smaller range (closer to start) = sharper edge
		 *   • Larger range (farther from start) = smoother, more blurred edge
		 *   • Current: 0.9
		 *
		 * - falloffExponent: Power curve for alpha falloff from center to edge
		 *   • Higher values = steeper falloff, tighter/crisper appearance
		 *   • Lower values = gentler falloff, more glow
		 *   • 1.0 = linear, >1.0 = exponential steepening
		 *   • Current: 1.2 provides softer stars that match Canvas2D glow
		 */
		gradient: {
			circleEdgeStart: 0.6,
			circleEdgeEnd: 0.9,
			falloffExponent: 1.2,
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
		 * - semiMajorAxis: Horizontal radius of the ellipse (a)
		 *   • Defines the width of the lenticular galaxy shape
		 *   • Doubled to compensate for CSS-based scaling (scaleFactor cut in half)
		 *   • Current: 800000
		 *
		 * - semiMinorAxis: Vertical radius of the ellipse (b)
		 *   • Defines the height/thickness of the lenticular galaxy shape
		 *   • Doubled to compensate for CSS-based scaling
		 *   • Current: 160000
		 *
		 * - distance: Z-depth range for core stars
		 *   • Stars spawn randomly within this range
		 *   • Larger range = more depth variation
		 *   • Current: min 300000, max 3000000
		 */
		geometry: {
			semiMajorAxis: 400000,
			semiMinorAxis: 120000,
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
		 * - semiMajorAxis: Horizontal radius of the ellipse (a)
		 *   • Defines the width of the outer star halo
		 *   • Doubled to compensate for CSS-based scaling
		 *   • Current: 800000
		 *
		 * - semiMinorAxis: Vertical radius of the ellipse (b)
		 *   • Defines the height/thickness of the outer star halo
		 *   • Doubled to compensate for CSS-based scaling
		 *   • Current: 160000
		 *
		 * - distance: Z-depth range for outer stars
		 *   • Current: 150000-600000 (2-5x closer than core!)
		 *   • Being closer makes outer stars appear larger and creates dramatic growth effect
		 *
		 * - concentration: How tightly packed outer stars are (0-1)
		 *   • Lower values = more concentrated toward center
		 *   • Higher values = more spread out
		 *   • Multiplied by ellipse axis radii to get effective distribution size
		 *   • Current: 0.4 (from cluster-ellipse-4x-center-close-1)
		 */
		geometry: {
			semiMajorAxis: 400000,
			semiMinorAxis: 120000,
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
	foreground: { sizeMultiplier: 5.0, minPixelSize: 1.5 },
	core: { sizeMultiplier: 8.0, minPixelSize: 0.3 },
}

// Tuned values for DPR = 1.0 (standard displays)
const STANDARD_CONFIG = {
	foreground: { sizeMultiplier: 3.0, minPixelSize: 1.5 },
	core: { sizeMultiplier: 5.0, minPixelSize: 1.8 },
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
	let coreSizeMultiplier: number
	let coreMinPixelSize: number

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
		coreSizeMultiplier = lerp(
			RETINA_CONFIG.core.sizeMultiplier,
			RETINA_CONFIG.core.sizeMultiplier * 1.2,
			factor,
		)
		coreMinPixelSize = RETINA_CONFIG.core.minPixelSize
	} else if (dpr >= 1.75) {
		// DPR 1.75-2.5: Use retina config
		foregroundSizeMultiplier = RETINA_CONFIG.foreground.sizeMultiplier
		foregroundMinPixelSize = RETINA_CONFIG.foreground.minPixelSize
		coreSizeMultiplier = RETINA_CONFIG.core.sizeMultiplier
		coreMinPixelSize = RETINA_CONFIG.core.minPixelSize
	} else if (dpr >= 1.25) {
		// DPR 1.25-1.75: Interpolate between standard and retina
		const factor = (dpr - 1.0) / 1.0 // 0 at DPR=1, 1 at DPR=2
		foregroundSizeMultiplier = lerp(
			STANDARD_CONFIG.foreground.sizeMultiplier,
			RETINA_CONFIG.foreground.sizeMultiplier,
			factor,
		)
		foregroundMinPixelSize = STANDARD_CONFIG.foreground.minPixelSize
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
	} else {
		// DPR < 1.25: Use standard config
		foregroundSizeMultiplier = STANDARD_CONFIG.foreground.sizeMultiplier
		foregroundMinPixelSize = STANDARD_CONFIG.foreground.minPixelSize
		coreSizeMultiplier = STANDARD_CONFIG.core.sizeMultiplier
		coreMinPixelSize = STANDARD_CONFIG.core.minPixelSize
	}

	return {
		...WEBGL_STARFIELD_CONFIG,
		foreground: {
			...WEBGL_STARFIELD_CONFIG.foreground,
			minPixelSize: foregroundMinPixelSize,
			sizeMultiplier: foregroundSizeMultiplier,
		},
		core: {
			...WEBGL_STARFIELD_CONFIG.core,
			rendering: {
				...WEBGL_STARFIELD_CONFIG.core.rendering,
				minPixelSize: coreMinPixelSize,
				sizeMultiplier: coreSizeMultiplier,
			},
		},
	}
}
