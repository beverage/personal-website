import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Hoisted mocks for vitest
const hoisted = vi.hoisted(() => {
	const useIsMobile = vi.fn(() => false)
	const useIsSafari = vi.fn(() => false)
	const FG = vi.fn().mockImplementation(() => ({
		update: vi.fn(),
		project: vi.fn(() => ({
			x: 5,
			y: 5,
			size: 1,
			opacity: 0.5,
			visible: true,
		})),
		updateCanvasSize: vi.fn(),
	}))
	const Cluster = vi.fn().mockImplementation(() => ({
		update: vi.fn(),
		project: vi.fn(() => ({
			x: 10,
			y: 10,
			size: 2,
			opacity: 0.3,
			visible: true,
		})),
		updateCanvasSize: vi.fn(),
	}))
	const Center = vi.fn().mockImplementation(() => ({
		update: vi.fn(),
		project: vi.fn(() => ({
			x: 8,
			y: 8,
			size: 1.5,
			opacity: 0.6,
			visible: true,
		})),
		updateCanvasSize: vi.fn(),
	}))
	return { useIsMobile, useIsSafari, FG, Cluster, Center }
})

vi.mock('../useMobileDetection', () => ({
	useIsMobile: hoisted.useIsMobile,
	useIsSafari: hoisted.useIsSafari,
}))

vi.mock('@/lib/starfield/ClusterStar3D', () => ({
	Star3D: hoisted.FG,
	ClusterStar3D: hoisted.Cluster,
	CenterClusterStar3D: hoisted.Center,
}))

import { useClusterStarField } from '../useClusterStarField'

describe('useClusterStarField behavior', () => {
	let frameCb: FrameRequestCallback | null = null
	let canvas: HTMLCanvasElement

	beforeEach(() => {
		global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
			frameCb = cb
			return 1 as unknown as number
		}) as unknown as typeof requestAnimationFrame
		global.cancelAnimationFrame = vi.fn()

		Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
		Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })

		canvas = document.createElement('canvas')
		Object.defineProperty(canvas, 'offsetWidth', { value: 400 })
		Object.defineProperty(canvas, 'offsetHeight', { value: 300 })
		;(canvas as unknown as HTMLCanvasElement).getContext = vi.fn(() => ({
			fillStyle: 'transparent',
			clearRect: vi.fn(),
			beginPath: vi.fn(),
			arc: vi.fn(),
			fill: vi.fn(),
			createPattern: vi.fn(() => ({})),
			createRadialGradient: vi.fn(() => ({
				addColorStop: vi.fn(),
			})),
			save: vi.fn(),
			restore: vi.fn(),
			fillRect: vi.fn(),
			set filter(_: string) {},
			set globalCompositeOperation(_: string) {},
			set globalAlpha(_: number) {},
		}))
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('initializes layers and schedules animation', () => {
		const { result } = renderHook(() =>
			useClusterStarField({ variant: 'cluster-ellipse-4x', opacity: 1 }),
		)
		result.current.current = canvas
		window.dispatchEvent(new Event('resize'))
		if (frameCb) frameCb(16)
		// Ensure animation callback invoked
		expect(
			(
				global.requestAnimationFrame as unknown as {
					mock: { calls: unknown[] }
				}
			).mock.calls.length,
		).toBeGreaterThan(0)
	})

	it('skips rendering entirely on mobile', async () => {
		const mod = await import('../useMobileDetection')
		;(
			mod.useIsMobile as unknown as { mockReturnValue: (v: boolean) => void }
		).mockReturnValue(true)
		const { result, unmount } = renderHook(() =>
			useClusterStarField({ variant: 'cluster-ellipse-4x', opacity: 1 }),
		)
		result.current.current = canvas
		// No resize/RAF should be scheduled when mobile (effect returns early)
		expect(
			(
				global.requestAnimationFrame as unknown as {
					mock: { calls: unknown[] }
				}
			).mock.calls.length,
		).toBe(0)
		unmount()
		// Since RAF never scheduled, cancelAnimationFrame should not be called
		expect(
			(global.cancelAnimationFrame as unknown as { mock: { calls: unknown[] } })
				.mock.calls.length,
		).toBe(0)
	})

	// Test removed: Safari detection was intentionally removed to enable WebGL on Safari
	// The cluster now renders on Safari desktop using WebGL for improved performance
})
