import { Hono } from 'hono';
import type { Env } from '../types.js';
import showcaseManifest from '../../../showcase/manifest.json';
import shortlistVerificationReport from '../../../showcase/reports/shortlist-verification.json';
import type { ShowcaseManifestEntry, ShowcaseVerificationEntry } from '@decantr/registry';

const SHOWCASE_ENTRIES = (showcaseManifest.apps as ShowcaseManifestEntry[]).filter(entry => entry.status === 'active');
const SHOWCASE_VERIFICATION_RESULTS = (shortlistVerificationReport.results as ShowcaseVerificationEntry[] | undefined) ?? [];
const SHOWCASE_VERIFICATION_MAP = new Map(SHOWCASE_VERIFICATION_RESULTS.map(entry => [entry.slug, entry]));
const SHORTLISTED_SHOWCASES = SHOWCASE_ENTRIES
  .filter(entry => Boolean(entry.goldenCandidate))
  .map(entry => ({
    ...entry,
    verification: SHOWCASE_VERIFICATION_MAP.get(entry.slug) ?? null,
  }));

export const showcaseRoutes = new Hono<Env>();

showcaseRoutes.get('/showcase/manifest', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json({
    total: SHOWCASE_ENTRIES.length,
    shortlisted: SHORTLISTED_SHOWCASES.length,
    apps: SHOWCASE_ENTRIES.map(entry => ({
      ...entry,
      verification: SHOWCASE_VERIFICATION_MAP.get(entry.slug) ?? null,
    })),
  });
});

showcaseRoutes.get('/showcase/shortlist', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json({
    generatedAt: shortlistVerificationReport.generatedAt ?? null,
    summary: shortlistVerificationReport.summary ?? null,
    apps: SHORTLISTED_SHOWCASES,
  });
});

showcaseRoutes.get('/showcase/shortlist-verification', (c) => {
  c.header('Cache-Control', 'public, max-age=300, stale-while-revalidate=3600');
  return c.json(shortlistVerificationReport);
});
