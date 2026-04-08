import type { ContentType } from '../types.js';
import commonSchema from '@decantr/registry/schema/common.v1.json';
import patternSchema from '@decantr/registry/schema/pattern.v2.json';
import themeSchema from '@decantr/registry/schema/theme.v1.json';
import blueprintSchema from '@decantr/registry/schema/blueprint.v1.json';
import archetypeSchema from '@decantr/registry/schema/archetype.v2.json';
import shellSchema from '@decantr/registry/schema/shell.v1.json';
import essenceV2Schema from '@decantr/essence-spec/schema/essence.v2.json';
import essenceV3Schema from '@decantr/essence-spec/schema/essence.v3.json';

export type JsonSchema = Record<string, unknown>;

export const COMMON_SCHEMA = commonSchema as JsonSchema;

export const EXPECTED_REGISTRY_SCHEMA_URLS: Record<ContentType, string> = {
  pattern: 'https://decantr.ai/schemas/pattern.v2.json',
  theme: 'https://decantr.ai/schemas/theme.v1.json',
  blueprint: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetype: 'https://decantr.ai/schemas/archetype.v2.json',
  shell: 'https://decantr.ai/schemas/shell.v1.json',
};

export const REGISTRY_SCHEMAS: Record<ContentType, JsonSchema> = {
  pattern: patternSchema as JsonSchema,
  theme: themeSchema as JsonSchema,
  blueprint: blueprintSchema as JsonSchema,
  archetype: archetypeSchema as JsonSchema,
  shell: shellSchema as JsonSchema,
};

export const PUBLIC_SCHEMAS: Record<string, JsonSchema> = {
  'common.v1.json': COMMON_SCHEMA,
  'pattern.v2.json': REGISTRY_SCHEMAS.pattern,
  'theme.v1.json': REGISTRY_SCHEMAS.theme,
  'blueprint.v1.json': REGISTRY_SCHEMAS.blueprint,
  'archetype.v2.json': REGISTRY_SCHEMAS.archetype,
  'shell.v1.json': REGISTRY_SCHEMAS.shell,
  'essence.v2.json': essenceV2Schema as JsonSchema,
  'essence.v3.json': essenceV3Schema as JsonSchema,
};
