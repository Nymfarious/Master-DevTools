import { useState } from 'react';
import { Terminal, X, Eye, EyeOff, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevToolsStore } from '../stores/devToolsStore';
import { useLogsStore } from '../stores/logsStore';
import { useSettingsStore } from '../stores/settingsStore';

/** Check if any active monitoring is running */
function useHasActiveMonitoring() {
  const { settings } = useSettingsStore();
  // Monitoring is active if low resource mode is OFF and FPS monitoring is enabled
  return !settings.lowResourceMode && settings.fpsMonitoringEnabled;
}

interface DevButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

/**
 * Floating button to trigger DevTools drawer
 * Shows notification dot when there are unread errors
 * Includes master visibility toggle
 */
export function DevButton({ position = 'bottom-right' }: DevButtonProps) {
  const { isOpen, toggleDrawer } = useDevToolsStore();
  const hasUnreadErrors = useLogsStore((state) => state.hasUnreadErrors);
  const { settings, updateSettings } = useSettingsStore();
  const hasActiveMonitoring = useHasActiveMonitoring();
  const [isHovered, setIsHovered] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // If master visibility is off, don't render at all
  if (!settings.masterVisibility) {
    return null;
  }

  return (
    <div className={cn('fixed z-[9998] flex items-center gap-2', positionClasses[position])}>
      {/* Visibility Toggle (shown on hover) */}
      {isHovered && !isOpen && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateSettings({ masterVisibility: false });
          }}
          className={cn(
            'p-2 rounded-xl',
            'bg-card/80 backdrop-blur-xl',
            'border border-border',
            'hover:bg-secondary hover:border-signal-amber/30',
            'transition-all duration-200',
            'animate-fade-in'
          )}
          title="Hide DevTools button (restore in Settings)"
        >
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Main DevButton */}
      <button
        onClick={toggleDrawer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'w-14 h-14 rounded-2xl',
          'flex items-center justify-center',
          'transition-all duration-300 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-signal-blue/50',
          'group',
          'bg-card/80 backdrop-blur-xl',
          'border border-border',
          'shadow-terminal',
          'hover:bg-secondary hover:border-signal-blue/30',
          'hover:shadow-glow-blue',
          'hover:scale-105',
          isOpen && 'bg-signal-blue/10 border-signal-blue/50 rotate-180'
        )}
        aria-label={isOpen ? 'Close DevTools' : 'Open DevTools'}
      >
        {/* Background gradient on hover */}
        <div 
          className={cn(
            'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300',
            'bg-gradient-to-br from-signal-blue/20 via-signal-purple/10 to-transparent',
            isHovered && 'opacity-100'
          )}
        />

        {/* Icon */}
        <div className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <X className="w-6 h-6 text-signal-blue" />
          ) : (
            <Terminal 
              className={cn(
                'w-6 h-6 transition-colors duration-200',
                hasUnreadErrors ? 'text-signal-red' : 'text-muted-foreground',
                'group-hover:text-signal-blue'
              )} 
            />
          )}
        </div>

        {/* Red dot for unread errors */}
        {hasUnreadErrors && !isOpen && (
          <span className="red-dot" />
        )}

        {/* Cyan indicator for active monitoring */}
        {hasActiveMonitoring && !isOpen && !hasUnreadErrors && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center">
            <Activity className="w-3 h-3 text-signal-cyan" />
            <span className="absolute w-2 h-2 rounded-full bg-signal-cyan animate-ping opacity-50" />
          </span>
        )}

        {/* Keyboard hint on hover */}
        {isHovered && !isOpen && (
          <div 
            className={cn(
              'absolute -top-10 left-1/2 -translate-x-1/2',
              'px-2 py-1 rounded',
              'bg-secondary border border-border',
              'text-xs font-mono text-muted-foreground whitespace-nowrap',
              'animate-fade-up'
            )}
          >
            <span className="text-signal-blue">⌘</span> + <span className="text-signal-blue">D</span>
          </div>
        )}

        {/* Pulse ring animation when there are errors */}
        {hasUnreadErrors && !isOpen && (
          <div className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-signal-red" />
        )}
      </button>
    </div>
  );
}
