import Ajv from 'ajv';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const v2SchemaPath = join(__dirname, '..', 'schema', 'essence.v2.json');
const v3SchemaPath = join(__dirname, '..', 'schema', 'essence.v3.json');

let cachedAjv: Ajv | null = null;
const validatorCache = new Map<string, ReturnType<Ajv['compile']>>();

function getAjv(): Ajv {
  if (!cachedAjv) {
    cachedAjv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  }
  return cachedAjv;
}

function getValidator(version: 'v2' | 'v3'): ReturnType<Ajv['compile']> | null {
  if (validatorCache.has(version)) return validatorCache.get(version)!;

  const schemaPath = version === 'v3' ? v3SchemaPath : v2SchemaPath;
  if (!existsSync(schemaPath)) return null;

  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  const ajv = getAjv();
  const validate = ajv.compile(schema);
  validatorCache.set(version, validate);
  return validate;
}

function detectVersion(data: unknown): 'v2' | 'v3' {
  if (typeof data === 'object' && data !== null && 'version' in data) {
    if ((data as Record<string, unknown>).version === '3.0.0') return 'v3';
  }
  return 'v2';
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEssence(data: unknown): ValidationResult {
  const version = detectVersion(data);
  const validate = getValidator(version);

  if (!validate) {
    return { valid: false, errors: [`No schema available for ${version} documents`] };
  }

  const valid = validate(data);

  if (valid) {
    return { valid: true, errors: [] };
  }

  const errors = (validate.errors ?? []).map((err) => {
    const path = err.instancePath || '/';
    const msg = err.message ?? 'unknown error';
    return `${path}: ${msg}`;
  });

  return { valid: false, errors };
}
