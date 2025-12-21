// Quick API Status - Compact API health view
import { Check, X, Loader2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAPIHealthStore, checkAPIHealth } from '@/stores/apiHealthStore';
import { useEffect } from 'react';
import type { HealthStatus } from '@/types/devtools';

const statusConfig: Record<HealthStatus, { icon: typeof Check; color: string }> = {
  healthy: { icon: Check, color: 'text-signal-green' },
  degraded: { icon: Circle, color: 'text-signal-amber' },
  down: { icon: X, color: 'text-signal-red' },
  unknown: { icon: Circle, color: 'text-muted-foreground' },
};

export function QuickAPIStatus() {
  const { endpoints, isChecking, setEndpointStatus, setChecking } = useAPIHealthStore();

  // Auto-check on mount
  useEffect(() => {
    endpoints.forEach(async (endpoint) => {
      if (endpoint.status === 'unknown') {
        setChecking(endpoint.id, true);
        const result = await checkAPIHealth(endpoint);
        setEndpointStatus(endpoint.id, result);
        setChecking(endpoint.id, false);
      }
    });
  }, []);

  return (
    <div className="flex items-center gap-3">
      {endpoints.map((endpoint) => {
        const config = statusConfig[endpoint.status];
        const checking = isChecking[endpoint.id];
        const Icon = config.icon;

        return (
          <div
            key={endpoint.id}
            className="flex items-center gap-1.5 text-xs"
            title={`${endpoint.name}: ${endpoint.status}${endpoint.responseTime ? ` (${endpoint.responseTime}ms)` : ''}`}
          >
            {checking ? (
              <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
            ) : (
              <Icon className={cn('w-3 h-3', config.color)} />
            )}
            <span className="text-muted-foreground font-mono">{endpoint.name}</span>
          </div>
        );
      })}
    </div>
  );
}
