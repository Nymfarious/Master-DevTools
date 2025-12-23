// App Style Guide Panel - Combined design tokens, colors, typography, and patterns
// Merged from StyleGuidePanel + UITokensPanel
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Copy, Check, Type, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { StatusLight } from '@/components/ui/StatusLight';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// COLOR DATA
// ═══════════════════════════════════════════════════════════════════════════

interface ColorSwatch {
  name: string;
  variable: string;
  tailwind: string;
  hex: string;
}

const THEME_COLORS: ColorSwatch[] = [
  { name: 'Background', variable: '--background', tailwind: 'bg-background', hex: '#0a0e14' },
  { name: 'Foreground', variable: '--foreground', tailwind: 'text-foreground', hex: '#e6edf3' },
  { name: 'Primary', variable: '--primary', tailwind: 'bg-primary', hex: '#58a6ff' },
  { name: 'Secondary', variable: '--secondary', tailwind: 'bg-secondary', hex: '#161b22' },
  { name: 'Muted', variable: '--muted', tailwind: 'bg-muted', hex: '#484f58' },
  { name: 'Accent', variable: '--accent', tailwind: 'bg-accent', hex: '#238636' },
  { name: 'Destructive', variable: '--destructive', tailwind: 'bg-destructive', hex: '#f85149' },
  { name: 'Border', variable: '--border', tailwind: 'border-border', hex: '#21262d' },
  { name: 'Card', variable: '--card', tailwind: 'bg-card', hex: '#0d1117' },
  { name: 'Popover', variable: '--popover', tailwind: 'bg-popover', hex: '#161b22' },
];

const SIGNAL_COLORS: ColorSwatch[] = [
  { name: 'Green', variable: '--signal-green', tailwind: 'text-signal-green', hex: '#3fb950' },
  { name: 'Amber', variable: '--signal-amber', tailwind: 'text-signal-amber', hex: '#d29922' },
  { name: 'Red', variable: '--signal-red', tailwind: 'text-signal-red', hex: '#f85149' },
  { name: 'Blue', variable: '--signal-blue', tailwind: 'text-signal-blue', hex: '#58a6ff' },
  { name: 'Purple', variable: '--signal-purple', tailwind: 'text-signal-purple', hex: '#a371f7' },
  { name: 'Cyan', variable: '--signal-cyan', tailwind: 'text-signal-cyan', hex: '#39c5cf' },
];

const BACKGROUND_SHADES: ColorSwatch[] = [
  { name: 'Background', variable: '--background', tailwind: 'bg-background', hex: '#0a0e14' },
  { name: 'Surface', variable: '--card', tailwind: 'bg-card', hex: '#0d1117' },
  { name: 'Elevated', variable: '--secondary', tailwind: 'bg-secondary', hex: '#161b22' },
  { name: 'Border', variable: '--border', tailwind: 'border-border', hex: '#21262d' },
  { name: 'Muted', variable: '--muted', tailwind: 'text-muted', hex: '#484f58' },
];

// ═══════════════════════════════════════════════════════════════════════════
// STATUS & PATTERNS DATA
// ═══════════════════════════════════════════════════════════════════════════

const statusBadges = [
  { name: 'Success', classes: 'bg-signal-green/20 text-signal-green border-signal-green/30' },
  { name: 'Warning', classes: 'bg-signal-amber/20 text-signal-amber border-signal-amber/30' },
  { name: 'Error', classes: 'bg-signal-red/20 text-signal-red border-signal-red/30' },
  { name: 'Info', classes: 'bg-signal-blue/20 text-signal-blue border-signal-blue/30' },
  { name: 'Neutral', classes: 'bg-muted text-muted-foreground border-border' },
];

const componentPatterns = [
  { name: 'Glassmorphism Card', code: 'bg-secondary/50 backdrop-blur-sm border border-border' },
  { name: 'Drawer Background', code: 'bg-background/95 backdrop-blur-xl border-l border-border' },
  { name: 'Red Dot Notification', code: 'w-2 h-2 bg-destructive rounded-full animate-pulse' },
  { name: 'Gradient Title', code: 'bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent' },
  { name: 'Hover State', code: 'hover:bg-secondary/80 transition-colors' },
  { name: 'Focus Ring', code: 'focus:ring-2 focus:ring-primary/50 focus:outline-none' },
];

