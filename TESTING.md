# 🧪 Testing Strategy for Personal Website

This document outlines the comprehensive testing approach for this Next.js personal website with animated star field and component architecture.

## 📊 Testing Stack Overview

### ✅ **Already Configured**

- **Vitest** - Fast unit/integration testing with TypeScript support
- **React Testing Library** - Component testing utilities
- **Playwright** - Browser automation for E2E tests
- **Storybook** - Visual component testing and development
- **JSDOM** - DOM simulation for unit tests
- **Jest-DOM matchers** - Enhanced assertions for DOM testing

---

## 🎯 Testing Layers

### 1. **Unit Tests** - Individual Components & Logic

**Location**: `src/**/*.{test,spec}.{ts,tsx}`  
**Run**: `npm test` or `npm run test:watch`

```bash
# Run all unit tests
npm test

# Watch mode for development
npm run test:watch

# UI mode with visual test runner
npm run test:ui
```

**Examples:**

- **Component Props & Rendering**: Test BrandPanel renders correct text
- **Animation Logic**: Test Star3D position calculations
- **Hook Behavior**: Test useStarField cleanup and mounting
- **Utility Functions**: Test pure functions and calculations

**Sample Test Structure:**

```typescript
// src/components/ui/__tests__/BrandPanel.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrandPanel } from '../BrandPanel';

describe('BrandPanel', () => {
  it('renders with custom brand name', () => {
    render(<BrandPanel brandName="test-brand" />);
    expect(screen.getByText('test-brand')).toBeInTheDocument();
  });
});
```

---

### 2. **Component Visual Testing** - Storybook Stories

**Location**: `src/**/*.stories.tsx`  
**Run**: `npm run storybook`

```bash
# Start Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook
```

**Benefits:**

- **Visual Development** - See all component variants
- **Interactive Testing** - Test with different props via controls
- **Accessibility Testing** - Built-in a11y addon
- **Regression Testing** - Visual diff detection with Chromatic

**Available Stories:**

- `UI/BrandPanel` - Brand display variants
- `UI/ControlPanel` - Theme toggle states
- `UI/HeroSection` - Different hero content examples
- `UI/FooterPanel` - Social link configurations
- `UI/PageLayout` - Complete page compositions
- `Starfield/StarField` - All 5 star field variants with controls

---

### 3. **Integration Tests** - Component Interactions

**Location**: `src/**/*.integration.{test,spec}.{ts,tsx}`  
**Run**: `npm test` (included in unit test run)

**What to Test:**

- **Component Communication** - Parent-child prop passing
- **State Management** - Theme changes, animation controls
- **Event Handling** - Button clicks, hover states
- **Canvas Integration** - Star field rendering with actual canvas

**Example:**

```typescript
// Test star field integration with different variants
it('renders different star field variants', () => {
  const { rerender } = render(<StarField variant="twinkle" />);
  // Test twinkle variant

  rerender(<StarField variant="twinkle-pulse" />);
  // Test pulse variant
});
```

---

### 4. **End-to-End Tests** - Full User Experience

**Location**: `tests/e2e/*.spec.ts`  
**Run**: `npx playwright test`

```bash
# Install Playwright browsers (first time)
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI mode
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/homepage.spec.ts
```

**What to Test:**

- **Page Loading** - Full page renders correctly
- **User Interactions** - Buttons work, theme toggle functions
- **Animation Performance** - Star field runs smoothly
- **Responsive Design** - Mobile/desktop layouts
- **Accessibility** - Screen reader compatibility
- **Real Browser Testing** - Cross-browser compatibility

**Sample E2E Test:**

```typescript
// tests/e2e/homepage.spec.ts
test('homepage loads with star field animation', async ({ page }) => {
	await page.goto('/')

	// Check main content
	await expect(page.getByText('Coming Soon')).toBeVisible()

	// Verify star field canvas is present and has dimensions
	const canvas = page.locator('canvas')
	await expect(canvas).toBeVisible()
	const box = await canvas.boundingBox()
	expect(box?.width).toBeGreaterThan(0)
})
```

