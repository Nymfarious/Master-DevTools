// Issues Panel - Cross-app issue tracker with filters
import { useState } from 'react';
import {
  Bug, Plus, Filter, Trash2, CheckCircle2, AlertTriangle,
  AlertCircle, Info, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  useIssuesStore,
  type Issue,
  type AppId,
  type IssueCategory,
  type IssueSeverity,
  type IssueStatus,
} from '../stores/issuesStore';

const APPS: { id: AppId; label: string }[] = [
  { id: 'master-devtools', label: 'Master DevTools' },
  { id: 'storybook', label: 'Storybook' },
  { id: 'little-sister', label: 'Little Sister' },
  { id: 'drummer', label: 'Drummer' },
  { id: 'ged-builder', label: 'GED Builder' },
  { id: 'history-discovery', label: 'History Discovery' },
];

const SEVERITY_CONFIG = {
  critical: { color: 'bg-signal-red/20 text-signal-red border-signal-red/30', icon: AlertCircle },
  high: { color: 'bg-signal-amber/20 text-signal-amber border-signal-amber/30', icon: AlertTriangle },
  medium: { color: 'bg-signal-blue/20 text-signal-blue border-signal-blue/30', icon: Info },
  low: { color: 'bg-muted text-muted-foreground border-border', icon: Info },
};

const STATUS_CONFIG = {
  open: 'bg-signal-red/20 text-signal-red',
  'in-progress': 'bg-signal-amber/20 text-signal-amber',
  resolved: 'bg-signal-green/20 text-signal-green',
  closed: 'bg-muted text-muted-foreground',
};

function IssueItem({ issue }: { issue: Issue }) {
  const { toggleIssue, deleteIssue, updateIssue } = useIssuesStore();
  const SeverityIcon = SEVERITY_CONFIG[issue.severity].icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-elevated/50 transition-colors',
        issue.checked && 'opacity-60'
      )}
    >
      <Checkbox
        id={issue.id}
        checked={issue.checked}
        onCheckedChange={() => toggleIssue(issue.id)}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <label
          htmlFor={issue.id}
          className={cn(
            'text-sm font-medium cursor-pointer block',
            issue.checked && 'line-through text-muted-foreground'
          )}
        >
          {issue.title}
        </label>
        {issue.description && (
          <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <Badge variant="outline" className="text-[10px]">
            {APPS.find((a) => a.id === issue.app)?.label || issue.app}
          </Badge>
          <Badge className={cn('text-[10px]', SEVERITY_CONFIG[issue.severity].color)}>
            <SeverityIcon className="w-3 h-3 mr-1" />
            {issue.severity}
          </Badge>
          <Select
            value={issue.status}
            onValueChange={(value) => updateIssue(issue.id, { status: value as IssueStatus })}
          >
            <SelectTrigger className="h-5 w-24 text-[10px] px-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
        onClick={() => deleteIssue(issue.id)}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

function AddIssueDialog() {
  const { addIssue } = useIssuesStore();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    app: 'master-devtools' as AppId,
    category: 'bug' as IssueCategory,
    severity: 'medium' as IssueSeverity,
    status: 'open' as IssueStatus,
  });

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    addIssue(form);
    setForm({
      title: '',
      description: '',
      app: 'master-devtools',
      category: 'bug',
      severity: 'medium',
      status: 'open',
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-7">
          <Plus className="w-3 h-3 mr-1" />
          Add Issue
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Issue</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Issue title..."
            />
          </div>
          <div>
            <label className="text-sm font-medium">Description (optional)</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">App</label>
              <Select value={form.app} onValueChange={(v) => setForm({ ...form, app: v as AppId })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPS.map((app) => (
                    <SelectItem key={app.id} value={app.id}>
                      {app.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v as IssueCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Severity</label>
              <Select
                value={form.severity}
                onValueChange={(v) => setForm({ ...form, severity: v as IssueSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as IssueStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!form.title.trim()}>
            Add Issue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IssuesPanel() {
  const { issues, clearCompleted, getStats } = useIssuesStore();
  const [filterApp, setFilterApp] = useState<AppId | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<IssueStatus | 'all'>('all');
  const [filterSeverity, setFilterSeverity] = useState<IssueSeverity | 'all'>('all');
  
  const stats = getStats();

  const filteredIssues = issues.filter((issue) => {
    if (filterApp !== 'all' && issue.app !== filterApp) return false;
    if (filterStatus !== 'all' && issue.status !== filterStatus) return false;
    if (filterSeverity !== 'all' && issue.severity !== filterSeverity) return false;
    return true;
  });

  const openIssues = filteredIssues.filter((i) => i.status === 'open' || i.status === 'in-progress');
  const closedIssues = filteredIssues.filter((i) => i.status === 'resolved' || i.status === 'closed');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Bug className="w-5 h-5 text-signal-red" />
            Issue Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            {stats.open} open · {stats.critical} critical
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AddIssueDialog />
          {stats.completed > 0 && (
            <Button variant="outline" size="sm" className="h-7" onClick={clearCompleted}>
              <Trash2 className="w-3 h-3 mr-1" />
              Clear {stats.completed}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterApp} onValueChange={(v) => setFilterApp(v as AppId | 'all')}>
          <SelectTrigger className="h-7 w-36 text-xs">
            <SelectValue placeholder="All Apps" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Apps</SelectItem>
            {APPS.map((app) => (
              <SelectItem key={app.id} value={app.id}>
                {app.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as IssueStatus | 'all')}>
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filterSeverity}
          onValueChange={(v) => setFilterSeverity(v as IssueSeverity | 'all')}
        >
          <SelectTrigger className="h-7 w-28 text-xs">
            <SelectValue placeholder="All Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Issue Lists */}
      <Tabs defaultValue="open" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="open" className="flex-1">
            Open ({openIssues.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex-1">
            Closed ({closedIssues.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="open" className="space-y-2 mt-3">
          {openIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No open issues</p>
            </div>
          ) : (
            openIssues.map((issue) => <IssueItem key={issue.id} issue={issue} />)
          )}
        </TabsContent>
        <TabsContent value="closed" className="space-y-2 mt-3">
          {closedIssues.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No closed issues</p>
            </div>
          ) : (
            closedIssues.map((issue) => <IssueItem key={issue.id} issue={issue} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
