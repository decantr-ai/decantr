#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const jsonOutput = args.has('--json');
const keep = args.has('--keep');
const skipBuild = args.has('--skip-build');
const workDir = mkdtempSync(join(tmpdir(), 'decantr-packed-mcp-'));
const tarballDir = join(workDir, 'tarballs');
const installDir = join(workDir, 'consumer');
const extractDir = join(workDir, 'extract');
const packageNames = [
  '@decantr/essence-spec',
  '@decantr/content',
  '@decantr/core',
  '@decantr/verifier',
  '@decantr/mcp-server',
];
const expectedTools = [
  'decantr_project',
  'decantr_contract',
  'decantr_context',
  'decantr_graph',
  'decantr_registry',
  'decantr_verify',
  'decantr_repair',
  'decantr_contract_write',
];
const forbiddenRuntimePackages = ['@modelcontextprotocol/sdk', '@hono/node-server'];
const dependencyFields = ['dependencies', 'optionalDependencies', 'peerDependencies'];

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? root,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(
      [
        `${command} ${commandArgs.join(' ')} exited ${result.status ?? 'without status'}.`,
        result.stdout?.trim(),
        result.stderr?.trim(),
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
  return result.stdout;
}

function parsePackOutput(output) {
  const parsed = JSON.parse(output.trim());
  const value = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!value?.filename || typeof value.filename !== 'string') {
    throw new Error('pnpm pack did not report a tarball filename.');
  }
  return value;
}

function sha256File(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [path];
  });
}

function assertNoWorkspaceDependencies(manifest) {
  for (const field of [...dependencyFields, 'devDependencies']) {
    for (const [name, version] of Object.entries(manifest[field] ?? {})) {
      if (typeof version === 'string' && version.startsWith('workspace:')) {
        throw new Error(`${manifest.name} packed manifest leaks ${field}.${name}=${version}.`);
      }
    }
  }
}

