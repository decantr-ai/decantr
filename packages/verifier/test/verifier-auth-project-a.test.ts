import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { auditProject } from '../src/index.js';

function createProjectRoot(): string {
  return mkdtempSync(join(tmpdir(), 'decantr-verifier-'));
}

describe('verifier auth project evidence A', () => {
  it('flags auth redirects that trust bracketed aliased frame location href assignments during project audit', async () => {
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
            const frameLocation = parent['location'];
            const next = new URLSearchParams(frameLocation['search']).get('next');
            frameLocation['href'] = next ?? '/dashboard';
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

  it('flags auth redirects that trust bracketed location access through aliased browser bases during project audit', async () => {
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
            const browser = window;
            const next = new URLSearchParams(browser['location']['search']).get('next');
            browser['location']['assign'](next ?? '/dashboard');
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

  it('flags auth redirects that destructure URL searchParams carriers and alias query keys during project audit', async () => {
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
            const { searchParams: params } = new URL(window.location.href);
            const queryKey = 'next';
            const next = params.get(queryKey);
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

  it('flags auth redirects that destructure query redirect params during project audit', async () => {
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
            const query = router.query;
            const { next: redirectTo } = query;
            return redirect(redirectTo ?? '/dashboard');
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

  it('flags auth redirects that destructure query carriers during project audit', async () => {
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
            const { query: params } = router;
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

  it('flags auth redirects that bracket-read aliased query params during project audit', async () => {
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
            const query = router.query;
            const queryKey = 'next';
            const next = query[queryKey];
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

  it('flags auth redirects that pass aliased query params through route objects during project audit', async () => {
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
            const query = router.query;
            const queryKey = 'next';
            const next = query[queryKey];
            return navigate({ pathname: next ?? '/dashboard' });
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

  it('flags link-driven auth redirects that pass aliased query params through route objects during project audit', async () => {
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
            const query = router.query;
            const queryKey = 'next';
            const next = query[queryKey];
            return <Link to={{ pathname: next ?? '/dashboard' }}>Continue</Link>;
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

  it('flags server auth redirects that trust request URL search params during project audit', async () => {
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
          export async function GET(request) {
            const url = new URL(request.url);
            const next = url.searchParams.get('next');
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

  it('flags server auth redirects that trust req URL search params during project audit', async () => {
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
          export async function GET(req) {
            return redirect(new URL(req.url).searchParams.get('next') ?? '/dashboard');
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

  it('flags server auth redirects that trust req nextUrl search params during project audit', async () => {
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
          export async function GET(req) {
            return redirect(req.nextUrl.searchParams.get('next') ?? '/dashboard');
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

  it('flags server auth redirects that trust aliased req nextUrl search params during project audit', async () => {
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
          export async function GET(req) {
            const params = req.nextUrl.searchParams;
            const queryKey = 'next';
            return redirect(params.get(queryKey) ?? '/dashboard');
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

  it('flags server auth redirects that trust bracketed req nextUrl search-param getter calls during project audit', async () => {
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
          export async function GET(req) {
            return redirect(req['nextUrl']['searchParams']['get']('next') ?? '/dashboard');
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

  it('flags server auth redirects that trust req nextUrl aliases during project audit', async () => {
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
          export async function GET(req) {
            const nextUrl = req.nextUrl;
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

  it('flags server auth redirects that trust destructured req nextUrl aliases during project audit', async () => {
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
          export async function GET(req) {
            const { nextUrl } = req;
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

  it('flags server auth redirects that wrap query params in URL constructors during project audit', async () => {
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
          import { NextResponse } from 'next/server';

          export async function GET(req) {
            const next = req.nextUrl.searchParams.get('next');
            return NextResponse.redirect(new URL(next ?? '/dashboard', req.url));
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

  it('flags server auth redirects that wrap query params in URL constructors with aliased req urls during project audit', async () => {
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
          import { NextResponse } from 'next/server';

          export async function GET(req) {
            const requestUrl = req.url;
            const next = req.nextUrl.searchParams.get('next');
            return NextResponse.redirect(new URL(next ?? '/dashboard', requestUrl));
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

  it('flags auth redirects that trust direct searchParams props during project audit', async () => {
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
            return redirect(searchParams.next ?? '/dashboard');
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

  it('flags auth redirects that trust aliased indexed searchParams props during project audit', async () => {
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
          export function LoginRedirect(props) {
            const { searchParams: params } = props;
            const queryKey = 'next';
            return <Link to={{ pathname: params[queryKey] ?? '/dashboard' }}>Continue</Link>;
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

  it('flags auth redirects that trust parameter-aliased searchParams props during project audit', async () => {
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
          export function LoginRedirect({ searchParams: params }) {
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

  it('flags auth redirects that trust optional searchParams getter props during project audit', async () => {
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
            return redirect(searchParams?.get('next') ?? '/dashboard');
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

  it('flags auth redirects that trust bound searchParams getter helpers during project audit', async () => {
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
            const readRedirect = searchParams.get.bind(searchParams);
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

  it('flags auth redirects that trust local arrow helper readers during project audit', async () => {
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
            const readRedirect = (key) => searchParams.get(key);
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

  it('flags auth redirects that trust object helper methods during project audit', async () => {
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
            const helpers = {
              readRedirect(key) {
                return searchParams.get(key);
              },
            };

            return redirect(helpers.readRedirect('next') ?? '/dashboard');
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

  it('flags auth redirects that trust destructured object helper methods during project audit', async () => {
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
            const helpers = {
              readRedirect(key) {
                return searchParams.get(key);
              },
            };
            const { readRedirect } = helpers;

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

  it('flags auth redirects that trust nested object helper methods during project audit', async () => {
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
            const helpers = {
              redirect: {
                readRedirect(key) {
                  return searchParams.get(key);
                },
              },
            };

            return redirect(helpers.redirect.readRedirect('next') ?? '/dashboard');
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

  it('flags auth redirects that trust destructured nested helper objects during project audit', async () => {
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
            const helpers = {
              redirect: {
                readRedirect(key) {
                  return searchParams.get(key);
                },
              },
            };
            const { redirect: redirectHelpers } = helpers;

            return redirect(redirectHelpers.readRedirect('next') ?? '/dashboard');
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

  it('flags auth redirects that trust object helper factories during project audit', async () => {
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
          function createRedirectHelpers(searchParams) {
            return {
              readRedirect(key) {
                return searchParams.get(key);
              },
            };
          }

          export function LoginRedirect({ searchParams }) {
            const helpers = createRedirectHelpers(searchParams);
            return redirect(helpers.readRedirect('next') ?? '/dashboard');
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

  it('flags auth redirects that trust destructured helper-factory methods during project audit', async () => {
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
          function createRedirectHelpers(searchParams) {
            return {
              readRedirect(key) {
                return searchParams.get(key);
              },
            };
          }

          export function LoginRedirect({ searchParams }) {
            const { readRedirect } = createRedirectHelpers(searchParams);
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

  it('flags auth redirects that trust renamed helper-factory params during project audit', async () => {
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
          function createRedirectHelpers(params) {
            return {
              readRedirect(key) {
                return params.get(key);
              },
            };
          }

          export function LoginRedirect({ searchParams }) {
            const helpers = createRedirectHelpers(searchParams);
            return redirect(helpers.readRedirect('next') ?? '/dashboard');
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

  it('flags auth redirects that trust destructured renamed helper-factory params during project audit', async () => {
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
          function createRedirectHelpers(params) {
            return {
              readRedirect(key) {
                return params.get(key);
              },
            };
          }

          export function LoginRedirect({ searchParams }) {
            const { readRedirect } = createRedirectHelpers(searchParams);
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

  it('flags auth redirects that trust function helper factories with renamed params during project audit', async () => {
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
            return (key) => params.get(key);
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

  it('flags auth redirects that trust aliased function helper factories with renamed params during project audit', async () => {
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
            const getRedirectFromQuery = (key) => params.get(key);
            return getRedirectFromQuery;
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

  it('flags auth redirects that trust returned helper closures through call wrappers during project audit', async () => {
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
            return (key) => params.get(key);
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

  it('flags auth redirects that trust returned helper closures through apply wrappers during project audit', async () => {
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
            return (key) => params.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(readRedirect.apply(null, ['next']) ?? '/dashboard');
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

  it('flags auth redirects that trust returned helper closures through apply wrappers with aliased args during project audit', async () => {
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
            return (key) => params.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            const redirectArgs = ['next'];
            return redirect(readRedirect.apply(null, redirectArgs) ?? '/dashboard');
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

  it('flags auth redirects that trust returned helper closures through Reflect.apply wrappers during project audit', async () => {
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
            return (key) => params.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            return redirect(Reflect.apply(readRedirect, null, ['next']) ?? '/dashboard');
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

  it('flags auth redirects that trust returned helper closures through Reflect.apply wrappers with aliased args during project audit', async () => {
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
            return (key) => params.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams);
            const redirectArgs = ['next'];
            return redirect(Reflect.apply(readRedirect, null, redirectArgs) ?? '/dashboard');
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

  it('flags auth redirects that trust bound returned helper closures during project audit', async () => {
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
            return (key) => params.get(key);
          }

          export function LoginRedirect({ searchParams }) {
            const readRedirect = createReadRedirect(searchParams).bind(null);
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

  it('flags auth redirects that trust returned helper closures over repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key)[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key)[0];
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

  it('flags auth redirects that trust returned helper closures over repeated query params with at() during project audit', async () => {
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
            return (key) => params.getAll(key).at(0);
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with at() during project audit', async () => {
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
            return (key) => params.getAll(key).at(0);
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

  it('flags auth redirects that trust returned helper closures over repeated query params with shift() during project audit', async () => {
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
            return (key) => params.getAll(key).shift();
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with shift() during project audit', async () => {
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
            return (key) => params.getAll(key).shift();
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

  it('flags auth redirects that trust returned helper closures over repeated query params with pop() during project audit', async () => {
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
            return (key) => params.getAll(key).pop();
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with pop() during project audit', async () => {
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
            return (key) => params.getAll(key).pop();
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

  it('flags auth redirects that trust returned helper closures over repeated query params with find() during project audit', async () => {
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
            return (key) => params.getAll(key).find(Boolean);
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with find() during project audit', async () => {
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
            return (key) => params.getAll(key).find(Boolean);
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

  it('flags auth redirects that trust returned helper closures over repeated query params with findLast() during project audit', async () => {
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
            return (key) => params.getAll(key).findLast(Boolean);
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

  it('flags auth redirects that trust wrapped returned helper closures over repeated query params with findLast() during project audit', async () => {
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
            return (key) => params.getAll(key).findLast(Boolean);
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

  it('flags auth redirects that trust returned helper closures over sliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).slice(-1)[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over sliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).slice(-1)[0];
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

  it('flags auth redirects that trust returned helper closures over reversed repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).reverse()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over reversed repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).reverse()[0];
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

  it('flags auth redirects that trust returned helper closures over non-mutating reversed repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toReversed()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating reversed repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toReversed()[0];
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

  it('flags auth redirects that trust returned helper closures over sorted repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).sort()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over sorted repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).sort()[0];
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

  it('flags auth redirects that trust returned helper closures over non-mutating sorted repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toSorted()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating sorted repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toSorted()[0];
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

  it('flags auth redirects that trust returned helper closures over Array.from wrapped repeated query params during project audit', async () => {
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
            return (key) => Array.from(params.getAll(key))[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over Array.from wrapped repeated query params during project audit', async () => {
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
            return (key) => Array.from(params.getAll(key))[0];
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

  it('flags auth redirects that trust returned helper closures over spread wrapped repeated query params during project audit', async () => {
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
            return (key) => [...params.getAll(key)][0];
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

  it('flags auth redirects that trust wrapped returned helper closures over spread wrapped repeated query params during project audit', async () => {
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
            return (key) => [...params.getAll(key)][0];
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

  it('flags auth redirects that trust returned helper closures over concatenated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).concat()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over concatenated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).concat()[0];
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

  it('flags auth redirects that trust returned helper closures over flattened repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).flat()[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over flattened repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).flat()[0];
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

  it('flags auth redirects that trust returned helper closures over flat-mapped repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).flatMap((value) => [value])[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over flat-mapped repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).flatMap((value) => [value])[0];
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

  it('flags auth redirects that trust returned helper closures over mapped repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).map((value) => value)[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over mapped repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).map((value) => value)[0];
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

  it('flags auth redirects that trust returned helper closures over spliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).splice(0, 1)[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over spliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).splice(0, 1)[0];
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

  it('flags auth redirects that trust returned helper closures over non-mutating spliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toSpliced(0, 1)[0];
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

  it('flags auth redirects that trust wrapped returned helper closures over non-mutating spliced repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).toSpliced(0, 1)[0];
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

  it('flags auth redirects that trust returned helper closures over iterated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).values().next().value;
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

  it('flags auth redirects that trust wrapped returned helper closures over iterated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).values().next().value;
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

  it('flags auth redirects that trust returned helper closures over entry-iterated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).entries().next().value[1];
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

  it('flags auth redirects that trust wrapped returned helper closures over entry-iterated repeated query params during project audit', async () => {
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
            return (key) => params.getAll(key).entries().next().value[1];
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

  it('flags auth redirects that trust trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trim();
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

  it('flags auth redirects that trust wrapped trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trim();
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

  it('flags auth redirects that trust replaced returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].replace(/^\\/+/, '/');
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

  it('flags auth redirects that trust wrapped replaced returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].replace(/^\\/+/, '/');
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

  it('flags auth redirects that trust replace-all returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].replaceAll('//', '/');
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

  it('flags auth redirects that trust wrapped replace-all returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].replaceAll('//', '/');
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

  it('flags auth redirects that trust substring returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].substring(0);
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

  it('flags auth redirects that trust wrapped substring returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].substring(0);
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

  it('flags auth redirects that trust substr returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].substr(0);
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

  it('flags auth redirects that trust wrapped substr returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].substr(0);
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

  it('flags auth redirects that trust lowercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLowerCase();
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

  it('flags auth redirects that trust wrapped lowercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLowerCase();
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

  it('flags auth redirects that trust uppercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toUpperCase();
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

  it('flags auth redirects that trust wrapped uppercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toUpperCase();
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

  it('flags auth redirects that trust locale-lowercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLocaleLowerCase();
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

  it('flags auth redirects that trust wrapped locale-lowercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLocaleLowerCase();
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

  it('flags auth redirects that trust locale-uppercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLocaleUpperCase();
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

  it('flags auth redirects that trust wrapped locale-uppercased returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLocaleUpperCase();
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

  it('flags auth redirects that trust normalized returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].normalize();
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

  it('flags auth redirects that trust wrapped normalized returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].normalize();
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

  it('flags auth redirects that trust left-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimStart();
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

  it('flags auth redirects that trust wrapped left-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimStart();
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

  it('flags auth redirects that trust right-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimEnd();
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

  it('flags auth redirects that trust wrapped right-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimEnd();
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

  it('flags auth redirects that trust legacy-left-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimLeft();
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

  it('flags auth redirects that trust wrapped legacy-left-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimLeft();
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

  it('flags auth redirects that trust legacy-right-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimRight();
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

  it('flags auth redirects that trust wrapped legacy-right-trimmed returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].trimRight();
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

  it('flags auth redirects that trust left-padded returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].padStart(12, '/');
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

  it('flags auth redirects that trust wrapped left-padded returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].padStart(12, '/');
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

  it('flags auth redirects that trust right-padded returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].padEnd(12, '/');
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

  it('flags auth redirects that trust wrapped right-padded returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].padEnd(12, '/');
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

  it('flags auth redirects that trust repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].repeat(1);
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

  it('flags auth redirects that trust wrapped repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].repeat(1);
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

  it('flags auth redirects that trust split repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].split('?')[0];
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

  it('flags auth redirects that trust stringified repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toString();
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

  it('flags auth redirects that trust String-wrapped repeated-string returned helper closures during project audit', async () => {
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
            return (key) => String(params.getAll(key)[0]);
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

  it('flags auth redirects that trust value-unwrapped repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].valueOf();
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

  it('flags auth redirects that trust sliced repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].slice(0);
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

  it('flags auth redirects that trust locale-stringified repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toLocaleString();
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

  it('flags auth redirects that trust split-joined repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].split('?').join('?');
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

  it('flags auth redirects that trust matched repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].match(/^[^?]+/)?.[0];
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

  it('flags auth redirects that trust matchAll-normalized repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].matchAll(/^[^?]+/g).next().value?.[0];
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

  it('flags auth redirects that trust well-formed repeated-string returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0].toWellFormed();
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

  it('flags auth redirects that trust regex-exec repeated-string returned helper closures during project audit', async () => {
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
            return (key) => /^[^?]+/.exec(params.getAll(key)[0])?.[0];
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

  it('flags auth redirects that trust reduced repeated-query returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key).reduce((_, value) => value);
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

  it('flags auth redirects that trust nullish-fallback repeated-query returned helper closures during project audit', async () => {
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
            return (key) => params.getAll(key)[0] ?? '/dashboard';
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

  it('flags auth redirects that trust ternary repeated-query returned helper closures during project audit', async () => {
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
            return (key) => key === 'default' ? '/dashboard' : params.getAll(key)[0];
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

  it('flags auth redirects that trust template-wrapped repeated-query returned helper closures during project audit', async () => {
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
            return (key) => \`\${params.getAll(key)[0]}\`;
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

  it('flags auth redirects that trust tagged-template repeated-query returned helper closures during project audit', async () => {
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
            return (key) => String.raw\`\${params.getAll(key)[0]}\`;
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

  it('flags auth redirects that trust URI-decoded repeated-query returned helper closures during project audit', async () => {
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
            return (key) => decodeURIComponent(params.getAll(key)[0]);
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

  it('flags auth redirects that trust browser-global URI-decoded repeated-query returned helper closures during project audit', async () => {
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
            return (key) => window.decodeURIComponent(params.getAll(key)[0]);
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

  it('flags auth redirects that trust bound browser-global URI-decoded repeated-query returned helper closures during project audit', async () => {
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
            const decodeRedirect = window.decodeURIComponent.bind(window);
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

  it('flags auth redirects that trust wrapper-based browser-global URI-decoded repeated-query returned helper closures during project audit', async () => {
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
            return (key) => window.decodeURIComponent.call(window, params.getAll(key)[0]);
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

  it('flags auth redirects that trust bound browser-global legacy URI-decoded repeated-query returned helper closures during project audit', async () => {
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
            const decodeRedirect = window.unescape.bind(window);
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

  it('flags auth redirects that trust browser-global stringified repeated-query returned helper closures during project audit', async () => {
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
            return (key) => window.String(params.getAll(key)[0]);
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

  it('flags auth redirects that trust direct stringified repeated-query returned helper closures during project audit', async () => {
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
            return (key) => String(params.getAll(key)[0]);
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

  it('flags auth redirects that trust bound browser-global stringified repeated-query returned helper closures during project audit', async () => {
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
            const stringifyRedirect = window.String.bind(window);
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

  it('flags auth redirects that trust wrapper-based browser-global stringified repeated-query returned helper closures during project audit', async () => {
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
            return (key) => Reflect.apply(globalThis.String, globalThis, [params.getAll(key)[0]]);
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

  it('flags auth redirects that trust destructured constructor-style browser-global stringified repeated-query returned helper closures during project audit', async () => {
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
            const { String: StringCtor } = globalThis;
            return (key) => new StringCtor(params.getAll(key)[0]);
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

  it('flags auth redirects that trust bound JSON.parse repeated-query returned helper closures during project audit', async () => {
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
            const parseRedirect = JSON.parse.bind(JSON);
            return (key) => parseRedirect(params.getAll(key)[0]);
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

  it('flags auth redirects that trust constructor-style browser-global stringified repeated-query returned helper closures during project audit', async () => {
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
            return (key) => new globalThis.String(params.getAll(key)[0]);
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

  it('flags auth redirects that trust object-boxed repeated-query returned helper closures during project audit', async () => {
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
            return (key) => new globalThis.Object(params.getAll(key)[0]);
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

  it('flags auth redirects that trust destructured object-boxed repeated-query returned helper closures during project audit', async () => {
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
            const { Object: ObjectCtor } = globalThis;
            return (key) => ObjectCtor(params.getAll(key)[0]);
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

  it('flags auth redirects that trust direct browser-global object repeated-query returned helper closures during project audit', async () => {
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
            return (key) => Object(params.getAll(key)[0]);
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

  it('flags auth redirects that trust bound browser-global object repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Object.bind(globalThis);
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

  it('flags auth redirects that trust bound browser-global number repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Number.bind(globalThis);
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

  it('flags auth redirects that trust wrapper-based browser-global number repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Number;
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

  it('flags auth redirects that trust apply-based browser-global number repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Number;
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

  it('flags auth redirects that trust direct browser-global number repeated-query returned helper closures during project audit', async () => {
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
            return (key) => Number(params.getAll(key)[0]);
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

  it('flags auth redirects that trust browser-global number-boxed repeated-query returned helper closures during project audit', async () => {
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
            return (key) => new globalThis.Number(params.getAll(key)[0]);
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

  it('flags auth redirects that trust destructured browser-global number-boxed repeated-query returned helper closures during project audit', async () => {
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
            const { Number: NumberCtor } = globalThis;
            return (key) => NumberCtor(params.getAll(key)[0]);
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

  it('flags auth redirects that trust wrapper-based browser-global object repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Object;
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

  it('flags auth redirects that trust apply-based browser-global object repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Object;
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

  it('flags auth redirects that trust reflected browser-global object repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Object;
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

  it('flags auth redirects that trust reflected browser-global number repeated-query returned helper closures during project audit', async () => {
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
            const readRedirectValue = globalThis.Number;
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
});
