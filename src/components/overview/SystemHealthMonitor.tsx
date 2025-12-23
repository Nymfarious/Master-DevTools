// System Health Monitor - Shows API, Database, Auth status with health checks
import { useState } from 'react';
import { Activity, RefreshCw, Server, Database, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusLight } from '@/components/ui/StatusLight';
import { useSystemStore } from '@/stores/systemStore';
import { useLogsStore } from '@/stores/logsStore';
import { cn } from '@/lib/utils';
import type { HealthStatus } from '@/types/devtools';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const SERVICE_ICONS = {
  api: Server,
  database: Database,
  auth: Shield,
};

const SERVICE_LABELS = {
  api: 'API Server',
  database: 'Database',
  auth: 'Authentication',
};

const SERVICE_DESCRIPTIONS = {
  api: 'Backend API server health - monitors REST endpoints and response times',
  database: 'Database connectivity - checks query performance and connection pool',
  auth: 'Authentication service - verifies login, session, and token handling',
};

export function SystemHealthMonitor() {
  const { systemHealth, setServiceHealth } = useSystemStore();
  const { addLog } = useLogsStore();
  const [checking, setChecking] = useState<Record<string, boolean>>({});

  const checkHealth = async (service: keyof typeof systemHealth) => {
    setChecking((prev) => ({ ...prev, [service]: true }));
    setServiceHealth(service, { status: 'unknown', message: 'Checking...' });

    // Simulate health check with random delay
    const delay = 200 + Math.random() * 600;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 90% healthy, 10% degraded
    const isHealthy = Math.random() > 0.1;
    const status: HealthStatus = isHealthy ? 'healthy' : 'degraded';
    const responseTime = Math.round(delay);

    setServiceHealth(service, {
      status,
      message: isHealthy ? 'All systems nominal' : 'Slow response detected',
      responseTime,
    });

    addLog(
      isHealthy ? 'success' : 'warn',
      `Health check ${service}: ${status} (${responseTime}ms)`,
      { service, responseTime },
      'health-check'
    );

    setChecking((prev) => ({ ...prev, [service]: false }));
  };

  const checkAll = async () => {
    const services = Object.keys(systemHealth) as Array<
      keyof typeof systemHealth
    >;
    for (const service of services) {
      await checkHealth(service);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Services
            </span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={checkAll}
                className="h-7 text-xs gap-1.5"
              >
                <RefreshCw
                  className={cn(
                    'w-3 h-3',
                    Object.values(checking).some(Boolean) && 'animate-spin'
                  )}
                />
                Check All
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs max-w-[200px]">
              Run health checks on all backend services sequentially
            </TooltipContent>
          </Tooltip>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(
            Object.entries(systemHealth) as Array<
              [keyof typeof systemHealth, (typeof systemHealth)['api']]
            >
          ).map(([key, value]) => {
            const Icon = SERVICE_ICONS[key];
            const isChecking = checking[key];

            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'terminal-glass p-4 rounded-lg cursor-help',
                      'transition-all duration-300',
                      isChecking && 'ring-1 ring-signal-blue/30'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="relative">
                        <StatusLight
                          status={value.status}
                          size="lg"
                          pulse={isChecking}
                        />
                      </div>
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="font-display font-semibold text-foreground text-sm">
                      {SERVICE_LABELS[key]}
                    </p>
                    <p
                      className={cn(
                        'text-xs mt-0.5',
                        value.status === 'healthy' && 'text-signal-green',
                        value.status === 'degraded' && 'text-signal-amber',
                        value.status === 'down' && 'text-signal-red',
                        value.status === 'unknown' && 'text-muted-foreground'
                      )}
                    >
                      {isChecking
                        ? 'Checking...'
                        : value.status === 'healthy'
                          ? 'Healthy'
                          : value.status}
                    </p>
                    {value.responseTime && !isChecking && (
                      <p className="text-xs font-mono text-muted-foreground mt-1">
                        {value.responseTime}ms
                      </p>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs max-w-[220px]">
                  {SERVICE_DESCRIPTIONS[key]}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </section>
    </TooltipProvider>
  );
}
