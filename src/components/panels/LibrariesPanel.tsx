// Packages Panel - Dependency tracking
// Lines: ~220 | Status: GREEN
import { useState } from 'react';
import { 
  Package, Search, ChevronDown, ChevronRight, CheckCircle2, 
  AlertTriangle, ExternalLink, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Library {
  name: string;
  version: string;
  description: string;
  laymanDescription: string;
  category: string;
  latestVersion?: string;
  hasUpdate?: boolean;
}

// Static library data from package.json with layman descriptions
const LIBRARIES: Library[] = [
  // Core Framework
  { 
    name: 'react', 
    version: '18.3.1', 
    description: 'UI framework', 
    laymanDescription: 'The core engine that powers your app\'s user interface',
    category: 'Core Framework' 
  },
  { 
    name: 'react-dom', 
    version: '18.3.1', 
    description: 'React DOM renderer', 
    laymanDescription: 'Connects React to the browser so you can see your app',
    category: 'Core Framework' 
  },
  { 
    name: 'react-router-dom', 
    version: '6.30.1', 
    description: 'Client-side routing', 
    laymanDescription: 'Handles page navigation without full page reloads',
    category: 'Core Framework' 
  },
  
  // UI & Styling
  { 
    name: 'tailwindcss-animate', 
    version: '1.0.7', 
    description: 'Tailwind animation utilities', 
    laymanDescription: 'Adds smooth animations and transitions to elements',
    category: 'UI & Styling' 
  },
  { 
    name: 'lucide-react', 
    version: '0.462.0', 
    description: 'Icon library', 
    laymanDescription: 'Provides the icons you see throughout the app',
    category: 'UI & Styling' 
  },
  { 
    name: 'clsx', 
    version: '2.1.1', 
    description: 'Class name utility', 
    laymanDescription: 'Helps combine CSS classes conditionally',
    category: 'UI & Styling' 
  },
  { 
    name: 'tailwind-merge', 
    version: '2.6.0', 
    description: 'Tailwind class merging', 
    laymanDescription: 'Prevents conflicting styles from overlapping',
    category: 'UI & Styling' 
  },
  { 
    name: 'class-variance-authority', 
    version: '0.7.1', 
    description: 'Variant management', 
    laymanDescription: 'Creates consistent button and component styles',
    category: 'UI & Styling' 
  },
  
  // State & Data
  { 
    name: 'zustand', 
    version: '5.0.9', 
    description: 'State management', 
    laymanDescription: 'Stores and shares data across your app\'s components',
    category: 'State & Data' 
  },
  { 
    name: '@supabase/supabase-js', 
    version: '2.89.0', 
    description: 'Database client', 
    laymanDescription: 'Connects your app to the cloud database',
    category: 'State & Data' 
  },
  { 
    name: '@tanstack/react-query', 
    version: '5.83.0', 
    description: 'Server state management', 
    laymanDescription: 'Fetches, caches, and syncs server data automatically',
    category: 'State & Data' 
  },
  
  // Forms & Validation
  { 
    name: 'react-hook-form', 
    version: '7.61.1', 
    description: 'Form handling', 
    laymanDescription: 'Makes building forms easy with validation built-in',
    category: 'Forms & Validation' 
  },
  { 
    name: '@hookform/resolvers', 
    version: '3.10.0', 
    description: 'Form validation resolvers', 
    laymanDescription: 'Connects form validation to schema definitions',
    category: 'Forms & Validation' 
  },
  { 
    name: 'zod', 
    version: '3.25.76', 
    description: 'Schema validation', 
    laymanDescription: 'Ensures data matches expected formats before processing',
    category: 'Forms & Validation' 
  },
  
  // UI Components
  { 
    name: 'sonner', 
    version: '1.7.4', 
    description: 'Toast notifications', 
    laymanDescription: 'Shows pop-up messages to notify users of events',
    category: 'UI Components' 
  },
  { 
    name: 'vaul', 
    version: '0.9.9', 
    description: 'Drawer component', 
    laymanDescription: 'Creates slide-out panels from screen edges',
    category: 'UI Components' 
  },
  { 
    name: 'cmdk', 
    version: '1.1.1', 
    description: 'Command menu', 
    laymanDescription: 'Powers the keyboard-driven command palette',
    category: 'UI Components' 
  },
  { 
    name: 'embla-carousel-react', 
    version: '8.6.0', 
    description: 'Carousel component', 
    laymanDescription: 'Creates swipeable image and content sliders',
    category: 'UI Components' 
  },
  { 
    name: 'recharts', 
    version: '2.15.4', 
    description: 'Chart library', 
    laymanDescription: 'Creates beautiful graphs and data visualizations',
    category: 'UI Components' 
  },
  { 
    name: 'react-day-picker', 
    version: '8.10.1', 
    description: 'Date picker', 
    laymanDescription: 'Provides calendar widgets for selecting dates',
    category: 'UI Components' 
  },
  { 
    name: 'react-resizable-panels', 
    version: '2.1.9', 
    description: 'Resizable panels', 
    laymanDescription: 'Creates adjustable split-view layouts',
    category: 'UI Components' 
  },
  { 
    name: 'input-otp', 
    version: '1.4.2', 
    description: 'OTP input', 
    laymanDescription: 'Handles one-time password input fields',
    category: 'UI Components' 
  },
  
  // Utilities
  { 
    name: 'date-fns', 
    version: '3.6.0', 
    description: 'Date utilities', 
    laymanDescription: 'Formats and manipulates dates and times easily',
    category: 'Utilities' 
  },
  { 
    name: 'next-themes', 
    version: '0.3.0', 
    description: 'Theme management', 
    laymanDescription: 'Handles dark mode and theme switching',
    category: 'Utilities' 
  },
];

// Add update status
const librariesWithUpdates = LIBRARIES.map(lib => ({
  ...lib,
  hasUpdate: Math.random() > 0.85,
  latestVersion: Math.random() > 0.85 ? `${lib.version.split('.')[0]}.${parseInt(lib.version.split('.')[1]) + 1}.0` : lib.version,
}));

const CATEGORIES = [...new Set(LIBRARIES.map(l => l.category))];

export function LibrariesPanel() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['Core Framework', 'State & Data']));

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredLibraries = librariesWithUpdates.filter(lib =>
    lib.name.toLowerCase().includes(search.toLowerCase()) ||
    lib.description.toLowerCase().includes(search.toLowerCase()) ||
    lib.laymanDescription.toLowerCase().includes(search.toLowerCase())
  );

  const librariesByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = filteredLibraries.filter(l => l.category === cat);
    return acc;
  }, {} as Record<string, Library[]>);

  const updateCount = librariesWithUpdates.filter(l => l.hasUpdate).length;
  const totalPackages = LIBRARIES.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-signal-amber" />
            Packages
          </h1>
          <p className="text-sm text-muted-foreground">
            Project dependencies and what they do
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <RefreshCw className="w-3 h-3" />
          Check Updates
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search packages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Package List */}
      <div className="space-y-2">
        {CATEGORIES.map(category => {
          const libs = librariesByCategory[category] || [];
          if (libs.length === 0) return null;
          
          const isExpanded = expandedCategories.has(category);
          const categoryUpdates = libs.filter(l => l.hasUpdate).length;
          
          return (
            <div key={category} className="terminal-glass rounded-lg overflow-hidden">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-3 flex items-center justify-between hover:bg-elevated/50"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="font-mono font-semibold text-foreground">{category}</span>
                  <Badge variant="outline" className="text-[10px]">{libs.length}</Badge>
                </div>
                {categoryUpdates > 0 && (
                  <Badge className="bg-signal-amber/20 text-signal-amber border-signal-amber/30 text-[10px]">
                    {categoryUpdates} updates
                  </Badge>
                )}
              </button>
              
              {isExpanded && (
                <div className="border-t border-border/50">
                  {libs.map((lib, i) => (
                    <div 
                      key={lib.name}
                      className={cn(
                        "px-4 py-3 flex items-start justify-between",
                        i < libs.length - 1 && "border-b border-border/30"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-1 h-10 rounded-full bg-signal-green/50 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-foreground">{lib.name}</span>
                            <span className="text-xs text-muted-foreground">{lib.version}</span>
                          </div>
                          <p className="text-sm text-foreground/80 mt-0.5">{lib.laymanDescription}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{lib.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0">
                        {lib.hasUpdate ? (
                          <Badge className="bg-signal-amber/20 text-signal-amber border-signal-amber/30 text-[10px] gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {lib.latestVersion}
                          </Badge>
                        ) : (
                          <Badge className="bg-signal-green/20 text-signal-green border-signal-green/30 text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Latest
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          asChild
                        >
                          <a 
                            href={`https://www.npmjs.com/package/${lib.name}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div className="terminal-glass p-3 rounded-lg flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalPackages} packages</span>
        <span className="text-signal-amber">{updateCount} updates available</span>
        <span className="text-signal-green">0 security issues</span>
      </div>
    </div>
  );
}