import { render } from '@testing-library/react'
import React from 'react'
import { vi } from 'vitest'

// Mock the hook to avoid RAF/canvas logic
const mockUseCluster = vi.fn(() => ({ current: null }))
vi.mock('@/hooks/useClusterStarField', () => ({
	useClusterStarField: (...args: unknown[]) => mockUseCluster(...args),
}))

// Mock WebGL support detection
const mockUseWebGLSupport = vi.fn(() => false) // Default to Canvas2D for simpler testing
vi.mock('@/hooks/useWebGLSupport', () => ({
	useWebGLSupport: () => mockUseWebGLSupport(),
}))

import { ForegroundToggleProvider } from '@/contexts/ForegroundToggleContext'
import { RenderModeProvider } from '@/contexts/RenderModeContext'
import { ClusterStarField, StarTrekClusterField } from '../ClusterStarField'

// Test helper to wrap components with required providers
const renderWithProviders = (ui: React.ReactElement) => {
	return render(
		<RenderModeProvider>
			<ForegroundToggleProvider>{ui}</ForegroundToggleProvider>
		</RenderModeProvider>,
	)
}

describe('ClusterStarField', () => {
	beforeEach(() => {
		mockUseCluster.mockClear()
	})

	it('renders a canvas and calls useClusterStarField with defaults', () => {
		renderWithProviders(<ClusterStarField />)
		const canvas = document.querySelector('canvas')
		expect(canvas).toBeInTheDocument()

		expect(mockUseCluster).toHaveBeenCalledTimes(1)
		expect(mockUseCluster.mock.calls[0][0]).toMatchObject({
			variant: 'cluster-ellipse-4x',
			opacity: 1.0,
			stardustVariant: 'halo',
		})
	})

	it('forwards props correctly', () => {
		renderWithProviders(
			<ClusterStarField
				variant="cluster-ellipse-4x-center-close-1"
				opacity={0.42}
				stardustVariant="sparkle"
				className="custom"
				style={{ zIndex: 7 }}
			/>,
		)
		const canvas = document.querySelector('canvas')
		expect(canvas).toBeInTheDocument()
		expect(canvas).toHaveClass('custom')
	})

	it('StarTrekClusterField convenience component renders', () => {
		renderWithProviders(<StarTrekClusterField opacity={0.8} className="x" />)
		const canvas = document.querySelector('canvas')
		expect(canvas).toBeInTheDocument()
		expect(mockUseCluster).toHaveBeenCalled()
	})
})
