// API Registry Panel - Displays all registered APIs with health status
// Lines: ~175 | Status: GREEN
import { useState, useEffect } from 'react';
import { 
  Network, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle,
  ExternalLink, Key, Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface APIEntry {
  id: string;
  name: string;
  vendor: string;
  category: string;
  status: string;
  auth_type: string;
  endpoint_url: string | null;
  purpose: string | null;
  response_time_ms: number | null;
  last_checked: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-signal-green/20 text-signal-green border-signal-green/30',
  planned: 'bg-signal-blue/20 text-signal-blue border-signal-blue/30',
  deprecated: 'bg-signal-amber/20 text-signal-amber border-signal-amber/30',
  disabled: 'bg-signal-red/20 text-signal-red border-signal-red/30',
};

const CATEGORY_STYLES: Record<string, string> = {
  ai: 'text-signal-purple',
  audio: 'text-signal-cyan',
  storage: 'text-signal-green',
  animation: 'text-signal-amber',
};

function APICard({ api, onRefresh }: { api: APIEntry; onRefresh: () => void }) {
  const [checking, setChecking] = useState(false);

  const checkHealth = async () => {
    if (!api.endpoint_url) return;
    setChecking(true);
    const startTime = performance.now();
    
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      
      await fetch(api.endpoint_url, { 
        method: 'HEAD', 
        signal: controller.signal,
        mode: 'no-cors' 
      });
      
      const responseTime = Math.round(performance.now() - startTime);
      
      await supabase
        .from('api_registry')
        .update({ 
          response_time_ms: responseTime, 
          last_checked: new Date().toISOString() 
        })
        .eq('id', api.id);
      
      onRefresh();
    } catch {
      console.error('Health check failed for', api.name);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="terminal-glass p-4 rounded-lg space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", 
            api.status === 'active' ? 'bg-signal-green animate-pulse' : 'bg-muted-foreground'
          )} />
          <h3 className="font-mono font-semibold text-foreground">{api.name}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px]", STATUS_STYLES[api.status])}>
          {api.status}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-medium">{api.vendor}</span>
        <span className="text-border">•</span>
        <span className={CATEGORY_STYLES[api.category]}>{api.category}</span>
      </div>

      {api.purpose && (
        <p className="text-xs text-muted-foreground line-clamp-2">{api.purpose}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Key className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{api.auth_type}</span>
          </div>
          {api.response_time_ms && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className={cn(
                "font-mono",
                api.response_time_ms < 300 && "text-signal-green",
                api.response_time_ms >= 300 && api.response_time_ms < 1000 && "text-signal-amber",
                api.response_time_ms >= 1000 && "text-signal-red"
              )}>
                {api.response_time_ms}ms
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {api.endpoint_url && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={checkHealth}
                disabled={checking}
              >
                <RefreshCw className={cn("w-3 h-3", checking && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                asChild
              >
                <a href={api.endpoint_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {api.last_checked && (
        <p className="text-[10px] text-muted-foreground">
          Last checked {formatDistanceToNow(new Date(api.last_checked), { addSuffix: true })}
        </p>
      )}
    </div>
  );
}

export function APIRegistryPanel() {
  const [apis, setApis] = useState<APIEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchAPIs = async () => {
    const { data, error } = await supabase
      .from('api_registry')
      .select('*')
      .order('category', { ascending: true });
    
    if (!error && data) {
      setApis(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAPIs();
  }, []);

  const categories = [...new Set(apis.map(a => a.category))];
  const filteredAPIs = filter ? apis.filter(a => a.category === filter) : apis;

  const stats = {
    total: apis.length,
    active: apis.filter(a => a.status === 'active').length,
    planned: apis.filter(a => a.status === 'planned').length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-signal-cyan" />
            API Registry
          </h1>
          <p className="text-sm text-muted-foreground">
            All registered APIs with health monitoring
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAPIs} className="h-8 gap-1.5">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Total APIs</p>
          <p className="text-xl font-mono font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-xl font-mono font-bold text-signal-green">{stats.active}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Planned</p>
          <p className="text-xl font-mono font-bold text-signal-blue">{stats.planned}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        {categories.map(cat => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            className="h-7 text-xs"
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* API Grid */}
      {loading ? (
        <div className="terminal-glass p-8 rounded-lg text-center">
          <RefreshCw className="w-6 h-6 text-muted-foreground mx-auto mb-2 animate-spin" />
          <p className="text-sm text-muted-foreground">Loading APIs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredAPIs.map(api => (
            <APICard key={api.id} api={api} onRefresh={fetchAPIs} />
          ))}
        </div>
      )}
    </div>
  );
}