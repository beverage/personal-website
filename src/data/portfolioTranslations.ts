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
			'OpenAI',
		],
		imageUrl: '/images/portfolio/levelang-placeholder.svg',
		links: [
			{
				labelKey: 'appRepository',
				url: 'https://github.com/beverage/language-levels/tree/main/language-level-app',
				type: 'github' as const,
			},
			{
				labelKey: 'backendRepository',
				url: 'https://github.com/beverage/language-levels/tree/main/language-level-backend',
				type: 'github' as const,
			},
			{
				labelKey: 'visitWebsite',
				url: 'https://www.levelang.app',
				type: 'website' as const,
			},
		],
		featured: true,
		status: 'in-progress' as const,
		translationKey: 'levelang' as const,
	},
	{
		id: 'language-quiz-service',
		technologies: ['Python', 'FastAPI', 'PostgreSQL', 'OpenAI'],
		imageUrl: '/images/portfolio/quiz-service-placeholder.svg',
		links: [
			{
				labelKey: 'viewGithub',
				url: 'https://github.com/beverage/language-quiz-service',
				type: 'github' as const,
			},
			{
				labelKey: 'tryQuiz',
				url: 'https://language-quiz.beverage.me',
				type: 'demo' as const,
			},
			{
				labelKey: 'apiDocs',
				url: 'https://language-quiz.beverage.me/api/docs',
				type: 'api' as const,
			},
		],
		featured: true,
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
			links: project.links.map(link => ({
				label: (projectTranslations.links as Record<string, string>)[
					link.labelKey
				],
				url: link.url,
				type: link.type,
			})),
			featured: project.featured,
			status: project.status,
		}
	})

	return {
		projects,
		totalProjects: projects.length,
	}
}
