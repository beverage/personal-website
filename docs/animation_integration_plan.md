# Animation Architecture Integration Plan

## **Phase 1: Framer Motion Integration (Primary)**

### **A. Hero Section & UI Transitions**

Replace manual fade logic with Framer Motion's layout animations:

```typescript
// src/components/ui/HeroSection.tsx - Enhanced with Framer Motion
import { motion, AnimatePresence } from 'framer-motion'

export const HeroSection = ({ transitionState, ...props }) => (
  <AnimatePresence mode="wait">
    <motion.div
      key="hero-content"
      initial={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: -20,
        transition: { duration: 0.5, ease: "easeInOut" }
      }}
      className="max-w-5xl text-center"
    >
      {/* Existing hero content */}
    </motion.div>
  </AnimatePresence>
)
```

### **B. Portfolio Section Snap Scrolling**

Create the portfolio carousel using Framer Motion's scroll features:

```typescript
// src/components/portfolio/PortfolioCarousel.tsx - NEW
import { motion, useScroll, useTransform } from 'framer-motion'

export const PortfolioCarousel = ({ projects }) => {
  const { scrollYProgress } = useScroll()

  return (
    <div className="h-[500vh]"> {/* 5x viewport height for 5 projects */}
      {projects.map((project, i) => (
        <motion.section
          key={project.id}
          className="sticky top-0 h-screen flex items-center justify-center"
          style={{
            y: useTransform(scrollYProgress, [i/5, (i+1)/5], [0, -100])
          }}
        >
          <ProjectCard project={project} />
        </motion.section>
      ))}
    </div>
  )
}
```

### **C. Scroll-Based Content Reveals**

Add reveal animations as content comes into view:

```typescript
// src/components/ui/ScrollReveal.tsx - NEW
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export const ScrollReveal = ({ children, direction = "up" }) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 50 : -50,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
    >
      {children}
    </motion.div>
  )
}
```

---

## **Phase 2: GSAP Integration (Secondary)**

For more complex scroll animations and timeline control:

```bash
npm install gsap
```

### **A. Advanced Scroll Timeline**

GSAP's ScrollTrigger for complex portfolio interactions:

```typescript
// src/hooks/usePortfolioScroll.ts - NEW
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const usePortfolioScroll = (projects: Project[]) => {
	const containerRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!containerRef.current) return

		// Create timeline for portfolio sections
		const tl = gsap.timeline({
			scrollTrigger: {
				trigger: containerRef.current,
				start: 'top top',
				end: 'bottom bottom',
				scrub: 1, // Smooth scrubbing
				snap: {
					snapTo: 1 / projects.length, // Snap to each section
					duration: 0.5,
					delay: 0.1,
				},
			},
		})

		// Animate each project card
		projects.forEach((_, i) => {
			tl.fromTo(
				`.project-card-${i}`,
				{ opacity: 0, y: 100, rotationY: 15 },
				{ opacity: 1, y: 0, rotationY: 0, duration: 1 },
			)
		})

		return () => {
			ScrollTrigger.getAll().forEach(trigger => trigger.kill())
		}
	}, [projects])

	return containerRef
}
```

---

## **Phase 3: Performance Optimization**

### **A. Animation Orchestration Hook**

Centralize all animation control to prevent conflicts:

```typescript
// src/hooks/useAnimationOrchestrator.ts - NEW
import { useCallback, useRef } from 'react'

interface AnimationState {
	starfieldTransition: boolean
	portfolioScrolling: boolean
	uiTransitions: boolean
}

export const useAnimationOrchestrator = () => {
	const stateRef = useRef<AnimationState>({
		starfieldTransition: false,
		portfolioScrolling: false,
		uiTransitions: false,
	})

	const requestAnimationPermission = useCallback(
		(type: keyof AnimationState) => {
			// Prevent conflicts between Canvas and DOM animations
			const canAnimate = !Object.values(stateRef.current).some(active => active)
			if (canAnimate) {
				stateRef.current[type] = true
			}
			return canAnimate
		},
		[],
	)

	const releaseAnimationPermission = useCallback(
		(type: keyof AnimationState) => {
			stateRef.current[type] = false
		},
		[],
	)

	return { requestAnimationPermission, releaseAnimationPermission }
}
```

### **B. Reduced Motion Support**

Respect user preferences:

```typescript
// src/hooks/useReducedMotion.ts - NEW
import { useEffect, useState } from 'react'

export const useReducedMotion = () => {
	const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
		setPrefersReducedMotion(mediaQuery.matches)

		const handleChange = (e: MediaQueryListEvent) => {
			setPrefersReducedMotion(e.matches)
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	return prefersReducedMotion
}
```

---

## **Phase 4: Integration with Existing Starfield**

### **A. Maintain Canvas Performance**

Keep your existing starfield but coordinate with Framer Motion:

