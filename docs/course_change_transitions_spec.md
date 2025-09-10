# Space Course Change Transitions - Technical Specification

## Coding Agent Brief

You are implementing a **parallax-based course change transition system** for a personal website with an animated starfield background. The site currently features a two-layer starfield system (distant cluster + foreground moving stars) and needs smooth directional transitions triggered by hero section buttons.

### Current Architecture Context

- **Framework**: Next.js 15 + React 19 + TypeScript + Tailwind CSS
- **Starfield System**: Two-layer Canvas-based animation
  - `ClusterStarField` (background): Distant blue-tinted cluster stars
  - `StarField` (foreground): White "twinkle-compact" stars moving toward viewer
- **Main Component**: `HomepageLayeredStarField` combines both layers
- **Hero Buttons**: "Explore Projects" (left transition) + "Get in Touch" (right transition)
- **Existing Pattern**: Configuration variants system in `/variants` page

### Implementation Objective

Create realistic "changing course in space" transitions where:

- **Parallax motion**: Different star layers move at different rates during direction changes
- **Distant cluster**: Virtually stationary (minimal parallax)
- **Foreground stars**: Dramatic directional curve (full parallax)
- **Hero content**: Fades out during 2-second transition
- **End state**: Returns to pure forward motion after course change
- **Configurable**: Parameters for different transition variants

---

## Technical Specification

### **1. New Transition State Management**

**Create:** `src/hooks/useStarFieldTransition.ts`

```typescript
interface TransitionState {
	phase: 'idle' | 'transitioning' | 'settling'
	direction: 'left' | 'right' | null
	progress: number // 0-1
	startTime: number
}

interface TransitionConfig {
	duration: number // 2000ms default
	settlingDuration: number // 500ms to return to forward motion
	parallaxIntensity: number // How dramatic the direction change feels
	heroFadeDuration: number // 500ms default
}

export const useStarFieldTransition = (config: TransitionConfig) => {
	// State management for transition phases
	// Progress calculation with easing curves
	// Motion vector generation for different star layers
	// Timing coordination between UI fade and star motion
}
```

**Responsibilities:**

- Track transition state across both star layers
- Manage timing and progress with requestAnimationFrame
- Provide current motion vectors to star field hooks
- Coordinate hero content fade timing
- Return to forward motion after course change completes

---

### **2. Enhanced Star Motion System**

**Modify:** `src/hooks/useStarField.ts` and `src/hooks/useClusterStarField.ts`

**Add direction vectors to star update logic:**

```typescript
interface MotionVector {
	forward: number // Z-axis speed (toward viewer)
	lateral: number // X-axis speed (left/right)
	vertical: number // Y-axis speed (up/down, minimal)
}
```

**Layer-specific parallax factors:**

- **Foreground stars (StarField)**: Full parallax intensity (1.0x)
- **Center stars**: Moderate parallax (0.3x)
- **Background cluster**: Minimal parallax (0.05x)

**Motion calculation during transitions:**

```typescript
// During transition, interpolate motion vectors
const lateralSpeed = easeInOut(progress) * maxLateralSpeed * direction
const forwardSpeed = baseForwardSpeed // Maintains forward motion

// Apply parallax factors by layer
foregroundStar.velocityX = lateralSpeed * 1.0
centerStar.velocityX = lateralSpeed * 0.3
clusterStar.velocityX = lateralSpeed * 0.05
```

---

### **3. Configurable Transition Parameters**

**Create:** `src/types/transitions.ts`

```typescript
type CourseChangeVariant = 'gentle-drift' | 'banking-turn' | 'sharp-maneuver'

interface CourseChangeConfig {
	variant: CourseChangeVariant
	duration: number // Transition duration in ms
	parallaxIntensity: number // 0.0 - 2.0, controls how dramatic the motion feels
	maxLateralSpeed: number // Maximum sideways velocity during transition
	easingCurve: 'ease-in-out' | 'ease-out' | 'linear'
	heroFadeDelay: number // Delay before hero content starts fading
}

// Preset configurations
export const COURSE_CHANGE_PRESETS: Record<
	CourseChangeVariant,
	CourseChangeConfig
> = {
	'gentle-drift': {
		variant: 'gentle-drift',
		duration: 2000,
		parallaxIntensity: 0.8,
		maxLateralSpeed: 300,
		easingCurve: 'ease-in-out',
		heroFadeDelay: 0,
	},
	// ... additional presets
}
```

**Integration with existing variants system:**

- Follow existing pattern from `docs/starfield-parameters.md`
- Add course change options to `/variants` page for testing
- Include in Storybook stories
- Maintain consistency with current configuration approach

---

### **4. Hero Content Transition Coordination**

**Enhance:** `src/components/ui/HeroSection.tsx`

```typescript
interface HeroSectionProps {
	// ... existing props
	transitionState?: 'visible' | 'fading' | 'hidden'
	onTransitionComplete?: () => void
	fadeConfig?: {
		duration: number
		delay: number
	}
}
```

**Add fade animation capabilities:**

- CSS transition for smooth opacity changes
- Optional transform for subtle movement during fade
- Callback system when fade completes
- Integration with transition timing system

---

### **5. Button Integration & State Management**

**Enhance:** `src/components/ui/PageLayout.tsx`

```typescript
interface PageLayoutProps {
	// ... existing props
	onCourseChange?: (direction: 'left' | 'right') => void
	courseChangeConfig?: CourseChangeConfig
	enableTransitions?: boolean
}
```

**Button trigger flow:**

1. "Explore Projects" → `onCourseChange('left')`
2. "Get In Touch" → `onCourseChange('right')`
3. State flows to starfield transition hook
4. Hero content begins coordinated fade
5. Star motion vectors update with parallax scaling
6. After transition: return to forward motion, ready for new content

