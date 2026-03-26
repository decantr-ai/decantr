import { parseArgs } from 'node:util';

const VERSION = '0.1.0';

const { positionals, values } = parseArgs({
  allowPositionals: true,
  strict: false,
  options: {
    version: { type: 'boolean', short: 'v', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
});
const command = values.version ? '--version' : values.help ? '--help' : positionals[0];

switch (command) {
  case 'init':
    await import('./commands/init.js').then((m) => m.run());
    break;

  case 'generate':
    await import('./commands/generate.js').then((m) => m.run());
    break;

  case 'validate':
    await import('./commands/validate.js').then((m) => m.run());
    break;

  case 'registry':
    await import('./commands/registry.js').then((m) => m.run());
    break;

  case 'mcp':
    console.log('MCP server is now a separate package: @decantr/mcp-server');
    console.log('Run: npx @decantr/mcp-server');
    break;

  case '--version':
  case '-v':
    console.log(VERSION);
    break;

  default:
    console.log(`
  \x1b[1mdecantr\x1b[0m v${VERSION} \x1b[2m— design intelligence for AI-generated apps\x1b[0m

  \x1b[1mCommands:\x1b[0m
    init          Create a new project (pick archetype, theme, framework target)
    generate      Generate code from decantr.essence.json
    validate      Validate decantr.essence.json against schema + guard rules
    registry      Community content (search, add, list)

  \x1b[1mUsage:\x1b[0m
    npx decantr init
    npx decantr generate [--target react|decantr] [--dry-run]
    npx decantr validate [path/to/essence.json]
    npx decantr registry search <query>
    npx decantr registry add <type>/<name>
    npx decantr registry list
`);
    break;
}
