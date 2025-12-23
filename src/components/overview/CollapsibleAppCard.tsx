// Collapsible App Card - Compact row that expands on click
import { useState } from 'react';
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
              <Circle
                className={cn(
                  'w-2 h-2 fill-current shrink-0',
                  pingStatus === 'online' && 'text-green-400',
                  pingStatus === 'offline' && 'text-red-400',
                  pingStatus === 'unknown' && 'text-gray-400'
                )}
              />
            )}
            {isLoaded && (
              <span className="badge badge--green text-[9px] shrink-0">
                Active
              </span>
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
          <span
            className={cn('badge text-[10px]', statusStyle.bg, statusStyle.color)}
          >
            {statusStyle.label}
          </span>
          <span
            className={cn(
              'badge text-[10px]',
              categoryStyle.color + '/20',
              'text-foreground/70'
            )}
          >
            {categoryStyle.label}
          </span>
        </div>

        {/* Chevron */}
        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-0 border-t border-border/30 space-y-3">
          {/* Description */}
          <p className="text-xs text-muted-foreground pt-3">{app.description}</p>

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

          {/* API Dependencies */}
          {app.apiDependencies && app.apiDependencies.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
                API Dependencies
              </p>
              <div className="flex flex-wrap gap-1">
                {app.apiDependencies.map((dep) => (
                  <span
                    key={dep}
                    className="badge bg-cyan-500/20 text-cyan-400 text-[10px]"
                  >
                    {dep}
                  </span>
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
                  Open Local
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
                  Copy URL
                </Button>
              </>
            )}

            {/* Load Button - Primary Action */}
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
          </div>
        </div>
      )}
    </div>
  );
}
