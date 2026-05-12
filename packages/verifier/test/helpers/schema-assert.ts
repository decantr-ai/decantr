import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

function readJson(path: URL) {
  return JSON.parse(readFileSync(path, 'utf-8')) as Record<string, unknown>;
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

addFormats(ajv);

const schemaPaths = [
  new URL('../../schema/verification-report.common.v1.json', import.meta.url),
  new URL('../../schema/project-audit-report.v1.json', import.meta.url),
  new URL('../../schema/project-health-report.v1.json', import.meta.url),
  new URL('../../schema/evidence-bundle.v1.json', import.meta.url),
  new URL('../../schema/workspace-health-report.v1.json', import.meta.url),
  new URL('../../schema/file-critique-report.v1.json', import.meta.url),
  new URL('../../schema/showcase-shortlist-report.v1.json', import.meta.url),
  new URL('../../../core/schema/execution-pack.common.v1.json', import.meta.url),
  new URL('../../../core/schema/pack-manifest.v1.json', import.meta.url),
  new URL('../../../core/schema/review-pack.v1.json', import.meta.url),
  new URL('../../../essence-spec/schema/essence.v4.json', import.meta.url),
];

for (const path of schemaPaths) {
  ajv.addSchema(readJson(path));
}

const schemaMap = {
  'project-audit-report.v1.json': 'https://decantr.ai/schemas/project-audit-report.v1.json',
  'project-health-report.v1.json': 'https://decantr.ai/schemas/project-health-report.v1.json',
  'evidence-bundle.v1.json': 'https://decantr.ai/schemas/evidence-bundle.v1.json',
  'workspace-health-report.v1.json':
    'https://decantr.ai/schemas/workspace-health-report.v1.json',
  'file-critique-report.v1.json': 'https://decantr.ai/schemas/file-critique-report.v1.json',
  'showcase-shortlist-report.v1.json':
    'https://decantr.ai/schemas/showcase-shortlist-report.v1.json',
} as const;

export function assertMatchesVerifierSchema(name: keyof typeof schemaMap, data: unknown): void {
  const validate = ajv.getSchema(schemaMap[name]);
  if (!validate) {
    throw new Error(`Unknown verifier schema: ${name}`);
  }
  const valid = validate(data);

  if (!valid) {
    const details = (validate.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message}`.trim())
      .join('; ');
    throw new Error(`Schema validation failed for ${name}: ${details}`);
  }
}
