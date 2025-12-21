// ═══════════════════════════════════════════════════════════════════════════
// DEVTOOLS MODULE
// Master Developer Tools - Reusable DevTools Package
// ═══════════════════════════════════════════════════════════════════════════

// ── Core Provider ─────────────────────────────────────────────────────────
export { DevToolsProvider, useDevTools } from './DevToolsProvider';

// ── Components ────────────────────────────────────────────────────────────
export { DevButton } from './components/DevButton';
export { DevDrawer } from './components/DevDrawer';
export { IconRail } from './components/IconRail';
export { PanelRouter } from './components/PanelRouter';

// ── Stores ────────────────────────────────────────────────────────────────
export { useDevToolsStore } from './stores/devToolsStore';
export { 
  useLogsStore, 
  logEvent, 
  initializeErrorInterception 
} from './stores/logsStore';
export { 
  usePipelineStore, 
  recordPipelineEvent 
} from './stores/pipelineStore';
export { 
  useAudioStore,
  playTestTone 
} from './stores/audioStore';

// ── Configuration ─────────────────────────────────────────────────────────
export { 
  DEVTOOLS_SECTIONS, 
  MAIN_SECTIONS,
  META_SECTIONS,
  getSectionById, 
  getSectionIcon,
  getSectionPhase,
  getEnabledSections 
} from './config/sections';
export { DEFAULT_CONFIG, mergeConfig } from './config/defaults';

// ── Types ─────────────────────────────────────────────────────────────────
export type {
  // Configuration
  DevToolsConfig,
  CustomPanelConfig,
  Environment,
  
  // Sections
  SectionId,
  DevToolsSection,
  
  // Logging
  LogLevel,
  DevLogEntry,
  
  // API Registry
  ApiStatus,
  ApiCategory,
  ApiRegistryEntry,
  
  // Pipeline
  PipelineStep,
  PipelineProvider,
  PipelineEvent,
  
  // Health
  HealthStatus,
  ServiceHealth,
  SystemStatus,
  
  // Apps
  EchoverseApp,
} from './types';
