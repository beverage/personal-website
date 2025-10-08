# Retina Display Canvas Rendering Fix

## Problem

The starfield canvas elements were rendering at the same internal resolution on both retina and non-retina displays, causing a significant quality difference:

### Before Fix

**Retina Display (2x DPR):**

- CSS size: 1000px × 1000px
- Canvas internal resolution: 1000 × 1000 pixels
- Physical screen pixels: 2000 × 2000
- Result: Browser upscales 1000px canvas → smoother appearance due to anti-aliasing

**Non-Retina Display (1x DPR):**

- CSS size: 1000px × 1000px
- Canvas internal resolution: 1000 × 1000 pixels
- Physical screen pixels: 1000 × 1000
- Result: 1:1 pixel mapping → aliasing and pixelation more visible

The site looked "an order of magnitude better" on retina displays because the browser's upscaling algorithm smoothed out the lower-resolution canvas content.

## Solution

The fix has two parts:

### Part 1: Scale Canvas Resolution

Multiply canvas resolution by `window.devicePixelRatio` to match physical pixel density:

```typescript
const dpr = window.devicePixelRatio || 1
const displayWidth = canvasRef.current.offsetWidth
const displayHeight = canvasRef.current.offsetHeight

// Set canvas resolution to match physical pixels
canvasRef.current.width = displayWidth * dpr
canvasRef.current.height = displayHeight * dpr
```

### Part 2: Scale WebGL Star Sizes (Critical!)

WebGL `gl_PointSize` is in canvas pixels, not CSS pixels. Without scaling, stars appear 2x larger on non-retina displays:

```typescript
// In WebGL renderers, scale all sizes by dpr
const dpr = window.devicePixelRatio || 1
const finalSize = baseSize * dpr
```

**Why this matters:**

- Retina (dpr=2): A 16px point size → 16 canvas pixels → 8 CSS pixels (scaled by browser)
- Non-retina (dpr=1): A 16px point size → 16 canvas pixels → 16 CSS pixels (no scaling)
- Without dpr multiplication, the same `gl_PointSize` value appears 2x larger on non-retina!

### After Fix

**Retina Display (2x DPR):**

- CSS size: 1000px × 1000px
- Canvas internal resolution: 2000 × 2000 pixels (1000 × 2)
- Physical screen pixels: 2000 × 2000
- Result: 1:1 pixel mapping → sharp, crisp rendering

**Non-Retina Display (1x DPR):**

- CSS size: 1000px × 1000px
- Canvas internal resolution: 1000 × 1000 pixels (1000 × 1)
- Physical screen pixels: 1000 × 1000
- Result: 1:1 pixel mapping with full resolution → much sharper than before

## Files Modified

### Canvas Resolution Scaling (Part 1)

1. `src/hooks/useWebGLStarField.ts` - WebGL foreground starfield canvas sizing
2. `src/hooks/useWebGLClusterStarField.ts` - WebGL cluster starfield canvas sizing
3. `src/hooks/useStarField.ts` - Canvas2D foreground starfield canvas sizing
4. `src/hooks/useClusterStarField.ts` - Canvas2D cluster starfield canvas sizing

### WebGL Star Size Scaling (Part 2)

5. `src/lib/starfield/WebGLStarfieldRenderer.ts` - Scale foreground star sizes by dpr
6. `src/lib/starfield/WebGLClusterRenderer.ts` - Scale cluster star sizes by dpr

**Note:** Canvas2D renderers don't need size scaling because Canvas2D drawing commands automatically scale with canvas resolution.

## Expected Results

- **Non-retina displays**: Significantly sharper rendering (was underutilizing available pixels)
- **Retina displays**: Even sharper rendering (now using full 2x resolution)
- **Both**: Consistent quality across all pixel densities
- **Performance**: Minimal impact (rendering more pixels but GPUs handle this well)

## Testing

Test on various displays:

- Standard 1x displays (most desktop monitors)
- Retina 2x displays (MacBook Pro, high-end displays)
- High-DPI 3x displays (some modern phones/tablets)

The starfield should now appear equally sharp and detailed across all display types.
