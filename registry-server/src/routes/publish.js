/**
 * POST /v1/publish — publish a new content artifact.
 *
 * Requires authentication. Validates ID, version, artifact content,
 * checksum, and safety scan.
 */

import { Hono } from 'hono';
import { getDb } from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { validateForPublish } from '../services/validator.js';
import { computeChecksum } from '../services/checksum.js';
import { config } from '../config.js';

const app = new Hono();

app.use(rateLimit({ max: 10, windowMs: 3600_000, prefix: 'publish' }));
app.use(requireAuth());

app.post('/', async (c) => {
  const user = c.get('user');
  const body = await c.req.json();

  const { type, id, version, artifact } = body;

  if (!artifact?.content || !artifact?.checksum) {
    return c.json({ error: 'Missing artifact content or checksum' }, 400);
  }

  const db = getDb();

  // Look up existing content for version comparison
  const existing = db.prepare(`
    SELECT id, latest_version, author_id FROM content
    WHERE type = ? AND content_id = ?
  `).get(type, id);

  const latestVersion = existing?.latest_version || null;

  // If content exists, verify ownership
  if (existing && existing.author_id !== user.id && user.role !== 'admin') {
    return c.json({ error: 'You do not own this content' }, 403);
  }

  // Validate everything
  const validation = validateForPublish(type, id, version, artifact.content, latestVersion);
  if (!validation.valid) {
    return c.json({ error: 'Validation failed', errors: validation.errors, warnings: validation.warnings }, 400);
  }

  // Verify checksum
  const serverChecksum = computeChecksum(artifact.content);
  if (serverChecksum !== artifact.checksum) {
    return c.json({ error: 'Checksum mismatch — artifact may have been corrupted in transit' }, 400);
  }

  const size = Buffer.byteLength(artifact.content);

  // Extract metadata from artifact
  let name = id;
  let description = '';
  let tags = [];
  let metadata = {};

  try {
    if (type === 'recipe' || type === 'pattern' || type === 'archetype') {
      const parsed = JSON.parse(artifact.content);
      name = parsed.name || id;
      description = parsed.description || '';
      tags = parsed.tags || [];
      metadata = {
        character: parsed.character,
        terroir_affinity: parsed.terroir_affinity,
        style: parsed.style,
        pairings: parsed.pairings,
      };
    } else if (type === 'style') {
      // Extract name from JS: name: 'foo' or name: "foo"
      const nameMatch = artifact.content.match(/name\s*:\s*['"]([^'"]+)['"]/);
      if (nameMatch) name = nameMatch[1];
      const descMatch = artifact.content.match(/description\s*:\s*['"]([^'"]+)['"]/);
      if (descMatch) description = descMatch[1];
    }
  } catch { /* metadata extraction is best-effort */ }

  // Upsert content + insert version in a transaction
  const publish = db.transaction(() => {
    let contentRowId;

    if (existing) {
      db.prepare(`
        UPDATE content
        SET latest_version = ?, name = ?, description = ?, tags = ?,
            metadata = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(version, name, description, JSON.stringify(tags), JSON.stringify(metadata), existing.id);
      contentRowId = existing.id;
    } else {
      const result = db.prepare(`
        INSERT INTO content (type, content_id, name, description, tags, latest_version, author_id, metadata)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(type, id, name, description, JSON.stringify(tags), version, user.id, JSON.stringify(metadata));
      contentRowId = result.lastInsertRowid;
    }

    db.prepare(`
      INSERT INTO content_versions (content_id, version, artifact, checksum, size, published_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(contentRowId, version, artifact.content, serverChecksum, size, user.id);

    // Add to review queue
    db.prepare(`
      INSERT INTO review_queue (content_id, version) VALUES (?, ?)
    `).run(contentRowId, version);

    return contentRowId;
  });

  const contentRowId = publish();

  return c.json({
    success: true,
    url: `${config.baseUrl}/v1/content/${type}/${id}`,
    status: 'published',
    warnings: validation.warnings,
  }, 201);
});

export default app;
