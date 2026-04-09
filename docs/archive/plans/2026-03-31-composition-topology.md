# Composition Topology Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add archetype `role` field and CLI topology generation so AI code generators derive application flows from structure, not explicit wiring instructions.

**Architecture:** One new field (`role`) on archetypes. The CLI's `composeArchetypes()` gains zone derivation, transition derivation, and entry point computation. A new `generateTopologySection()` function builds the Composition Topology narrative for DECANTR.md. The MCP server's blueprint tool returns topology in its response.

**Tech Stack:** TypeScript, Vitest, decantr-content (JSON), essence-spec (schema), registry (resolver), CLI (scaffold), MCP server (tools)

**Spec:** `docs/specs/2026-03-31-composition-topology-design.md`

---

## File Map

### decantr-monorepo

| File | Change | Responsibility |
|------|--------|---------------|
| `packages/registry/src/types.ts` | Modify | Add `ArchetypeRole` type, update `ComposeEntry` to support role override |
| `packages/registry/src/index.ts` | Modify | Re-export new types |
| `packages/cli/src/scaffold.ts` | Modify | Enhance `composeArchetypes()` with zone derivation; add `deriveZones()`, `deriveTransitions()`, `generateTopologySection()` |
| `packages/cli/src/templates/DECANTR.md.template` | Modify | Add `{{COMPOSITION_TOPOLOGY}}` placeholder |
| `packages/cli/src/index.ts` | Modify | Pass topology data through scaffold pipeline |
| `packages/mcp-server/src/tools.ts` | Modify | Add topology to `decantr_resolve_blueprint` response |
| `packages/cli/test/compose.test.ts` | Modify | Add zone derivation tests |
| `packages/cli/test/topology.test.ts` | Create | Tests for `deriveZones()`, `deriveTransitions()`, `generateTopologySection()` |

### decantr-content

| File | Change | Responsibility |
|------|--------|---------------|
| `archetypes/*.json` (52 files) | Modify | Add `role` field to every archetype |
| `validate.js` | Modify | Add `role` validation for archetypes |

---

## Task 1: Add ArchetypeRole Type to Registry Package

**Files:**
- Modify: `packages/registry/src/types.ts`
- Modify: `packages/registry/src/index.ts`

- [ ] **Step 1: Add the type and update ComposeEntry**

In `packages/registry/src/types.ts`, add after line 90 (before `ComposeEntry`):

```ts
export type ArchetypeRole = 'primary' | 'gateway' | 'public' | 'auxiliary';
```

Then update `ComposeEntry` at line 92:

```ts
export type ComposeEntry = string | { archetype: string; prefix: string; role?: ArchetypeRole };
```

- [ ] **Step 2: Re-export from index.ts**

In `packages/registry/src/index.ts`, add `ArchetypeRole` to the exports from `./types.js` (line 12 area).

- [ ] **Step 3: Build and verify**

```bash
pnpm --filter @decantr/registry run build
```

Expected: Clean build, no errors.

- [ ] **Step 4: Commit**

```bash
git add packages/registry/src/types.ts packages/registry/src/index.ts
git commit -m "feat(registry): add ArchetypeRole type and compose role override"
```

---

## Task 2: Enhance composeArchetypes with Zone Derivation

**Files:**
- Modify: `packages/cli/src/scaffold.ts`
- Modify: `packages/cli/test/compose.test.ts`
- Create: `packages/cli/test/topology.test.ts`

- [ ] **Step 1: Write failing tests for zone derivation**

