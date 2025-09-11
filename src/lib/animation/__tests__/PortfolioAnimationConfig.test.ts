import { describe, expect, it } from 'vitest'
import { PORTFOLIO_ANIMATION_CONFIG } from '../PortfolioAnimationConfig'

describe('PortfolioAnimationConfig', () => {
	describe('configuration structure', () => {
		it('should have all required configuration sections', () => {
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('cardSlide')
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('contentFade')
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('navigationArrows')
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('contentElements')
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('viewport')
			expect(PORTFOLIO_ANIMATION_CONFIG).toHaveProperty('transitionLock')
		})

		it('should have consistent easing curves', () => {
			const expectedEasing = [0.25, 0.1, 0.25, 1]

			expect(PORTFOLIO_ANIMATION_CONFIG.cardSlide.ease).toEqual(expectedEasing)
			expect(PORTFOLIO_ANIMATION_CONFIG.contentFade.ease).toEqual(
				expectedEasing,
			)
		})

		it('should have reasonable duration values', () => {
			expect(PORTFOLIO_ANIMATION_CONFIG.cardSlide.duration).toBeGreaterThan(0)
			expect(PORTFOLIO_ANIMATION_CONFIG.cardSlide.duration).toBeLessThan(10)

			expect(PORTFOLIO_ANIMATION_CONFIG.contentFade.duration).toBeGreaterThan(0)
			expect(PORTFOLIO_ANIMATION_CONFIG.contentFade.duration).toBeLessThan(10)
		})
	})

	describe('navigation arrows configuration', () => {
		it('should have faster fade-out than fade-in', () => {
			const { fadeIn, fadeOut } = PORTFOLIO_ANIMATION_CONFIG.navigationArrows

			expect(fadeOut.duration).toBeLessThan(fadeIn.duration)
		})

		it('should have logical delay progression', () => {
			const delays = PORTFOLIO_ANIMATION_CONFIG.navigationArrows.fadeIn.delays

			expect(delays.early).toBeLessThan(delays.hero)
			expect(delays.hero).toBeLessThan(delays.late)
		})
	})

	describe('content elements configuration', () => {
		it('should have progressive delays', () => {
			const elements = PORTFOLIO_ANIMATION_CONFIG.contentElements

			expect(elements.title.delay).toBeLessThan(elements.description.delay)
			expect(elements.description.delay).toBeLessThan(
				elements.technologies.delay,
			)
			expect(elements.technologies.delay).toBeLessThan(elements.techTags.delay)
			expect(elements.techTags.delay).toBeLessThan(elements.links.delay)
		})

		it('should have stagger values for appropriate elements', () => {
			const elements = PORTFOLIO_ANIMATION_CONFIG.contentElements

			expect(elements.techTags).toHaveProperty('stagger')
			expect(elements.links).toHaveProperty('stagger')
			expect(elements.techTags.stagger).toBeGreaterThan(0)
			expect(elements.links.stagger).toBeGreaterThan(0)
		})
	})

	describe('viewport configuration', () => {
		it('should have sensible viewport settings', () => {
			const viewport = PORTFOLIO_ANIMATION_CONFIG.viewport

			expect(viewport.once).toBe(false) // Should animate every time
			expect(viewport.amount).toBeGreaterThan(0)
			expect(viewport.amount).toBeLessThanOrEqual(1)
			expect(viewport.margin).toMatch(/^-?\d+px$/)
		})
	})
})
