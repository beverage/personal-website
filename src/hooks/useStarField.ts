import { useRef, useEffect, useState } from 'react';
import { Star3D, renderTwinkleStar, TwinkleVariant } from '@/lib/starfield';

interface UseStarFieldProps {
  starCount: number;
  speed: number;
  rollSpeed: number;
  opacity: number;
  variant: TwinkleVariant;
}

export const useStarField = ({ 
  starCount, 
  speed, 
  rollSpeed, 
  opacity, 
  variant 
}: UseStarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star3D[]>([]);
  // Keep latest speed in a ref so changing speed doesn't re-create stars
  const speedRef = useRef(speed);

  // Update speedRef whenever speed prop changes
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're only running client-side
  useEffect(() => {
    console.log('Setting isClient to true');
    setIsClient(true);
  }, []);

  useEffect(() => {
    console.log('useStarField main useEffect starting...');
    console.log('isClient:', isClient);
    
    // Double check we're on the client
    if (!isClient) {
      console.log('Not on client yet, bailing out');
      return;
    }

    // Additional client-side checks
    if (typeof document === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      console.log('Missing client-side APIs, bailing out');
      return;
    }
    
    const width = window.innerWidth || 1920;
    const height = window.innerHeight || 1080;
    console.log(`Window dimensions: ${width}x${height}`);
    
    starsRef.current = Array.from({ length: starCount }, () => new Star3D(width, height));
    console.log(`Created ${starsRef.current.length} stars`);

    const animate = (currentTime: number) => {
      if (!canvasRef.current) {
        console.log('Canvas ref is null, skipping frame');
        return;
      }
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.log('Could not get canvas context');
        return;
      }

      let deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      // Clamp deltaTime to prevent visual jumps after tab switching
      if (deltaTime > 0.1) deltaTime = 0.1;
      lastTimeRef.current = currentTime;

      // Debug: Log every 60 frames (roughly once per second)
      if (Math.floor(currentTime / 16) % 60 === 0) {
        console.log(`StarField animating: ${starsRef.current.length} stars, canvas: ${canvas.width}x${canvas.height}`);
      }

      // Clear canvas with deep space black
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let visibleStars = 0;
      let culledStars = 0;
      
      starsRef.current.forEach(star => {
        // Fast visibility pre-check using current position + aspect-ratio margin
        if (star.isLikelyVisible()) {
          // Full update with rotation for potentially visible stars
          star.update(speedRef.current, rollSpeed, deltaTime);
          
          const projected = star.project(canvas.width, canvas.height);
          if (projected.visible) {
            renderTwinkleStar(
              ctx,
              projected.x,
              projected.y,
              projected.size,
              projected.opacity * opacity,
              currentTime,
              variant
            );
            visibleStars++;
          }
        } else {
          // Minimal update for off-screen stars (no rotation, just forward movement)
          star.updateMinimal(speedRef.current, deltaTime);
          culledStars++;
        }
      });

      // Debug: Log performance stats occasionally
      if (Math.floor(currentTime / 16) % 120 === 0) { // Every 2 seconds
        console.log(`StarField performance: ${visibleStars} visible, ${culledStars} culled (${Math.round(culledStars/(visibleStars+culledStars)*100)}% saved)`);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      console.log('resizeCanvas called');
      if (canvasRef.current) {
        console.log(`Canvas element found: ${canvasRef.current.offsetWidth}x${canvasRef.current.offsetHeight}`);
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        console.log(`Canvas resized to: ${canvasRef.current.width}x${canvasRef.current.height}`);
        
        starsRef.current.forEach(star => {
          star.updateCanvasSize(canvasRef.current!.width, canvasRef.current!.height);
        });
      } else {
        console.log('Canvas ref is null in resizeCanvas');
      }
    };

    console.log('About to call resizeCanvas...');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    console.log('Starting animation with requestAnimationFrame...');
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      console.log('useStarField cleanup');
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, starCount, rollSpeed, opacity, variant]);

  return canvasRef;
};

// Convenience hook with preset configurations
export const useStarFieldPreset = (variant: TwinkleVariant, opacity: number = 1.0) => {
  // Mobile detection: screen width < 768px (common mobile breakpoint)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  // Reduce star count by 50% on mobile for better performance
  const starCount = isMobile ? 2000 : 5000;
  
  return useStarField({
    starCount,
    speed: 1000,
    rollSpeed: -1.5,
    opacity,
    variant,
  });
}; 