Create `packages/cli/test/topology.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { deriveZones, deriveTransitions } from '../src/scaffold.js';
import type { ArchetypeRole } from '@decantr/registry';

interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

describe('deriveZones', () => {
  it('groups archetypes by role', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'ai-chatbot', role: 'primary', shell: 'chat-portal', features: ['chat'], description: 'AI chatbot interface' },
      { archetypeId: 'auth-full', role: 'gateway', shell: 'centered', features: ['auth', 'mfa'], description: 'Authentication flow' },
      { archetypeId: 'marketing-saas', role: 'public', shell: 'top-nav-footer', features: ['pricing-toggle'], description: 'Marketing landing' },
      { archetypeId: 'settings-full', role: 'auxiliary', shell: 'sidebar-settings', features: ['profile-edit'], description: 'Settings pages' },
    ];

    const zones = deriveZones(inputs);

    expect(zones).toHaveLength(4);
    expect(zones.find(z => z.role === 'primary')!.archetypes).toEqual(['ai-chatbot']);
    expect(zones.find(z => z.role === 'gateway')!.archetypes).toEqual(['auth-full']);
    expect(zones.find(z => z.role === 'public')!.archetypes).toEqual(['marketing-saas']);
    expect(zones.find(z => z.role === 'auxiliary')!.archetypes).toEqual(['settings-full']);
  });

  it('merges multiple archetypes in the same zone', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'marketing-saas', role: 'public', shell: 'top-nav-footer', features: ['pricing'], description: 'Marketing' },
      { archetypeId: 'about-hybrid', role: 'public', shell: 'top-nav-footer', features: ['team-grid'], description: 'About page' },
      { archetypeId: 'contact', role: 'public', shell: 'top-nav-footer', features: ['form-validation'], description: 'Contact form' },
    ];

    const zones = deriveZones(inputs);

    expect(zones).toHaveLength(1);
    expect(zones[0].archetypes).toEqual(['marketing-saas', 'about-hybrid', 'contact']);
    expect(zones[0].features).toContain('pricing');
    expect(zones[0].features).toContain('team-grid');
    expect(zones[0].features).toContain('form-validation');
    expect(zones[0].descriptions).toHaveLength(3);
  });

  it('uses majority shell for zone', () => {
    const inputs: ZoneInput[] = [
      { archetypeId: 'ai-chatbot', role: 'primary', shell: 'chat-portal', features: [], description: '' },
      { archetypeId: 'settings-full', role: 'primary', shell: 'sidebar-main', features: [], description: '' },
    ];

    const zones = deriveZones(inputs);

    expect(zones).toHaveLength(1);
    // First archetype's shell wins when tied
    expect(zones[0].shell).toBe('chat-portal');
  });
});

describe('deriveTransitions', () => {
  it('derives transitions from role pairs', () => {
    const zones = [
      { role: 'public' as const, archetypes: ['marketing-saas'], shell: 'top-nav-footer', features: ['pricing'], descriptions: ['Marketing'] },
      { role: 'gateway' as const, archetypes: ['auth-full'], shell: 'centered', features: ['auth', 'mfa'], descriptions: ['Auth'] },
      { role: 'primary' as const, archetypes: ['ai-chatbot'], shell: 'chat-portal', features: ['chat'], descriptions: ['Chat'] },
    ];

    const transitions = deriveTransitions(zones);

    const publicToGateway = transitions.find(t => t.from === 'public' && t.to === 'gateway');
    expect(publicToGateway).toBeDefined();
    expect(publicToGateway!.type).toBe('conversion');
    expect(publicToGateway!.trigger).toBe('authentication');

    const gatewayToApp = transitions.find(t => t.from === 'gateway' && t.to === 'app');
    expect(gatewayToApp).toBeDefined();
    expect(gatewayToApp!.type).toBe('gate-pass');
    expect(gatewayToApp!.trigger).toBe('authentication');

    const appToGateway = transitions.find(t => t.from === 'app' && t.to === 'gateway');
    expect(appToGateway).toBeDefined();
    expect(appToGateway!.type).toBe('gate-return');
  });

  it('derives payment trigger from gateway features', () => {
    const zones = [
      { role: 'gateway' as const, archetypes: ['paywall'], shell: 'centered', features: ['payment', 'subscription'], descriptions: ['Payment'] },
      { role: 'primary' as const, archetypes: ['app'], shell: 'sidebar-main', features: [], descriptions: ['App'] },
    ];

    const transitions = deriveTransitions(zones);

    const gatewayToApp = transitions.find(t => t.from === 'gateway' && t.to === 'app');
    expect(gatewayToApp!.trigger).toBe('payment');
  });

  it('returns empty transitions when only one zone', () => {
    const zones = [
      { role: 'primary' as const, archetypes: ['dashboard'], shell: 'sidebar-main', features: [], descriptions: ['Dashboard'] },
    ];

    const transitions = deriveTransitions(zones);
    expect(transitions).toEqual([]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm --filter decantr vitest run test/topology.test.ts
```

