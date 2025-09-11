import { describe, expect, it } from 'vitest'
import type {
	Project,
	ProjectLink,
	ProjectLinkType,
	ProjectStatus,
} from '../portfolio'
import { PROJECT_LINK_TYPES, PROJECT_STATUS } from '../portfolio'

describe('Portfolio Types', () => {
	describe('PROJECT_LINK_TYPES', () => {
		it('should contain all expected link types', () => {
			expect(PROJECT_LINK_TYPES).toEqual(['github', 'demo', 'website', 'api'])
		})
	})

	describe('PROJECT_STATUS', () => {
		it('should contain all expected status values', () => {
			expect(PROJECT_STATUS).toEqual(['completed', 'in-progress', 'planned'])
		})
	})

	describe('Project interface validation', () => {
		const validProject: Project = {
			id: 'test-project',
			title: 'Test Project',
			description: 'A test project',
			longDescription: 'A longer description of the test project',
			technologies: ['TypeScript', 'React'],
			imageUrl: 'https://example.com/image.jpg',
			links: [
				{
					label: 'GitHub',
					url: 'https://github.com/test/project',
					type: 'github' as ProjectLinkType,
				},
			],
			featured: true,
			status: 'completed' as ProjectStatus,
		}

		it('should accept valid project structure', () => {
			expect(validProject.id).toBe('test-project')
			expect(validProject.links).toHaveLength(1)
			expect(validProject.technologies).toContain('TypeScript')
		})

		it('should validate link types', () => {
			const link: ProjectLink = {
				label: 'Test Link',
				url: 'https://example.com',
				type: 'github',
			}

			expect(PROJECT_LINK_TYPES).toContain(link.type)
		})

		it('should validate status types', () => {
			expect(PROJECT_STATUS).toContain(validProject.status)
		})
	})
})
