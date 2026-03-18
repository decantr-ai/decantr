import { resolve, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { discoverBottles, checkBottle, checkPortCollisions, fixBottle, linkBottle } from '../../tools/cellar-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frameworkRoot = resolve(__dirname, '..', '..');

// ── Color helpers ─────────────────────────────────────────────────
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

function statusIcon(results, collisionPorts) {
  const hasFail = results.some(r => r.status === 'fail');
  const hasWarn = results.some(r => r.status === 'warn');
  const hasCollision = collisionPorts.size > 0;
  const port = results.find(r => r.check === 'port')?.port;
  const portCollision = port && collisionPorts.has(port);

  if (hasFail) return 'fail';
  if (hasWarn || portCollision) return 'warn';
  return 'pass';
}

function getLinkStatus(results) {
  const cork = results.find(r => r.check === 'cork');
  if (!cork) return 'unknown';
  if (cork.status === 'pass') return 'linked';
  if (cork.status === 'warn' && cork.message.includes('npm-installed')) return 'npm';
  return 'missing';
}

function getVersion(bottle, results) {
  const dep = bottle.packageJson?.dependencies?.decantr
    || bottle.packageJson?.devDependencies?.decantr;
  if (!dep) return '?';
  if (dep.startsWith('file:')) return 'file:..';
  return dep.replace(/^[\^~>=<]+/, '');
}

function getPort(bottle) {
  return bottle.config?.dev?.port || null;
}

export async function run() {
  const { values } = parseArgs({
    strict: false,
    options: {
      fix: { type: 'boolean', default: false },
      link: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
    },
  });

  const pkg = JSON.parse(readFileSync(resolve(frameworkRoot, 'package.json'), 'utf-8'));
  const rootVersion = pkg.version;
  const bottles = await discoverBottles(frameworkRoot);

  if (bottles.length === 0) {
    if (values.json) {
      console.log(JSON.stringify({ bottles: [], issues: 0 }));
    } else {
      console.log(`\n  ${bold('decantr cellar')} ${dim('— no bottles found')}\n`);
    }
    return;
  }

  // ── Fix / Link mode ──
  if (values.fix || values.link) {
    console.log(`\n  ${bold('decantr cellar')} ${dim(values.fix ? '— fixing all bottles' : '— linking all bottles')}\n`);
    for (const bottle of bottles) {
      if (values.fix) {
        const actions = await fixBottle(bottle, frameworkRoot, rootVersion);
        console.log(`  ${green('✓')} ${bottle.relativePath.padEnd(30)} ${dim(actions.join(', '))}`);
      } else {
        await linkBottle(bottle, frameworkRoot);
        console.log(`  ${green('✓')} ${bottle.relativePath.padEnd(30)} ${dim('symlinked')}`);
      }
    }
    console.log(`\n  Done — ${bottles.length} bottle${bottles.length !== 1 ? 's' : ''} updated.\n`);
    return;
  }

  // ── Inventory mode ──
  const collisions = checkPortCollisions(bottles);
  const collisionPorts = new Set();
  for (const c of collisions) {
    collisionPorts.add(c.port);
  }

  const bottleResults = [];
  let healthy = 0;
  let issues = 0;

  for (const bottle of bottles) {
    const results = await checkBottle(bottle, frameworkRoot, rootVersion);
    const status = statusIcon(results, collisionPorts);
    if (status === 'pass') healthy++;
    else issues++;
    bottleResults.push({ bottle, results, status });
  }

  // ── JSON output ──
  if (values.json) {
    const output = {
      rootVersion,
      bottles: bottleResults.map(({ bottle, results, status }) => ({
        path: bottle.relativePath,
        name: bottle.name,
        status,
        version: getVersion(bottle),
        port: getPort(bottle),
        link: getLinkStatus(results),
        checks: results,
      })),
      collisions,
      healthy,
      issues,
    };
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  // ── Formatted output ──
  console.log(`\n  ${bold('decantr cellar')} ${dim(`— ${bottles.length} bottle${bottles.length !== 1 ? 's' : ''}`)}\n`);

  for (const { bottle, results, status } of bottleResults) {
    const linkStatus = getLinkStatus(results);
    const version = getVersion(bottle);
    const port = getPort(bottle);
    const portStr = port ? `:${port}` : '';

    let linkLabel;
    if (linkStatus === 'linked') linkLabel = green('linked');
    else if (linkStatus === 'npm') linkLabel = yellow('npm   ');
    else linkLabel = red('missing');

    let versionLabel;
    const vintageResult = results.find(r => r.check === 'vintage' && r.status === 'fail');
    if (vintageResult) versionLabel = red(`v${version}`);
    else versionLabel = dim(`v${version}`);

    const portLabel = port ? dim(portStr.padEnd(6)) : dim('      ');

    // Port collision warning
    const portWarn = port && collisionPorts.has(port) ? ` ${yellow('port collision')}` : '';

    // Essence warning
    const essenceWarn = results.find(r => r.check === 'essence' && r.status === 'warn');
    const essenceLabel = essenceWarn ? ` ${yellow('no essence version')}` : '';

    const statusPrefix = status === 'pass' ? green('✓')
      : status === 'warn' ? yellow('⚠')
      : red('✗');

    const path = (bottle.relativePath + '/').padEnd(30);
    console.log(`  ${statusPrefix} ${path} ${linkLabel}  ${versionLabel.padEnd(18)} ${portLabel}${portWarn}${essenceLabel}`);
  }

  console.log(`\n  ${healthy} healthy, ${issues} issue${issues !== 1 ? 's' : ''}\n`);
}