Expected: FAIL — `deriveZones` and `deriveTransitions` not exported from scaffold.js.

- [ ] **Step 3: Implement deriveZones and deriveTransitions**

In `packages/cli/src/scaffold.ts`, add after the `composeArchetypes` function (around line 152):

```ts
// ── Topology Derivation ──

export interface ZoneInput {
  archetypeId: string;
  role: ArchetypeRole;
  shell: string;
  features: string[];
  description: string;
}

export interface ComposedZone {
  role: ArchetypeRole;
  archetypes: string[];
  shell: string;
  features: string[];
  descriptions: string[];
}

export interface ZoneTransition {
  from: string;
  to: string;
  type: string;
  trigger: string;
}

const ZONE_ORDER: ArchetypeRole[] = ['public', 'gateway', 'primary', 'auxiliary'];

export function deriveZones(inputs: ZoneInput[]): ComposedZone[] {
  const zoneMap = new Map<ArchetypeRole, ComposedZone>();

  for (const input of inputs) {
    const existing = zoneMap.get(input.role);
    if (existing) {
      existing.archetypes.push(input.archetypeId);
      existing.features.push(...input.features);
      existing.descriptions.push(input.description);
    } else {
      zoneMap.set(input.role, {
        role: input.role,
        archetypes: [input.archetypeId],
        shell: input.shell,
        features: [...input.features],
        descriptions: [input.description],
      });
    }
  }

  // Deduplicate features per zone
  for (const zone of zoneMap.values()) {
    zone.features = [...new Set(zone.features)];
  }

  // Return in canonical order
  return ZONE_ORDER
    .filter(role => zoneMap.has(role))
    .map(role => zoneMap.get(role)!);
}

const GATEWAY_TRIGGER_MAP: Record<string, string> = {
  auth: 'authentication',
  login: 'authentication',
  mfa: 'authentication',
  payment: 'payment',
  subscription: 'payment',
  checkout: 'payment',
  onboarding: 'onboarding',
  'setup-wizard': 'onboarding',
  welcome: 'onboarding',
  invite: 'invitation',
  'access-code': 'invitation',
};

function resolveGatewayTrigger(features: string[]): string {
  for (const feature of features) {
    const trigger = GATEWAY_TRIGGER_MAP[feature];
    if (trigger) return trigger;
  }
  return 'authentication'; // default
}

export function deriveTransitions(zones: ComposedZone[]): ZoneTransition[] {
  const transitions: ZoneTransition[] = [];
  const roles = new Set(zones.map(z => z.role));
  const gateway = zones.find(z => z.role === 'gateway');
  const gatewayTrigger = gateway ? resolveGatewayTrigger(gateway.features) : 'authentication';

  // App = primary + auxiliary (they share a zone in navigation terms)
  const hasApp = roles.has('primary') || roles.has('auxiliary');
  const hasGateway = roles.has('gateway');
  const hasPublic = roles.has('public');

  if (hasPublic && hasGateway) {
    transitions.push({ from: 'public', to: 'gateway', type: 'conversion', trigger: gatewayTrigger });
  }
  if (hasPublic && hasApp && !hasGateway) {
    transitions.push({ from: 'public', to: 'app', type: 'conversion', trigger: 'navigation' });
  }
  if (hasGateway && hasApp) {
    transitions.push({ from: 'gateway', to: 'app', type: 'gate-pass', trigger: gatewayTrigger });
    transitions.push({ from: 'app', to: 'gateway', type: 'gate-return', trigger: gatewayTrigger });
  }
  if (hasApp && hasPublic) {
    transitions.push({ from: 'app', to: 'public', type: 'navigation', trigger: 'external' });
  }

  return transitions;
}
```

Add the import at the top of scaffold.ts:

