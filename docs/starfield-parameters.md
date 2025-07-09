# Starfield Parameters Documentation

This document explains the starfield system parameters, their locations, meanings, and how to modify them.

## Overview

The starfield system creates a layered star effect with two main components:
- **Cluster Stars**: Distant lenticular star cluster forming the background
- **Twinkle Stars**: Closer animated stars in the foreground
- **Center Stars**: Special stars in the cluster center (optional variants)

## Parameter Locations

### 1. Type Definitions (`src/types/starfield.ts`)

All starfield configuration interfaces and constants are defined here:

```typescript
// Available variants
export type ClusterVariant = 
  | 'cluster-ellipse-4x'                    // Base 4:1 ellipse
  | 'cluster-ellipse-4x-center-bright-1'   // + bright center stars
  | 'cluster-ellipse-4x-center-bright-2'   // + bright + larger center stars
  | 'cluster-ellipse-4x-center-close-1'    // + closer center stars
  | 'cluster-ellipse-4x-center-close-2';   // + closer + concentrated center stars

// Configuration structure
export interface ClusterConfig {
  foregroundStars: number;                  // Number of foreground twinkle stars
  clusterStars: number;                     // Number of background cluster stars
  clusterSemiMajorAxis: number;             // Horizontal ellipse radius
  clusterSemiMinorAxis: number;             // Vertical ellipse radius
  clusterDistance: { min: number; max: number }; // Z-distance range
  approachSpeed: number;                    // Forward movement speed
  clusterFocalLength: number;               // Projection focal length
  foregroundFocalLength: number;            // Foreground projection focal length
  
  // Optional center star parameters
  centerStars?: number;                     // Number of center stars
  centerStarDistance?: { min: number; max: number }; // Center star Z-distance
  centerStarIntensityMultiplier?: number;   // Brightness multiplier
  centerStarSizeMultiplier?: number;        // Size multiplier
  centerStarConcentration?: number;         // How concentrated (0-1, lower = tighter)
}
```

### 2. Configuration Values (`src/types/starfield.ts`)

```typescript
export const CLUSTER_CONFIGS: Record<ClusterVariant, ClusterConfig> = {
  'cluster-ellipse-4x': {
    foregroundStars: 0,           // No foreground stars in base config
    clusterStars: 2000,           // 2000 background cluster stars
    clusterSemiMajorAxis: 280000, // Horizontal radius (4 × 70000)
    clusterSemiMinorAxis: 70000,  // Vertical radius (base unit)
    clusterDistance: { min: 300000, max: 3000000 }, // Very distant
    approachSpeed: 50,            // Movement speed
    clusterFocalLength: 300,      // Projection focal length
    foregroundFocalLength: 800,   // Foreground projection
  },
  // ... other variants
};
```

### 3. Usage in Hook (`src/hooks/useClusterStarField.ts`)

The hook consumes these parameters to create star instances:

```typescript
// Get configuration
const config = CLUSTER_CONFIGS[variant];

// Create cluster stars
clusterStarsRef.current = Array.from({ length: config.clusterStars }, () => 
  new ClusterStar3D(width, height, config.clusterSemiMajorAxis, config.clusterSemiMinorAxis, config.clusterDistance)
);

// Create center stars (if configured)
centerStarsRef.current = config.centerStars && config.centerStars > 0
  ? Array.from({ length: config.centerStars }, () => 
      new CenterClusterStar3D(
        width, height, 
        config.clusterSemiMajorAxis, config.clusterSemiMinorAxis, 
        config.centerStarDistance || config.clusterDistance,
        config.centerStarConcentration || 0.3,
        config.centerStarIntensityMultiplier || 1.0,
        config.centerStarSizeMultiplier || 1.0
      )
    )
  : [];
```

### 4. Implementation (`src/lib/starfield/ClusterStar3D.ts`)

The star classes use these parameters to position and render stars:

```typescript
// Elliptical positioning
const effectiveSemiMajorAxis = this.clusterSemiMajorAxis * scaleFactor;
const effectiveSemiMinorAxis = this.clusterSemiMinorAxis * scaleFactor;

// Box-Muller transform for gaussian distribution
const mag = Math.sqrt(-2.0 * Math.log(u1));
const angle = 2.0 * Math.PI * u2;

// Apply elliptical scaling
this.x = mag * Math.cos(angle) * effectiveSemiMajorAxis;
this.y = mag * Math.sin(angle) * effectiveSemiMinorAxis;
```

## Parameter Meanings

### Core Cluster Parameters

| Parameter | Current Value | Meaning |
|-----------|---------------|---------|
| `clusterSemiMajorAxis` | 280000 | Horizontal radius of ellipse (4× base) |
| `clusterSemiMinorAxis` | 70000 | Vertical radius of ellipse (base unit) |
| `clusterStars` | 2000 | Number of background cluster stars |
| `clusterDistance.min` | 300000 | Nearest Z-distance for cluster stars |
| `clusterDistance.max` | 3000000 | Farthest Z-distance for cluster stars |
| `approachSpeed` | 50 | Forward movement speed (units/second) |
| `clusterFocalLength` | 300 | Projection focal length (affects perspective) |

