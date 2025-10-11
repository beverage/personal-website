/**
 * Centralized animation configuration for debug panel expand/collapse
 * Provides consistent timing for the multi-stage animation sequence
 */

export const DEBUG_PANEL_ANIMATION_CONFIG = {
	// Opening sequence
	open: {
		// Stage 1: + button fades out
		plusFadeOut: {
			duration: 0.2,
			delay: 0,
		},
		// Stage 2: Vertical bar fades in
		barFadeIn: {
			duration: 0.3,
			delay: 0.2, // After plus fades out
		},
		// Stage 3: Box expands leftward
		boxExpand: {
			duration: 0.4,
			delay: 0.5, // After bar fades in
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 4: Buttons fade in
		buttonsFadeIn: {
			duration: 0.3,
			delay: 0.9, // After box expands
		},
	},

	// Closing sequence (reverse)
	close: {
		// Stage 1: Buttons fade out
		buttonsFadeOut: {
			duration: 0.2,
			delay: 0,
		},
		// Stage 2: Box contracts
		boxContract: {
			duration: 0.4,
			delay: 0.2, // After buttons fade out
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 3: Bar fades out
		barFadeOut: {
			duration: 0.3,
			delay: 0.6, // After box contracts
		},
		// Stage 4: + button fades in
		plusFadeIn: {
			duration: 0.2,
			delay: 0.9, // After bar fades out
		},
	},

	// Visual styling
	bar: {
		thickness: 32, // pixels - width of close button stripe
	},
} as const

export type DebugPanelAnimationConfig = typeof DEBUG_PANEL_ANIMATION_CONFIG
