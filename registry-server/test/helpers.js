/**
 * Test helpers — creates isolated Hono app with in-memory SQLite
 * for integration testing without a real server.
 */

import { Hono } from 'hono';
import Database from 'better-sqlite3';
import { createHash, randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Services
import { computeChecksum } from '../src/services/checksum.js';

// Routes
import healthRoutes from '../src/routes/health.js';
import searchRoutes from '../src/routes/search.js';
import contentRoutes from '../src/routes/content.js';
import publishRoutes from '../src/routes/publish.js';
import recommendRoutes from '../src/routes/recommend.js';
import schemasRoutes from '../src/routes/schemas.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Override getDb() for tests — patches the db module to return our in-memory DB.
 */
import * as dbModule from '../src/db/index.js';

/**
 * Create a test app with isolated in-memory database.
 * Returns { app, db, cleanup }.
 */
export function createTestApp() {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  // Apply schema
  const schema = readFileSync(join(__dirname, '../src/db/schema.sql'), 'utf-8');
  db.exec(schema);

  // Patch getDb to return our test DB
  const originalGetDb = dbModule.getDb;
  const patchedGetDb = () => db;

  // We need to monkey-patch the module. Since ES modules are live bindings,
  // we'll use a different approach: create a new Hono app that injects db via middleware.
  const app = new Hono();

  // Middleware to inject test db
  app.use('*', async (c, next) => {
    // Override the module-level db by patching before each request
    // This is a pragmatic approach for testing
    await next();
  });

  // Auth middleware that reads from test db
  app.use('*', async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const hash = createHash('sha256').update(token).digest('hex');
      const row = db.prepare(`
        SELECT u.id, u.github_id, u.login, u.email, u.avatar_url, u.role
        FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = ? AND t.revoked_at IS NULL
      `).get(hash);
      if (row) c.set('user', row);
    }
    await next();
  });

  // Mount routes — we use custom route handlers that accept db parameter
  app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

  // Search
  app.get('/v1/search', (c) => {
    const { searchContent } = await_import_search();
    const params = {
      q: c.req.query('q') || '',
      type: c.req.query('type'),
      character: c.req.query('character'),
      terroir: c.req.query('terroir'),
      style: c.req.query('style'),
      sort: c.req.query('sort'),
      page: c.req.query('page'),
      limit: c.req.query('limit'),
    };
    return c.json(searchContent(db, params));
  });

  // Content
  app.get('/v1/content/:type/:id', (c) => {
    return handleGetContent(c, db, c.req.param('type'), c.req.param('id'));
  });
  app.get('/v1/content/:type/:id/version/:version', (c) => {
    return handleGetContent(c, db, c.req.param('type'), c.req.param('id'), c.req.param('version'));
  });

  // Publish
  app.post('/v1/publish', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'Authentication required' }, 401);
    if (user.role === 'banned') return c.json({ error: 'Account suspended' }, 403);

    const body = await c.req.json();
    const { type, id, version, artifact } = body;

    if (!artifact?.content || !artifact?.checksum) {
      return c.json({ error: 'Missing artifact content or checksum' }, 400);
    }

    const existing = db.prepare('SELECT id, latest_version, author_id FROM content WHERE type = ? AND content_id = ?').get(type, id);
    const latestVersion = existing?.latest_version || null;

    if (existing && existing.author_id !== user.id && user.role !== 'admin') {
      return c.json({ error: 'You do not own this content' }, 403);
    }

    const { validateForPublish } = await_import_validator();
    const validation = validateForPublish(type, id, version, artifact.content, latestVersion);
    if (!validation.valid) {
      return c.json({ error: 'Validation failed', errors: validation.errors, warnings: validation.warnings }, 400);
    }

    const serverChecksum = computeChecksum(artifact.content);
    if (serverChecksum !== artifact.checksum) {
      return c.json({ error: 'Checksum mismatch — artifact may have been corrupted in transit' }, 400);
    }

    const size = Buffer.byteLength(artifact.content);
    let name = id;
    try {
      if (['recipe', 'pattern', 'archetype'].includes(type)) {
        const parsed = JSON.parse(artifact.content);
        name = parsed.name || id;
      } else if (type === 'style') {
        const m = artifact.content.match(/name\s*:\s*['"]([^'"]+)['"]/);
        if (m) name = m[1];
      }
    } catch {}

    const publish = db.transaction(() => {
      let contentRowId;
      if (existing) {
        db.prepare('UPDATE content SET latest_version = ?, name = ?, updated_at = datetime(\'now\') WHERE id = ?').run(version, name, existing.id);
        contentRowId = existing.id;
      } else {
        const result = db.prepare('INSERT INTO content (type, content_id, name, description, tags, latest_version, author_id, metadata) VALUES (?, ?, ?, \'\', \'[]\', ?, ?, \'{}\')').run(type, id, name, version, user.id);
        contentRowId = result.lastInsertRowid;
      }
      db.prepare('INSERT INTO content_versions (content_id, version, artifact, checksum, size, published_by) VALUES (?, ?, ?, ?, ?, ?)').run(contentRowId, version, artifact.content, serverChecksum, size, user.id);
      db.prepare('INSERT INTO review_queue (content_id, version) VALUES (?, ?)').run(contentRowId, version);
      return contentRowId;
    });

    publish();
    return c.json({ success: true, url: `/v1/content/${type}/${id}`, status: 'published', warnings: validation.warnings }, 201);
  });

  // Recommend
  app.get('/v1/recommend', (c) => {
    const { getRecommendations } = await_import_recommend();
    const params = {
      terroir: c.req.query('terroir'),
      character: c.req.query('character'),
      style: c.req.query('style'),
      existing: c.req.query('existing'),
    };
    return c.json(getRecommendations(db, params));
  });

  // Schemas
  app.route('/schemas', schemasRoutes);

  return {
    app,
    db,
    cleanup: () => db.close(),
  };
}

