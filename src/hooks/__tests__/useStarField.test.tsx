import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useStarField } from '../useStarField';

beforeEach(() => {
  // Mock window dimensions
  Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });
  
  // Mock requestAnimationFrame
  global.requestAnimationFrame = vi.fn(() => 1);
  global.cancelAnimationFrame = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useStarField', () => {
  it('returns a canvas ref', () => {
    const { result } = renderHook(() => 
      useStarField({
        starCount: 100,
        speed: 1000,
        rollSpeed: 0,
        opacity: 1,
        variant: 'twinkle'
      })
    );

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // Initially null until mounted
  });

  it('cleans up animation on unmount', () => {
    const { unmount } = renderHook(() => 
      useStarField({
        starCount: 100,
        speed: 1000,
        rollSpeed: 0,
        opacity: 1,
        variant: 'twinkle'
      })
    );

    unmount();
    expect(global.cancelAnimationFrame).toHaveBeenCalled();
  });
}); 