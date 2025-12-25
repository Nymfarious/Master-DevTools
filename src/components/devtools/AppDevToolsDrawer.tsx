// App-Specific DevTools Drawer - Shows only relevant panels for the loaded app
import { useState } from 'react';
import { X, Terminal, Database, Music, Video, Image, GitBranch, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { EchoverseApp, DevToolsPanel } from '@/config/apps';
import { AppHealthIndicator } from '@/components/overview/AppHealthIndicator';

interface AppDevToolsDrawerProps {
  app: EchoverseApp;
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_CONFIG: Record<DevToolsPanel, { icon: typeof Terminal; label: string; description: string }> = {
  logs: { icon: Terminal, label: 'Logs', description: 'Application logs and errors' },
  data: { icon: Database, label: 'Data', description: 'Database records and queries' },
  audio: { icon: Music, label: 'Audio', description: 'Audio playback and analysis' },
  video: { icon: Video, label: 'Video', description: 'Video frames and processing' },
  media: { icon: Image, label: 'Media', description: 'Image assets and uploads' },
  pipeline: { icon: GitBranch, label: 'Pipeline', description: 'Processing pipeline status' },
  content: { icon: FileText, label: 'Content', description: 'Content management' },
};

export function AppDevToolsDrawer({ app, isOpen, onClose }: AppDevToolsDrawerProps) {
  const [activePanel, setActivePanel] = useState<DevToolsPanel | null>(
    app.devToolsConfig?.panels?.[0] || null
  );

  const availablePanels = app.devToolsConfig?.panels || [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-96 max-w-[90vw] z-50',
          'bg-background border-l border-border',
          'flex flex-col',
          'animate-in slide-in-from-right duration-300'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              'bg-primary/20'
            )}>
              <app.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-semibold text-sm">{app.name}</h2>
              <p className="text-[10px] text-muted-foreground">DevTools</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* App Health Summary */}
        <div className="p-4 border-b border-border bg-secondary/20">
          <AppHealthIndicator app={app} />
        </div>

        {/* Panel Tabs */}
        <div className="flex gap-1 p-2 border-b border-border overflow-x-auto">
          {availablePanels.map((panelId) => {
            const config = PANEL_CONFIG[panelId];
            if (!config) return null;
            const Icon = config.icon;
            
            return (
              <Button
                key={panelId}
                variant={activePanel === panelId ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-xs gap-1.5 shrink-0"
                onClick={() => setActivePanel(panelId)}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </Button>
            );
          })}
        </div>

        {/* Panel Content */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            {activePanel ? (
              <div className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-3">
                    {(() => {
                      const config = PANEL_CONFIG[activePanel];
                      const Icon = config?.icon || Terminal;
                      return <Icon className="w-6 h-6" />;
                    })()}
                  </div>
                  <p className="text-sm font-medium">{PANEL_CONFIG[activePanel]?.label} Panel</p>
                  <p className="text-xs mt-1">{PANEL_CONFIG[activePanel]?.description}</p>
                  <p className="text-[10px] mt-3 text-muted-foreground/60">
                    Connect to {app.name} to see live data
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-sm">No panels configured for this app</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-secondary/10">
          <p className="text-[10px] text-muted-foreground text-center">
            {app.urls.local && (
              <span className="font-mono">{app.urls.local}</span>
            )}
          </p>
        </div>
      </aside>
    </>
  );
}