// ═══════════════════════════════════════════════════════════════════════════
// COLOR SWATCH CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ColorSwatchCard({ 
  swatch, 
  onCopy,
  copied
}: { 
  swatch: ColorSwatch; 
  onCopy: (text: string, id: string) => void;
  copied: boolean;
}) {
  return (
    <button
      onClick={() => onCopy(swatch.tailwind, swatch.name)}
      className="group flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
    >
      <div 
        className="w-12 h-12 rounded-lg border border-border/50 shadow-lg transition-transform group-hover:scale-105"
        style={{ backgroundColor: swatch.hex }}
      />
      <div className="text-center">
        <p className="text-xs font-medium text-foreground">{swatch.name}</p>
        <p className="text-[10px] font-mono text-muted-foreground flex items-center gap-1 justify-center">
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

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PANEL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function AppStyleGuidePanel() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied!', description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Palette className="w-5 h-5 text-signal-purple" />
          App Style Guide
        </h1>
        <p className="text-sm text-muted-foreground">
          Colors, typography, and component patterns
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COLOR SYSTEM */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <section className="space-y-4">
        <h2 className="section-header text-base">
          <Palette className="w-4 h-4" />
          Color System
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          {/* Theme Colors */}
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Theme Colors</h3>
            <div className="flex flex-wrap gap-2">
              {THEME_COLORS.map(swatch => (
                <ColorSwatchCard 
                  key={swatch.variable} 
                  swatch={swatch} 
                  onCopy={copyToClipboard}
                  copied={copiedId === swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Signal Colors */}
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Signal Colors</h3>
            <div className="flex flex-wrap gap-2">
              {SIGNAL_COLORS.map(swatch => (
                <ColorSwatchCard 
                  key={swatch.variable} 
                  swatch={swatch} 
                  onCopy={copyToClipboard}
                  copied={copiedId === swatch.name}
                />
              ))}
            </div>
          </div>

          {/* Background Shades */}
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Background Shades</h3>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_SHADES.map(swatch => (
                <ColorSwatchCard 
                  key={`bg-${swatch.variable}`} 
                  swatch={swatch} 
                  onCopy={copyToClipboard}
                  copied={copiedId === swatch.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* STATUS BADGES */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Status Badges</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {statusBadges.map((badge) => (
            <div
              key={badge.name}
              className="flex items-center justify-between p-2 rounded-lg bg-background/50"
            >
              <Badge className={badge.classes}>{badge.name}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(badge.classes, `badge-${badge.name}`)}
                className="h-8 px-2"
              >
                {copiedId === `badge-${badge.name}` ? (
                  <Check className="h-3 w-3 text-signal-green" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TYPOGRAPHY */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <section className="space-y-4">
        <h2 className="section-header text-base">
          <Type className="w-4 h-4" />
          Typography
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          {/* Display Font */}
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

          {/* Monospace Font */}
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

          {/* General Headings */}
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Headings
            </h3>
            <div className="space-y-3 bg-secondary/30 p-4 rounded-lg">
              <div>
                <h1 className="text-2xl font-bold">Heading 1</h1>
                <code className="text-xs text-muted-foreground">text-2xl font-bold</code>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Heading 2</h2>
                <code className="text-xs text-muted-foreground">text-lg font-semibold</code>
              </div>
              <div>
                <h3 className="text-base font-medium">Heading 3</h3>
                <code className="text-xs text-muted-foreground">text-base font-medium</code>
              </div>
              <div>
                <p className="text-sm">Body text</p>
                <code className="text-xs text-muted-foreground">text-sm</code>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Small/Muted text</p>
                <code className="text-xs text-muted-foreground">text-xs text-muted-foreground</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMPONENTS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <section className="space-y-4">
        <h2 className="section-header text-base">
          <Layers className="w-4 h-4" />
          Components
        </h2>
        
        <div className="terminal-glass p-4 rounded-lg space-y-6">
          {/* Status Lights */}
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

          {/* Inline Badges */}
          <div>
            <h3 className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Inline Badges</h3>
            <div className="flex items-center gap-2">
              <span className="badge bg-signal-blue/20 text-signal-blue">INFO</span>
              <span className="badge bg-signal-amber/20 text-signal-amber">WARN</span>
              <span className="badge bg-signal-red/20 text-signal-red">ERROR</span>
              <span className="badge bg-signal-green/20 text-signal-green">SUCCESS</span>
              <span className="badge badge--muted">MUTED</span>
            </div>
          </div>

          {/* Buttons */}
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* COMPONENT PATTERNS */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Component Patterns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {componentPatterns.map((pattern) => (
            <div
              key={pattern.name}
              className="p-2 rounded-lg bg-background/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{pattern.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(pattern.code, `pattern-${pattern.name}`)}
                  className="h-6 px-2"
                >
                  {copiedId === `pattern-${pattern.name}` ? (
                    <Check className="h-3 w-3 text-signal-green" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <code className="text-xs text-muted-foreground block bg-secondary/50 p-2 rounded">
                {pattern.code}
              </code>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* THEME TOGGLE */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      
      <section className="space-y-4">
        <h2 className="section-header text-base">Theme</h2>
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