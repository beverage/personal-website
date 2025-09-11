import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NavigationArrow } from '../NavigationArrows'

describe('NavigationArrow', () => {
	const mockOnClick = vi.fn()

	beforeEach(() => {
		mockOnClick.mockClear()
	})

	describe('rendering', () => {
		it('should render up arrow with correct icon', () => {
			render(
				<NavigationArrow
					direction="up"
					onClick={mockOnClick}
					aria-label="Test up arrow"
				/>,
			)

			const button = screen.getByLabelText('Test up arrow')
			expect(button).toBeInTheDocument()

			// Check for chevron up icon (Lucide icons render as SVG)
			const svg = button.querySelector('svg')
			expect(svg).toBeInTheDocument()
		})

		it('should render down arrow with correct icon', () => {
			render(
				<NavigationArrow
					direction="down"
					onClick={mockOnClick}
					aria-label="Test down arrow"
				/>,
			)

			const button = screen.getByLabelText('Test down arrow')
			expect(button).toBeInTheDocument()

			const svg = button.querySelector('svg')
			expect(svg).toBeInTheDocument()
		})

		it('should not render when visible is false', () => {
			render(
				<NavigationArrow
					direction="up"
					onClick={mockOnClick}
					visible={false}
					aria-label="Hidden arrow"
				/>,
			)

			expect(screen.queryByLabelText('Hidden arrow')).not.toBeInTheDocument()
		})

		it('should use default aria-label when not provided', () => {
			render(<NavigationArrow direction="up" onClick={mockOnClick} />)

			expect(screen.getByLabelText('Scroll up')).toBeInTheDocument()
		})

		it('should use default aria-label for down direction', () => {
			render(<NavigationArrow direction="down" onClick={mockOnClick} />)

			expect(screen.getByLabelText('Scroll down')).toBeInTheDocument()
		})
	})

	describe('interaction', () => {
		it('should call onClick when clicked', () => {
			render(
				<NavigationArrow
					direction="up"
					onClick={mockOnClick}
					aria-label="Clickable arrow"
				/>,
			)

			const button = screen.getByLabelText('Clickable arrow')
			fireEvent.click(button)

			expect(mockOnClick).toHaveBeenCalledTimes(1)
		})

		it('should apply additional className', () => {
			render(
				<NavigationArrow
					direction="up"
					onClick={mockOnClick}
					className="custom-class"
					aria-label="Custom arrow"
				/>,
			)

			const button = screen.getByLabelText('Custom arrow')
			expect(button).toHaveClass('custom-class')
		})
	})

	describe('styling', () => {
		it('should have consistent button styling', () => {
			render(
				<NavigationArrow
					direction="up"
					onClick={mockOnClick}
					aria-label="Styled arrow"
				/>,
			)

			const button = screen.getByLabelText('Styled arrow')
			expect(button).toHaveClass('rounded-full')
			expect(button).toHaveClass('border-cyan-400/70')
			expect(button).toHaveClass('bg-black/40')
			expect(button).toHaveClass('text-cyan-300')
		})
	})
})
