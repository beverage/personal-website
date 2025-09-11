# Portfolio Animation Configuration Guide

## Overview

The portfolio system uses a layered animation approach with independent timing controls for different aspects of the user experience.

## Animation Layers

### 1. Card Sliding (Transform-based)

- **Duration**: 2.0 seconds
- **Controls**: Physical movement of cards into position
- **Configuration**: `PORTFOLIO_ANIMATION_CONFIG.cardSlide`
- **Location**: `PortfolioScroll.tsx` motion.div transitions

### 2. Content Fade-In (Opacity-based)

- **Duration**: 4.0 seconds
- **Controls**: Content visibility and appearance
- **Configuration**: `PORTFOLIO_ANIMATION_CONFIG.contentFade`
- **Location**: `ProjectCard` component animations

### 3. Navigation Arrows

- **Fade-In**: 0.8s (contextual delays)
- **Fade-Out**: 0.15s (rapid)
- **Configuration**: `PORTFOLIO_ANIMATION_CONFIG.navigationArrows`

## Timing Coordination

### Hero Card Timeline

```
0.0s: Container slides into position (2.0s)
0.0s: Content starts fading in (1.0s)
0.2s: Title appears
0.4s: Description appears
0.8s: Down arrow fades in
```

### Project Card Timeline

```
0.0s: Container slides into position (2.0s)
0.0s: Content starts fading in (4.0s)
0.2s: Up arrow + Title appear
0.4s: Description appears
0.6s: Technologies section appears
0.8s: Tech tags start appearing (staggered)
1.2s: Links container + Down arrow appear
1.0s+: Individual links appear (staggered)
```

## Configuration Files

### Primary Config

- **`PortfolioAnimationConfig.ts`**: Centralized timing and easing
- **`usePortfolioAnimations.ts`**: Reusable animation hooks

### Component Integration

- **`PortfolioScroll.tsx`**: Main container and card sliding
- **`ProjectCard`**: Content animations and layout
- **`NavigationArrows.tsx`**: Navigation UI animations

## Customization

### Adjusting Speed

```typescript
// Slower card sliding
cardSlide: {
	duration: 3.0
}

// Faster content fade
contentFade: {
	duration: 2.0
}

// Different arrow timing
navigationArrows: {
	fadeIn: {
		delays: {
			hero: 1.0
		}
	}
}
```

### Easing Curves

All animations use `[0.25, 0.1, 0.25, 1]` for consistent feel.
Modify in `PORTFOLIO_ANIMATION_CONFIG` to change globally.

## Performance Notes

- **Transform animations**: GPU-accelerated, performant
- **Transition blocking**: Prevents rapid navigation conflicts
- **AnimatePresence**: Proper exit animations for navigation arrows
- **Viewport optimization**: Animations only trigger when visible
