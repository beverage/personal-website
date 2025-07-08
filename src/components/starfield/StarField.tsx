import React from 'react';
import { useStarField } from '@/hooks';
import { useOptimalStarCount } from '@/hooks/useMobileDetection';
import { TwinkleVariant } from '@/lib/starfield';

interface StarFieldProps {
  variant?: TwinkleVariant;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
  // Advanced configuration (optional)
  starCount?: number;
  speed?: number;
  rollSpeed?: number;
}

export const StarField: React.FC<StarFieldProps> = ({
  variant = 'twinkle-compact',
  opacity = 1.0,
  className = '',
  style,
  starCount,
  speed = 1000,
  rollSpeed = -1.5,
}) => {
  // Robust mobile/low-power detection with automatic star count optimization
  // Only apply if starCount wasn't explicitly provided
  const optimalStarCount = useOptimalStarCount(4000);
  const effectiveStarCount = starCount ?? optimalStarCount;
  
  // Always use the same hook - provide defaults for preset behavior
  const canvasRef = useStarField({ 
    starCount: effectiveStarCount, 
    speed, 
    rollSpeed, 
    opacity, 
    variant 
  });

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        width: '100%',
        height: '100%',
        zIndex: 0,
        ...style,
      }}
    />
  );
};

// Convenience components for common use cases
export const HomepageStarField: React.FC<{ opacity?: number; className?: string }> = ({ 
  opacity = 1.0, 
  className 
}) => (
  <StarField variant="twinkle-compact" opacity={opacity} className={className} />
);

export const BackgroundStarField: React.FC<{ opacity?: number; className?: string }> = ({ 
  opacity = 0.3, 
  className 
}) => (
  <StarField variant="twinkle-minimal" opacity={opacity} className={className} />
); 