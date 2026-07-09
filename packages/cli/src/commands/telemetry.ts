import { DECANTR_TELEMETRY_EVENT_CATALOG } from '@decantr/telemetry';
import { getApiKeyOrToken } from '../auth.js';
import { getCliTelemetryIdentityStatus, isOptedIn, optIn } from '../telemetry.js';

const BOLD = '\x1b[1m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';
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

  if (subcommand === 'explain') {
    printTelemetryExplain(projectRoot, options);
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
${BOLD}decantr telemetry${RESET} — Inspect caller-configured private CLI telemetry

${BOLD}Usage:${RESET}
  decantr telemetry status [--json]
  decantr telemetry explain [--json]
  decantr telemetry link [--enable] [--org <slug>] [--label <label>] [--api-key <key>] [--api-url <url>]

${BOLD}Examples:${RESET}
  DECANTR_TELEMETRY_ENDPOINT=https://telemetry.example/v1/events decantr init --telemetry
  decantr telemetry status
  decantr telemetry explain
  decantr telemetry link --api-url https://telemetry.example/v1 --api-key <key> --org my-team

Decantr does not operate a hosted telemetry sink. Delivery and identity linking are
available only for caller-configured private infrastructure.
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
  console.log(
    `  Delivery:   ${status.endpointConfigured ? `${GREEN}configured${RESET}` : `${DIM}inactive${RESET}`}`,
  );
  if (status.endpoint) console.log(`  Endpoint:   ${status.endpoint}`);
  console.log(`  Project:    ${status.hasProjectConfig ? status.projectRoot : 'not initialized'}`);
  console.log(`  Install ID: ${status.installId ?? `${DIM}not created yet${RESET}`}`);
  console.log(`  Project ID: ${status.projectId ?? `${DIM}not created yet${RESET}`}`);
  if (status.enabled && status.endpointConfigured) {
    console.log(
      DIM + 'Events can be sent only to the caller-configured endpoint shown above.' + RESET,
    );
  } else if (status.enabled) {
    console.log(
      DIM +
        'The local preference is enabled, but no events are sent until DECANTR_TELEMETRY_ENDPOINT is configured.' +
        RESET,
    );
  } else {
    console.log(
      DIM +
        'Run `decantr init --telemetry` or `decantr telemetry link --enable` to opt in.' +
        RESET,
    );
  }
}

