#!/usr/bin/env node

/**
 * Local dev setup — initializes DB, seeds built-in content,
 * and creates a dev user with auth token.
 *
 * Run: node scripts/dev-setup.js
 *
 * Outputs a token you can use with:
 *   curl -H "Authorization: Bearer <token>" http://localhost:3000/v1/publish ...
 *
 * Or save to ~/.decantr/auth.json for CLI usage:
 *   node scripts/dev-setup.js --save-token
 */

import { randomBytes, createHash } from 'node:crypto';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { initDb, getDb, closeDb } from '../src/db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const saveToken = process.argv.includes('--save-token');

// Initialize DB + schema
initDb();
const db = getDb();

// ── 1. Seed built-in content ─────────────────────────────────────

const systemUser = db.prepare('SELECT id FROM users WHERE github_id = ?').get('0');
let systemUserId;
if (systemUser) {
  systemUserId = systemUser.id;
} else {
  const result = db.prepare(
    "INSERT INTO users (github_id, login, email, role) VALUES ('0', 'decantr', 'team@decantr.dev', 'admin')"
  ).run();
  systemUserId = result.lastInsertRowid;
}

let seeded = 0;

function seed(type, id, name, description, tags, metadata) {
  const existing = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get(type, id);
  if (existing) return;
  db.prepare(`
    INSERT INTO content (type, content_id, name, description, tags, ai_summary, latest_version, author_id, metadata, status)
    VALUES (?, ?, ?, ?, ?, ?, '0.0.0', ?, ?, 'active')
  `).run(type, id, name, description, JSON.stringify(tags), `Built-in ${type}: ${name}`, systemUserId, JSON.stringify(metadata));
  seeded++;
}

// Styles
seed('style', 'auradecantism', 'Auradecantism', 'Default core style with mesh gradients and glass effects', ['default', 'gradient', 'glass'], {});
seed('style', 'clean', 'Clean', 'Minimal and crisp with subtle shadows', ['minimal', 'light', 'professional'], {});
seed('style', 'glassmorphism', 'Glassmorphism', 'Frosted glass panels with transparency and blur', ['glass', 'blur', 'modern'], {});
seed('style', 'retro', 'Retro', 'Vintage computing aesthetic with pixel borders', ['retro', 'vintage', 'pixel'], { character: ['playful', 'nostalgic'] });
seed('style', 'bioluminescent', 'Bioluminescent', 'Deep ocean glow with organic light', ['glow', 'dark', 'organic'], { character: ['mysterious', 'immersive'] });
seed('style', 'clay', 'Clay', 'Soft 3D clay morphism with puffy surfaces', ['clay', '3d', 'soft'], { character: ['playful', 'friendly'] });
seed('style', 'dopamine', 'Dopamine', 'High-energy colors and bold contrasts', ['vibrant', 'bold', 'colorful'], { character: ['energetic', 'bold'] });
seed('style', 'editorial', 'Editorial', 'Magazine-quality typography and layout', ['typography', 'editorial', 'elegant'], { character: ['sophisticated', 'refined'] });
seed('style', 'liquid-glass', 'Liquid Glass', 'Flowing glass surfaces with refractive effects', ['glass', 'liquid', 'modern'], { character: ['modern', 'premium'] });
seed('style', 'prismatic', 'Prismatic', 'Rainbow light dispersion with spectral color shifts', ['rainbow', 'spectrum', 'colorful'], { character: ['creative', 'expressive'] });

// Patterns
const patterns = [
  ['hero', 'Hero', 'Full-width hero section with headline and CTA', ['landing', 'header']],
  ['card-grid', 'Card Grid', 'Responsive grid of cards with presets', ['grid', 'cards', 'products']],
  ['data-table', 'Data Table', 'Sortable, filterable data table', ['table', 'data', 'dashboard']],
  ['kpi-grid', 'KPI Grid', 'Key performance indicator cards', ['metrics', 'dashboard', 'kpi']],
  ['filter-bar', 'Filter Bar', 'Horizontal filter controls', ['filter', 'search', 'toolbar']],
  ['activity-feed', 'Activity Feed', 'Chronological event feed', ['feed', 'timeline', 'events']],
  ['chart-grid', 'Chart Grid', 'Grid of data visualizations', ['charts', 'dashboard', 'analytics']],
  ['form-sections', 'Form Sections', 'Multi-section form layout', ['form', 'settings', 'input']],
  ['pricing-table', 'Pricing Table', 'Tiered pricing comparison', ['pricing', 'plans', 'saas']],
  ['testimonials', 'Testimonials', 'Customer testimonial carousel or grid', ['social-proof', 'reviews']],
  ['footer-columns', 'Footer Columns', 'Multi-column site footer', ['footer', 'navigation']],
  ['cta-section', 'CTA Section', 'Call-to-action with headline and button', ['cta', 'conversion']],
  ['detail-header', 'Detail Header', 'Entity detail page header', ['detail', 'profile', 'header']],
  ['timeline', 'Timeline', 'Vertical timeline of events', ['timeline', 'history', 'events']],
  ['chat-interface', 'Chat Interface', 'Real-time messaging layout', ['chat', 'messaging', 'realtime']],
  ['wizard', 'Wizard', 'Multi-step workflow progression', ['wizard', 'steps', 'onboarding']],
  ['auth-form', 'Auth Form', 'Login and registration forms', ['auth', 'login', 'signup']],
  ['contact-form', 'Contact Form', 'Contact page form layout', ['form', 'contact', 'support']],
];
for (const [id, name, desc, tags] of patterns) seed('pattern', id, name, desc, tags, {});

