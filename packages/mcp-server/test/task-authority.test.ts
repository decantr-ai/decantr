import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { callTool } from './tool-call.js';

const ORIGINAL_CWD = process.cwd();

afterEach(() => {
  process.chdir(ORIGINAL_CWD);
});

function writeJson(path: string, value: unknown): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf-8');
}

function writeEssence(root: string): void {
  writeJson(join(root, 'decantr.essence.json'), {
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
      personality: ['observed app'],
    },
    blueprint: {
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
  });
}

describe('MCP task authority integrity', () => {
  it('does not activate copied proposals or malformed final authority files', async () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-mcp-task-authority-'));
    try {
      process.chdir(root);
      writeJson(join(root, 'package.json'), {
        private: true,
        dependencies: { react: '^19.0.0' },
      });
      writeEssence(root);
      writeJson(join(root, '.decantr', 'project.json'), {
        initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'style-bridge' },
      });
      writeJson(join(root, '.decantr', 'local-patterns.json'), {
        version: 2,
        status: 'proposal',
        patterns: [{ id: 'copied-proposal', componentPaths: ['src/App.tsx'] }],
      });
      writeFileSync(join(root, '.decantr', 'rules.json'), '{ malformed rules json\n', 'utf-8');
      writeJson(join(root, '.decantr', 'style-bridge.json'), {
        version: 2,
        status: 'accepted',
        mappings: { malformed: true },
      });
      mkdirSync(join(root, '.decantr', 'context'), { recursive: true });
      writeFileSync(
        join(root, '.decantr', 'context', 'scaffold.md'),
        '# Brownfield scaffold context\n',
        'utf-8',
      );
      mkdirSync(join(root, 'src'), { recursive: true });
      writeFileSync(
        join(root, 'src', 'App.tsx'),
        'export default function App() { return <main>Home</main>; }\n',
        'utf-8',
      );

      const result = (await callTool('decantr_prepare_task_context', {
        route: '/',
        task: 'preserve existing source authority',
      })) as {
        authority: {
          lane: string;
          active_lane: string;
          active_authorities: string[];
          warnings: string[];
        };
        local_law: {
          patterns_path: string | null;
          rules_path: string | null;
          patterns: unknown[];
          rules: unknown[];
        };
        style_bridge: { path: string | null; mappings: unknown[] };
        loop: { readTargets: string[] };
        local_files: {
          local_patterns: string | null;
          local_rules: string | null;
          style_bridge: string | null;
        };
      };

      expect(result.authority).toMatchObject({
        lane: 'Brownfield contract-only',
        active_lane: 'production-source',
      });
      expect(result.authority.active_authorities).not.toContain('accepted local patterns/rules');
      expect(result.authority.active_authorities).not.toContain('accepted style bridge');
      expect(result.authority.warnings.join('\n')).toContain(
        'no parsed, valid, accepted style bridge',
      );
      expect(result.local_law).toMatchObject({
        patterns_path: null,
        rules_path: null,
        patterns: [],
        rules: [],
      });
      expect(result.style_bridge).toMatchObject({ path: null, mappings: [] });
      expect(result.loop.readTargets).not.toContain('.decantr/local-patterns.json');
      expect(result.loop.readTargets).not.toContain('.decantr/rules.json');
      expect(result.loop.readTargets).not.toContain('.decantr/style-bridge.json');
      expect(result.loop.readTargets).toContain('.decantr/context/scaffold.md');
      expect(result.local_files).toMatchObject({
        local_patterns: null,
        local_rules: null,
        style_bridge: null,
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('rejects missing or escaped manifest packs and falls back to narrative context', async () => {
    const workspaceRoot = mkdtempSync(join(tmpdir(), 'decantr-mcp-task-context-paths-'));
    const root = join(workspaceRoot, 'apps', 'web');
    try {
      mkdirSync(root, { recursive: true });
      process.chdir(workspaceRoot);
      writeJson(join(root, 'package.json'), {
        private: true,
        dependencies: { react: '^19.0.0' },
      });
      writeEssence(root);
      writeJson(join(root, '.decantr', 'project.json'), {
        initialized: { workflowMode: 'brownfield-attach', adoptionMode: 'contract-only' },
      });
      mkdirSync(join(root, 'src'), { recursive: true });
      writeFileSync(
        join(root, 'src', 'App.tsx'),
        'export default function App() { return <main>Home</main>; }\n',
        'utf-8',
      );
      writeFileSync(
        join(root, 'outside-pack.md'),
        '# Outside context\nDo not read this.\n',
        'utf-8',
      );
      mkdirSync(join(root, '.decantr', 'context'), { recursive: true });
      writeFileSync(
        join(root, '.decantr', 'context', 'scaffold.md'),
        '# Narrative scaffold\nUse host project conventions.\n',
        'utf-8',
      );
      writeFileSync(
        join(root, '.decantr', 'context', 'section-app.md'),
        '# Narrative app section\nPreserve the route shell.\n',
        'utf-8',
      );
      writeJson(join(root, '.decantr', 'context', 'scaffold-pack.json'), {
        data: { directives: ['safe scaffold json'] },
      });
      writeJson(join(root, '.decantr', 'context', 'section-app-pack.json'), {
        data: { directives: ['safe section json'] },
      });
      writeJson(join(root, '.decantr', 'context', 'page-home-pack.json'), {
        data: { directives: ['safe page json'] },
      });
      writeJson(join(root, '.decantr', 'context', 'pack-manifest.json'), {
        version: '1.0.0',
        generatedAt: '2026-07-16T00:00:00.000Z',
        scaffold: {
          id: 'scaffold',
          markdown: '../../outside-pack.md',
          json: 'scaffold-pack.json',
        },
        sections: [
          {
            id: 'app',
            markdown: '../../outside-pack.md',
            json: 'section-app-pack.json',
            pageIds: ['home'],
          },
        ],
        pages: [
          {
            id: 'home',
            markdown: 'missing-page-pack.md',
            json: 'page-home-pack.json',
            sectionId: 'app',
            sectionRole: 'primary',
          },
        ],
      });

      const task = (await callTool('decantr_prepare_task_context', {
        project_path: 'apps/web',
        route: '/',
        task: 'preserve narrative context',
      })) as {
        page_pack_excerpt: string | null;
        section_context: string | null;
        loop: { readTargets: string[] };
        local_files: {
          page_pack: string | null;
          section_pack: string | null;
          section_context: string | null;
        };
      };

      expect(task.page_pack_excerpt).toBeNull();
      expect(task.section_context).toContain('Narrative app section');
      expect(task.loop.readTargets).toContain('apps/web/.decantr/context/section-app.md');
      expect(task.loop.readTargets).toContain('apps/web/.decantr/context/scaffold.md');
      expect(task.loop.readTargets.join('\n')).not.toContain('missing-page-pack.md');
      expect(task.loop.readTargets.join('\n')).not.toContain('outside-pack.md');
      expect(task.local_files).toMatchObject({
        page_pack: null,
        section_pack: null,
        section_context: 'apps/web/.decantr/context/section-app.md',
      });

      const page = (await callTool('decantr_get_page_context', {
        project_path: 'apps/web',
        page_id: 'home',
      })) as {
        page_context: string | null;
        execution_pack: { markdown: string | null; json: unknown };
      };
      expect(page.page_context).toContain('Narrative app section');
      expect(page.page_context).not.toContain('Outside context');
      expect(page.execution_pack.markdown).toBeNull();

      const section = (await callTool('decantr_get_section_context', {
        project_path: 'apps/web',
        section_id: 'app',
      })) as { context: string | null };
      expect(section.context).toContain('Narrative app section');

      const scaffold = (await callTool('decantr_get_scaffold_context', {
        project_path: 'apps/web',
      })) as {
        scaffold_context: string | null;
        execution_pack: { markdown: string | null; json: unknown };
      };
      expect(scaffold.scaffold_context).toContain('Narrative scaffold');
      expect(scaffold.scaffold_context).not.toContain('Outside context');
      expect(scaffold.execution_pack.markdown).toBeNull();

      const selectedPack = (await callTool('decantr_get_execution_pack', {
        project_path: 'apps/web',
        pack_type: 'scaffold',
        format: 'both',
      })) as { markdown: string | null; json: unknown; source: string };
      expect(selectedPack.source).toBe('local');
      expect(selectedPack.markdown).toBeNull();
      expect(selectedPack.json).toEqual({ data: { directives: ['safe scaffold json'] } });
    } finally {
      rmSync(workspaceRoot, { recursive: true, force: true });
    }
  });

  it('uses an accepted host-owned style bridge for greenfield authority', async () => {
    const root = mkdtempSync(join(tmpdir(), 'decantr-mcp-greenfield-style-bridge-'));
    try {
      process.chdir(root);
      writeJson(join(root, 'package.json'), {
        private: true,
        dependencies: { react: '^19.0.0' },
      });
      writeEssence(root);
      writeJson(join(root, '.decantr', 'project.json'), {
        initialized: { workflowMode: 'greenfield-scaffold', adoptionMode: 'style-bridge' },
      });
      writeJson(join(root, '.decantr', 'style-bridge.json'), {
        version: 2,
        status: 'accepted',
        styling: { approach: 'host-css', themeModes: ['light', 'dark'] },
        mappings: [
          {
            id: 'surface-default',
            tokenHints: ['--surface'],
            classHints: ['surface-default'],
          },
        ],
      });
      mkdirSync(join(root, '.decantr', 'context'), { recursive: true });
      writeFileSync(
        join(root, '.decantr', 'context', 'scaffold.md'),
        '# Greenfield scaffold context\n',
        'utf-8',
      );
      mkdirSync(join(root, 'src'), { recursive: true });
      writeFileSync(
        join(root, 'src', 'App.tsx'),
        'export default function App() { return <main>Home</main>; }\n',
        'utf-8',
      );

      const result = (await callTool('decantr_prepare_task_context', {
        route: '/',
        task: 'implement the governed home surface',
      })) as {
        authority: {
          lane: string;
          active_lane: string;
          active_authorities: string[];
          source_authority: string;
          style_authority: string;
        };
        loop: { authority: { activeLane: string }; readTargets: string[] };
      };

      expect(result.authority).toMatchObject({
        lane: 'Greenfield host style bridge',
        active_lane: 'style-bridge',
      });
      expect(result.authority.active_authorities).toContain('accepted host-owned style bridge');
      expect(result.authority.active_authorities).not.toContain('existing source');
      expect(result.authority.source_authority).toContain('host-owned style bridge');
      expect(result.authority.style_authority).toContain('host styling runtime');
      expect(result.authority.style_authority).not.toContain('Decantr CSS');
      expect(result.loop.authority.activeLane).toBe('style-bridge');
      expect(result.loop.readTargets).toContain('.decantr/style-bridge.json');
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