function printTelemetryExplain(projectRoot: string, options: TelemetryCommandOptions): void {
  const status = getCliTelemetryIdentityStatus(projectRoot, { create: false });
  const cliEvents = DECANTR_TELEMETRY_EVENT_CATALOG.filter((entry) =>
    entry.allowedSources.includes('cli'),
  ).map((entry) => ({
    name: entry.name,
    bucket: entry.bucket,
    privacy: entry.privacy,
    publicIngest: entry.publicIngest,
    notes: entry.privacyNotes,
  }));
  const report = {
    source: 'cli',
    enabled: status.enabled,
    delivery: status.endpointConfigured ? 'caller-configured' : 'inactive',
    hasProjectConfig: status.hasProjectConfig,
    identifiers: {
      installId: status.installId ?? null,
      projectId: status.projectId ?? null,
      meaning:
        'Opaque Decantr-generated ids used only when this project has opted into CLI telemetry.',
    },
    endpoint: status.endpoint ?? null,
    events: cliEvents,
    aggregateFields: [
      'command name',
      'success or failure',
      'duration',
      'workflow and adoption mode',
      'project scope',
      'content source',
      'aggregate analyze counts',
      'Project Health status, score, and finding counts',
      'CI gate outcome',
      'Studio start and refresh activity',
      'remediation prompt request outcome',
    ],
    neverCollected: [
      'source code',
      'prompt text',
      'local file paths',
      'repository names',
      'emails',
      'secrets',
      'raw route names',
      'private package slugs',
      'health report bodies',
      'finding evidence',
    ],
    controls: {
      optIn:
        'Run decantr init --telemetry, decantr new --telemetry, or decantr telemetry link --enable.',
      optOut: 'Set "telemetry": false in .decantr/project.json.',
      delivery:
        'Set DECANTR_TELEMETRY_ENDPOINT to a caller-controlled private event sink. Decantr has no hosted telemetry sink.',
      link: 'Private deployments may run decantr telemetry link with --api-url and --api-key to attach opaque ids.',
    },
  };

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(`\n${BOLD}Decantr telemetry explanation${RESET}`);
  console.log(`  Source:     cli`);
  console.log(`  Enabled:    ${status.enabled ? `${GREEN}yes${RESET}` : 'no'}`);
  console.log(`  Delivery:   ${report.delivery}`);
  if (status.endpoint) console.log(`  Endpoint:   ${status.endpoint}`);
  console.log(`  Install ID: ${status.installId ?? `${DIM}not created yet${RESET}`}`);
  console.log(`  Project ID: ${status.projectId ?? `${DIM}not created yet${RESET}`}`);
  console.log(`  Events:     ${cliEvents.length} CLI event types in the public catalog`);
  console.log(`\n${BOLD}Aggregate fields${RESET}`);
  for (const field of report.aggregateFields) {
    console.log(`  - ${field}`);
  }
  console.log(`\n${BOLD}Never collected${RESET}`);
  for (const field of report.neverCollected) {
    console.log(`  - ${field}`);
  }
  console.log(`\n${DIM}${report.controls.optOut}${RESET}`);
  console.log(`${DIM}${report.controls.delivery}${RESET}`);
  console.log(`${DIM}${report.controls.link}${RESET}`);
}

async function linkTelemetryIdentity(
  projectRoot: string,
  options: TelemetryCommandOptions,
): Promise<void> {
  const configuredApiUrl = options.apiUrl ?? process.env.DECANTR_TELEMETRY_IDENTITY_API_URL?.trim();
  if (!configuredApiUrl) {
    throw new Error(
      'Decantr hosted telemetry identity linking is retired. Private deployments must pass --api-url or set DECANTR_TELEMETRY_IDENTITY_API_URL.',
    );
  }
  const apiUrl = normalizePrivateApiUrl(configuredApiUrl);

  const apiKey = options.apiKey ?? getApiKeyOrToken();
  if (!apiKey) {
    throw new Error('Pass --api-key <key> for the caller-configured private telemetry API.');
  }

  if (options.enable && !isOptedIn(projectRoot)) {
    optIn(projectRoot);
  }

  if (!isOptedIn(projectRoot)) {
    throw new Error(
      'This project has not opted into telemetry. Re-run with --enable or use `decantr init --telemetry`.',
    );
  }

  const identity = getCliTelemetryIdentityStatus(projectRoot, { create: true });
  if (!identity.installId && !identity.projectId) {
    throw new Error('No telemetry identity could be created for this project.');
  }

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
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Telemetry link failed with HTTP ${response.status}.`);
  }

  const body = (await response.json().catch(() => ({ linked: 0 }))) as { linked?: number };
  console.log(`${GREEN}Telemetry identity linked.${RESET}`);
  console.log(`  Linked:     ${body.linked ?? 0}`);
  console.log(`  Install ID: ${identity.installId ?? `${DIM}none${RESET}`}`);
  console.log(`  Project ID: ${identity.projectId ?? `${DIM}none${RESET}`}`);
  if (options.org) console.log(`  Org:        ${CYAN}${options.org}${RESET}`);
  console.log(
    DIM + 'These opaque IDs now attribute opted-in CLI usage to your Decantr account/org.' + RESET,
  );
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

function normalizePrivateApiUrl(value: string): string {
  const normalized = trimTrailingSlashes(value.trim());
  try {
    const url = new URL(normalized);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error();
  } catch {
    throw new Error('Telemetry identity API URL must be an absolute HTTP(S) URL.');
  }
  return normalized;
}
