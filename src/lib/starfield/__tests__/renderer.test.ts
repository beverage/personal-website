import { CLUSTER_CONFIGS, TWINKLE_CONFIGS } from '@/types/starfield'
import { describe, expect, it, vi } from 'vitest'
import {
	getClusterConfig,
	getTwinkleConfig,
	getVariantInfo,
	renderTwinkleStar,
} from '../renderer'

// Minimal canvas context mock for gradient + drawing used by renderer
function createMockCtx(): CanvasRenderingContext2D {
	const addColorStop = vi.fn()
	const gradient = { addColorStop } as unknown as CanvasGradient
	const ctx = {
		createRadialGradient: vi.fn(() => gradient),
		beginPath: vi.fn(),
		arc: vi.fn(),
		fill: vi.fn(),
	} as unknown as CanvasRenderingContext2D
	Object.defineProperty(ctx, 'fillStyle', {
		set: (value: unknown) => {
			void value
		},
	})
	return ctx
}

describe('renderer utilities', () => {
	it('getTwinkleConfig returns exact config', () => {
		const v = 'twinkle-compact' as const
		expect(getTwinkleConfig(v)).toBe(TWINKLE_CONFIGS[v])
	})

	it('getClusterConfig returns exact config', () => {
		const v = 'cluster-ellipse-4x' as const
		expect(getClusterConfig(v)).toBe(CLUSTER_CONFIGS[v])
	})

	it('getVariantInfo dispatches to correct helper', () => {
		const t = getVariantInfo('twinkle-compact')
		expect(t.config).toBe(TWINKLE_CONFIGS['twinkle-compact'])
		const c = getVariantInfo('cluster-ellipse-4x')
		expect(c.config).toBe(CLUSTER_CONFIGS['cluster-ellipse-4x'])
	})

	it('renderTwinkleStar draws gradient-based star with expected calls', () => {
		const ctx = createMockCtx()
		renderTwinkleStar(ctx, 100, 100, 1.2, 0.7, 12345, 'twinkle-compact')

		// Should create a gradient and draw
		const c1 = (
			ctx.createRadialGradient as unknown as { mock: { calls: unknown[] } }
		).mock.calls.length
		const c2 = (ctx.beginPath as unknown as { mock: { calls: unknown[] } }).mock
			.calls.length
		const c3 = (ctx.arc as unknown as { mock: { calls: unknown[] } }).mock.calls
			.length
		const c4 = (ctx.fill as unknown as { mock: { calls: unknown[] } }).mock
			.calls.length
		expect(c1).toBe(1)
		expect(c2).toBe(1)
		expect(c3).toBe(1)
		expect(c4).toBe(1)
	})
})