```ts
import type { ArchetypeRole } from '@decantr/registry';
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm --filter @decantr/registry run build && pnpm --filter decantr vitest run test/topology.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Add zone tests to compose.test.ts**

Append to `packages/cli/test/compose.test.ts`:

```ts
describe('composeArchetypes — zone awareness', () => {
  it('includes archetype role in composed output when present', () => {
    const chatbot = makeArchetype({
      id: 'ai-chatbot',
      role: 'primary',
      pages: [
        { id: 'chat', shell: 'chat-portal', default_layout: ['messages', 'input'] },
      ],
      features: ['chat'],
    });

    const auth = makeArchetype({
      id: 'auth-full',
      role: 'gateway',
      pages: [
        { id: 'login', shell: 'centered', default_layout: ['form'] },
      ],
      features: ['auth'],
    });

    const result = composeArchetypes(
      ['ai-chatbot', { archetype: 'auth-full', prefix: 'auth-full' }],
      new Map([['ai-chatbot', chatbot], ['auth-full', auth]]),
    );

    expect(result.pages).toHaveLength(2);
    expect(result.features).toContain('chat');
    expect(result.features).toContain('auth');
    // zones are derived separately — composeArchetypes still returns pages/features/defaultShell
  });
});
```

Note: `ArchetypeData` interface needs to accept an optional `role` field. In `packages/cli/src/scaffold.ts`, update the `ArchetypeData` interface to include:

```ts
export interface ArchetypeData {
  id: string;
  role?: ArchetypeRole;
  description?: string;
  pages?: Array<{ id: string; shell: string; default_layout: LayoutItem[] }>;
  features?: string[];
}
```

- [ ] **Step 6: Run all CLI tests**

```bash
pnpm --filter decantr vitest run
```

Expected: All tests pass.

- [ ] **Step 7: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/test/topology.test.ts packages/cli/test/compose.test.ts
git commit -m "feat(cli): add zone and transition derivation for composition topology"
```

---

## Task 3: Generate Topology Section in DECANTR.md

**Files:**
- Modify: `packages/cli/src/scaffold.ts`
- Modify: `packages/cli/src/templates/DECANTR.md.template`

- [ ] **Step 1: Add generateTopologySection function**

In `packages/cli/src/scaffold.ts`, add after `deriveTransitions`:

```ts
export interface TopologyData {
  intent: string;
  zones: ComposedZone[];
  transitions: ZoneTransition[];
  entryPoints: {
    anonymous: string;
    authenticated: string;
  };
}

const ZONE_LABELS: Record<ArchetypeRole, string> = {
  public: 'Public',
  gateway: 'Gateway',
  primary: 'App',
  auxiliary: 'App',
};

const TRANSITION_DESCRIPTIONS: Record<string, string> = {
  conversion: 'CTAs lead to',
  'gate-pass': 'success enters',
  'gate-return': 'returns to',
  navigation: 'links back to',
};

export function generateTopologySection(data: TopologyData, personality: string[]): string {
  const lines: string[] = [];

  lines.push('## Composition Topology');
  lines.push('');
  lines.push(`**Intent:** ${data.intent}`);
  lines.push('');
  lines.push('### Zones');
  lines.push('');

  for (const zone of data.zones) {
    const label = ZONE_LABELS[zone.role] || zone.role;
    const isPrimaryOrAux = zone.role === 'primary' || zone.role === 'auxiliary';

    // Merge primary and auxiliary into "App" zone label
    lines.push(`**${label}** — ${zone.shell} shell`);
    lines.push(`  Archetypes: ${zone.archetypes.join(', ')}`);
    lines.push(`  Purpose: ${zone.descriptions.join(' ')}`);

    if (personality.length > 0) {
      lines.push(`  Tone: ${personality.join(', ')}`);
    }

    if (zone.features.length > 0) {
      lines.push(`  Features: ${zone.features.join(', ')}`);
    }

    lines.push('');
  }

  if (data.transitions.length > 0) {
    lines.push('### Zone Transitions');
    lines.push('');

    for (const t of data.transitions) {
      const fromLabel = t.from.charAt(0).toUpperCase() + t.from.slice(1);
      const toLabel = t.to.charAt(0).toUpperCase() + t.to.slice(1);
      const desc = TRANSITION_DESCRIPTIONS[t.type] || t.type;
      lines.push(`  ${fromLabel} → ${toLabel}: ${t.type} (${t.trigger} ${desc} ${toLabel.toLowerCase()})`);
    }

    lines.push('');
  }

  lines.push('### Default Entry Points');
  lines.push('');
  lines.push(`  Anonymous users enter: ${data.entryPoints.anonymous}`);
  lines.push(`  Authenticated users enter: ${data.entryPoints.authenticated}`);
  lines.push(`  Auth redirect target: ${data.entryPoints.authenticated}`);
  lines.push('');

  return lines.join('\n');
}
```

