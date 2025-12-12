/**
 * Portfolio project data types
 */

export const PROJECT_LINK_TYPES = [
	'github',
	'demo',
	'website',
	'api',
	'gallery',
] as const
export type ProjectLinkType = (typeof PROJECT_LINK_TYPES)[number]

export const PROJECT_STATUS = ['completed', 'in-progress', 'planned'] as const
export type ProjectStatus = (typeof PROJECT_STATUS)[number]

export interface ProjectLink {
	label: string
	url: string
	type: ProjectLinkType
}

export interface Project {
	id: string
	title: string
	description: string
	longDescription: string
	technologies: string[]
	imageUrl: string
	links: ProjectLink[]
	featured: boolean
	status: ProjectStatus
}

export interface PortfolioData {
	projects: Project[]
	totalProjects: number
}
