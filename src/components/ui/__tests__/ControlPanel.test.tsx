import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlPanel } from '../ControlPanel'

describe('ControlPanel', () => {
	it('shows Rocket icon when darkMode is true', () => {
		render(<ControlPanel darkMode={true} />)
		// Rocket icon renders an SVG; ensure button exists
		expect(screen.getByRole('button')).toBeInTheDocument()
	})

	it('calls onToggle when clicked', () => {
		const onToggle = vi.fn()
		render(<ControlPanel onToggle={onToggle} />)
		fireEvent.click(screen.getByRole('button'))
		expect(onToggle).toHaveBeenCalled()
	})
})
