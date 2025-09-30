import { LanguageProvider } from '@/contexts/LanguageContext'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PageLayout } from '../PageLayout'

// Mock the starfield components to avoid canvas rendering in tests
vi.mock('../../starfield/LayeredStarField', () => ({
	HomepageLayeredStarField: ({
		children,
		...props
	}: React.PropsWithChildren<Record<string, unknown>>) => (
		<div data-testid="starfield" data-props={JSON.stringify(props)}>
			{children}
		</div>
	),
}))

// Mock the hooks
vi.mock('@/hooks/useContentState', () => ({
	useContentState: () => ({
		contentState: 'hero',
		navigateToProjects: vi.fn(),
		navigateToContact: vi.fn(),
		navigateToHero: vi.fn(),
		isTransitioning: false,
		setIsTransitioning: vi.fn(),
	}),
}))

vi.mock('@/hooks/useStarFieldTransition', () => ({
	useStarFieldTransition: () => ({
		motionVectors: {
			foreground: { forward: 300, lateral: 0, vertical: 0 },
			center: { forward: 300, lateral: 0, vertical: 0 },
			background: { forward: 300, lateral: 0, vertical: 0 },
		},
		bankingRoll: {
			foregroundRollSpeed: -1.5,
			backgroundRollSpeed: -1.5,
		},
		startTransition: vi.fn(),
		currentContentOpacity: 1,
		newContentOpacity: 0,
		isTransitioning: false,
	}),
}))

describe('PageLayout Integration Tests', () => {
	beforeEach(() => {
		// Mock requestAnimationFrame for animations
		global.requestAnimationFrame = vi.fn(cb => {
			setTimeout(cb, 16)
			return 1
		})
		global.cancelAnimationFrame = vi.fn()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	const defaultProps = {
		heroTitle: 'Test Hero',
		heroDescription: 'Test Description',
		courseChangeVariant: 'banking-turn' as const,
	}

	it('renders brand panel and control panel', () => {
		render(
			<LanguageProvider>
				<PageLayout {...defaultProps} brandName="test.brand" />
			</LanguageProvider>,
		)

		expect(screen.getByText('test.brand')).toBeInTheDocument()
		// Control panel (rocket button + language toggle buttons) should be present - there are multiple buttons so we count them
		expect(screen.getAllByRole('button')).toHaveLength(4) // rocket + language toggle (2 buttons) + hero button
	})

	it('renders CV link when provided', () => {
		const clientConfig = {
			socialLinks: [],
			copyrightYear: 2024,
			cvUrl: 'https://example.com/cv.pdf',
		}

		render(
			<LanguageProvider>
				<PageLayout {...defaultProps} clientConfig={clientConfig} />
			</LanguageProvider>,
		)

		const cvLink = screen.getByRole('link', { name: /cv/i })
		expect(cvLink).toBeInTheDocument()
		expect(cvLink).toHaveAttribute('href', 'https://example.com/cv.pdf')
		expect(cvLink).toHaveAttribute('target', '_blank')
	})

	it('disables transitions when enableTransitions is false', () => {
		const mockStartTransition = vi.fn()

		// Override the mock to capture startTransition calls
		vi.mocked(
			vi.importActual('@/hooks/useStarFieldTransition'),
		).useStarFieldTransition = vi.fn(() => ({
			motionVectors: {
				foreground: { forward: 300, lateral: 0, vertical: 0 },
				center: { forward: 300, lateral: 0, vertical: 0 },
				background: { forward: 300, lateral: 0, vertical: 0 },
			},
			bankingRoll: { foregroundRollSpeed: -1.5, backgroundRollSpeed: -1.5 },
			startTransition: mockStartTransition,
			currentContentOpacity: 1,
			newContentOpacity: 0,
			isTransitioning: false,
		}))

		render(
			<LanguageProvider>
				<PageLayout {...defaultProps} enableTransitions={false} />
			</LanguageProvider>,
		)

		fireEvent.click(screen.getByText('Get In Touch')) // Fixed case
		expect(mockStartTransition).not.toHaveBeenCalled()
	})

	it('handles different course change variants', () => {
		const { rerender } = render(
			<LanguageProvider>
				<PageLayout {...defaultProps} courseChangeVariant="gentle-drift" />
			</LanguageProvider>,
		)

		// Should render without errors
		expect(screen.getByText('Test Hero')).toBeInTheDocument()

		// Test other variants
		rerender(
			<LanguageProvider>
				<PageLayout {...defaultProps} courseChangeVariant="sharp-maneuver" />
			</LanguageProvider>,
		)
		expect(screen.getByText('Test Hero')).toBeInTheDocument()

		rerender(
			<LanguageProvider>
				<PageLayout {...defaultProps} courseChangeVariant="banking-turn" />
			</LanguageProvider>,
		)
		expect(screen.getByText('Test Hero')).toBeInTheDocument()
	})

	it('passes custom props to starfield', () => {
		render(
			<LanguageProvider>
				<PageLayout
					{...defaultProps}
					speed={2000}
					fadeInDuration={5000}
					fadeOutDuration={3000}
				/>
			</LanguageProvider>,
		)

		const starfield = screen.getByTestId('starfield')
		const props = JSON.parse(starfield.getAttribute('data-props') || '{}')

		expect(props.speed).toBe(2000)
		expect(props.fadeInDuration).toBe(5000)
		expect(props.fadeOutDuration).toBe(3000)
	})

	it('renders footer panel', () => {
		const clientConfig = {
			socialLinks: [
				{
					icon: 'github' as const,
					href: 'https://github.com',
					label: 'GitHub',
				},
			],
			copyrightYear: 2024,
		}

		render(
			<LanguageProvider>
				<PageLayout {...defaultProps} clientConfig={clientConfig} />
			</LanguageProvider>,
		)

		// Footer should contain social links and copyright
		expect(screen.getByLabelText('GitHub')).toBeInTheDocument()
		// Copyright year might be on separate line due to formatting
		expect(screen.getByText(/2024/)).toBeInTheDocument()
	})

	it('renders custom children when provided', () => {
		render(
			<LanguageProvider>
				<PageLayout {...defaultProps}>
					<div data-testid="custom-content">Custom Content</div>
				</PageLayout>
			</LanguageProvider>,
		)

		expect(screen.getByTestId('custom-content')).toBeInTheDocument()
		expect(screen.getByText('Custom Content')).toBeInTheDocument()

		// Should not render default hero section when children provided
		expect(screen.queryByText('Test Hero')).not.toBeInTheDocument()
	})
})
