import { useRef, useEffect, useState } from 'react';
import { Star3D } from '@/lib/starfield/Star3D';
import { ClusterStar3D } from '@/lib/starfield/ClusterStar3D';
import { ClusterVariant, CLUSTER_CONFIGS } from '@/types/starfield';

interface UseClusterStarFieldProps {
  variant: ClusterVariant;
  opacity?: number;
}

export const useClusterStarField = ({ variant, opacity = 1.0 }: UseClusterStarFieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const foregroundStarsRef = useRef<Star3D[]>([]);
  const clusterStarsRef = useRef<ClusterStar3D[]>([]);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);

  // Get configuration for this variant
  const config = CLUSTER_CONFIGS[variant];

  // Ensure we're only running client-side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Additional client-side checks
    if (typeof document === 'undefined' || typeof requestAnimationFrame === 'undefined') {
      return;
    }
    
    const width = window.innerWidth || 1920;
    const height = window.innerHeight || 1080;
    
    // Initialize both star layers with configuration
    foregroundStarsRef.current = Array.from({ length: config.foregroundStars }, () => new Star3D(width, height));
    clusterStarsRef.current = Array.from({ length: config.clusterStars }, () => 
      new ClusterStar3D(width, height, config.clusterSemiMajorAxis, config.clusterSemiMinorAxis, config.clusterDistance)
    );

    const animate = (currentTime: number) => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let deltaTime = lastTimeRef.current ? (currentTime - lastTimeRef.current) / 1000 : 0;
      // Clamp deltaTime to prevent visual jumps after tab switching
      if (deltaTime > 0.1) deltaTime = 0.1;
      lastTimeRef.current = currentTime;

      // Clear canvas with deep space black
      ctx.fillStyle = 'transparent';
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render distant cluster first (background layer)
      clusterStarsRef.current.forEach(star => {
        star.update(config.approachSpeed, -1.5, deltaTime);
        
        const projected = star.project(canvas.width, canvas.height, config.clusterFocalLength);
        if (projected.visible) {
          // Slight blue tint for cluster stars (hot stellar cores)
          const clusterOpacity = projected.opacity * opacity;
          ctx.fillStyle = `rgba(200, 220, 255, ${clusterOpacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Render foreground stars (existing star field)
      foregroundStarsRef.current.forEach(star => {
        star.update(config.approachSpeed, -1.5, deltaTime);
        
        const projected = star.project(canvas.width, canvas.height, config.foregroundFocalLength);
        if (projected.visible) {
          const foregroundOpacity = projected.opacity * opacity;
          ctx.fillStyle = `rgba(255, 255, 255, ${foregroundOpacity})`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, projected.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth;
        canvasRef.current.height = canvasRef.current.offsetHeight;
        
        // Update canvas size for all stars
        [...foregroundStarsRef.current, ...clusterStarsRef.current].forEach(star => {
          star.updateCanvasSize(canvasRef.current!.width, canvasRef.current!.height);
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isClient, variant, opacity, config]);

  return canvasRef;
}; 