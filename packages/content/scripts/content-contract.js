export const CONTENT_DIRECTORIES = [
  'patterns',
  'themes',
  'blueprints',
  'archetypes',
  'shells',
];

export const DIRECTORY_TO_CONTENT_TYPE = {
  patterns: 'pattern',
  themes: 'theme',
  blueprints: 'blueprint',
  archetypes: 'archetype',
  shells: 'shell',
};

export const DIRECTORY_TO_SCHEMA_URL = {
  patterns: 'https://decantr.ai/schemas/pattern.v2.json',
  themes: 'https://decantr.ai/schemas/theme.v1.json',
  blueprints: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetypes: 'https://decantr.ai/schemas/archetype.v2.json',
  shells: 'https://decantr.ai/schemas/shell.v1.json',
};

export const SCHEMA_FILES = {
  common: 'common.v1.json',
  patterns: 'pattern.v2.json',
  themes: 'theme.v1.json',
  blueprints: 'blueprint.v1.json',
  archetypes: 'archetype.v2.json',
  shells: 'shell.v1.json',
};

export const IGNORED_LOCAL_CONTENT_PREFIXES = [];

export function isIgnoredLocalContentFile(fileName) {
  return IGNORED_LOCAL_CONTENT_PREFIXES.some((prefix) => fileName.startsWith(prefix));
}
