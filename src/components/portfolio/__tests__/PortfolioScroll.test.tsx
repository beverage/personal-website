import { HeroTextProvider } from '@/contexts/HeroTextContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { QuizDemoProvider } from '@/contexts/QuizDemoContext'
import type { Project } from '@/types/portfolio'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PortfolioScroll } from '../PortfolioScroll'

// Mock framer-motion to avoid animation complexities in tests
vi.mock('framer-motion', () => ({
	motion: {
		div: ({ children, ...props }: React.ComponentProps<'div'>) => (
			<div {...props}>{children}</div>
		),
		h1: ({ children, ...props }: React.ComponentProps<'h1'>) => (
			<h1 {...props}>{children}</h1>
		),
		p: ({ children, ...props }: React.ComponentProps<'p'>) => (
			<p {...props}>{children}</p>
		),
		h3: ({ children, ...props }: React.ComponentProps<'h3'>) => (
			<h3 {...props}>{children}</h3>
		),
		img: ({ ...props }: React.ComponentProps<'img'>) => (
			// eslint-disable-next-line @next/next/no-img-element
			<img alt="test" {...props} />
		),
		a: ({ children, ...props }: React.ComponentProps<'a'>) => (
			<a {...props}>{children}</a>
		),
		span: ({ children, ...props }: React.ComponentProps<'span'>) => (
			<span {...props}>{children}</span>
		),
	},
	AnimatePresence: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
}))

// Mock NavigationArrow component
vi.mock('../NavigationArrows', () => ({
	NavigationArrow: ({
		direction,
		onClick,
		'aria-label': ariaLabel,
	}: {
		direction: 'up' | 'down'
		onClick: () => void
		'aria-label'?: string
	}) => (
		<button
			onClick={onClick}
			aria-label={ariaLabel}
			data-testid={`nav-arrow-${direction}`}
		>
			{direction === 'up' ? '↑' : '↓'}
		</button>
	),
}))

describe('PortfolioScroll', () => {
	const mockProjects: Project[] = [
		{
			id: 'project-1',
			title: 'Test Project 1',
			description: 'First test project',
			longDescription: 'Detailed description of first project',
			technologies: ['React', 'TypeScript'],
			imageUrl: 'https://example.com/image1.jpg',
			links: [
				{ label: 'GitHub', url: 'https://github.com/test/1', type: 'github' },
			],
			status: 'completed',
		},
		{
			id: 'project-2',
			title: 'Test Project 2',
			description: 'Second test project',
			longDescription: 'Detailed description of second project',
			technologies: ['Python', 'FastAPI'],
			imageUrl: 'https://example.com/image2.jpg',
			links: [{ label: 'Demo', url: 'https://demo.example.com', type: 'demo' }],
			status: 'in-progress',
		},
	]

	describe('rendering', () => {
		it('should render projects hero section', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			expect(screen.getByText('Projects')).toBeInTheDocument()
			expect(
				screen.getByText('Explore my work and projects.'),
			).toBeInTheDocument()
		})

		it('should render all project cards', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			expect(screen.getByText('Test Project 1')).toBeInTheDocument()
			expect(screen.getByText('Test Project 2')).toBeInTheDocument()
		})

		it('should render project technologies', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// Technologies appear in both desktop and mobile sections
			const reactElements = screen.getAllByText('React')
			const typescriptElements = screen.getAllByText('TypeScript')
			const pythonElements = screen.getAllByText('Python')
			const fastApiElements = screen.getAllByText('FastAPI')

			expect(reactElements.length).toBeGreaterThan(0)
			expect(typescriptElements.length).toBeGreaterThan(0)
			expect(pythonElements.length).toBeGreaterThan(0)
			expect(fastApiElements.length).toBeGreaterThan(0)

			// Verify at least one instance is in the document
			expect(reactElements[0]).toBeInTheDocument()
			expect(typescriptElements[0]).toBeInTheDocument()
			expect(pythonElements[0]).toBeInTheDocument()
			expect(fastApiElements[0]).toBeInTheDocument()
		})

		it('should render project links', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// Links appear in both desktop and mobile sections
			const githubLinks = screen.getAllByText('GitHub')
			const demoLinks = screen.getAllByText('Demo')

			expect(githubLinks.length).toBeGreaterThan(0)
			expect(demoLinks.length).toBeGreaterThan(0)

			// Verify at least one instance is in the document
			expect(githubLinks[0]).toBeInTheDocument()
			expect(demoLinks[0]).toBeInTheDocument()
		})

		it('should render status badges', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			expect(screen.getByText('In Progress')).toBeInTheDocument()
		})
	})

	describe('navigation', () => {
		it('should handle wheel events', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)
			const container = document.querySelector('.portfolio-scroll')

			expect(container).toBeInTheDocument()

			// Test wheel event handling (without timing complexities)
			const wheelEvent = new WheelEvent('wheel', { deltaY: 100 })
			fireEvent(container!, wheelEvent)

			// Should not throw errors
			expect(container).toBeInTheDocument()
		})

		it('should render navigation arrows when appropriate', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// Down arrow should be present initially (from hero)
			const downArrows = screen.getAllByTestId('nav-arrow-down')
			expect(downArrows.length).toBeGreaterThan(0)
		})
	})

	describe('project links', () => {
		it('should render links with correct attributes', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// Links appear in both desktop and mobile sections, use getAllByText
			const githubLinks = screen.getAllByText('GitHub')
			const githubLink = githubLinks[0].closest('a')
			expect(githubLink).toHaveAttribute('href', 'https://github.com/test/1')
			expect(githubLink).toHaveAttribute('target', '_blank')
			expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer')

			const demoLinks = screen.getAllByText('Demo')
			const demoLink = demoLinks[0].closest('a')
			expect(demoLink).toHaveAttribute('href', 'https://demo.example.com')
		})
	})

	describe('error handling', () => {
		it('should handle empty projects array', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={[]} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			expect(screen.getByText('Projects')).toBeInTheDocument()
			expect(
				screen.getByText('Explore my work and projects.'),
			).toBeInTheDocument()
		})

		it('should handle image load errors gracefully', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<QuizDemoProvider>
							<PortfolioScroll projects={mockProjects} />
						</QuizDemoProvider>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const images = screen.getAllByRole('img')
			images.forEach(img => {
				// Simulate image load error
				fireEvent.error(img)
				// Should not throw errors
			})
		})
	})
})
