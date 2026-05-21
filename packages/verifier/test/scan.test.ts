import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { probePublishedSite, resolveGitHubScanInput, scanProject } from '../src/index.js';

describe('scanProject', () => {
  let projectRoot: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), 'decantr-scan-'));
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  it('scans a React/Vite GitHub Pages app with HashRouter without writing files', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          name: 'pages-app',
          homepage: 'https://example.github.io/pages-app/',
          scripts: { deploy: 'gh-pages -d dist' },
          dependencies: {
            '@vitejs/plugin-react': '^5.0.0',
            'gh-pages': '^6.0.0',
            react: '^19.0.0',
            'react-dom': '^19.0.0',
            'react-router-dom': '^7.0.0',
          },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'vite.config.ts'), "export default { base: '/pages-app/' };\n");
    mkdirSync(join(projectRoot, 'src', 'components'), { recursive: true });
    mkdirSync(join(projectRoot, 'src', 'styles'), { recursive: true });
    writeFileSync(
      join(projectRoot, 'src', 'App.tsx'),
      [
        'import { HashRouter, Route, Routes } from "react-router-dom";',
        'export function App() {',
        '  return <HashRouter><Routes><Route path="/" element={<main />} /><Route path="/settings" element={<main />} /></Routes></HashRouter>;',
        '}',
        '',
      ].join('\n'),
    );
    writeFileSync(join(projectRoot, 'src', 'components', 'HeroPanel.tsx'), 'export function HeroPanel() { return <section />; }\n');
    writeFileSync(
      join(projectRoot, 'src', 'styles', 'theme.css'),
      ':root { --surface: #fff; --accent: #2563eb; } .dark { color-scheme: dark; }\n',
    );

    const report = await scanProject(projectRoot, {
      input: { kind: 'local', value: projectRoot },
      publishedSiteUrl: 'https://example.github.io/pages-app/',
    });

    expect(report.applicability.status).toBe('strong_fit');
    expect(report.project.framework).toBe('react');
    expect(report.routes.strategy).toBe('react-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(expect.arrayContaining(['/', '/settings']));
    expect(report.staticHosting.githubPagesLikely).toBe(true);
    expect(report.staticHosting.hashRouting).toBe(true);
    expect(report.styling.cssVariableCount).toBeGreaterThanOrEqual(2);
    expect(report.recommendedCommands).toContain('npx @decantr/cli adopt --yes');
    expect(JSON.stringify(report)).not.toContain(projectRoot);
  });

  it('scans a Next app route map', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify({ dependencies: { next: '^16.0.0', react: '^19.0.0' } }, null, 2),
    );
    mkdirSync(join(projectRoot, 'app', 'dashboard'), { recursive: true });
    writeFileSync(join(projectRoot, 'next.config.ts'), 'export default {};\n');
    writeFileSync(join(projectRoot, 'app', 'page.tsx'), 'export default function Page() { return <main />; }\n');
    writeFileSync(join(projectRoot, 'app', 'dashboard', 'page.tsx'), 'export default function Page() { return <main />; }\n');

    const report = await scanProject(projectRoot);

    expect(report.project.framework).toBe('nextjs');
    expect(report.routes.strategy).toBe('app-router');
    expect(report.routes.items.map((route) => route.path)).toEqual(expect.arrayContaining(['/', '/dashboard']));
  });

  it('handles static HTML projects', async () => {
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><title>Portfolio</title><main>Hello</main>\n');
    writeFileSync(join(projectRoot, 'styles.css'), ':root { --ink: #111; }\n');

    const report = await scanProject(projectRoot);

    expect(report.applicability.status).toBe('strong_fit');
    expect(report.project.framework).toBe('html');
    expect(report.routes.strategy).toBe('static-html');
    expect(report.routes.count).toBe(1);
  });

  it('returns not_applicable for Python backend repositories', async () => {
    writeFileSync(join(projectRoot, 'pyproject.toml'), '[project]\nname = "api"\n');
    writeFileSync(join(projectRoot, 'main.py'), 'print("hello")\n');

    const report = await scanProject(projectRoot);

    expect(report.applicability.status).toBe('not_applicable');
    expect(report.project.primaryLanguage).toBe('python');
    expect(report.findings.some((finding) => finding.id === 'not-brownfield-ui-target')).toBe(true);
  });

  it('degrades gracefully when package.json is invalid', async () => {
    writeFileSync(join(projectRoot, 'package.json'), '{ nope }\n');
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><title>Fallback</title>\n');

    const report = await scanProject(projectRoot);

    expect(report.project.framework).toBe('html');
    expect(report.findings.some((finding) => finding.id === 'package-manifest-invalid')).toBe(true);
  });

  it('does not treat a homepage query string as GitHub Pages hosting evidence', async () => {
    writeFileSync(
      join(projectRoot, 'package.json'),
      JSON.stringify(
        {
          homepage: 'https://example.com/launch?next=https://acme.github.io/site/',
          dependencies: { react: '^19.0.0', 'react-dom': '^19.0.0' },
        },
        null,
        2,
      ),
    );
    writeFileSync(join(projectRoot, 'index.html'), '<!doctype html><div id="root"></div>\n');

    const report = await scanProject(projectRoot);

    expect(report.staticHosting.githubPagesLikely).toBe(false);
    expect(report.staticHosting.basePath).toBeNull();
  });
});

describe('resolveGitHubScanInput', () => {
  it('accepts repository and GitHub Pages URLs', () => {
    expect(resolveGitHubScanInput('https://github.com/acme/site').repository).toMatchObject({
      owner: 'acme',
      repo: 'site',
    });
    expect(resolveGitHubScanInput('https://acme.github.io/site/docs').publishedSiteUrl).toBe(
      'https://acme.github.io/site/',
    );
  });

  it('rejects invalid GitHub repository path segments', () => {
    expect(() => resolveGitHubScanInput('https://github.com/acme/site%2Fadmin')).toThrow(/valid owner and repository/);
    expect(() => resolveGitHubScanInput('https://acme.github.io/site%2Fadmin/')).toThrow(/valid owner and repository/);
  });
});

describe('probePublishedSite', () => {
  it('decodes published page metadata with an entity parser', async () => {
    const html = [
      '<!doctype html>',
      '<title>R&amp;D Lab</title>',
      '<meta name="description" content="Static &amp; read-only">',
      '<link rel="canonical" href="https://acme.github.io/site/?ref=scan&amp;mode=public">',
    ].join('');

    const probe = await probePublishedSite('https://acme.github.io/site/', {
      fetchImpl: async () =>
        new Response(html, {
          status: 200,
          headers: { 'content-type': 'text/html' },
        }),
    });

    expect(probe.title).toBe('R&D Lab');
    expect(probe.description).toBe('Static & read-only');
    expect(probe.canonicalUrl).toBe('https://acme.github.io/site/?ref=scan&mode=public');
  });
});
