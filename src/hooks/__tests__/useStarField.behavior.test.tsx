import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted mocks for starfield module
const hoisted = vi.hoisted(() => {
	const updates: number[] = []
	const Star3D = vi.fn().mockImplementation(() => ({
		x: 0,
		y: 0,
		z: 1000,
		intensity: 1,
		isLikelyVisible: vi.fn(() => true),
		update: vi.fn((speed: number) => {
			updates.push(speed)
		}),
		updateMinimal: vi.fn(),
		updateCanvasSize: vi.fn(),
		project: vi.fn(() => ({
			x: 10,
			y: 10,
			size: 1,
			opacity: 0.5,
			visible: true,
		})),
	}))
	const renderTwinkleStar = vi.fn()
	return { updates, Star3D, renderTwinkleStar }
})

vi.mock('@/lib/starfield', () => ({
	Star3D: hoisted.Star3D,
	renderTwinkleStar: hoisted.renderTwinkleStar,
}))

import { useStarField } from '../useStarField'

describe('useStarField behavior', () => {
	let canvas: HTMLCanvasElement

	beforeEach(() => {
		hoisted.updates.length = 0
		global.requestAnimationFrame = vi.fn(() => {
			return 1 as unknown as number
		}) as unknown as typeof requestAnimationFrame
		global.cancelAnimationFrame = vi.fn()

		Object.defineProperty(window, 'innerWidth', {
			value: 800,
			writable: true,
		})
		Object.defineProperty(window, 'innerHeight', {
			value: 600,
			writable: true,
		})

		canvas = document.createElement('canvas')
		Object.defineProperty(canvas, 'offsetWidth', { value: 320 })
		Object.defineProperty(canvas, 'offsetHeight', { value: 180 })
		const ctxMock = {
			clearRect: vi.fn(),
			beginPath: vi.fn(),
			arc: vi.fn(),
			fill: vi.fn(),
			set fillStyle(_: unknown) {},
		} as unknown as CanvasRenderingContext2D
		const getContextMock: (
			id: string,
		) => CanvasRenderingContext2D | null = id =>
			id === '2d' ? (ctxMock as CanvasRenderingContext2D) : null
		Object.defineProperty(canvas, 'getContext', {
			value: vi.fn(getContextMock),
		})
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('creates stars once and does not recreate on speed change', () => {
		const initialProps = {
			starCount: 2,
			speed: 1000,
			rollSpeed: 0,
			opacity: 1,
			variant: 'twinkle-compact' as const,
		}
		const { result, rerender } = renderHook(props => useStarField(props), {
			initialProps,
		})

		// Attach canvas to initialize
		result.current.current = canvas

		// Verify stars were created
		expect(hoisted.Star3D).toHaveBeenCalledTimes(2)

		// Update speed prop; stars should not be re-created (still 2 total calls)
		rerender({ ...initialProps, speed: 2000 })
		expect(hoisted.Star3D).toHaveBeenCalledTimes(2)

		// Update other props; stars should not be re-created
		rerender({ ...initialProps, speed: 3000, rollSpeed: 1 })
		expect(hoisted.Star3D).toHaveBeenCalledTimes(2)

		// Only changing starCount should recreate stars
		rerender({ ...initialProps, starCount: 4 })
		expect(hoisted.Star3D).toHaveBeenCalledTimes(6) // 2 original + 4 new
	})

	// Resize behavior is covered indirectly via integration tests; avoid firing window events here
})
