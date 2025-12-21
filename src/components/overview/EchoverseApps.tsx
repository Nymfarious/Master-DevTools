// Echoverse Apps Grid - App launcher with status and actions
// Lines: ~95 | Status: GREEN
import { 
  BookOpen, 
  Heart, 
  Music, 
  GitBranch, 
  Map, 
  ExternalLink, 
  Settings,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusLight } from '@/components/ui/StatusLight';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface EchoverseApp {
  id: string;
  name: string;
  icon: typeof BookOpen;
  status: 'online' | 'offline';
  version?: string;
  url?: string;
}

const APPS: EchoverseApp[] = [
  { id: 'storybook', name: 'Storybook', icon: BookOpen, status: 'online', version: '0.2.1', url: 'http://localhost:5173' },
  { id: 'little-sister', name: 'Little Sister', icon: Heart, status: 'offline' },
  { id: 'drummer', name: 'Drummer', icon: Music, status: 'offline' },
  { id: 'ged-builder', name: 'GED Builder', icon: GitBranch, status: 'offline' },
  { id: 'history-discovery', name: 'History Discovery', icon: Map, status: 'offline' },
];

export function EchoverseApps() {
  const handleOpen = (app: EchoverseApp) => {
    if (app.status === 'offline') {
      toast.error(`${app.name} is offline`);
      return;
    }
    if (app.url) {
      window.open(app.url, '_blank');
    }
  };

  const handleConfig = (app: EchoverseApp) => {
    toast.info(`Configuration coming in Phase 7`, { description: app.name });
  };

  const handleConnect = (app: EchoverseApp) => {
    toast.info(`Waiting for ${app.name} to come online...`);
  };

  return (
    <section className="space-y-3">
      <h2 className="section-header">
        <Globe className="w-3.5 h-3.5" />
        Echoverse Apps
      </h2>
      
      <div className="grid grid-cols-2 gap-3">
        {APPS.map(app => {
          const Icon = app.icon;
          const isOnline = app.status === 'online';
          
          return (
            <div 
              key={app.id}
              className={cn(
                "terminal-glass p-4 rounded-lg",
                "transition-all duration-200",
                "hover:ring-1 hover:ring-border/50",
                !isOnline && "opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Icon className={cn(
                    "w-5 h-5",
                    isOnline ? "text-signal-green" : "text-muted-foreground"
                  )} />
                  <span className="font-display font-semibold text-sm">{app.name}</span>
                </div>
                <StatusLight status={isOnline ? 'healthy' : 'unknown'} size="sm" />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-mono">
                  {app.version || '--'}
                </span>
                
                {isOnline ? (
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleOpen(app)}>
                      <ExternalLink className="w-3 h-3 mr-1" /> Open
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleConfig(app)}>
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={() => handleConnect(app)}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
