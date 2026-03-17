import { readFile, stat, access } from 'node:fs/promises';
import { join } from 'node:path';

const cwd = process.cwd();

// ── Color helpers ─────────────────────────────────────────────────
const green = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const red = (s) => `\x1b[31m✗\x1b[0m ${s}`;
const yellow = (s) => `\x1b[33m⚠\x1b[0m ${s}`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

let passes = 0;
let warns = 0;
let fails = 0;

function pass(msg) { passes++; console.log(green(msg)); }
function warn(msg) { warns++; console.log(yellow(msg)); }
function fail(msg) { fails++; console.log(red(msg)); }

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJSON(path) {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ── Checks ────────────────────────────────────────────────────────

async function checkNodeVersion() {
  const [major] = process.versions.node.split('.').map(Number);
  if (major >= 20) {
    pass(`Node.js ${process.versions.node} (>= 20.0.0 required)`);
  } else {
    fail(`Node.js ${process.versions.node} — requires >= 20.0.0`);
  }
}

async function checkPackageJson() {
  const pkgPath = join(cwd, 'package.json');
  const pkg = await readJSON(pkgPath);
  if (!pkg) {
    fail('package.json not found');
    return;
  }
  pass('package.json exists');

  if (pkg.type === 'module') {
    pass('package.json type is "module"');
  } else {
    warn('package.json type should be "module" for ESM support');
  }

  // Check for decantr dependency (accept both scoped and unscoped names)
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const decantrVersion = deps['decantr'] || deps['decantr'];
  if (decantrVersion) {
    pass(`decantr ${decantrVersion} in dependencies`);
  } else {
    fail('decantr not found in dependencies (expected decantr or decantr)');
  }
}

async function checkConfig() {
  const configPath = join(cwd, 'decantr.config.json');
  const config = await readJSON(configPath);
  if (!config) {
    warn('decantr.config.json not found — using defaults');
    return;
  }
  pass('decantr.config.json exists and is valid JSON');

  if (config.build?.sizeBudget) {
    pass('Size budgets configured');
  } else {
    warn('No size budgets configured in decantr.config.json');
  }
}

async function checkEssence() {
  const essPath = join(cwd, 'decantr.essence.json');
  const ess = await readJSON(essPath);
  if (!ess) {
    warn('decantr.essence.json not found — run `decantr generate` or create manually');
    return;
  }
  pass('decantr.essence.json exists and is valid JSON');

  if (ess.terroir) pass(`Terroir: ${ess.terroir}`);
  else if (ess.sections) pass(`Sectioned essence with ${ess.sections.length} section(s)`);
  else warn('Essence missing terroir or sections');

  if (ess.vintage?.style) pass(`Style: ${ess.vintage.style}`);
  else if (ess.sections?.[0]?.vintage?.style) pass(`Style: ${ess.sections[0].vintage.style} (first section)`);
  else warn('Essence missing vintage.style');

  const structure = ess.structure || ess.sections?.flatMap(s => s.structure || []) || [];
  if (structure.length > 0) {
    pass(`Structure: ${structure.length} page(s) defined`);
  } else {
    warn('No pages defined in structure');
  }
}

async function checkEntryPoint() {
  const candidates = ['src/app.js', 'src/index.js', 'src/main.js'];
  for (const c of candidates) {
    if (await fileExists(join(cwd, c))) {
      pass(`Entry point found: ${c}`);
      return;
    }
  }
  warn('No entry point found (expected src/app.js, src/index.js, or src/main.js)');
}

async function checkDirectories() {
  const dirs = ['src', 'public'];
  for (const d of dirs) {
    try {
      const s = await stat(join(cwd, d));
      if (s.isDirectory()) {
        pass(`${d}/ directory exists`);
      } else {
        fail(`${d} exists but is not a directory`);
      }
    } catch {
      if (d === 'src') fail('src/ directory not found');
      else warn(`${d}/ directory not found — optional`);
    }
  }
}

async function checkPublicHTML() {
  const htmlPath = join(cwd, 'public', 'index.html');
  if (await fileExists(htmlPath)) {
    pass('public/index.html exists');
    const html = await readFile(htmlPath, 'utf-8');
    if (html.includes('type="module"')) {
      pass('index.html loads app as ES module');
    } else {
      warn('index.html missing type="module" on script tag');
    }
  } else {
    warn('public/index.html not found');
  }
}

async function checkFrameworkVersion() {
  const scopedPath = join(cwd, 'node_modules', '@decantr', 'decantr', 'package.json');
  const unscopedPath = join(cwd, 'node_modules', 'decantr', 'package.json');
  const pkg = await readJSON(scopedPath) || await readJSON(unscopedPath);
  if (!pkg) {
    warn('Cannot read installed decantr version — run npm install');
    return;
  }
  const [major, minor] = pkg.version.split('.').map(Number);
  pass(`Framework version: ${pkg.version}`);
  if (major === 0 && minor < 4) {
    warn(`Framework version ${pkg.version} is outdated — consider updating to latest`);
  }
}

// ── Main ──────────────────────────────────────────────────────────
export async function run() {
  console.log(`\n${bold('decantr doctor')} ${dim('— checking project health')}\n`);

  await checkNodeVersion();
  await checkPackageJson();
  await checkConfig();
  await checkEssence();
  await checkEntryPoint();
  await checkDirectories();
  await checkPublicHTML();
  await checkFrameworkVersion();

  console.log(`\n${bold('Results:')} ${green(`${passes} passed`)}${warns ? `, ${yellow(`${warns} warnings`)}` : ''}${fails ? `, ${red(`${fails} failed`)}` : ''}\n`);

  if (fails > 0) {
    console.log(`${red('Some checks failed. Fix the issues above and run again.')}\n`);
    process.exit(1);
  } else if (warns > 0) {
    console.log(`${yellow('All critical checks passed, but there are warnings.')}\n`);
  } else {
    console.log(`${green('All checks passed! Your project is healthy.')}\n`);
  }
}
