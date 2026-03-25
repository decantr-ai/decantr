import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, '..', 'schema', 'essence.v2.json');

let cachedAjv: Ajv | null = null;
let cachedValidate: ReturnType<Ajv['compile']> | null = null;

function getValidator() {
  if (cachedValidate) return cachedValidate;
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  cachedAjv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
  cachedValidate = cachedAjv.compile(schema);
  return cachedValidate;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateEssence(data: unknown): ValidationResult {
  const validate = getValidator();
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
