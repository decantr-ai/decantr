import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RegistryAPIClient } from '@decantr/registry';
import type { ApiContentType } from '@decantr/registry';
import { getApiKeyOrToken } from '../auth.js';

const PLURAL_TO_SINGULAR: Record<string, string> = {
  patterns: 'pattern',
  themes: 'theme',
  blueprints: 'blueprint',
  archetypes: 'archetype',
  shells: 'shell',
};

const SINGULAR_TO_PLURAL: Record<string, string> = {
  pattern: 'patterns',
  theme: 'themes',
  blueprint: 'blueprints',
  archetype: 'archetypes',
  shell: 'shells',
};

export async function cmdPublish(
  type: string,
  name: string,
  projectRoot: string = process.cwd()
): Promise<void> {
  const token = getApiKeyOrToken();
  if (!token) {
    console.error('Not authenticated. Run `decantr login` first.');
    process.exitCode = 1;
    return;
  }

  const singularType = PLURAL_TO_SINGULAR[type] || type;
  const pluralType = SINGULAR_TO_PLURAL[type] || SINGULAR_TO_PLURAL[singularType] || `${type}s`;

  const customPath = join(projectRoot, '.decantr', 'custom', pluralType, `${name}.json`);

  if (!existsSync(customPath)) {
    console.error(`Custom ${singularType} "${name}" not found at ${customPath}`);
    console.error(`Create one first: decantr create ${singularType} ${name}`);
    process.exitCode = 1;
    return;
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(readFileSync(customPath, 'utf-8'));
  } catch {
    console.error(`Failed to parse ${customPath}`);
    process.exitCode = 1;
    return;
  }

  const client = new RegistryAPIClient({
    apiKey: token,
  });

  try {
    const result = await client.publishContent({
      type: pluralType as ApiContentType,
      slug: name,
      version: (data.version as string) || '1.0.0',
      data,
      namespace: '@community',
      visibility: 'public',
    });
    console.log(`Published ${singularType}/${name} to @community`);
    console.log(`Status: ${result.status}`);
  } catch (err) {
    console.error(`Failed to publish: ${(err as Error).message}`);
    process.exitCode = 1;
  }
}
