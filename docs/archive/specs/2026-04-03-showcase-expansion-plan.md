# Showcase Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 26 standalone Vite+React showcase projects — one for every blueprint in the registry that doesn't already have a showcase.

**Architecture:** Each showcase is scaffolded via `decantr init --blueprint=X`, then an AI agent reads the generated section context files and builds all React pages, shells, components, and mock data. Each project is fully standalone with its own package.json, routing, auth simulation, and pre-built dist/.

**Tech Stack:** Vite 6, React 19, React Router 7 (HashRouter), TypeScript 5.7, @decantr/css (workspace), lucide-react

**Spec:** `docs/specs/2026-04-03-showcase-expansion-design.md`

---

## Execution Model

This plan has 26 independent sub-projects. Each follows the identical 3-task process below. Projects are grouped into 8 batches by complexity, with projects within each batch built in parallel by separate agents.

Each agent receives: the blueprint ID, theme, mode, and the complete generated context files from `decantr init`. The agent builds the entire showcase from those context files.

**Critical rule:** Each agent MUST read the generated `.decantr/context/scaffold.md` and all `section-*.md` files before writing any code. These files are the source of truth for visual specs, decorator usage, spacing, and pattern composition.

---

## Pre-Task: Verify CLI and Registry

Before any batch, confirm the CLI can reach the registry and the new blueprints are available.

- [ ] **Step 1: Verify CLI version and registry access**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm --filter decantr build
node packages/cli/dist/index.js --version
node packages/cli/dist/index.js list blueprints | head -30
```

Expected: CLI version prints, blueprint list includes all 29 blueprints (agent-studio, multi-tenant-platform, etc.)

- [ ] **Step 2: Test scaffold for one blueprint**

```bash
mkdir -p /tmp/decantr-test && cd /tmp/decantr-test
node /Users/davidaimi/projects/decantr-monorepo/packages/cli/dist/index.js init --blueprint=ai-copilot-shell --yes
ls -la decantr.essence.json .decantr/context/
cat .decantr/context/scaffold.md | head -50
```

Expected: essence file created, context files generated, scaffold.md shows topology and routes.

- [ ] **Step 3: Clean up test**

```bash
rm -rf /tmp/decantr-test
```

---

## Per-Showcase Build Process (Template)

Every showcase follows these 3 tasks. For each project in a batch, an agent executes this process with the specific blueprint parameters.

### Task A: Scaffold via CLI

**Files created by CLI:**
- `apps/showcase/{id}/decantr.essence.json`
- `apps/showcase/{id}/DECANTR.md`
- `apps/showcase/{id}/.decantr/context/scaffold.md`
- `apps/showcase/{id}/.decantr/context/section-*.md`
- `apps/showcase/{id}/src/styles/tokens.css`
- `apps/showcase/{id}/src/styles/treatments.css`
- `apps/showcase/{id}/src/styles/global.css`

- [ ] **Step 1: Create directory and scaffold**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase
mkdir {blueprint-id}
cd {blueprint-id}
npx decantr init --blueprint={blueprint-id} --yes
```

- [ ] **Step 2: Verify scaffold output**

```bash
ls decantr.essence.json .decantr/context/scaffold.md src/styles/tokens.css
```

Expected: All three files exist.

### Task B: Create Project Boilerplate

**Files to create:**
- `apps/showcase/{id}/package.json`
- `apps/showcase/{id}/vite.config.ts`
- `apps/showcase/{id}/tsconfig.json`
- `apps/showcase/{id}/index.html`
- `apps/showcase/{id}/src/main.tsx`

- [ ] **Step 1: Write package.json**

```json
{
  "name": "@decantr/showcase-{blueprint-id}",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@decantr/css": "workspace:*",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Write vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/showcase/{blueprint-id}/',
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  build: { outDir: 'dist' },
});
```

- [ ] **Step 3: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
```

- [ ] **Step 4: Write index.html**

```html
<!DOCTYPE html>
<html lang="en" class="{dark-or-empty}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Blueprint Name} — Decantr Showcase</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

Set `class="dark"` if blueprint theme mode is `dark`. Empty string if `light`.

- [ ] **Step 5: Write src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/decorators.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Task C: Build All React Code (Agent-Driven)

This is the big task. A dedicated agent reads the generated context files and builds everything.

**Files to create:**
- `apps/showcase/{id}/src/App.tsx` — HashRouter, AuthContext, zone routing
- `apps/showcase/{id}/src/hooks/useAuth.ts` — Auth context hook
- `apps/showcase/{id}/src/data/mock.ts` — All mock data, typed
- `apps/showcase/{id}/src/styles/decorators.css` — Theme decorator classes
- `apps/showcase/{id}/src/shells/*.tsx` — One per unique shell
- `apps/showcase/{id}/src/components/*.tsx` — Shared pattern components
- `apps/showcase/{id}/src/pages/{zone}/*.tsx` — One per route

