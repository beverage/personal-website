# WebGL Migration Architecture

## Overview

This document outlines the migration plan from Canvas 2D to WebGL rendering for the starfield animation. The goal is to achieve consistent 60fps performance across all modern browsers (especially Safari) while maintaining Canvas 2D as a reliable fallback.

## Problem Statement

Canvas 2D has inconsistent performance characteristics across browsers:

- **Chrome/Firefox Desktop**: Excellent Canvas 2D performance, handles 4000+ stars at 60fps
- **Safari Desktop**: Poor Canvas 2D performance (CPU-bound), struggles with 4000 stars
- **Mobile Devices**: Canvas 2D works but battery-constrained

**Current Solution**: Safari desktop and mobile devices use 50% fewer stars (2000 vs 4000)

**Target Solution**: Migrate to WebGL for GPU-accelerated rendering on all capable browsers, with Canvas 2D as a fallback for older/buggy environments.

---

## Current State (Already Implemented)

### Canvas 2D Renderer with Safari Fix

**Implementation**: `src/hooks/useMobileDetection.ts` includes Safari desktop detection

```typescript
export const useOptimalStarCount = (baseStarCount: number = 4000): number => {
	const isMobile = useIsMobile()
	const isSafari = useIsSafari()

	// Reduce by 50% on mobile OR Safari desktop
	return isMobile || isSafari ? Math.floor(baseStarCount * 0.5) : baseStarCount
}
```

**Current Performance**:

- Safari desktop: 2000 stars (reduced for performance)
- Chrome/Firefox desktop: 4000 stars (full complexity)
- Mobile: 2000 stars (reduced for battery)

**Status**: ✅ Working, but Canvas 2D limits performance potential

---

## Implementation Phases

### Phase 1: WebGL Renderer Implementation

**Goal**: Create WebGL renderer with all features (cluster, full star count, effects)

#### 1. Create WebGL Renderer Class

```typescript
// src/lib/starfield/WebGLStarfieldRenderer.ts

export class WebGLStarfieldRenderer {
	private gl: WebGLRenderingContext | WebGL2RenderingContext
	private program: WebGLProgram
	private buffers: {
		position: WebGLBuffer
		size: WebGLBuffer
		color: WebGLBuffer
	}

	constructor(canvas: HTMLCanvasElement) {
		const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
		if (!gl) {
			throw new Error('WebGL not supported')
		}
		this.gl = gl

		// Setup context loss handlers
		canvas.addEventListener('webglcontextlost', this.handleContextLost)
		canvas.addEventListener('webglcontextrestored', this.handleContextRestored)

		// Initialize shaders and buffers
		this.program = this.initShaders()
		this.buffers = this.initBuffers()
	}

	private initShaders(): WebGLProgram {
		// Vertex shader: transforms star positions
		const vertexShader = `
			attribute vec3 position;
			attribute float size;
			attribute vec3 color;
			
			varying vec3 vColor;
			
			uniform mat4 projection;
			uniform mat4 view;
			
			void main() {
				vColor = color;
				gl_Position = projection * view * vec4(position, 1.0);
				gl_PointSize = size;
			}
		`

		// Fragment shader: renders star pixels
		const fragmentShader = `
			precision mediump float;
			varying vec3 vColor;
			
			void main() {
				// Circular star with alpha falloff
				vec2 coord = gl_PointCoord - vec2(0.5);
				float dist = length(coord);
				if (dist > 0.5) discard;
				
				float alpha = 1.0 - (dist * 2.0);
				gl_FragColor = vec4(vColor, alpha);
			}
		`

		// Compile and link shaders
		return this.compileProgram(vertexShader, fragmentShader)
	}

	render(stars: Star3D[], viewMatrix: Float32Array): void {
		const { gl, program, buffers } = this

		// Update star data in GPU buffers
		this.updateBuffers(stars)

		// Set uniforms
		gl.useProgram(program)
		gl.uniformMatrix4fv(
			gl.getUniformLocation(program, 'view'),
			false,
			viewMatrix,
		)

		// Draw all stars in one call (GPU-accelerated)
		gl.drawArrays(gl.POINTS, 0, stars.length)
	}

	private handleContextLost = (event: Event) => {
		event.preventDefault()
		console.warn('WebGL context lost')
		// Stop render loop (handled by parent component)
	}

	private handleContextRestored = () => {
		console.log('WebGL context restored')
		// Reinitialize shaders and buffers
		this.program = this.initShaders()
		this.buffers = this.initBuffers()
	}

	dispose(): void {
		// Clean up GPU resources
		this.gl.deleteProgram(this.program)
		Object.values(this.buffers).forEach(buffer => {
			this.gl.deleteBuffer(buffer)
		})
	}
}
```

