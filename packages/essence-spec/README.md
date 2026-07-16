# @decantr/essence-spec

Support status: `core-supported`  
Release channel: `stable`

Schemas, validation, migration, guard evaluation, and TypeScript types for `decantr.essence.json`.

## Install

```bash
npm install @decantr/essence-spec
```

## What It Exports

- `validateEssence()` for schema validation
- `evaluateGuard()` for contract/guard checks
- `normalizeEssence()` for active Essence v4 normalization
- `migrateToV4()` for the explicit legacy migration path
- Decantr Essence v4 TypeScript types

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

- `@decantr/essence-spec/schema/essence.v4.json`
- `@decantr/essence-spec/schema/essence.v2.json` and `essence.v3.json` remain archived references for migration tooling only

## Compatibility

`@decantr/essence-spec` defines the active Essence v4 public contract for Decantr 3. Runtime validation accepts v4 only; older Essence v2/v3 files are supported through `decantr migrate --to v4`.

Decantr 3.9 adds governed-change evidence contracts in `@decantr/verifier`; it does not change Essence V4 or require an `@decantr/essence-spec` version bump solely for alignment.

- additive schema fields may be introduced in compatible minor releases
- breaking schema or migration behavior changes require a major version
- deprecation and migration guidance should be documented before removing or replacing a supported essence path

## Stability Note

This package is the lowest-level public Decantr contract and is intended to remain boring and dependable for downstream consumers.

- patch releases should stay documentation-only or behaviorally compatible
- schema export paths are part of the supported public surface
- coordinated downstream releases should only be needed when a package explicitly adopts a newer essence-spec version

## Security And Permissions

`@decantr/essence-spec` is a local validation library. It may read explicitly supplied essence/schema paths through helper APIs, but it does not write files, call the network, spawn processes, emit telemetry, or upload source. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## License

MIT
