// Quick Stats Bar - Key metrics in a horizontal row
// Lines: ~95 | Status: GREEN
import { useEffect, useState } from 'react';
import { Clock, Zap, AlertTriangle, AlertCircle } from 'lucide-react';
import { useLogsStore } from '@/stores/logsStore';
import { useSystemStore } from '@/stores/systemStore';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: typeof Clock;
  color: 'green' | 'blue' | 'amber' | 'red' | 'muted';
}

function StatItem({ label, value, subtext, icon: Icon, color }: StatItemProps) {
  const colorClasses = {
    green: 'text-signal-green',
    blue: 'text-signal-blue',
    amber: 'text-signal-amber',
    red: 'text-signal-red',
    muted: 'text-muted-foreground',
  };

  return (
    <div className="terminal-glass p-4 rounded-lg flex-1">
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
  const [apiCalls, setApiCalls] = useState(1247);
  
  // Count errors and warnings
  const errorCount = logs.filter(l => l.level === 'error').length;
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
    <section className="grid grid-cols-4 gap-3">
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
        label="Errors (24h)" 
        value={errorCount} 
        icon={AlertCircle} 
        color={errorCount > 0 ? 'red' : 'green'} 
      />
      <StatItem 
        label="Warnings (24h)" 
        value={warnCount} 
        icon={AlertTriangle} 
        color={warnCount > 0 ? 'amber' : 'green'} 
      />
    </section>
  );
}