- [ ] **Step 2: Add placeholder to DECANTR.md template**

In `packages/cli/src/templates/DECANTR.md.template`, add after the "Blueprint" section (after the structure table) and before the "Guard Rules" section. Find the `---` separator before "## Guard Rules" and insert:

```
{{COMPOSITION_TOPOLOGY}}

---
```

- [ ] **Step 3: Wire topology into the scaffold pipeline**

In `packages/cli/src/scaffold.ts`, update the `scaffoldProject` function to:

1. After `composeArchetypes()` returns, collect zone inputs from the archetype data
2. Call `deriveZones()` and `deriveTransitions()`
3. Compute entry points (first public route, first primary-archetype route)
4. Call `generateTopologySection()` to produce the markdown
5. Pass it to `renderTemplate()` as `{{COMPOSITION_TOPOLOGY}}`

The specific insertion point in `scaffoldProject` depends on where archetype data is available. Read the function to identify the right location — it's after the `composeArchetypes` call and before `generateDecantrMd`.

If no blueprint is selected (default init), set `{{COMPOSITION_TOPOLOGY}}` to empty string so the section is omitted.

- [ ] **Step 4: Write a test for generateTopologySection**

Append to `packages/cli/test/topology.test.ts`:

```ts
import { generateTopologySection } from '../src/scaffold.js';
import type { TopologyData } from '../src/scaffold.js';

describe('generateTopologySection', () => {
  it('generates markdown with zones, transitions, and entry points', () => {
    const data: TopologyData = {
      intent: 'AI chatbot platform for developers',
      zones: [
        { role: 'public', archetypes: ['marketing-saas'], shell: 'top-nav-footer', features: ['pricing'], descriptions: ['SaaS marketing landing page.'] },
        { role: 'gateway', archetypes: ['auth-full'], shell: 'centered', features: ['auth', 'mfa'], descriptions: ['Authentication flow.'] },
        { role: 'primary', archetypes: ['ai-chatbot'], shell: 'chat-portal', features: ['chat'], descriptions: ['AI chatbot interface.'] },
      ],
      transitions: [
        { from: 'public', to: 'gateway', type: 'conversion', trigger: 'authentication' },
        { from: 'gateway', to: 'app', type: 'gate-pass', trigger: 'authentication' },
      ],
      entryPoints: { anonymous: '/', authenticated: '/chat' },
    };

    const result = generateTopologySection(data, ['professional']);

    expect(result).toContain('## Composition Topology');
    expect(result).toContain('**Intent:** AI chatbot platform for developers');
    expect(result).toContain('**Public** — top-nav-footer shell');
    expect(result).toContain('**Gateway** — centered shell');
    expect(result).toContain('**App** — chat-portal shell');
    expect(result).toContain('### Zone Transitions');
    expect(result).toContain('Public → Gateway');
    expect(result).toContain('Gateway → App');
    expect(result).toContain('Anonymous users enter: /');
    expect(result).toContain('Authenticated users enter: /chat');
    expect(result).toContain('Tone: professional');
  });

  it('omits transitions section when no transitions', () => {
    const data: TopologyData = {
      intent: 'Simple app',
      zones: [
        { role: 'primary', archetypes: ['dashboard'], shell: 'sidebar-main', features: [], descriptions: ['Dashboard.'] },
      ],
      transitions: [],
      entryPoints: { anonymous: '/', authenticated: '/' },
    };

    const result = generateTopologySection(data, []);

    expect(result).toContain('## Composition Topology');
    expect(result).not.toContain('### Zone Transitions');
  });
});
```