**Agent instructions:**

- [ ] **Step 1: Read all context files**

Read these files in order:
1. `decantr.essence.json` — DNA, sections, routes, personality
2. `.decantr/context/scaffold.md` — Topology, voice, route map, shared components, development mode
3. Every `.decantr/context/section-*.md` — Shell specs, pattern specs, decorators, spacing guide

Extract from these files:
- Complete route table (path → page → shell → archetype)
- All unique shells with their region specs
- All patterns per page with presets and visual briefs
- Decorator definitions with CSS properties
- Spacing guide values
- Voice/personality directives
- Topology zones and transitions

- [ ] **Step 2: Write decorator CSS**

From each section context's decorator table, generate CSS classes:

```css
/* src/styles/decorators.css */
@layer decorators {
  /* Each decorator from the theme's decorator_definitions */
  .{decorator-name} {
    /* suggested_properties from the definition */
  }
}
```

- [ ] **Step 3: Write mock data**

Create `src/data/mock.ts` with typed interfaces and realistic mock data for every page in the blueprint. Follow the domain guidance from the spec's Mock Data Strategy section:
- 12-15 items for primary lists
- 8-10 for secondary lists
- 3-5 fully detailed items
- 12-30 data points for charts
- All statuses represented (active, pending, error, complete)

- [ ] **Step 4: Write shell components**

For each unique shell used by the blueprint, create `src/shells/{ShellName}.tsx`:
- Read the shell's internal_layout from the section context
- Implement CSS Grid/Flexbox layout matching the region specs
- Render nav items matching the blueprint's routes for that zone
- Use `<Outlet />` for the body region
- Apply decorator classes from the theme
- Implement responsive collapse (sidebar rail at md, etc.)

- [ ] **Step 5: Write shared components**

For patterns appearing on 2+ pages (listed in scaffold.md "Shared Components"), create `src/components/{PatternName}.tsx`:
- Follow the pattern's composition DSL from the section context
- Implement all slots described in the pattern spec
- Apply treatment classes (d-interactive, d-surface, d-data, etc.)
- Apply decorator classes specific to this theme
- Respect the spacing guide values
- Use mock data passed as props

- [ ] **Step 6: Write page components**

For every route in the blueprint, create `src/pages/{zone}/{PageName}.tsx`:
- Import shell component and shared components
- Implement page-specific patterns inline or as local components
- Wire mock data from `data/mock.ts`
- Follow the page's layout sequence from the section context (default_layout array)
- Apply all visual specs: treatments, decorators, spacing, motion

- [ ] **Step 7: Write App.tsx with routing**

```tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
// Import all shells, pages, AuthContext

export function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* PUBLIC zone */}
          <Route element={<PublicShell />}>
            {/* public routes */}
          </Route>

          {/* GATEWAY zone */}
          <Route element={<AuthShell />}>
            {/* auth routes */}
          </Route>

          {/* PRIMARY + AUXILIARY zones */}
          <Route element={<AuthGuard><AppShell /></AuthGuard>}>
            {/* app routes */}
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
```

- [ ] **Step 8: Write useAuth hook**

