import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Palette, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const colorTokens = [
  { name: 'Background', variable: '--background', tailwind: 'bg-background', sample: 'hsl(var(--background))' },
  { name: 'Foreground', variable: '--foreground', tailwind: 'text-foreground', sample: 'hsl(var(--foreground))' },
  { name: 'Primary', variable: '--primary', tailwind: 'bg-primary', sample: 'hsl(var(--primary))' },
  { name: 'Secondary', variable: '--secondary', tailwind: 'bg-secondary', sample: 'hsl(var(--secondary))' },
  { name: 'Muted', variable: '--muted', tailwind: 'bg-muted', sample: 'hsl(var(--muted))' },
  { name: 'Accent', variable: '--accent', tailwind: 'bg-accent', sample: 'hsl(var(--accent))' },
  { name: 'Destructive', variable: '--destructive', tailwind: 'bg-destructive', sample: 'hsl(var(--destructive))' },
  { name: 'Border', variable: '--border', tailwind: 'border-border', sample: 'hsl(var(--border))' },
  { name: 'Card', variable: '--card', tailwind: 'bg-card', sample: 'hsl(var(--card))' },
  { name: 'Popover', variable: '--popover', tailwind: 'bg-popover', sample: 'hsl(var(--popover))' },
];

const statusBadges = [
  { name: 'Success', classes: 'bg-green-500/20 text-green-500 border-green-500/30' },
  { name: 'Warning', classes: 'bg-amber-500/20 text-amber-500 border-amber-500/30' },
  { name: 'Error', classes: 'bg-red-500/20 text-red-500 border-red-500/30' },
  { name: 'Info', classes: 'bg-blue-500/20 text-blue-500 border-blue-500/30' },
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

export function StyleGuidePanel() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: 'Copied!', description: text });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Style Guide
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Design tokens and component patterns
        </p>
      </div>

      {/* Color Tokens */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Color Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {colorTokens.map((color) => (
            <div
              key={color.name}
              className="flex items-center justify-between p-2 rounded-lg bg-background/50"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded border border-border"
                  style={{ background: color.sample }}
                />
                <div>
                  <div className="text-sm font-medium">{color.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{color.tailwind}</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(color.tailwind, color.name)}
                className="h-8 px-2"
              >
                {copiedId === color.name ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Status Badges */}
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
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Typography</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
        </CardContent>
      </Card>

      {/* Component Patterns */}
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
                    <Check className="h-3 w-3 text-green-500" />
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
    </div>
  );
}
