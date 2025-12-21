import { LucideIcon } from 'lucide-react';
import { ComponentType } from 'react';

// ═══════════════════════════════════════════════════════════════════════════
// DEVTOOLS SECTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export type SectionId = 
  | 'overview'
  | 'apps'
  | 'apis'
  | 'logs'
  | 'pipeline'
  | 'security'
  | 'data'
  | 'tokens'
  | 'flowchart'
  | 'agents'
  | 'audio'
  | 'video'
  | 'libraries'
  | 'content'
  | 'shortcuts'
  | 'styleguide'
  | 'generator'
  | 'export'
  | 'settings';

export interface DevToolsSection {
  id: SectionId;
  label: string;
  icon: LucideIcon;
  description: string;
  shortcut?: string;
  phase?: number;
  badge?: {
    type: 'count' | 'status' | 'alert';
    value: number | string;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// APP CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export type Environment = 'development' | 'preview' | 'production';

export interface AppMetadata {
  name: string;
  version: string;
  environment: Environment;
  buildHash?: string;
  buildTime?: string;
}

export interface MiniDevConfig {
  app: AppMetadata;
  panels?: SectionId[];
  customPanels?: CustomPanelConfig[];
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'dark' | 'phosphor' | 'amber';
  isDev?: boolean;
}

export interface CustomPanelConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ComponentType;
  description?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// LOGGING SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success';

export interface DevLogEntry {
  id: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: Date;
  read: boolean;
  source?: string;
  stack?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// API REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

export type ApiStatus = 'live' | 'testing' | 'planned' | 'deprecated' | 'error';
export type ApiCategory = 'ai' | 'storage' | 'auth' | 'analytics' | 'integration';

export interface ApiRegistryEntry {
  id: string;
  name: string;
  vendor: string;
  category: ApiCategory;
  status: ApiStatus;
  authType: 'api-key' | 'oauth' | 'built-in' | 'none';
  purpose: string;
  usedIn: string[];
  lastChecked?: Date;
  responseTime?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// PIPELINE EVENTS
// ═══════════════════════════════════════════════════════════════════════════

export type PipelineStep = 
  | 'generate_image'
  | 'edit_image'
  | 'remove_bg'
  | 'upscale'
  | 'animate'
  | 'generate_tts'
  | 'transcribe'
  | 'custom';

export type PipelineProvider = 
  | 'gemini'
  | 'firefly'
  | 'replicate'
  | 'rembg'
  | 'esrgan'
  | 'gcp-tts'
  | 'elevenlabs'
  | 'custom';

export interface PipelineEvent {
  id: string;
  step: PipelineStep;
  provider: PipelineProvider;
  duration: number;
  success: boolean;
  assetId?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// HEALTH & STATUS
// ═══════════════════════════════════════════════════════════════════════════

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface ServiceHealth {
  id: string;
  name: string;
  status: HealthStatus;
  lastCheck: Date;
  responseTime?: number;
  message?: string;
}

export interface SystemStatus {
  overall: HealthStatus;
  services: ServiceHealth[];
  uptime: number;
  memory?: {
    used: number;
    total: number;
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// USER & AUTH
// ═══════════════════════════════════════════════════════════════════════════

export type AppRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  role?: AppRole;
  createdAt: Date;
  updatedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// ECHOVERSE APPS
// ═══════════════════════════════════════════════════════════════════════════

export interface EchoverseApp {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: 'connected' | 'disconnected' | 'coming-soon';
  url?: string;
  color: string;
}