**Effort**: 2-3 days  
**Benefits**:

- 60fps on Safari desktop
- Can increase star count to 6000-10000
- Consistent performance across all browsers
- Room for advanced effects

---

### Phase 2: Capability Detection & Fallback

**Goal**: Detect WebGL capability and fall back to Canvas 2D when needed.

#### 1. WebGL Detection Hook

```typescript
// src/hooks/useWebGLSupport.ts

export function useWebGLSupport(): boolean {
	const [supportsWebGL, setSupportsWebGL] = useState(false)

	useEffect(() => {
		if (typeof window === 'undefined') return

		const canUseWebGL = detectWebGLSupport()
		setSupportsWebGL(canUseWebGL)
	}, [])

	return supportsWebGL
}

function detectWebGLSupport(): boolean {
	// Check for reduced motion preference (accessibility)
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		return false
	}

	try {
		const canvas = document.createElement('canvas')
		const gl =
			canvas.getContext('webgl2') ||
			canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl')

		if (!gl) return false

		// Check for known buggy implementations
		if (hasBuggyWebGL(gl)) return false

		return true
	} catch {
		return false
	}
}

function hasBuggyWebGL(gl: WebGLRenderingContext): boolean {
	const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
	if (!debugInfo) return false

	const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)

	// Blacklist known problematic GPUs (5+ years old)
	const buggyPatterns = [
		/Mali-[4][0-5]0/, // Mali 400-450 series
		/Intel.*HD Graphics [34]000/, // Intel HD 3000/4000
		/PowerVR SGX/, // Old iOS devices
	]

	return buggyPatterns.some(pattern => pattern.test(renderer))
}
```

#### 2. Unified Starfield Component

```typescript
// src/components/starfield/StarField.tsx

export const StarField: React.FC<StarFieldProps> = (props) => {
	const supportsWebGL = useWebGLSupport()
	const isMobile = useIsMobile()

	// Use WebGL if supported, otherwise fall back to Canvas2D
	if (supportsWebGL) {
		return <WebGLStarField {...props} />
	}

	// Existing Canvas2D implementation with mobile/Safari optimizations
	return <Canvas2DStarField {...props} isMobile={isMobile} />
}
```

**Effort**: 1 day  
**Benefits**:

- Simple boolean decision: WebGL or Canvas2D
- Existing Canvas2D code remains unchanged (proven fallback)
- Easy to test (can mock `useWebGLSupport`)
- No complex tier system to maintain

---

## Architecture Benefits

### 1. Progressive Enhancement

- **Baseline**: Canvas 2D works everywhere (already implemented)
- **Enhanced**: WebGL for GPU acceleration on capable devices
- No tiers to maintain, just a simple capability check

### 2. Separation of Concerns

- **Detection logic** isolated in `useWebGLSupport` hook
- **Canvas 2D renderer** remains unchanged (proven, reliable)
- **WebGL renderer** is additive (new code, no risk to existing)

### 3. Testability

```typescript
// Mock WebGL support in tests
jest.mock('hooks/useWebGLSupport', () => ({
	useWebGLSupport: () => false, // Test Canvas2D fallback
}))

jest.mock('hooks/useWebGLSupport', () => ({
	useWebGLSupport: () => true, // Test WebGL renderer
}))
```

### 4. Maintainability

- Browser-specific checks centralized in detection function
- Easy to update GPU blacklist as needed
- Configuration is self-documenting
- No complex tier logic to debug

### 5. Future-Proof

- Can add advanced features to WebGL renderer without touching Canvas 2D
- Room for effects: nebulae, shooting stars, parallax
- Can increase star count significantly (6000-10000+)

---

## Migration Path

### Phase 1: WebGL Renderer (2-3 days)

1. Create `WebGLStarfieldRenderer.ts` class
2. Implement vertex/fragment shaders for star rendering
3. Add GPU buffer management for star data
4. Handle WebGL context loss/restore events
5. Create `WebGLStarField.tsx` component wrapper

