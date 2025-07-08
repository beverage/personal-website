export type TwinkleVariant = 
  | 'twinkle'         // Original - 3x glow radius
  | 'twinkle-small'   // 60% size, 2x glow
  | 'twinkle-compact' // Normal size, 1.5x glow (winner)
  | 'twinkle-minimal' // 40% size, 1.2x glow
  | 'twinkle-pulse';  // Variable size with breathing

export interface StarFieldConfig {
  starCount: number;
  speed: number;
  rollSpeed: number;
  opacity: number;
  variant: TwinkleVariant;
}

export interface TwinkleConfig {
  sizeMultiplier: number;
  glowMultiplier: number;
  gradientStops: number[];
  gradientOpacities: number[];
  isPulsing: boolean;
}

export interface StarProjection {
  x: number;
  y: number;
  size: number;
  opacity: number;
  visible: boolean;
}

export const TWINKLE_CONFIGS: Record<TwinkleVariant, TwinkleConfig> = {
  'twinkle': {
    sizeMultiplier: 1.0,
    glowMultiplier: 3.0,
    gradientStops: [0, 0.3, 0.6, 1],
    gradientOpacities: [1.0, 0.6, 0.3, 0],
    isPulsing: false,
  },
  'twinkle-small': {
    sizeMultiplier: 0.6,
    glowMultiplier: 2.0,
    gradientStops: [0, 0.3, 0.6, 1],
    gradientOpacities: [1.0, 0.6, 0.3, 0],
    isPulsing: false,
  },
  'twinkle-compact': {
    sizeMultiplier: 1.0,
    glowMultiplier: 1.5,
    gradientStops: [0, 0.4, 0.8, 1],
    gradientOpacities: [1.0, 0.7, 0.2, 0],
    isPulsing: false,
  },
  'twinkle-minimal': {
    sizeMultiplier: 0.4,
    glowMultiplier: 1.2,
    gradientStops: [0, 0.5, 1],
    gradientOpacities: [1.0, 0.5, 0],
    isPulsing: false,
  },
  'twinkle-pulse': {
    sizeMultiplier: 1.0, // Will be modified dynamically
    glowMultiplier: 2.0,
    gradientStops: [0, 0.3, 0.6, 1],
    gradientOpacities: [1.0, 0.6, 0.3, 0],
    isPulsing: true,
  },
}; 