'use client';

import { useMemo, useState } from 'react';
import { LayeredStarField } from '@/components/starfield/LayeredStarField';
import { ClusterVariant } from '@/types/starfield';
import { FileDown, FileText, Github, Linkedin, Instagram, Mail } from 'lucide-react';
import { BrandPanel } from '@/components/ui/BrandPanel';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { HeroSection } from '@/components/ui/HeroSection';
import { FooterPanel } from '@/components/ui/FooterPanel';

type UiVariant = 'hero-middle' | 'footer-icon' | 'float-pill';

interface SocialLink {
  icon: 'github' | 'linkedin' | 'instagram' | 'mail';
  href: string;
  label: string;
}

interface ClientConfig {
  socialLinks: SocialLink[];
  copyrightYear: number;
}

interface VariantsClientProps {
  cvUrl?: string;
  clientConfig?: ClientConfig;
}

const backgroundVariants: { name: string; variant: ClusterVariant; description: string }[] = [
  { name: 'Original', variant: 'cluster-ellipse-4x', description: 'Base lenticular star cluster (4:1 ellipse ratio)' },
  { name: 'Bright Center 1', variant: 'cluster-ellipse-4x-center-bright-1', description: '60 center stars with 2.5x brightness at same distance' },
  { name: 'Bright Center 2', variant: 'cluster-ellipse-4x-center-bright-2', description: '50 center stars with 2x brightness + 1.4x size at same distance' },
  { name: 'Close Center 1', variant: 'cluster-ellipse-4x-center-close-1', description: '70 normal center stars at 2-5x closer distance' },
  { name: 'Close Center 2', variant: 'cluster-ellipse-4x-center-close-2', description: '80 normal center stars at 2.5-6x closer distance + more concentrated' },
];

const uiVariants: { key: UiVariant; name: string; description: string }[] = [
  { key: 'hero-middle', name: 'Hero Middle Button', description: 'Add CV as the middle button in the hero row (outlined style)' },
  { key: 'footer-icon', name: 'Footer Icon', description: 'Add CV icon link in footer (opens in new tab)' },
  { key: 'float-pill', name: 'Floating Pill', description: 'Top-right floating “CV” pill with icon' },
];

