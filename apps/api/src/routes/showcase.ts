import { Hono } from 'hono';
import type { Env } from '../types.js';
import {
  SHOWCASE_MANIFEST_ENTRIES,
  SHORTLISTED_SHOWCASE_ENTRIES,
  SHOWCASE_SHORTLIST_REPORT,
  SHOWCASE_VERIFICATION_MAP,
} from '../lib/showcase-benchmarks.js';

const SHORTLISTED_SHOWCASES = SHORTLISTED_SHOWCASE_ENTRIES
  .map(entry => ({
    ...entry,
    verification: SHOWCASE_VERIFICATION_MAP.get(entry.slug) ?? null,
  }));

export const showcaseRoutes = new Hono<Env>();

showcaseRoutes.get('/showcase/manifest', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json({
    total: SHOWCASE_MANIFEST_ENTRIES.length,
    shortlisted: SHORTLISTED_SHOWCASES.length,
    apps: SHOWCASE_MANIFEST_ENTRIES.map(entry => ({
      ...entry,
      verification: SHOWCASE_VERIFICATION_MAP.get(entry.slug) ?? null,
    })),
  });
});

showcaseRoutes.get('/showcase/shortlist', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json({
    generatedAt: SHOWCASE_SHORTLIST_REPORT.generatedAt ?? null,
    summary: SHOWCASE_SHORTLIST_REPORT.summary ?? null,
    apps: SHORTLISTED_SHOWCASES,
  });
});

showcaseRoutes.get('/showcase/shortlist-verification', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json(SHOWCASE_SHORTLIST_REPORT);
});
