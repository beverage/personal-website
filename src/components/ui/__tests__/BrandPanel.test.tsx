import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BrandPanel } from '../BrandPanel'

describe('BrandPanel', () => {
	it('renders with default brand name', () => {
		render(<BrandPanel />)
		expect(screen.getByText('beverage.me')).toBeInTheDocument()
	})

	it('renders with custom brand name', () => {
		render(<BrandPanel brandName="custom-brand.io" />)
		expect(screen.getByText('custom-brand.io')).toBeInTheDocument()
	})

	it('applies custom className', () => {
		render(<BrandPanel className="custom-class" />)
		const panel = screen.getByText('beverage.me').parentElement
		expect(panel).toHaveClass('custom-class')
	})

	it('has glassmorphism styling', () => {
		render(<BrandPanel />)
		const panel = screen.getByText('beverage.me').parentElement
		expect(panel).toHaveClass('backdrop-blur-sm')
		expect(panel).toHaveClass('rounded-full')
	})
})
