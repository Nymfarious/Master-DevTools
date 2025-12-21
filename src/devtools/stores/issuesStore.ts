import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ═══════════════════════════════════════════════════════════════════════════
// ISSUE TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AppId = 'master-devtools' | 'storybook' | 'little-sister' | 'drummer' | 'ged-builder' | 'history-discovery';
export type IssueCategory = 'bug' | 'feature' | 'improvement';
export type IssueSeverity = 'critical' | 'high' | 'medium' | 'low';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description?: string;
  app: AppId;
  category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  checked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL SEED DATA
// ═══════════════════════════════════════════════════════════════════════════

const initialIssues: Issue[] = [
  {
    id: 'issue-1',
    title: 'Pipeline fails on large images',
    app: 'storybook',
    category: 'bug',
    severity: 'critical',
    status: 'open',
    checked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'issue-2',
    title: 'Add voice cloning support',
    app: 'storybook',
    category: 'feature',
    severity: 'medium',
    status: 'open',
    checked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'issue-3',
    title: 'Health check timeout too short',
    app: 'master-devtools',
    category: 'improvement',
    severity: 'low',
    status: 'in-progress',
    checked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'issue-4',
    title: 'Memory leak in audio processing',
    app: 'drummer',
    category: 'bug',
    severity: 'high',
    status: 'open',
    checked: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface IssuesState {
  issues: Issue[];
  
  // Actions
  addIssue: (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt' | 'checked'>) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  toggleIssue: (id: string) => void;
  deleteIssue: (id: string) => void;
  clearCompleted: () => void;
  
  // Filters
  getByApp: (app: AppId) => Issue[];
  getByStatus: (status: IssueStatus) => Issue[];
  getBySeverity: (severity: IssueSeverity) => Issue[];
  getStats: () => {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    critical: number;
    completed: number;
  };
}

export const useIssuesStore = create<IssuesState>()(
  persist(
    (set, get) => ({
      issues: initialIssues,

      addIssue: (issue) => {
        const newIssue: Issue = {
          ...issue,
          id: `issue-${Date.now()}`,
          checked: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ issues: [newIssue, ...state.issues] }));
      },

      updateIssue: (id, updates) => {
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === id
              ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
              : issue
          ),
        }));
      },

      toggleIssue: (id) => {
        set((state) => ({
          issues: state.issues.map((issue) =>
            issue.id === id
              ? { ...issue, checked: !issue.checked, updatedAt: new Date().toISOString() }
              : issue
          ),
        }));
      },

      deleteIssue: (id) => {
        set((state) => ({
          issues: state.issues.filter((issue) => issue.id !== id),
        }));
      },

      clearCompleted: () => {
        set((state) => ({
          issues: state.issues.filter((issue) => !issue.checked),
        }));
      },

      getByApp: (app) => get().issues.filter((i) => i.app === app),
      getByStatus: (status) => get().issues.filter((i) => i.status === status),
      getBySeverity: (severity) => get().issues.filter((i) => i.severity === severity),

      getStats: () => {
        const issues = get().issues;
        return {
          total: issues.length,
          open: issues.filter((i) => i.status === 'open').length,
          inProgress: issues.filter((i) => i.status === 'in-progress').length,
          resolved: issues.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
          critical: issues.filter((i) => i.severity === 'critical' && i.status === 'open').length,
          completed: issues.filter((i) => i.checked).length,
        };
      },
    }),
    { name: 'master-devtools-issues' }
  )
);
