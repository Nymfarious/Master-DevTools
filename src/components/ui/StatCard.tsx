import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'cyan';
  className?: string;
}

export function StatCard({ label, value, icon: Icon, color = 'green', className }: StatCardProps) {
  const colorClasses = {
    green: 'bg-signal-green/10 border-signal-green/30 text-signal-green',
    blue: 'bg-signal-blue/10 border-signal-blue/30 text-signal-blue',
    amber: 'bg-signal-amber/10 border-signal-amber/30 text-signal-amber',
    red: 'bg-signal-red/10 border-signal-red/30 text-signal-red',
    purple: 'bg-signal-purple/10 border-signal-purple/30 text-signal-purple',
    cyan: 'bg-signal-cyan/10 border-signal-cyan/30 text-signal-cyan',
  };

  return (
    <div className={cn(
      'terminal-glass p-4 rounded-lg',
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">
            {label}
          </p>
          <p className="font-display text-2xl font-bold text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center border',
          colorClasses[color]
        )}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
