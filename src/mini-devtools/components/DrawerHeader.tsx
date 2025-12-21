import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevToolsStore } from '@/stores/devtools-store';
import type { Environment } from '@/types/devtools';

interface DrawerHeaderProps {
  appName?: string;
  version?: string;
  environment?: Environment;
}

export function DrawerHeader({ 
  appName = 'DevTools',
  version = '1.0.0',
  environment = 'development'
}: DrawerHeaderProps) {
  const { closeDrawer } = useDevToolsStore();

  const envConfig: Record<Environment, { label: string; className: string }> = {
    development: { 
      label: 'DEV', 
      className: 'bg-signal-green/20 text-signal-green border-signal-green/30' 
    },
    preview: { 
      label: 'PREVIEW', 
      className: 'bg-signal-amber/20 text-signal-amber border-signal-amber/30' 
    },
    production: { 
      label: 'PROD', 
      className: 'bg-signal-red/20 text-signal-red border-signal-red/30' 
    },
  };

  const env = envConfig[environment];

  return (
    <header 
      className={cn(
        'flex items-center justify-between',
        'px-4 py-3',
        'border-b border-border/50',
        'bg-background/30'
      )}
    >
      {/* Left: App info */}
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="status-light status-light--green" />
        
        {/* App name and version */}
        <div className="flex items-baseline gap-2">
          <h1 className="text-sm font-display font-semibold text-foreground">
            {appName}
          </h1>
          <span className="text-xs font-mono text-muted-foreground">
            v{version}
          </span>
        </div>

        {/* Environment badge */}
        <span 
          className={cn(
            'px-2 py-0.5 rounded text-xs font-mono border',
            env.className
          )}
        >
          {env.label}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Current time - mission control style */}
        <div className="mr-3 text-xs font-mono text-muted-foreground tabular-nums">
          <CurrentTime />
        </div>

        {/* Close button */}
        <button
          onClick={closeDrawer}
          className={cn(
            'w-8 h-8 rounded-lg',
            'flex items-center justify-center',
            'text-muted-foreground',
            'transition-all duration-200',
            'hover:text-signal-red hover:bg-signal-red/10',
            'focus:outline-none focus:ring-2 focus:ring-signal-red/30'
          )}
          aria-label="Close DevTools"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

// Mission control style clock
function CurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');

  return (
    <span className="flex items-center gap-1">
      <span className="text-signal-green">{hours}</span>
      <span className="text-muted-foreground animate-pulse">:</span>
      <span className="text-signal-green">{minutes}</span>
      <span className="text-muted-foreground animate-pulse">:</span>
      <span className="text-muted-foreground">{seconds}</span>
    </span>
  );
}
