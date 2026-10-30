import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function publicRegistryOptions(name, cache) {
  const scope = name.startsWith('@') ? name.split('/')[0] : null;
  return [
    '--registry=https://registry.npmjs.org/',
    ...(scope ? [`--${scope}:registry=https://registry.npmjs.org/`] : []),
    '--offline=false',
    '--prefer-offline=false',
    '--prefer-online=true',
    `--cache=${cache}`,
    '--fetch-retries=0',
    '--fetch-timeout=10000',
  ];
}

const TRANSIENT = new Set([
  'EAI_AGAIN',
  'ENOTFOUND',
  'E500',
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ESOCKETTIMEDOUT',
  'E503',
  'E502',
  'E504',
  'E429',
]);
function errorCode(error) {
  for (const value of [error.stdout, error.stderr]) {
    const text = value?.toString?.() ?? '';
    try {
      const code = JSON.parse(text).error?.code;
      if (code) return code;
    } catch {
      /* npm may emit plain diagnostics */
    }
    const match = text.match(/npm (?:error|ERR!) code ([A-Z0-9_]+)/u);
    if (match) return match[1];
  }
  return error.code ?? 'UNKNOWN';
}

export function readPublicRegistryChecks(
  name,
  version,
  tag,
  { run = execFileSync, remainingMs = () => 30_000 } = {},
) {
  const checks = [];
  const query = (checkName, spec, field, validate) => {
    if (remainingMs() <= 0) {
      checks.push({
        name: checkName,
        status: 'pending',
        detail: 'Registry polling time budget exhausted.',
      });
      return;
    }
    let value;
    const cache = mkdtempSync(join(tmpdir(), 'decantr-registry-read-'));
    try {
      const output = run(
        'npm',
        ['view', spec, ...(field ? [field] : []), '--json', ...publicRegistryOptions(name, cache)],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: Math.max(1, Math.min(15_000, remainingMs())),
          maxBuffer: 5 * 1024 * 1024,
        },
      );
      value = JSON.parse(output);
    } catch (error) {
      const code = errorCode(error);
      const pending = code === 'E404' || TRANSIENT.has(code);
      checks.push({
        name: checkName,
        status: pending ? 'pending' : 'fail',
        detail: pending
          ? `Public registry query returned ${code}; visibility or availability is not established.`
          : `Public registry query failed (${code}); do not assume propagation.`,
      });
      return;
    } finally {
      rmSync(cache, { recursive: true, force: true });
    }
    try {
      checks.push({ name: checkName, ...validate(value) });
    } catch (error) {
      checks.push({ name: checkName, status: 'fail', detail: error.message });
    }
  };
  query('npm version exists', name, 'versions', (value) => {
    const versions = typeof value === 'string' ? [value] : value;
    if (!Array.isArray(versions) || !versions.every((v) => typeof v === 'string'))
      throw new Error('Malformed versions response.');
    return versions.includes(version)
      ? { status: 'pass', detail: `${name}@${version}` }
      : {
          status: 'pending',
          detail: `${version} is not yet visible in public registry versions; cause unconfirmed.`,
        };
  });
  if (checks.some((c) => c.status === 'fail')) return checks;
  query('npm dist-tag', name, 'dist-tags', (tags) => {
    if (
      !tags ||
      typeof tags !== 'object' ||
      Array.isArray(tags) ||
      Object.values(tags).some((v) => typeof v !== 'string')
    )
      throw new Error('Malformed dist-tags response.');
    return tags[tag] === version
      ? { status: 'pass', detail: `${tag} -> ${version}` }
      : {
          status: 'pending',
          detail: `${tag} points to ${tags[tag] ?? 'none'}, expected ${version}; registry consistency is unverified.`,
        };
  });
  if (checks.some((c) => c.status === 'fail')) return checks;
  query('published manifest', `${name}@${version}`, null, (manifest) => {
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest))
      throw new Error('Malformed published manifest.');
    if (manifest.name !== name || manifest.version !== version)
      throw new Error('Published manifest identity does not match the requested package/version.');
    for (const field of ['dependencies', 'peerDependencies', 'optionalDependencies']) {
      const dependencies = manifest[field];
      if (dependencies === undefined) continue;
      if (
        !dependencies ||
        typeof dependencies !== 'object' ||
        Array.isArray(dependencies) ||
        Object.values(dependencies).some((v) => typeof v !== 'string')
      )
        throw new Error(`Malformed ${field}.`);
      if (Object.values(dependencies).some((v) => v.startsWith('workspace:')))
        throw new Error(`Workspace protocol leaked in ${field}.`);
    }
    return { status: 'pass', detail: `${name}@${version}; dependency protocols checked` };
  });
  return checks;
}

export function verificationStatus(checks) {
  if (checks.some((c) => c.status === 'fail')) return 'fail';
  return checks.some((c) => c.status === 'pending') ? 'pending' : 'pass';
}

export async function retryVerification(
  verify,
  {
    attempts,
    delayMs,
    deadline,
    now = Date.now,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    onPending = () => {},
  },
) {
  const start = now();
  let result;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    result = verify(() => Math.max(0, deadline - now()));
    result.attempts = attempt;
    result.registryElapsedMs = Math.max(0, now() - start);
    if (result.status !== 'pending') return result;
    if (attempt === attempts || now() >= deadline) {
      result.waitExhausted = now() >= deadline ? 'time-limit' : 'attempt-limit';
      return result;
    }
    onPending(result);
    await sleep(Math.min(delayMs, Math.max(0, deadline - now())));
  }
  return result;
}
