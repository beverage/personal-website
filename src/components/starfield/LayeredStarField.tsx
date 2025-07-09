import React from 'react';
import { StarField } from './StarField';
import { ClusterStarField } from './ClusterStarField';
import { ClusterVariant } from '@/types/starfield';

interface LayeredStarFieldProps {
  clusterVariant: ClusterVariant;
  opacity?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LayeredStarField: React.FC<LayeredStarFieldProps> = ({
  clusterVariant,
  opacity = 1.0,
  className = '',
  style,
}) => {
  return (
    <div 
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{
        width: '100%',
        height: '100%',
        zIndex: 0,
        ...style,
      }}
    >
      {/* Background layer: Cluster starfield (transparent canvas) */}
      <ClusterStarField 
        variant={clusterVariant}
        opacity={opacity}
        className="absolute inset-0"
      />
      
      {/* Foreground layer: Twinkle starfield (transparent canvas) */}
      <StarField 
        variant="twinkle-compact"
        opacity={opacity}
        className="absolute inset-0"
      />
    </div>
  );
};

// Convenience component for homepage
export const HomepageLayeredStarField: React.FC<{ opacity?: number; className?: string }> = ({ 
  opacity = 1.0, 
  className 
}) => (
  <LayeredStarField 
    clusterVariant="cluster-ellipse-2x-light" 
    opacity={opacity} 
    className={className} 
  />
); 