function assertMcpPackageBoundary(packageRoot, manifest) {
  for (const field of dependencyFields) {
    for (const name of forbiddenRuntimePackages) {
      if (Object.hasOwn(manifest[field] ?? {}, name)) {
        throw new Error(`Packed MCP manifest exposes ${name} through ${field}.`);
      }
    }
  }
  if (!Object.hasOwn(manifest.devDependencies ?? {}, '@modelcontextprotocol/sdk')) {
    throw new Error('Packed MCP manifest no longer records the SDK as a build-only dependency.');
  }
  for (const requiredFile of ['server.json', 'THIRD_PARTY_NOTICES.md']) {
    if (!existsSync(join(packageRoot, requiredFile))) {
      throw new Error(`Packed MCP package is missing ${requiredFile}.`);
    }
  }

  const javascript = listFiles(join(packageRoot, 'dist')).filter(
    (path) => extname(path) === '.js',
  );
  if (javascript.length === 0) throw new Error('Packed MCP package contains no JavaScript runtime.');
  for (const path of javascript) {
    const source = readFileSync(path, 'utf8');
    if (/^\s*import(?:[^'"\n]*?from\s*)?['"]@modelcontextprotocol\/sdk/imu.test(source)) {
      throw new Error(`Packed MCP runtime leaves the SDK external in ${basename(path)}.`);
    }
    if (source.includes('@hono/node-server')) {
      throw new Error(`Packed MCP runtime contains @hono/node-server in ${basename(path)}.`);
    }
  }
}

function collectDependencyNames(tree, names = new Set()) {
  for (const [name, dependency] of Object.entries(tree?.dependencies ?? {})) {
    names.add(name);
    collectDependencyNames(dependency, names);
  }
  return names;
}

async function probeMcp(entryPath, expectedVersion) {
  const child = spawn(process.execPath, [entryPath], {
    cwd: installDir,
    env: {
      ...process.env,
      DECANTR_OFFLINE: 'true',
      DECANTR_API_URL: 'http://127.0.0.1:9',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  let nextId = 1;
  let stdoutBuffer = '';
  let stderrBuffer = '';
  let exited = false;
  const pending = new Map();
  const failPending = (error) => {
    for (const pendingRequest of pending.values()) {
      clearTimeout(pendingRequest.timer);
      pendingRequest.reject(error);
    }
    pending.clear();
  };
  const exitPromise = new Promise((resolveExit) => {
    child.once('close', (code, signal) => {
      exited = true;
      const detail = stderrBuffer.trim();
      failPending(
        new Error(
          `MCP server exited before completing the audit (${signal ?? code})${detail ? `: ${detail}` : ''}`,
        ),
      );
      resolveExit();
    });
  });
  child.once('error', failPending);
  child.stdin.once('error', failPending);
  child.stderr.on('data', (chunk) => {
    stderrBuffer += chunk;
  });
  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk;
    while (true) {
      const newline = stdoutBuffer.indexOf('\n');
      if (newline < 0) break;
      const line = stdoutBuffer.slice(0, newline).replace(/\r$/u, '');
      stdoutBuffer = stdoutBuffer.slice(newline + 1);
      if (!line.trim()) continue;
      let message;
      try {
        message = JSON.parse(line);
      } catch (error) {
        failPending(new Error(`Invalid MCP JSON response: ${error.message}`));
        continue;
      }
      if (!Object.hasOwn(message, 'id')) continue;
      const pendingRequest = pending.get(message.id);
      if (!pendingRequest) continue;
      pending.delete(message.id);
      clearTimeout(pendingRequest.timer);
      if (message.error) {
        pendingRequest.reject(
          new Error(`MCP ${pendingRequest.method} failed: ${JSON.stringify(message.error)}`),
        );
      } else {
        pendingRequest.resolve(message.result);
      }
    }
  });

  const send = (message) => {
    child.stdin.write(`${JSON.stringify(message)}\n`);
  };
  const request = (method, params = {}) => {
    const id = nextId++;
    return new Promise((resolveRequest, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`MCP ${method} timed out.`));
      }, 15_000);
      pending.set(id, { method, resolve: resolveRequest, reject, timer });
      send({ jsonrpc: '2.0', id, method, params });
    });
  };

  try {
    const initialized = await request('initialize', {
      protocolVersion: '2025-11-25',
      capabilities: {},
      clientInfo: { name: 'decantr-packed-mcp-audit', version: '1.0.0' },
    });
    if (initialized?.serverInfo?.name !== 'decantr') {
      throw new Error(`Packed MCP server name drifted: ${initialized?.serverInfo?.name ?? 'missing'}.`);
    }
    if (initialized?.serverInfo?.version !== expectedVersion) {
      throw new Error(
        `Packed MCP server version drifted: ${initialized?.serverInfo?.version ?? 'missing'} != ${expectedVersion}.`,
      );
    }
    send({ jsonrpc: '2.0', method: 'notifications/initialized', params: {} });

    const listed = await request('tools/list');
    const names = (listed?.tools ?? []).map((tool) => tool.name);
    if (JSON.stringify(names) !== JSON.stringify(expectedTools)) {
      throw new Error(`Packed MCP tool surface drifted: ${JSON.stringify(names)}.`);
    }

    const stateResult = await request('tools/call', {
      name: 'decantr_project',
      arguments: { action: 'state', project_path: installDir },
    });
    if (stateResult?.isError) throw new Error('Packed MCP local project-state call failed.');
    const text = stateResult?.content?.find((entry) => entry.type === 'text')?.text;
    const payload = JSON.parse(text ?? '{}');
    if (
      payload.source !== 'local_workspace' ||
      payload.adoption_truth?.$schema !== 'https://decantr.ai/schemas/adoption-truth.v1.json'
    ) {
      throw new Error('Packed MCP local project-state response is malformed.');
    }
    return {
      serverVersion: initialized.serverInfo.version,
      toolCount: names.length,
      localProjectState: true,
    };
  } finally {
    if (!child.stdin.destroyed) child.stdin.end();
    await Promise.race([
      exitPromise,
      new Promise((resolveDelay) => setTimeout(resolveDelay, 1_000)),
    ]);
    if (!exited) child.kill();
  }
}

