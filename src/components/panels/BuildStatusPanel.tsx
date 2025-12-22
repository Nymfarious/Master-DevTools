// Build Status Panel - Track feature completion, notes, and dependencies
import { useState } from 'react';
import { Check, Trash2, Plus, Circle, CheckCircle2, Clock, AlertCircle, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useBuildStatusStore } from '@/stores/buildStatusStore';
import { 
  FeatureStatus, 
  Priority, 
  STATUS_STYLES, 
  PRIORITY_STYLES,
  DEPENDENCY_STATUS_STYLES 
} from '@/types/buildStatus';
import { formatDistanceToNow } from 'date-fns';

const STATUS_ORDER: FeatureStatus[] = ['complete', 'partial', 'stub', 'bug', 'planned'];

export function BuildStatusPanel() {
  const { 
    features, 
    notes, 
    dependencies,
    updateFeatureStatus,
    addNote,
    toggleNoteResolved,
    deleteNote,
    getCompletionPercentage,
    getActiveNotes,
    getResolvedNotes,
    getFeaturesByCategory
  } = useBuildStatusStore();

  const [newNote, setNewNote] = useState('');
  const [newPriority, setNewPriority] = useState<Priority>('P2');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    Monitoring: true,
    Testing: true,
    Reference: true,
    Tools: true,
  });

  const completion = getCompletionPercentage();
  const featuresByCategory = getFeaturesByCategory();
  const activeNotes = getActiveNotes();
  const resolvedNotes = getResolvedNotes();

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote(newNote.trim(), newPriority);
      setNewNote('');
    }
  };

  const cycleStatus = (id: string, currentStatus: FeatureStatus) => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_ORDER.length;
    updateFeatureStatus(id, STATUS_ORDER[nextIndex]);
  };

  const getCategoryCompletion = (categoryFeatures: typeof features) => {
    const complete = categoryFeatures.filter(f => f.status === 'complete').length;
    return `${complete}/${categoryFeatures.length}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Progress */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Build Status
          </h2>
          <Badge variant="outline" className="text-sm">
            {completion}% Complete
          </Badge>
        </div>
        <Progress value={completion} className="h-2" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="features" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="features" className="flex-1">Features</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">
            Notes {activeNotes.length > 0 && `(${activeNotes.length})`}
          </TabsTrigger>
          <TabsTrigger value="dependencies" className="flex-1">Dependencies</TabsTrigger>
        </TabsList>

        {/* Features Tab */}
        <TabsContent value="features" className="flex-1 m-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4 space-y-2">
              {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
                <Collapsible
                  key={category}
                  open={openCategories[category]}
                  onOpenChange={(open) => setOpenCategories(prev => ({ ...prev, [category]: open }))}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{category}</span>
                    <Badge variant="secondary" className="text-xs">
                      {getCategoryCompletion(categoryFeatures)} complete
                    </Badge>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 ml-2 mt-1">
                    {categoryFeatures.map((feature) => {
                      const style = STATUS_STYLES[feature.status];
                      return (
                        <div
                          key={feature.id}
                          className="flex items-start gap-3 p-2 rounded-lg border border-border/50 bg-card/50"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{feature.name}</div>
                            <div className="text-xs text-muted-foreground">{feature.description}</div>
                          </div>
                          <button
                            onClick={() => cycleStatus(feature.id, feature.status)}
                            className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${style.color} ${style.bg} hover:opacity-80 transition-opacity`}
                          >
                            {style.label}
                          </button>
                        </div>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="flex-1 m-0">
          <div className="p-4 space-y-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1"
              />
              <Select value={newPriority} onValueChange={(v) => setNewPriority(v as Priority)}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['P1', 'P2', 'P3', 'V2'] as Priority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      <span className={PRIORITY_STYLES[p].color}>{p}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="icon" onClick={handleAddNote}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="h-[calc(100vh-380px)]">
              {/* Active Notes */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Active Notes ({activeNotes.length})
                </h3>
                {activeNotes.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic p-2">No active notes</p>
                ) : (
                  activeNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start gap-2 p-2 rounded-lg border border-border bg-card"
                    >
                      {note.priority && (
                        <Badge className={`shrink-0 ${PRIORITY_STYLES[note.priority].color} ${PRIORITY_STYLES[note.priority].bg} border-0`}>
                          {note.priority}
                        </Badge>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => toggleNoteResolved(note.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Resolved Notes */}
              {resolvedNotes.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Resolved ({resolvedNotes.length})
                  </h3>
                  {resolvedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-muted/30 opacity-60"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm line-through">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(note.createdAt, { addSuffix: true })}
                        </p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => toggleNoteResolved(note.id)}
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Dependencies Tab */}
        <TabsContent value="dependencies" className="flex-1 m-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="p-4">
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-3 font-medium">Name</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Required</th>
                      <th className="text-left p-3 font-medium">Fallback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependencies.map((dep) => {
                      const statusStyle = DEPENDENCY_STATUS_STYLES[dep.status];
                      return (
                        <tr key={dep.id} className="border-t border-border/50">
                          <td className="p-3 font-medium">{dep.name}</td>
                          <td className="p-3 capitalize text-muted-foreground">{dep.type}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Circle className={`w-3 h-3 fill-current ${statusStyle.color.replace('bg-', 'text-')}`} />
                              <span className="capitalize">{dep.status}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            {dep.required ? (
                              <Badge variant="default" className="text-xs">Yes</Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">No</Badge>
                            )}
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {dep.fallback || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
