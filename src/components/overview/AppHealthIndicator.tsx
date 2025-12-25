// App Health Indicator - Shows app-specific API and service health
import { cn } from '@/lib/utils';
import { ApiHealthBadge } from '@/components/ui/ApiHealthBadge';
import { ServiceHealthBadge } from '@/components/ui/ServiceHealthBadge';
import { useAppApiHealth } from '@/hooks/useAppApiHealth';
import type { EchoverseApp } from '@/config/apps';
import { RefreshCw, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';

interface AppHealthIndicatorProps {
  app: EchoverseApp;
  compact?: boolean;
}

export function AppHealthIndicator({ app, compact = false }: AppHealthIndicatorProps) {
  const { apis, services, overallHealth, isChecking } = useAppApiHealth(app);
  
  const hasHealthData = apis.length > 0 || services.length > 0;
  
  if (!hasHealthData) {
    return null;
  }

  if (compact) {
    // Compact mode: just show overall health icon
    return (
      <div className="flex items-center gap-1">
        {isChecking ? (
          <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" />
        ) : overallHealth === 'healthy' ? (
          <CheckCircle2 className="w-3 h-3 text-green-400" />
        ) : overallHealth === 'degraded' ? (
          <AlertCircle className="w-3 h-3 text-yellow-400" />
        ) : overallHealth === 'down' ? (
          <AlertCircle className="w-3 h-3 text-red-400" />
        ) : (
          <HelpCircle className="w-3 h-3 text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Required Services */}
      {services.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
            Services
          </p>
          <div className="flex flex-wrap gap-2">
            {services.map(({ service, status }) => (
              <ServiceHealthBadge
                key={service}
                service={service}
                status={status}
              />
            ))}
          </div>
        </div>
      )}

      {/* API Dependencies */}
      {apis.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">
            APIs
          </p>
          <div className="flex flex-wrap gap-1.5">
            {apis.map((api) => (
              <ApiHealthBadge
                key={api.id}
                name={api.name}
                status={api.status}
                responseTime={api.responseTime}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
