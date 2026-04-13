import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const cliBin = join(repoRoot, 'packages', 'cli', 'dist', 'bin.js');
const defaultContentRoot = process.env.DECANTR_CONTENT_DIR
  ? resolve(process.env.DECANTR_CONTENT_DIR)
  : resolve(repoRoot, '..', 'decantr-content');

const contentTypes = ['archetypes', 'blueprints', 'patterns', 'themes', 'shells'];

const matrix = [
  {
    id: 'product-landing',
    category: 'public-marketing',
    rationale: 'Public, conversion-oriented multi-archetype marketing surface.',
  },
  {
    id: 'saas-dashboard',
    category: 'authenticated-saas',
    rationale: 'Canonical SaaS shape with gateway, dashboard, analytics, billing, and settings.',
  },
  {
    id: 'agent-marketplace',
    category: 'marketplace-ai',
    rationale: 'Marketplace plus orchestration/auth complexity with realtime-style feature mix.',
  },
  {
    id: 'knowledge-base',
    category: 'docs-content',
    rationale: 'Documentation/search-heavy topology with docs, auth, and settings surfaces.',
  },
  {
    id: 'registry-platform',
    category: 'dogfood-control-plane',
    rationale: 'Most complex Decantr dogfood blueprint with browse, dashboard, admin, and auth zones.',
  },
  {
    id: 'terminal-dashboard',
    category: 'dense-visual-system',
    rationale: 'Dense devtool-style blueprint with heavier feature breadth and treatment pressure.',
  },
];

function parseArgs(argv) {
  const options = {
    json: false,
    all: false,
    blueprints: [],
    contentRoot: defaultContentRoot,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--all') {
      options.all = true;
    } else if (arg.startsWith('--blueprints=')) {
      options.blueprints = arg.slice('--blueprints='.length).split(',').map((item) => item.trim()).filter(Boolean);
    } else if (arg === '--blueprints') {
      options.blueprints = (argv[i + 1] || '').split(',').map((item) => item.trim()).filter(Boolean);
      i += 1;
    } else if (arg.startsWith('--content-root=')) {
      options.contentRoot = resolve(arg.slice('--content-root='.length));
    } else if (arg === '--content-root') {
      options.contentRoot = resolve(argv[i + 1] || options.contentRoot);
      i += 1;
    }
  }

  return options;
}

function assertPrereqs(contentRoot) {
  if (!existsSync(cliBin)) {
    throw new Error(`Missing built CLI at ${cliBin}. Run "pnpm --filter @decantr/cli build" first.`);
  }

  if (!existsSync(contentRoot)) {
    throw new Error(`Missing decantr-content root at ${contentRoot}. Set DECANTR_CONTENT_DIR or pass --content-root.`);
  }

  for (const type of contentTypes) {
    const dir = join(contentRoot, type);
    if (!existsSync(dir)) {
      throw new Error(`Missing content directory: ${dir}`);
    }
  }
}

