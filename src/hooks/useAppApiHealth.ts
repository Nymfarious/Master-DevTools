// Hook for app-specific API health - merges local store with registry data
import { useMemo } from 'react';
import { useAPIHealthStore } from '@/stores/apiHealthStore';
import type { EchoverseApp } from '@/config/apps';
import type { HealthStatus } from '@/types/devtools';

export interface AppApiHealthStatus {
  id: string;
  name: string;
  status: HealthStatus;
  responseTime?: number;
  vendor?: string;
  purpose?: string;
}

export interface AppServiceHealthStatus {
  service: 'database' | 'auth' | 'storage' | 'realtime';
  status: HealthStatus;
}

export interface UseAppApiHealthResult {
  apis: AppApiHealthStatus[];
  services: AppServiceHealthStatus[];
  overallHealth: HealthStatus;
  isChecking: boolean;
}

// Simulate service health (in production, this would check actual endpoints)
function getServiceHealth(service: string): HealthStatus {
  // For now, assume services are healthy if configured
  return 'healthy';
}

export function useAppApiHealth(app: EchoverseApp): UseAppApiHealthResult {
  const { endpoints, isChecking } = useAPIHealthStore();
  
  const apis = useMemo(() => {
    if (!app.apiDependencies?.length) return [];
    
    return app.apiDependencies.map((dep): AppApiHealthStatus => {
      const endpoint = endpoints.find(
        (e) => e.id.toLowerCase() === dep.toLowerCase()
      );
      
      return {
        id: dep.toLowerCase(),
        name: dep.charAt(0).toUpperCase() + dep.slice(1),
        status: endpoint?.status || 'unknown',
        responseTime: endpoint?.responseTime,
        vendor: endpoint?.vendor,
      };
    });
  }, [app.apiDependencies, endpoints]);

  const services = useMemo(() => {
    if (!app.healthConfig?.requiredServices?.length) return [];
    
    return app.healthConfig.requiredServices.map((service): AppServiceHealthStatus => ({
      service,
      status: getServiceHealth(service),
    }));
  }, [app.healthConfig?.requiredServices]);

  const overallHealth = useMemo((): HealthStatus => {
    const allStatuses = [
      ...apis.map(a => a.status),
      ...services.map(s => s.status),
    ];
    
    if (allStatuses.length === 0) return 'unknown';
    if (allStatuses.some(s => s === 'down')) return 'down';
    if (allStatuses.some(s => s === 'degraded')) return 'degraded';
    if (allStatuses.every(s => s === 'healthy')) return 'healthy';
    return 'unknown';
  }, [apis, services]);

  const isAnyChecking = useMemo(() => {
    return Object.values(isChecking).some(Boolean);
  }, [isChecking]);

  return {
    apis,
    services,
    overallHealth,
    isChecking: isAnyChecking,
  };
}
