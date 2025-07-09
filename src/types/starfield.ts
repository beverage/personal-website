export type TwinkleVariant = 
  | 'twinkle'         // Original - 3x glow radius (light)
  | 'twinkle-compact' // Normal size, 1.5x glow (winner)
  | 'twinkle-minimal'; // 40% size, 1.2x glow

export type ClusterVariant = 
  | 'cluster-ellipse-4x';       // Ellipse a=4r, b=r (4:1 ratio) - WINNER

export type StarFieldVariant = TwinkleVariant | ClusterVariant;

export interface StarFieldConfig {
  starCount: number;
  speed: number;
  rollSpeed: number;
  opacity: number;
  variant: StarFieldVariant;
}

export interface TwinkleConfig {
  sizeMultiplier: number;
  glowMultiplier: number;
  gradientStops: number[];
  gradientOpacities: number[];
  isPulsing: boolean;
}

export interface ClusterConfig {
  foregroundStars: number;
  clusterStars: number;
  clusterSemiMajorAxis: number;  // 'a' - horizontal radius
  clusterSemiMinorAxis: number;  // 'b' - vertical radius
  clusterDistance: { min: number; max: number };
  approachSpeed: number;
  clusterFocalLength: number;
  foregroundFocalLength: number;
  clusterSizeMultiplier?: number;      // Multiplier for cluster star size
  clusterIntensityMultiplier?: number; // Multiplier for cluster star intensity
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
};

export const CLUSTER_CONFIGS: Record<ClusterVariant, ClusterConfig> = {
  'cluster-ellipse-4x': {
    foregroundStars: 0,           // No foreground stars - overlay will handle this
    clusterStars: 2000,           // All stars in the elliptical cluster
    clusterSemiMajorAxis: 280000, // a = 4r = 4 * 70000
    clusterSemiMinorAxis: 70000,  // b = r = 70000
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
}; 