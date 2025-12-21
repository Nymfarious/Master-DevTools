// UI Tokens Panel - Color swatches, typography, and component specimens
// Lines: ~195 | Status: GREEN
import { useState } from 'react';
import { Palette, Type, Layers, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusLight } from '@/components/ui/StatusLight';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ColorSwatch {
  name: string;
  variable: string;
  hex: string;
}

const BACKGROUND_COLORS: ColorSwatch[] = [
  { name: 'Background', variable: '--background', hex: '#0a0e14' },
  { name: 'Surface', variable: '--card', hex: '#0d1117' },
  { name: 'Elevated', variable: '--secondary', hex: '#161b22' },
  { name: 'Border', variable: '--border', hex: '#21262d' },
  { name: 'Muted', variable: '--muted', hex: '#484f58' },
];

const SIGNAL_COLORS: ColorSwatch[] = [
  { name: 'Green', variable: '--signal-green', hex: '#3fb950' },
  { name: 'Amber', variable: '--signal-amber', hex: '#d29922' },
  { name: 'Red', variable: '--signal-red', hex: '#f85149' },
  { name: 'Blue', variable: '--signal-blue', hex: '#58a6ff' },
  { name: 'Purple', variable: '--signal-purple', hex: '#a371f7' },
  { name: 'Cyan', variable: '--signal-cyan', hex: '#39c5cf' },
];

function ColorSwatchCard({ swatch }: { swatch: ColorSwatch }) {
  const [copied, setCopied] = useState(false);
  
  const copyHex = async () => {
    await navigator.clipboard.writeText(swatch.hex);
    setCopied(true);
    toast.success(`Copied ${swatch.hex} to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copyHex}
      className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div 
        className="w-12 h-12 rounded-lg border border-border/50 shadow-lg transition-transform group-hover:scale-105"
        style={{ backgroundColor: swatch.hex }}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{swatch.name}</p>
        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
          {swatch.hex}
          {copied ? (
            <Check className="w-3 h-3 text-signal-green" />
          ) : (
            <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </p>
      </div>
    </button>
  );
}

export function UITokensPanel() {
  return (
    <div className="space-y-8 boot-sequence">
      {/* Color System */}
      <section className="space-y-4">
        <h2 className="section-header text-lg">
          <Palette className="w-4 h-4" />
          Color System
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Backgrounds</h3>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_COLORS.map(swatch => (
                <ColorSwatchCard key={swatch.variable} swatch={swatch} />
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Signals</h3>
            <div className="flex flex-wrap gap-2">
              {SIGNAL_COLORS.map(swatch => (
                <ColorSwatchCard key={swatch.variable} swatch={swatch} />
              ))}
            </div>
          </div>
        </div>
      </section>
      
      {/* Typography */}
      <section className="space-y-4">
        <h2 className="section-header text-lg">
          <Type className="w-4 h-4" />
          Typography
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Display / Space Grotesk
            </h3>
            <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-4xl font-bold">MISSION CONTROL</span>
                <span className="text-xs text-muted-foreground font-mono">48px Bold</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-2xl font-semibold">System Status</span>
                <span className="text-xs text-muted-foreground font-mono">32px Semi</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-display text-xl font-medium">Panel Header</span>
                <span className="text-xs text-muted-foreground font-mono">24px Medium</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Monospace / JetBrains Mono
            </h3>
            <div className="space-y-3 bg-secondary/30 p-4 rounded-lg font-mono">
              <div className="flex items-baseline justify-between">
                <span className="text-base text-signal-green">const status = "nominal";</span>
                <span className="text-xs text-muted-foreground">16px Code</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">14:32:07 - Event logged</span>
                <span className="text-xs text-muted-foreground">14px Data</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Response: 234ms</span>
                <span className="text-xs text-muted-foreground">12px Small</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Components */}
      <section className="space-y-4">
        <h2 className="section-header text-lg">
          <Layers className="w-4 h-4" />
          Components
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Status Lights</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <StatusLight status="healthy" size="lg" />
                <span className="text-sm">Healthy</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusLight status="degraded" size="lg" />
                <span className="text-sm">Warning</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusLight status="down" size="lg" pulse />
                <span className="text-sm">Error</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusLight status="unknown" size="lg" />
                <span className="text-sm">Offline</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Badges</h3>
            <div className="flex items-center gap-2">
              <span className="badge bg-signal-blue/20 text-signal-blue">INFO</span>
              <span className="badge bg-signal-amber/20 text-signal-amber">WARN</span>
              <span className="badge bg-signal-red/20 text-signal-red">ERROR</span>
              <span className="badge bg-signal-green/20 text-signal-green">SUCCESS</span>
              <span className="badge badge--muted">MUTED</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Buttons</h3>
            <div className="flex items-center gap-2">
              <Button size="sm">Primary</Button>
              <Button size="sm" variant="secondary">Secondary</Button>
              <Button size="sm" variant="destructive">Destructive</Button>
              <Button size="sm" variant="outline">Outline</Button>
              <Button size="sm" variant="ghost">Ghost</Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Theme Toggle (placeholder) */}
      <section className="space-y-4">
        <h2 className="section-header text-lg">Theme</h2>
        <div className="terminal-glass p-4 rounded-lg">
          <p className="text-sm text-muted-foreground mb-3">Current: Mission Control (Dark)</p>
          <div className="space-y-2">
            {[
              { name: 'Mission Control (Dark)', active: true },
              { name: 'Phosphor Green', active: false },
              { name: 'Amber Terminal', active: false },
              { name: 'Light Mode', coming: true },
            ].map(theme => (
              <div key={theme.name} className={cn(
                "flex items-center gap-3 p-2 rounded",
                theme.active && "bg-signal-blue/10 ring-1 ring-signal-blue/30"
              )}>
                <div className={cn(
                  "w-3 h-3 rounded-full border-2",
                  theme.active ? "border-signal-blue bg-signal-blue" : "border-muted-foreground"
                )} />
                <span className={cn("text-sm", theme.active && "text-signal-blue")}>{theme.name}</span>
                {theme.coming && (
                  <span className="badge badge--muted text-[10px]">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
