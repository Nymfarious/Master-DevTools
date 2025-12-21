import { createContext, useContext, useEffect, ReactNode } from 'react';
import { MiniDevButton } from './MiniDevButton';
import { MiniDevDrawer } from './MiniDevDrawer';
import { useDevToolsStore, initializeErrorInterception } from '@/stores/devtools-store';
import type { MiniDevConfig } from '@/types/devtools';

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface MiniDevContextValue {
  config: MiniDevConfig;
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;
}

const MiniDevContext = createContext<MiniDevContextValue | null>(null);

export function useMiniDev() {
  const context = useContext(MiniDevContext);
  if (!context) {
    throw new Error('useMiniDev must be used within a MiniDevProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface MiniDevProviderProps {
  children: ReactNode;
  config?: Partial<MiniDevConfig>;
  isDev?: boolean;
}

export function MiniDevProvider({ 
  children, 
  config: userConfig,
  isDev = true
}: MiniDevProviderProps) {
  const { isOpen, openDrawer, closeDrawer, toggleDrawer, setConfig } = useDevToolsStore();

  // Merge default config with user config
  const config: MiniDevConfig = {
    app: {
      name: userConfig?.app?.name || 'Master DevTools',
      version: userConfig?.app?.version || '1.0.0',
      environment: userConfig?.app?.environment || 'development',
    },
    position: userConfig?.position || 'bottom-right',
    theme: userConfig?.theme || 'dark',
    panels: userConfig?.panels,
    customPanels: userConfig?.customPanels,
    isDev: isDev,
  };

  // Initialize error interception on mount
  useEffect(() => {
    initializeErrorInterception();
  }, []);

  // Set config in store
  useEffect(() => {
    setConfig(config);
  }, [setConfig, config.app.name, config.app.version, config.app.environment]);

  // Global keyboard shortcut to toggle drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + D to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);

  const contextValue: MiniDevContextValue = {
    config,
    isOpen,
    openDrawer,
    closeDrawer,
    toggleDrawer,
  };

  // Don't render anything if not in dev mode
  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <MiniDevContext.Provider value={contextValue}>
      {children}
      <MiniDevButton position={config.position} />
      <MiniDevDrawer config={config} />
    </MiniDevContext.Provider>
  );
}
