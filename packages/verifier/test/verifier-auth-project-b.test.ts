import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditBuiltDist, auditProject } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

describe('verifier auth project evidence B', () => {
  it('flags auth redirects that trust browser-global boolean-boxed repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => new globalThis.Boolean(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured browser-global boolean-boxed repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { Boolean: BooleanCtor } = globalThis;
            return (key) => BooleanCtor(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust direct browser-global boolean repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => Boolean(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound browser-global boolean repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Boolean.bind(globalThis);
            return (key) => readRedirectValue(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based browser-global boolean repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Boolean;
            return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.BigInt.bind(globalThis);
            return (key) => readRedirectValue(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.BigInt;
            return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { BigInt: BigIntCtor } = globalThis;
            return (key) => BigIntCtor(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust direct browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => BigInt(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Symbol.bind(globalThis);
            return (key) => readRedirectValue(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { Symbol: SymbolCtor } = globalThis;
            return (key) => SymbolCtor(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust direct browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => Symbol(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust apply-based browser-global boolean repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Boolean;
            return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected browser-global boolean repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Boolean;
            return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.BigInt;
            return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Symbol;
            return (key) => readRedirectValue.call(globalThis, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust apply-based browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Symbol;
            return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust apply-based browser-global bigint repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.BigInt;
            return (key) => readRedirectValue.apply(globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected browser-global symbol repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const readRedirectValue = globalThis.Symbol;
            return (key) => Reflect.apply(readRedirectValue, globalThis, [params.getAll(key)[0]]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based JSON.parse repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => JSON.parse.call(JSON, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected JSON.parse repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const parseRedirect = JSON.parse;
            return (key) => {
              const parseArgs = [params.getAll(key)[0]];
              return Reflect.apply(parseRedirect, JSON, parseArgs);
            };
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured JSON.parse repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { parse } = JSON;
            return (key) => parse(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound JSON.stringify repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const stringifyRedirect = JSON.stringify.bind(JSON);
            return (key) => stringifyRedirect(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based JSON.stringify repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => JSON.stringify.call(JSON, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected JSON.stringify repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const stringifyRedirect = JSON.stringify;
            return (key) => {
              const stringifyArgs = [params.getAll(key)[0]];
              return Reflect.apply(stringifyRedirect, JSON, stringifyArgs);
            };
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured JSON.stringify repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { stringify } = JSON;
            return (key) => stringify(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound structuredClone repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const cloneRedirect = globalThis.structuredClone.bind(globalThis);
            return (key) => cloneRedirect(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapper-based structuredClone repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => globalThis.structuredClone.call(globalThis, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust reflected structuredClone repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const cloneRedirect = globalThis.structuredClone;
            return (key) => {
              const cloneArgs = [params.getAll(key)[0]];
              return Reflect.apply(cloneRedirect, globalThis, cloneArgs);
            };
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured structuredClone repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const { structuredClone: cloneRedirect } = globalThis;
            return (key) => cloneRedirect(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust base64-decoded repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => atob(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust Buffer-decoded repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => Buffer.from(params.getAll(key)[0], 'base64').toString('utf8');
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased Buffer.from repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const decodeRedirect = Buffer.from;
            return (key) => decodeRedirect(params.getAll(key)[0], 'base64').toString('utf8');
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust global-object Buffer.from repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => globalThis.Buffer.from(params.getAll(key)[0], 'base64').toString('utf8');
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust Buffer.from call wrappers over repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => Buffer.from.call(Buffer, params.getAll(key)[0], 'base64').toString('utf8');
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound Buffer.from repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const decodeRedirect = Buffer.from.bind(Buffer);
            return (key) => decodeRedirect(params.getAll(key)[0], 'base64').toString('utf8');
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust browser-global base64-decoded repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => window.atob(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound browser-global base64-decoded repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            const decodeRedirect = window.atob.bind(window);
            return (key) => decodeRedirect(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust browser-global base64 call wrappers over repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => window.atob.call(window, params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust legacy URI-decoded repeated-query returned helper closures during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => unescape(params.getAll(key)[0]);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next'));
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust returned helper closures over filtered repeated query params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => params.getAll(key).filter(Boolean)[0];
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust wrapped returned helper closures over filtered repeated query params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function createReadRedirect(params) {
            return (key) => params.getAll(key).filter(Boolean)[0];
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.call(null, 'next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust local function helper readers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          function readRedirect(searchParams, key) {
            return searchParams.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            return redirect(readRedirect(searchParams, 'next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust searchParams getter call wrappers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { get } = searchParams;
            return redirect(get.call(searchParams, 'next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust optional query property carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const query = Object.fromEntries(new URLSearchParams(window.location.search));
            return redirect(query?.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bracketed searchParams getter props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            return redirect(searchParams['get']('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust nested destructured searchParams props during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams: { next } }) {
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bracketed router push transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ router, searchParams }) {
            router['push'](searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased router push transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const { push } = useRouter();
            push(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust optional router push transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            router?.push(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust router push call transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            router.push.call(router, searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased router replace apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            const navigate = router.replace;
            navigate.apply(router, [searchParams.get('next') ?? '/dashboard']);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased router apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            const navigate = router.replace;
            const args = [searchParams.get('next') ?? '/dashboard'];
            navigate.apply(router, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust router Reflect.apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            Reflect.apply(router.replace, router, [searchParams.get('next') ?? '/dashboard']);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust router Reflect.apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            const args = [searchParams.get('next') ?? '/dashboard'];
            Reflect.apply(router.replace, router, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound router replace transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect({ searchParams }) {
            const router = useRouter();
            const navigate = router.replace.bind(router);
            navigate(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust history replaceState call transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            history.replaceState.call(history, {}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust history Reflect.apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const args = [{}, '', searchParams.get('next') ?? '/dashboard'];
            Reflect.apply(history.replaceState, history, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust location assign call transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            window.location.assign.call(window.location, searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust location Reflect.apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            Reflect.apply(window.location.assign, window.location, [searchParams.get('next') ?? '/dashboard']);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust window open apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            window.open.apply(window, [searchParams.get('next') ?? '/dashboard', '_self']);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust location Reflect.apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const args = [searchParams.get('next') ?? '/dashboard'];
            Reflect.apply(window.location.assign, window.location, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust window open Reflect.apply transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            Reflect.apply(window.open, window, [searchParams.get('next') ?? '/dashboard', '_self']);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust window open Reflect.apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const args = [searchParams.get('next') ?? '/dashboard', '_self'];
            Reflect.apply(window.open, window, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased history apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const updateHistory = history.replaceState;
            const args = [{}, '', searchParams.get('next') ?? '/dashboard'];
            updateHistory.apply(history, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased location apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const navigate = window.location.assign;
            const args = [searchParams.get('next') ?? '/dashboard'];
            navigate.apply(window.location, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased window open apply argument arrays during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const popup = window.open;
            const args = [searchParams.get('next') ?? '/dashboard', '_self'];
            popup.apply(window, args);
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust history replaceState transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const browserHistory = window.history;
            browserHistory.replaceState({}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased history replaceState transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const updateHistory = history.replaceState;
            updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured history pushState transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { pushState: updateHistory } = window.history;
            updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound history replaceState transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const updateHistory = history.replaceState.bind(history);
            updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured bound history pushState transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { pushState } = window.history;
            const updateHistory = pushState.bind(window.history);
            updateHistory({}, '', searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust window.open transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            window.open(searchParams.get('next') ?? '/dashboard', '_self');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased window.open transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const popup = window.open;
            popup(searchParams.get('next') ?? '/dashboard', '_self');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured window.open transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { open: popup } = window;
            popup(searchParams.get('next') ?? '/dashboard', '_self');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased location.assign transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const navigate = window.location.assign;
            navigate(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust optional location assign transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            window.location?.assign(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured location.replace transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { replace: navigate } = window.location;
            navigate(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust bound location.assign transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const navigate = window.location.assign.bind(window.location);
            navigate(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured bound location.replace transitions during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const { replace } = window.location;
            const navigate = replace.bind(window.location);
            navigate(searchParams.get('next') ?? '/dashboard');
            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased useSearchParams hook carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useSearchParams } from 'react-router-dom';

          export function LoginRedirect() {
            const params = useSearchParams();
            return redirect(params.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust tuple-destructured useSearchParams hook carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useSearchParams } from 'react-router-dom';

          export function LoginRedirect() {
            const [params] = useSearchParams();
            return redirect(params.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased useRouter hook query carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect() {
            const appRouter = useRouter();
            return redirect(appRouter.query.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust helper-wrapped query params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const next = decodeURIComponent(searchParams.get('next') ?? '/dashboard');
            return redirect(next);
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust repeated query params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            const next = searchParams.getAll('next')[0];
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased useLocation hook carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useLocation } from 'react-router-dom';

          export function LoginRedirect() {
            const routeLocation = useLocation();
            const next = new URLSearchParams(routeLocation.search).get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured useLocation hook search carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useLocation } from 'react-router-dom';

          export function LoginRedirect() {
            const { search } = useLocation();
            const next = new URLSearchParams(search).get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust cloned nextUrl carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const nextUrl = req.nextUrl.clone();
            return redirect(nextUrl.searchParams.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased cloned nextUrl searchParams during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const params = req.nextUrl.clone().searchParams;
            const next = params.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust nextUrl search-string carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const next = new URLSearchParams(req.nextUrl.search).get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust nextUrl href carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const nextUrl = req.nextUrl.clone();
            const next = new URL(nextUrl.href).searchParams.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust stringified nextUrl carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const next = new URL(req.nextUrl.toString()).searchParams.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust String-wrapped nextUrl carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const nextUrl = req.nextUrl.clone();
            const next = new URL(String(nextUrl)).searchParams.get('next');
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust Object.fromEntries query carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const query = Object.fromEntries(req.nextUrl.searchParams);
            return redirect(query.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust destructured Object.fromEntries query carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const { next } = Object.fromEntries(new URLSearchParams(window.location.search));
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased searchParams entries in Object.fromEntries during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const entries = new URLSearchParams(window.location.search).entries();
            const query = Object.fromEntries(entries);
            return redirect(query.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust Array.from wrapped entries in Object.fromEntries during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const entries = Array.from(new URLSearchParams(window.location.search).entries());
            const query = Object.fromEntries(entries);
            return redirect(query.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust spread wrapped searchParams iterables in Object.fromEntries during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const query = Object.fromEntries([...new URLSearchParams(window.location.search)]);
            return redirect(query.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust normalized location search carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const params = new URLSearchParams(window.location.search.slice(1));
            return redirect(params.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust normalized nextUrl search carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function middleware(req) {
            const params = new URLSearchParams(req.nextUrl.search.slice(1));
            return redirect(params.get('next') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust aliased destructured useRouter query carriers during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          import { useRouter } from 'next/router';

          export function LoginRedirect() {
            const { query: params } = useRouter();
            return redirect(params.next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust template-wrapped query aliases during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ router }) {
            const next = router.query.next;
            return redirect(\`\${next ?? '/dashboard'}\`);
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust template-wrapped searchParams props in JSX during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams: { next } }) {
            return <Link to={\`\${next ?? '/dashboard'}\`}>Continue</Link>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust snake-case search param keys during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ searchParams }) {
            return redirect(searchParams.get('return_to') ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust snake-case query aliases during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect({ router }) {
            const queryKey = 'redirect_to';
            return <Link to={{ pathname: router.query[queryKey] ?? '/dashboard' }}>Continue</Link>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth redirects that trust snake-case callback URL params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            const queryKey = 'callback_url';
            const next = new URLSearchParams(window.location.search).get(queryKey);
            return redirect(next ?? '/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-open-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth flows that redirect directly to external URLs during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginRedirect.tsx'),
        `
          export function LoginRedirect() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/continue');
            }

            return <button onClick={handleSubmit}>Sign in</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-external-redirect-risk'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags provider authorize URLs without state during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-state-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag provider authorize URLs when state is present during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-state-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags provider code-flow URLs without PKCE during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-pkce-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag provider code-flow URLs when PKCE is present during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=code&state=opaque123&code_challenge=pkce123&code_challenge_method=S256');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-pkce-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags provider id_token URLs without nonce during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=id_token&state=opaque123');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-nonce-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag provider id_token URLs when nonce is present during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginProvider.tsx'),
        `
          export function LoginProvider() {
            async function handleSubmit() {
              await auth.signIn();
              return redirect('https://accounts.example.com/oauth2/authorize?client_id=web&redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&response_type=id_token&state=opaque123&nonce=nonce123');
            }

            return <button onClick={handleSubmit}>Sign in with SSO</button>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-provider-nonce-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback flows that never scrub URL codes during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            return <p>Signing you in…</p>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-url-scrub-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback flows that never handle provider error returns during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            return <p>Signing you in…</p>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-error-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback flows when provider error returns are handled during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const providerError = searchParams.get('error');
            if (providerError) {
              return <p>Authentication failed. Please try again.</p>;
            }

            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-error-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback flows that read provider state without validating it during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const state = searchParams.get('state');
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            return <p data-state={state}>Signing you in…</p>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-state-validation-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback flows when provider state is validated during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const returnedState = searchParams.get('state');
            const expectedState = sessionStorage.getItem('oauth_state');
            if (!returnedState || returnedState !== expectedState) {
              return <p>Authentication failed. Please try again.</p>;
            }

            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-state-validation-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback flows that validate provider state but never clear stored state during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const returnedState = searchParams.get('state');
            const expectedState = sessionStorage.getItem('oauth_state');
            if (!returnedState || returnedState !== expectedState) {
              return <p>Authentication failed. Please try again.</p>;
            }

            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-state-teardown-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback flows when stored provider state is cleared during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const returnedState = searchParams.get('state');
            const expectedState = sessionStorage.getItem('oauth_state');
            if (!returnedState || returnedState !== expectedState) {
              sessionStorage.removeItem('oauth_state');
              return <p>Authentication failed. Please try again.</p>;
            }

            sessionStorage.removeItem('oauth_state');
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-state-teardown-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback failure handling that never routes back to sign-in during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const providerError = searchParams.get('error');
            if (providerError) {
              return <p>Authentication failed. Please try again.</p>;
            }

            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-entry-return-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback failure handling when it routes back to sign-in during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const providerError = searchParams.get('error');
            if (providerError) {
              return <a href="/login">Back to sign in</a>;
            }

            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-entry-return-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback flows that never surface success state or protected transition during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            return <p>Signing you in...</p>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-success-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback flows when they transition into a protected route during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-success-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback exchanges without explicit rejection handling during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-exchange-error-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback exchanges when rejection handling is explicit during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code).catch(() => {
                toast.error('Unable to sign you in.');
              });
            }

            history.replaceState({}, '', '/dashboard');
            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-exchange-error-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback exchange failures that never route back to sign-in during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code).catch(() => {
                toast.error('Unable to sign you in.');
              });
            }

            return <p>Still working…</p>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-entry-return-missing',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback exchange failures when they route back to sign-in during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code).catch(() => {
                history.replaceState({}, '', '/login');
              });
            }

            return <a href="/login">Back to sign in</a>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-callback-entry-return-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback flows when callback URLs are scrubbed during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const code = searchParams.get('code');
            if (code) {
              void auth.exchangeCodeForSession(code);
              history.replaceState({}, '', '/dashboard');
            }

            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-url-scrub-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth callback error returns that never scrub provider params during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const providerError = searchParams.get('error');
            if (providerError) {
              return <a href="/login">Back to sign in</a>;
            }

            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-url-scrub-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth callback error returns when provider params are scrubbed during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'callback', route: '/auth/callback', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback({ searchParams }) {
            const providerError = searchParams.get('error');
            if (providerError) {
              history.replaceState({}, '', '/login');
              return <a href="/login">Back to sign in</a>;
            }

            return null;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-callback-url-scrub-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag protected surfaces when session checks live in the same file', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form method="post">
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (!session) {
              return redirect('/login');
            }
            return <a href="/dashboard">Open dashboard</a>;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-protected-surface-auth-checks-missing',
        ),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags missing auth entry surfaces when auth exists but no gateway or credential surface is implemented', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-entry-surface-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth forms without submit controls during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'Login.tsx'),
        `
          export function Login() {
            return (
              <form method="post">
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="current-password" />
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-interaction-safety-issues-present',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth entry signals when the gateway surface includes a real credential form', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-entry-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth entry surfaces that never route into the protected app after success', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            async function handleSubmit(event) {
              event.preventDefault();
              await auth.signIn();
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth entry success redirects when an explicit success state is present', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            const [successMessage, setSuccessMessage] = useState('');

            async function handleSubmit(event) {
              event.preventDefault();
              await auth.signIn();
              setSuccessMessage('Account created');
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="current-password" />
                {successMessage ? <p role="status">{successMessage}</p> : null}
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags project auth surfaces when a declared recovery route is never linked from sign-in flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['hero'] },
                    { id: 'forgot-password', route: '/forgot-password', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-recovery-route-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag project auth recovery gaps when sign-in flows link to the declared recovery route', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['hero'] },
                    { id: 'forgot-password', route: '/forgot-password', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <a href="/forgot-password">Forgot password?</a>
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-recovery-route-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags project auth surfaces when a declared registration route is never linked from sign-in flows', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['hero'] },
                    { id: 'register', route: '/register', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-registration-route-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags project auth surfaces when registration or recovery flows never link back to a declared sign-in route', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['hero'] },
                    { id: 'register', route: '/register', layout: ['form'] },
                    { id: 'forgot-password', route: '/forgot-password', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'RegisterPage.tsx'),
        `
          export function RegisterPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="new-password" />
                <button type="submit">Create account</button>
              </form>
            );
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'ForgotPasswordPage.tsx'),
        `
          export function ForgotPasswordPage() {
            return (
              <form>
                <input type="email" autoComplete="email" />
                <button type="submit">Send reset link</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-signin-route-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth entry surfaces when success redirects into the protected app', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            async function handleSubmit(event) {
              event.preventDefault();
              await auth.signIn();
              return redirect('/dashboard');
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth session handling that does not expose a loading or pending state', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { data: session } = useSession();
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth loading signals when the same session-aware surface exposes a pending state', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth loading signals when callback surfaces show explicit pending copy during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'callback', route: '/auth/callback', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'AuthCallback.tsx'),
        `
          export function AuthCallback() {
            const { data: session } = useSession();
            if (!session) {
              return <p>Signing you in...</p>;
            }

            return redirect('/dashboard');
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-loading-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags auth flows that expose no obvious error or failure state', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            return (
              <form method="post">
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                <button type="submit">Sign in</button>
              </form>
            );
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-error-signals-missing'),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag auth error signals when auth flows expose failure handling', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['form'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'LoginPage.tsx'),
        `
          export function LoginPage() {
            const [formError, setFormError] = useState<string | null>(null);

            async function handleSubmit() {
              try {
                await signIn();
              } catch (error) {
                setFormError('Unable to sign in');
              }
            }

            return (
              <form method="post">
                <input type="email" autoComplete="email" />
                <input type="password" autoComplete="current-password" />
                {formError ? <p role="alert">{formError}</p> : null}
                <button type="submit" onClick={handleSubmit}>Sign in</button>
              </form>
            );
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'DashboardGate.tsx'),
        `
          export function DashboardGate() {
            const { status, data: session } = useSession();
            if (status === 'loading') {
              return <Spinner />;
            }
            if (status === 'error') {
              return <Alert>Session unavailable</Alert>;
            }
            if (!session) {
              return redirect('/login');
            }
            return <Dashboard />;
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-error-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags recovery flows that omit a visible success confirmation during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'forgot-password', route: '/forgot-password', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'ForgotPasswordPage.tsx'),
        `
          export function ForgotPasswordPage() {
            async function handleSubmit(event) {
              event.preventDefault();
              await requestPasswordReset();
              return redirect('/login');
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <button type="submit">Reset password</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-recovery-success-missing'),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag recovery success gaps when project auth flows show confirmation state', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'forgot-password', route: '/forgot-password', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'ForgotPasswordPage.tsx'),
        `
          export function ForgotPasswordPage() {
            const [successMessage, setSuccessMessage] = useState('');

            async function handleSubmit(event) {
              event.preventDefault();
              await requestPasswordReset();
              setSuccessMessage('Check your email');
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                {successMessage ? <p role="status">{successMessage}</p> : null}
                <button type="submit">Reset password</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-recovery-success-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('flags registration flows that show neither success state nor protected transition during project audit', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'register', route: '/register', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'RegisterPage.tsx'),
        `
          export function RegisterPage() {
            async function handleSubmit(event) {
              event.preventDefault();
              await createAccount();
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="new-password" />
                <button type="submit">Create account</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-registration-success-missing',
        ),
      ).toBe(true);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('does not flag registration success gaps when project auth flows navigate into the protected app', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'src', 'routes'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [
                    { id: 'login', route: '/login', layout: ['form'] },
                    { id: 'register', route: '/register', layout: ['form'] },
                  ],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'src', 'routes', 'RegisterPage.tsx'),
        `
          export function RegisterPage() {
            async function handleSubmit(event) {
              event.preventDefault();
              await createAccount();
              return redirect('/dashboard');
            }

            return (
              <form onSubmit={handleSubmit}>
                <input type="email" name="email" autoComplete="email" />
                <input type="password" name="password" autoComplete="new-password" />
                <button type="submit">Create account</button>
              </form>
            );
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some(
          (finding) => finding.id === 'source-auth-registration-success-missing',
        ),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-success-redirect-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('detects auth middleware and exit signals from root middleware and lib directories', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'lib'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'gateway',
                  role: 'gateway',
                  pages: [{ id: 'login', route: '/login', layout: ['hero'] }],
                },
                {
                  id: 'workspace',
                  role: 'primary',
                  pages: [{ id: 'dashboard', route: '/dashboard', layout: ['hero'] }],
                },
              ],
              features: ['auth'],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'middleware.ts'),
        `
          export function middleware(request: { auth?: { user?: unknown } }) {
            if (!request.auth?.user) {
              return redirect('/login');
            }
            return NextResponse.next();
          }
        `,
      );
      writeFileSync(
        join(projectRoot, 'lib', 'auth.ts'),
        `
          export async function logout() {
            await auth.signOut();
          }
        `,
      );

      const report = await auditProject(projectRoot);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-guard-signals-missing'),
      ).toBe(false);
      expect(
        report.findings.some((finding) => finding.id === 'source-auth-exit-signals-missing'),
      ).toBe(false);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('audits built dist directly with explicit route hints', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"><title>Showcase</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(join(projectRoot, 'dist', 'assets', 'app.js'), 'console.log("/dashboard");\n');

      const report = await auditBuiltDist(projectRoot, {
        routeHints: ['/', '/dashboard'],
      });

      expect(report.checked).toBe(true);
      expect(report.distPresent).toBe(true);
      expect(report.indexPresent).toBe(true);
      expect(report.routeHintsChecked).toEqual(['/', '/dashboard']);
      expect(report.passed).toBe(true);
      expect(report.routeHintsCoverageOk).toBe(true);
      expect(report.routeDocumentsCoverageOk).toBe(true);
      expect(report.routeDocumentsHardeningOk).toBe(false);
      expect(report.routeDocumentsHardenedCount).toBe(0);
      expect(report.fullRouteCoverageOk).toBe(true);
      expect(report.langOk).toBe(true);
      expect(report.viewportOk).toBe(true);
      expect(report.charsetOk).toBe(false);
      expect(report.cspSignalOk).toBe(false);
      expect(report.inlineScriptCount).toBe(0);
      expect(report.inlineEventHandlerCount).toBe(0);
      expect(report.externalScriptsWithoutIntegrityCount).toBe(0);
      expect(report.externalStylesheetsWithoutIntegrityCount).toBe(0);
      expect(report.externalMediaSourcesWithInsecureTransportCount).toBe(0);
      expect(report.externalBlankLinksWithoutRelCount).toBe(0);
      expect(report.externalIframesWithoutSandboxCount).toBe(0);
      expect(report.externalIframesWithInsecureTransportCount).toBe(0);
      expect(report.jsEvalSignalCount).toBe(0);
      expect(report.jsHtmlInjectionSignalCount).toBe(0);
      expect(report.jsInsecureTransportSignalCount).toBe(0);
      expect(report.jsSecretSignalCount).toBe(0);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports partial route document hardening when a reviewed route drops document metadata', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Showcase</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'dashboard'),
        '<!doctype html><html lang="en"><head><title>Dashboard</title></head><body><div id="root"></div></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'console.log("/"); console.log("/dashboard");\n',
      );

      const report = await auditBuiltDist(projectRoot, {
        routeHints: ['/', '/dashboard'],
      });

      expect(report.checked).toBe(true);
      expect(report.routeDocumentsCoverageOk).toBe(true);
      expect(report.routeDocumentsPassed).toBe(2);
      expect(report.routeDocumentsHardenedCount).toBe(1);
      expect(report.routeDocumentsHardeningOk).toBe(false);
      expect(report.failures).toContain('route-document-hardening-failed:/dashboard');
      expect(report.failures).toContain('route-documents-hardening-missing');
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });

  it('reports partial route document hardening during project audit when only some reviewed routes preserve document metadata', async () => {
    const projectRoot = createProjectRoot();
    try {
      mkdirSync(join(projectRoot, 'dist', 'assets'), { recursive: true });
      writeFileSync(
        join(projectRoot, 'decantr.essence.json'),
        JSON.stringify(
          {
            version: '4.0.0',
            dna: {
              theme: { id: 'luminarum', mode: 'dark', shape: 'rounded' },
              spacing: {
                base_unit: 4,
                scale: 'linear',
                density: 'comfortable',
                content_gap: '_gap4',
              },
              typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
              color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
              radius: { philosophy: 'rounded', base: 8 },
              elevation: { system: 'layered', max_levels: 3 },
              motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
              accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
              personality: ['professional'],
            },
            blueprint: {
              shell: 'sidebar-main',
              sections: [
                {
                  id: 'main',
                  role: 'primary',
                  pages: [
                    { id: 'home', route: '/', layout: ['hero'] },
                    { id: 'dashboard', route: '/dashboard', layout: ['hero'] },
                    { id: 'settings', route: '/settings', layout: ['hero'] },
                  ],
                },
              ],
              features: [],
            },
            meta: {
              archetype: 'marketing',
              target: 'react',
              platform: { type: 'spa', routing: 'pathname' },
              guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
            },
          },
          null,
          2,
        ),
      );
      writeFileSync(
        join(projectRoot, 'dist', 'index.html'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Showcase</title></head><body><div id="root"></div><script type="module" src="/assets/app.js"></script></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'dashboard'),
        '<!doctype html><html lang="en"><head><title>Dashboard</title></head><body><div id="root"></div></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'settings'),
        '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Settings</title></head><body><div id="root"></div></body></html>\n',
      );
      writeFileSync(
        join(projectRoot, 'dist', 'assets', 'app.js'),
        'console.log("/"); console.log("/dashboard"); console.log("/settings");\n',
      );

      const report = await auditProject(projectRoot);
      expect(report.runtimeAudit.routeDocumentsCoverageOk).toBe(true);
      expect(report.runtimeAudit.routeDocumentsHardenedCount).toBe(2);
      expect(
        report.findings.some(
          (finding) => finding.id === 'runtime-route-document-hardening-partial',
        ),
      ).toBe(true);
    } finally {
      await rm(projectRoot, { recursive: true, force: true });
    }
  });
});
