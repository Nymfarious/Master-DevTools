import { useSystemStore } from '@/stores/systemStore';
import { cn } from '@/lib/utils';

export function Footer() {
  const { connectionStatus, memory, activeSessions } = useSystemStore();

  const connectionLabel = {
    connected: 'Connected to Cloud',
    disconnected: 'Disconnected',
    connecting: 'Connecting...',
  };

  const connectionColor = {
    connected: 'status-light--green',
    disconnected: 'status-light--red',
    connecting: 'status-light--amber',
  };

  return (
    <footer className="fixed bottom-0 left-16 right-0 h-8 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
      <div className="h-full px-4 flex items-center justify-between font-mono text-xs">
        {/* Left side */}
        <div className="flex items-center gap-4">
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <span className={cn('status-light', connectionColor[connectionStatus])} />
            <span className="text-muted-foreground">{connectionLabel[connectionStatus]}</span>
          </div>

          {/* Memory */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>MEM:</span>
            <span className="text-signal-cyan">{memory.used}MB</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Active sessions */}
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Sessions:</span>
            <span className="text-foreground">{activeSessions}</span>
          </div>

          {/* Version */}
          <div className="text-muted-foreground">v1.0.0</div>

          {/* Environment badge */}
          <div className="px-1.5 py-0.5 rounded bg-signal-green/20 text-signal-green border border-signal-green/30 text-[10px] uppercase tracking-wider">
            DEV
          </div>
        </div>
      </div>
    </footer>
  );
}
