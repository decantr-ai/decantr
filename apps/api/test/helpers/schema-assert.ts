import Ajv2020 from 'ajv/dist/2020.js';
import { PUBLIC_SCHEMAS } from '../../src/lib/schema-catalog.js';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

for (const schema of Object.values(PUBLIC_SCHEMAS)) {
  ajv.addSchema(schema);
}

export function assertMatchesSchema(name: string, data: unknown): void {
  const schema = PUBLIC_SCHEMAS[name];
  if (!schema) {
    throw new Error(`Unknown schema: ${name}`);
  }

  const validate = ajv.compile(schema);
  const valid = validate(data);

  if (!valid) {
    const details = (validate.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message}`.trim())
      .join('; ');
    throw new Error(`Schema validation failed for ${name}: ${details}`);
  }
}
