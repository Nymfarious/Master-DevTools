// Security Panel - Monitors edge functions and RLS policies
// Lines: ~180 | Status: GREEN
import { useState } from 'react';
import { 
  Shield, Lock, Unlock, AlertTriangle, CheckCircle2, 
  Database, Zap, RefreshCw, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TablePolicy {
  table: string;
  rlsEnabled: boolean;
  policies: { name: string; operation: string }[];
}

interface EdgeFunction {
  name: string;
  status: 'deployed' | 'pending' | 'error';
  lastDeployed?: string;
  jwtRequired: boolean;
}

// Static data for demo - in production, this would come from introspection
const TABLES: TablePolicy[] = [
  {
    table: 'profiles',
    rlsEnabled: true,
    policies: [
      { name: 'Users can view own profile', operation: 'SELECT' },
      { name: 'Users can update own profile', operation: 'UPDATE' },
      { name: 'Users can insert own profile', operation: 'INSERT' },
    ],
  },
  {
    table: 'user_roles',
    rlsEnabled: true,
    policies: [
      { name: 'Users can view own roles', operation: 'SELECT' },
      { name: 'Admins can view all roles', operation: 'SELECT' },
      { name: 'Admins can manage roles', operation: 'ALL' },
    ],
  },
  {
    table: 'api_registry',
    rlsEnabled: true,
    policies: [
      { name: 'Anyone can view APIs', operation: 'SELECT' },
      { name: 'Admins can manage APIs', operation: 'ALL' },
    ],
  },
  {
    table: 'dev_logs',
    rlsEnabled: true,
    policies: [
      { name: 'Admins can view logs', operation: 'SELECT' },
      { name: 'Admins can manage logs', operation: 'ALL' },
    ],
  },
  {
    table: 'pipeline_events',
    rlsEnabled: true,
    policies: [
      { name: 'Admins can view pipeline events', operation: 'SELECT' },
      { name: 'Admins can manage pipeline events', operation: 'ALL' },
    ],
  },
];

const EDGE_FUNCTIONS: EdgeFunction[] = [
  { name: 'No edge functions deployed', status: 'pending', jwtRequired: true },
];

function TableRow({ policy }: { policy: TablePolicy }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="terminal-glass rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-elevated/50"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-sm text-foreground">{policy.table}</span>
        </div>
        <div className="flex items-center gap-2">
          {policy.rlsEnabled ? (
            <Badge className="bg-signal-green/20 text-signal-green border-signal-green/30 text-[10px]">
              <Lock className="w-3 h-3 mr-1" />
              RLS Enabled
            </Badge>
          ) : (
            <Badge className="bg-signal-red/20 text-signal-red border-signal-red/30 text-[10px]">
              <Unlock className="w-3 h-3 mr-1" />
              RLS Disabled
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {policy.policies.length} policies
          </span>
        </div>
      </button>
      
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50">
          <div className="mt-2 space-y-1">
            {policy.policies.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-muted-foreground">{p.name}</span>
                <Badge variant="outline" className="text-[10px]">{p.operation}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SecurityPanel() {
  const tablesWithRLS = TABLES.filter(t => t.rlsEnabled).length;
  const totalPolicies = TABLES.reduce((sum, t) => sum + t.policies.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-signal-green" />
            Security Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            RLS policies and edge function security
          </p>
        </div>
      </div>

      {/* Security Score */}
      <div className="terminal-glass p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-mono font-semibold text-foreground">Security Score</h3>
          <span className="text-2xl font-mono font-bold text-signal-green">
            {Math.round((tablesWithRLS / TABLES.length) * 100)}%
          </span>
        </div>
        <div className="h-2 bg-surface rounded-full overflow-hidden">
          <div 
            className="h-full bg-signal-green transition-all"
            style={{ width: `${(tablesWithRLS / TABLES.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {tablesWithRLS} of {TABLES.length} tables have RLS enabled
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Tables Monitored</p>
          <p className="text-xl font-mono font-bold text-foreground">{TABLES.length}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">RLS Policies</p>
          <p className="text-xl font-mono font-bold text-signal-cyan">{totalPolicies}</p>
        </div>
        <div className="terminal-glass p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Edge Functions</p>
          <p className="text-xl font-mono font-bold text-signal-purple">{EDGE_FUNCTIONS.length}</p>
        </div>
      </div>

      {/* Tables Section */}
      <div>
        <h3 className="font-mono font-semibold text-foreground mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Database Tables
        </h3>
        <div className="space-y-2">
          {TABLES.map(table => (
            <TableRow key={table.table} policy={table} />
          ))}
        </div>
      </div>

      {/* Edge Functions Section */}
      <div>
        <h3 className="font-mono font-semibold text-foreground mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Edge Functions
        </h3>
        <div className="space-y-2">
          {EDGE_FUNCTIONS.map((fn, i) => (
            <div key={i} className="terminal-glass p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  fn.status === 'deployed' && "bg-signal-green",
                  fn.status === 'pending' && "bg-signal-amber",
                  fn.status === 'error' && "bg-signal-red"
                )} />
                <span className="font-mono text-sm text-muted-foreground">{fn.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {fn.jwtRequired ? (
                  <Badge className="bg-signal-green/20 text-signal-green border-signal-green/30 text-[10px]">
                    <Lock className="w-3 h-3 mr-1" />
                    JWT Required
                  </Badge>
                ) : (
                  <Badge className="bg-signal-amber/20 text-signal-amber border-signal-amber/30 text-[10px]">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Public
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}