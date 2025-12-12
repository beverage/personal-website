import { PROJECT_LINK_TYPES, PROJECT_STATUS } from '@/types/portfolio'
import { describe, expect, it } from 'vitest'
import { portfolioData, projects } from '../portfolio'

describe('Portfolio Data', () => {
	describe('projects array', () => {
		it('should contain projects with valid structure', () => {
			expect(projects).toHaveLength(2)

			projects.forEach(project => {
				expect(project).toHaveProperty('id')
				expect(project).toHaveProperty('title')
				expect(project).toHaveProperty('description')
				expect(project).toHaveProperty('longDescription')
				expect(project).toHaveProperty('technologies')
				expect(project).toHaveProperty('imageUrl')
				expect(project).toHaveProperty('links')
				expect(project).toHaveProperty('featured')
				expect(project).toHaveProperty('status')
			})
		})

		it('should have unique project IDs', () => {
			const ids = projects.map(p => p.id)
			const uniqueIds = new Set(ids)
			expect(uniqueIds.size).toBe(ids.length)
		})

		it('should have valid link types', () => {
			projects.forEach(project => {
				project.links.forEach(link => {
					expect(PROJECT_LINK_TYPES).toContain(link.type)
					// Allow http(s) URLs or internal anchors (#)
					expect(link.url).toMatch(/^(https?:\/\/|#)/)
					expect(link.label).toBeTruthy()
				})
			})
		})

		it('should have valid status values', () => {
			projects.forEach(project => {
				expect(PROJECT_STATUS).toContain(project.status)
			})
		})

		it('should have non-empty technology arrays', () => {
			projects.forEach(project => {
				expect(project.technologies.length).toBeGreaterThan(0)
				project.technologies.forEach(tech => {
					expect(tech).toBeTruthy()
					expect(typeof tech).toBe('string')
				})
			})
		})
	})

	describe('portfolioData', () => {
		it('should have correct totalProjects count', () => {
			expect(portfolioData.totalProjects).toBe(projects.length)
		})

		it('should reference the same projects array', () => {
			expect(portfolioData.projects).toBe(projects)
		})
	})

	describe('specific project validation', () => {
		it('should have levelang.app as first project', () => {
			const levelang = projects[0]
			expect(levelang.id).toBe('levelang-app')
			expect(levelang.title).toBe('levelang.app')
			expect(levelang.status).toBe('in-progress')
			expect(levelang.featured).toBe(true)
		})

		it('should have AI Language Quiz Generator as second project', () => {
			const quizGenerator = projects[1]
			expect(quizGenerator.id).toBe('language-quiz-service')
			expect(quizGenerator.title).toBe('AI Language Quiz Generator')
			expect(quizGenerator.technologies).toContain('OpenAI')
		})
	})
})
