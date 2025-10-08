import { render, screen } from '@testing-library/react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock hooks used by StarField
const mockUseStarField = vi.fn(() => ({ current: null }))
const mockUseOptimalStarCount = vi.fn(() => 1337)
const mockUseWebGLSupport = vi.fn(() => false) // Default to Canvas2D for testing

vi.mock('@/hooks', () => ({
	useStarField: (...args: unknown[]) => mockUseStarField(...args),
	useWebGLSupport: () => mockUseWebGLSupport(),
}))

vi.mock('@/hooks/useMobileDetection', () => ({
	useOptimalStarCount: (...args: unknown[]) => mockUseOptimalStarCount(...args),
}))

// Mock ClusterStarField to a simple placeholder to assert rendering/props
const mockCluster = vi.fn((props: Record<string, unknown>) => (
	<div
		data-testid="cluster-field"
		data-variant={props.variant}
		data-opacity={props.opacity}
		className={props.className}
		style={props.style}
	/>
))

vi.mock('../ClusterStarField', () => ({
	ClusterStarField: (props: Record<string, unknown>) => mockCluster(props),
}))

import { ForegroundToggleProvider } from '@/contexts/ForegroundToggleContext'
import { RenderModeProvider } from '@/contexts/RenderModeContext'
import { BackgroundStarField, HomepageStarField, StarField } from '../StarField'

// Test helper to wrap components with required providers
const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<RenderModeProvider>
			<ForegroundToggleProvider>{ui}</ForegroundToggleProvider>
		</RenderModeProvider>,
	)
}

describe('StarField', () => {
	beforeEach(() => {
		mockUseStarField.mockClear()
		mockUseOptimalStarCount.mockClear()
		mockCluster.mockClear()
	})

	it('renders a canvas for twinkle variants and calls useStarField with defaults', () => {
		renderWithProviders(<StarField />)

		const canvasEl = document.querySelector('canvas')
		expect(canvasEl).toBeInTheDocument()

		expect(mockUseStarField).toHaveBeenCalledTimes(1)
		const args = mockUseStarField.mock.calls[0][0]
		expect(args).toMatchObject({
			starCount: 1337,
			speed: 1000,
			rollSpeed: -1.5,
			opacity: 1.0,
			variant: 'twinkle-compact',
		})
	})

	it('renders ClusterStarField for cluster variants and forwards props', () => {
		renderWithProviders(
			<StarField
				variant="cluster-ellipse-4x"
				opacity={0.5}
				className="custom-class"
				style={{ zIndex: 5 }}
			/>,
		)

		// Cluster placeholder should render instead of a canvas element from StarField
		const cluster = screen.getByTestId('cluster-field')
		expect(cluster).toBeInTheDocument()
		expect(cluster).toHaveAttribute('data-variant', 'cluster-ellipse-4x')
		expect(cluster).toHaveAttribute('data-opacity', '0.5')
		expect(cluster).toHaveClass('custom-class')

		// StarField doesn't call useStarField for cluster variants (cluster only)
		expect(mockUseStarField).not.toHaveBeenCalled()
	})

	it('HomepageStarField and BackgroundStarField render canvases', () => {
		renderWithProviders(
			<>
				<HomepageStarField />
				<BackgroundStarField />
			</>,
		)
		const canvases = document.querySelectorAll('canvas')
		expect(canvases.length).toBeGreaterThanOrEqual(2)
	})
})
