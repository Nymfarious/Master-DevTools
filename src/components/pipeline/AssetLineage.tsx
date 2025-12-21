// Asset Lineage - Visual timeline of asset transformations
// Lines: ~180 | Status: GREEN
import { useState, useEffect } from 'react';
import { 
  CheckCircle2, XCircle, ArrowRight, Clock, Loader2, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePipelineStore, type PipelineEvent } from '@/stores/pipelineStore';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

interface LineageNode {
  step: string;
  provider: string;
  duration: number;
  success: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
  error?: string;
}

function LineageNodeCard({ node, isLast }: { node: LineageNode; isLast: boolean }) {
  return (
    <div className="flex items-center">
      <div className={cn(
        "w-28 p-3 rounded-lg border text-center",
        node.success 
          ? "bg-signal-green/10 border-signal-green/30" 
          : "bg-signal-red/10 border-signal-red/30"
      )}>
        <div className="text-[10px] font-mono uppercase text-muted-foreground">
          {node.step.replace(/_/g, ' ')}
        </div>
        <div className="text-sm font-medium text-foreground mt-1 truncate">
          {node.provider}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
          <Clock className="w-3 h-3" />
          {(node.duration / 1000).toFixed(1)}s
        </div>
        <div className="mt-2">
          {node.success ? (
            <CheckCircle2 className="w-4 h-4 text-signal-green mx-auto" />
          ) : (
            <XCircle className="w-4 h-4 text-signal-red mx-auto" />
          )}
        </div>
      </div>
      
      {!isLast && (
        <div className="mx-2 flex items-center">
          <div className="w-6 h-0.5 bg-gradient-to-r from-signal-green to-signal-blue" />
          <ArrowRight className="w-4 h-4 text-muted-foreground -ml-1" />
        </div>
      )}
    </div>
  );
}

export function AssetLineage() {
  const { events } = usePipelineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  
  // Get unique asset IDs
  const assetIds = [...new Set(events.filter(e => e.asset_id).map(e => e.asset_id!))];
  
  // Filter assets by search
  const filteredAssets = assetIds.filter(id => 
    id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get events for selected asset
  const assetEvents = selectedAsset 
    ? events
        .filter(e => e.asset_id === selectedAsset)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];
  
  // Convert to lineage nodes
  const lineageNodes: LineageNode[] = assetEvents.map(event => ({
    step: event.step,
    provider: event.provider,
    duration: event.duration_ms,
    success: event.success,
    timestamp: new Date(event.created_at),
    metadata: event.metadata as Record<string, any> | undefined,
    error: event.error || undefined,
  }));
  
  // Calculate total pipeline time
  const totalTime = lineageNodes.reduce((sum, node) => sum + node.duration, 0);
  const firstEvent = lineageNodes[0];

  if (assetIds.length === 0) {
    return (
      <div className="terminal-glass p-8 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">
          No assets with pipeline events found. Run Demo Mode to generate sample data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Asset Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      
      {/* Asset List */}
      {!selectedAsset && (
        <div className="terminal-glass rounded-lg divide-y divide-border/30 max-h-[300px] overflow-y-auto">
          {filteredAssets.map(assetId => {
            const assetEventsCount = events.filter(e => e.asset_id === assetId).length;
            return (
              <button
                key={assetId}
                onClick={() => setSelectedAsset(assetId)}
                className="w-full p-3 flex items-center justify-between hover:bg-elevated/50 text-left"
              >
                <span className="font-mono text-sm text-foreground truncate">{assetId}</span>
                <Badge variant="outline" className="text-[10px]">{assetEventsCount} steps</Badge>
              </button>
            );
          })}
        </div>
      )}
      
      {/* Lineage View */}
      {selectedAsset && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-mono text-sm text-foreground">{selectedAsset}</h3>
              <p className="text-xs text-muted-foreground">
                {lineageNodes.length} transformation steps
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedAsset(null)}>
              Back to List
            </Button>
          </div>
          
          {/* Timeline */}
          <div className="terminal-glass p-4 rounded-lg overflow-x-auto">
            <div className="flex items-center min-w-max">
              {lineageNodes.map((node, i) => (
                <LineageNodeCard key={i} node={node} isLast={i === lineageNodes.length - 1} />
              ))}
            </div>
          </div>
          
          {/* Summary */}
          <div className="terminal-glass p-3 rounded-lg flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Total Pipeline Time: </span>
              <span className="font-mono text-signal-cyan">{(totalTime / 1000).toFixed(1)}s</span>
            </div>
            {firstEvent && (
              <span className="text-xs text-muted-foreground">
                Created: {format(firstEvent.timestamp, 'MMM d, yyyy')} at {format(firstEvent.timestamp, 'HH:mm')}
              </span>
            )}
          </div>
          
          {/* Transformation Details */}
          <div className="terminal-glass p-4 rounded-lg space-y-3">
            <h4 className="font-mono font-semibold text-foreground text-sm">TRANSFORMATION DETAILS</h4>
            
            <div className="space-y-4">
              {lineageNodes.map((node, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    {node.success ? (
                      <CheckCircle2 className="w-4 h-4 text-signal-green" />
                    ) : (
                      <XCircle className="w-4 h-4 text-signal-red" />
                    )}
                    <span className="font-mono text-sm text-foreground">
                      Step {i + 1}: {node.step.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="ml-6 text-xs text-muted-foreground space-y-0.5">
                    <p>Provider: {node.provider}</p>
                    <p>Duration: {node.duration}ms</p>
                    {node.error && (
                      <p className="text-signal-red">Error: {node.error}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
