import { useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useDevToolsStore } from '@/stores/devtools-store';
import { IconRail } from './IconRail';
import { DrawerHeader } from './DrawerHeader';
import { PanelRouter } from '../panels';
import { getSectionById } from '../config/sections';
import type { MiniDevConfig, SectionId } from '@/types/devtools';

interface MiniDevDrawerProps {
  config?: Partial<MiniDevConfig>;
}

export function MiniDevDrawer({ config }: MiniDevDrawerProps) {
  const { isOpen, closeDrawer, activeSection, setActiveSection } = useDevToolsStore();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeDrawer();
      }
    };

    // Keyboard shortcuts for sections
    const handleShortcuts = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (!e.metaKey && !e.ctrlKey) return;

      const numberKeys: Record<string, SectionId> = {
        '1': 'overview',
        '2': 'apps',
        '3': 'audio',
        '4': 'video',
        '5': 'libraries',
        '6': 'apis',
        '7': 'agents',
        '8': 'data',
        '9': 'pipeline',
        '0': 'tokens',
      };

      const letterKeys: Record<string, SectionId> = {
        'l': 'logs',
        's': 'security',
      };

      if (numberKeys[e.key]) {
        e.preventDefault();
        setActiveSection(numberKeys[e.key]);
      } else if (letterKeys[e.key.toLowerCase()]) {
        e.preventDefault();
        setActiveSection(letterKeys[e.key.toLowerCase()]);
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleShortcuts);
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleShortcuts);
    };
  }, [isOpen, closeDrawer, setActiveSection]);

  // Handle click outside
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeDrawer();
    }
  }, [closeDrawer]);

  // Get current section info
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
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
          isOpen 
            ? 'translate-x-0 opacity-100' 
            : 'translate-x-full opacity-0'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Developer Tools"
      >
        {/* Decorative top bar */}
        <div className="h-1 bg-gradient-to-r from-signal-green via-signal-blue to-signal-purple opacity-50" />

        {/* Header */}
        <DrawerHeader 
          appName={config?.app?.name || 'Master DevTools'}
          version={config?.app?.version || '1.0.0'}
          environment={config?.app?.environment || 'development'}
        />

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Icon Rail */}
          <IconRail />

          {/* Panel Content */}
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
              <PanelRouter activeSection={activeSection} />
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
          <span>Master DevTools</span>
          <span className="flex items-center gap-2">
            <span className="text-signal-green">●</span>
            <span>Connected</span>
          </span>
        </footer>
      </aside>
    </>
  );
}
