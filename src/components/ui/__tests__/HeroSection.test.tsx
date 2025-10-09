import { HeroTextProvider } from '@/contexts/HeroTextContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { HeroSection } from '../HeroSection'

describe('HeroSection', () => {
	it('renders title and description', () => {
		render(
			<LanguageProvider>
				<HeroTextProvider>
					<HeroSection title="Title" description="Desc" />
				</HeroTextProvider>
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
				<HeroTextProvider>
					<HeroSection
						onPrimaryClick={onPrimary}
						onSecondaryClick={onSecondary}
						primaryButtonText="Primary"
						secondaryButtonText="Secondary"
					/>
				</HeroTextProvider>
			</LanguageProvider>,
		)
		fireEvent.click(screen.getByText('Secondary'))
		fireEvent.click(screen.getByText('Primary'))
		expect(onSecondary).toHaveBeenCalled()
		expect(onPrimary).toHaveBeenCalled()
	})
})
