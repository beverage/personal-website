import type { PortfolioData, Project } from '@/types/portfolio'

/**
 * Portfolio project data
 * Using placeholder images from picsum.photos for consistent, high-quality images
 */

export const projects: Project[] = [
	{
		id: 'levelang-app',
		title: 'LeveLang',
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
			'OpenAI',
		],
		imageUrl:
			'https://dummyimage.com/800x600/1a1a1a/00bcd4.png&text=placeholder',
		links: [
			{
				label: 'App Repository',
				url: 'https://github.com/beverage/language-levels/tree/main/language-level-app',
				type: 'github',
			},
			{
				label: 'Backend Repository',
				url: 'https://github.com/beverage/language-levels/tree/main/language-level-backend',
				type: 'github',
			},
			{
				label: 'Visit LeveLang.app',
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
		technologies: ['Python', 'FastAPI', 'PostgreSQL', 'OpenAI'],
		imageUrl:
			'https://dummyimage.com/800x600/1a1a1a/00bcd4.png&text=placeholder',
		links: [
			{
				label: 'View on GitHub',
				url: 'https://github.com/beverage/language-quiz-service',
				type: 'github',
			},
			{
				label: 'Try the Quiz',
				url: 'https://language-quiz.beverage.me',
				type: 'demo',
			},
			{
				label: 'API Documentation',
				url: 'https://language-quiz.beverage.me/api/docs',
				type: 'api',
			},
		],
		featured: true,
		status: 'in-progress',
	},
	{
		id: 'personal-website',
		title: 'beverage.me',
		description:
			'Interactive personal website with cinematic starfield animations',
		longDescription:
			'A modern personal portfolio website featuring an immersive dual-layer starfield animation system with course change transitions. Built with Next.js and TypeScript, showcasing advanced Canvas 2D animations, Framer Motion integration, and a centralized animation architecture. Features include transform-based portfolio scrolling, dynamic animation state management, and performance-optimized rendering.',
		technologies: [
			'Next.js',
			'TypeScript',
			'Framer Motion',
			'Canvas 2D',
			'Tailwind CSS',
		],
		imageUrl:
			'https://dummyimage.com/800x600/1a1a1a/00bcd4.png&text=beverage.me',
		links: [
			{
				label: 'View Source',
				url: 'https://github.com/beverage/personal-website',
				type: 'github',
			},
			{
				label: 'Visit Site',
				url: 'https://beverage.me',
				type: 'website',
			},
		],
		featured: true,
		status: 'completed',
	},
]

export const portfolioData: PortfolioData = {
	projects,
	totalProjects: projects.length,
}
