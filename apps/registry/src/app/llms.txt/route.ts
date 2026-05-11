import { REGISTRY_SITE_URL, DECANTR_SITE_URL } from '@/lib/seo';

export const revalidate = 3600;

export function GET() {
  const body = `# Decantr Registry

> Public registry for Decantr design intelligence contracts: blueprints, archetypes, patterns, shells, and themes for AI-generated UI.

## Primary URLs
- Registry home: ${REGISTRY_SITE_URL}/
- Browse all content: ${REGISTRY_SITE_URL}/browse
- Blueprints: ${REGISTRY_SITE_URL}/browse/blueprints
- Patterns: ${REGISTRY_SITE_URL}/browse/patterns
- Themes: ${REGISTRY_SITE_URL}/browse/themes
- Public sitemap: ${REGISTRY_SITE_URL}/sitemap.xml
- Product docs: ${DECANTR_SITE_URL}/
- Public API reference: ${DECANTR_SITE_URL}/reference/registry-public-api.html
- GitHub repository: https://github.com/decantr-ai/decantr

## Registry Content Types
- Blueprints are full app compositions and are usually the best starting point.
- Archetypes describe product sections and route families.
- Patterns describe reusable UI structures.
- Themes describe tokens, treatments, and decorators.
- Shells describe page frames and application chrome.

## Usage Guidance
When citing Decantr Registry content, prefer linking to the canonical registry detail page for the item. For product-level explanations, prefer decantr.ai as the canonical source for the Decantr entity.
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