- [ ] **Step 5: Run tests**

```bash
pnpm --filter decantr vitest run test/topology.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/scaffold.ts packages/cli/src/templates/DECANTR.md.template packages/cli/test/topology.test.ts
git commit -m "feat(cli): generate Composition Topology section in DECANTR.md"
```

---

## Task 4: Wire Topology Through cmdInit

**Files:**
- Modify: `packages/cli/src/index.ts`

- [ ] **Step 1: Collect zone inputs after archetype resolution**

In `packages/cli/src/index.ts`, in the `cmdInit` function, after the blueprint composition block (around line 590 where `archetypeData` is built), add zone input collection:

```ts
// After archetypeData is populated (either from blueprint compose or direct archetype)

// Collect zone inputs for topology derivation
const zoneInputs: ZoneInput[] = [];

if (options.blueprint && blueprintResult) {
  const rawBlueprint = blueprintResult.data as Record<string, unknown>;
  const blueprint = (rawBlueprint.data ?? rawBlueprint) as {
    compose?: ComposeEntry[];
    // ... existing fields
  };

  if (blueprint.compose) {
    for (const entry of blueprint.compose) {
      const archetypeId = typeof entry === 'string' ? entry : entry.archetype;
      const explicitRole = typeof entry === 'object' ? entry.role : undefined;
      const raw = archetypeResults.get(archetypeId);
      const archData = raw?.data ?? raw;

      if (archData) {
        zoneInputs.push({
          archetypeId,
          role: explicitRole || (archData as any).role || 'auxiliary',
          shell: (archData as any).pages?.[0]?.shell || options.shell || 'sidebar-main',
          features: (archData as any).features || [],
          description: (archData as any).description || '',
        });
      }
    }
  }
}
```

Note: `archetypeResults` needs to be available at this scope — it's the map built from the parallel fetch at line 570. Store it in a variable accessible to both the composition block and the zone input collection.

- [ ] **Step 2: Derive topology and pass to scaffold**

After collecting zoneInputs:

```ts
const zones = zoneInputs.length > 0 ? deriveZones(zoneInputs) : [];
const transitions = zones.length > 1 ? deriveTransitions(zones) : [];

// Compute entry points
const publicPages = archetypeData?.pages?.filter(p =>
  zoneInputs.find(z => z.role === 'public' && z.archetypeId === options.archetype)
) || [];
const primaryPages = archetypeData?.pages?.filter(p => !p.shell_override || p.shell_override === archetypeData?.pages?.[0]?.shell) || [];

const topologyData: TopologyData | undefined = zones.length > 0 ? {
  intent: `${(archetypeData as any)?.description || options.blueprint || 'Application'}`,
  zones,
  transitions,
  entryPoints: {
    anonymous: '/',
    authenticated: `/${primaryPages[0]?.id || 'home'}`,
  },
} : undefined;
```

- [ ] **Step 3: Pass topologyData to scaffoldProject**

Update the `scaffoldProject` call to include topology. The `scaffoldProject` function signature needs a new optional parameter for topology markdown:

In `scaffold.ts`, update the function signature to accept `topologyMarkdown?: string` and use it when rendering the template:

```ts
// In the renderTemplate call for DECANTR.md:
'{{COMPOSITION_TOPOLOGY}}': topologyMarkdown || '',
```

Back in `index.ts`, generate the markdown and pass it:

```ts
const topologyMarkdown = topologyData
  ? generateTopologySection(topologyData, options.personality || [])
  : '';
```

Add the import at the top of index.ts:

```ts
import { deriveZones, deriveTransitions, generateTopologySection } from './scaffold.js';
import type { ZoneInput, TopologyData } from './scaffold.js';
```

- [ ] **Step 4: Build and test with carbon-ai-portal**

```bash
pnpm build
cd /tmp && mkdir topo-test && cd topo-test
node /path/to/packages/cli/dist/bin.js init --blueprint=carbon-ai-portal --existing --yes
grep -A 20 "Composition Topology" DECANTR.md
```

