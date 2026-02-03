import type { Language } from '@/contexts/LanguageContext'
import enTranslations from '@/locales/en.json'
import frTranslations from '@/locales/fr.json'
import type { PortfolioData, Project } from '@/types/portfolio'

const translations = {
	en: enTranslations,
	fr: frTranslations,
}

// Base project data (without translatable content)
const baseProjects = [
	{
		id: 'levelang-app',
		technologies: [
			'React Native',
			'TypeScript',
			'FastAPI',
			'Python',
			'PostgreSQL',
			'Supabase',
			'OpenAI',
			'Docker',
			'Fly.io',
		],
		imageUrl: '/images/portfolio/levelang-placeholder.svg',
		previewVideos: [
			'/videos/portfolio/levelang-preview-1-user-perspective-360.mp4',
			'/videos/portfolio/levelang-preview-2-user-perspective-response-360.mp4',
		],
		expandedVideos: [
			'/videos/portfolio/levelang-preview-1-user-perspective-1024.mp4',
			'/videos/portfolio/levelang-preview-2-user-perspective-response-1024.mp4',
		],
		links: [
			{
				labelKey: 'gallery',
				url: '#gallery',
				type: 'gallery' as const,
			},
			{
				labelKey: 'visitWebsite',
				url: 'https://www.levelang.app',
				type: 'website' as const,
			},
		],
		status: 'in-progress' as const,
		translationKey: 'levelang' as const,
	},
	{
		id: 'language-quiz-service',
		technologies: [
			'Python',
			'FastAPI',
			'PostgreSQL',
			'Supabase',
			'Kafka',
			'OpenAI',
			'Docker',
			'Fly.io',
		],
		imageUrl: '/images/portfolio/quiz-service-placeholder.svg',
		links: [
			{
				labelKey: 'viewGithub',
				url: 'https://github.com/beverage/language-quiz-service',
				type: 'github' as const,
			},
			{
				labelKey: 'apiDocs',
				url: 'https://registry.scalar.com/@lqs/apis/language-quiz-service-api/latest',
				type: 'api' as const,
			},
			{
				labelKey: 'tryQuiz',
				url: '#quiz', // Internal navigation - uses LQS_SERVICE_URL via API route
				type: 'demo' as const,
			},
		],
		status: 'in-progress' as const,
		translationKey: 'quiz' as const,
	},
]

export const getTranslatedPortfolioData = (
	language: Language,
): PortfolioData => {
	const t = translations[language].projects

	const projects: Project[] = baseProjects.map(project => {
		const projectTranslations = t[project.translationKey]

		return {
			id: project.id,
			title: projectTranslations.title,
			description: projectTranslations.description,
			longDescription: projectTranslations.longDescription,
			technologies: project.technologies,
			imageUrl: project.imageUrl,
			previewVideos: project.previewVideos,
			expandedVideos: project.expandedVideos,
			links: project.links.map(link => ({
				label: (projectTranslations.links as Record<string, string>)[
					link.labelKey
				],
				url: link.url,
				type: link.type,
			})),
			status: project.status,
		}
	})

	return {
		projects,
		totalProjects: projects.length,
	}
}
