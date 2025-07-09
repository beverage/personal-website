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
  const twinkle = Math.sin(time * 0.003 + x * 0.01 + y * 0.01) * 0.3 + 0.7;
  const colorShift = Math.sin(time * 0.002 + x * 0.005) * 0.2 + 0.8;
  
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
      title: 'Twinkle Classic',
      description: 'Original twinkling with 3x glow radius',
      isWinner: false,
    },
    'twinkle-small': {
      title: 'Twinkle Small',
      description: '60% base size with 2x glow radius',
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
    'twinkle-pulse': {
      title: 'Twinkle Pulse',
      description: 'Variable size with breathing effect',
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
    'cluster-classic': {
      title: 'Central Cluster Classic',
      description: 'Star Trek II approach effect with distant cluster',
      isWinner: false,
    },
    'cluster-dense': {
      title: 'Central Cluster Dense',
      description: 'Denser cluster core with more cluster stars',
      isWinner: false,
    },
    'cluster-wide': {
      title: 'Central Cluster Wide',
      description: 'Wider cluster spread for broader effect',
      isWinner: false,
    },
    'cluster-fast': {
      title: 'Central Cluster Fast',
      description: 'Faster approach speed for dramatic effect',
      isWinner: true,
    },
    'cluster-ellipse-control': {
      title: 'Elliptical Control',
      description: 'Circle with doubled radius (r = 2 × original)',
      isWinner: false,
    },
    'cluster-ellipse-2x': {
      title: 'Elliptical 2×',
      description: 'Horizontal ellipse with 2:1 ratio (a=2r, b=r)',
      isWinner: false,
    },
    'cluster-ellipse-3x': {
      title: 'Elliptical 3×',
      description: 'Horizontal ellipse with 3:1 ratio (a=3r, b=r)',
      isWinner: false,
    },
    'cluster-ellipse-4x': {
      title: 'Elliptical 4×',
      description: 'Horizontal ellipse with 4:1 ratio (a=4r, b=r)',
      isWinner: false,
    },
    'cluster-ellipse-2x-light': {
      title: 'Elliptical 2× Light',
      description: 'Horizontal ellipse 2:1 ratio with light boost (1.5x size, 1.2x intensity)',
      isWinner: false,
    },
    'cluster-ellipse-2x-medium': {
      title: 'Elliptical 2× Medium',
      description: 'Horizontal ellipse 2:1 ratio with medium boost (2x size, 1.5x intensity)',
      isWinner: false,
    },
    'cluster-ellipse-3x-light': {
      title: 'Elliptical 3× Light',
      description: 'Horizontal ellipse 3:1 ratio with light boost (1.5x size, 1.2x intensity)',
      isWinner: false,
    },
    'cluster-ellipse-3x-medium': {
      title: 'Elliptical 3× Medium',
      description: 'Horizontal ellipse 3:1 ratio with medium boost (2x size, 1.5x intensity)',
      isWinner: false,
    },
  };
  
  return {
    ...info[variant],
    config,
  };
}; 