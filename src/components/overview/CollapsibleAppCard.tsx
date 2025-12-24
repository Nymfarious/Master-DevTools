// Collapsible App Card - Compact row that expands on click with animation
import { useState, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Github,
  ExternalLink,
  Copy,
  Loader2,
  Check,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logEvent } from '@/stores/logsStore';
import type { EchoverseApp } from '@/config/apps';
import { APP_STATUS_STYLES, APP_CATEGORIES } from '@/config/apps';
import { useAPIHealthStore, type APIEndpoint } from '@/stores/apiHealthStore';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CollapsibleAppCardProps {
  app: EchoverseApp;
  isSelected: boolean;
  isExpanded: boolean;
  isLoaded: boolean;
  isLoading: boolean;
  pingStatus?: 'online' | 'offline' | 'unknown';
  onToggleExpand: () => void;
  onLoad: () => void;
}

const PING_STATUS_TOOLTIPS = {
  online: 'Local server is responding',
  offline: 'Local server is not responding',
  unknown: 'Ping status unknown - click Ping to check',
};

const STATUS_TOOLTIPS = {
  ready: 'App is production-ready and fully functional',
  development: 'App is actively being developed - may have bugs',
  planned: 'App is planned but not yet started',
  offline: 'App is currently unavailable',
};

const CATEGORY_TOOLTIPS = {
  media: 'Processes images, video, or visual assets',
  audio: 'Audio processing, music, or voice features',
  creative: 'Creative tools for art and content creation',
  utility: 'General-purpose utility tools',
};

export function CollapsibleAppCard({
  app,
  isSelected,
  isExpanded,
  isLoaded,
  isLoading,
  pingStatus = 'unknown',
  onToggleExpand,
  onLoad,
}: CollapsibleAppCardProps) {
  const Icon = app.icon;
  const statusStyle = APP_STATUS_STYLES[app.status];
  const categoryStyle = APP_CATEGORIES[app.category];
  const contentRef = useRef<HTMLDivElement>(null);
  const { endpoints } = useAPIHealthStore();

  // Get API health for this app's dependencies
  const appApiHealth = (app.apiDependencies || []).map((dep) => {
    const endpoint = endpoints.find(
      (e) => e.id.toLowerCase() === dep.toLowerCase()
    );
    return {
      name: dep,
      status: endpoint?.status || 'unknown',
      responseTime: endpoint?.responseTime,
    };
  });

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const handleOpen = (url: string) => {
    window.open(url, '_blank');
  };

  const handleLoad = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoaded && !isLoading) {
      onLoad();
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'terminal-glass rounded-lg overflow-hidden transition-all duration-200',
          'border border-transparent',
          isLoaded && 'ring-2 ring-primary shadow-lg shadow-primary/20',
          isSelected && !isLoaded && 'ring-1 ring-primary/50',
          !isSelected && !isLoaded && 'hover:border-border/50'
        )}
      >
        {/* Collapsed Row */}
        <div
          className={cn(
            'flex items-center gap-3 p-3 cursor-pointer',
            'transition-colors hover:bg-secondary/30'
          )}
          onClick={onToggleExpand}
        >
          {/* Icon */}
          <div
            className={cn(
              'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
              categoryStyle.color + '/20'
            )}
          >
            <Icon className={cn('w-4 h-4', statusStyle.color)} />
          </div>

          {/* Name + Version */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-sm truncate">
                {app.name}
              </span>
              {app.urls.local && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Circle
                      className={cn(
                        'w-2 h-2 fill-current shrink-0 cursor-help',
                        pingStatus === 'online' && 'text-green-400',
                        pingStatus === 'offline' && 'text-red-400',
                        pingStatus === 'unknown' && 'text-gray-400'
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {PING_STATUS_TOOLTIPS[pingStatus]}
                  </TooltipContent>
                </Tooltip>
              )}
              {isLoaded && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="badge badge--green text-[9px] shrink-0 animate-pulse-once cursor-help">
                      Active
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    This app is currently loaded in DevTools context
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {app.version && (
              <span className="text-[10px] font-mono text-muted-foreground">
                v{app.version}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'badge text-[10px] cursor-help',
                    statusStyle.bg,
                    statusStyle.color
                  )}
                >
                  {statusStyle.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {STATUS_TOOLTIPS[app.status]}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    'badge text-[10px] cursor-help',
                    categoryStyle.color + '/20',
                    'text-foreground/70'
                  )}
                >
                  {categoryStyle.label}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {CATEGORY_TOOLTIPS[app.category]}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Chevron */}
          <div className="shrink-0">
            <ChevronDown
              className={cn(
                'w-4 h-4 text-muted-foreground transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </div>

        {/* Expanded Content with Animation */}
        <div
          ref={contentRef}
          className={cn(
            'grid transition-all duration-300 ease-out',
            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          )}
        >
          <div className="overflow-hidden">
            <div className="px-3 pb-3 pt-0 border-t border-border/30 space-y-3">
              {/* Description */}
              <p className="text-xs text-muted-foreground pt-3">
                {app.description}
              </p>

              {/* Features */}
              {app.features && app.features.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Features
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {app.features.map((feature) => (
                      <span key={feature} className="badge badge--muted text-[10px]">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* API Dependencies with Health Status */}
              {app.apiDependencies && app.apiDependencies.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    API Health
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {appApiHealth.map((api) => (
                      <Tooltip key={api.name}>
                        <TooltipTrigger asChild>
                          <span
                            className={cn(
                              'badge text-[10px] flex items-center gap-1 cursor-help',
                              api.status === 'healthy' &&
                                'bg-green-500/20 text-green-400',
                              api.status === 'degraded' &&
                                'bg-yellow-500/20 text-yellow-400',
                              api.status === 'down' &&
                                'bg-red-500/20 text-red-400',
                              api.status === 'unknown' &&
                                'bg-gray-500/20 text-gray-400'
                            )}
                          >
                            <Circle
                              className={cn(
                                'w-1.5 h-1.5 fill-current',
                                api.status === 'healthy' && 'text-green-400',
                                api.status === 'degraded' && 'text-yellow-400',
                                api.status === 'down' && 'text-red-400',
                                api.status === 'unknown' && 'text-gray-400'
                              )}
                            />
                            {api.name}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          {api.status === 'healthy' && `${api.name} API is healthy`}
                          {api.status === 'degraded' && `${api.name} API has slow response`}
                          {api.status === 'down' && `${api.name} API is unreachable`}
                          {api.status === 'unknown' && `${api.name} API status unknown`}
                          {api.responseTime && ` (${api.responseTime}ms)`}
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {app.urls.github && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(app.urls.github!);
                    }}
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </Button>
                )}
                {app.urls.production && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1.5 border-green-500/30 text-green-400 hover:bg-green-500/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpen(app.urls.production!);
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Production
                  </Button>
                )}
                {app.urls.local && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpen(app.urls.local!);
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Local
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs gap-1.5"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyUrl(app.urls.local!);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                  </>
                )}

                {/* Load Button - Primary Action */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isLoaded ? 'secondary' : 'default'}
                      className={cn(
                        'h-7 text-xs gap-1.5 ml-auto',
                        isLoaded && 'bg-primary/20 text-primary border-primary/30'
                      )}
                      onClick={handleLoad}
                      disabled={isLoading || isLoaded}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Loading...
                        </>
                      ) : isLoaded ? (
                        <>
                          <Check className="w-3 h-3" />
                          Loaded
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-3 h-3" />
                          Load
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
                    {isLoaded
                      ? 'This app is currently loaded as the active context'
                      : 'Load this app into DevTools context for focused debugging'}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