### Center Star Parameters

| Parameter | Meaning | Example Values |
|-----------|---------|----------------|
| `centerStars` | Number of special center stars | 50-80 |
| `centerStarDistance` | Z-distance range for center stars | `{min: 150000, max: 600000}` |
| `centerStarIntensityMultiplier` | Brightness multiplier | 1.0-2.5 |
| `centerStarSizeMultiplier` | Size multiplier | 1.0-1.4 |
| `centerStarConcentration` | How concentrated toward center | 0.2-0.4 (lower = tighter) |

### Scaling and Projection

- **Scale Factor**: `maxDimension / 800` - adapts to screen size
- **Focal Length**: Controls perspective projection (lower = more perspective)
- **Distance**: Controls apparent size and movement speed

## Current Cluster Variants

### Base: `cluster-ellipse-4x`
- **Shape**: 4:1 horizontal ellipse (lenticular)
- **Stars**: 2000 cluster stars only
- **Distance**: 300k-3M units (very distant)

### Center Bright Variants
- **`center-bright-1`**: 60 stars, 2.5× brightness, same distance
- **`center-bright-2`**: 50 stars, 2× brightness, 1.4× size, same distance

### Center Close Variants
- **`center-close-1`**: 70 stars, 2-5× closer (150k-600k units)
- **`center-close-2`**: 80 stars, 2.5-6× closer (120k-500k units), highly concentrated

## How to Modify Parameters

### 1. Change Cluster Shape
To modify the ellipse ratio, edit both axes proportionally:

```typescript
// For 3:1 ratio
clusterSemiMajorAxis: 210000,  // 3 × 70000
clusterSemiMinorAxis: 70000,   // Base unit

// For 6:1 ratio  
clusterSemiMajorAxis: 420000,  // 6 × 70000
clusterSemiMinorAxis: 70000,   // Base unit
```

### 2. Adjust Star Density
```typescript
clusterStars: 3000,  // More stars = denser cluster
```

### 3. Change Distance/Speed
```typescript
clusterDistance: { min: 200000, max: 2000000 },  // Closer cluster
approachSpeed: 75,  // Faster movement
```

### 4. Create New Variants
Add new variants to the `ClusterVariant` type and `CLUSTER_CONFIGS`:

```typescript
export type ClusterVariant = 
  | 'cluster-ellipse-4x'
  | 'cluster-ellipse-6x'  // New 6:1 ratio
  | 'cluster-dense';      // New dense variant

export const CLUSTER_CONFIGS: Record<ClusterVariant, ClusterConfig> = {
  // ... existing configs
  'cluster-ellipse-6x': {
    foregroundStars: 0,
    clusterStars: 2000,
    clusterSemiMajorAxis: 420000,  // 6:1 ratio
    clusterSemiMinorAxis: 70000,
    clusterDistance: { min: 300000, max: 3000000 },
    approachSpeed: 50,
    clusterFocalLength: 300,
    foregroundFocalLength: 800,
  },
};
```

## Visual Effects

### Colors
- **Cluster Stars**: `rgba(200, 220, 255)` - Cool blue (distant hot stars)
- **Center Stars**: `rgba(255, 240, 220)` - Warm white (prominent core)
- **Twinkle Stars**: `rgba(255, 255, 255)` - Pure white (foreground)

### Rendering Order
1. **Cluster Stars** (background, blue tint)
2. **Center Stars** (middle, warm tint)
3. **Twinkle Stars** (foreground, white)

### Size Calculation
```typescript
// Base size depends on distance
const size = Math.max(0.3, Math.min(1.5, (200000 / this.z) * 2));

// Apply multipliers
const finalSize = size * sizeMultiplier;
```

## Testing and Debugging

### View All Variants
- **Storybook**: Individual variant testing
- **Variants Page**: `/variants` - Live comparison of all variants
- **Main Page**: Currently using `cluster-ellipse-4x-center-close-1`

### Performance Considerations
- **Mobile**: Cluster rendering is disabled on mobile devices
- **Star Count**: Higher counts may impact performance
- **Distance**: Closer stars require more frequent updates

## File Structure

```
src/
├── types/starfield.ts              # Type definitions and configs
├── hooks/useClusterStarField.ts    # Main hook consuming configs
├── lib/starfield/
│   ├── ClusterStar3D.ts           # Star positioning logic
│   └── index.ts                   # Exports
└── components/starfield/
    ├── ClusterStarField.tsx       # Component wrapper
    ├── LayeredStarField.tsx       # Layered composition
    └── StarField.stories.tsx      # Storybook stories
```

## Current Usage

The main page uses the layered starfield with center stars:

```typescript
// src/components/starfield/LayeredStarField.tsx
export const HomepageLayeredStarField = () => (
  <LayeredStarField clusterVariant="cluster-ellipse-4x-center-close-1" />
);
```

This creates a lenticular star cluster with 70 center stars positioned 2-5× closer than the background cluster, giving prominence to the cluster core while maintaining the overall elliptical shape. 