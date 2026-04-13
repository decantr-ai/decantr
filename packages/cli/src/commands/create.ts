import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  type ContentType,
} from '@decantr/registry';
import { getThemeSkeleton } from '../theme-templates.js';

const PLURAL = CONTENT_TYPE_TO_API_CONTENT_TYPE;
const SCHEMA_URLS: Record<ContentType, string> = {
  pattern: 'https://decantr.ai/schemas/pattern.v2.json',
  theme: 'https://decantr.ai/schemas/theme.v1.json',
  blueprint: 'https://decantr.ai/schemas/blueprint.v1.json',
  archetype: 'https://decantr.ai/schemas/archetype.v2.json',
  shell: 'https://decantr.ai/schemas/shell.v1.json',
};

function humanizeId(id: string): string {
  return id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getSkeleton(type: ContentType, id: string, name: string): Record<string, unknown> {
  const base = {
    $schema: SCHEMA_URLS[type],
    id,
    name,
    version: '1.0.0',
  };

  switch (type) {
    case 'pattern':
      return {
        ...base,
        description: `Starter pattern for ${name}. Replace the preset layout, slots, and code examples before publishing.`,
        tags: [],
        components: [],
        default_preset: 'standard',
        presets: {
          standard: {
            description: 'Default starter preset. Replace the layout atoms and slots with the real structure for this pattern.',
            layout: {
              layout: 'stack',
              atoms: '_flex _col _gap4',
            },
          },
        },
      };
    case 'theme':
      return getThemeSkeleton(id, name) as Record<string, unknown>;
    case 'blueprint':
      return {
        ...base,
        description: `Starter blueprint for ${name}. Replace the theme, routes, and composed archetypes before publishing.`,
        tags: [],
        compose: ['starter-home'],
        theme: {
          id: 'carbon',
          mode: 'dark',
          shape: 'rounded',
        },
        personality: 'Calm, production-ready starter blueprint. Tailor the voice, routes, and composed archetypes to your product.',
        routes: {
          '/': {
            page: 'home',
            shell: 'top-nav-main',
            archetype: 'starter-home',
          },
        },
        overrides: {
          features_add: [],
          features_remove: [],
          pages: {},
          pages_remove: [],
        },
      };
    case 'archetype':
      return {
        ...base,
        role: 'primary',
        description: `Starter archetype for ${name}. Replace the sample page, pattern layout, and features before publishing.`,
        tags: ['starter'],
        pages: [
          {
            id: 'home',
            description: 'Starter page for your primary flow.',
            shell: 'top-nav-main',
            patterns: [],
            default_layout: [],
          },
        ],
        features: [],
        suggested_theme: {
          ids: ['carbon'],
          modes: ['dark'],
          shapes: ['rounded'],
        },
      };
    case 'shell':
      return {
        ...base,
        description: `Starter shell for ${name}. Replace the regions, layout guidance, and internal structure before publishing.`,
        layout: 'stack',
        atoms: '_flex _col _h[100vh]',
        config: {
          regions: ['header', 'body'],
        },
        guidance: {
          section_label_treatment: 'd-label',
          section_density: 'comfortable',
        },
      };
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

  const skeleton = getSkeleton(contentType, name, humanizeId(name));
  writeFileSync(filePath, JSON.stringify(skeleton, null, 2));

  console.log(`Created ${type} "${name}" at ${filePath}`);
  console.log(`Edit it, then publish with: decantr publish ${type} ${name}`);
}
