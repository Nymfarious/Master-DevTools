// Apps Map View - Sitemap-style visualization of connected apps
// Shows app relationships and development status

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, Clock, Pause, CalendarClock, 
  ExternalLink, ArrowRight 
} from 'lucide-react';
import { ECHOVERSE_APPS, APP_STATUS_STYLES, type AppStatus } from '@/config/apps';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Status icons
const STATUS_ICONS: Record<AppStatus, typeof CheckCircle2> = {
  ready: CheckCircle2,
  development: Clock,
  planned: CalendarClock,
  offline: Pause,
};

// Group apps by category for hierarchical display
const groupAppsByCategory = () => {
  const groups: Record<string, typeof ECHOVERSE_APPS> = {};
  
  ECHOVERSE_APPS.forEach(app => {
    if (!groups[app.category]) {
      groups[app.category] = [];
    }
    groups[app.category].push(app);
  });
  
  return groups;
};

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  media: 'border-signal-blue',
  audio: 'border-signal-purple',
  creative: 'border-pink-500',
  utility: 'border-muted-foreground',
};

const CATEGORY_BG: Record<string, string> = {
  media: 'bg-signal-blue/10',
  audio: 'bg-signal-purple/10',
  creative: 'bg-pink-500/10',
  utility: 'bg-muted/20',
};

interface AppsMapViewProps {
  onSelectApp?: (appId: string) => void;
}

export function AppsMapView({ onSelectApp }: AppsMapViewProps) {
  const groupedApps = useMemo(() => groupAppsByCategory(), []);
  
  // Stats
  const stats = useMemo(() => ({
    total: ECHOVERSE_APPS.length,
    ready: ECHOVERSE_APPS.filter(a => a.status === 'ready').length,
    development: ECHOVERSE_APPS.filter(a => a.status === 'development').length,
    planned: ECHOVERSE_APPS.filter(a => a.status === 'planned').length,
  }), []);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Stats Bar */}
        <div className="flex items-center justify-between p-3 terminal-glass rounded-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-signal-green" />
              <span className="text-sm font-mono">{stats.ready} Ready</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-signal-amber" />
              <span className="text-sm font-mono">{stats.development} In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-signal-blue" />
              <span className="text-sm font-mono">{stats.planned} Planned</span>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {stats.total} Total Apps
          </Badge>
        </div>

        {/* Hierarchical Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedApps).map(([category, apps]) => (
            <div 
              key={category} 
              className={cn(
                "rounded-lg border-2 p-4 space-y-3",
                CATEGORY_COLORS[category],
                CATEGORY_BG[category]
              )}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-mono font-semibold text-foreground uppercase text-sm tracking-wider">
                  {category}
                </h3>
                <Badge variant="outline" className="text-[10px]">
                  {apps.length} apps
                </Badge>
              </div>

              {/* Apps in Category */}
              <div className="space-y-2">
                {apps.map((app, index) => {
                  const StatusIcon = STATUS_ICONS[app.status];
                  const statusStyle = APP_STATUS_STYLES[app.status];
                  
                  return (
                    <div key={app.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => onSelectApp?.(app.id)}
                            className={cn(
                              "w-full p-3 rounded-lg border transition-all",
                              "bg-terminal-surface/80 hover:bg-terminal-elevated",
                              "flex items-center justify-between gap-3",
                              app.status === 'ready' && "border-signal-green/30",
                              app.status === 'development' && "border-signal-amber/30 border-dashed",
                              app.status === 'planned' && "border-signal-blue/30 border-dotted",
                              app.status === 'offline' && "border-muted-foreground/30 opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <app.icon className={cn("w-5 h-5", statusStyle.color)} />
                              <div className="text-left">
                                <p className="font-mono text-sm text-foreground">{app.name}</p>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {app.description}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge className={cn("text-[10px]", statusStyle.bg, statusStyle.color)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {statusStyle.label}
                              </Badge>
                              {app.urls.production && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(app.urls.production, '_blank');
                                  }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs">
                          <div className="space-y-2">
                            <p className="font-semibold">{app.name}</p>
                            <p className="text-xs text-muted-foreground">{app.description}</p>
                            {app.features && (
                              <div className="flex flex-wrap gap-1">
                                {app.features.slice(0, 3).map(f => (
                                  <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                                ))}
                              </div>
                            )}
                            {app.apiDependencies && (
                              <p className="text-[10px] text-muted-foreground">
                                APIs: {app.apiDependencies.join(', ')}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {/* Connection line to next app in category */}
                      {index < apps.length - 1 && (
                        <div className="flex justify-center py-1">
                          <ArrowRight className="w-4 h-4 text-muted-foreground/30 rotate-90" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 p-3 terminal-glass rounded-lg">
          <span className="text-xs text-muted-foreground">Status:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 bg-signal-green rounded" />
              <span className="text-xs text-muted-foreground">Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 border-t-2 border-dashed border-signal-amber" />
              <span className="text-xs text-muted-foreground">In Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-0.5 border-t-2 border-dotted border-signal-blue" />
              <span className="text-xs text-muted-foreground">Planned</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}