import { getApiKeyOrToken } from '../auth.js';
import { getCliTelemetryIdentityStatus, isOptedIn, optIn } from '../telemetry.js';

const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
const DEFAULT_API_URL = 'https://api.decantr.ai/v1';

interface TelemetryCommandOptions {
  apiKey?: string;
  apiUrl?: string;
  enable?: boolean;
  json?: boolean;
  label?: string;
  org?: string;
}

export async function cmdTelemetry(
  args: string[],
  projectRoot: string = process.cwd(),
): Promise<void> {
  const subcommand = args[0] ?? 'status';
  const options = parseTelemetryOptions(args.slice(1));

  if (subcommand === '--help' || subcommand === '-h' || subcommand === 'help') {
    printTelemetryHelp();
    return;
  }

  if (subcommand === 'status') {
    printTelemetryStatus(projectRoot, options);
    return;
  }

  if (subcommand === 'link') {
    await linkTelemetryIdentity(projectRoot, options);
    return;
  }

  throw new Error(`Unknown telemetry command: ${subcommand}`);
}

function printTelemetryHelp(): void {
  console.log(`
${BOLD}decantr telemetry${RESET} — Inspect and link privacy-filtered CLI telemetry identity

${BOLD}Usage:${RESET}
  decantr telemetry status [--json]
  decantr telemetry link [--enable] [--org <slug>] [--label <label>] [--api-key <key>] [--api-url <url>]

${BOLD}Examples:${RESET}
  decantr init --telemetry
  decantr telemetry status
  decantr login --api-key=<your-key>
  decantr telemetry link --org my-team --label "CI runner"
`);
}

function printTelemetryStatus(projectRoot: string, options: TelemetryCommandOptions): void {
  const status = getCliTelemetryIdentityStatus(projectRoot, { create: false });

  if (options.json) {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  console.log(`\n${BOLD}Decantr telemetry${RESET}`);
  console.log(`  Enabled:    ${status.enabled ? `${GREEN}yes${RESET}` : 'no'}`);
  console.log(`  Project:    ${status.hasProjectConfig ? status.projectRoot : 'not initialized'}`);
  console.log(`  Install ID: ${status.installId ?? `${DIM}not created yet${RESET}`}`);
  console.log(`  Project ID: ${status.projectId ?? `${DIM}not created yet${RESET}`}`);
  if (status.enabled) {
    console.log(
      DIM +
        'Run `decantr telemetry link` after login to attach these opaque IDs to your Decantr account/org.' +
        RESET,
    );
  } else {
    console.log(DIM + 'Run `decantr init --telemetry` or `decantr telemetry link --enable` to opt in.' + RESET);
  }
}

async function linkTelemetryIdentity(
  projectRoot: string,
  options: TelemetryCommandOptions,
): Promise<void> {
  if (options.enable && !isOptedIn(projectRoot)) {
    optIn(projectRoot);
  }

  if (!isOptedIn(projectRoot)) {
    throw new Error('This project has not opted into telemetry. Re-run with --enable or use `decantr init --telemetry`.');
  }

  const identity = getCliTelemetryIdentityStatus(projectRoot, { create: true });
  if (!identity.installId && !identity.projectId) {
    throw new Error('No telemetry identity could be created for this project.');
  }

  const apiKey = options.apiKey ?? getApiKeyOrToken();
  if (!apiKey) {
    throw new Error('Run `decantr login --api-key=<key>` or pass `--api-key <key>` before linking telemetry.');
  }

  const apiUrl = trimTrailingSlashes(options.apiUrl ?? process.env.DECANTR_API_URL ?? DEFAULT_API_URL);
  const response = await fetch(`${apiUrl}/me/telemetry-link`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      install_id: identity.installId,
      project_id: identity.projectId,
      org_slug: options.org,
      label: options.label,
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error ?? `Telemetry link failed with HTTP ${response.status}.`);
  }

  const body = await response.json().catch(() => ({ linked: 0 })) as { linked?: number };
  console.log(`${GREEN}Telemetry identity linked.${RESET}`);
  console.log(`  Linked:     ${body.linked ?? 0}`);
  console.log(`  Install ID: ${identity.installId ?? `${DIM}none${RESET}`}`);
  console.log(`  Project ID: ${identity.projectId ?? `${DIM}none${RESET}`}`);
  if (options.org) console.log(`  Org:        ${CYAN}${options.org}${RESET}`);
  console.log(DIM + 'These opaque IDs now attribute opted-in CLI usage to your Decantr account/org.' + RESET);
}

function parseTelemetryOptions(args: string[]): TelemetryCommandOptions {
  const options: TelemetryCommandOptions = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--enable') {
      options.enable = true;
    } else if (arg === '--json') {
      options.json = true;
    } else if (arg === '--org' && args[i + 1]) {
      options.org = args[++i];
    } else if (arg.startsWith('--org=')) {
      options.org = arg.slice('--org='.length);
    } else if (arg === '--label' && args[i + 1]) {
      options.label = args[++i];
    } else if (arg.startsWith('--label=')) {
      options.label = arg.slice('--label='.length);
    } else if (arg === '--api-key' && args[i + 1]) {
      options.apiKey = args[++i];
    } else if (arg.startsWith('--api-key=')) {
      options.apiKey = arg.slice('--api-key='.length);
    } else if (arg === '--api-url' && args[i + 1]) {
      options.apiUrl = args[++i];
    } else if (arg.startsWith('--api-url=')) {
      options.apiUrl = arg.slice('--api-url='.length);
    }
  }
  return options;
}

function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value.charCodeAt(end - 1) === 47) end -= 1;
  return value.slice(0, end);
}
