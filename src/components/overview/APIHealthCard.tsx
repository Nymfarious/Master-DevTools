// API Health Card - Shows live API endpoint health
// Lines: ~110 | Status: GREEN
import { useEffect, useState } from 'react';
import { Network, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusLight } from '@/components/ui/StatusLight';
import { useAPIHealthStore, checkAPIHealth } from '@/stores/apiHealthStore';
import { cn } from '@/lib/utils';

export function APIHealthCard() {
  const { endpoints, isChecking, setEndpointStatus, setChecking } = useAPIHealthStore();
  const [checkingAll, setCheckingAll] = useState(false);

  const checkEndpoint = async (id: string) => {
    const endpoint = endpoints.find(ep => ep.id === id);
    if (!endpoint) return;
    
    setChecking(id, true);
    const result = await checkAPIHealth(endpoint);
    setEndpointStatus(id, result);
    setChecking(id, false);
  };

  const checkAllEndpoints = async () => {
    setCheckingAll(true);
    for (const endpoint of endpoints) {
      await checkEndpoint(endpoint.id);
    }
    setCheckingAll(false);
  };

  // Check on mount only - NO interval polling
  useEffect(() => {
    checkAllEndpoints();
    // Removed: 60-second interval that consumed API quota
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="section-header">
          <Network className="w-3.5 h-3.5" />
          API Health
        </h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkAllEndpoints}
          disabled={checkingAll}
          className="h-7 text-xs gap-1.5"
        >
          <RefreshCw className={cn("w-3 h-3", checkingAll && "animate-spin")} />
          Refresh
        </Button>
      </div>
      
      <div className="space-y-2">
        {endpoints.map((endpoint) => {
          const checking = isChecking[endpoint.id];
          
          return (
            <div 
              key={endpoint.id}
              className={cn(
                "terminal-glass p-3 rounded-lg flex items-center gap-3",
                "transition-all duration-300",
                checking && "ring-1 ring-signal-blue/30"
              )}
            >
              <StatusLight 
                status={checking ? 'unknown' : endpoint.status} 
                size="md" 
                pulse={checking}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display font-medium text-sm text-foreground">
                    {endpoint.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {endpoint.vendor}
                  </span>
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {endpoint.endpoint}
                </p>
              </div>
              
              <div className="text-right">
                {endpoint.responseTime && !checking && (
                  <p className={cn(
                    "text-xs font-mono",
                    endpoint.responseTime < 300 && "text-signal-green",
                    endpoint.responseTime >= 300 && endpoint.responseTime < 1000 && "text-signal-amber",
                    endpoint.responseTime >= 1000 && "text-signal-red"
                  )}>
                    {endpoint.responseTime}ms
                  </p>
                )}
                {endpoint.lastChecked && !checking && (
                  <p className="text-[10px] text-muted-foreground">
                    {endpoint.lastChecked.toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              <a
                href={endpoint.endpoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
