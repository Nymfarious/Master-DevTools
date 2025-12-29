import { useSystemStore } from '@/stores/systemStore';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
    <TooltipProvider>
      <footer className="fixed bottom-0 left-16 right-0 h-8 z-40 border-t border-border bg-card/95 backdrop-blur-xl">
        <div className="h-full px-4 flex items-center justify-between font-mono text-xs">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 cursor-help">
                  <span className={cn('status-light', connectionColor[connectionStatus])} />
                  <span className="text-muted-foreground">{connectionLabel[connectionStatus]}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" align="start" sideOffset={8} className="max-w-xs ml-4">
                <div className="space-y-1">
                  <p className="font-semibold">Supabase Backend</p>
                  <p className="text-xs text-muted-foreground">
                    Your app's backend infrastructure including database, authentication, 
                    storage, and edge functions. All backend services are running on Supabase.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Memory */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 text-muted-foreground cursor-help">
                  <span>MEM:</span>
                  <span className="text-signal-cyan">{memory.used}MB</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold">Browser Memory Usage</p>
                  <p className="text-xs text-muted-foreground">
                    Current memory allocated by this browser tab for the DevTools dashboard. 
                    This includes cached data, component state, and runtime objects.
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Active sessions */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span>Sessions:</span>
              <span className="text-foreground">{activeSessions}</span>
            </div>

            {/* Version */}
            <div className="text-muted-foreground">v3.3.0</div>

            {/* Environment badge */}
            <div className="px-1.5 py-0.5 rounded bg-signal-green/20 text-signal-green border border-signal-green/30 text-[10px] uppercase tracking-wider">
              DEV
            </div>
          </div>
        </div>
      </footer>
    </TooltipProvider>
  );
}
