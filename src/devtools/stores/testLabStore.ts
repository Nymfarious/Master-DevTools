import { create } from 'zustand';

// ═══════════════════════════════════════════════════════════════════════════
// TEST LAB TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TestStatus = 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
export type TestCategory = 'components' | 'api' | 'integration' | 'performance';

export interface TestResult {
  id: string;
  name: string;
  category: TestCategory;
  status: TestStatus;
  duration?: number;
  error?: string;
  lastRun?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIAL DATA
// ═══════════════════════════════════════════════════════════════════════════

const initialTests: TestResult[] = [
  { id: 't1', name: 'API Health Check - Supabase', category: 'api', status: 'passed', duration: 234 },
  { id: 't2', name: 'API Health Check - Gemini', category: 'api', status: 'passed', duration: 567 },
  { id: 't3', name: 'API Health Check - ElevenLabs', category: 'api', status: 'failed', duration: 1200, error: 'Timeout: Request exceeded 1000ms' },
  { id: 't4', name: 'Pipeline - Image Generation', category: 'integration', status: 'passed', duration: 3400 },
  { id: 't5', name: 'Auth Flow - Login', category: 'integration', status: 'pending' },
  { id: 't6', name: 'Auth Flow - Signup', category: 'integration', status: 'pending' },
  { id: 't7', name: 'Button Variants', category: 'components', status: 'passed', duration: 45 },
  { id: 't8', name: 'Card Layouts', category: 'components', status: 'passed', duration: 32 },
  { id: 't9', name: 'Modal Accessibility', category: 'components', status: 'skipped' },
  { id: 't10', name: 'Initial Load Time', category: 'performance', status: 'passed', duration: 1890 },
  { id: 't11', name: 'Memory Usage', category: 'performance', status: 'pending' },
  { id: 't12', name: 'Bundle Size Check', category: 'performance', status: 'passed', duration: 120 },
];

// ═══════════════════════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════════════════════

interface TestLabState {
  tests: TestResult[];
  isRunningAll: boolean;
  
  // Actions
  runTest: (id: string) => Promise<void>;
  runAllTests: () => Promise<void>;
  runByCategory: (category: TestCategory) => Promise<void>;
  resetTests: () => void;
  
  // Getters
  getByCategory: (category: TestCategory) => TestResult[];
  getStats: () => {
    total: number;
    passed: number;
    failed: number;
    pending: number;
    running: number;
    skipped: number;
  };
}

export const useTestLabStore = create<TestLabState>()((set, get) => ({
  tests: initialTests,
  isRunningAll: false,

  runTest: async (id) => {
    // Set to running
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === id ? { ...t, status: 'running' as TestStatus } : t
      ),
    }));

    // Simulate test execution
    const duration = 200 + Math.random() * 2000;
    await new Promise((r) => setTimeout(r, duration));

    // Random result (80% pass rate)
    const passed = Math.random() > 0.2;
    
    set((state) => ({
      tests: state.tests.map((t) =>
        t.id === id
          ? {
              ...t,
              status: passed ? 'passed' : 'failed',
              duration: Math.round(duration),
              error: passed ? undefined : 'Assertion failed: Expected true, got false',
              lastRun: new Date().toISOString(),
            }
          : t
      ),
    }));
  },

  runAllTests: async () => {
    set({ isRunningAll: true });
    const tests = get().tests.filter((t) => t.status !== 'skipped');
    
    for (const test of tests) {
      await get().runTest(test.id);
    }
    
    set({ isRunningAll: false });
  },

  runByCategory: async (category) => {
    const tests = get().tests.filter((t) => t.category === category && t.status !== 'skipped');
    
    for (const test of tests) {
      await get().runTest(test.id);
    }
  },

  resetTests: () => {
    set((state) => ({
      tests: state.tests.map((t) => ({
        ...t,
        status: t.status === 'skipped' ? 'skipped' : 'pending',
        duration: undefined,
        error: undefined,
        lastRun: undefined,
      })),
    }));
  },

  getByCategory: (category) => get().tests.filter((t) => t.category === category),

  getStats: () => {
    const tests = get().tests;
    return {
      total: tests.length,
      passed: tests.filter((t) => t.status === 'passed').length,
      failed: tests.filter((t) => t.status === 'failed').length,
      pending: tests.filter((t) => t.status === 'pending').length,
      running: tests.filter((t) => t.status === 'running').length,
      skipped: tests.filter((t) => t.status === 'skipped').length,
    };
  },
}));
