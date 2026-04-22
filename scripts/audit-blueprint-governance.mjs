import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');
const contentRoot = process.env.DECANTR_CONTENT_DIR
  ? resolve(process.env.DECANTR_CONTENT_DIR)
  : resolve(repoRoot, '..', 'decantr-content');
const blueprintRoot = join(contentRoot, 'blueprints');

const PUBLIC_SIGNAL_TERMS = [
  'portfolio',
  'docs',
  'documentation',
  'knowledge',
  'content',
  'editorial',
  'blog',
  'newsletter',
  'reading',
];

const PRIVATE_SIGNAL_TERMS = [
  'dashboard',
  'admin',
  'workspace',
  'studio',
  'platform',
  'crm',
  'management',
  'ops',
  'analytics',
  'pipeline',
  'builder',
  'authoring',
  'publishing',
];

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizeTerms(value) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) =>
      typeof item === 'string'
        ? item
            .toLowerCase()
            .split(/[^a-z0-9]+/g)
            .filter(Boolean)
        : [],
    );
}

function hasAnyTerm(haystack, needles) {
  return needles.some((needle) => haystack.includes(needle));
}

function collectComposeIds(compose) {
  if (!Array.isArray(compose)) return [];
  return compose
    .map((entry) => (typeof entry === 'string' ? entry : entry?.archetype))
    .filter(Boolean);
}

function auditBlueprint(blueprint) {
  const composeIds = collectComposeIds(blueprint.compose);
  const routes = Object.entries(blueprint.routes ?? {});
  const routePaths = routes.map(([path]) => path);
  const authCompose = composeIds.filter((id) => /auth|settings/.test(id));
  const authRoutes = routePaths.filter((path) =>
    /login|register|forgot|reset|verify|mfa|phone|settings|account/.test(path),
  );

  if (authCompose.length === 0 && authRoutes.length === 0) {
    return null;
  }

  const terms = [
    ...normalizeTerms(blueprint.tags),
    ...normalizeTerms(blueprint.features),
  ];
  const publicSignals = hasAnyTerm(terms, PUBLIC_SIGNAL_TERMS);
  const privateSignals = hasAnyTerm(terms, PRIVATE_SIGNAL_TERMS);

  if (!publicSignals || privateSignals) {
    return null;
  }

  return {
    id: blueprint.id,
    publicSignals: PUBLIC_SIGNAL_TERMS.filter((term) => terms.includes(term)),
    privateSignals: PRIVATE_SIGNAL_TERMS.filter((term) => terms.includes(term)),
    authCompose,
    authRoutes,
  };
}

function main() {
  if (!existsSync(blueprintRoot)) {
    console.error(`Missing blueprint root: ${blueprintRoot}`);
    process.exit(1);
  }

  const findings = [];
  for (const file of readdirSync(blueprintRoot)) {
    if (!file.endsWith('.json')) continue;
    const blueprint = readJson(join(blueprintRoot, file));
    const finding = auditBlueprint(blueprint);
    if (finding) findings.push(finding);
  }

  console.log(
    JSON.stringify(
      {
        contentRoot,
        findings,
      },
      null,
      2,
    ),
  );

  if (findings.length > 0) {
    process.exitCode = 2;
  }
}

main();
