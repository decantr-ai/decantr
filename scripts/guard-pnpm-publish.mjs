const userAgent = process.env.npm_config_user_agent ?? '';
const execPath = process.env.npm_execpath ?? '';
const isPnpm = /\bpnpm\//.test(userAgent) || /pnpm/i.test(execPath);

if (!isPnpm) {
  console.error('Decantr packages must be published with pnpm publish or scripts/publish-packages.mjs.');
  console.error('npm publish does not rewrite workspace:* dependency ranges before upload.');
  process.exit(1);
}