```tsx
// src/hooks/useAuth.ts
import { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('decantr_authenticated') === 'true'
  );
  const login = () => { localStorage.setItem('decantr_authenticated', 'true'); setIsAuthenticated(true); };
  const logout = () => { localStorage.removeItem('decantr_authenticated'); setIsAuthenticated(false); };
  return <AuthContext.Provider value={{ isAuthenticated, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

- [ ] **Step 9: Build and verify**

```bash
cd apps/showcase/{blueprint-id}
pnpm install
pnpm build
ls dist/index.html
```

Expected: Build succeeds, `dist/index.html` exists.

- [ ] **Step 10: Commit**

```bash
git add apps/showcase/{blueprint-id}/
git commit -m "feat(showcase): add {blueprint-id} showcase — {route-count} routes, {theme} theme"
```

---

## Batch Execution Schedule

### Batch 1: Low Complexity (23 routes total)

Run 3 agents in parallel, one per project:

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `ai-copilot-shell` | carbon | dark | 8 | copilot-overlay, centered, top-nav-footer, sidebar-main |
| `product-landing` | luminarum | dark | 7 | full-bleed, top-nav-main, top-nav-footer |
| `spatial-collaboration` | carbon | dark | 8 | sidebar-main, centered, top-nav-footer |

- [ ] Scaffold all 3 via `decantr init`
- [ ] Launch 3 parallel build agents (Task C)
- [ ] Verify all 3 build with `pnpm build`
- [ ] Commit batch

### Batch 2: Low-Medium Complexity (30 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `gaming-platform` | gaming-guild | dark | 9 | sidebar-main, centered |
| `workbench` | auradecantism | dark | 10 | sidebar-aside, sidebar-main, centered |
| `portfolio` | auradecantism | dark | 11 | full-bleed, top-nav-main, centered, sidebar-main |

- [ ] Scaffold all 3 via `decantr init`
- [ ] Launch 3 parallel build agents
- [ ] Verify all 3 build
- [ ] Commit batch

### Batch 3: Medium Complexity (39 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `knowledge-base` | paper | light | 12 | three-column-browser, sidebar-main, top-nav-main, top-nav-footer, centered |
| `cloud-platform` | launchpad | dark | 14 | sidebar-main, centered, full-bleed |
| `content-site` | editorial | light | 13 | top-nav-main, sidebar-main, minimal-header, top-nav-footer, centered |

- [ ] Scaffold all 3
- [ ] Launch 3 parallel build agents
- [ ] Verify all 3 build
- [ ] Commit batch

### Batch 4: Medium Complexity (58 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `ecommerce` | auradecantism | light | 19 | top-nav-main, minimal-header, sidebar-main, top-nav-footer, centered |
| `saas-dashboard` | auradecantism | dark | 19 | sidebar-main, top-nav-footer, centered, sidebar-aside |
| `recipe-community` | auradecantism | light | 20 | top-nav-main, minimal-header, sidebar-main, top-nav-footer, centered |

- [ ] Scaffold all 3
- [ ] Launch 3 parallel build agents
- [ ] Verify all 3 build
- [ ] Commit batch

### Batch 5: Medium-High Complexity (62 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `financial-dashboard` | auradecantism | dark | 20 | sidebar-main, top-nav-footer, centered |
| `carbon-ai-portal` | carbon | dark | 20 | chat-portal, sidebar-main, centered, top-nav-footer |
| `ecommerce-admin` | auradecantism | dark | 22 | sidebar-main, centered |

- [ ] Scaffold all 3
- [ ] Launch 3 parallel build agents
- [ ] Verify all 3 build
- [ ] Commit batch

### Batch 6: High Complexity (69 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `event-community-hub` | dopamine | dark | 23 | top-nav-main, minimal-header, sidebar-main, top-nav-footer, centered |
| `health-wellness-portal` | healthcare | light | 23 | sidebar-main, minimal-header, top-nav-footer, centered |
| `multi-tenant-platform` | launchpad | dark | 23 | sidebar-main, centered, top-nav-footer |

- [ ] Scaffold all 3
- [ ] Launch 3 parallel build agents
- [ ] Verify all 3 build
- [ ] Commit batch

### Batch 7: High Complexity (95 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `realtime-collaboration-workspace` | paper | light | 23 | sidebar-main, workspace-aside, centered, top-nav-footer, top-nav-main |
| `ai-native-crm` | glassmorphism | dark | 24 | sidebar-main, top-nav-footer, centered |
| `observability-platform` | fintech | dark | 24 | sidebar-main, top-nav-footer, centered |
| `data-pipeline-studio` | terminal | dark | 24 | terminal-split, sidebar-main, sidebar-aside, top-nav-footer, centered |

- [ ] Scaffold all 4
- [ ] Launch 4 parallel build agents
- [ ] Verify all 4 build
- [ ] Commit batch

### Batch 8: Very High Complexity (131 routes total)

| Project | Theme | Mode | Routes | Shells |
|---------|-------|------|--------|--------|
| `agent-studio` | carbon-neon | dark | 28 | sidebar-aside, sidebar-main, top-nav-footer, centered |
| `two-sided-marketplace` | clean | light | 28 | top-nav-main, sidebar-main, top-nav-footer, centered |
| `creator-monetization-platform` | studio | light | 33 | sidebar-main, top-nav-main, minimal-header, centered, top-nav-footer |
| `property-management-portal` | estate | light | 35 | sidebar-main, centered, top-nav-footer, top-nav-main |

- [ ] Scaffold all 4
- [ ] Launch 4 parallel build agents
- [ ] Verify all 4 build
- [ ] Commit batch

---

## Post-Build: Final Validation

- [ ] **Step 1: Build all showcases**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm showcase:build
```

Expected: All 29 showcases (3 existing + 26 new) build successfully.

- [ ] **Step 2: Copy to registry**

```bash
pnpm showcase:copy
```

Expected: 29 directories in `apps/registry/public/showcase/`.

- [ ] **Step 3: Verify dist files**

```bash
ls apps/registry/public/showcase/ | wc -l
```

Expected: 29

- [ ] **Step 4: Spot-check visual quality**

Open 3-5 showcases in a browser to verify:
- Theme renders correctly (dark/light mode, correct colors)
- Auth flow works (login → app → logout)
- Navigation between zones works
- Pages have populated mock data
- Responsive behavior at 375px, 768px, 1280px

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat(showcase): complete all 29 blueprint showcases"
```
