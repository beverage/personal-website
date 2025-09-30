import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BackButton } from '../BackButton'

describe('BackButton', () => {
	it('renders with correct direction icon', () => {
		const onClick = vi.fn()

		const { rerender } = render(
			<BackButton direction="left" onClick={onClick} aria-label="Back" />,
		)

		// Should render button with left icon (ChevronLeft)
		expect(screen.getByLabelText('Back')).toBeInTheDocument()
		const leftButton = screen.getByRole('button')
		expect(leftButton).toBeInTheDocument()

		// Test right icon (ChevronRight)
		rerender(
			<BackButton direction="right" onClick={onClick} aria-label="Back" />,
		)
		const rightButton = screen.getByRole('button')
		expect(rightButton).toBeInTheDocument()
	})

	it('calls onClick when clicked', () => {
		const onClick = vi.fn()
		render(<BackButton direction="left" onClick={onClick} aria-label="Back" />)

		fireEvent.click(screen.getByRole('button'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('applies consistent styling with CV button', () => {
		const onClick = vi.fn()
		render(<BackButton direction="left" onClick={onClick} aria-label="Back" />)

		const button = screen.getByRole('button')

		// Should have consistent blue styling
		expect(button).toHaveClass('border-cyan-400/70')
		expect(button).toHaveClass('bg-black/40')
		expect(button).toHaveClass('text-cyan-300')
	})

	it('has proper accessibility attributes', () => {
		const onClick = vi.fn()
		render(
			<BackButton
				direction="left"
				onClick={onClick}
				aria-label="Navigate back"
			/>,
		)

		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('aria-label', 'Navigate back')
		// Button elements have default type="button", no need to explicitly set it
		expect(button).toBeInTheDocument()
	})

	it('applies additional className props', () => {
		const onClick = vi.fn()
		render(
			<BackButton
				direction="left"
				onClick={onClick}
				aria-label="Back"
				className="extra-class"
			/>,
		)

		const button = screen.getByRole('button')
		expect(button).toHaveClass('extra-class')
	})
})
