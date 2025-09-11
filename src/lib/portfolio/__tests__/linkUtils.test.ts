import { ExternalLink, Github } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { getLinkAriaLabel, getLinkColor, getLinkIcon } from '../linkUtils'

describe('Link Utils', () => {
	describe('getLinkIcon', () => {
		it('should return Github icon for github type', () => {
			expect(getLinkIcon('github')).toBe(Github)
		})

		it('should return ExternalLink icon for other types', () => {
			expect(getLinkIcon('demo')).toBe(ExternalLink)
			expect(getLinkIcon('website')).toBe(ExternalLink)
			expect(getLinkIcon('api')).toBe(ExternalLink)
		})
	})

	describe('getLinkColor', () => {
		it('should return correct colors for each link type', () => {
			expect(getLinkColor('github')).toContain('border-purple-400')
			expect(getLinkColor('demo')).toContain('border-green-400')
			expect(getLinkColor('api')).toContain('border-blue-400')
			expect(getLinkColor('website')).toContain('border-cyan-400')
		})

		it('should have consistent color pattern structure', () => {
			const colors = ['github', 'demo', 'api', 'website'] as const

			colors.forEach(type => {
				const colorClass = getLinkColor(type)
				expect(colorClass).toMatch(/border-\w+-400/)
				expect(colorClass).toMatch(/text-\w+-300/)
				expect(colorClass).toMatch(/hover:bg-\w+-400\/10/)
			})
		})

		it('should default to cyan for unknown types', () => {
			// @ts-expect-error Testing invalid type
			expect(getLinkColor('invalid')).toContain('border-cyan-400')
		})
	})

	describe('getLinkAriaLabel', () => {
		const projectTitle = 'Test Project'

		it('should generate appropriate labels for each link type', () => {
			expect(getLinkAriaLabel('github', projectTitle)).toBe(
				'View Test Project source code on GitHub',
			)
			expect(getLinkAriaLabel('demo', projectTitle)).toBe(
				'Try Test Project live demo',
			)
			expect(getLinkAriaLabel('api', projectTitle)).toBe(
				'View Test Project API documentation',
			)
			expect(getLinkAriaLabel('website', projectTitle)).toBe(
				'Visit Test Project website',
			)
		})

		it('should include project title in all labels', () => {
			const types = ['github', 'demo', 'api', 'website'] as const

			types.forEach(type => {
				const label = getLinkAriaLabel(type, projectTitle)
				expect(label).toContain(projectTitle)
			})
		})
	})
})
