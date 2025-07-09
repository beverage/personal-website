'use client';

import { useState } from 'react';
import { LayeredStarField } from '@/components/starfield/LayeredStarField';
import { ClusterVariant } from '@/types/starfield';

const variants: { name: string; variant: ClusterVariant; description: string }[] = [
  {
    name: 'Original',
    variant: 'cluster-ellipse-4x',
    description: 'Base lenticular star cluster (4:1 ellipse ratio)',
  },
  {
    name: 'Bright Center 1',
    variant: 'cluster-ellipse-4x-center-bright-1',
    description: '60 center stars with 2.5x brightness at same distance',
  },
  {
    name: 'Bright Center 2',
    variant: 'cluster-ellipse-4x-center-bright-2',
    description: '50 center stars with 2x brightness + 1.4x size at same distance',
  },
  {
    name: 'Close Center 1',
    variant: 'cluster-ellipse-4x-center-close-1',
    description: '70 normal center stars at 2-5x closer distance',
  },
  {
    name: 'Close Center 2',
    variant: 'cluster-ellipse-4x-center-close-2',
    description: '80 normal center stars at 2.5-6x closer distance + more concentrated',
  },
];

export default function VariantsPage() {
  const [selectedVariant, setSelectedVariant] = useState<ClusterVariant>('cluster-ellipse-4x');
  const [opacity, setOpacity] = useState(1.0);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      color: 'white',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Controls */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #333',
        maxWidth: '400px'
      }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
          Lenticular Star Cluster Variants
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Variant:
          </label>
          <select
            value={selectedVariant}
            onChange={(e) => setSelectedVariant(e.target.value as ClusterVariant)}
            style={{
              width: '100%',
              padding: '8px',
              background: '#222',
              border: '1px solid #444',
              borderRadius: '4px',
              color: 'white',
            }}
          >
            {variants.map((variant) => (
              <option key={variant.variant} value={variant.variant}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>
            Opacity: {opacity.toFixed(1)}
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ fontSize: '12px', color: '#ccc' }}>
          {variants.find(v => v.variant === selectedVariant)?.description}
        </div>
      </div>

      {/* Star field */}
      <LayeredStarField clusterVariant={selectedVariant} opacity={opacity} />
      
      {/* Comparison grid */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        border: '1px solid #333',
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Quick Compare</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
          {variants.map((variant) => (
            <button
              key={variant.variant}
              onClick={() => setSelectedVariant(variant.variant)}
              style={{
                padding: '8px 12px',
                background: selectedVariant === variant.variant ? '#444' : '#222',
                border: selectedVariant === variant.variant ? '1px solid #666' : '1px solid #333',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}