Expected: The DECANTR.md contains a Composition Topology section with Public, Gateway, and App zones.

Note: This test depends on archetypes having the `role` field (Task 6). If running before Task 6, the topology will use the fallback role ('auxiliary') for all archetypes. Full validation happens after Task 6.

- [ ] **Step 5: Run all tests**

```bash
pnpm test
```

Expected: All existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add packages/cli/src/index.ts packages/cli/src/scaffold.ts
git commit -m "feat(cli): wire topology derivation through cmdInit pipeline"
```

---

## Task 5: Enrich MCP Server Blueprint Response

**Files:**
- Modify: `packages/mcp-server/src/tools.ts`

- [ ] **Step 1: Find the decantr_resolve_blueprint tool handler**

```bash
grep -n "resolve_blueprint\|decantr_resolve_blueprint" packages/mcp-server/src/tools.ts
```

- [ ] **Step 2: Add topology to the response**

In the handler for `decantr_resolve_blueprint`, after the blueprint data is resolved, add zone derivation:

```ts
// After blueprint composition is resolved
import { deriveZones, deriveTransitions } from './scaffold.js';

// Collect zone inputs from composed archetypes
const zoneInputs = composedArchetypes.map(arch => ({
  archetypeId: arch.id,
  role: arch.role || 'auxiliary',
  shell: arch.pages?.[0]?.shell || 'sidebar-main',
  features: arch.features || [],
  description: arch.description || '',
}));

const zones = deriveZones(zoneInputs);
const transitions = deriveTransitions(zones);

// Add to response
result.topology = {
  zones: zones.map(z => ({
    role: z.role,
    archetypes: z.archetypes,
    shell: z.shell,
    features: z.features,
    purpose: z.descriptions.join(' '),
  })),
  transitions,
  entryPoints: {
    anonymous: '/',
    authenticated: `/${primaryPage?.id || 'home'}`,
  },
};
```

Note: The exact implementation depends on how the MCP tool handler is structured. Read the handler to understand the data flow before modifying. The zone derivation functions are imported from the CLI's scaffold module — ensure the MCP server can import from there, or move the topology functions to the registry package if needed for cleaner dependency flow.

- [ ] **Step 3: Build and verify**

```bash
pnpm --filter @decantr/mcp-server run build
```

Expected: Clean build.

- [ ] **Step 4: Run MCP tests**

```bash
pnpm --filter @decantr/mcp-server vitest run
```

Expected: Existing tests pass. New topology fields are additive — they shouldn't break existing assertions.

- [ ] **Step 5: Commit**

```bash
git add packages/mcp-server/src/tools.ts
git commit -m "feat(mcp): add topology to decantr_resolve_blueprint response"
```

---

## Task 6: Add role Field to All 52 Archetypes (decantr-content)

**Files:**
- Modify: all 52 files in `decantr-content/archetypes/`
- Modify: `decantr-content/validate.js`

This task is in the **decantr-content** repo at `/Users/davidaimi/projects/decantr-content`.

- [ ] **Step 1: Update validate.js to check for role on archetypes**

```js
// In the validation loop, after checking id/slug, add:
if (type === 'archetypes') {
  const validRoles = ['primary', 'gateway', 'public', 'auxiliary'];
  if (!content.role || !validRoles.includes(content.role)) {
    console.error(`  FAIL ${type}/${file}: missing or invalid role (must be one of: ${validRoles.join(', ')})`);
    errors++;
  }
}
```

- [ ] **Step 2: Run validation to see all 52 failures**

```bash
cd /Users/davidaimi/projects/decantr-content && node validate.js
```

Expected: 52 archetype failures for missing `role`.

- [ ] **Step 3: Add role to all archetypes**

Add the `"role"` field after the `"id"` field in each archetype JSON. Use this mapping:

**primary** (19):
```
ai-chatbot, cloud-infrastructure, content-editor, content-site,
creator-dashboard, creator-content, creator-earnings, creator-subscribers,
creator-tiers, dashboard-core, document-editor, ecommerce,
game-catalog, owner-dashboard, portfolio, registry-browser,
terminal-home, user-dashboard, workspace-home
```

**gateway** (2):
```
auth-full, auth-flow
```

**public** (10):
```
marketing-saas, marketing-devtool, marketing-landing, marketing-creator,
marketing-realestate, marketing-productivity, cloud-marketing,
about-hybrid, contact, legal
```

**auxiliary** (21):
```
settings, settings-full, billing, billing-portal, notifications,
team-management, workspace-settings, admin-moderation, config-editor,
log-viewer, metrics-monitor, maintenance-center, pm-financials,
property-manager, tenant-manager, tenant-payments, tenant-portal,
fan-checkout, fan-library, fan-storefront, gaming-community
```

For each file, add the role field as the third field (after `$schema` and `id`):

```json
{
  "$schema": "https://decantr.ai/schemas/archetype.v2.json",
  "id": "ai-chatbot",
  "role": "primary",
  ...
}
```

- [ ] **Step 4: Run validation**

```bash
node validate.js
```

Expected: 0 errors. All 52 archetypes have valid roles.

- [ ] **Step 5: Commit**

```bash
git add archetypes/ validate.js
git commit -m "feat: add role field to all 52 archetypes for composition topology"
```

- [ ] **Step 6: Push to trigger publish pipeline**

```bash
git push origin main
```

The GitHub Action validates + syncs all content to the registry API. The role field is stored in each archetype's `data` JSON column in Supabase.

---

## Task 7: End-to-End Validation

**Files:** No new files — validation only.

- [ ] **Step 1: Build all packages**

```bash
cd /Users/davidaimi/projects/decantr-monorepo
pnpm build
```

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```

