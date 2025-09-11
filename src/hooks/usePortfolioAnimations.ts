'use client'

import { PORTFOLIO_ANIMATION_CONFIG } from '@/lib/animation/PortfolioAnimationConfig'

/**
 * Custom hooks for portfolio animation configurations
 * Provides consistent animation variants and configurations
 */

export const useProjectCardVariants = (index: number) => {
	const config = PORTFOLIO_ANIMATION_CONFIG

	return {
		hidden: {
			opacity: 0,
			y: 60,
			scale: 0.92,
		},
		visible: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				duration: config.contentFade.duration,
				ease: config.contentFade.ease,
				delay: index * config.contentFade.staggerDelay,
			},
		},
	} as const
}

export const useContentElementAnimation = (
	elementType: keyof typeof PORTFOLIO_ANIMATION_CONFIG.contentElements,
) => {
	const config = PORTFOLIO_ANIMATION_CONFIG.contentElements[elementType]

	return {
		initial: { opacity: 0, y: 20 },
		whileInView: { opacity: 1, y: 0 },
		viewport: PORTFOLIO_ANIMATION_CONFIG.viewport,
		transition: {
			duration: config.duration,
			delay: config.delay,
		},
	}
}

export const useNavigationArrowAnimation = (
	type: 'early' | 'hero' | 'late',
	direction: 'up' | 'down',
) => {
	const config = PORTFOLIO_ANIMATION_CONFIG.navigationArrows
	const yDirection = direction === 'up' ? -10 : 10

	return {
		initial: { opacity: 0, y: yDirection },
		animate: {
			opacity: 1,
			y: 0,
			transition: {
				duration: config.fadeIn.duration,
				delay: config.fadeIn.delays[type],
			},
		},
		exit: {
			opacity: 0,
			y: -yDirection,
			transition: { duration: config.fadeOut.duration },
		},
	}
}

export const useCardSlideAnimation = (position: number) => {
	const config = PORTFOLIO_ANIMATION_CONFIG.cardSlide

	return {
		animate: {
			y: `${position * 100}%`,
		},
		transition: {
			duration: config.duration,
			ease: config.ease,
		},
	}
}
