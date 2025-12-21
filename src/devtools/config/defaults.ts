import type { DevToolsConfig } from '../types';

/**
 * Default configuration for DevTools
 * Used when no custom config is provided
 */
export const DEFAULT_CONFIG: DevToolsConfig = {
  app: {
    name: 'DevTools',
    version: '1.0.0',
    environment: 'development',
  },
  mode: 'mini',
  position: 'bottom-right',
  theme: 'dark',
  features: {
    healthChecks: true,
    pipelineMonitor: true,
    agentConsole: true,
    flowchart: true,
    errorInterception: true,
  },
  isDev: true,
};

/**
 * Merge user config with defaults
 */
export function mergeConfig(userConfig: Partial<DevToolsConfig>): DevToolsConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    app: {
      ...DEFAULT_CONFIG.app,
      ...userConfig.app,
    },
    features: {
      ...DEFAULT_CONFIG.features,
      ...userConfig.features,
    },
    panels: {
      ...DEFAULT_CONFIG.panels,
      ...userConfig.panels,
    },
  };
}
