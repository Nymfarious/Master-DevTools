import { createContext, useContext, useEffect, ReactNode } from 'react';
import { DevButton } from './components/DevButton';
import { DevDrawer } from './components/DevDrawer';
import { useDevToolsStore } from './stores/devToolsStore';
import { initializeErrorInterception } from './stores/logsStore';
import { useBlockSignupsSync } from './hooks/useBlockSignupsSync';
import { mergeConfig } from './config/defaults';
import type { DevToolsConfig } from './types';

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

interface DevToolsContextValue {
  config: DevToolsConfig;
  isOpen: boolean;
  openDevTools: () => void;
  closeDevTools: () => void;
  toggleDevTools: () => void;
  isDev: boolean;
}

const DevToolsContext = createContext<DevToolsContextValue | null>(null);

/**
 * Hook to access DevTools context
 * Must be used within DevToolsProvider
 */
export function useDevTools() {
  const context = useContext(DevToolsContext);
  if (!context) {
    throw new Error('useDevTools must be used within DevToolsProvider');
  }
  return context;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════

interface DevToolsProviderProps {
  children: ReactNode;
  config: Partial<DevToolsConfig>;
}

/**
 * DevTools Provider
 * Wraps your app to enable DevTools functionality
 * 
 * @example
 * ```tsx
 * <DevToolsProvider config={{
 *   app: { name: 'My App', version: '1.0.0', environment: 'development' },
 *   mode: 'mini',
 *   position: 'bottom-right'
 * }}>
 *   <App />
 * </DevToolsProvider>
 * ```
 */
export function DevToolsProvider({ children, config: userConfig }: DevToolsProviderProps) {
  const { isOpen, openDrawer, closeDrawer, toggleDrawer, setConfig } = useDevToolsStore();
  
  // Merge with defaults
  const config = mergeConfig(userConfig);
  const isDev = config.isDev ?? true;

  // Sync blockSignups with Supabase
  useBlockSignupsSync();

  // Initialize error interception
  useEffect(() => {
    if (config.features?.errorInterception !== false) {
      initializeErrorInterception();
    }
  }, [config.features?.errorInterception]);

  // Store config
  useEffect(() => {
    setConfig(config);
  }, [setConfig, config.app.name, config.app.version, config.app.environment]);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault();
        toggleDrawer();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleDrawer]);

  const contextValue: DevToolsContextValue = {
    config,
    isOpen,
    openDevTools: openDrawer,
    closeDevTools: closeDrawer,
    toggleDevTools: toggleDrawer,
    isDev,
  };

  // Don't render DevTools if not in dev mode
  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <DevToolsContext.Provider value={contextValue}>
      {children}
      {config.mode === 'mini' && (
        <>
          <DevButton position={config.position} />
          <DevDrawer config={config} />
        </>
      )}
    </DevToolsContext.Provider>
  );
}
