import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
	it('renders title and description', () => {
		render(<HeroSection title="Title" description="Desc" />)
		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Desc')).toBeInTheDocument()
	})

	it('fires button callbacks', () => {
		const onPrimary = vi.fn()
		const onSecondary = vi.fn()
		render(
			<HeroSection
				onPrimaryClick={onPrimary}
				onSecondaryClick={onSecondary}
				primaryButtonText="Primary"
				secondaryButtonText="Secondary"
			/>,
		)
		fireEvent.click(screen.getByText('Secondary'))
		fireEvent.click(screen.getByText('Primary'))
		expect(onSecondary).toHaveBeenCalled()
		expect(onPrimary).toHaveBeenCalled()
	})
})