// Archetypes
seed('archetype', 'ecommerce', 'E-Commerce', 'Online store with catalog, cart, and checkout', ['store', 'shop', 'products'], { terroir_affinity: ['ecommerce'], character: ['commercial', 'conversion-focused'] });
seed('archetype', 'saas-dashboard', 'SaaS Dashboard', 'Data-rich dashboard with sidebar navigation', ['dashboard', 'saas', 'analytics'], { terroir_affinity: ['saas-dashboard'], character: ['tactical', 'data-dense'] });
seed('archetype', 'portfolio', 'Portfolio', 'Personal or agency showcase site', ['portfolio', 'showcase', 'creative'], { terroir_affinity: ['portfolio'], character: ['creative', 'minimal'] });
seed('archetype', 'content-site', 'Content Site', 'Blog, magazine, or documentation site', ['blog', 'content', 'editorial'], { terroir_affinity: ['content-site'], character: ['readable', 'organized'] });
seed('archetype', 'docs-explorer', 'Docs Explorer', 'Technical documentation with sidebar navigation', ['docs', 'documentation', 'reference'], { terroir_affinity: ['docs-explorer'], character: ['technical', 'organized'] });
seed('archetype', 'gaming-platform', 'Gaming Platform', 'Gaming community hub with profiles and stats', ['gaming', 'community', 'social'], { terroir_affinity: ['gaming-platform'], character: ['immersive', 'energetic'] });

// Recipes
seed('recipe', 'auradecantism', 'Auradecantism', 'Default recipe with mesh gradients and glass panels', ['default', 'gradient'], { style: 'auradecantism' });
seed('recipe', 'clean', 'Clean', 'Minimal recipe for the clean style', ['minimal', 'light'], { style: 'clean' });
seed('recipe', 'clay', 'Clay', 'Soft clay morphism recipe', ['clay', '3d'], { style: 'clay' });

console.log(`Seeded ${seeded} built-in content entries.`);

// ── 2. Create dev user + token ───────────────────────────────────

let devUser = db.prepare("SELECT id FROM users WHERE login = 'dev'").get();
if (!devUser) {
  const result = db.prepare(
    "INSERT INTO users (github_id, login, email, role) VALUES ('99999', 'dev', 'dev@localhost', 'admin')"
  ).run();
  devUser = { id: result.lastInsertRowid };
  console.log('Created dev user (admin).');
} else {
  console.log('Dev user already exists.');
}

const rawToken = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(rawToken).digest('hex');
db.prepare('INSERT INTO auth_tokens (user_id, token_hash) VALUES (?, ?)').run(devUser.id, tokenHash);

console.log(`\nDev auth token:\n  ${rawToken}\n`);

if (saveToken) {
  const authDir = join(homedir(), '.decantr');
  mkdirSync(authDir, { recursive: true });
  const authFile = join(authDir, 'auth.json');
  writeFileSync(authFile, JSON.stringify({ token: rawToken, savedAt: new Date().toISOString() }, null, 2) + '\n', { mode: 0o600 });
  console.log(`Token saved to ${authFile}`);
  console.log('The CLI will use this token automatically.\n');
}

console.log('To use with curl:');
console.log(`  curl -H "Authorization: Bearer ${rawToken}" http://localhost:3000/v1/publish ...\n`);
console.log('To save for CLI usage later:');
console.log('  node scripts/dev-setup.js --save-token\n');
console.log('Start the server:');
console.log('  npm run dev\n');

// ── 3. Generate .env from .env.example if missing ────────────────

const envPath = join(projectRoot, '.env');
const envExamplePath = join(projectRoot, '.env.example');

if (!existsSync(envPath) && existsSync(envExamplePath)) {
  const template = readFileSync(envExamplePath, 'utf-8');
  writeFileSync(envPath, template);
  console.log('Generated .env from .env.example (edit to customize).\n');
} else if (existsSync(envPath)) {
  console.log('.env already exists — skipping generation.\n');
}

closeDb();
