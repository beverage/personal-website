import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PageLayout } from '../PageLayout'

describe('PageLayout', () => {
	it('renders CV pill when cvUrl is provided', () => {
		render(
			<PageLayout
				showStarField={false}
				clientConfig={{
					socialLinks: [],
					copyrightYear: 2025,
					cvUrl: '/cv/test.pdf',
				}}
			/>,
		)
		expect(screen.getByLabelText('Download CV (PDF)')).toBeInTheDocument()
	})

	it('hides CV pill when cvUrl is missing', () => {
		render(
			<PageLayout
				showStarField={false}
				clientConfig={{ socialLinks: [], copyrightYear: 2025 }}
			/>,
		)
		expect(screen.queryByLabelText('Download CV (PDF)')).toBeNull()
	})
})
