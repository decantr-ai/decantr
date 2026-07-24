#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import { parseAdapterArgs, runAdapter } from './coding-agent-adapter.mjs';

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await runAdapter('anthropic', parseAdapterArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