let summary;
try {
  mkdirSync(tarballDir, { recursive: true });
  mkdirSync(installDir, { recursive: true });
  mkdirSync(extractDir, { recursive: true });

  if (!skipBuild) {
    run('pnpm', [
      '--filter',
      '@decantr/essence-spec',
      '--filter',
      '@decantr/content',
      '--filter',
      '@decantr/core',
      '--filter',
      '@decantr/verifier',
      '--filter',
      '@decantr/mcp-server',
      'build',
    ]);
  }

  const packed = [];
  let mcpManifest;
  for (const name of packageNames) {
    const pack = parsePackOutput(
      run('pnpm', ['--filter', name, 'pack', '--pack-destination', tarballDir, '--json']),
    );
    const tarballPath = resolve(pack.filename);
    if (!existsSync(tarballPath)) throw new Error(`Missing packed tarball for ${name}: ${tarballPath}`);
    const packageExtractDir = join(extractDir, name.replace('@decantr/', ''));
    mkdirSync(packageExtractDir, { recursive: true });
    run('tar', ['-xzf', tarballPath, '-C', packageExtractDir]);
    const packageRoot = join(packageExtractDir, 'package');
    const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8'));
    if (manifest.name !== name) throw new Error(`Packed name mismatch for ${name}.`);
    assertNoWorkspaceDependencies(manifest);
    if (name === '@decantr/mcp-server') {
      mcpManifest = manifest;
      assertMcpPackageBoundary(packageRoot, manifest);
    }
    packed.push({
      name,
      version: manifest.version,
      tarballPath,
      tarball: basename(tarballPath),
      sha256: sha256File(tarballPath),
      files: Array.isArray(pack.files) ? pack.files.length : 0,
    });
  }
  if (!mcpManifest) throw new Error('MCP package was not packed.');

  writeFileSync(
    join(installDir, 'package.json'),
    `${JSON.stringify({ name: 'decantr-packed-mcp-consumer', private: true, type: 'module' }, null, 2)}\n`,
    'utf8',
  );
  run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--package-lock=false',
      ...packed.map((entry) => entry.tarballPath),
    ],
    { cwd: installDir },
  );
  const dependencyTree = JSON.parse(run('npm', ['ls', '--all', '--json'], { cwd: installDir }));
  const installedNames = collectDependencyNames(dependencyTree);
  for (const name of forbiddenRuntimePackages) {
    if (installedNames.has(name)) {
      throw new Error(`Clean MCP consumer installed forbidden runtime package ${name}.`);
    }
  }

  const probe = await probeMcp(
    join(installDir, 'node_modules', '@decantr', 'mcp-server', 'dist', 'index.js'),
    mcpManifest.version,
  );
  summary = { status: 'pass', workDir: keep ? workDir : null, packed, probe };
} catch (cause) {
  summary = {
    status: 'fail',
    workDir,
    error: cause instanceof Error ? cause.message : String(cause),
  };
} finally {
  if (!keep && summary?.status === 'pass') rmSync(workDir, { recursive: true, force: true });
}

if (jsonOutput) console.log(JSON.stringify(summary, null, 2));
else if (summary.status === 'pass') {
  const mcp = summary.packed.find((entry) => entry.name === '@decantr/mcp-server');
  console.log('Packed MCP clean-consumer audit passed.');
  console.log(`- ${mcp.name}@${mcp.version}: ${mcp.files} files, sha256:${mcp.sha256}`);
  console.log('- runtime SDK/Hono packages installed: 0');
  console.log(`- MCP initialize: ${summary.probe.serverVersion}`);
  console.log(`- MCP tools/list: ${summary.probe.toolCount} tools`);
  console.log(`- local project-state probe: ${summary.probe.localProjectState ? 'pass' : 'fail'}`);
  if (summary.workDir) console.log(`- retained evidence: ${summary.workDir}`);
} else {
  console.error('Packed MCP clean-consumer audit failed:');
  console.error(summary.error);
  console.error(`Evidence retained at ${summary.workDir}`);
}

process.exit(summary.status === 'pass' ? 0 : 1);
