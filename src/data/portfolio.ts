import type { PortfolioData, Project } from '@/types/portfolio'

/**
 * Portfolio project data
 * Using self-hosted placeholder images for China accessibility
 */

export const projects: Project[] = [
	{
		id: 'levelang-app',
		title: 'levelang.app',
		description:
			'Skill-level-aware translation assistant for language learners',
		longDescription:
			'A translation application for iOS and Android that adapts translation complexity to match your language proficiency level and desired mood. Like Google Translate, but tailored for learners - providing beginner-friendly, intermediate, or advanced translations. Features voice input/output, transliterations, and comprehensive language support for French, German, Mandarin Chinese, and Cantonese.',
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
		links: [
			{
				label: 'Gallery',
				url: '#gallery',
				type: 'gallery',
			},
			{
				label: 'Visit levelang.app',
				url: 'https://www.levelang.app',
				type: 'website',
			},
		],
		featured: true,
		status: 'in-progress',
	},
	{
		id: 'language-quiz-service',
		title: 'AI Language Quiz Generator',
		description:
			'AI-powered French grammar quiz app with dynamic content generation',
		longDescription:
			'A French language grammar quiz generator application that uses AI to dynamically generate content tailored to specific language features a user wants to study. The system adapts questions and exercises based on user preferences, creating personalized grammar practice sessions for targeted learning.',
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
				label: 'View on GitHub',
				url: 'https://github.com/beverage/language-quiz-service',
				type: 'github',
			},
			{
				label: 'API Documentation',
				url: 'https://registry.scalar.com/@lqs/apis/language-quiz-service-api/latest',
				type: 'api',
			},
			{
				label: 'Try a Quiz',
				url: '#quiz',
				type: 'demo',
			},
		],
		featured: true,
		status: 'in-progress',
	},
]

export const portfolioData: PortfolioData = {
	projects,
	totalProjects: projects.length,
}
