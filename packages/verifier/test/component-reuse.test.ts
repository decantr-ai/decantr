import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  auditComponentReuse,
  auditProject,
  auditStyleBridgeDrift,
  COMPONENT_REUSE_RULE_ID,
  RAW_CONTROL_REUSE_RULE_ID,
  STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID,
} from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-component-reuse-'));
}

function writeFile(projectRoot: string, relativePath: string, contents: string): string {
  const absolutePath = join(projectRoot, relativePath);
  mkdirSync(dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, contents);
  return absolutePath;
}

function validV4Essence(): Record<string, unknown> {
  return {
    version: '4.0.0',
    dna: {
      theme: { id: 'existing', mode: 'auto', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'system', heading_weight: 600, body_weight: 400 },
      color: { palette: 'existing', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'existing', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: false },
      personality: ['observed brownfield app'],
    },
    blueprint: {
      shell: 'observed-existing-shell',
      features: [],
      sections: [
        {
          id: 'app',
          role: 'primary',
          shell: 'observed-existing-shell',
          features: [],
          description: 'Existing app',
          pages: [{ id: 'home', route: '/', layout: ['existing-surface'] }],
        },
      ],
      routes: { '/': { section: 'app', page: 'home' } },
    },
    meta: {
      archetype: 'observed-brownfield',
      target: 'react',
      platform: { type: 'spa', routing: 'history' },
      guard: { mode: 'guided', dna_enforcement: 'warn', blueprint_enforcement: 'warn' },
    },
  };
}

