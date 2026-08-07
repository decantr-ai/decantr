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
  new URL('../../schema/adoption-truth.v1.json', import.meta.url),
  new URL('../../schema/task-capsule.v1.json', import.meta.url),
  new URL('../../schema/governance-delta.v1.json', import.meta.url),
  new URL('../../schema/change-assurance-report.v1.json', import.meta.url),
  new URL('../../schema/verification-report.common.v1.json', import.meta.url),
  new URL('../../schema/verification-report.common.v2.json', import.meta.url),
  new URL('../../schema/authority-resolution.v2.json', import.meta.url),
  new URL('../../schema/loop-readiness.v2.json', import.meta.url),
  new URL('../../schema/project-audit-report.v1.json', import.meta.url),
  new URL('../../schema/project-health-report.v1.json', import.meta.url),
  new URL('../../schema/project-health-report.v2.json', import.meta.url),
  new URL('../../schema/decantr-ci-report.v1.json', import.meta.url),
  new URL('../../schema/decantr-ci-report.v2.json', import.meta.url),
  new URL('../../schema/decantr-ci-report.v3.json', import.meta.url),
  new URL('../../schema/evidence-bundle.v1.json', import.meta.url),
  new URL('../../schema/evidence-bundle.v2.json', import.meta.url),
  new URL('../../schema/runtime-probe-payload.v2.json', import.meta.url),
  new URL('../../schema/proof-field-report.v2.json', import.meta.url),
  new URL('../../schema/scan-report.v1.json', import.meta.url),
  new URL('../../schema/scan-report.v2.json', import.meta.url),
  new URL('../../schema/workspace-health-report.v1.json', import.meta.url),
  new URL('../../schema/workspace-health-report.v2.json', import.meta.url),
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
  'adoption-truth.v1.json': 'https://decantr.ai/schemas/adoption-truth.v1.json',
  'task-capsule.v1.json': 'https://decantr.ai/schemas/task-capsule.v1.json',
  'governance-delta.v1.json': 'https://decantr.ai/schemas/governance-delta.v1.json',
  'change-assurance-report.v1.json': 'https://decantr.ai/schemas/change-assurance-report.v1.json',
  'project-audit-report.v1.json': 'https://decantr.ai/schemas/project-audit-report.v1.json',
  'project-health-report.v1.json': 'https://decantr.ai/schemas/project-health-report.v1.json',
  'project-health-report.v2.json': 'https://decantr.ai/schemas/project-health-report.v2.json',
  'decantr-ci-report.v1.json': 'https://decantr.ai/schemas/decantr-ci-report.v1.json',
  'decantr-ci-report.v2.json': 'https://decantr.ai/schemas/decantr-ci-report.v2.json',
  'decantr-ci-report.v3.json': 'https://decantr.ai/schemas/decantr-ci-report.v3.json',
  'evidence-bundle.v1.json': 'https://decantr.ai/schemas/evidence-bundle.v1.json',
  'evidence-bundle.v2.json': 'https://decantr.ai/schemas/evidence-bundle.v2.json',
  'loop-readiness.v2.json': 'https://decantr.ai/schemas/loop-readiness.v2.json',
  'authority-resolution.v2.json': 'https://decantr.ai/schemas/authority-resolution.v2.json',
  'proof-field-report.v2.json': 'https://decantr.ai/schemas/proof-field-report.v2.json',
  'scan-report.v1.json': 'https://decantr.ai/schemas/scan-report.v1.json',
  'scan-report.v2.json': 'https://decantr.ai/schemas/scan-report.v2.json',
  'workspace-health-report.v1.json': 'https://decantr.ai/schemas/workspace-health-report.v1.json',
  'workspace-health-report.v2.json': 'https://decantr.ai/schemas/workspace-health-report.v2.json',
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

export function assertRejectedByVerifierSchema(name: keyof typeof schemaMap, data: unknown): void {
  const validate = ajv.getSchema(schemaMap[name]);
  if (!validate) {
    throw new Error(`Unknown verifier schema: ${name}`);
  }
  if (validate(data)) {
    throw new Error(`Expected ${name} schema validation to reject the value.`);
  }
}
