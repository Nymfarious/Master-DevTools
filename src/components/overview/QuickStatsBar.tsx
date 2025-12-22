// Quick Stats Bar v3.2.0 - Key metrics with navigation links
import { useEffect, useState, useMemo } from 'react';
import { Clock, Zap, AlertTriangle, AlertCircle, Activity, ClipboardCheck } from 'lucide-react';
import { useLogsStore } from '@/stores/logsStore';
import { useSystemStore } from '@/stores/systemStore';
import { useErrorStore } from '@/stores/errorStore';
import { usePipelineStore } from '@/stores/pipelineStore';
import { useBuildStatusStore } from '@/stores/buildStatusStore';
import { useAppStore } from '@/stores/appStore';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: typeof Clock;
  color: 'green' | 'blue' | 'amber' | 'red' | 'muted' | 'purple';
  onClick?: () => void;
  clickable?: boolean;
}

function StatItem({ label, value, subtext, icon: Icon, color, onClick, clickable }: StatItemProps) {
  const colorClasses = {
    green: 'text-signal-green',
    blue: 'text-signal-blue',
    amber: 'text-signal-amber',
    red: 'text-signal-red',
    purple: 'text-signal-purple',
    muted: 'text-muted-foreground',
  };

  return (
    <div 
      className={cn(
        "terminal-glass p-4 rounded-lg flex-1 transition-all",
        clickable && "cursor-pointer hover:ring-1 hover:ring-primary/30 hover:bg-card/60"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("w-4 h-4", colorClasses[color])} />
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn("font-mono text-2xl font-bold", colorClasses[color])}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      )}
    </div>
  );
}

export function QuickStatsBar() {
  const { logs } = useLogsStore();
  const { uptime, incrementUptime } = useSystemStore();
  const { errors } = useErrorStore();
  const { events } = usePipelineStore();
  const { features } = useBuildStatusStore();
  const { setActiveSection } = useAppStore();
  const [apiCalls, setApiCalls] = useState(1247);
  
  // Count from error store
  const activeErrors = errors.length;
  
  // Count active pipelines (simulated - use events that are recent)
  const activePipelines = events.filter(e => !e.success).length;
  
  // Build completion - memoized
  const buildCompletion = useMemo(() => {
    const complete = features.filter(f => f.status === 'complete').length;
    return Math.round((complete / features.length) * 100);
  }, [features]);
  
  // Count warnings from logs
  const warnCount = logs.filter(l => l.level === 'warn').length;
  
  // Format uptime as HH:MM:SS or Xh Xm
  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m ${s}s`;
  };
  
  // Increment uptime every second
  useEffect(() => {
    const interval = setInterval(() => {
      incrementUptime();
    }, 1000);
    return () => clearInterval(interval);
  }, [incrementUptime]);
  
  // Simulate API calls incrementing
  useEffect(() => {
    const interval = setInterval(() => {
      setApiCalls(prev => prev + Math.floor(Math.random() * 3));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatItem 
        label="Uptime" 
        value={formatUptime(uptime)} 
        icon={Clock} 
        color="green" 
      />
      <StatItem 
        label="API Calls" 
        value={apiCalls.toLocaleString()} 
        subtext="+12/min"
        icon={Zap} 
        color="blue" 
      />
      <StatItem 
        label="Active Errors" 
        value={activeErrors} 
        icon={AlertCircle} 
        color={activeErrors > 0 ? 'red' : 'green'} 
        clickable
        onClick={() => setActiveSection('logs')}
      />
      <StatItem 
        label="Warnings" 
        value={warnCount} 
        icon={AlertTriangle} 
        color={warnCount > 0 ? 'amber' : 'green'} 
      />
      <StatItem 
        label="Pipelines" 
        value={activePipelines} 
        subtext="active"
        icon={Activity} 
        color={activePipelines > 0 ? 'blue' : 'muted'} 
        clickable
        onClick={() => setActiveSection('pipeline')}
      />
      <StatItem 
        label="Build" 
        value={`${buildCompletion}%`} 
        subtext="complete"
        icon={ClipboardCheck} 
        color={buildCompletion >= 80 ? 'green' : buildCompletion >= 50 ? 'amber' : 'muted'} 
        clickable
        onClick={() => setActiveSection('build-status')}
      />
    </section>
  );
}