// Live Activity Feed - Recent logs with navigation to full logs panel
// Lines: ~85 | Status: GREEN
import { Activity, ChevronRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLogsStore } from '@/stores/logsStore';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

const LEVEL_STYLES = {
  info: 'bg-signal-blue/20 text-signal-blue',
  warn: 'bg-signal-amber/20 text-signal-amber',
  error: 'bg-signal-red/20 text-signal-red',
  success: 'bg-signal-green/20 text-signal-green',
  debug: 'bg-signal-purple/20 text-signal-purple',
};

const LEVEL_ICONS = {
  info: '✓',
  warn: '⚠',
  error: '✗',
  success: '✓',
  debug: '→',
};

export function LiveActivityFeed() {
  const { logs, clearLogs } = useLogsStore();
  const { setActiveSection } = useAppStore();
  
  const recentLogs = logs.slice(0, 5);
  const totalCount = logs.length;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-header">
          <Activity className="w-3.5 h-3.5" />
          Live Activity
        </h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearLogs}
          className="h-7 text-xs text-muted-foreground hover:text-signal-red"
        >
          <Trash2 className="w-3 h-3 mr-1" />
          Clear All
        </Button>
      </div>
      
      <div className="terminal-glass rounded-lg overflow-hidden">
        <div className="divide-y divide-border/30">
          {recentLogs.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No activity yet
            </div>
          ) : (
            recentLogs.map(log => (
              <div 
                key={log.id} 
                className={cn(
                  "flex items-center gap-3 p-3",
                  "hover:bg-secondary/30 transition-colors",
                  !log.read && "border-l-2 border-l-signal-blue"
                )}
              >
                <span className="font-mono text-xs text-muted-foreground w-16 flex-shrink-0">
                  {formatTime(log.timestamp)}
                </span>
                <span className={cn("badge text-[10px] w-14 text-center", LEVEL_STYLES[log.level])}>
                  {LEVEL_ICONS[log.level]} {log.level.toUpperCase()}
                </span>
                <span className="text-sm text-foreground truncate flex-1">{log.message}</span>
              </div>
            ))
          )}
        </div>
        
        {totalCount > 5 && (
          <div className="p-2 border-t border-border/30 flex items-center justify-between bg-secondary/20">
            <span className="text-xs text-muted-foreground">
              Showing 5 of {totalCount} events
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-6 text-xs text-signal-blue"
              onClick={() => setActiveSection('logs')}
            >
              View All in Logs <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