Expected: All tests pass (512+ existing + new topology tests).

- [ ] **Step 3: Test with carbon-ai-portal blueprint**

```bash
cd /tmp && rm -rf topo-e2e && mkdir topo-e2e && cd topo-e2e
node /Users/davidaimi/projects/decantr-monorepo/packages/cli/dist/bin.js sync
node /Users/davidaimi/projects/decantr-monorepo/packages/cli/dist/bin.js init --blueprint=carbon-ai-portal --existing --yes
```

- [ ] **Step 4: Verify Composition Topology in DECANTR.md**

```bash
grep -A 30 "## Composition Topology" DECANTR.md
```

Expected output should contain:
- `**Intent:**` with archetype description
- `**Public** — top-nav-footer shell` with marketing/about/contact/legal archetypes
- `**Gateway** — centered shell` with auth-full archetype
- `**App** — chat-portal shell` with ai-chatbot + settings-full archetypes
- Zone transitions: Public → Gateway (conversion), Gateway → App (authentication)
- Entry points: anonymous `/`, authenticated `/chat`

- [ ] **Step 5: Test with a simple blueprint (no gateway)**

```bash
cd /tmp && rm -rf topo-simple && mkdir topo-simple && cd topo-simple
node /Users/davidaimi/projects/decantr-monorepo/packages/cli/dist/bin.js init --blueprint=portfolio --existing --yes
grep -A 15 "## Composition Topology" DECANTR.md
```

Expected: Only a Primary zone, no Gateway, no transitions. Simpler topology for simpler blueprints.

- [ ] **Step 6: Re-run showcase init with topology**

```bash
cd /Users/davidaimi/projects/decantr-monorepo/apps/showcase/carbon-ai-portal
rm decantr.essence.json DECANTR.md
node ../../../packages/cli/dist/bin.js init --blueprint=carbon-ai-portal --existing --yes
grep -A 30 "## Composition Topology" DECANTR.md
```

Expected: The showcase's DECANTR.md now has the Composition Topology section. This validates the end-to-end flow from content repo → API → CLI → generated narrative.

- [ ] **Step 7: Commit updated showcase**

```bash
git add apps/showcase/carbon-ai-portal/decantr.essence.json apps/showcase/carbon-ai-portal/DECANTR.md apps/showcase/carbon-ai-portal/.decantr/
git commit -m "feat(showcase): re-init carbon-ai-portal with composition topology"
```
