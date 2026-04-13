import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { PUBLIC_SCHEMAS } from '../../src/lib/schema-catalog.js';

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});
addFormats(ajv);

for (const schema of Object.values(PUBLIC_SCHEMAS)) {
  ajv.addSchema(schema);
}

export function assertMatchesSchema(name: keyof typeof PUBLIC_SCHEMAS, data: unknown): void {
  const schema = PUBLIC_SCHEMAS[name];
  if (!schema) {
    throw new Error(`Unknown schema: ${name}`);
  }

  const schemaId = typeof schema.$id === 'string' ? schema.$id : null;
  const validate = schemaId ? ajv.getSchema(schemaId) : ajv.compile(schema);
  if (!validate) {
    throw new Error(`Schema validator unavailable for ${name}`);
  }
  const valid = validate(data);

  if (!valid) {
    const details = (validate.errors ?? [])
      .map((error) => `${error.instancePath || '/'} ${error.message}`.trim())
      .join('; ');
    throw new Error(`Schema validation failed for ${name}: ${details}`);
  }
}
