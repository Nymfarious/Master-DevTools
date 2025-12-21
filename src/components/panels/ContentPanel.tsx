// Content Inspector Panel - JSON viewer with schema validation
// Lines: ~320 | Status: GREEN
import { useState, useEffect, useMemo } from 'react';
import { 
  FileJson, RefreshCw, Copy, CheckCircle2, GitBranch, 
  Edit, ChevronDown, ChevronRight, AlertTriangle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface EntityType {
  id: string;
  label: string;
  table: string;
}

const ENTITY_TYPES: EntityType[] = [
  { id: 'pipeline_events', label: 'Pipeline Events', table: 'pipeline_events' },
  { id: 'api_registry', label: 'API Registry', table: 'api_registry' },
  { id: 'dev_logs', label: 'Dev Logs', table: 'dev_logs' },
  { id: 'profiles', label: 'User Profiles', table: 'profiles' },
  { id: 'user_roles', label: 'User Roles', table: 'user_roles' },
];

const SCHEMAS: Record<string, { required: string[]; optional: string[] }> = {
  pipeline_events: {
    required: ['id', 'step', 'provider', 'duration_ms', 'success', 'created_at'],
    optional: ['asset_id', 'error', 'metadata'],
  },
  api_registry: {
    required: ['id', 'name', 'vendor', 'category', 'status', 'auth_type'],
    optional: ['endpoint_url', 'purpose', 'response_time_ms', 'last_checked'],
  },
  dev_logs: {
    required: ['id', 'level', 'message', 'created_at'],
    optional: ['source', 'context'],
  },
  profiles: {
    required: ['id', 'user_id', 'created_at', 'updated_at'],
    optional: ['display_name', 'email', 'avatar_url'],
  },
  user_roles: {
    required: ['id', 'user_id', 'role', 'created_at'],
    optional: [],
  },
};

// Syntax highlighted JSON renderer
function JsonValue({ value, depth = 0 }: { value: any; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  
  if (value === null) {
    return <span className="text-signal-red font-mono">null</span>;
  }
  
  if (typeof value === 'boolean') {
    return <span className="text-signal-purple font-mono">{value.toString()}</span>;
  }
  
  if (typeof value === 'number') {
    return <span className="text-signal-cyan font-mono">{value}</span>;
  }
  
  if (typeof value === 'string') {
    // Check if it's a date
    if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
      return <span className="text-signal-amber font-mono">"{value}"</span>;
    }
    return <span className="text-signal-green font-mono">"{value}"</span>;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground font-mono">[]</span>;
    
    return (
      <span className="font-mono">
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronRight className="w-3 h-3 inline" />}
          <span className="text-muted-foreground">[</span>
          {!expanded && <span className="text-muted-foreground">...{value.length} items</span>}
          {!expanded && <span className="text-muted-foreground">]</span>}
        </button>
        {expanded && (
          <>
            <div className="pl-4 border-l border-border/30 ml-1">
              {value.map((item, i) => (
                <div key={i}>
                  <JsonValue value={item} depth={depth + 1} />
                  {i < value.length - 1 && <span className="text-muted-foreground">,</span>}
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">]</span>
          </>
        )}
      </span>
    );
  }
  
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length === 0) return <span className="text-muted-foreground font-mono">{'{}'}</span>;
    
    return (
      <span className="font-mono">
        <button onClick={() => setExpanded(!expanded)} className="text-muted-foreground hover:text-foreground">
          {expanded ? <ChevronDown className="w-3 h-3 inline" /> : <ChevronRight className="w-3 h-3 inline" />}
          <span className="text-muted-foreground">{'{'}</span>
          {!expanded && <span className="text-muted-foreground">...{keys.length} keys</span>}
          {!expanded && <span className="text-muted-foreground">{'}'}</span>}
        </button>
        {expanded && (
          <>
            <div className="pl-4 border-l border-border/30 ml-1">
              {keys.map((key, i) => (
                <div key={key}>
                  <span className="text-signal-blue">"{key}"</span>
                  <span className="text-muted-foreground">: </span>
                  <JsonValue value={value[key]} depth={depth + 1} />
                  {i < keys.length - 1 && <span className="text-muted-foreground">,</span>}
                </div>
              ))}
            </div>
            <span className="text-muted-foreground">{'}'}</span>
          </>
        )}
      </span>
    );
  }
  
  return <span className="text-muted-foreground font-mono">{String(value)}</span>;
}

export function ContentPanel() {
  const [entityType, setEntityType] = useState<string>('api_registry');
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState<{ valid: boolean; messages: string[] } | null>(null);
  const [showRelated, setShowRelated] = useState(false);

  // Fetch entities when type changes
  useEffect(() => {
    fetchEntities();
  }, [entityType]);

  const fetchEntities = async () => {
    setLoading(true);
    setSelectedEntity(null);
    setValidationResults(null);
    
    try {
      const { data, error } = await supabase
        .from(entityType as any)
        .select('*')
        .limit(50)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEntities(data || []);
    } catch (err) {
      console.error('Failed to fetch entities:', err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const validateSchema = () => {
    if (!selectedEntity) return;
    
    const schema = SCHEMAS[entityType];
    if (!schema) {
      setValidationResults({ valid: true, messages: ['No schema defined for this entity type'] });
      return;
    }
    
    const messages: string[] = [];
    let valid = true;
    
    // Check required fields
    for (const field of schema.required) {
      if (selectedEntity[field] === undefined || selectedEntity[field] === null) {
        messages.push(`❌ Missing required field: ${field}`);
        valid = false;
      } else {
        messages.push(`✅ Required field present: ${field}`);
      }
    }
    
    // Check optional fields
    for (const field of schema.optional) {
      if (selectedEntity[field] === null || selectedEntity[field] === undefined) {
        messages.push(`⚠️ Optional field is null: ${field}`);
      } else {
        messages.push(`✅ Optional field present: ${field}`);
      }
    }
    
    setValidationResults({ valid, messages });
  };

  const copyJson = async () => {
    if (!selectedEntity) return;
    await navigator.clipboard.writeText(JSON.stringify(selectedEntity, null, 2));
    toast.success('JSON copied to clipboard');
  };

  const getEntityLabel = (entity: any) => {
    return entity.name || entity.message?.slice(0, 40) || entity.step || entity.display_name || entity.id?.slice(0, 8);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <FileJson className="w-5 h-5 text-signal-blue" />
          Content Inspector
        </h1>
        <p className="text-sm text-muted-foreground">
          Inspect and validate entity data as JSON
        </p>
      </div>

      {/* Selectors */}
      <div className="flex items-center gap-3">
        <Select value={entityType} onValueChange={setEntityType}>
          <SelectTrigger className="w-44 h-9">
            <SelectValue placeholder="Entity Type" />
          </SelectTrigger>
          <SelectContent>
            {ENTITY_TYPES.map(type => (
              <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={selectedEntity?.id || ''} 
          onValueChange={(id) => {
            const entity = entities.find(e => e.id === id);
            setSelectedEntity(entity);
            setValidationResults(null);
            setShowRelated(false);
          }}
        >
          <SelectTrigger className="flex-1 h-9">
            <SelectValue placeholder="Select entity..." />
          </SelectTrigger>
          <SelectContent>
            {entities.map(entity => (
              <SelectItem key={entity.id} value={entity.id}>
                {getEntityLabel(entity)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button variant="outline" size="sm" onClick={fetchEntities} disabled={loading} className="h-9">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </Button>
      </div>

      {/* JSON Viewer */}
      <div className="terminal-glass rounded-lg overflow-hidden">
        <div className="p-4 max-h-[400px] overflow-auto">
          {selectedEntity ? (
            <div className="text-sm">
              <JsonValue value={selectedEntity} />
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileJson className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Select an entity to inspect</p>
              <p className="text-xs mt-1">{entities.length} entities available</p>
            </div>
          )}
        </div>
        
        {selectedEntity && (
          <div className="border-t border-border/50 p-3 flex items-center justify-between bg-surface/50">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{entityType}</Badge>
              {validationResults && (
                <Badge 
                  className={cn(
                    "text-[10px]",
                    validationResults.valid 
                      ? "bg-signal-green/20 text-signal-green border-signal-green/30" 
                      : "bg-signal-red/20 text-signal-red border-signal-red/30"
                  )}
                >
                  {validationResults.valid ? 'Valid' : 'Invalid'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyJson} className="h-7 text-xs gap-1">
                <Copy className="w-3 h-3" /> Copy JSON
              </Button>
              <Button variant="outline" size="sm" onClick={validateSchema} className="h-7 text-xs gap-1">
                <CheckCircle2 className="w-3 h-3" /> Validate
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowRelated(!showRelated)} 
                className="h-7 text-xs gap-1"
              >
                <GitBranch className="w-3 h-3" /> Related
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Results */}
      {validationResults && (
        <div className="terminal-glass p-4 rounded-lg space-y-2">
          <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className={cn(
              "w-4 h-4",
              validationResults.valid ? "text-signal-green" : "text-signal-red"
            )} />
            Schema Validation
          </h3>
          <div className="space-y-1">
            {validationResults.messages.map((msg, i) => (
              <p key={i} className="text-xs font-mono text-muted-foreground">{msg}</p>
            ))}
          </div>
        </div>
      )}

      {/* Related Entities */}
      {showRelated && selectedEntity && (
        <div className="terminal-glass p-4 rounded-lg space-y-3">
          <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-signal-purple" />
            Related Entities
          </h3>
          <div className="space-y-2 text-sm">
            {entityType === 'api_registry' && (
              <div className="flex items-center justify-between p-2 bg-surface rounded border border-border/50">
                <span className="text-muted-foreground">Pipeline Events using this API</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">Inspect</Button>
              </div>
            )}
            {entityType === 'pipeline_events' && selectedEntity.asset_id && (
              <div className="flex items-center justify-between p-2 bg-surface rounded border border-border/50">
                <span className="text-foreground font-mono">{selectedEntity.asset_id}</span>
                <Badge variant="outline" className="text-[10px]">Asset</Badge>
              </div>
            )}
            {entityType === 'profiles' && (
              <div className="flex items-center justify-between p-2 bg-surface rounded border border-border/50">
                <span className="text-muted-foreground">User Roles</span>
                <Button variant="ghost" size="sm" className="h-6 text-xs">View Roles</Button>
              </div>
            )}
            {(!selectedEntity.asset_id && entityType === 'pipeline_events') && (
              <p className="text-xs text-muted-foreground">No related entities found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
