import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const userAgent = process.env.npm_config_user_agent ?? '';
const execPath = process.env.npm_execpath ?? '';
const isPnpm = /\bpnpm\//.test(userAgent) || /pnpm/i.test(execPath);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'));
const surface = JSON.parse(readFileSync(join(root, 'config', 'package-surface.json'), 'utf8'));
const releaseLane = Object.entries(surface.releaseLanes ?? {}).find(([line]) =>
  packageJson.version.startsWith(`${line}.`),
)?.[1];

if (!isPnpm) {
  console.error('Decantr packages must be published with pnpm publish or scripts/publish-packages.mjs.');
  console.error('npm publish does not rewrite workspace:* dependency ranges before upload.');
  process.exit(1);
}

if (releaseLane && process.env.DECANTR_PUBLISH_WRAPPER !== 'scripts/publish-packages.mjs') {
  console.error(
    `${packageJson.name}@${packageJson.version} must be published through scripts/publish-packages.mjs.`,
  );
  console.error('Direct pnpm publish is not an authorized entry point for the Decantr 3.9 release lane.');
  process.exit(1);
}
