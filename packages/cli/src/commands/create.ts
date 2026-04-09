import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  type ContentType,
} from '@decantr/registry';

const PLURAL = CONTENT_TYPE_TO_API_CONTENT_TYPE;

function getSkeleton(type: ContentType, id: string, name: string): Record<string, unknown> {
  const base = {
    id,
    name,
    description: '',
    version: '1.0.0',
    source: 'custom',
  };

  switch (type) {
    case 'pattern':
      return { ...base, components: [], presets: {}, layout: {} };
    case 'theme':
      return { ...base, seed: { primary: '#6500C6', secondary: '#0AF3EB', accent: '#F58882', background: '#0D0D1A' }, modes: ['dark'], shapes: ['rounded'] };
    case 'blueprint':
      return { ...base, compose: [], theme: {}, personality: [] };
    case 'archetype':
      return { ...base, pages: [], features: [], suggested_theme: { ids: [], modes: [], shapes: [] } };
    case 'shell':
      return { ...base, regions: [], layout: 'sidebar-main' };
  }
}

export function cmdCreate(
  type: string,
  name: string,
  projectRoot: string = process.cwd()
): void {
  if (!CONTENT_TYPES.includes(type as ContentType)) {
    console.error(`Invalid type "${type}". Must be one of: ${CONTENT_TYPES.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const contentType = type as ContentType;
  const plural = PLURAL[contentType];
  const customDir = join(projectRoot, '.decantr', 'custom', plural);
  const filePath = join(customDir, `${name}.json`);

  if (existsSync(filePath)) {
    console.error(`${type} "${name}" already exists at ${filePath}`);
    process.exitCode = 1;
    return;
  }

  mkdirSync(customDir, { recursive: true });

  const skeleton = getSkeleton(contentType, name, name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()));
  writeFileSync(filePath, JSON.stringify(skeleton, null, 2));

  console.log(`Created ${type} "${name}" at ${filePath}`);
  console.log(`Edit it, then publish with: decantr publish ${type} ${name}`);
}
