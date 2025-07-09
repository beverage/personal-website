export type TwinkleVariant = 
  | 'twinkle'         // Original - 3x glow radius
  | 'twinkle-small'   // 60% size, 2x glow
  | 'twinkle-compact' // Normal size, 1.5x glow (winner)
  | 'twinkle-minimal' // 40% size, 1.2x glow
  | 'twinkle-pulse';

export type ClusterVariant = 
  | 'cluster-classic'  // Base configuration (1500 foreground + 800 cluster)
  | 'cluster-dense'    // More cluster stars for denser core effect
  | 'cluster-wide'     // Wider cluster spread
  | 'cluster-fast'     // Faster approach speed for dramatic effect
  | 'cluster-ellipse-control'  // Circle with doubled radius (r = 2 * original)
  | 'cluster-ellipse-2x'       // Ellipse a=2r, b=r (2:1 ratio)
  | 'cluster-ellipse-3x'       // Ellipse a=3r, b=r (3:1 ratio)
  | 'cluster-ellipse-4x';      // Ellipse a=4r, b=r (4:1 ratio)

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

export const CLUSTER_CONFIGS: Record<ClusterVariant, ClusterConfig> = {
  'cluster-classic': {
    foregroundStars: 1500,
    clusterStars: 800,
    clusterSemiMajorAxis: 30000,
    clusterSemiMinorAxis: 30000,
    clusterDistance: { min: 500000, max: 5000000 },
    approachSpeed: 25,
    clusterFocalLength: 400,
    foregroundFocalLength: 800,
  },
  'cluster-dense': {
    foregroundStars: 1200,
    clusterStars: 1500,
    clusterSemiMajorAxis: 25000,
    clusterSemiMinorAxis: 25000,
    clusterDistance: { min: 400000, max: 4000000 },
    approachSpeed: 30,
    clusterFocalLength: 350,
    foregroundFocalLength: 800,
  },
  'cluster-wide': {
    foregroundStars: 1800,
    clusterStars: 600,
    clusterSemiMajorAxis: 50000,
    clusterSemiMinorAxis: 50000,
    clusterDistance: { min: 600000, max: 6000000 },
    approachSpeed: 20,
    clusterFocalLength: 450,
    foregroundFocalLength: 800,
  },
  'cluster-fast': {
    foregroundStars: 1000,
    clusterStars: 1000,
    clusterSemiMajorAxis: 35000,
    clusterSemiMinorAxis: 35000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
  // New elliptical variants based on cluster-fast with doubled radius
  'cluster-ellipse-control': {
    foregroundStars: 1000,
    clusterStars: 1000,
    clusterSemiMajorAxis: 70000,  // r = 2 * 35000 (doubled from cluster-fast)
    clusterSemiMinorAxis: 70000,  // Circle - same radius
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
  'cluster-ellipse-2x': {
    foregroundStars: 1000,
    clusterStars: 1000,
    clusterSemiMajorAxis: 140000, // a = 2r = 2 * 70000
    clusterSemiMinorAxis: 70000,  // b = r = 70000
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
  'cluster-ellipse-3x': {
    foregroundStars: 1000,
    clusterStars: 1000,
    clusterSemiMajorAxis: 210000, // a = 3r = 3 * 70000
    clusterSemiMinorAxis: 70000,  // b = r = 70000
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
  'cluster-ellipse-4x': {
    foregroundStars: 1000,
    clusterStars: 1000,
    clusterSemiMajorAxis: 280000, // a = 4r = 4 * 70000
    clusterSemiMinorAxis: 70000,  // b = r = 70000
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
}; 