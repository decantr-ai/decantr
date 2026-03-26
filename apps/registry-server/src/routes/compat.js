import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { rateLimit } from '../middleware/rate-limit.js';

const app = new Hono();
app.use(rateLimit({ max: 100, windowMs: 60_000, prefix: 'compat' }));

// GET /v1/compat/:type/:id
app.get('/:type/:id', (c) => {
  const db = getDb();
  const type = c.req.param('type');
  const id = c.req.param('id');

  // Find active content
  const content = db.prepare(
    "SELECT id, content_id, type FROM content WHERE type = ? AND content_id = ? AND status = 'active'"
  ).get(type, id);
  if (!content) return c.json({ error: `Content not found: ${type}/${id}` }, 404);

  // Get all versions with artifacts
  const versions = db.prepare(
    'SELECT version, artifact, created_at FROM content_versions WHERE content_id = ? ORDER BY created_at DESC'
  ).all(content.id);

  // Find dependents: other content that references this item in their dependencies
  const allContent = db.prepare(
    "SELECT cv.artifact, c.type, c.content_id, cv.version FROM content_versions cv JOIN content c ON c.id = cv.content_id WHERE c.status = 'active'"
  ).all();

  const versionMap = {};
  for (const v of versions) {
    let decantrCompat = null;
    try {
      const artifact = JSON.parse(v.artifact);
      decantrCompat = artifact.decantr_compat || null;
    } catch {}

    // Find who depends on this
    const dependents = [];
    for (const dep of allContent) {
      try {
        const art = JSON.parse(dep.artifact);
        const deps = art.dependencies || {};
        for (const [, depMap] of Object.entries(deps)) {
          if (typeof depMap !== 'object') continue;
          if (depMap[id]) dependents.push(`${dep.type}/${dep.content_id}@${dep.version}`);
        }
      } catch {}
    }

    versionMap[v.version] = {
      decantr_compat: decantrCompat,
      dependents: [...new Set(dependents)],
      created_at: v.created_at,
    };
  }

  return c.json({ type, id: content.content_id, versions: versionMap });
});

export default app;