```typescript
// src/components/starfield/LayeredStarField.tsx - Enhanced
import { motion } from 'framer-motion'

export const LayeredStarField = ({ courseChangeActive, ...props }) => {
  return (
    <motion.div
      className="absolute inset-0"
      animate={{
        // Subtle container transforms during course changes
        rotateZ: courseChangeActive ? 0.5 : 0,
        scale: courseChangeActive ? 1.02 : 1.0
      }}
      transition={{ duration: 2, ease: "easeInOut" }}
    >
      {/* Existing ClusterStarField and StarField components */}
      <ClusterStarField {...props} />
      <StarField {...props} />
    </motion.div>
  )
}
```

### **B. Coordinated Timing**

Sync Canvas animations with Framer Motion:

```typescript
// src/hooks/useStarFieldTransition.ts - Enhanced
import { useAnimationControls } from 'framer-motion'

export const useStarFieldTransition = (config) => {
  const controls = useAnimationControls()

  const startTransition = useCallback(async (direction) => {
    // Start Canvas animation
    setTransitionState({ phase: 'transitioning', direction, ... })

    // Coordinate with Framer Motion
    await controls.start({
      // Container transforms
      rotateZ: direction === 'left' ? -0.5 : 0.5,
      transition: { duration: config.duration / 1000 }
    })

    // Reset after transition
    await controls.start({ rotateZ: 0 })
  }, [controls, config])

  return { startTransition, controls }
}
```

---

## **Phase 5: Portfolio Feature Implementation**

### **A. Project Cards with Physics**

Natural-feeling interactions:

```typescript
// src/components/portfolio/ProjectCard.tsx - NEW
import { motion, useMotionValue, useTransform } from 'framer-motion'

export const ProjectCard = ({ project, isActive }) => {
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [5, -5])

  return (
    <motion.div
      className="project-card"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: isActive ? 1 : 0.3,
        scale: isActive ? 1 : 0.9,
        z: isActive ? 0 : -100
      }}
      style={{ rotateX }}
      drag="y"
      dragConstraints={{ top: -50, bottom: 50 }}
      dragElastic={0.2}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Project content */}
    </motion.div>
  )
}
```

### **B. Navigation Between Sections**

Smooth transitions between hero, portfolio, and contact:

```typescript
// src/hooks/usePageNavigation.ts - Enhanced
import { useAnimationControls } from 'framer-motion'

export const usePageNavigation = () => {
	const pageControls = useAnimationControls()

	const navigateToSection = async (
		section: 'hero' | 'portfolio' | 'contact',
	) => {
		// Coordinate with existing starfield transition
		await pageControls.start({
			x:
				section === 'portfolio'
					? '-100vw'
					: section === 'contact'
						? '100vw'
						: '0vw',
			transition: {
				duration: 1.2,
				ease: [0.22, 1, 0.36, 1], // Custom easing for space feel
			},
		})
	}

	return { navigateToSection, pageControls }
}
```

---

## **Implementation Priority & Timeline**

### **Week 1-2: Foundation**

- [ ] Install Framer Motion
- [ ] Create `useReducedMotion` and `useAnimationOrchestrator` hooks
- [ ] Enhance HeroSection with exit animations
- [ ] Test integration with existing starfield

### **Week 3-4: Portfolio Features**

- [ ] Build `PortfolioCarousel` component
- [ ] Create `ProjectCard` with physics interactions
- [ ] Implement scroll-based reveals
- [ ] Add section snapping

### **Week 5-6: Advanced Features (Optional)**

- [ ] Add GSAP for complex scroll timelines
- [ ] Create page transition system
- [ ] Performance optimization
- [ ] Testing and refinement

---

## **Bundle Size Impact**

**Framer Motion**: ~35KB gzipped (tree-shakeable)
**GSAP Core + ScrollTrigger**: ~25KB gzipped
**Total Addition**: ~60KB (minimal for the functionality gained)

Your current bundle will benefit from:

- Reduced custom animation code
- Better performance optimization
- Declarative animation syntax
- Built-in accessibility features

---

## **Testing Strategy Updates**

### **Animation Testing with Framer Motion**

```typescript
// src/components/__tests__/PortfolioCarousel.test.tsx
import { render } from '@testing-library/react'
import { MotionConfig } from 'framer-motion'

const renderWithoutAnimations = (component) =>
  render(
    <MotionConfig reducedMotion="always">
      {component}
    </MotionConfig>
  )
```

### **Performance Monitoring**

```typescript
// Add to existing performance tests
test('portfolio scrolling maintains 60fps', async ({ page }) => {
	// Monitor frame rate during scroll animations
	const metrics = await page.evaluate(() => {
		// Performance monitoring for Framer Motion animations
	})
	expect(metrics.averageFPS).toBeGreaterThan(58)
})
```

This integration plan maintains your excellent existing architecture while adding the modern animation capabilities needed for the portfolio features.
