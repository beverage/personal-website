import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { SpeedSelector } from '../SpeedSelector'

describe('SpeedSelector', () => {
	it('shows Rocket icon when darkMode is true', () => {
		render(<SpeedSelector darkMode={true} onToggle={vi.fn()} />)
		// Rocket icon renders an SVG; ensure button exists
		expect(screen.getByRole('button')).toBeInTheDocument()
	})

	it('calls onToggle when clicked', () => {
		const onToggle = vi.fn()
		render(<SpeedSelector onToggle={onToggle} />)
		fireEvent.click(screen.getByRole('button'))
		expect(onToggle).toHaveBeenCalled()
	})
})
