import type { ProjectLinkType } from '@/types/portfolio'
import { ExternalLink, Github } from 'lucide-react'

/**
 * Utility functions for portfolio project links
 */

export const getLinkIcon = (type: ProjectLinkType) => {
	switch (type) {
		case 'github':
			return Github
		default:
			return ExternalLink
	}
}

export const getLinkColor = (type: ProjectLinkType): string => {
	switch (type) {
		case 'github':
			return 'border-purple-400 text-purple-300 hover:bg-purple-400/10'
		case 'demo':
			return 'border-green-400 text-green-300 hover:bg-green-400/10'
		case 'api':
			return 'border-blue-400 text-blue-300 hover:bg-blue-400/10'
		case 'website':
		default:
			return 'border-cyan-400 text-cyan-300 hover:bg-cyan-400/10'
	}
}

export const getLinkAriaLabel = (
	type: ProjectLinkType,
	projectTitle: string,
): string => {
	switch (type) {
		case 'github':
			return `View ${projectTitle} source code on GitHub`
		case 'demo':
			return `Try ${projectTitle} live demo`
		case 'api':
			return `View ${projectTitle} API documentation`
		case 'website':
		default:
			return `Visit ${projectTitle} website`
	}
}
