export type CourseChangeVariant =
	| 'gentle-drift'
	| 'banking-turn'
	| 'sharp-maneuver'

export interface ContentFadeConfig {
	fadeOutRatio: number // 0.0-1.0: Portion of transition for fading out current content (e.g., 0.33 = first 1/3)
	starfieldOnlyRatio: number // 0.0-1.0: Portion of transition for pure starfield visibility (e.g., 0.33 = middle 1/3)
	fadeInRatio: number // 0.0-1.0: Portion of transition for fading in new content (e.g., 0.33 = last 1/3)
}

export interface CourseChangeConfig {
	variant: CourseChangeVariant
	duration: number // Transition duration in ms
	parallaxIntensity: number // 0.0 - 2.0, controls how dramatic the motion feels
	maxLateralSpeed: number // Maximum sideways velocity during transition
	rollIntensity: number // Degrees per second of banking roll (0 = no roll, 5-15 = subtle, 20+ = dramatic)
	easingCurve:
		| 'ease-in-out'
		| 'ease-out'
		| 'ease-in'
		| 'linear'
		| 'fast-in-slow-out'
		| 'custom'
	// Custom easing parameters (when easingCurve = 'custom')
	customEasing?: {
		accelerationPower: number // 1-5: How aggressively it accelerates (higher = faster start)
		decelerationPower: number // 1-5: How gradually it decelerates (higher = slower end)
	}
	contentFade: ContentFadeConfig // 3-phase content fade timing
	settlingDuration: number // Duration to return to forward motion
}

export interface TransitionState {
	phase: 'idle' | 'transitioning' | 'settling'
	direction: 'left' | 'right' | null
	progress: number // 0-1
	startTime: number
	// Note: Content fade phases are now calculated from progress and contentFade ratios
}

export interface MotionVector {
	forward: number // Z-axis speed (toward viewer)
	lateral: number // X-axis speed (left/right)
	vertical: number // Y-axis speed (up/down, minimal)
}

export interface BankingRoll {
	foregroundRollSpeed: number // Roll speed for foreground stars (banking effect)
	backgroundRollSpeed: number // Roll speed for background cluster (unchanged)
}

export interface ParallaxFactors {
	foreground: number // Full parallax intensity (1.0x)
	center: number // Moderate parallax (0.3x)
	background: number // Minimal parallax (0.05x)
}

// Preset configurations for different transition variants
export const COURSE_CHANGE_PRESETS: Record<
	CourseChangeVariant,
	CourseChangeConfig
> = {
	'gentle-drift': {
		variant: 'gentle-drift',
		duration: 2500,
		parallaxIntensity: 0.2, // Very subtle cinematic drift
		maxLateralSpeed: 10000, // Scaled for visible screen motion
		rollIntensity: 200, // Subtle banking roll
		easingCurve: 'ease-in-out',
		contentFade: {
			fadeOutRatio: 0.35, // First 35% - fade out current content
			starfieldOnlyRatio: 0.3, // Middle 30% - pure starfield visibility
			fadeInRatio: 0.35, // Last 35% - fade in new content
		},
		settlingDuration: 800,
	},
	'banking-turn': {
		variant: 'banking-turn',
		duration: 4000,
		parallaxIntensity: 0.4, // Moderate cinematic banking
		maxLateralSpeed: 20000, // Increased back up for dramatic screen-wide motion
		rollIntensity: 300, // Moderate banking roll
		easingCurve: 'fast-in-slow-out', // Fixed timing race condition, back to advanced easing
		contentFade: {
			fadeOutRatio: 0.25,
			starfieldOnlyRatio: 0.5,
			fadeInRatio: 0.25,
		},
		settlingDuration: 500,
	},
	'sharp-maneuver': {
		variant: 'sharp-maneuver',
		duration: 1500,
		parallaxIntensity: 0.8, // More pronounced but still elegant
		maxLateralSpeed: 40000, // Scaled for visible screen motion
		rollIntensity: 600, // More pronounced banking roll
		easingCurve: 'custom',
		customEasing: {
			accelerationPower: 4, // Very aggressive acceleration
			decelerationPower: 1.5, // Moderate deceleration
		},
		contentFade: {
			fadeOutRatio: 0.3, // First 30% - quick fade out
			starfieldOnlyRatio: 0.4, // Middle 40% - longer pure starfield
			fadeInRatio: 0.3, // Last 30% - quick fade in
		},
		settlingDuration: 400,
	},
}

// Default parallax factors for different star layers
export const DEFAULT_PARALLAX_FACTORS: ParallaxFactors = {
	foreground: 1.0, // Foreground stars show full directional movement
	center: 0.3, // Center stars show moderate movement
	background: 0.05, // Background cluster remains nearly stationary
}

// Content states for the application
export type ContentState = 'hero' | 'projects' | 'contact'

// Easing functions for smooth transitions
export const EASING_FUNCTIONS = {
	linear: (t: number): number => t,
	'ease-in': (t: number): number => t * t * t, // Fast acceleration
	'ease-out': (t: number): number => 1 - Math.pow(1 - t, 3), // Gradual deceleration
	'ease-in-out': (t: number): number =>
		t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
	'fast-in-slow-out': (t: number): number => {
		// 5% acceleration to max velocity, 95% gentle deceleration
		if (t < 0.1) {
			const accelerationT = t / 0.1
			const progress = accelerationT * accelerationT * (3 - 2 * accelerationT)
			return 0.1 * progress
		} else {
			const decelerateT = (t - 0.1) / 0.9
			// Exponential decay approach - much more natural deceleration
			const decelerationCurve = 1 - Math.exp(-3 * decelerateT)
			return 0.1 + 0.9 * decelerationCurve
		}
	},
	custom: (t: number, accelerationPower = 3, decelerationPower = 2): number => {
		// Configurable acceleration/deceleration curve
		const midpoint = 0.4 // Where acceleration transitions to deceleration
		if (t < midpoint) {
			// Acceleration phase: t^accelerationPower
			return Math.pow(t / midpoint, accelerationPower) * 0.6
		} else {
			// Deceleration phase: gradual approach to 1.0
			const decelerateT = (t - midpoint) / (1 - midpoint)
			return 0.6 + 0.4 * (1 - Math.pow(1 - decelerateT, 1 / decelerationPower))
		}
	},
} as const

// Settling phase easing (gradually reduce lateral velocity)
export const settlingEase = (t: number): number => 1 - Math.pow(1 - t, 3)