export function VariantsClient({ cvUrl, clientConfig }: VariantsClientProps) {
  const [selectedBackground, setSelectedBackground] = useState<ClusterVariant>('cluster-ellipse-4x-center-close-1');
  const [opacity, setOpacity] = useState(1.0);
  const [uiVisible, setUiVisible] = useState(true);
  const [selectedUi, setSelectedUi] = useState<UiVariant>('float-pill');
  const [qcPos, setQcPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  const backgroundDescription = useMemo(
    () => backgroundVariants.find(v => v.variant === selectedBackground)?.description,
    [selectedBackground]
  );

  const openCv = () => {
    if (!cvUrl) return;
    window.open(cvUrl, '_blank', 'noopener,noreferrer');
  };

  // Initialize Quick Compare position after mount
  if (typeof window !== 'undefined' && qcPos === null) {
    const initialX = Math.max(20, window.innerWidth - 380);
    const initialY = Math.max(20, window.innerHeight - 240);
    setQcPos({ x: initialX, y: initialY });
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: 'white', fontFamily: 'system-ui, sans-serif', position: 'relative', overflow: 'hidden' }}>
      {/* Controls - left */}
      <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 8, border: '1px solid #333', width: 360 }}>
        <h2 style={{ margin: '0 0 15px 0', fontSize: 18 }}>Variants</h2>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Background:</label>
          <select value={selectedBackground} onChange={(e) => setSelectedBackground(e.target.value as ClusterVariant)} style={{ width: '100%', padding: 8, background: '#222', border: '1px solid #444', borderRadius: 4, color: 'white' }}>
            {backgroundVariants.map((v) => (
              <option key={v.variant} value={v.variant}>{v.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>UI:</label>
          <select value={selectedUi} onChange={(e) => setSelectedUi(e.target.value as UiVariant)} style={{ width: '100%', padding: 8, background: '#222', border: '1px solid #444', borderRadius: 4, color: 'white' }}>
            {uiVariants.map((u) => (
              <option key={u.key} value={u.key}>{u.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'block', marginBottom: 5, fontSize: 14 }}>Cluster Opacity: {opacity.toFixed(1)}</label>
          <input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={uiVisible} onChange={(e) => setUiVisible(e.target.checked)} />
            UI Visibility
          </label>
        </div>

        <div style={{ fontSize: 12, color: '#ccc' }}>{backgroundDescription}</div>
      </div>

      {/* Quick selections - draggable */}
      <div
        style={{ position: 'fixed', left: qcPos?.x ?? 20, top: qcPos?.y ?? 20, zIndex: 1000, background: 'rgba(0,0,0,0.8)', padding: 15, borderRadius: 8, border: '1px solid #333', display: 'inline-block', cursor: isDragging ? 'grabbing' : 'default' }}
        onPointerMove={(e) => {
          if (!isDragging) return;
          const x = e.clientX - dragOffset.dx;
          const y = e.clientY - dragOffset.dy;
          const panel = e.currentTarget as HTMLElement;
          const width = panel.offsetWidth || 360;
          const height = panel.offsetHeight || 140;
          setQcPos({ x: Math.max(8, Math.min(x, (window.innerWidth - width - 8))), y: Math.max(8, Math.min(y, (window.innerHeight - height - 8))) });
        }}
        onPointerUp={() => setIsDragging(false)}
        onPointerCancel={() => setIsDragging(false)}
      >
        <div
          style={{ margin: '0 0 8px 0', fontSize: 13, color: 'rgba(255,255,255,0.8)', cursor: 'grab' }}
          onPointerDown={(e) => {
            setIsDragging(true);
            const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
            setDragOffset({ dx: e.clientX - rect.left, dy: e.clientY - rect.top });
          }}
        >
          Backgrounds
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, max-content))', gap: 8, marginBottom: 10 }}>
          {backgroundVariants.map((v) => (
            <button key={v.variant} onClick={() => setSelectedBackground(v.variant)} style={{ padding: '8px 12px', background: selectedBackground === v.variant ? '#111827' : '#222', border: selectedBackground === v.variant ? '1px solid rgba(34,211,238,0.85)' : '1px solid #333', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 12 }}>
              {v.name}
            </button>
          ))}
        </div>
        <div style={{ height: 1, background: 'rgba(34,211,238,0.6)', margin: '6px 0 10px 0' }} />
        <div style={{ margin: '0 0 6px 0', fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>UI</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 8 }}>
          {uiVariants.map((u) => (
            <button key={u.key} onClick={() => setSelectedUi(u.key)} style={{ padding: '8px 12px', background: selectedUi === u.key ? '#111827' : '#222', border: selectedUi === u.key ? '1px solid rgba(34,211,238,0.85)' : '1px solid #333', borderRadius: 6, color: 'white', cursor: 'pointer', fontSize: 12 }}>
              {u.name}
            </button>
          ))}
        </div>
      </div>

      {/* Background */}
      <LayeredStarField clusterVariant={selectedBackground} opacity={opacity} />

      {/* Full UI skeleton */}
      {uiVisible && (
        <>
          {/* Brand panel */}
          <div className="absolute top-8 left-8 z-50">
            <BrandPanel brandName="beverage.me" />
          </div>

          {/* Control panel + optional floating pill aligned horizontally */}
          <div className="absolute top-8 right-8 z-50 flex items-center gap-3">
            {selectedUi === 'float-pill' && (
              <button onClick={openCv} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-400/70 bg-black/40 text-cyan-300 hover:text-cyan-200">
                <FileText size={16} />
                <span>CV</span>
              </button>
            )}
            <ControlPanel darkMode={true} onToggle={() => {}} />
          </div>

          {/* Hero section (default) */}
          {selectedUi !== 'hero-middle' && (
            <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
              <HeroSection title="Alex Beverage" description="Under Construction" />
            </div>
          )}

          {/* Footer */}
          {selectedUi !== 'footer-icon' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
              <FooterPanel year={clientConfig?.copyrightYear} socialLinks={clientConfig?.socialLinks} />
            </div>
          )}
        </>
      )}

      {/* UI overlays */}
      {uiVisible && (
        <>
          {/* Variant A: Hero middle button (mock hero row) */}
          {selectedUi === 'hero-middle' && (
            <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
              <div className="text-center max-w-5xl">
                <div className="p-12 mb-8">
                  <h1 className="text-6xl sm:text-8xl font-exo2 mb-6 tracking-wider">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500">Alex Beverage</span>
                  </h1>
                  <p className="text-xl sm:text-2xl font-exo2 text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">Under Construction</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button className="px-8 py-4 border border-cyan-400 text-cyan-300 rounded-lg transition-all font-exo2 hover:bg-cyan-400/10">Explore Projects</button>
                    <button onClick={openCv} className="px-8 py-4 border border-cyan-400 text-cyan-300 rounded-lg transition-all font-exo2 hover:bg-cyan-400/10">CV</button>
                    <button className="px-8 py-4 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-all font-exo2 shadow-lg shadow-cyan-500/40 hover:shadow-cyan-400/50">Get In Touch</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variant B: Footer icon — custom footer with inline CV icon */}
          {selectedUi === 'footer-icon' && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
                <div className="flex items-center space-x-6">
                  <div className="text-white/60 text-sm">© {clientConfig?.copyrightYear ?? new Date().getFullYear()}</div>
                  <div className="flex items-center space-x-4">
                    {(clientConfig?.socialLinks ?? []).map((link, idx) => {
                      const iconMap: Record<string, React.ComponentType<{ size?: number }>> = { github: Github, linkedin: Linkedin, instagram: Instagram, mail: Mail };
                      const Icon = iconMap[link.icon];
                      return (
                        <a key={idx} href={link.href} className="text-white/60 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                          {Icon ? <Icon size={18} /> : <span className="inline-block w-1.5 h-1.5 bg-white/60 rounded-full" />}
                        </a>
                      );
                    })}
                    <button onClick={openCv} aria-label="Download CV (PDF)" className="text-white/60 hover:text-white transition-colors">
                      <FileDown size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Variant C: Top-right floating pill handled in ControlPanel row above */}
        </>
      )}
    </div>
  );
}


