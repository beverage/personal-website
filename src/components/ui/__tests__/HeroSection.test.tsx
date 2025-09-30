import { LanguageProvider } from '@/contexts/LanguageContext'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
	it('renders title and description', () => {
		render(
			<LanguageProvider>
				<HeroSection title="Title" description="Desc" />
			</LanguageProvider>,
		)
		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Desc')).toBeInTheDocument()
	})

	it('fires button callbacks', () => {
		const onPrimary = vi.fn()
		const onSecondary = vi.fn()
		render(
			<LanguageProvider>
				<HeroSection
					onPrimaryClick={onPrimary}
					onSecondaryClick={onSecondary}
					primaryButtonText="Primary"
					secondaryButtonText="Secondary"
				/>
			</LanguageProvider>,
		)
		fireEvent.click(screen.getByText('Secondary'))
		fireEvent.click(screen.getByText('Primary'))
		expect(onSecondary).toHaveBeenCalled()
		expect(onPrimary).toHaveBeenCalled()
	})
})
