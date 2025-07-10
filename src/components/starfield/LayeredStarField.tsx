import React from 'react';
import { StarField } from './StarField';
import { ClusterStarField } from './ClusterStarField';
import { ClusterVariant } from '@/types/starfield';

interface LayeredStarFieldProps {
  clusterVariant: ClusterVariant;
  stardustVariant?: 'halo' | 'sparkle' | 'bloom' | 'nebula';
  opacity?: number;
  showCluster?: boolean;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const LayeredStarField: React.FC<LayeredStarFieldProps> = ({
  clusterVariant,
  stardustVariant,
  opacity = 1.0,
  showCluster = true,
  speed = 1000,
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
        stardustVariant={stardustVariant}
        opacity={opacity}
        className={`absolute inset-0 transition-opacity ease-in-out ${
          showCluster ? 'duration-3000 opacity-100' : 'duration-1250 opacity-0'
        }`}
        style={{ zIndex: 1 }}
      />
      
      {/* Foreground layer: Twinkle starfield (transparent canvas) */}
      <StarField 
        variant="twinkle-compact"
        opacity={opacity}
        speed={speed}
        className="absolute inset-0"
      />
    </div>
  );
};

// Convenience component for homepage
export interface HomepageLayeredStarFieldProps {
  opacity?: number;
  className?: string;
  showCluster?: boolean;
  speed?: number;
}
export const HomepageLayeredStarField: React.FC<HomepageLayeredStarFieldProps> = ({ 
  opacity = 1.0, 
  className,
  showCluster = true,
  speed,
}) => (
  <LayeredStarField 
    clusterVariant="cluster-ellipse-4x-center-close-1" 
    opacity={opacity} 
    showCluster={showCluster}
    speed={speed}
    className={className} 
  />
); 