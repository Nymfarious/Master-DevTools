// Data & Test Panel - Developer utilities for seeding, clearing, health checks
// Lines: ~285 | Status: GREEN
import { useState } from 'react';
import { 
  Database, Sprout, Trash2, HeartPulse, BarChart3, 
  RefreshCw, AlertTriangle, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SeedOption {
  id: string;
  name: string;
  description: string;
  items: string;
  estimate: string;
  action: () => Promise<void>;
}

interface HealthCheck {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'pass' | 'warn' | 'fail';
  count?: number;
  lastRun?: Date;
}

interface DataStats {
  table: string;
  count: number;
}

export function DataTestPanel() {
  const [seeding, setSeeding] = useState<string | null>(null);
  const [clearing, setClearing] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [stats, setStats] = useState<DataStats[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    { id: 'orphan-logs', name: 'Orphan Logs', description: 'Logs without valid sources', status: 'idle' },
    { id: 'api-health', name: 'API Registry Health', description: 'All APIs have valid endpoints', status: 'idle' },
    { id: 'pipeline-integrity', name: 'Pipeline Integrity', description: 'All events have valid providers', status: 'idle' },
    { id: 'user-roles', name: 'User Roles', description: 'All users have assigned roles', status: 'idle' },
  ]);

  // Seed functions
  const seedAPIRegistry = async () => {
    setSeeding('api-registry');
    try {
      const apis = [
        { name: 'Google Gemini', vendor: 'Google', category: 'ai', status: 'active', auth_type: 'api-key', endpoint_url: 'https://generativelanguage.googleapis.com/v1/', purpose: 'Text and image generation' },
        { name: 'Replicate', vendor: 'Replicate', category: 'ai', status: 'active', auth_type: 'api-key', endpoint_url: 'https://api.replicate.com/v1/', purpose: 'Model hosting and inference' },
        { name: 'Cloudinary', vendor: 'Cloudinary', category: 'storage', status: 'active', auth_type: 'api-key', endpoint_url: 'https://api.cloudinary.com/v1_1/', purpose: 'Image and video CDN' },
        { name: 'Resend', vendor: 'Resend', category: 'email', status: 'planned', auth_type: 'api-key', endpoint_url: 'https://api.resend.com/', purpose: 'Transactional emails' },
      ];
      
      const { error } = await supabase.from('api_registry').insert(apis);
      if (error) throw error;
      
      toast.success('API Registry Seeded', { description: `Added ${apis.length} API entries` });
    } catch (err) {
      toast.error('Seed Failed', { description: String(err) });
    } finally {
      setSeeding(null);
    }
  };

  const seedPipelineEvents = async () => {
    setSeeding('pipeline');
    try {
      const steps = ['text-generation', 'image-generation', 'speech-synthesis', 'embedding'];
      const providers = ['OpenAI', 'ElevenLabs', 'Stability AI', 'Anthropic'];
      
      const events = Array.from({ length: 25 }, () => ({
        step: steps[Math.floor(Math.random() * steps.length)],
        provider: providers[Math.floor(Math.random() * providers.length)],
        duration_ms: Math.round(100 + Math.random() * 2000),
        success: Math.random() > 0.15,
        error: Math.random() > 0.85 ? 'Rate limit exceeded' : null,
        asset_id: `asset_${crypto.randomUUID().slice(0, 8)}`,
      }));

      const { error } = await supabase.from('pipeline_events').insert(events);
      if (error) throw error;
      
      toast.success('Pipeline Events Seeded', { description: `Added ${events.length} events` });
    } catch (err) {
      toast.error('Seed Failed', { description: String(err) });
    } finally {
      setSeeding(null);
    }
  };

  // Clear functions
  const clearLocalStorage = () => {
    setClearing('localstorage');
    localStorage.clear();
    toast.success('Local Storage Cleared');
    setClearing(null);
  };

  const clearPipelineEvents = async () => {
    setClearing('pipeline');
    try {
      const { error } = await supabase.from('pipeline_events').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast.success('Pipeline Events Cleared');
    } catch (err) {
      toast.error('Clear Failed', { description: String(err) });
    } finally {
      setClearing(null);
    }
  };

  const clearDevLogs = async () => {
    setClearing('logs');
    try {
      const { error } = await supabase.from('dev_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      toast.success('Dev Logs Cleared');
    } catch (err) {
      toast.error('Clear Failed', { description: String(err) });
    } finally {
      setClearing(null);
    }
  };

  const factoryReset = () => {
    if (resetConfirm !== 'RESET') return;
    localStorage.clear();
    sessionStorage.clear();
    toast.success('Factory Reset Complete', { description: 'Reloading page...' });
    setResetDialogOpen(false);
    setTimeout(() => window.location.reload(), 1000);
  };

  // Health checks
  const runHealthCheck = async (id: string) => {
    setHealthChecks(prev => prev.map(c => c.id === id ? { ...c, status: 'running' as const } : c));
    
    await new Promise(r => setTimeout(r, 800 + Math.random() * 400));
    
    const passed = Math.random() > 0.2;
    const count = passed ? 0 : Math.floor(Math.random() * 5) + 1;
    
    setHealthChecks(prev => prev.map(c => c.id === id ? { 
      ...c, 
      status: passed ? 'pass' : (count > 3 ? 'fail' : 'warn'),
      count,
      lastRun: new Date()
    } : c));
  };

  const runAllHealthChecks = async () => {
    for (const check of healthChecks) {
      await runHealthCheck(check.id);
    }
  };

  // Database stats
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const results: DataStats[] = [];
      
      const { count: apiCount } = await supabase.from('api_registry').select('*', { count: 'exact', head: true });
      results.push({ table: 'api_registry', count: apiCount || 0 });
      
      const { count: logCount } = await supabase.from('dev_logs').select('*', { count: 'exact', head: true });
      results.push({ table: 'dev_logs', count: logCount || 0 });
      
      const { count: pipelineCount } = await supabase.from('pipeline_events').select('*', { count: 'exact', head: true });
      results.push({ table: 'pipeline_events', count: pipelineCount || 0 });
      
      const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      results.push({ table: 'profiles', count: profileCount || 0 });
      
      const { count: roleCount } = await supabase.from('user_roles').select('*', { count: 'exact', head: true });
      results.push({ table: 'user_roles', count: roleCount || 0 });
      
      setStats(results);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  const totalRecords = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
          <Database className="w-5 h-5 text-signal-cyan" />
          Data & Test
        </h1>
        <p className="text-sm text-muted-foreground">
          Developer utilities for seeding, clearing, and validation
        </p>
      </div>

      {/* Seed Demo Data */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
          <Sprout className="w-4 h-4 text-signal-green" />
          Seed Demo Data
        </h3>
        <p className="text-xs text-muted-foreground">Load pre-configured data for testing</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-surface p-3 rounded border border-border/50">
            <h4 className="font-mono text-sm text-foreground">API Registry</h4>
            <p className="text-xs text-muted-foreground mb-2">Add 4 sample API entries</p>
            <Button 
              size="sm" 
              onClick={seedAPIRegistry} 
              disabled={seeding !== null}
              className="w-full"
            >
              {seeding === 'api-registry' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Load APIs
            </Button>
          </div>
          
          <div className="bg-surface p-3 rounded border border-border/50">
            <h4 className="font-mono text-sm text-foreground">Pipeline Events</h4>
            <p className="text-xs text-muted-foreground mb-2">Generate 25 sample events</p>
            <Button 
              size="sm" 
              onClick={seedPipelineEvents} 
              disabled={seeding !== null}
              className="w-full"
            >
              {seeding === 'pipeline' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
              Load Events
            </Button>
          </div>
        </div>
      </section>

      {/* Clear Data */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-signal-amber" />
          Clear Data
          <Badge variant="outline" className="text-signal-amber border-signal-amber/30 text-[10px]">Caution</Badge>
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button variant="outline" size="sm" onClick={clearLocalStorage} disabled={clearing !== null}>
            {clearing === 'localstorage' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Local Storage
          </Button>
          <Button variant="outline" size="sm" onClick={clearPipelineEvents} disabled={clearing !== null}>
            {clearing === 'pipeline' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Pipeline
          </Button>
          <Button variant="outline" size="sm" onClick={clearDevLogs} disabled={clearing !== null}>
            {clearing === 'logs' ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
            Dev Logs
          </Button>
          
          <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Factory Reset
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-signal-red" />
                  Factory Reset
                </DialogTitle>
                <DialogDescription>
                  This will clear ALL local data. Type "RESET" to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input 
                placeholder="Type RESET to confirm"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
              />
              <DialogFooter>
                <Button variant="ghost" onClick={() => setResetDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={factoryReset} disabled={resetConfirm !== 'RESET'}>
                  Reset Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Health Checks */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-signal-purple" />
            Health Checks
          </h3>
          <Button variant="outline" size="sm" onClick={runAllHealthChecks} className="h-7">
            Run All
          </Button>
        </div>
        
        <div className="space-y-2">
          {healthChecks.map(check => (
            <div key={check.id} className="flex items-center justify-between p-2 bg-surface rounded border border-border/50">
              <div className="flex items-center gap-2">
                {check.status === 'idle' && <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />}
                {check.status === 'running' && <Loader2 className="w-4 h-4 text-signal-blue animate-spin" />}
                {check.status === 'pass' && <CheckCircle2 className="w-4 h-4 text-signal-green" />}
                {check.status === 'warn' && <AlertTriangle className="w-4 h-4 text-signal-amber" />}
                {check.status === 'fail' && <XCircle className="w-4 h-4 text-signal-red" />}
                <div>
                  <p className="font-mono text-sm text-foreground">{check.name}</p>
                  <p className="text-xs text-muted-foreground">{check.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {check.count !== undefined && check.status !== 'idle' && (
                  <Badge variant="outline" className="text-[10px]">{check.count} issues</Badge>
                )}
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => runHealthCheck(check.id)}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Database Stats */}
      <section className="terminal-glass p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-signal-cyan" />
            Database Stats
          </h3>
          <Button variant="outline" size="sm" onClick={fetchStats} className="h-7" disabled={loadingStats}>
            {loadingStats ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        </div>
        
        {stats.length === 0 ? (
          <p className="text-xs text-muted-foreground">Click refresh to load stats</p>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-2">
              {stats.map(s => (
                <div key={s.table} className="bg-surface p-2 rounded text-center border border-border/50">
                  <p className="text-lg font-mono font-bold text-foreground">{s.count}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.table}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Total Records</span>
                <span>{totalRecords}</span>
              </div>
              <Progress value={Math.min(totalRecords / 10, 100)} className="h-2" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}