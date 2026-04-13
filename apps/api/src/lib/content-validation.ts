import Ajv2020 from 'ajv/dist/2020.js';
import type { ErrorObject } from 'ajv';
import type { ValidateFunction } from 'ajv';
import type { ContentType } from '../types.js';
import { COMMON_SCHEMA, EXPECTED_REGISTRY_SCHEMA_URLS, REGISTRY_SCHEMAS } from './schema-catalog.js';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

ajv.addSchema(COMMON_SCHEMA);

const validators = Object.fromEntries(
  Object.entries(REGISTRY_SCHEMAS).map(([type, schema]) => [type, ajv.compile(schema)]),
) as Record<ContentType, ValidateFunction<unknown>>;

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
  const expectedSchema = EXPECTED_REGISTRY_SCHEMA_URLS[type];
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
