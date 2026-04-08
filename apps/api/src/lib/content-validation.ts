import Ajv2020 from 'ajv/dist/2020.js';
import type { ErrorObject } from 'ajv';
import type { ContentType } from '../types.js';
import commonSchema from '../schemas/common.v1.json';
import patternSchema from '../schemas/pattern.v2.json';
import themeSchema from '../schemas/theme.v1.json';
import blueprintSchema from '../schemas/blueprint.v1.json';
import archetypeSchema from '../schemas/archetype.v2.json';
import shellSchema from '../schemas/shell.v1.json';

const EXPECTED_SCHEMA_URLS: Record<ContentType, string> = {
  pattern: 'https://decantr.ai/schemas/pattern.v2.json',
  theme: 'https://decantr.ai/schemas/theme.v1.json',
  blueprint: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetype: 'https://decantr.ai/schemas/archetype.v2.json',
  shell: 'https://decantr.ai/schemas/shell.v1.json',
};

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

ajv.addSchema(commonSchema);

const validators = {
  pattern: ajv.compile(patternSchema),
  theme: ajv.compile(themeSchema),
  blueprint: ajv.compile(blueprintSchema),
  archetype: ajv.compile(archetypeSchema),
  shell: ajv.compile(shellSchema),
};

function formatSchemaError(error: ErrorObject): string {
  const instancePath = error.instancePath || '/';
  return `${instancePath} ${error.message}`.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateRegistryContent(type: ContentType, data: unknown): { valid: boolean; errors: string[] } {
  if (!isRecord(data)) {
    return {
      valid: false,
      errors: ['data must be an object'],
    };
  }

  const errors: string[] = [];
  const expectedSchema = EXPECTED_SCHEMA_URLS[type];
  if (data.$schema !== expectedSchema) {
    errors.push(`$schema must be "${expectedSchema}"`);
  }

  const validate = validators[type];
  if (!validate(data)) {
    for (const schemaError of validate.errors || []) {
      errors.push(`schema ${formatSchemaError(schemaError)}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
