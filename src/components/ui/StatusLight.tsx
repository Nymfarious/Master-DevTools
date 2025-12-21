import { cn } from '@/lib/utils';

interface StatusLightProps {
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  pulse?: boolean;
}

export function StatusLight({ status, size = 'md', className, pulse }: StatusLightProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  const statusClasses = {
    healthy: 'bg-signal-green',
    degraded: 'bg-signal-amber',
    down: 'bg-signal-red',
    unknown: 'bg-muted-foreground',
  };

  const glowStyles = {
    healthy: { boxShadow: '0 0 8px hsl(var(--signal-green)), 0 0 2px hsl(var(--signal-green))' },
    degraded: { boxShadow: '0 0 8px hsl(var(--signal-amber)), 0 0 2px hsl(var(--signal-amber))' },
    down: { boxShadow: '0 0 8px hsl(var(--signal-red)), 0 0 2px hsl(var(--signal-red))' },
    unknown: {},
  };

  return (
    <span
      className={cn(
        'rounded-full inline-block',
        sizeClasses[size],
        statusClasses[status],
        pulse && status === 'down' && 'animate-pulse',
        className
      )}
      style={glowStyles[status]}
    />
  );
}
