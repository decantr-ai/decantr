import type { MetadataRoute } from 'next';
import { REGISTRY_SITE_URL } from '@/lib/seo';

const PRIVATE_PATHS = ['/admin/', '/auth/', '/dashboard/', '/login'];

export default function robots(): MetadataRoute.Robots {
  const rules = [
    '*',
    'OAI-SearchBot',
    'GPTBot',
    'ClaudeBot',
    'Claude-SearchBot',
    'PerplexityBot',
    'DuckDuckBot',
    'Applebot',
    'Google-Extended',
    'CCBot',
  ].map((userAgent) => ({
    userAgent,
    allow: '/',
    disallow: PRIVATE_PATHS,
  }));

  return {
    rules,
    sitemap: `${REGISTRY_SITE_URL}/sitemap.xml`,
    host: REGISTRY_SITE_URL,
  };
}
