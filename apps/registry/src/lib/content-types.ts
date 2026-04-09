import { API_CONTENT_TYPES, isApiContentType } from '@decantr/registry/content-types';

export const CONTENT_TYPES = API_CONTENT_TYPES;

export type RegistryContentType = (typeof CONTENT_TYPES)[number];

export const CONTENT_TYPE_LABELS: Record<RegistryContentType, string> = {
  patterns: 'Patterns',
  themes: 'Themes',
  blueprints: 'Blueprints',
  archetypes: 'Archetypes',
  shells: 'Shells',
};

export const CONTENT_TYPE_DESCRIPTIONS: Record<RegistryContentType, string> = {
  patterns: 'Composable UI sections for hero, nav, tables, feeds, and more.',
  themes: 'Complete visual systems with tokens, decorators, and identity hints.',
  blueprints: 'Full product compositions built from archetypes, patterns, and routes.',
  archetypes: 'App templates with pages, layouts, and product-specific feature framing.',
  shells: 'Layout containers that define navigation, regions, and application chrome.',
};

export function isRegistryContentType(value: string): value is RegistryContentType {
  return isApiContentType(value);
}
