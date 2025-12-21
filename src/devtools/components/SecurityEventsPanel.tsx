// Security Events Panel - Enhanced security monitoring
import { useState, useEffect } from 'react';
import {
  Shield, User, FileText, AlertTriangle, AlertCircle,
  Clock, Activity, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  useSecurityEventsStore,
  type SecurityEvent,
  type SecurityEventType,
  type SecuritySeverity,
} from '../stores/securityEventsStore';

const EVENT_ICONS: Record<SecurityEventType, React.ElementType> = {
  auth_success: User,
  auth_failure: User,
  auth_logout: User,
  file_upload: FileText,
  file_delete: FileText,
  suspicious_activity: AlertTriangle,
  api_error: AlertCircle,
  rate_limit: Clock,
};

const SEVERITY_CONFIG: Record<SecuritySeverity, string> = {
  critical: 'bg-signal-red/20 text-signal-red border-signal-red/30',
  error: 'bg-signal-red/20 text-signal-red border-signal-red/30',
  warning: 'bg-signal-amber/20 text-signal-amber border-signal-amber/30',
  info: 'bg-signal-blue/20 text-signal-blue border-signal-blue/30',
};

function SecurityEventItem({ event }: { event: SecurityEvent }) {
  const Icon = EVENT_ICONS[event.eventType] || Activity;
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        'terminal-glass p-3 rounded-lg border cursor-pointer transition-colors',
        event.severity === 'critical' && 'border-signal-red/50',
        event.severity === 'error' && 'border-signal-red/30',
        event.severity === 'warning' && 'border-signal-amber/30',
        event.severity === 'info' && 'border-border/50'
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={cn(
            'p-1.5 rounded',
            event.severity === 'critical' && 'bg-signal-red/20',
            event.severity === 'error' && 'bg-signal-red/10',
            event.severity === 'warning' && 'bg-signal-amber/20',
            event.severity === 'info' && 'bg-signal-blue/20'
          )}>
            <Icon className={cn(
              'w-4 h-4',
              event.severity === 'critical' && 'text-signal-red',
              event.severity === 'error' && 'text-signal-red',
              event.severity === 'warning' && 'text-signal-amber',
              event.severity === 'info' && 'text-signal-blue'
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-sm font-medium text-foreground">
                {event.eventType.replace(/_/g, ' ')}
              </span>
              <Badge className={cn('text-[10px]', SEVERITY_CONFIG[event.severity])}>
                {event.severity}
              </Badge>
            </div>
            {event.email && (
              <p className="text-xs text-muted-foreground">{event.email}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(event.timestamp).toLocaleTimeString()}
        </span>
      </div>

      {/* Expanded details */}
      {expanded && event.details && (
        <div className="mt-3 p-2 bg-surface rounded text-xs font-mono overflow-x-auto">
          <pre className="text-muted-foreground">
            {JSON.stringify(event.details, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export function SecurityEventsPanel() {
  const { events, autoRefresh, setAutoRefresh, clearEvents, getStats, addEvent } = useSecurityEventsStore();
  const stats = getStats();

  // Auto-refresh simulation
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      // Simulate random security events
      const eventTypes: SecurityEventType[] = ['auth_success', 'auth_failure', 'file_upload', 'api_error'];
      const severities: SecuritySeverity[] = ['info', 'warning'];
      addEvent({
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        email: Math.random() > 0.5 ? 'user@example.com' : undefined,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, addEvent]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-signal-green" />
            Security Events
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.total} events · {stats.critical} critical
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Auto-refresh</span>
            <Switch checked={autoRefresh} onCheckedChange={setAutoRefresh} />
          </div>
          <Button variant="outline" size="sm" className="h-7" onClick={clearEvents}>
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3">
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-red">{stats.critical}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-red/70">{stats.errors}</p>
          <p className="text-xs text-muted-foreground">Errors</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-amber">{stats.warnings}</p>
          <p className="text-xs text-muted-foreground">Warnings</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-blue">{stats.info}</p>
          <p className="text-xs text-muted-foreground">Info</p>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No security events</p>
          </div>
        ) : (
          events.map((event) => (
            <SecurityEventItem key={event.id} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
