import { TwinkleVariant, TwinkleConfig, TWINKLE_CONFIGS } from '@/types/starfield';

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

// Helper function to get variant display info
export const getVariantInfo = (variant: TwinkleVariant) => {
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