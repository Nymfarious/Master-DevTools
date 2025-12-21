// Pipeline Panel - Tracks AI generation events with manual sync
// Lines: ~220 | Status: GREEN
import { useState } from 'react';
import { 
  GitBranch, RefreshCw, CheckCircle2, XCircle, Clock, Zap,
  Filter, Trash2, Play, Database, CloudOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { usePipelineStore, generateDemoPipelineEvent, type PipelineEvent } from '@/stores/pipelineStore';
import { usePipelineSync } from '@/hooks/usePipelineSync';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const PROVIDER_COLORS: Record<string, string> = {
  'OpenAI': 'bg-signal-green/20 text-signal-green border-signal-green/30',
  'ElevenLabs': 'bg-signal-blue/20 text-signal-blue border-signal-blue/30',
  'Anthropic': 'bg-signal-purple/20 text-signal-purple border-signal-purple/30',
  'Stability AI': 'bg-signal-amber/20 text-signal-amber border-signal-amber/30',
};

function EventRow({ event }: { event: PipelineEvent }) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div 
      className={cn(
        "terminal-glass rounded-lg overflow-hidden transition-all",
        expanded && "ring-1 ring-signal-blue/30"
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center gap-3 text-left hover:bg-elevated/50"
      >
        {event.success ? (
          <CheckCircle2 className="w-4 h-4 text-signal-green flex-shrink-0" />
        ) : (
          <XCircle className="w-4 h-4 text-signal-red flex-shrink-0" />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm text-foreground">
              {event.step}
            </span>
            <Badge 
              variant="outline" 
              className={cn("text-[10px] px-1.5 py-0", PROVIDER_COLORS[event.provider])}
            >
              {event.provider}
            </Badge>
          </div>
          {event.asset_id && (
            <p className="text-xs font-mono text-muted-foreground truncate">
              {event.asset_id}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 text-right">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className={cn(
              "text-xs font-mono",
              event.duration_ms < 500 && "text-signal-green",
              event.duration_ms >= 500 && event.duration_ms < 1500 && "text-signal-amber",
              event.duration_ms >= 1500 && "text-signal-red"
            )}>
              {event.duration_ms}ms
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground w-16">
            {formatDistanceToNow(event.created_at, { addSuffix: true })}
          </span>
        </div>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50">
          <div className="mt-2 space-y-2">
            {event.error && (
              <div className="p-2 bg-signal-red/10 border border-signal-red/20 rounded text-xs text-signal-red font-mono">
                {event.error}
              </div>
            )}
            {event.metadata && (
              <div className="p-2 bg-surface rounded text-xs font-mono text-muted-foreground">
                <pre>{JSON.stringify(event.metadata, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function PipelinePanel() {
  const { events, filter, setFilter, addEvent, clearEvents, isLoading } = usePipelineStore();
  const { fetchEvents, isSyncing } = usePipelineSync();
  const [demoMode, setDemoMode] = useState(false);

  // Filter events
  const filteredEvents = events.filter(event => {
    if (filter.provider && event.provider !== filter.provider) return false;
    if (filter.success !== null && event.success !== filter.success) return false;
    return true;
  });

  // Stats
  const successCount = events.filter(e => e.success).length;
  const failureCount = events.filter(e => !e.success).length;
  const avgDuration = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + e.duration_ms, 0) / events.length)
    : 0;

  // Demo mode - LOCAL ONLY, no DB writes
  const generateDemoEvent = () => {
    const event = generateDemoPipelineEvent();
    addEvent(event); // Local only, no persistEvent call
  };

  return (
    <div className="space-y-4">
      {/* Sync Bar - prominent at top */}
      <div className="terminal-glass p-3 rounded-lg flex items-center justify-between bg-signal-blue/5 border border-signal-blue/20">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-signal-blue" />
          <span className="text-sm font-medium text-foreground">Database Sync</span>
          <Badge variant="outline" className="text-[10px] gap-1">
            <CloudOff className="w-2.5 h-2.5" />
            Manual
          </Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchEvents}
          disabled={isSyncing}
          className="h-7 gap-1.5 border-signal-blue/30 hover:bg-signal-blue/10"
        >
          <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
          {isSyncing ? 'Syncing...' : 'Sync from DB'}
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-signal-purple" />
            Pipeline Events
          </h1>
          <p className="text-sm text-muted-foreground">
            Track AI generation events across all providers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateDemoEvent}
            className="h-8 gap-1.5"
            title="Add a demo event (local only, no DB write)"
          >
            <Play className="w-3 h-3" />
            Add Demo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearEvents}
            className="h-8 gap-1.5"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Total Events</p>
          <p className="text-xl font-mono font-bold text-foreground">{events.length}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p className="text-xl font-mono font-bold text-signal-green">
            {events.length > 0 ? Math.round((successCount / events.length) * 100) : 0}%
          </p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Failures</p>
          <p className="text-xl font-mono font-bold text-signal-red">{failureCount}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Avg Duration</p>
          <p className="text-xl font-mono font-bold text-signal-cyan">{avgDuration}ms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select 
          value={filter.provider || 'all'} 
          onValueChange={(v) => setFilter({ provider: v === 'all' ? null : v })}
        >
          <SelectTrigger className="w-40 h-8">
            <SelectValue placeholder="Provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Providers</SelectItem>
            <SelectItem value="OpenAI">OpenAI</SelectItem>
            <SelectItem value="ElevenLabs">ElevenLabs</SelectItem>
            <SelectItem value="Anthropic">Anthropic</SelectItem>
            <SelectItem value="Stability AI">Stability AI</SelectItem>
          </SelectContent>
        </Select>
        <Select 
          value={filter.success === null ? 'all' : filter.success.toString()} 
          onValueChange={(v) => setFilter({ success: v === 'all' ? null : v === 'true' })}
        >
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="true">Success</SelectItem>
            <SelectItem value="false">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
        {filteredEvents.length === 0 ? (
          <div className="terminal-glass p-8 rounded-lg text-center">
            <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No pipeline events yet. Click "Demo Mode" to generate sample events.
            </p>
          </div>
        ) : (
          filteredEvents.map(event => (
            <EventRow key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
