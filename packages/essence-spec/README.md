# @decantr/essence-spec

Support status: `core-supported`  
Release channel: `beta`

Schemas, validation, migration, guard evaluation, and TypeScript types for `decantr.essence.json`.

## Install

```bash
npm install @decantr/essence-spec
```

## What It Exports

- `validateEssence()` for schema validation
- `evaluateGuard()` for contract/guard checks
- `normalizeEssence()` for version normalization
- `migrateV2ToV3()` and `migrateV30ToV31()` for structured migrations
- Decantr essence TypeScript types

## Example

```ts
import { evaluateGuard, validateEssence } from '@decantr/essence-spec';

const result = validateEssence(essence);
if (!result.valid) {
  console.error(result.errors);
}

const violations = evaluateGuard(essence, {});
```

## Schema Exports

- `@decantr/essence-spec/schema/essence.v2.json`
- `@decantr/essence-spec/schema/essence.v3.json`

## License

MIT
