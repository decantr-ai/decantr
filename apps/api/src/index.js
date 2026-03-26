import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_ROOT = join(__dirname, '..', '..', '..', 'content');

// --- Content Loading ---

function loadContentDir(type) {
  const dir = join(CONTENT_ROOT, type);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try {
        const data = JSON.parse(readFileSync(join(dir, f), 'utf-8'));
        return { id: data.id || f.replace('.json', ''), ...data };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function loadContentItem(type, id) {
  const filePath = join(CONTENT_ROOT, type, `${id}.json`);
  if (!existsSync(filePath)) {
    // Try core directory as fallback
    const corePath = join(CONTENT_ROOT, 'core', type, `${id}.json`);
    if (!existsSync(corePath)) return null;
    try {
      return JSON.parse(readFileSync(corePath, 'utf-8'));
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

// Load all content at startup
const contentCache = {
  patterns: loadContentDir('patterns'),
  archetypes: loadContentDir('archetypes'),
  blueprints: loadContentDir('blueprints'),
  recipes: loadContentDir('recipes'),
  themes: loadContentDir('themes'),
};

// Also load core content
const corePatterns = loadContentDir('core/patterns');
const coreRecipes = loadContentDir('core/recipes');
contentCache.patterns.push(...corePatterns);
contentCache.recipes.push(...coreRecipes);

// Load shells from shells.json
let shells = [];
const shellsPath = join(CONTENT_ROOT, 'core', 'shells.json');
if (existsSync(shellsPath)) {
  try {
    const data = JSON.parse(readFileSync(shellsPath, 'utf-8'));
    shells = Object.entries(data.shells || data).map(([id, config]) => ({
      id,
      ...typeof config === 'object' ? config : {},
    }));
  } catch { /* ignore */ }
}

// --- Rate Limiting ---

const rateLimits = new Map();
const RATE_LIMIT = 100; // requests per minute
const RATE_WINDOW = 60_000; // 1 minute

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimits.set(ip, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT;
}

// --- App ---

const app = new Hono();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use('/v1/*', async (c, next) => {
  const ip = c.req.header('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return c.json({ error: 'Rate limit exceeded. Max 100 requests per minute.' }, 429);
  }
  await next();
});

// --- Routes ---

app.get('/health', (c) => c.json({ status: 'ok', version: '1.0.0' }));

// List endpoints
app.get('/v1/patterns', (c) => {
  return c.json({
    total: contentCache.patterns.length,
    items: contentCache.patterns.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      components: p.components,
    })),
  });
});

app.get('/v1/archetypes', (c) => {
  return c.json({
    total: contentCache.archetypes.length,
    items: contentCache.archetypes.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      pages: (a.pages || []).length,
    })),
  });
});

app.get('/v1/blueprints', (c) => {
  return c.json({
    total: contentCache.blueprints.length,
    items: contentCache.blueprints.map(b => ({
      id: b.id,
      name: b.name,
      description: b.description,
    })),
  });
});

app.get('/v1/recipes', (c) => {
  return c.json({
    total: contentCache.recipes.length,
    items: contentCache.recipes.map(r => ({
      id: r.id,
      style: r.style,
    })),
  });
});

app.get('/v1/themes', (c) => {
  return c.json({
    total: contentCache.themes.length,
    items: contentCache.themes.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
    })),
  });
});

app.get('/v1/shells', (c) => {
  return c.json({
    total: shells.length,
    items: shells.map(s => ({
      id: s.id,
      name: s.name || s.id,
      description: s.description || '',
    })),
  });
});

// Detail endpoints
app.get('/v1/patterns/:id', (c) => {
  const id = c.req.param('id');
  const item = contentCache.patterns.find(p => p.id === id) || loadContentItem('patterns', id);
  if (!item) return c.json({ error: `Pattern "${id}" not found` }, 404);
  return c.json(item);
});

app.get('/v1/archetypes/:id', (c) => {
  const id = c.req.param('id');
  const item = contentCache.archetypes.find(a => a.id === id) || loadContentItem('archetypes', id);
  if (!item) return c.json({ error: `Archetype "${id}" not found` }, 404);
  return c.json(item);
});

app.get('/v1/blueprints/:id', (c) => {
  const id = c.req.param('id');
  const item = contentCache.blueprints.find(b => b.id === id) || loadContentItem('blueprints', id);
  if (!item) return c.json({ error: `Blueprint "${id}" not found` }, 404);
  return c.json(item);
});

app.get('/v1/recipes/:id', (c) => {
  const id = c.req.param('id');
  const item = contentCache.recipes.find(r => r.id === id) || loadContentItem('recipes', id);
  if (!item) return c.json({ error: `Recipe "${id}" not found` }, 404);
  return c.json(item);
});

app.get('/v1/themes/:id', (c) => {
  const id = c.req.param('id');
  const item = contentCache.themes.find(t => t.id === id) || loadContentItem('themes', id);
  if (!item) return c.json({ error: `Theme "${id}" not found` }, 404);
  return c.json(item);
});

// Schema endpoint
app.get('/v1/schema', (c) => {
  const schemaPath = join(__dirname, '..', '..', '..', 'packages', 'essence-spec', 'schema', 'essence.v2.json');
  if (!existsSync(schemaPath)) {
    return c.json({ error: 'Schema not found' }, 404);
  }
  const schema = JSON.parse(readFileSync(schemaPath, 'utf-8'));
  return c.json(schema);
});

// Validate endpoint
app.post('/v1/validate', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  // Basic validation (full validation would import essence-spec)
  if (!body.version) {
    return c.json({ valid: false, errors: ['Missing required field: version'] });
  }
  if (!body.platform) {
    return c.json({ valid: false, errors: ['Missing required field: platform'] });
  }
  if (!body.structure && !body.sections) {
    return c.json({ valid: false, errors: ['Missing required field: structure or sections'] });
  }

  return c.json({ valid: true, errors: [] });
});

// Search endpoint
app.get('/v1/search', (c) => {
  const query = c.req.query('q')?.toLowerCase() || '';
  const type = c.req.query('type');

  if (!query) {
    return c.json({ error: 'Query parameter "q" is required' }, 400);
  }

  const results = [];

  const searchIn = (items, typeName) => {
    if (type && type !== typeName) return;
    for (const item of items) {
      const searchable = [item.name, item.description, ...(item.tags || []), ...(item.components || [])].join(' ').toLowerCase();
      if (searchable.includes(query)) {
        results.push({
          type: typeName,
          id: item.id,
          name: item.name,
          description: item.description,
        });
      }
    }
  };

  searchIn(contentCache.patterns, 'pattern');
  searchIn(contentCache.archetypes, 'archetype');
  searchIn(contentCache.blueprints, 'blueprint');
  searchIn(contentCache.recipes, 'recipe');
  searchIn(contentCache.themes, 'theme');

  return c.json({ total: results.length, results });
});

// --- Start ---

const port = parseInt(process.env.PORT || '3000', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`Decantr API running at http://localhost:${port}`);
});
