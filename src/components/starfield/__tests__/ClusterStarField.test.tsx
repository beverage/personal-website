import { render } from '@testing-library/react'
import { vi } from 'vitest'

// Mock the hook to avoid RAF/canvas logic
const mockUseCluster = vi.fn(() => ({ current: null }))
vi.mock('@/hooks/useClusterStarField', () => ({
	useClusterStarField: (...args: unknown[]) => mockUseCluster(...args),
}))

import { ClusterStarField, StarTrekClusterField } from '../ClusterStarField'

describe('ClusterStarField', () => {
	beforeEach(() => {
		mockUseCluster.mockClear()
	})

	it('renders a canvas and calls useClusterStarField with defaults', () => {
		render(<ClusterStarField />)
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
		render(
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
		render(<StarTrekClusterField opacity={0.8} className="x" />)
		const canvas = document.querySelector('canvas')
		expect(canvas).toBeInTheDocument()
		expect(mockUseCluster).toHaveBeenCalled()
	})
})
