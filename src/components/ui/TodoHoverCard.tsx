// TodoHoverCard - Shows dev status and wishlist on hover
// Add to: src/components/ui/TodoHoverCard.tsx

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Wrench, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AppTodos } from '@/config/apps';

interface TodoHoverCardProps {
  children: React.ReactNode;
  todos?: AppTodos;
  appName: string;
  version?: string;
}

export function TodoHoverCard({ children, todos, appName, version }: TodoHoverCardProps) {
  // If no todos defined, just render children without hover
  if (!todos) return <>{children}</>;

  const hasInDev = todos.inDev && todos.inDev.length > 0;
  const hasWishlist = todos.wishlist && todos.wishlist.length > 0;
  const hasBlocked = todos.blocked && todos.blocked.length > 0;
  const hasCompleted = todos.recentlyCompleted && todos.recentlyCompleted.length > 0;
  
  const hasContent = hasInDev || hasWishlist || hasBlocked || hasCompleted;
  
  if (!hasContent) return <>{children}</>;

  return (
    <HoverCard openDelay={400} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent 
        className="w-80 text-xs terminal-glass border-border/50" 
        side="right" 
        align="start"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/30 pb-2">
            <p className="font-semibold text-sm text-foreground">{appName}</p>
            {version && (
              <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-1.5 py-0.5 rounded">
                v{version}
              </span>
            )}
          </div>
          
          {/* Recently Completed */}
          {hasCompleted && (
            <div>
              <p className="flex items-center gap-1.5 text-green-400 font-medium mb-1.5">
                <CheckCircle className="w-3 h-3" /> 
                Recently Completed
              </p>
              <ul className="space-y-1 text-muted-foreground pl-1">
                {todos.recentlyCompleted!.slice(0, 3).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-green-400/60 mt-0.5">✓</span> 
                    <span className="line-through opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* In Development */}
          {hasInDev && (
            <div>
              <p className="flex items-center gap-1.5 text-yellow-400 font-medium mb-1.5">
                <Wrench className="w-3 h-3" /> 
                In Development
              </p>
              <ul className="space-y-1 text-muted-foreground pl-1">
                {todos.inDev!.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-yellow-400/60 mt-0.5">•</span> 
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Wishlist */}
          {hasWishlist && (
            <div>
              <p className="flex items-center gap-1.5 text-blue-400 font-medium mb-1.5">
                <Lightbulb className="w-3 h-3" /> 
                Wishlist
              </p>
              <ul className="space-y-1 text-muted-foreground pl-1">
                {todos.wishlist!.slice(0, 4).map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-blue-400/60 mt-0.5">○</span> 
                    <span>{item}</span>
                  </li>
                ))}
                {todos.wishlist!.length > 4 && (
                  <li className="text-blue-400/40 italic pl-3">
                    +{todos.wishlist!.length - 4} more ideas...
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Blocked */}
          {hasBlocked && (
            <div>
              <p className="flex items-center gap-1.5 text-red-400 font-medium mb-1.5">
                <AlertTriangle className="w-3 h-3" /> 
                Blocked
              </p>
              <ul className="space-y-1 text-muted-foreground pl-1">
                {todos.blocked!.map((item, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-red-400/60 mt-0.5">⚠</span> 
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer hint */}
          <div className="text-[10px] text-muted-foreground/50 border-t border-border/30 pt-2 mt-2">
            Click card to expand • Load app for DevTools access
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
