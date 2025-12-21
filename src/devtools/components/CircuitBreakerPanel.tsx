// Circuit Breaker Panel - Service resilience monitoring
import { useState, useEffect } from 'react';
import { Zap, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useCircuitBreakerStore,
  type CircuitBreaker,
  type CircuitState,
} from '../stores/circuitBreakerStore';

const STATE_CONFIG: Record<CircuitState, { color: string; icon: string; label: string }> = {
  closed: { color: 'text-signal-green', icon: '●', label: 'Healthy' },
  open: { color: 'text-signal-red', icon: '○', label: 'Tripped' },
  'half-open': { color: 'text-signal-amber', icon: '◐', label: 'Testing' },
};

function CircuitBreakerCard({ breaker }: { breaker: CircuitBreaker }) {
  const { resetBreaker } = useCircuitBreakerStore();
  const config = STATE_CONFIG[breaker.state];
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (breaker.state === 'open' && breaker.nextRetry) {
      const updateCountdown = () => {
        const remaining = Math.max(0, new Date(breaker.nextRetry!).getTime() - Date.now());
        setCountdown(Math.ceil(remaining / 1000));
      };
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
    setCountdown(null);
  }, [breaker.state, breaker.nextRetry]);

  const failurePercent = (breaker.failures / breaker.maxFailures) * 100;

  return (
    <div className="terminal-glass p-4 rounded-lg border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className={cn('text-2xl', config.color)}>{config.icon}</span>
          <div>
            <h4 className="font-mono font-semibold text-foreground">{breaker.service}</h4>
            <p className="text-xs text-muted-foreground">
              {breaker.failures}/{breaker.maxFailures} failures
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn('text-xs', 
            breaker.state === 'closed' && 'bg-signal-green/20 text-signal-green border-signal-green/30',
            breaker.state === 'open' && 'bg-signal-red/20 text-signal-red border-signal-red/30',
            breaker.state === 'half-open' && 'bg-signal-amber/20 text-signal-amber border-signal-amber/30'
          )}>
            {config.label}
          </Badge>
          {breaker.state === 'open' && (
            <Button size="sm" variant="outline" className="h-7" onClick={() => resetBreaker(breaker.id)}>
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Failure progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Failure Threshold</span>
          <span>{failurePercent.toFixed(0)}%</span>
        </div>
        <Progress 
          value={failurePercent} 
          className={cn(
            'h-2',
            failurePercent >= 100 && '[&>div]:bg-signal-red',
            failurePercent >= 60 && failurePercent < 100 && '[&>div]:bg-signal-amber',
            failurePercent < 60 && '[&>div]:bg-signal-green'
          )}
        />
      </div>

      {/* Countdown for open breakers */}
      {breaker.state === 'open' && countdown !== null && countdown > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-signal-amber">
          <RefreshCw className="w-3 h-3 animate-spin" />
          <span>Retry in {countdown}s</span>
        </div>
      )}

      {/* Last failure timestamp */}
      {breaker.lastFailure && (
        <p className="text-xs text-muted-foreground mt-2">
          Last failure: {new Date(breaker.lastFailure).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}

export function CircuitBreakerPanel() {
  const { breakers, getStats } = useCircuitBreakerStore();
  const stats = getStats();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-signal-amber" />
            Circuit Breakers
          </h1>
          <p className="text-sm text-muted-foreground">
            Service resilience monitoring
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-green">{stats.closed}</p>
          <p className="text-xs text-muted-foreground">Healthy</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-amber">{stats.halfOpen}</p>
          <p className="text-xs text-muted-foreground">Testing</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg text-center">
          <p className="text-lg font-mono font-bold text-signal-red">{stats.open}</p>
          <p className="text-xs text-muted-foreground">Tripped</p>
        </div>
      </div>

      {/* Overall health */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health
          </span>
          <span className={cn(
            'text-lg font-mono font-bold',
            stats.open === 0 ? 'text-signal-green' : stats.open === 1 ? 'text-signal-amber' : 'text-signal-red'
          )}>
            {Math.round(((stats.closed + stats.halfOpen * 0.5) / stats.total) * 100)}%
          </span>
        </div>
        <Progress 
          value={((stats.closed + stats.halfOpen * 0.5) / stats.total) * 100} 
          className="h-2"
        />
      </div>

      {/* Breaker Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {breakers.map((breaker) => (
          <CircuitBreakerCard key={breaker.id} breaker={breaker} />
        ))}
      </div>
    </div>
  );
}
