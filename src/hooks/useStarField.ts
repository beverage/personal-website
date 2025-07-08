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

      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current.forEach(star => {
        star.update(speed, rollSpeed, deltaTime);
        
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
        }
      });

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
  }, [isClient, starCount, speed, rollSpeed, opacity, variant]);

  return canvasRef;
};

// Convenience hook with preset configurations
export const useStarFieldPreset = (variant: TwinkleVariant, opacity: number = 1.0) => {
  return useStarField({
    starCount: 4000,
    speed: 1000,
    rollSpeed: -1.5,
    opacity,
    variant,
  });
}; 