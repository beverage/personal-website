import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

// Mock children components used within LayeredStarField
const mockCluster = vi.fn((props: Record<string, unknown>) => {
	void props
	return <div data-testid="cluster" />
})
const mockStar = vi.fn((props: Record<string, unknown>) => {
	void props
	return <div data-testid="twinkle" />
})

vi.mock('../ClusterStarField', () => ({
	ClusterStarField: (props: Record<string, unknown>) => mockCluster(props),
}))

vi.mock('../StarField', () => ({
	StarField: (props: Record<string, unknown>) => mockStar(props),
}))

import { HomepageLayeredStarField, LayeredStarField } from '../LayeredStarField'

describe('LayeredStarField', () => {
	it('renders cluster and twinkle layers with expected props', () => {
		render(
			<LayeredStarField
				clusterVariant="cluster-ellipse-4x"
				stardustVariant="bloom"
				opacity={0.7}
				showCluster={true}
				speed={800}
				fadeInDuration={100}
				fadeOutDuration={200}
				className="container"
				style={{ position: 'absolute' }}
			/>,
		)

		expect(mockCluster).toHaveBeenCalled()
		expect(mockStar).toHaveBeenCalled()

		const clusterProps = mockCluster.mock.calls[0][0] as {
			variant: string
			stardustVariant?: string
			opacity: number
			style: { opacity: number; transition: string }
		}
		expect(clusterProps.variant).toBe('cluster-ellipse-4x')
		expect(clusterProps.stardustVariant).toBe('bloom')
		expect(clusterProps.opacity).toBe(0.7)
		expect(clusterProps.style.opacity).toBe(1.0)
		expect(clusterProps.style.transition).toContain('opacity 100ms')

		const starProps = mockStar.mock.calls[0][0] as {
			variant: string
			opacity: number
			speed: number
		}
		expect(starProps.variant).toBe('twinkle-compact')
		expect(starProps.opacity).toBe(0.7)
		expect(starProps.speed).toBe(800)
	})

	it('HomepageLayeredStarField wires default cluster variant', () => {
		render(<HomepageLayeredStarField />)
		expect(mockCluster).toHaveBeenCalled()
		const clusterProps = mockCluster.mock.calls[0][0]
		expect(clusterProps.variant).toBe('cluster-ellipse-4x')
	})
})
