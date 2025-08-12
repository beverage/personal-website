import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FooterPanel } from '../FooterPanel'

describe('FooterPanel', () => {
	it('renders the year', () => {
		render(<FooterPanel year={2025} socialLinks={[]} />)
		expect(screen.getByText('© 2025')).toBeInTheDocument()
	})

	it('renders provided social links', () => {
		render(
			<FooterPanel
				year={2025}
				socialLinks={[
					{ icon: 'github', href: 'https://github.com/test', label: 'GitHub' },
					{ icon: 'mail', href: 'mailto:test@example.com', label: 'Email' },
				]}
			/>,
		)

		const links = screen.getAllByRole('link')
		expect(links.length).toBe(2)
		expect(links[0]).toHaveAttribute('href', 'https://github.com/test')
		expect(links[1]).toHaveAttribute('href', 'mailto:test@example.com')
	})
})
