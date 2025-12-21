// Test Lab Panel - Test runner with categories and results
import { useState } from 'react';
import {
  TestTube, Play, RefreshCw, CheckCircle, XCircle,
  Circle, Loader2, SkipForward, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  useTestLabStore,
  type TestResult,
  type TestCategory,
} from '../stores/testLabStore';

const CATEGORIES: { id: TestCategory; label: string; description: string }[] = [
  { id: 'components', label: 'Components', description: 'Test UI components' },
  { id: 'api', label: 'API Tests', description: 'Test API endpoints' },
  { id: 'integration', label: 'Integration', description: 'End-to-end tests' },
  { id: 'performance', label: 'Performance', description: 'Load and speed tests' },
];

function TestItem({ test, onRun }: { test: TestResult; onRun: () => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-elevated/50 border border-border/30">
      <div className="flex items-center gap-3">
        {test.status === 'passed' && <CheckCircle className="w-4 h-4 text-signal-green" />}
        {test.status === 'failed' && <XCircle className="w-4 h-4 text-signal-red" />}
        {test.status === 'running' && <Loader2 className="w-4 h-4 text-signal-blue animate-spin" />}
        {test.status === 'pending' && <Circle className="w-4 h-4 text-muted-foreground" />}
        {test.status === 'skipped' && <SkipForward className="w-4 h-4 text-muted-foreground" />}
        <div>
          <span className="text-sm font-medium">{test.name}</span>
          {test.error && (
            <p className="text-xs text-signal-red mt-0.5">{test.error}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {test.duration !== undefined && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {test.duration}ms
          </span>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={onRun}
          disabled={test.status === 'running' || test.status === 'skipped'}
        >
          <Play className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function CategoryTab({ category }: { category: TestCategory }) {
  const { getByCategory, runTest, runByCategory } = useTestLabStore();
  const tests = getByCategory(category);
  const passed = tests.filter((t) => t.status === 'passed').length;
  const failed = tests.filter((t) => t.status === 'failed').length;
  const running = tests.some((t) => t.status === 'running');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {passed}/{tests.length} passed
          </Badge>
          {failed > 0 && (
            <Badge className="bg-signal-red/20 text-signal-red text-xs">
              {failed} failed
            </Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-7"
          onClick={() => runByCategory(category)}
          disabled={running}
        >
          {running ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Play className="w-3 h-3 mr-1" />}
          Run All
        </Button>
      </div>
      <div className="space-y-2">
        {tests.map((test) => (
          <TestItem key={test.id} test={test} onRun={() => runTest(test.id)} />
        ))}
      </div>
    </div>
  );
}

export function TestLabPanel() {
  const { tests, isRunningAll, runAllTests, resetTests, getStats } = useTestLabStore();
  const stats = getStats();

  const passRate = stats.total > 0 ? Math.round((stats.passed / (stats.total - stats.skipped)) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <TestTube className="w-5 h-5 text-signal-purple" />
            Test Lab
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.passed} passed · {stats.failed} failed · {stats.pending} pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7" onClick={resetTests}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Reset
          </Button>
          <Button size="sm" className="h-7" onClick={runAllTests} disabled={isRunningAll}>
            {isRunningAll ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Play className="w-3 h-3 mr-1" />
            )}
            Run All
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="terminal-glass p-4 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Test Coverage</span>
          <span className={cn(
            'text-lg font-mono font-bold',
            passRate >= 80 ? 'text-signal-green' : passRate >= 50 ? 'text-signal-amber' : 'text-signal-red'
          )}>
            {passRate}%
          </span>
        </div>
        <Progress value={passRate} className="h-2" />
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <p className="text-signal-green font-mono font-bold">{stats.passed}</p>
            <p className="text-muted-foreground">Passed</p>
          </div>
          <div>
            <p className="text-signal-red font-mono font-bold">{stats.failed}</p>
            <p className="text-muted-foreground">Failed</p>
          </div>
          <div>
            <p className="text-muted-foreground font-mono font-bold">{stats.pending}</p>
            <p className="text-muted-foreground">Pending</p>
          </div>
          <div>
            <p className="text-signal-blue font-mono font-bold">{stats.running}</p>
            <p className="text-muted-foreground">Running</p>
          </div>
          <div>
            <p className="text-muted-foreground font-mono font-bold">{stats.skipped}</p>
            <p className="text-muted-foreground">Skipped</p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="api" className="w-full">
        <TabsList className="w-full justify-start">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat.id} value={cat.id} className="flex-1">
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {CATEGORIES.map((cat) => (
          <TabsContent key={cat.id} value={cat.id} className="mt-3">
            <CategoryTab category={cat.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
