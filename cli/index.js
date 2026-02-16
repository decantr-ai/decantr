#!/usr/bin/env node

import { parseArgs } from 'node:util';

const { positionals } = parseArgs({ allowPositionals: true, strict: false });
const command = positionals[0];

switch (command) {
  case 'init':
    await import('./commands/init.js').then(m => m.run());
    break;
  case 'dev':
    await import('./commands/dev.js').then(m => m.run());
    break;
  case 'build':
    await import('./commands/build.js').then(m => m.run());
    break;
  case 'test':
    await import('./commands/test.js').then(m => m.run());
    break;
  default:
    console.log(`
  decantr v0.1.0 — AI-first web framework

  Commands:
    init     Create a new decantr project
    dev      Start development server
    build    Build for production
    test     Run tests

  Usage:
    npx decantr init
    npx decantr dev
    npx decantr build
    npx decantr test [--watch]
`);
    break;
}
