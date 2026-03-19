/**
 * Playwright Visual Validation
 *
 * Captures screenshots of scaffolded projects and compares against baselines.
 * Requires Playwright to be installed: npm install -D @playwright/test
 */

import { spawn } from 'node:child_process';
import { mkdir, writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Configuration ──────────────────────────────────────────────────────────

const VIEWPORT = { width: 1280, height: 720 };
const MOBILE_VIEWPORT = { width: 375, height: 667 };
const SCREENSHOT_TIMEOUT = 5000;
const SERVER_BOOT_TIMEOUT = 30000;

// ─── Dev Server Management ───────────────────────────────────────────────────

async function startDevServer(projectDir, port = 0) {
  return new Promise((resolve, reject) => {
    const child = spawn('npx', ['decantr', 'dev', '--port', String(port)], {
      cwd: projectDir,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let serverUrl = null;
    let output = '';

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Dev server failed to start within ${SERVER_BOOT_TIMEOUT}ms. Output: ${output}`));
    }, SERVER_BOOT_TIMEOUT);

    child.stdout.on('data', (data) => {
      output += data.toString();
      // Look for URL patterns like "http://localhost:XXXX"
      const match = output.match(/https?:\/\/localhost:(\d+)/);
      if (match && !serverUrl) {
        serverUrl = match[0];
        clearTimeout(timeout);
        resolve({
          url: serverUrl,
          port: parseInt(match[1], 10),
          process: child,
          stop: () => {
            child.kill();
            return new Promise(r => child.on('close', r));
          },
        });
      }
    });

    child.stderr.on('data', (data) => {
      output += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (code) => {
      if (!serverUrl) {
        clearTimeout(timeout);
        reject(new Error(`Dev server exited with code ${code}. Output: ${output}`));
      }
    });
  });
}

// ─── Screenshot Capture ───────────────────────────────────────────────────────

async function captureScreenshots(projectDir, outputDir, options = {}) {
  let playwright;
  try {
    playwright = await import('playwright');
  } catch {
    throw new Error(
      'Playwright is not installed. Install it with: npm install -D playwright\n' +
      'Then run: npx playwright install chromium'
    );
  }

  const results = {
    screenshots: [],
    errors: [],
    consoleErrors: [],
  };

  // Start dev server
  let server;
  try {
    server = await startDevServer(projectDir);
  } catch (err) {
    results.errors.push({ type: 'server', message: err.message });
    return results;
  }

  const browser = await playwright.chromium.launch();

  try {
    // Read essence to get routes
    const essencePath = join(projectDir, 'decantr.essence.json');
    let routes = ['/'];

    if (existsSync(essencePath)) {
      const essence = JSON.parse(await readFile(essencePath, 'utf-8'));
      if (essence.structure) {
        routes = essence.structure.map(page => {
          if (page.id === 'home') return '/';
          return `/${page.id}`;
        });
      }
    }

    await mkdir(outputDir, { recursive: true });

    // Capture desktop screenshots
    const desktopContext = await browser.newContext({ viewport: VIEWPORT });
    const desktopPage = await desktopContext.newPage();

    // Capture console errors
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') {
        results.consoleErrors.push(msg.text());
      }
    });

    for (const route of routes) {
      try {
        await desktopPage.goto(`${server.url}${route}`, { waitUntil: 'networkidle' });
        await desktopPage.waitForTimeout(SCREENSHOT_TIMEOUT);

        const filename = `desktop-${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}.png`;
        const screenshotPath = join(outputDir, filename);

        await desktopPage.screenshot({ path: screenshotPath, fullPage: true });
        results.screenshots.push({ route, viewport: 'desktop', path: screenshotPath });
      } catch (err) {
        results.errors.push({ type: 'screenshot', route, viewport: 'desktop', message: err.message });
      }
    }

    await desktopContext.close();

    // Capture mobile screenshots if requested
    if (options.includeMobile) {
      const mobileContext = await browser.newContext({ viewport: MOBILE_VIEWPORT });
      const mobilePage = await mobileContext.newPage();

      for (const route of routes) {
        try {
          await mobilePage.goto(`${server.url}${route}`, { waitUntil: 'networkidle' });
          await mobilePage.waitForTimeout(SCREENSHOT_TIMEOUT);

          const filename = `mobile-${route === '/' ? 'home' : route.slice(1).replace(/\//g, '-')}.png`;
          const screenshotPath = join(outputDir, filename);

          await mobilePage.screenshot({ path: screenshotPath, fullPage: true });
          results.screenshots.push({ route, viewport: 'mobile', path: screenshotPath });
        } catch (err) {
          results.errors.push({ type: 'screenshot', route, viewport: 'mobile', message: err.message });
        }
      }

      await mobileContext.close();
    }
  } finally {
    await browser.close();
    await server.stop();
  }

  return results;
}

// ─── Visual Comparison ────────────────────────────────────────────────────────

async function compareScreenshots(actualDir, baselineDir) {
  const results = {
    matches: [],
    diffs: [],
    missing: [],
    extra: [],
  };

  if (!existsSync(baselineDir)) {
    results.missing.push({ type: 'baseline-dir', message: 'No baseline directory found' });
    return results;
  }

  const actualFiles = await readdir(actualDir);
  const baselineFiles = await readdir(baselineDir);

  const pngFiles = actualFiles.filter(f => f.endsWith('.png'));
  const baselinePngs = new Set(baselineFiles.filter(f => f.endsWith('.png')));

  for (const file of pngFiles) {
    if (!baselinePngs.has(file)) {
      results.extra.push({ file, message: 'New screenshot without baseline' });
      continue;
    }

    // Simple byte comparison (for exact match)
    // For fuzzy comparison, you'd use pixelmatch or similar
    const actualBuffer = await readFile(join(actualDir, file));
    const baselineBuffer = await readFile(join(baselineDir, file));

    if (actualBuffer.equals(baselineBuffer)) {
      results.matches.push({ file });
    } else {
      results.diffs.push({
        file,
        actualSize: actualBuffer.length,
        baselineSize: baselineBuffer.length,
      });
    }
  }

  // Check for missing files
  for (const baselineFile of baselinePngs) {
    if (!pngFiles.includes(baselineFile)) {
      results.missing.push({ file: baselineFile, message: 'Baseline exists but no actual screenshot' });
    }
  }

  return results;
}

// ─── Theme Extraction ─────────────────────────────────────────────────────────

async function extractThemeColors(projectDir) {
  const indexPath = join(projectDir, 'public', 'index.html');
  if (!existsSync(indexPath)) {
    return { detected: false, colors: {} };
  }

  const content = await readFile(indexPath, 'utf-8');

  // Extract CSS variables
  const colors = {};
  const varMatches = content.matchAll(/--color-([a-z-]+):\s*([^;]+);/g);

  for (const match of varMatches) {
    colors[match[1]] = match[2].trim();
  }

  // Detect mode
  const hasDarkMode = content.includes('@media (prefers-color-scheme: dark)') ||
                      content.includes('data-mode="dark"');

  return {
    detected: true,
    colors,
    hasDarkMode,
    colorCount: Object.keys(colors).length,
  };
}

// ─── Layout Analysis ──────────────────────────────────────────────────────────

async function analyzeLayout(projectDir) {
  const essencePath = join(projectDir, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return { detected: false };
  }

  const essence = JSON.parse(await readFile(essencePath, 'utf-8'));

  const skeletons = new Set();
  const patterns = new Set();

  if (essence.structure) {
    for (const page of essence.structure) {
      if (page.skeleton) skeletons.add(page.skeleton);
      if (page.blend) {
        for (const item of page.blend) {
          if (typeof item === 'string') {
            patterns.add(item);
          } else if (item.pattern) {
            patterns.add(item.pattern);
          }
        }
      }
    }
  }

  return {
    detected: true,
    skeletons: [...skeletons],
    patterns: [...patterns],
    pageCount: essence.structure?.length || 0,
    style: essence.vintage?.style,
    mode: essence.vintage?.mode,
  };
}

// ─── Main Exports ─────────────────────────────────────────────────────────────

/**
 * Run visual validation on a project.
 *
 * @param {string} projectDir - Path to the project
 * @param {Object} options - Options
 * @returns {Promise<Object>} Visual validation results
 */
export async function runVisualValidation(projectDir, options = {}) {
  const outputDir = options.outputDir || join(projectDir, '.visual-test');
  const screenshotsDir = join(outputDir, 'screenshots');
  const baselineDir = options.baselineDir || join(outputDir, 'baseline');

  // Capture screenshots
  const captureResults = await captureScreenshots(projectDir, screenshotsDir, {
    includeMobile: options.includeMobile || false,
  });

  // Compare with baseline if it exists
  let comparison = null;
  if (existsSync(baselineDir)) {
    comparison = await compareScreenshots(screenshotsDir, baselineDir);
  }

  // Extract theme
  const theme = await extractThemeColors(projectDir);

  // Analyze layout
  const layout = await analyzeLayout(projectDir);

  // Calculate visual score
  let score = 0;

  // Screenshots captured (30 points)
  if (captureResults.screenshots.length > 0) {
    score += 30;
  }

  // No console errors (20 points)
  if (captureResults.consoleErrors.length === 0) {
    score += 20;
  }

  // Theme configured (20 points)
  if (theme.detected && theme.colorCount >= 3) {
    score += 20;
  }

  // Layout properly structured (30 points)
  if (layout.detected && layout.pageCount > 0) {
    score += 15;
    if (layout.skeletons.length > 0) {
      score += 15;
    }
  }

  return {
    score: Math.min(100, score),
    screenshots: captureResults.screenshots,
    screenshotErrors: captureResults.errors,
    consoleErrors: captureResults.consoleErrors,
    comparison,
    theme,
    layout,
    outputDir,
  };
}

/**
 * Update baseline screenshots from current screenshots.
 */
export async function updateBaseline(projectDir, options = {}) {
  const outputDir = options.outputDir || join(projectDir, '.visual-test');
  const screenshotsDir = join(outputDir, 'screenshots');
  const baselineDir = join(outputDir, 'baseline');

  if (!existsSync(screenshotsDir)) {
    throw new Error('No screenshots to use as baseline. Run visual validation first.');
  }

  await mkdir(baselineDir, { recursive: true });

  const files = await readdir(screenshotsDir);
  for (const file of files.filter(f => f.endsWith('.png'))) {
    const content = await readFile(join(screenshotsDir, file));
    await writeFile(join(baselineDir, file), content);
  }

  return { updated: files.length };
}

// ─── CLI Entry Point ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
  Visual Validation Tool

  Usage:
    node visual.js <project-dir> [options]

  Options:
    --mobile          Include mobile viewport screenshots
    --update-baseline Update baseline from current screenshots
    --output <dir>    Output directory for screenshots

  Examples:
    node test/e2e-scaffold/visual.js ./my-project
    node test/e2e-scaffold/visual.js ./my-project --mobile
    node test/e2e-scaffold/visual.js ./my-project --update-baseline
`);
    return;
  }

  const projectDir = args[0];
  const includeMobile = args.includes('--mobile');
  const updateBaseline = args.includes('--update-baseline');

  let outputDir;
  const outputIdx = args.indexOf('--output');
  if (outputIdx !== -1 && args[outputIdx + 1]) {
    outputDir = args[outputIdx + 1];
  }

  if (updateBaseline) {
    console.log('Updating baseline...');
    const result = await updateBaseline(projectDir, { outputDir });
    console.log(`Updated ${result.updated} baseline images.`);
    return;
  }

  console.log(`Running visual validation on ${projectDir}...`);
  const result = await runVisualValidation(projectDir, { outputDir, includeMobile });

  console.log('\n  Visual Validation Results');
  console.log('  ─────────────────────────');
  console.log(`  Score: ${result.score}/100`);
  console.log(`  Screenshots: ${result.screenshots.length}`);
  console.log(`  Console Errors: ${result.consoleErrors.length}`);
  console.log(`  Theme Colors: ${result.theme.colorCount || 0}`);
  console.log(`  Pages: ${result.layout.pageCount || 0}`);

  if (result.comparison) {
    console.log('\n  Baseline Comparison');
    console.log(`  Matches: ${result.comparison.matches.length}`);
    console.log(`  Diffs: ${result.comparison.diffs.length}`);
    console.log(`  Missing: ${result.comparison.missing.length}`);
    console.log(`  Extra: ${result.comparison.extra.length}`);
  }

  if (result.consoleErrors.length > 0) {
    console.log('\n  Console Errors:');
    for (const err of result.consoleErrors.slice(0, 5)) {
      console.log(`    - ${err.slice(0, 80)}...`);
    }
  }

  console.log(`\n  Screenshots saved to: ${result.outputDir}\n`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(err => {
    console.error('Visual validation failed:', err);
    process.exit(1);
  });
}
