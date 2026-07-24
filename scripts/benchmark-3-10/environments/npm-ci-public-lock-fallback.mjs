#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FALLBACKS = Object.freeze([
  {
    path: 'node_modules/@contentful/browserslist-config',
    version: '4.0.0',
    integrity:
      'sha512-Z4nx1Mpg+8jIsxEeqQ4b8ZPFTqRnm7k7QjBIRpMdrf0s84zCp2cvL8taTZdlPEYWd12Enfbq2WC1ws5BIe49PA==',
    staleResolved:
      'https://npm.pkg.github.com/download/@contentful/browserslist-config/4.0.0/b9d59ba05bd53918d3d8023e6729ee19928d127b',
    publicResolved:
      'https://registry.npmjs.org/@contentful/browserslist-config/-/browserslist-config-4.0.0.tgz',
  },
  {
    path: 'node_modules/@contentful/rich-text-react-renderer',
    version: '16.1.6',
    integrity:
      'sha512-Pt0KfEnB7UP53gUKupUZjsUCHR7CiDbVyMdMmuyzYT6lNvjR7+KKYWP9eU2TOfVaXy7PxF1XEpBjSALDOHUNKQ==',
    staleResolved:
      'https://npm.pkg.github.com/download/@contentful/rich-text-react-renderer/16.1.6/3ff14234631461b6a92a97e643a9b6db4be1458b',
    publicResolved:
      'https://registry.npmjs.org/@contentful/rich-text-react-renderer/-/rich-text-react-renderer-16.1.6.tgz',
  },
  {
    path: 'node_modules/@contentful/rich-text-types',
    version: '17.2.5',
    integrity:
      'sha512-EA5vTfROZePoPmSlqLVd+luL/ev8CjnI20y6vWFVPlLRxQbv4XytXRzatydPE63CqfsPylF7NCn2z8rTLhnWfg==',
    staleResolved:
      'https://npm.pkg.github.com/download/@contentful/rich-text-types/17.2.5/d8edc86fbbf0760a4533e28369ca07e08809d850',
    publicResolved:
      'https://registry.npmjs.org/@contentful/rich-text-types/-/rich-text-types-17.2.5.tgz',
  },
]);

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function rewriteKnownPublicTarballs(lockfileBytes) {
  const lockfile = JSON.parse(lockfileBytes.toString('utf8'));
  if (lockfile.lockfileVersion !== 3 || !lockfile.packages) {
    throw new Error('Forma fallback requires an npm lockfileVersion 3 package map');
  }
  const rewrites = [];
  for (const fallback of FALLBACKS) {
    const entry = lockfile.packages[fallback.path];
    if (!entry) throw new Error(`Missing locked fallback package: ${fallback.path}`);
    if (
      entry.version !== fallback.version ||
      entry.integrity !== fallback.integrity ||
      entry.resolved !== fallback.staleResolved
    ) {
      throw new Error(`Locked fallback package differs from the reviewed contract: ${fallback.path}`);
    }
    entry.resolved = fallback.publicResolved;
    rewrites.push({
      path: fallback.path,
      version: fallback.version,
      integrity: fallback.integrity,
      from: fallback.staleResolved,
      to: fallback.publicResolved,
    });
  }
  return {
    bytes: Buffer.from(`${JSON.stringify(lockfile, null, 2)}\n`, 'utf8'),
    rewrites,
  };
}

export function runPublicLockFallback(options = {}) {
  const cwd = resolve(options.cwd ?? process.cwd());
  const lockfilePath = resolve(cwd, 'package-lock.json');
  const originalBytes = readFileSync(lockfilePath);
  const rewritten = rewriteKnownPublicTarballs(originalBytes);
  let restored = false;
  const restore = () => {
    if (restored) return;
    writeFileSync(lockfilePath, originalBytes);
    restored = true;
  };
  const terminate = (signal) => {
    restore();
    process.kill(process.pid, signal);
  };
  const signalHandlers = new Map(
    ['SIGINT', 'SIGTERM'].map((signal) => [
      signal,
      () => terminate(signal),
    ]),
  );
  for (const [signal, handler] of signalHandlers) process.once(signal, handler);

  try {
    writeFileSync(lockfilePath, rewritten.bytes);
    const result = (options.spawn ?? spawnSync)('npm', ['ci'], {
      cwd,
      env: options.environment ?? process.env,
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      shell: false,
      stdio: options.stdio ?? 'inherit',
      timeout: options.timeoutMs ?? 7_000_000,
    });
    if (result.error) throw result.error;
    const exitCode = result.status ?? 1;
    if (exitCode !== 0) {
      throw new Error(`npm ci exited ${exitCode}`);
    }
    return {
      lockfileSha256: sha256(originalBytes),
      rewrittenLockfileSha256: sha256(rewritten.bytes),
      rewrites: rewritten.rewrites,
    };
  } finally {
    restore();
    for (const [signal, handler] of signalHandlers) process.off(signal, handler);
    if (!readFileSync(lockfilePath).equals(originalBytes)) {
      throw new Error('package-lock.json was not restored byte-for-byte');
    }
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const result = runPublicLockFallback();
    process.stdout.write(`${JSON.stringify(result)}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
