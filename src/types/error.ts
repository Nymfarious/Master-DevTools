// Error Types v3.2.0 - Enhanced error logging system
export type ErrorType = 'import' | 'export' | 'processing' | 'network' | 'validation' | 'api' | 'auth';

export interface ErrorLogEntry {
  id: string;
  timestamp: number;
  type: ErrorType;
  message: string;
  details?: string;
  source?: string; // Which app or panel generated it
  pinned: boolean;
  read: boolean;
  aiSuggestion?: string;
  isAnalyzing?: boolean;
}

export const ERROR_COLORS: Record<ErrorType, string> = {
  import: 'text-orange-500',
  export: 'text-blue-500',
  processing: 'text-purple-500',
  network: 'text-red-500',
  validation: 'text-yellow-500',
  api: 'text-cyan-500',
  auth: 'text-pink-500',
};

export const ERROR_BG_COLORS: Record<ErrorType, string> = {
  import: 'bg-orange-500/20',
  export: 'bg-blue-500/20',
  processing: 'bg-purple-500/20',
  network: 'bg-red-500/20',
  validation: 'bg-yellow-500/20',
  api: 'bg-cyan-500/20',
  auth: 'bg-pink-500/20',
};

export const ERROR_BORDER_COLORS: Record<ErrorType, string> = {
  import: 'border-orange-500/50',
  export: 'border-blue-500/50',
  processing: 'border-purple-500/50',
  network: 'border-red-500/50',
  validation: 'border-yellow-500/50',
  api: 'border-cyan-500/50',
  auth: 'border-pink-500/50',
};

export const ERROR_ICONS: Record<ErrorType, string> = {
  import: 'FileX',
  export: 'Download',
  processing: 'Cog',
  network: 'Wifi',
  validation: 'AlertTriangle',
  api: 'Server',
  auth: 'Shield',
};