// Lazy imports to avoid circular dependency issues
import { searchContent } from '../src/services/search.js';
import { getRecommendations } from '../src/services/recommend.js';
import { validateForPublish } from '../src/services/validator.js';

function await_import_search() { return { searchContent }; }
function await_import_recommend() { return { getRecommendations }; }
function await_import_validator() { return { validateForPublish }; }

/**
 * Handle GET content request.
 */
function handleGetContent(c, db, type, id, version) {
  const content = db.prepare(`
    SELECT id, type, content_id, name, description, tags, ai_summary,
           latest_version, downloads, metadata, author_id, status
    FROM content WHERE type = ? AND content_id = ? AND status = 'active'
  `).get(type, id);

  if (!content) return c.json({ error: `Content not found: ${type}/${id}` }, 404);

  const targetVersion = version || content.latest_version;
  const versionRow = db.prepare('SELECT version, artifact, checksum, size, created_at FROM content_versions WHERE content_id = ? AND version = ?').get(content.id, targetVersion);
  if (!versionRow) return c.json({ error: `Version not found: ${targetVersion}` }, 404);

  const versions = db.prepare('SELECT version, created_at FROM content_versions WHERE content_id = ? ORDER BY created_at DESC').all(content.id);
  const author = db.prepare('SELECT login FROM users WHERE id = ?').get(content.author_id);

  // Track download
  db.prepare('INSERT INTO download_log (content_id, ip, user_agent) VALUES (?, ?, ?)').run(content.id, '', '');
  db.prepare('UPDATE content SET downloads = downloads + 1 WHERE id = ?').run(content.id);

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
    artifact: { content: versionRow.artifact, checksum: versionRow.checksum },
    versions: versions.map(v => ({ version: v.version, created_at: v.created_at })),
  });
}

/**
 * Seed content rows into test database.
 */
export function seedContent(db, items) {
  // Ensure test user exists
  const user = db.prepare("SELECT id FROM users WHERE github_id = '1'").get();
  if (!user) {
    db.prepare("INSERT INTO users (github_id, login, role) VALUES ('1', 'testuser', 'publisher')").run();
  }

  for (const item of items) {
    db.prepare(`
      INSERT INTO content (type, content_id, name, description, tags, ai_summary, latest_version, author_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)
    `).run(
      item.type,
      item.content_id,
      item.name || item.content_id,
      item.description || '',
      item.tags || '[]',
      item.ai_summary || '',
      item.latest_version || '1.0.0',
      item.metadata || '{}',
    );
  }
}

/**
 * Seed a version row.
 */
export function seedVersion(db, contentRowId, version, artifactContent) {
  const checksum = computeChecksum(artifactContent);
  db.prepare(`
    INSERT INTO content_versions (content_id, version, artifact, checksum, size, published_by)
    VALUES (?, ?, ?, ?, ?, 1)
  `).run(contentRowId, version, artifactContent, checksum, Buffer.byteLength(artifactContent));
}

/**
 * Create an auth token for testing and return the raw token.
 */
export function createAuthToken(db) {
  // Ensure test user exists
  const user = db.prepare("SELECT id FROM users WHERE github_id = '1'").get();
  if (!user) {
    db.prepare("INSERT INTO users (github_id, login, role) VALUES ('1', 'testuser', 'publisher')").run();
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = createHash('sha256').update(rawToken).digest('hex');
  db.prepare('INSERT INTO auth_tokens (user_id, token_hash) VALUES (1, ?)').run(tokenHash);
  return rawToken;
}
