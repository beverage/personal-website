/**
 * Centralized animation configuration for gallery modal expand/collapse
 * Provides consistent timing for the multi-stage animation sequence
 *
 * Opening: backdrop → height → width → content
 * Closing: content → width → height → backdrop
 */

export const GALLERY_MODAL_ANIMATION_CONFIG = {
	// Opening sequence
	open: {
		// Stage 1: Backdrop fades in
		backdropFadeIn: {
			duration: 0.3,
			delay: 0,
		},
		// Stage 2: Card height grows from center
		heightGrow: {
			duration: 0.3,
			delay: 0.3, // After backdrop
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 3: Card width expands left and right
		widthExpand: {
			duration: 0.4,
			delay: 0.6, // After height
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 4: Carousel content fades in
		contentFadeIn: {
			duration: 0.3,
			delay: 1.0, // After width
		},
	},

	// Closing sequence (reverse)
	close: {
		// Stage 1: Carousel content fades out
		contentFadeOut: {
			duration: 0.2,
			delay: 0,
		},
		// Stage 2: Card width contracts
		widthContract: {
			duration: 0.4,
			delay: 0.2, // After content fades
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 3: Card height shrinks
		heightShrink: {
			duration: 0.3,
			delay: 0.6, // After width
			ease: [0.25, 0.1, 0.25, 1] as const,
		},
		// Stage 4: Backdrop fades out
		backdropFadeOut: {
			duration: 0.3,
			delay: 0.9, // After height
		},
	},

	// Card dimensions
	card: {
		// Initial point size (before animation)
		initialWidth: 4, // pixels
		initialHeight: 4, // pixels
		// Intermediate height (after height grows, before width expands)
		barHeight: 520, // pixels - matches h-[32rem] + padding
		barWidth: 4, // pixels
		// Full expanded width (max-w-5xl = 64rem = 1024px, but capped by viewport)
		fullWidth: 1024, // pixels
	},
} as const

export type GalleryModalAnimationConfig = typeof GALLERY_MODAL_ANIMATION_CONFIG
