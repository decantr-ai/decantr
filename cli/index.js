#!/usr/bin/env node

import { parseArgs } from 'node:util';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadPlugins, runHook } from '../src/plugins/index.js';

const { positionals } = parseArgs({ allowPositionals: true, strict: false });
const command = positionals[0];

// Load project config and plugins for commands that benefit from them
const cwd = process.cwd();
let _config = null;

async function getConfig() {
  if (_config) return _config;
  try {
    const raw = await readFile(join(cwd, 'decantr.config.json'), 'utf-8');
    _config = JSON.parse(raw);
  } catch {
    _config = {};
  }
  // Load plugins from config
  await loadPlugins(_config, { cwd });
  return _config;
}

switch (command) {
  case 'init':
    await import('./commands/init.js').then(m => m.run());
    break;
  case 'dev':
    await getConfig();
    await runHook('onDev', { cwd, command });
    await import('./commands/dev.js').then(m => m.run());
    break;
  case 'build':
    await getConfig();
    await runHook('onBuild', { cwd, command });
    await import('./commands/build.js').then(m => m.run());
    break;
  case 'test':
    await import('./commands/test.js').then(m => m.run());
    break;
  case 'validate':
    await import('./commands/validate.js').then(m => m.run());
    break;
  case 'lint':
    await import('./commands/lint.js').then(m => m.run());
    break;
  case 'a11y':
    await import('./commands/a11y.js').then(m => m.run());
    break;
  case 'audit':
    if (process.argv.includes('--a11y')) {
      await import('./commands/a11y.js').then(m => m.run());
    } else {
      await import('./commands/audit.js').then(m => m.run());
    }
    break;
  case 'generate':
    await getConfig();
    await runHook('onGenerate', { cwd, command });
    await import('./commands/generate.js').then(m => m.run());
    break;
  case 'mcp':
    await import('./commands/mcp.js').then(m => m.run());
    break;
  case 'figma:tokens':
    await import('./commands/figma-tokens.js').then(m => m.run());
    break;
  case 'figma:sync':
    await import('./commands/figma-sync.js').then(m => m.run());
    break;
  case 'migrate':
    await import('./commands/migrate.js').then(m => m.run());
    break;
  case 'age':
    await import('./commands/age.js').then(m => m.run());
    break;
  case 'doctor':
    await import('./commands/doctor.js').then(m => m.run());
    break;
  case 'registry':
    await import('./commands/registry.js').then(m => m.run());
    break;
  case 'cellar':
    await import('./commands/cellar.js').then(m => m.run());
    break;
  case 'compile-context': {
    // Forward flags to compile-llm
    const compileArgs = process.argv.slice(3);
    // Flags are read from process.argv inside compile-llm.js
    await import('../tools/compile-llm.js');
    break;
  }
  default: {
    const { art } = await import('./art.js');
    console.log(art());
    console.log(`
  \x1b[1mdecantr\x1b[0m v${(await import('../tools/version.js')).VERSION} \x1b[2m— AI-first web framework\x1b[0m

  \x1b[1mCommands:\x1b[0m
    init       Create a new decantr project
    dev        Start development server
    build      Build for production
    test       Run tests
    validate   Validate decantr.essence.json
    lint       Code quality gates (atoms, essence drift, inline styles)
    generate   Generate code from decantr.essence.json
    a11y       Accessibility audit (8 WCAG rules, static analysis)
    audit      Audit project: framework coverage, quality, bundle size
    mcp        Start MCP server (stdio transport) for AI tool integration
    migrate    Migrate decantr.essence.json between versions
    age        Full version upgrade (essence + config + AI-guided source updates)
    figma:tokens  Export design tokens in W3C DTCG / Figma format
    registry   Community content registry (search, add, remove, update, list, publish)
    doctor     Check project health and environment
    cellar     Inventory sub-projects and check health [--fix] [--link] [--json]
    compile-context  Compile LLM task profiles from reference docs [--only=<profiles>] [--watch]
    figma:sync    Push tokens to Figma file via REST API

  \x1b[1mUsage:\x1b[0m
    npx decantr init
    npx decantr dev
    npx decantr build
    npx decantr test [--watch]
    npx decantr generate [--force] [--dry-run] [--page <id>]
    npx decantr migrate [--dry-run] [--target=<version>]
    npx decantr age [--dry-run] [--to=<version>] [--report] [--skip-profile]
    npx decantr cellar [--fix] [--link] [--json]
`);
    break;
  }
}
