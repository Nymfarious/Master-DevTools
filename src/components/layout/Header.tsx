import { useState, useEffect } from 'react';
import { Search, Terminal, User } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';
import { useSystemStore } from '@/stores/systemStore';
import { cn } from '@/lib/utils';

export function Header() {
  const [time, setTime] = useState(new Date());
  const { setCommandPaletteOpen } = useAppStore();
  const { connectionStatus, systemHealth } = useSystemStore();

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const allHealthy = Object.values(systemHealth).every(s => s.status === 'healthy');
  const statusText = allHealthy ? 'ALL SYSTEMS NOMINAL' : 'SYSTEMS DEGRADED';
  const statusColor = allHealthy ? 'text-signal-green' : 'text-signal-amber';

  return (
    <header className="fixed top-0 left-16 right-0 h-14 z-40 border-b border-border bg-card/95 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left: Logo + Version */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-signal-green" />
            <span className="font-display text-sm font-bold tracking-[0.2em] text-foreground uppercase">
              DEVTOOLS
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/60">v3.1.0</span>
        </div>

        {/* Center: Search */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border hover:border-muted-foreground/30 transition-colors group"
        >
          <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
            Search...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-secondary text-xs font-mono text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Right: Time, Status, Profile */}
        <div className="flex items-center gap-4">
          {/* Live Clock */}
          <div className="font-data text-base text-signal-green tracking-wider tabular-nums">
            {formatTime(time)}
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary/30 border border-border">
            <span className={cn(
              'status-light',
              allHealthy ? 'status-light--green' : 'status-light--amber'
            )} />
            <span className={cn('font-mono text-xs uppercase tracking-wide', statusColor)}>
              {statusText}
            </span>
          </div>

          {/* Profile */}
          <button className="w-8 h-8 rounded-full bg-signal-purple/20 border border-signal-purple/30 flex items-center justify-center text-signal-purple hover:bg-signal-purple/30 transition-colors">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
