import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock hooks used by StarField
const mockUseStarField = vi.fn(() => ({ current: null }))
const mockUseOptimalStarCount = vi.fn(() => 1337)

vi.mock('@/hooks', () => ({
	useStarField: (...args: unknown[]) => mockUseStarField(...args),
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

import { BackgroundStarField, HomepageStarField, StarField } from '../StarField'

describe('StarField', () => {
	beforeEach(() => {
		mockUseStarField.mockClear()
		mockUseOptimalStarCount.mockClear()
		mockCluster.mockClear()
	})

	it('renders a canvas for twinkle variants and calls useStarField with defaults', () => {
		render(<StarField />)

		const canvasEl = document.querySelector('canvas')
		expect(canvasEl).toBeInTheDocument()

		expect(mockUseOptimalStarCount).toHaveBeenCalledWith(4000)
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
		render(
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

		// useStarField is still invoked with a twinkle variant internally
		expect(mockUseStarField).toHaveBeenCalledTimes(1)
		expect(mockUseStarField.mock.calls[0][0]).toMatchObject({
			variant: 'twinkle-compact',
		})
	})

	it('HomepageStarField and BackgroundStarField render canvases', () => {
		render(
			<>
				<HomepageStarField />
				<BackgroundStarField />
			</>,
		)
		const canvases = document.querySelectorAll('canvas')
		expect(canvases.length).toBeGreaterThanOrEqual(2)
	})
})
