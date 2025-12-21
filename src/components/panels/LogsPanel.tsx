// Logs Panel v3.0.0 - Full event logs with filtering, search, refresh, and improved styling
import { useState, useMemo, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  Trash2, 
  CheckCircle, 
  Download,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLogsStore } from '@/stores/logsStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { LogLevel } from '@/types/devtools';

type FilterType = 'all' | 'error' | 'warn' | 'info';

const LEVEL_STYLES: Record<LogLevel, string> = {
  info: 'bg-signal-blue/20 text-signal-blue',
  warn: 'bg-signal-amber/20 text-signal-amber',
  error: 'bg-signal-red/20 text-signal-red',
  success: 'bg-signal-green/20 text-signal-green',
  debug: 'bg-signal-purple/20 text-signal-purple',
};

const LEVEL_ICONS: Record<LogLevel, typeof AlertCircle> = {
  error: AlertCircle,
  warn: AlertTriangle,
  info: Info,
  success: CheckCircle2,
  debug: Info,
};

export function LogsPanel() {
  const { logs, markAllRead, clearLogs, clearByLevel } = useLogsStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justMarkedRead, setJustMarkedRead] = useState(false);

  // Mark all as read when panel opens
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesFilter = filter === 'all' || log.level === filter;
      const matchesSearch = searchQuery === '' || 
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [logs, filter, searchQuery]);

  const counts = useMemo(() => ({
    total: logs.length,
    error: logs.filter(l => l.level === 'error').length,
    warn: logs.filter(l => l.level === 'warn').length,
    info: logs.filter(l => l.level === 'info' || l.level === 'success' || l.level === 'debug').length,
  }), [logs]);

  const toggleExpanded = (id: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRefreshing(false);
    toast.success('Logs refreshed');
  };

  const handleMarkAllRead = () => {
    markAllRead();
    setJustMarkedRead(true);
    setTimeout(() => setJustMarkedRead(false), 2000);
  };

  const exportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterTabs: { key: FilterType; label: string; color: string }[] = [
    { key: 'all', label: 'All', color: 'text-foreground' },
    { key: 'error', label: 'Errors', color: 'text-signal-red' },
    { key: 'warn', label: 'Warnings', color: 'text-signal-amber' },
    { key: 'info', label: 'Info', color: 'text-signal-blue' },
  ];

  return (
    <div className="space-y-4 boot-sequence">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="section-header text-lg">
            <ScrollText className="w-4 h-4" />
            Event Logs
          </h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="h-7 text-xs gap-1.5"
          >
            <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
        
        {/* Filter tabs + Search */}
        <div className="flex items-center gap-4">
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-lg">
            {filterTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                  filter === tab.key 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
                {tab.key !== 'all' && counts[tab.key] > 0 && (
                  <span className={cn("ml-1.5 font-mono", tab.color)}>
                    {counts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-sm bg-secondary/50"
            />
          </div>
        </div>
        
        {/* Stats */}
        <p className="text-xs text-muted-foreground">
          {counts.total} total • {counts.error} errors • {counts.warn} warnings • {counts.info} info
        </p>
      </div>
      
      {/* Log entries */}
      <div className="terminal-glass rounded-lg overflow-hidden max-h-[60vh] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No logs match your filter
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredLogs.map(log => {
              const Icon = LEVEL_ICONS[log.level];
              const isExpanded = expandedLogs.has(log.id);
              const hasContext = log.context && Object.keys(log.context).length > 0;
              const isRead = log.read;
              
              return (
                <div key={log.id} className="group">
                  <div className={cn(
                    "p-3 transition-colors",
                    isRead 
                      ? "opacity-60 hover:opacity-80" 
                      : "border-l-2 border-l-signal-blue hover:bg-secondary/30"
                  )}>
                    <div className="flex items-start gap-3">
                      <Icon className={cn(
                        "w-4 h-4 mt-0.5 flex-shrink-0", 
                        LEVEL_STYLES[log.level].split(' ')[1],
                        isRead && "opacity-60"
                      )} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn(
                            "badge text-[10px]", 
                            LEVEL_STYLES[log.level],
                            isRead && "opacity-60"
                          )}>
                            {log.level.toUpperCase()}
                          </span>
                          <span className={cn(
                            "font-mono text-xs",
                            isRead ? "text-muted-foreground/50" : "text-muted-foreground"
                          )}>
                            {formatTime(log.timestamp)}
                          </span>
                        </div>
                        <p className={cn(
                          "text-sm",
                          isRead ? "text-muted-foreground" : "text-foreground"
                        )}>
                          {log.message}
                        </p>
                        {log.source && (
                          <p className="text-xs text-muted-foreground/60 mt-1">Source: {log.source}</p>
                        )}
                      </div>
                      {hasContext && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100"
                          onClick={() => toggleExpanded(log.id)}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          {isExpanded ? 'Hide' : 'Details'}
                        </Button>
                      )}
                    </div>
                    {isExpanded && hasContext && (
                      <pre className="mt-3 p-3 bg-background/50 rounded text-xs font-mono text-muted-foreground overflow-x-auto">
                        {JSON.stringify(log.context, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleMarkAllRead} 
          className={cn(
            "text-xs transition-colors",
            justMarkedRead && "text-signal-green border-signal-green/50"
          )}
        >
          <CheckCircle className={cn("w-3 h-3 mr-1.5", justMarkedRead && "text-signal-green")} /> 
          {justMarkedRead ? 'Marked!' : 'Mark All Read'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => clearByLevel('error')} className="text-xs text-signal-red">
          <Trash2 className="w-3 h-3 mr-1.5" /> Clear Errors
        </Button>
        <Button variant="outline" size="sm" onClick={exportLogs} className="text-xs">
          <Download className="w-3 h-3 mr-1.5" /> Export
        </Button>
        <Button variant="destructive" size="sm" onClick={clearLogs} className="text-xs ml-auto">
          <Trash2 className="w-3 h-3 mr-1.5" /> Clear All
        </Button>
      </div>
    </div>
  );
}
