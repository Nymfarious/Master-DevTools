# CollapsibleAppCard.tsx - Patch Instructions

## File: src/components/overview/CollapsibleAppCard.tsx

### Step 1: Add import (after line 25)

```typescript
// ADD after the Tooltip imports:
import { TodoHoverCard } from '@/components/ui/TodoHoverCard';
```

### Step 2: Wrap the app name with TodoHoverCard (around line 127-131)

**FIND THIS:**
```typescript
{/* Name + Version */}
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">
    <span className="font-display font-semibold text-sm truncate">
      {app.name}
    </span>
```

**REPLACE WITH:**
```typescript
{/* Name + Version */}
<div className="flex-1 min-w-0">
  <div className="flex items-center gap-2">
    <TodoHoverCard todos={app.todos} appName={app.name} version={app.version}>
      <span className="font-display font-semibold text-sm truncate cursor-help">
        {app.name}
      </span>
    </TodoHoverCard>
```

### Step 3: Add visual indicator for apps with todos (optional)

After the ping status circle and before the isLoaded badge, you can add a small indicator:

**FIND THIS (around line 148-160):**
```typescript
{isLoaded && (
  <Tooltip>
```

**ADD BEFORE IT:**
```typescript
{app.todos?.inDev?.length && (
  <Tooltip>
    <TooltipTrigger asChild>
      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
    </TooltipTrigger>
    <TooltipContent side="top" className="text-xs">
      Active development - hover name for details
    </TooltipContent>
  </Tooltip>
)}
{isLoaded && (
```

---

## Full diff preview:

```diff
// Line 19-26
 import { AppHealthIndicator } from '@/components/overview/AppHealthIndicator';
 import { AppDevToolsDrawer } from '@/components/devtools/AppDevToolsDrawer';
 import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
 } from '@/components/ui/tooltip';
+import { TodoHoverCard } from '@/components/ui/TodoHoverCard';

// Line 127-131
           {/* Name + Version */}
           <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2">
-              <span className="font-display font-semibold text-sm truncate">
-                {app.name}
-              </span>
+              <TodoHoverCard todos={app.todos} appName={app.name} version={app.version}>
+                <span className="font-display font-semibold text-sm truncate cursor-help">
+                  {app.name}
+                </span>
+              </TodoHoverCard>

// Line 148 (optional indicator)
+              {app.todos?.inDev?.length && (
+                <Tooltip>
+                  <TooltipTrigger asChild>
+                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
+                  </TooltipTrigger>
+                  <TooltipContent side="top" className="text-xs">
+                    Active development - hover name for details
+                  </TooltipContent>
+                </Tooltip>
+              )}
               {isLoaded && (
```

---

## Result

After applying this patch:
1. Hovering over any app name shows a card with:
   - Recently completed items (green checkmarks)
   - In Development items (yellow dots)
   - Wishlist items (blue circles)
   - Blocked items (red warnings)
2. Apps with active development show a small yellow pulse dot
3. The hover card includes version number and footer hint
