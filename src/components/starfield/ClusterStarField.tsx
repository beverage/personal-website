import React from 'react';
import { useClusterStarField } from '@/hooks/useClusterStarField';
import { ClusterVariant } from '@/types/starfield';

interface ClusterStarFieldProps {
  variant?: ClusterVariant;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ClusterStarField: React.FC<ClusterStarFieldProps> = ({
  variant = 'cluster-classic',
  opacity = 1.0,
  className = '',
  style,
}) => {
  const canvasRef = useClusterStarField({ variant, opacity });

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

// Convenience component for the classic Star Trek II approach effect
export const StarTrekClusterField: React.FC<{ opacity?: number; className?: string }> = ({ 
  opacity = 1.0, 
  className 
}) => (
  <ClusterStarField variant="cluster-classic" opacity={opacity} className={className} />
); 