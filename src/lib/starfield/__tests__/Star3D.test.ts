import { describe, it, expect, beforeEach } from 'vitest';
import { Star3D } from '../Star3D';

describe('Star3D', () => {
  let star: Star3D;
  const width = 1920;
  const height = 1080;

  beforeEach(() => {
    star = new Star3D(width, height);
  });

  it('initializes with random position within bounds', () => {
    expect(star.x).toBeGreaterThanOrEqual(-width);
    expect(star.x).toBeLessThanOrEqual(width);
    expect(star.y).toBeGreaterThanOrEqual(-height);
    expect(star.y).toBeLessThanOrEqual(height);
    expect(star.z).toBeGreaterThanOrEqual(0);
    expect(star.z).toBeLessThanOrEqual(2000);
  });

  it('moves star towards viewer on update', () => {
    const initialZ = star.z;
    star.update(1000, 0, 0.016); // 60fps frame
    expect(star.z).toBeLessThan(initialZ);
  });

  it('resets star when it passes through viewer', () => {
    star.z = -10; // Behind viewer
    star.update(1000, 0, 0.016);
    expect(star.z).toBeGreaterThan(0); // Should be reset to far distance
  });

  it('projects star to screen coordinates correctly', () => {
    star.x = 100;
    star.y = 50;
    star.z = 500;
    
    const projected = star.project(width, height);
    
    expect(projected.x).toBeCloseTo(width/2 + (100 * 1000) / 500);
    expect(projected.y).toBeCloseTo(height/2 + (50 * 1000) / 500);
    expect(projected.visible).toBe(true);
  });

  it('marks star as invisible when off-screen', () => {
    star.x = 10000; // Way off screen
    star.z = 100;
    
    const projected = star.project(width, height);
    expect(projected.visible).toBe(false);
  });

  it('applies roll rotation over time', () => {
    const initialX = star.x;
    const initialY = star.y;
    
    star.update(0, 1, 1); // 1 radian per second for 1 second
    
    // Position should have changed due to rotation
    expect(star.x).not.toBe(initialX);
    expect(star.y).not.toBe(initialY);
  });
}); 