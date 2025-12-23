import { useEffect, useCallback, useRef } from 'react';
import { X, Pin, PinOff, PauseCircle, PlayCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDevToolsStore } from '../stores/devToolsStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useAppContextStore } from '@/stores/appContextStore';
import { IconRail } from './IconRail';
import { PanelRouter } from './PanelRouter';
import { QuickAPIStatus } from './QuickAPIStatus';
import { getSectionById } from '../config/sections';
import type { DevToolsConfig, SectionId } from '../types';

interface DevDrawerProps {
  config: DevToolsConfig;
}

/**
 * Slide-out drawer containing DevTools panels
 * Supports keyboard navigation and shortcuts
 */
export function DevDrawer({ config }: DevDrawerProps) {
  const { isOpen, isPinned, closeDrawer, togglePin, activeSection, setActiveSection } = useDevToolsStore();
  const { settings, updateSettings } = useSettingsStore();
  const { loadedApp, clearApp } = useAppContextStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key and shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
        return;
      }

      if (!isOpen) return;
      if (!e.metaKey && !e.ctrlKey) return;

      const numberKeys: Record<string, SectionId> = {
        '1': 'overview',
        '2': 'apps',
        '3': 'apis',
        '4': 'logs',
        '5': 'pipeline',
        '6': 'security',
        '7': 'data',
        '8': 'tokens',
        '9': 'libraries',
        '0': 'content',
      };

      if (numberKeys[e.key]) {
        e.preventDefault();
        setActiveSection(numberKeys[e.key]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDrawer, setActiveSection]);

  // Handle backdrop click (respect pinned state)
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPinned) {
      closeDrawer();
    }
  }, [closeDrawer, isPinned]);

  const currentSection = getSectionById(activeSection);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 z-[9999]',
          'bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
          isPinned && 'cursor-not-allowed'
        )}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={cn(
          'fixed top-4 right-4 bottom-4 z-[10000]',
          'w-[460px] max-w-[calc(100vw-2rem)]',
          'flex flex-col',
          'rounded-2xl overflow-hidden',
          'terminal-glass',
          'transform transition-all duration-300 ease-out',
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Developer Tools"
      >
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-signal-green via-signal-blue to-signal-purple opacity-50" />

        {/* Header */}
        <header className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          'border-b border-border/30'
        )}>
          <div>
            <h1 className="text-sm font-display font-bold bg-gradient-to-r from-signal-green via-signal-blue to-signal-purple bg-clip-text text-transparent">
              {config.app.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>v{config.app.version}</span>
              <span className="text-border">•</span>
              <span className={cn(
                'badge',
                config.app.environment === 'production' 
                  ? 'badge--green' 
                  : config.app.environment === 'preview' 
                    ? 'badge--amber' 
                    : 'badge--blue'
              )}>
                {config.app.environment}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Master Visibility Toggle */}
            <button
              onClick={() => updateSettings({ masterVisibility: !settings.masterVisibility })}
              className={cn(
                'p-2 rounded-lg transition-colors flex items-center gap-1',
                settings.masterVisibility 
                  ? 'hover:bg-secondary text-signal-green' 
                  : 'bg-signal-red/20 text-signal-red'
              )}
              aria-label={settings.masterVisibility ? 'Hide all dev elements' : 'Show all dev elements'}
              title={settings.masterVisibility ? 'Hide DevTools button (can re-enable in settings)' : 'DevTools button hidden'}
            >
              {settings.masterVisibility ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            {/* Global Pause All Monitoring Button */}
            <button
              onClick={() => updateSettings({ lowResourceMode: !settings.lowResourceMode })}
              className={cn(
                'p-2 rounded-lg transition-colors flex items-center gap-1',
                settings.lowResourceMode 
                  ? 'bg-signal-amber/20 text-signal-amber' 
                  : 'hover:bg-secondary text-muted-foreground'
              )}
              aria-label={settings.lowResourceMode ? 'Resume monitoring' : 'Pause all monitoring'}
              title={settings.lowResourceMode ? 'Resume all monitoring' : 'Pause all monitoring (saves resources)'}
            >
              {settings.lowResourceMode ? (
                <PlayCircle className="w-4 h-4" />
              ) : (
                <PauseCircle className="w-4 h-4" />
              )}
            </button>
            {/* Pin/Unpin Toggle */}
            <button
              onClick={togglePin}
              className={cn(
                'p-2 rounded-lg transition-colors',
                isPinned 
                  ? 'bg-signal-blue/20 text-signal-blue' 
                  : 'hover:bg-secondary text-muted-foreground'
              )}
              aria-label={isPinned ? 'Unpin drawer' : 'Pin drawer'}
              title={isPinned ? 'Unpin (allow backdrop close)' : 'Pin (prevent backdrop close)'}
            >
              {isPinned ? (
                <Pin className="w-4 h-4" />
              ) : (
                <PinOff className="w-4 h-4" />
              )}
            </button>
            {/* Close button - only when not pinned */}
            {!isPinned && (
              <button
                onClick={closeDrawer}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close DevTools"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </header>

        {/* Quick API Status Bar + Context Indicator */}
        <div className="px-4 py-2 border-b border-border/20 bg-secondary/30 flex items-center justify-between gap-2">
          <QuickAPIStatus />
          {loadedApp && (
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-xs shrink-0">
              <span className="text-muted-foreground">Context:</span>
              <span className="text-primary font-medium">{loadedApp.name}</span>
              <button
                onClick={clearApp}
                className="p-0.5 hover:bg-primary/20 rounded transition-colors"
                aria-label="Clear app context"
              >
                <X className="h-3 w-3 text-primary" />
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden">
          <IconRail 
            enabledPanels={config.panels?.enabled}
            disabledPanels={config.panels?.disabled}
            customPanels={config.panels?.custom}
          />

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                {currentSection && (
                  <>
                    <currentSection.icon className="w-4 h-4 text-signal-blue" />
                    <h2 className="text-sm font-display font-semibold text-foreground">
                      {currentSection.label}
                    </h2>
                  </>
                )}
              </div>
              {currentSection?.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentSection.description}
                </p>
              )}
            </div>

            {/* Panel Body */}
            <div className="flex-1 overflow-y-auto p-4 fade-edges">
              <PanelRouter 
                activeSection={activeSection}
                customPanels={config.panels?.custom}
              />
            </div>
          </main>
        </div>

        {/* Footer */}
        <footer className={cn(
          'px-4 py-2',
          'border-t border-border/30',
          'flex items-center justify-between',
          'text-xs font-mono text-muted-foreground'
        )}>
          <span>{config.app.name}</span>
          <span className="flex items-center gap-2">
            <span className="text-signal-green">●</span>
            <span>Connected</span>
          </span>
        </footer>
      </aside>
    </>
  );
}
