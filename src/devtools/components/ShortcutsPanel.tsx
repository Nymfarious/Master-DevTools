import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Command, Search, Keyboard } from 'lucide-react';
import { useDevToolsStore } from '../stores/devToolsStore';

interface ShortcutCommand {
  id: string;
  name: string;
  description: string;
  keys: string[];
  category: 'navigation' | 'action' | 'panel';
  action: () => void;
}

export function ShortcutsPanel() {
  const { setActiveSection, toggleDrawer, closeDrawer } = useDevToolsStore();
  const [search, setSearch] = useState('');

  // Detect Mac vs Windows/Linux
  const isMac = typeof navigator !== 'undefined' && 
    navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'Ctrl';

  const commands: ShortcutCommand[] = [
    { 
      id: 'toggle-devtools', 
      name: 'Toggle DevTools', 
      description: 'Open or close the DevTools drawer', 
      keys: [modKey, 'Shift', 'D'], 
      category: 'action', 
      action: toggleDrawer 
    },
    { 
      id: 'nav-overview', 
      name: 'Go to Overview', 
      description: 'Jump to Overview panel', 
      keys: [modKey, '1'], 
      category: 'navigation', 
      action: () => setActiveSection('overview') 
    },
    { 
      id: 'nav-logs', 
      name: 'Go to Logs', 
      description: 'Jump to Logs panel', 
      keys: [modKey, 'L'], 
      category: 'navigation', 
      action: () => setActiveSection('logs') 
    },
    { 
      id: 'nav-apis', 
      name: 'Go to APIs', 
      description: 'Jump to API Registry', 
      keys: [modKey, 'A'], 
      category: 'navigation', 
      action: () => setActiveSection('apis') 
    },
    { 
      id: 'nav-security', 
      name: 'Go to Security', 
      description: 'Jump to Security panel', 
      keys: [modKey, 'S'], 
      category: 'navigation', 
      action: () => setActiveSection('security') 
    },
    { 
      id: 'nav-pipeline', 
      name: 'Go to Pipeline', 
      description: 'Jump to Pipeline Monitor', 
      keys: [modKey, 'P'], 
      category: 'navigation', 
      action: () => setActiveSection('pipeline') 
    },
    { 
      id: 'nav-build-status', 
      name: 'Go to Build Status', 
      description: 'Jump to Build Status panel', 
      keys: [modKey, 'B'], 
      category: 'navigation', 
      action: () => setActiveSection('build-status') 
    },
    { 
      id: 'close-drawer', 
      name: 'Close Drawer', 
      description: 'Close DevTools drawer', 
      keys: ['Esc'], 
      category: 'action', 
      action: closeDrawer 
    },
    { 
      id: 'quick-search', 
      name: 'Quick Search', 
      description: 'Focus search input', 
      keys: [modKey, 'K'], 
      category: 'action', 
      action: () => document.querySelector<HTMLInputElement>('[data-search-input]')?.focus() 
    },
  ];

  // Register keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      
      for (const cmd of commands) {
        // Handle Escape
        if (cmd.keys[0] === 'Esc' && e.key === 'Escape') {
          e.preventDefault();
          cmd.action();
          return;
        }
        
        // Handle modifier combos
        if (mod && cmd.keys.length >= 2) {
          const lastKey = cmd.keys[cmd.keys.length - 1].toLowerCase();
          const hasShift = cmd.keys.includes('Shift');
          
          if (hasShift && !e.shiftKey) continue;
          if (!hasShift && e.shiftKey) continue;
          
          if (e.key.toLowerCase() === lastKey || e.key === lastKey) {
            e.preventDefault();
            cmd.action();
            return;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMac, commands]);

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(search.toLowerCase()) ||
    cmd.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = {
    navigation: filteredCommands.filter(c => c.category === 'navigation'),
    action: filteredCommands.filter(c => c.category === 'action'),
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Keyboard className="h-5 w-5" />
          Keyboard Shortcuts
        </h3>
        <p className="text-muted-foreground text-sm mt-1">
          Quick commands for faster navigation
        </p>
      </div>

      {/* Pro Tip */}
      <Card className="bg-primary/10 border-primary/30">
        <CardContent className="py-3">
          <div className="flex items-center gap-2 text-sm text-primary">
            <Command className="h-4 w-4" />
            <span>
              <strong>Pro tip:</strong> Press{' '}
              <kbd className="px-2 py-0.5 bg-secondary rounded text-xs">{modKey}+K</kbd>{' '}
              anywhere to search
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-search-input
          placeholder="Search shortcuts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-secondary/50 border-border"
        />
      </div>

      {/* Navigation Shortcuts */}
      {groupedCommands.navigation.length > 0 && (
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {groupedCommands.navigation.map((cmd) => (
              <ShortcutRow key={cmd.id} command={cmd} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Shortcuts */}
      {groupedCommands.action.length > 0 && (
        <Card className="bg-secondary/30 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {groupedCommands.action.map((cmd) => (
              <ShortcutRow key={cmd.id} command={cmd} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Platform Badge */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Detected platform:</span>
        <Badge variant="outline" className="text-xs">
          {isMac ? 'macOS (⌘)' : 'Windows/Linux (Ctrl)'}
        </Badge>
      </div>
    </div>
  );
}

function ShortcutRow({ command }: { command: ShortcutCommand }) {
  return (
    <div
      className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors"
      onClick={command.action}
    >
      <div>
        <div className="text-sm font-medium text-foreground">{command.name}</div>
        <div className="text-xs text-muted-foreground">{command.description}</div>
      </div>
      <div className="flex gap-1">
        {command.keys.map((key, i) => (
          <kbd
            key={i}
            className="px-2 py-1 bg-secondary border border-border rounded text-xs font-mono"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}
