// File Metrics Store - Tracks line counts for all project files
// Lines: ~85 | Status: GREEN
import { create } from 'zustand';

export interface FileMetric {
  path: string;
  lines: number;
  status: 'green' | 'yellow' | 'red';
  lastUpdated: Date;
}

interface FileMetricsState {
  files: FileMetric[];
  thresholds: {
    yellow: number;
    red: number;
  };
  
  // Actions
  setFileMetric: (path: string, lines: number) => void;
  removeFile: (path: string) => void;
  clearAll: () => void;
  getStatus: (lines: number) => 'green' | 'yellow' | 'red';
  
  // Computed
  getTotalLines: () => number;
  getFilesByStatus: (status: FileMetric['status']) => FileMetric[];
  getWarningCount: () => number;
  getCriticalCount: () => number;
}

export const useFileMetricsStore = create<FileMetricsState>()((set, get) => ({
  files: [],
  thresholds: {
    yellow: 500,
    red: 600,
  },
  
  getStatus: (lines: number) => {
    const { thresholds } = get();
    if (lines >= thresholds.red) return 'red';
    if (lines >= thresholds.yellow) return 'yellow';
    return 'green';
  },
  
  setFileMetric: (path, lines) => set((state) => {
    const status = state.getStatus(lines);
    const existingIndex = state.files.findIndex(f => f.path === path);
    const metric: FileMetric = { path, lines, status, lastUpdated: new Date() };
    
    if (existingIndex >= 0) {
      const updated = [...state.files];
      updated[existingIndex] = metric;
      return { files: updated };
    }
    return { files: [...state.files, metric] };
  }),
  
  removeFile: (path) => set((state) => ({
    files: state.files.filter(f => f.path !== path)
  })),
  
  clearAll: () => set({ files: [] }),
  
  getTotalLines: () => {
    return get().files.reduce((sum, f) => sum + f.lines, 0);
  },
  
  getFilesByStatus: (status) => {
    return get().files.filter(f => f.status === status);
  },
  
  getWarningCount: () => {
    return get().files.filter(f => f.status === 'yellow').length;
  },
  
  getCriticalCount: () => {
    return get().files.filter(f => f.status === 'red').length;
  },
}));

// Initial file metrics - manually tracked during development
export const PROJECT_FILES: Array<{ path: string; lines: number }> = [
  { path: 'src/stores/fileMetricsStore.ts', lines: 87 },
  { path: 'src/stores/appStore.ts', lines: 37 },
  { path: 'src/stores/systemStore.ts', lines: 56 },
  { path: 'src/stores/logsStore.ts', lines: 95 },
  { path: 'src/types/devtools.ts', lines: 194 },
  { path: 'src/config/sections.ts', lines: 140 },
  { path: 'src/components/layout/Header.tsx', lines: 85 },
  { path: 'src/components/layout/Sidebar.tsx', lines: 79 },
  { path: 'src/components/layout/Footer.tsx', lines: 65 },
  { path: 'src/components/layout/AppShell.tsx', lines: 95 },
  { path: 'src/components/panels/OverviewPanel.tsx', lines: 35 },
  { path: 'src/components/panels/LogsPanel.tsx', lines: 185 },
  { path: 'src/components/panels/UITokensPanel.tsx', lines: 195 },
  { path: 'src/components/overview/SystemHealthMonitor.tsx', lines: 115 },
  { path: 'src/components/overview/EchoverseApps.tsx', lines: 95 },
  { path: 'src/components/overview/LiveActivityFeed.tsx', lines: 85 },
  { path: 'src/components/overview/QuickStatsBar.tsx', lines: 95 },
  { path: 'src/components/overview/FileMetricsCard.tsx', lines: 90 },
  { path: 'src/components/overview/DemoLogGenerator.tsx', lines: 55 },
  { path: 'src/pages/Dashboard.tsx', lines: 65 },
];
