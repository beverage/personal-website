/**
 * Centralized animation configuration for portfolio components
 * Provides consistent timing and easing across all portfolio animations
 */

export const PORTFOLIO_ANIMATION_CONFIG = {
	// Card sliding animations
	cardSlide: {
		duration: 2.0,
		ease: [0.25, 0.1, 0.25, 1] as const,
	},

	// Content fade-in animations
	contentFade: {
		duration: 4.0,
		ease: [0.25, 0.1, 0.25, 1] as const,
		staggerDelay: 0.05,
	},

	// Navigation arrow animations
	navigationArrows: {
		fadeIn: {
			duration: 0.8,
			delays: {
				early: 0.2, // Up arrows (early navigation hint)
				hero: 0.8, // Hero down arrow (after content)
				late: 1.2, // Down arrows (after content established)
			},
		},
		fadeOut: {
			duration: 0.15, // Rapid fade-out
		},
	},

	// Content element timing
	contentElements: {
		title: { delay: 0.2, duration: 0.8 },
		description: { delay: 0.4, duration: 0.8 },
		technologies: { delay: 0.6, duration: 0.8 },
		techTags: { delay: 0.8, duration: 0.5, stagger: 0.1 },
		links: { delay: 1.2, duration: 0.8, stagger: 0.1 },
	},

	// Viewport configuration
	viewport: {
		once: false,
		margin: '-50px',
		amount: 0.3,
	},

	// Transition protection
	transitionLock: {
		duration: 2000, // Should match cardSlide.duration * 1000
	},
} as const

export type PortfolioAnimationConfig = typeof PORTFOLIO_ANIMATION_CONFIG
