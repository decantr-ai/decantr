import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiContentType, ContentType } from '@decantr/registry';
import {
  API_CONTENT_TYPE_TO_CONTENT_TYPE,
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  RegistryAPIClient,
  RegistryAPIError,
} from '@decantr/registry';
import { getApiKeyOrToken } from '../auth.js';

export async function cmdPublish(
  type: string,
  name: string,
  projectRoot: string = process.cwd(),
): Promise<void> {
  const token = getApiKeyOrToken();
  if (!token) {
    console.error('Not authenticated. Run `decantr login` first.');
    process.exitCode = 1;
    return;
  }

  const singularType =
    (API_CONTENT_TYPE_TO_CONTENT_TYPE as Record<string, ContentType>)[type] || type;
  const pluralType =
    (CONTENT_TYPE_TO_API_CONTENT_TYPE as Record<string, ApiContentType>)[type] ||
    CONTENT_TYPE_TO_API_CONTENT_TYPE[singularType as ContentType] ||
    `${type}s`;

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
    if (err instanceof RegistryAPIError) {
      console.error(`Failed to publish: ${err.message}`);
      const details = err.details as { validationErrors?: unknown } | undefined;
      if (Array.isArray(details?.validationErrors) && details.validationErrors.length > 0) {
        console.error('Validation errors:');
        for (const validationError of details.validationErrors) {
          console.error(`  - ${String(validationError)}`);
        }
      }
    } else {
      console.error(`Failed to publish: ${(err as Error).message}`);
    }
    process.exitCode = 1;
  }
}
