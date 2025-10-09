import { HeroTextProvider } from '@/contexts/HeroTextContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PageLayout } from '../PageLayout'

// Mock the starfield components to avoid canvas rendering in tests
vi.mock('../../starfield/LayeredStarField', () => ({
	HomepageLayeredStarField: ({
		showCluster,
		speed,
		...props
	}: {
		showCluster: boolean
		speed: number
	}) => (
		<div
			data-testid="starfield"
			data-show-cluster={showCluster}
			data-speed={speed}
			data-props={JSON.stringify(props)}
		/>
	),
}))

// Mock the hooks
vi.mock('@/hooks/useContentState', () => ({
	useContentState: () => ({
		contentState: 'hero',
		navigateToProjects: vi.fn(),
		navigateToContact: vi.fn(),
		navigateToHero: vi.fn(),
		setIsTransitioning: vi.fn(),
		isTransitioning: false,
		setContentState: vi.fn(),
		fromContentState: 'hero',
		toContentState: 'hero',
		setFromContentState: vi.fn(),
		setToContentState: vi.fn(),
	}),
}))

vi.mock('@/hooks/useLanguageTransition', () => ({
	useLanguageTransition: () => false,
}))

vi.mock('@/hooks/useStartupSequence', () => ({
	useStartupSequence: (
		config: { enabled?: boolean } | undefined,
		showStarField: boolean,
	) => ({
		clusterVisible: config?.enabled === false ? showStarField : false,
		setClusterVisible: vi.fn(),
		heroVisible: config?.enabled === false,
		uiControlsVisible: config?.enabled === false,
		heroButtonsVisible: config?.enabled === false,
		startupComplete: config?.enabled === false,
		controlFadeStyle: {},
		heroFadeStyle: {},
	}),
}))

vi.mock('@/hooks/useStarSpeedAnimation', () => ({
	useStarSpeedAnimation: (clusterVisible: boolean) =>
		clusterVisible ? 1200 : 400,
}))

vi.mock('@/hooks/useStarFieldTransition', () => ({
	useStarFieldTransition: () => ({
		motionVectors: {
			foreground: { forward: 300, lateral: 0, vertical: 0 },
			background: { forward: 300, lateral: 0, vertical: 0 },
		},
		bankingRoll: { foregroundRollSpeed: -1.5, backgroundRollSpeed: -1.5 },
		startTransition: vi.fn(),
		currentContentOpacity: 1,
		newContentOpacity: 0,
		isTransitioning: false,
	}),
}))

vi.mock('@/lib/animation/AnimationStateMachine', async importOriginal => {
	const actual =
		await importOriginal<
			typeof import('@/lib/animation/AnimationStateMachine')
		>()
	return {
		...actual,
		useAnimationStateMachine: () => ({
			currentState: 'idle',
			requestTransition: vi.fn(() => true),
			canTransitionTo: vi.fn(() => true),
		}),
	}
})

describe('PageLayout', () => {
	it('renders CV pill when cvUrl is provided', () => {
		render(
			<LanguageProvider>
				<HeroTextProvider>
					<PageLayout
						showStarField={false}
						clientConfig={{
							socialLinks: [],
							copyrightYear: 2025,
							cvUrl: '/cv/test.pdf',
						}}
					/>
				</HeroTextProvider>
			</LanguageProvider>,
		)
		expect(screen.getByLabelText('Download CV (PDF)')).toBeInTheDocument()
	})

	it('hides CV pill when cvUrl is missing', () => {
		render(
			<LanguageProvider>
				<HeroTextProvider>
					<PageLayout
						showStarField={false}
						clientConfig={{ socialLinks: [], copyrightYear: 2025 }}
					/>
				</HeroTextProvider>
			</LanguageProvider>,
		)
		expect(screen.queryByLabelText('Download CV (PDF)')).toBeNull()
	})

	describe('Startup Sequence', () => {
		it('starts in sailboat mode when startup sequence is enabled', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={{ enabled: true }}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			expect(starfield).toHaveAttribute('data-show-cluster', 'false')
		})

		it('starts in rocket mode when startup sequence is disabled', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={{ enabled: false }}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			expect(starfield).toHaveAttribute('data-show-cluster', 'true')
		})

		it('uses default configuration when startupSequence is not provided', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout showStarField={true} />
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			// Should start in sailboat mode with default enabled: true
			expect(starfield).toHaveAttribute('data-show-cluster', 'false')
		})

		it('accepts custom startup sequence configuration', () => {
			const customConfig = {
				enabled: true,
				autoToggleDelay: 1000,
				heroFadeDelay: 2000,
				heroFadeDuration: 3000,
				controlsFadeDelay: 4000,
				controlsFadeDuration: 500,
			}

			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={customConfig}
							heroTitle="Test Hero"
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// Should render without errors and start in sailboat mode
			expect(screen.getByTestId('starfield')).toHaveAttribute(
				'data-show-cluster',
				'false',
			)
			expect(screen.getByText('Test Hero')).toBeInTheDocument()
		})

		it('starts with correct initial speed when startup sequence is enabled', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={{ enabled: true }}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			// Should start with sailboat speed (400)
			expect(starfield).toHaveAttribute('data-speed', '400')
		})

		it('starts with correct initial speed when startup sequence is disabled', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={{ enabled: false }}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			// Should start with rocket speed (1200) when cluster is visible
			expect(starfield).toHaveAttribute('data-speed', '1200')
		})

		it('renders all UI elements when startup sequence is disabled', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={true}
							startupSequence={{ enabled: false }}
							heroTitle="Test Hero"
							brandName="test.brand"
							clientConfig={{
								socialLinks: [],
								copyrightYear: 2025,
								cvUrl: '/cv/test.pdf',
							}}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			// All elements should be visible immediately
			expect(screen.getByText('Test Hero')).toBeInTheDocument()
			expect(screen.getByText('test.brand')).toBeInTheDocument()
			expect(screen.getByLabelText('Download CV (PDF)')).toBeInTheDocument()
		})

		it('respects showStarField prop regardless of startup sequence', () => {
			render(
				<LanguageProvider>
					<HeroTextProvider>
						<PageLayout
							showStarField={false}
							startupSequence={{ enabled: true }}
						/>
					</HeroTextProvider>
				</LanguageProvider>,
			)

			const starfield = screen.getByTestId('starfield')
			// When showStarField is false and startup enabled, should still start with cluster hidden
			expect(starfield).toHaveAttribute('data-show-cluster', 'false')
		})
	})
})
