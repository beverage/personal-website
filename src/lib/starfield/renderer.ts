import { TwinkleVariant, TwinkleConfig, TWINKLE_CONFIGS, ClusterVariant, ClusterConfig, CLUSTER_CONFIGS, StarFieldVariant } from '@/types/starfield';

export const renderTwinkleStar = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  opacity: number,
  time: number,
  variant: TwinkleVariant
) => {
  const config = TWINKLE_CONFIGS[variant];
  const twinkle = Math.sin(time*0.003)*0.3 + 0.7;
  const colorShift = Math.sin(time * 0.002) * 0.2 + 0.8;
  
  // Calculate final size based on variant
  let finalSize = size * config.sizeMultiplier;
  if (config.isPulsing) {
    finalSize = size * (0.5 + twinkle * 0.3);
  }
  
  // Calculate glow radius
  const glowRadius = finalSize * config.glowMultiplier;
  
  // Create gradient
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
  
  // Apply gradient stops
  config.gradientStops.forEach((stop, index) => {
    const opacityMultiplier = config.gradientOpacities[index];
    if (index === 0) {
      gradient.addColorStop(stop, `rgba(255, ${255 * colorShift}, ${255 * colorShift}, ${opacity * twinkle * opacityMultiplier})`);
    } else if (index === 1) {
      gradient.addColorStop(stop, `rgba(${255 * colorShift}, ${255 * colorShift}, 255, ${opacity * twinkle * opacityMultiplier})`);
    } else if (index === 2) {
      gradient.addColorStop(stop, `rgba(${200 * colorShift}, ${220 * colorShift}, 255, ${opacity * twinkle * opacityMultiplier})`);
    } else {
      gradient.addColorStop(stop, `rgba(150, 180, 255, 0)`);
    }
  });
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
  ctx.fill();
};

// Utility function to get variant configuration
export const getTwinkleConfig = (variant: TwinkleVariant): TwinkleConfig => {
  return TWINKLE_CONFIGS[variant];
};

// Utility function to get cluster configuration
export const getClusterConfig = (variant: ClusterVariant): ClusterConfig => {
  return CLUSTER_CONFIGS[variant];
};

// Helper function to get variant display info
export const getVariantInfo = (variant: StarFieldVariant) => {
  if (variant.startsWith('cluster-')) {
    return getClusterVariantInfo(variant as ClusterVariant);
  }
  return getTwinkleVariantInfo(variant as TwinkleVariant);
};

// Helper function for twinkle variant info
export const getTwinkleVariantInfo = (variant: TwinkleVariant) => {
  const config = TWINKLE_CONFIGS[variant];
  
  const info = {
    'twinkle': {
      title: 'Twinkle Classic (Light)',
      description: 'Original twinkling with 3x glow radius',
      isWinner: false,
    },
    'twinkle-compact': {
      title: 'Twinkle Compact',
      description: 'Normal size with 1.5x glow radius',
      isWinner: true,
    },
    'twinkle-minimal': {
      title: 'Twinkle Minimal',
      description: '40% base size with 1.2x glow radius',
      isWinner: false,
    },
  };
  
  return {
    ...info[variant],
    config,
  };
};

// Helper function for cluster variant info
export const getClusterVariantInfo = (variant: ClusterVariant) => {
  const config = CLUSTER_CONFIGS[variant];
  
  const info = {
    'cluster-ellipse-4x': {
      title: 'Elliptical 4× (WINNER)',
      description: 'Horizontal ellipse with 4:1 ratio (a=4r, b=r) - Lenticular star cluster',
      isWinner: true,
    },
    'cluster-ellipse-4x-center-bright-1': {
      title: 'Elliptical 4× + Bright Center 1',
      description: 'Lenticular cluster with 60 bright center stars (2.5x intensity)',
      isWinner: false,
    },
    'cluster-ellipse-4x-center-bright-2': {
      title: 'Elliptical 4× + Bright Center 2',
      description: 'Lenticular cluster with 50 bright + larger center stars (2x intensity, 1.4x size)',
      isWinner: false,
    },
    'cluster-ellipse-4x-center-close-1': {
      title: 'Elliptical 4× + Close Center 1',
      description: 'Lenticular cluster with 70 closer center stars (2-5x closer)',
      isWinner: false,
    },
    'cluster-ellipse-4x-center-close-2': {
      title: 'Elliptical 4× + Close Center 2',
      description: 'Lenticular cluster with 80 closer + concentrated center stars (2.5-6x closer)',
      isWinner: false,
    },
  };
  
  return {
    ...info[variant],
    config,
  };
}; 