export type TwinkleVariant = 
  | 'twinkle'         // Original - 3x glow radius (light)
  | 'twinkle-compact' // Normal size, 1.5x glow (winner)
  | 'twinkle-minimal'; // 40% size, 1.2x glow

export type ClusterVariant = 
  | 'cluster-ellipse-4x'       // Ellipse a=4r, b=r (4:1 ratio) - WINNER
  | 'cluster-ellipse-4x-center-bright-1'    // Variant 1: Special bright center stars
  | 'cluster-ellipse-4x-center-bright-2'    // Variant 2: Special bright + larger center stars
  | 'cluster-ellipse-4x-center-close-1'     // Variant 3: Normal stars but closer
  | 'cluster-ellipse-4x-center-close-2';    // Variant 4: Normal stars closer + more concentrated

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
  // Center star configuration
  centerStars?: number;                // Number of special center stars
  centerStarDistance?: { min: number; max: number }; // Distance range for center stars
  centerStarIntensityMultiplier?: number; // Brightness multiplier for center stars
  centerStarSizeMultiplier?: number;   // Size multiplier for center stars
  centerStarConcentration?: number;    // How concentrated toward center (0-1, lower = more concentrated)
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
  // Variant 1: Special bright center stars
  'cluster-ellipse-4x-center-bright-1': {
    foregroundStars: 0,
    clusterStars: 2000,
    clusterSemiMajorAxis: 280000,
    clusterSemiMinorAxis: 70000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
    centerStars: 60,
    centerStarDistance: { min: 300000, max: 3000000 }, // Same distance as regular stars
    centerStarIntensityMultiplier: 2.5, // 2.5x brighter
    centerStarSizeMultiplier: 1.0, // Same size, just brighter
    centerStarConcentration: 0.3, // More concentrated toward center
  },
  // Variant 2: Special bright + larger center stars
  'cluster-ellipse-4x-center-bright-2': {
    foregroundStars: 0,
    clusterStars: 2000,
    clusterSemiMajorAxis: 280000,
    clusterSemiMinorAxis: 70000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
    centerStars: 50,
    centerStarDistance: { min: 300000, max: 3000000 }, // Same distance as regular stars
    centerStarIntensityMultiplier: 2.0, // 2x brighter
    centerStarSizeMultiplier: 1.4, // 1.4x larger
    centerStarConcentration: 0.25, // Even more concentrated toward center
  },
  // Variant 3: Normal stars but closer <---- we are using this one
  'cluster-ellipse-4x-center-close-1': {
    foregroundStars: 0,
    clusterStars: 2000,
    clusterSemiMajorAxis: 400000,
    clusterSemiMinorAxis: 80000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
    centerStars: 200,
    centerStarDistance: { min: 150000, max: 600000 }, // 2-5x closer than regular stars
    centerStarIntensityMultiplier: 1.0, // Normal intensity
    centerStarSizeMultiplier: 1.0, // Normal size, just closer
    centerStarConcentration: 0.4, // Moderately concentrated toward center
  },
  // Variant 4: Normal stars closer + more concentrated
  'cluster-ellipse-4x-center-close-2': {
    foregroundStars: 0,
    clusterStars: 2000,
    clusterSemiMajorAxis: 280000,
    clusterSemiMinorAxis: 70000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
    centerStars: 80,
    centerStarDistance: { min: 120000, max: 500000 }, // 2.5-6x closer than regular stars
    centerStarIntensityMultiplier: 1.0, // Normal intensity
    centerStarSizeMultiplier: 1.0, // Normal size, just closer
    centerStarConcentration: 0.2, // Highly concentrated toward center
  },
}; 