### Phase 2: Detection & Integration (1 day)

1. Create `useWebGLSupport.ts` hook with GPU blacklist
2. Update `StarField.tsx` to conditionally render WebGL or Canvas2D
3. Keep existing Canvas2D implementation unchanged (fallback)
4. Test on multiple browsers and devices

### Total Effort: 3-4 days

---

## Testing Strategy

### Manual Testing

1. **Desktop Chrome**: Should use WebGL (check console logs)
2. **Desktop Safari**: Should use WebGL (finally smooth!)
3. **Desktop Firefox**: Should use WebGL
4. **Mobile Safari**: Should use WebGL (or Canvas2D on older devices)
5. **Old/buggy GPU**: Should fall back to Canvas2D gracefully

### Browser DevTools Checks

```javascript
// In browser console, check which renderer is active
// WebGL: Should see WebGL context and program
canvas.getContext('webgl') // Should return context if WebGL

// Canvas2D: Should see 2D context
canvas.getContext('2d') // Should return context if Canvas2D
```

### Automated Testing

```typescript
describe('useWebGLSupport', () => {
	it('returns true when WebGL is supported', () => {
		mockWebGLContext(true)
		const { result } = renderHook(() => useWebGLSupport())
		expect(result.current).toBe(true)
	})

	it('returns false when WebGL is not supported', () => {
		mockWebGLContext(false)
		const { result } = renderHook(() => useWebGLSupport())
		expect(result.current).toBe(false)
	})

	it('returns false for buggy GPU implementations', () => {
		mockWebGLContext(true, 'Mali-450')
		const { result } = renderHook(() => useWebGLSupport())
		expect(result.current).toBe(false)
	})

	it('respects prefers-reduced-motion', () => {
		mockMediaQuery('(prefers-reduced-motion: reduce)', true)
		const { result } = renderHook(() => useWebGLSupport())
		expect(result.current).toBe(false)
	})
})
```

---

## Performance Targets

| Renderer  | Target FPS | Star Count | Device Examples                |
| --------- | ---------- | ---------- | ------------------------------ |
| WebGL     | 60fps      | 6000-10000 | All modern desktop/mobile      |
| Canvas 2D | 60fps      | 2000-4000  | Fallback for old/buggy devices |

---

## Known Issues & Workarounds

### WebGL Context Loss on Mobile

**Issue**: Mobile browsers may reclaim WebGL context when app is backgrounded.

**Solution**: Event handlers already implemented in renderer:

```typescript
canvas.addEventListener('webglcontextlost', handleContextLost)
canvas.addEventListener('webglcontextrestored', handleContextRestored)
```

### Buggy GPU Implementations

**Issue**: Some old GPUs have buggy WebGL drivers.

**Solution**: GPU blacklist in detection function:

- Mali 400-450 series → Canvas2D fallback
- Intel HD 3000/4000 → Canvas2D fallback
- PowerVR SGX series → Canvas2D fallback

### Accessibility: Reduced Motion

**Issue**: Users with motion sensitivity may experience discomfort.

**Solution**: Respect `prefers-reduced-motion` media query → use Canvas2D fallback (or disable animation entirely)

---

## Related Documentation

- [Animation Integration Plan](./animation_integration_plan.md)
- [Starfield Parameters](./starfield-parameters.md)
- [Course Change Transitions Spec](./course_change_transitions_spec.md)

---

## Summary

This architecture takes a **progressive enhancement** approach:

1. ✅ **Canvas 2D renderer is complete** - works everywhere with Safari/mobile optimizations
2. 📋 **WebGL renderer to be added** - GPU-accelerated for 60fps on all modern browsers
3. 🎯 **Simple fallback logic** - no complex tier system, just "WebGL or Canvas2D"
4. 🔒 **Zero risk to existing code** - Canvas2D stays as-is, WebGL is additive

**Key Decision**: Binary choice (WebGL vs Canvas2D) instead of multi-tier system.

**Primary Goal**: Fix Safari desktop performance with WebGL while keeping reliable Canvas2D fallback.

---

## Status

- ✅ **Canvas 2D Baseline**: Implemented and working
- 📋 **Phase 1**: WebGL renderer implementation (2-3 days)
- 📋 **Phase 2**: Detection & integration (1 day)
- 🎯 **Total Effort**: 3-4 days for complete migration