---

### 5. **Performance Tests** - Animation & Loading

**Location**: `tests/performance/*.spec.ts`  
**Run**: `npx playwright test tests/performance/`

**What to Test:**

- **Frame Rate** - Star field maintains ~60fps
- **Memory Usage** - No memory leaks over time
- **Load Performance** - Page loads quickly
- **Bundle Size** - JavaScript bundle stays reasonable
- **Core Web Vitals** - LCP, FID, CLS metrics

**Sample Performance Test:**

```typescript
// tests/performance/starfield.spec.ts
test('star field maintains good performance', async ({ page }) => {
	await page.goto('/')

	// Monitor frame rate for 2 seconds
	const fps = await page.evaluate(() => {
		// FPS monitoring logic
	})

	expect(fps).toBeGreaterThan(50)
})
```

---

### 6. **Visual Regression Tests** - UI Consistency

**Tool**: Chromatic (integrated with Storybook)  
**Run**: `npx chromatic` (with Chromatic token)

```bash
# Publish to Chromatic for visual testing
npx chromatic --project-token=<your-token>
```

**Benefits:**

- **Automated Screenshot Comparison** - Detect unintended visual changes
- **Cross-Browser Testing** - Test in Chrome, Firefox, Safari
- **Responsive Screenshots** - Mobile/tablet/desktop views
- **Component Isolation** - Test each component variant
- **Design System Documentation** - Visual component library

---

## 🚀 Testing Commands Summary

```bash
# Unit & Integration Tests
npm test                    # Run all unit tests once
npm run test:watch         # Watch mode for development
npm run test:ui            # Visual test runner
npm run test:coverage      # Run with coverage report

# Component Visual Testing
npm run storybook          # Start Storybook dev server
npm run build-storybook    # Build static Storybook

# End-to-End Tests
npx playwright test        # Run all E2E tests
npx playwright test --ui   # Run with Playwright UI
npx playwright test --headed  # Run with visible browser

# Performance Tests
npx playwright test tests/performance/  # Performance-specific tests

# Visual Regression
npx chromatic             # Visual diff testing (requires setup)
```

---

## 📝 **Testing Best Practices for This App**

### **Star Field Animation Testing**

- **Mock `requestAnimationFrame`** in unit tests
- **Test mathematical calculations** separately from rendering
- **Use performance tests** to verify smooth animation
- **Test cleanup** to prevent memory leaks

### **Component Testing**

- **Test props and rendering** in isolation
- **Use Storybook** for visual validation
- **Test accessibility** with built-in a11y addon
- **Mock external dependencies** (canvas, window APIs)

### **LCARS UI Testing**

- **Test glassmorphism effects** are applied
- **Verify responsive design** across screen sizes
- **Test theme switching** functionality
- **Validate color contrast** for accessibility

### **Performance Considerations**

- **Monitor bundle size** impact of new features
- **Test on slower devices** (throttle CPU in tests)
- **Verify Canvas performance** doesn't degrade over time
- **Test memory usage** during long animation runs

---

## 🎯 **What NOT to Test**

- **Third-party library internals** (React, Next.js internals)
- **Browser APIs directly** (focus on your usage of them)
- **Trivial getters/setters** without logic
- **CSS styling details** (use visual tests instead)
- **Random number generation** (mock for consistent tests)

---

## 🔧 **Advanced Testing Setup**

### **Custom Test Utilities**

```typescript
// tests/utils/render.tsx
export const renderWithTheme = (component: ReactElement) => {
  return render(
    <div className="dark">
      <div className="bg-black text-white">
        {component}
      </div>
    </div>
  );
};
```

### **Canvas Testing Helpers**

```typescript
// tests/utils/canvas.ts
export const mockCanvas = () => {
	const mockContext = {
		clearRect: vi.fn(),
		fillRect: vi.fn(),
		arc: vi.fn(),
		fill: vi.fn(),
		// ... other canvas methods
	}

	HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext)
	return mockContext
}
```

This comprehensive testing strategy ensures your personal website is robust, performant, and maintainable! 🚀
