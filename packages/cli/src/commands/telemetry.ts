import { resolve } from 'node:path';
import { getApiKeyOrToken } from '../auth.js';
import { getCliTelemetryIdentityStatus, optIn } from '../telemetry.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

const DEFAULT_API_URL = 'https://api.decantr.ai/v1';

interface TelemetryCommandOptions {
  apiKey?: string;
  apiUrl?: string;
  enable?: boolean;
  json?: boolean;
  label?: string;
  org?: string;
  project?: string;
}

function heading(text: string): string {
  return `\n${BOLD}${text}${RESET}\n`;
}

function success(text: string): string {
  return `${GREEN}${text}${RESET}`;
}

function dim(text: string): string {
  return `${DIM}${text}${RESET}`;
}

function warn(text: string): string {
  return `${YELLOW}${text}${RESET}`;
}

export function cmdTelemetryHelp(): void {
  console.log(`
${BOLD}decantr telemetry${RESET} — Inspect and link privacy-filtered CLI telemetry identity

${BOLD}Usage:${RESET}
  decantr telemetry status [--json]
  decantr telemetry link [--enable] [--org <slug>] [--label <label>] [--api-key <key>] [--api-url <url>]

${BOLD}Examples:${RESET}
  decantr init --telemetry
  decantr telemetry status
  decantr login --api-key=<your-key>
  decantr telemetry link --org my-team --label "MacBook Pro"
  decantr telemetry link --enable --api-key=<your-key>
`);
}

export async function cmdTelemetry(projectRoot: string, args: string[]): Promise<void> {
  const subcommand = args[1] ?? 'status';
  const options = parseTelemetryOptions(args.slice(2));
  const effectiveRoot = options.project ? resolve(projectRoot, options.project) : projectRoot;

  if (subcommand === 'help' || subcommand === '--help' || subcommand === '-h' || options.help) {
    cmdTelemetryHelp();
    return;
  }

  if (subcommand === 'status') {
    printStatus(effectiveRoot, options);
    return;
  }

  if (subcommand === 'link') {
    await linkTelemetryIdentity(effectiveRoot, options);
    return;
  }

  throw new Error(`Unknown telemetry command: ${subcommand}`);
}

function printStatus(projectRoot: string, options: TelemetryCommandOptions & { help?: boolean }) {
  const status = getCliTelemetryIdentityStatus(projectRoot, { create: false });

  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(heading('Decantr Telemetry'));
  console.log(`  Project:      ${status.projectRoot}`);
  console.log(`  Opted in:     ${status.enabled ? success('yes') : warn('no')}`);
  console.log(`  Install ID:   ${status.installId ?? dim('not created yet')}`);
  console.log(`  Project ID:   ${status.projectId ?? dim('not created yet')}`);
  console.log('');
  if (status.enabled) {
    console.log(
      dim('Run `decantr telemetry link` after login to attach these opaque IDs to your Decantr account/org.'),
    );
  } else {
    console.log(dim('Run `decantr init --telemetry` or `decantr telemetry link --enable` to opt in.'));
  }
}

async function linkTelemetryIdentity(projectRoot: string, options: TelemetryCommandOptions & { help?: boolean }) {
  if (options.enable) {
    optIn(projectRoot);
  }

  const status = getCliTelemetryIdentityStatus(projectRoot, { create: true });
  if (!status.enabled) {
    throw new Error('This project has not opted into telemetry. Re-run with --enable or use `decantr init --telemetry`.');
  }
  if (!status.installId && !status.projectId) {
    throw new Error('No telemetry identity could be created for this project.');
  }

  const token = options.apiKey ?? getApiKeyOrToken();
  if (!token) {
    throw new Error('Missing Decantr API key. Run `decantr login --api-key=<key>` or pass --api-key <key>.');
  }

  const apiUrl = normalizeApiUrl(
    options.apiUrl ?? process.env.DECANTR_API_URL ?? DEFAULT_API_URL,
  );
  const response = await fetch(`${apiUrl}/me/telemetry-link`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({
      install_id: status.installId,
      project_id: status.projectId,
      org_slug: options.org,
      label: options.label,
    }),
  });
  const text = await response.text();
  const body = text ? parseJson(text) : {};

  if (!response.ok) {
    const detail = typeof body === 'object' && body !== null && 'error' in body
      ? String((body as { error?: unknown }).error)
      : text.slice(0, 600);
    throw new Error(`Telemetry identity link failed: ${detail || response.statusText}`);
  }

  if (options.json) {
    console.log(JSON.stringify(body, null, 2));
    return;
  }

  const aliases = Array.isArray((body as { aliases?: unknown[] }).aliases)
    ? (body as { aliases: unknown[] }).aliases
    : [];
  console.log(success('\nTelemetry identity linked.\n'));
  console.log(`  Install ID: ${status.installId ?? dim('none')}`);
  console.log(`  Project ID: ${status.projectId ?? dim('none')}`);
  if (options.org) console.log(`  Organization: ${options.org}`);
  console.log(`  Aliases linked: ${aliases.length}`);
  console.log('');
  console.log(dim(`These opaque IDs now attribute opted-in CLI usage to your account in Decantr telemetry.`));
}

function parseTelemetryOptions(args: string[]): TelemetryCommandOptions & { help?: boolean } {
  const options: TelemetryCommandOptions & { help?: boolean } = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--enable') {
      options.enable = true;
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice('--api-key='.length);
    } else if (arg === '--api-key' && args[i + 1]) {
      options.apiKey = args[++i];
    } else if (arg.startsWith('--api-url=')) {
      options.apiUrl = arg.slice('--api-url='.length);
    } else if (arg === '--api-url' && args[i + 1]) {
      options.apiUrl = args[++i];
    } else if (arg.startsWith('--org=')) {
      options.org = arg.slice('--org='.length);
    } else if (arg === '--org' && args[i + 1]) {
      options.org = args[++i];
    } else if (arg.startsWith('--label=')) {
      options.label = arg.slice('--label='.length);
    } else if (arg === '--label' && args[i + 1]) {
      options.label = args[++i];
    } else if (arg.startsWith('--project=')) {
      options.project = arg.slice('--project='.length);
    } else if (arg === '--project' && args[i + 1]) {
      options.project = args[++i];
    }
  }
  return options;
}

function authHeaders(token: string): Record<string, string> {
  if (token.startsWith('dctr_')) {
    return {
      'Content-Type': 'application/json',
      'X-API-Key': token,
    };
  }

  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function normalizeApiUrl(value: string): string {
  return value.replace(/\/+$/, '');
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}
