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
	 */
	foreground: {
		/**
		 * sizeMultiplier: Scales the base star size from the Star3D model
		 * - Higher values = larger, more visible stars
		 * - Lower values = smaller, more subtle stars
		 * - Current: 3.0 for balanced visibility
		 */
		sizeMultiplier: 3.0,

		/**
		 * minPixelSize: Minimum rendered size in pixels to prevent sub-pixel flickering
		 * - Stars smaller than this will be clamped to this minimum size
		 * - Prevents rapid flickering/disappearing when stars are calculated < 1 pixel
		 * - Set to 0 to allow natural flickering (useful for distant/subtle effects)
		 * - Current: 1.0 allows small stars while preventing extreme sub-pixel flicker
		 */
		minPixelSize: 1.0,

		/**
		 * TWINKLING EFFECT: Diagonal wave pattern that creates slow-rippling fade
		 * This recreates the Canvas2D rendering artifact that became a feature
		 */
		twinkle: {
			/**
			 * enabled: Whether to apply the twinkling wave effect
			 */
			enabled: true,

			/**
			 * timeSpeed: How fast the wave pattern animates over time
			 * - Higher values = faster twinkling
			 * - Lower values = slower, more subtle effect
			 * - Current: 0.003 for subtle wave motion
			 */
			timeSpeed: 0.003,

			/**
			 * spatialFrequencyX: How the wave varies across horizontal space
			 * - Controls the spacing of diagonal bands
			 * - Combined with Y creates the diagonal wave angle
			 */
			spatialFrequencyX: 0.01,

			/**
			 * spatialFrequencyY: How the wave varies across vertical space
			 * - Negative value reverses the diagonal direction
			 * - Equal magnitude to X creates 45° diagonal
			 * - Current: -0.01 for lower-right to upper-left wave motion
			 */
			spatialFrequencyY: -0.01,

			/**
			 * amplitude: Strength of the brightness variation
			 * - 0.25 means 25% variation range
			 * - Higher values = more dramatic twinkling
			 * - Lower values = subtle shimmer
			 */
			amplitude: 0.25,

			/**
			 * baseIntensity: Minimum brightness level (when wave is at minimum)
			 * - 0.5 means stars can fade to 50% brightness
			 * - Higher values = always brighter, less dramatic effect
			 * - Lower values = can fade more, more dramatic
			 * - Range: baseIntensity to baseIntensity + amplitude*2
			 */
			baseIntensity: 0.5,
		},

		/**
		 * GRADIENT FALLOFF: Controls how the star's brightness fades from center to edge
		 * These values create the circular "glow" appearance of each star
		 */
		gradient: {
			/**
			 * circleEdgeStart: Where the edge antialiasing begins (0.0 = center, 1.0 = edge)
			 * - Controls the size of the solid core before fade starts
			 * - Higher values = sharper, more defined stars
			 * - Lower values = softer, more bloomy stars
			 */
			circleEdgeStart: 0.6,

			/**
			 * circleEdgeEnd: Where the edge antialiasing completes
			 * - Works with circleEdgeStart to define the antialiasing range
			 * - Smaller range (closer to start) = sharper edge
			 * - Larger range (farther from start) = smoother, more blurred edge
			 */
			circleEdgeEnd: 0.9,

			/**
			 * falloffExponent: Power curve for alpha falloff from center to edge
			 * - Higher values = steeper falloff, tighter/crisper appearance
			 * - Lower values = gentler falloff, more glow
			 * - 1.0 = linear, >1.0 = exponential steepening
			 * - Current: 1.2 provides softer stars that match Canvas2D glow
			 */
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
		 * RENDERING: Visual appearance and shader parameters
		 */
		rendering: {
			/**
			 * sizeMultiplier: Converts radius to diameter to match Canvas2D ctx.arc()
			 * - Canvas2D uses radius, WebGL gl_PointSize uses diameter (2x conversion)
			 * - Current: 2.0 gives diameter range of 0.6-3.0px (matches Canvas2D exactly)
			 */
			sizeMultiplier: 4.0,

			/**
			 * minPixelSize: Minimum rendered size in pixels
			 * - Prevents rapid sub-pixel flickering (< 1px stars appear unstable)
			 * - Current: 1.5 ensures all stars are visible and stable
			 * - Set to 0 to allow natural flickering (can be visually jarring)
			 */
			minPixelSize: 2.0,

			/**
			 * sizeSmoothingFactor: Temporal smoothing for size transitions (0-1)
			 * - Reduces jarring size jumps from rotation/perspective changes
			 * - 0 = no smoothing (instant size changes)
			 * - 0.95 = very heavy smoothing (extremely gradual transitions)
			 * - Current: 0.95 provides maximum smoothing for edge stars
			 * - Edge stars flicker more due to higher tangential velocity
			 */
			sizeSmoothingFactor: 0.95,

			/**
			 * GRADIENT FALLOFF: Multi-zone rendering for nebula-like cluster glow
			 * Creates a more complex, natural-looking star with core, mid, and outer zones
			 */
			gradient: {
				/**
				 * circleEdgeStart/End: Controls how sharp the edge transition is
				 * - Higher values create more concentrated, brighter core stars
				 */
				circleEdgeStart: 0.8,
				circleEdgeEnd: 0.95,

				/**
				 * coreSizeThreshold: Radius where the bright core ends (0.0-1.0)
				 * - Inside this radius, stars are at full brightness
				 * - Current: 0.2 creates a small, intense core
				 */
				coreSizeThreshold: 0.2,

				/**
				 * midSizeThreshold: Radius where the mid-zone falloff ends
				 * - Between core and mid, alpha falls off quadratically
				 * - Beyond mid, alpha falls off linearly to create subtle outer glow
				 * - Current: 0.7 creates most of the visible star in the mid zone
				 */
				midSizeThreshold: 0.7,

				/**
				 * outerGlowAlpha: Maximum alpha for the outer glow zone
				 * - Controls how much subtle halo extends beyond the main star
				 * - Lower values = tighter stars, higher = more nebula-like
				 * - Current: 0.15 creates minimal but visible glow
				 */
				outerGlowAlpha: 0.15,
			},
		},

		/**
		 * GEOMETRY: Physical dimensions and shape of the galactic core
		 * These define the elliptical distribution of core stars
		 */
		geometry: {
			/**
			 * semiMajorAxis: Horizontal radius of the ellipse (a)
			 * - Defines the width of the lenticular galaxy shape
			 * - Current: 400000 (from cluster-ellipse-4x-center-close-1)
			 */
			semiMajorAxis: 400000,

			/**
			 * semiMinorAxis: Vertical radius of the ellipse (b)
			 * - Defines the height/thickness of the lenticular galaxy shape
			 * - Current: 80000 (from cluster-ellipse-4x-center-close-1)
			 */
			semiMinorAxis: 80000,

			/**
			 * distance: Z-depth range for core stars
			 * - Stars spawn randomly within this range
			 * - Larger range = more depth variation
			 */
			distance: {
				min: 300000,
				max: 3000000,
			},
		},

		/**
		 * PHYSICS: Motion and projection parameters
		 */
		physics: {
			/**
			 * approachSpeed: Forward motion speed in units/ms
			 * - Used as fallback when no motionVector is provided
			 * - Current: 50
			 */
			approachSpeed: 50,

			/**
			 * rollSpeed: Rotation speed in degrees per second
			 * - Negative values = clockwise rotation
			 * - Positive values = counter-clockwise rotation
			 * - Current: -1.5 for cinematic slow rotation
			 */
			rollSpeed: -1.5,

			/**
			 * focalLength: Perspective projection focal length
			 * - Lower values = wider field of view, more spread
			 * - Higher values = narrower FOV, more compressed
			 * - Current: 300
			 */
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
		 * RENDERING: Visual appearance and shader parameters
		 */
		rendering: {
			/**
			 * sizeMultiplier: Converts radius to diameter, slightly larger than core
			 * - Outer stars are closer, so appear slightly larger than distant core stars
			 * - Current: 3.0 provides good balance (user-tested)
			 */
			sizeMultiplier: 4.0,

			/**
			 * minPixelSize: Allow full natural size variance
			 * - Set to 0 to allow the full range from Star3D.project()
			 * - This allows natural flickering and the "growing" effect as stars approach
			 */
			minPixelSize: 0,

			/**
			 * sizeSmoothingFactor: Temporal smoothing for size transitions (0-1)
			 * - Same as core stars, reduces jarring size jumps
			 * - Current: 0.95 (maximum smoothing)
			 */
			sizeSmoothingFactor: 0.95,

			// Uses same gradient falloff as core stars
		},

		/**
		 * GEOMETRY: Physical dimensions and distribution
		 */
		geometry: {
			/**
			 * semiMajorAxis: Horizontal radius of the ellipse (a)
			 * - Defines the width of the outer star halo
			 * - Can be different from core to create varied shapes
			 * - Current: 400000 (matches core for now, but independently configurable)
			 */
			semiMajorAxis: 400000,

			/**
			 * semiMinorAxis: Vertical radius of the ellipse (b)
			 * - Defines the height/thickness of the outer star halo
			 * - Can be different from core to create varied shapes
			 * - Current: 80000 (matches core for now, but independently configurable)
			 */
			semiMinorAxis: 80000,

			/**
			 * distance: Z-depth range for outer stars
			 * - Current: 150000-600000 (2-5x closer than core!)
			 * - Being closer makes outer stars appear larger and creates dramatic growth effect
			 */
			distance: {
				min: 150000,
				max: 600000,
			},

			/**
			 * concentration: How tightly packed outer stars are (0-1)
			 * - Lower values = more concentrated toward center
			 * - Higher values = more spread out
			 * - Multiplied by ellipse axis radii to get effective distribution size
			 * - Current: 0.4 (from cluster-ellipse-4x-center-close-1)
			 */
			concentration: 0.8,
		},

		/**
		 * MODIFIERS: Additional multipliers applied in CenterClusterStar3D class
		 * These are separate from rendering.sizeMultiplier and applied at the Star3D level
		 */
		modifiers: {
			/**
			 * intensity: Brightness multiplier for outer stars
			 * - 1.0 = same as core stars
			 * - >1.0 = brighter outer halo
			 * - Applied to star intensity calculation
			 */
			intensity: 1.0,

			/**
			 * size: Size multiplier applied in the Star3D projection
			 * - 1.0 = matches Canvas2D configuration for dense flickering effect
			 * - This is separate from rendering.sizeMultiplier
			 * - Applied before rendering.sizeMultiplier
			 */
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
	 * STAR COUNTS: Number of stars to render in each layer
	 * Adjust these to balance visual density with performance
	 */
	starCounts: {
		/**
		 * foreground: Number of main starfield stars
		 * - These create the primary parallax effect
		 * - Use ForegroundToggle component in dev mode to toggle on/off
		 */
		foreground: 4000,

		/**
		 * core: Number of main galactic core stars
		 * - Form the primary mass of the galactic cluster
		 */
		core: 1000,

		/**
		 * outer: Number of outer halo stars
		 * - Create the extended galactic halo
		 */
		outer: 300,
	},

	/**
	 * RENDERING BOUNDS: How far beyond the viewport to render stars
	 * Controls the visibility margin for course changes and transitions
	 */
	renderingBounds: {
		/**
		 * marginMultiplier: Multiplier for the larger screen dimension
		 * - 1.0 = 100% margin (stars rendered up to 1 full screen away)
		 * - 1.5 = 150% margin (stars rendered up to 1.5 screens away)
		 * - Higher values ensure smooth transitions but render more off-screen stars
		 * - Current: 1.5 to handle extreme course changes and portrait mode
		 */
		marginMultiplier: 1.5,
	},
}