describe('component reuse drift audit', () => {
  it('finds local primitive reimplementations when a reusable component exists', async () => {
    const projectRoot = createProjectRoot();
    try {
      const canonical = writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      const local = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'function Button() { return <button />; }\nexport function DashboardPage() { return <Button />; }\n',
      );

      const audit = auditComponentReuse(projectRoot, [canonical, local]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        name: 'Button',
        file: 'src/app/dashboard/page.tsx',
        canonicalFile: 'src/components/ui/Button.tsx',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag source files that import the reusable primitive instead', async () => {
    const projectRoot = createProjectRoot();
    try {
      const canonical = writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'import { Button } from "@/components/ui/Button";\nexport function DashboardPage() { return <Button />; }\n',
      );

      const audit = auditComponentReuse(projectRoot, [canonical, page]);

      expect(audit.findings).toHaveLength(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('finds raw JSX controls when a reusable primitive exists', async () => {
    const projectRoot = createProjectRoot();
    try {
      const canonical = writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <button type="button">Save</button>; }\n',
      );

      const audit = auditComponentReuse(projectRoot, [canonical, page]);

      expect(audit.rawControlFindings).toHaveLength(1);
      expect(audit.rawControlFindings[0]).toMatchObject({
        element: 'button',
        component: 'Button',
        file: 'src/app/dashboard/page.tsx',
        canonicalFile: 'src/components/ui/Button.tsx',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag hidden inputs or files already importing the reusable primitive', async () => {
    const projectRoot = createProjectRoot();
    try {
      const canonical = writeFile(
        projectRoot,
        'src/components/ui/Input.tsx',
        'export function Input() { return <input />; }\n',
      );
      const button = writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <input type="hidden" />; }\n',
      );
      const settings = writeFile(
        projectRoot,
        'src/app/settings/page.tsx',
        'import { Button } from "@/components/ui/Button";\nexport function SettingsPage() { return <button type="button">Save</button>; }\n',
      );

      const audit = auditComponentReuse(projectRoot, [canonical, button, page, settings]);

      expect(audit.rawControlFindings).toHaveLength(0);
      expect(audit.imports).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            file: 'src/app/settings/page.tsx',
            source: '@/components/ui/Button',
            imported: ['Button'],
            localNames: ['Button'],
          }),
        ]),
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('emits structured verifier findings for component reuse drift', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'function Button() { return <button />; }\nexport function DashboardPage() { return <Button />; }\n',
      );

      const report = await auditProject(projectRoot);
      const finding = report.findings.find((entry) => entry.id === COMPONENT_REUSE_RULE_ID);

      expect(finding).toMatchObject({
        code: 'COMP001',
        category: 'Component Reuse',
        severity: 'warn',
        rule: COMPONENT_REUSE_RULE_ID,
        repair: {
          id: 'import-existing-component',
          payload: {
            component: 'Button',
            file: 'src/app/dashboard/page.tsx',
            canonical_file: 'src/components/ui/Button.tsx',
          },
        },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('emits structured verifier findings for raw control drift', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeFile(
        projectRoot,
        'src/components/ui/Button.tsx',
        'export function Button() { return <button />; }\n',
      );
      writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <button type="button">Save</button>; }\n',
      );

      const report = await auditProject(projectRoot);
      const finding = report.findings.find((entry) => entry.id === RAW_CONTROL_REUSE_RULE_ID);

      expect(finding).toMatchObject({
        code: 'COMP010',
        category: 'Component Reuse',
        severity: 'warn',
        rule: RAW_CONTROL_REUSE_RULE_ID,
        repair: {
          id: 'replace-raw-control-with-local-component',
          payload: {
            component: 'Button',
            element: 'button',
            file: 'src/app/dashboard/page.tsx',
            canonical_file: 'src/components/ui/Button.tsx',
          },
        },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});

describe('style bridge drift audit', () => {
  function writeAcceptedStyleBridge(projectRoot: string): void {
    writeFile(
      projectRoot,
      '.decantr/style-bridge.json',
      JSON.stringify(
        {
          version: 1,
          status: 'accepted',
          mappings: [
            {
              id: 'bridge:surface',
              label: 'Surface colors',
              tokenHints: ['--color-surface', '--color-foreground'],
              classHints: ['bg-background', 'text-foreground'],
            },
          ],
        },
        null,
        2,
      ),
    );
  }

  function writeAcceptedStyleBridgeV2(projectRoot: string): void {
    writeFile(
      projectRoot,
      '.decantr/style-bridge.json',
      JSON.stringify(
        {
          version: 2,
          status: 'accepted',
          mappings: [
            {
              id: 'bridge:surface',
              label: 'Surface colors',
              native: { kind: 'css-var', ref: '--color-surface' },
              essence: { kind: 'treatment', ref: 'surface' },
              confidence: 0.86,
              source: 'declared',
              property: 'background-color',
              tokenHints: ['--color-foreground'],
              classHints: ['bg-background', 'text-foreground'],
            },
          ],
        },
        null,
        2,
      ),
    );
  }

  it('finds arbitrary Tailwind values when a style bridge is accepted', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="bg-[#0f172a] text-foreground">Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        file: 'src/app/dashboard/page.tsx',
        value: 'bg-[#0f172a]',
        bridgeMappingIds: ['bridge:surface'],
        tokenHints: ['--color-surface', '--color-foreground'],
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('finds arbitrary Tailwind values inside common class helper calls', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'import { cn } from "@/lib/utils";\nexport function DashboardPage() { return <main className={cn("text-foreground", "bg-[#0f172a]")}>Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        file: 'src/app/dashboard/page.tsx',
        value: 'bg-[#0f172a]',
        className: 'bg-[#0f172a]',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('includes v2 mapping confidence and native refs in drift evidence', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridgeV2(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="bg-[#0f172a] text-foreground">Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        bridgeMappingIds: ['bridge:surface'],
        bridgeConfidence: 0.86,
        bridgeSources: ['declared'],
        tokenHints: ['--color-foreground', '--color-surface'],
      });
      expect(audit.findings[0]?.evidence).toEqual(
        expect.arrayContaining([
          'Accepted style bridge max confidence: 0.86',
          'Accepted style bridge mapping sources: declared',
        ]),
      );
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('keeps bracketed arbitrary-value colons intact when stripping Tailwind variants', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="hover:text-[color:var(--unknown)]">Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        value: 'hover:text-[color:var(--unknown)]',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('finds hardcoded inline color styles when a style bridge is accepted', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main style={{ backgroundColor: "#0f172a" }}>Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        file: 'src/app/dashboard/page.tsx',
        source: 'inline-style',
        property: 'backgroundColor',
        value: 'backgroundColor: #0f172a',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('allows inline values that reference accepted bridge token hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main style={{ backgroundColor: "var(--color-surface)" }}>Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('allows project CSS variable references even when they are not explicit token hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main style={{ color: "var(--foreground)" }}>Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('finds hardcoded stylesheet color values when a style bridge is accepted', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="dashboard-shell">Dashboard</main>; }\n',
      );
      writeFile(
        projectRoot,
        'src/app/dashboard/dashboard.module.css',
        '.shell { border: 1px solid #0f172a; background-color: var(--color-surface); }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, []);

      expect(audit.findings).toHaveLength(1);
      expect(audit.findings[0]).toMatchObject({
        file: 'src/app/dashboard/dashboard.module.css',
        source: 'stylesheet',
        property: 'border',
        value: 'border: 1px solid #0f172a',
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('allows stylesheet values that reference accepted bridge token hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      writeFile(
        projectRoot,
        'src/app/dashboard/dashboard.module.css',
        '.shell { background-color: var(--color-surface); color: var(--color-foreground); }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, []);

      expect(audit.findings).toHaveLength(0);
      expect(audit.filesChecked).toBe(1);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('allows stylesheet CSS variable references outside explicit token hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      writeFile(
        projectRoot,
        'src/app/dashboard/dashboard.module.css',
        '.shell { color: var(--foreground); border-color: var(--border); }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, []);

      expect(audit.findings).toHaveLength(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not treat stylesheet custom-property token definitions as drift', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeAcceptedStyleBridge(projectRoot);
      writeFile(
        projectRoot,
        'src/styles/tokens.css',
        ':root { --color-surface: #0f172a; --color-foreground: #f8fafc; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, []);

      expect(audit.findings).toHaveLength(0);
      expect(audit.filesChecked).toBe(1);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('ignores arbitrary values until the style bridge is accepted', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFile(
        projectRoot,
        '.decantr/style-bridge.json',
        JSON.stringify({ version: 1, status: 'proposal', mappings: [{ id: 'bridge:surface' }] }),
      );
      const page = writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="bg-[#0f172a]">Dashboard</main>; }\n',
      );

      const audit = auditStyleBridgeDrift(projectRoot, [page]);

      expect(audit.findings).toHaveLength(0);
      expect(audit.filesChecked).toBe(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('emits structured verifier findings for accepted style bridge drift', async () => {
    const projectRoot = createProjectRoot();
    try {
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(validV4Essence(), null, 2),
      );
      writeAcceptedStyleBridge(projectRoot);
      writeFile(
        projectRoot,
        'src/app/dashboard/page.tsx',
        'export function DashboardPage() { return <main className="bg-[#0f172a]">Dashboard</main>; }\n',
      );

      const report = await auditProject(projectRoot);
      const finding = report.findings.find(
        (entry) => entry.id === STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID,
      );

      expect(finding).toMatchObject({
        code: 'TOKEN010',
        category: 'Style Bridge',
        severity: 'warn',
        rule: STYLE_BRIDGE_ARBITRARY_VALUE_RULE_ID,
        repair: {
          id: 'replace-arbitrary-style-with-bridge-token',
          payload: {
            file: 'src/app/dashboard/page.tsx',
            source: 'className',
            value: 'bg-[#0f172a]',
            bridge_mappings: ['bridge:surface'],
            token_hints: ['--color-surface', '--color-foreground'],
          },
        },
      });
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
