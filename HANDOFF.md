# 🎯 Project Handoff: Master DevTools Dashboard

**Version:** 2.3.1  
**Last Updated:** 2025-01-21  
**Conductor:** User (the boss!)

---

## 🏗️ Architecture Overview

This is a **React + Vite + TypeScript** dashboard with a sophisticated DevTools system. Two parallel DevTools implementations exist:

| System | Location | Purpose |
|--------|----------|---------|
| **Main DevTools** | `/src/devtools/` | Full-featured slide-out drawer (19 panels) |
| **Mini DevTools** | `/src/mini-devtools/` | Lightweight version (same panels) |

### Key Entry Points
- `App.tsx` → Wraps everything with `<DevToolsProvider>`
- `Dashboard.tsx` → Main workspace with sidebar + panel routing
- `DevToolsProvider.tsx` → Renders floating `<DevButton>` + `<DevDrawer>`

---

## 📁 Critical Files

```
src/
├── devtools/
│   ├── components/
│   │   ├── DevButton.tsx      # Floating trigger (bottom-right)
│   │   ├── DevDrawer.tsx      # Slide-out panel container
│   │   ├── IconRail.tsx       # Left icon navigation (scrollable)
│   │   └── PanelRouter.tsx    # Routes to correct panel
│   ├── config/sections.ts     # Panel definitions (19 sections)
│   └── stores/                # Zustand stores for each feature
├── config/sections.ts         # Dashboard sidebar sections (KEEP IN SYNC!)
├── types/devtools.ts          # SectionId union type
└── pages/Dashboard.tsx        # Main dashboard with renderPanel()
```

---

## ⚠️ Current Dev State

### Auth Bypass ACTIVE
```typescript
// src/pages/Dashboard.tsx line ~18
const DEV_BYPASS_AUTH = true;  // ← DISABLE BEFORE PRODUCTION

// src/pages/Auth.tsx
// Has "DEV BYPASS" button - REMOVE BEFORE PRODUCTION
```

### Sections Must Stay Synced
These files define the same 19 panels - keep them aligned:
1. `src/devtools/config/sections.ts`
2. `src/config/sections.ts`
3. `src/types/devtools.ts` (SectionId type)
4. `src/mini-devtools/config/sections.ts`

---

## 🎨 Design System

- **Theming:** All via `index.css` CSS variables + `tailwind.config.ts`
- **Colors:** HSL only, use semantic tokens (`--primary`, `--muted`, etc.)
- **Components:** shadcn/ui base, customized in `/src/components/ui/`

---

## 📊 Panel Phases

| Phase | Panels |
|-------|--------|
| 1-3 | Overview, Apps, API Registry |
| 4-6 | Logs, Pipeline, Security |
| 7-9 | Data, Tokens, Libraries, Content, Audio |
| 10 | Flowchart, Agents, Animation |
| 10+ | Shortcuts, Style Guide, Generator, Export, Settings |

---

## 🔧 Stores (Zustand)

| Store | Purpose |
|-------|---------|
| `devToolsStore` | Drawer open/close, active section |
| `settingsStore` | Master visibility, FPS, preferences |
| `logsStore` | Console log capture |
| `pipelineStore` | Asset pipeline state |
| `audioStore` | Audio engine state |
| `issuesStore` | Issue tracking |

---

## 🚀 Quick Commands

```bash
# Dev server
npm run dev

# The DevButton appears bottom-right on ALL pages
# Keyboard: Cmd/Ctrl + D toggles drawer
```

---

## 📝 Notes for Future AI

1. **Keep files GREEN** - User prefers small, focused changes
2. **Don't over-engineer** - Minimum viable changes only
3. **Sync sections** - When adding panels, update ALL 4 config files
4. **HSL colors only** - No direct color classes, use design tokens
5. **Refactor when needed** - But only what's requested

---

## 🤝 Team

- **Lovey** (Claude) - Primary dev AI
- **Claude** - Code review/assistance
- **GitHub** - Version control
- **GitBash** - CLI operations
- **Gemma** - Additional AI support
- **Conductor** - The human boss, final decisions

---

*"Keep it simple, keep it synced, keep it GREEN."*