---

### **6. Animation Implementation Strategy**

**Easing and Motion Curves:**

```typescript
// Smooth course change with realistic space physics feel
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t)

// Settling phase: gradually reduce lateral velocity
const settlingEase = (t: number) => 1 - Math.pow(1 - t, 3)
```

**Parallax Depth Simulation:**

- Closer stars show dramatic trajectory changes
- Distant objects remain nearly stationary
- Creates realistic sense of changing direction in 3D space
- Maintains visual hierarchy between star layers

**Performance Considerations:**

- Efficient motion vector calculations
- Minimal impact on existing animation loops
- Smooth 60fps throughout transition
- Memory usage considerations for longer transitions

---

## **7. Development Implementation Phases**

### **Phase 1: Core Transition Infrastructure**

**Priority: HIGH - Foundation for all other features**

- [ ] Implement `useStarFieldTransition` hook with timing logic
- [ ] Create transition state management system
- [ ] Add configurable parameter structure
- [ ] Basic motion vector calculation
- [ ] Unit tests for timing and state transitions

**Acceptance Criteria:**

- Hook properly manages transition phases
- Progress calculation is smooth and accurate
- State changes trigger correctly
- Configurable parameters work as expected

### **Phase 2: Star Motion Integration**

**Priority: HIGH - Core visual effect**

- [ ] Modify `useStarField.ts` to accept motion vectors
- [ ] Update `useClusterStarField.ts` with parallax scaling
- [ ] Implement layer-specific motion responses
- [ ] Test motion feels realistic and smooth
- [ ] Performance optimization for motion calculations

**Acceptance Criteria:**

- Foreground stars show dramatic directional movement
- Background cluster remains nearly stationary
- Motion feels like realistic course change in space
- Performance remains smooth during transitions

### **Phase 3: Hero UI Coordination**

**Priority: MEDIUM - User experience polish**

- [ ] Add fade animations to HeroSection
- [ ] Wire button triggers to transition system
- [ ] Coordinate timing between star motion and UI fade
- [ ] Test interaction flow end-to-end
- [ ] Handle edge cases (rapid button presses, etc.)

**Acceptance Criteria:**

- Buttons trigger appropriate transition directions
- Hero content fades smoothly during transitions
- Timing coordination works seamlessly
- User interactions feel responsive and polished

### **Phase 4: Variants & Configuration**

**Priority: MEDIUM - Testing and flexibility**

- [ ] Add course change variants to existing variants system
- [ ] Create Storybook stories for different configurations
- [ ] Add course change testing to `/variants` page
- [ ] Documentation for configuration options
- [ ] Integration with existing variant architecture

**Acceptance Criteria:**

- Multiple transition variants available and testable
- Variants system properly integrated
- Configuration options well-documented
- Easy to test different settings live

### **Phase 5: Polish & Optimization**

**Priority: LOW - Final refinements**

- [ ] Fine-tune easing curves and timing
- [ ] Performance optimization and profiling
- [ ] Cross-browser compatibility testing
- [ ] Mobile device considerations
- [ ] Error handling and edge case management

**Acceptance Criteria:**

- Smooth performance across target browsers
- Mobile experience works appropriately
- No performance regressions
- Robust error handling

---

## **8. File Structure & Modifications**

### **New Files to Create:**

```
src/
├── hooks/
│   └── useStarFieldTransition.ts          # Core transition state management
├── types/
│   └── transitions.ts                      # Type definitions and presets
└── __tests__/
    └── transitions/
        ├── useStarFieldTransition.test.ts  # Hook testing
        └── motionCalculations.test.ts      # Motion vector testing
```

### **Files to Modify:**

```
src/
├── hooks/
│   ├── useStarField.ts                     # Add motion vector support
│   └── useClusterStarField.ts             # Add parallax scaling
├── components/
│   ├── ui/
│   │   ├── HeroSection.tsx                # Add fade states and transitions
│   │   └── PageLayout.tsx                 # Add course change integration
│   └── starfield/
│       └── LayeredStarField.tsx           # Wire transition props through
├── app/
│   └── variants/
│       └── VariantsClient.tsx             # Add course change testing UI
└── stories/
    ├── HeroSection.stories.tsx            # Add transition state stories
    └── PageLayout.stories.tsx             # Add course change stories
```

### **Testing Strategy:**

- **Unit Tests**: Transition timing, motion calculations, state management
- **Integration Tests**: Button → transition → star motion flow
- **Visual Tests**: Storybook stories for different configurations
- **Performance Tests**: Frame rate during transitions, memory usage
- **E2E Tests**: Full user interaction flow

---

## **9. Technical Integration Notes**

### **Existing Architecture Compatibility:**

- Maintains current two-layer starfield system
- Preserves existing configuration patterns
- Compatible with current variant testing approach
- No breaking changes to existing components

### **Performance Requirements:**

- Maintain 60fps during all transitions
- Minimal memory allocation during animations
- Efficient motion vector calculations
- Smooth degradation on lower-performance devices

### **Future Extensibility:**

- Transition system designed for additional directions (up/down)
- Configuration structure allows for new transition types
- Hook architecture supports additional star layers
- Parameter system extensible for new motion effects

---

## **Getting Started**

1. **Begin with Phase 1**: Implement the core `useStarFieldTransition` hook
2. **Focus on timing first**: Get the state management and progress calculation working
3. **Test in isolation**: Create simple test cases for the hook before integrating
4. **Reference existing code**: Follow patterns from current starfield hooks
5. **Use variants page**: Test configurations as you develop them

The existing codebase has excellent examples of Canvas-based animations, React hooks for starfield management, and configuration systems. Follow those patterns for consistency and maintainability.
