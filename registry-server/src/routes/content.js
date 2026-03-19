/**
 * GET /v1/content/:type/:id[/version/:version]
 *
 * Returns content metadata + artifact + version list.
 * Tracks downloads for analytics.
 */

import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { rateLimit } from '../middleware/rate-limit.js';

const app = new Hono();

app.use(rateLimit({ max: 200, windowMs: 60_000, prefix: 'content' }));

/**
 * Get content by type/id, optionally at a specific version.
 */
function getContent(c, type, id, version) {
  const db = getDb();

  // Fetch content row
  const content = db.prepare(`
    SELECT id, type, content_id, name, description, tags, ai_summary,
           latest_version, downloads, metadata, author_id, status
    FROM content
    WHERE type = ? AND content_id = ? AND status = 'active'
  `).get(type, id);

  if (!content) {
    return c.json({ error: `Content not found: ${type}/${id}` }, 404);
  }

  // Fetch specific version or latest
  const targetVersion = version || content.latest_version;
  const versionRow = db.prepare(`
    SELECT version, artifact, checksum, size, created_at
    FROM content_versions
    WHERE content_id = ? AND version = ?
  `).get(content.id, targetVersion);

  if (!versionRow) {
    return c.json({ error: `Version not found: ${targetVersion}` }, 404);
  }

  // Fetch all versions
  const versions = db.prepare(`
    SELECT version, created_at
    FROM content_versions
    WHERE content_id = ?
    ORDER BY created_at DESC
  `).all(content.id);

  // Track download
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const ua = c.req.header('user-agent') || '';
  db.prepare(`
    INSERT INTO download_log (content_id, ip, user_agent) VALUES (?, ?, ?)
  `).run(content.id, ip, ua);
  db.prepare(`
    UPDATE content SET downloads = downloads + 1, updated_at = datetime('now') WHERE id = ?
  `).run(content.id);

  // Fetch author login
  const author = db.prepare('SELECT login FROM users WHERE id = ?').get(content.author_id);

  return c.json({
    type: content.type,
    id: content.content_id,
    name: content.name,
    version: versionRow.version,
    description: content.description,
    tags: JSON.parse(content.tags || '[]'),
    ai_summary: content.ai_summary,
    author: author?.login || 'unknown',
    downloads: content.downloads,
    metadata: JSON.parse(content.metadata || '{}'),
    artifact: {
      content: versionRow.artifact,
      checksum: versionRow.checksum,
    },
    versions: versions.map(v => ({ version: v.version, created_at: v.created_at })),
  });
}

// GET /v1/content/:type/:id
app.get('/:type/:id', (c) => {
  return getContent(c, c.req.param('type'), c.req.param('id'));
});

// GET /v1/content/:type/:id/version/:version
app.get('/:type/:id/version/:version', (c) => {
  return getContent(c, c.req.param('type'), c.req.param('id'), c.req.param('version'));
});

export default app;