function listAllBlueprints(contentRoot) {
  return readdirSync(join(contentRoot, 'blueprints'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => basename(file, '.json'))
    .sort();
}

function selectedBlueprints(options, contentRoot) {
  if (options.blueprints.length > 0) {
    return options.blueprints.map((id) => ({
      id,
      category: 'manual',
      rationale: 'Manually selected blueprint.',
    }));
  }

  if (options.all) {
    return listAllBlueprints(contentRoot).map((id) => ({
      id,
      category: 'full-corpus',
      rationale: 'Included via --all full blueprint corpus run.',
    }));
  }

  return matrix;
}

function hydrateContent(projectRoot, contentRoot) {
  const customRoot = join(projectRoot, '.decantr', 'custom');
  const cacheRoot = join(projectRoot, '.decantr', 'cache', '@official');
  mkdirSync(customRoot, { recursive: true });
  mkdirSync(cacheRoot, { recursive: true });

  for (const type of contentTypes) {
    cpSync(join(contentRoot, type), join(customRoot, type), { recursive: true });
    cpSync(join(contentRoot, type), join(cacheRoot, type), { recursive: true });
  }
}

function runCli(projectRoot, args) {
  const startedAt = Date.now();
  const result = spawnSync('node', [cliBin, ...args], {
    cwd: projectRoot,
    encoding: 'utf-8',
    timeout: 120_000,
    env: {
      ...process.env,
      DECANTR_OFFLINE: 'true',
    },
  });

  return {
    args,
    status: result.status ?? 1,
    signal: result.signal ?? null,
    durationMs: Date.now() - startedAt,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function requiredPaths(projectRoot) {
  return {
    essence: join(projectRoot, 'decantr.essence.json'),
    decantr: join(projectRoot, 'DECANTR.md'),
    manifest: join(projectRoot, '.decantr', 'context', 'pack-manifest.json'),
    scaffoldPack: join(projectRoot, '.decantr', 'context', 'scaffold-pack.md'),
    reviewPack: join(projectRoot, '.decantr', 'context', 'review-pack.md'),
  };
}

function summarizeManifest(projectRoot) {
  const manifestPath = join(projectRoot, '.decantr', 'context', 'pack-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  return {
    sections: Array.isArray(manifest.sections) ? manifest.sections.length : 0,
    pages: Array.isArray(manifest.pages) ? manifest.pages.length : 0,
    mutations: Array.isArray(manifest.mutations) ? manifest.mutations.length : 0,
  };
}

function excerpt(text) {
  const lines = text.trim().split('\n').filter(Boolean);
  return lines.slice(-12).join('\n');
}

function certifyBlueprint(entry, contentRoot) {
  const projectRoot = mkdtempSync(join(tmpdir(), `decantr-blueprint-${entry.id}-`));

  try {
    hydrateContent(projectRoot, contentRoot);

    const initResult = runCli(projectRoot, ['init', `--blueprint=${entry.id}`, '--offline', '--yes']);
    const paths = requiredPaths(projectRoot);

    const filesPresent = Object.fromEntries(
      Object.entries(paths).map(([key, filePath]) => [key, existsSync(filePath)])
    );

    const promptAligned =
      initResult.stdout.includes('Treat the compiled execution-pack files as the primary source of truth.') &&
      initResult.stdout.includes('After implementation, run decantr check and decantr audit');

    const decantrContent = existsSync(paths.decantr) ? readFileSync(paths.decantr, 'utf-8') : '';
    const decantrAligned =
      decantrContent.includes('Treat the compiled execution-pack files as the primary source of truth.') &&
      decantrContent.includes('Run `decantr check` to detect drift violations while editing');

    let checkResult = { status: 1, durationMs: 0, stdout: '', stderr: '' };
    let auditResult = { status: 1, durationMs: 0, stdout: '', stderr: '' };
    let manifestSummary = { sections: 0, pages: 0, mutations: 0 };

    if (initResult.status === 0) {
      checkResult = runCli(projectRoot, ['check']);
      auditResult = runCli(projectRoot, ['audit']);
    }

    if (filesPresent.manifest) {
      manifestSummary = summarizeManifest(projectRoot);
    }

    const passed =
      initResult.status === 0 &&
      checkResult.status === 0 &&
      auditResult.status === 0 &&
      Object.values(filesPresent).every(Boolean) &&
      promptAligned &&
      decantrAligned;

    return {
      blueprint: entry.id,
      category: entry.category,
      rationale: entry.rationale,
      passed,
      filesPresent,
      promptAligned,
      decantrAligned,
      packs: manifestSummary,
      init: {
        status: initResult.status,
        durationMs: initResult.durationMs,
        excerpt: excerpt(`${initResult.stdout}\n${initResult.stderr}`),
      },
      check: {
        status: checkResult.status,
        durationMs: checkResult.durationMs,
        excerpt: excerpt(`${checkResult.stdout}\n${checkResult.stderr}`),
      },
      audit: {
        status: auditResult.status,
        durationMs: auditResult.durationMs,
        excerpt: excerpt(`${auditResult.stdout}\n${auditResult.stderr}`),
      },
    };
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
}

function formatHuman(report) {
  const lines = [];
  lines.push('Decantr Blueprint Certification Matrix');
  lines.push(`Content root: ${report.contentRoot}`);
  lines.push(`Blueprints: ${report.results.length}`);
  lines.push(`Passed: ${report.results.filter((item) => item.passed).length}/${report.results.length}`);
  lines.push('');
  lines.push('| Blueprint | Category | Result | Packs | Init | Check | Audit |');
  lines.push('|---|---|---|---:|---:|---:|---:|');

  for (const result of report.results) {
    const packSummary = `${result.packs.sections}s/${result.packs.pages}p/${result.packs.mutations}m`;
    lines.push(
      `| ${result.blueprint} | ${result.category} | ${result.passed ? 'PASS' : 'FAIL'} | ${packSummary} | ${result.init.durationMs}ms | ${result.check.durationMs}ms | ${result.audit.durationMs}ms |`
    );
  }

  const failures = report.results.filter((item) => !item.passed);
  if (failures.length > 0) {
    lines.push('');
    lines.push('Failures:');
    for (const failure of failures) {
      lines.push(`- ${failure.blueprint}`);
      const missing = Object.entries(failure.filesPresent)
        .filter(([, present]) => !present)
        .map(([name]) => name);
      if (missing.length > 0) {
        lines.push(`  missing files: ${missing.join(', ')}`);
      }
      lines.push(`  init: ${failure.init.excerpt || 'n/a'}`);
      lines.push(`  check: ${failure.check.excerpt || 'n/a'}`);
      lines.push(`  audit: ${failure.audit.excerpt || 'n/a'}`);
    }
  }

  return lines.join('\n');
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  assertPrereqs(options.contentRoot);

  const selected = selectedBlueprints(options, options.contentRoot);
  const results = selected.map((entry) => certifyBlueprint(entry, options.contentRoot));

  const report = {
    generatedAt: new Date().toISOString(),
    repoRoot,
    contentRoot: options.contentRoot,
    mode: options.all ? 'all' : options.blueprints.length > 0 ? 'manual' : 'matrix',
    results,
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatHuman(report));
  }

  const failed = results.some((item) => !item.passed);
  process.exit(failed ? 1 : 0);
}

main();
