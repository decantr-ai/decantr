#!/usr/bin/env node

/**
 * Seed built-in content metadata — self-contained, no external file deps.
 *
 * Run: node scripts/import-builtins.js
 */

import { initDb, getDb, closeDb } from '../src/db/index.js';

initDb();
const db = getDb();

// Create system user for built-in content
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

let imported = 0;

function seed(type, id, name, description, tags, metadata) {
  const existing = db.prepare('SELECT id FROM content WHERE type = ? AND content_id = ?').get(type, id);
  if (existing) return;

  db.prepare(`
    INSERT INTO content (type, content_id, name, description, tags, ai_summary, latest_version, author_id, metadata, status)
    VALUES (?, ?, ?, ?, ?, ?, '0.0.0', ?, ?, 'active')
  `).run(type, id, name, description, JSON.stringify(tags), `Built-in ${type}: ${name}`, systemUserId, JSON.stringify(metadata));
  imported++;
}

// ── Styles ───────────────────────────────────────────────────────
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

// ── Patterns ─────────────────────────────────────────────────────
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

for (const [id, name, desc, tags] of patterns) {
  seed('pattern', id, name, desc, tags, {});
}

// ── Archetypes ───────────────────────────────────────────────────
seed('archetype', 'ecommerce', 'E-Commerce', 'Online store with catalog, cart, and checkout', ['store', 'shop', 'products'], { terroir_affinity: ['ecommerce'], character: ['commercial', 'conversion-focused'] });
seed('archetype', 'saas-dashboard', 'SaaS Dashboard', 'Data-rich dashboard with sidebar navigation', ['dashboard', 'saas', 'analytics'], { terroir_affinity: ['saas-dashboard'], character: ['tactical', 'data-dense'] });
seed('archetype', 'portfolio', 'Portfolio', 'Personal or agency showcase site', ['portfolio', 'showcase', 'creative'], { terroir_affinity: ['portfolio'], character: ['creative', 'minimal'] });
seed('archetype', 'content-site', 'Content Site', 'Blog, magazine, or documentation site', ['blog', 'content', 'editorial'], { terroir_affinity: ['content-site'], character: ['readable', 'organized'] });
seed('archetype', 'workbench', 'Workbench', 'Technical documentation workbench with sidebar navigation', ['docs', 'documentation', 'reference', 'workbench'], { terroir_affinity: ['workbench'], character: ['technical', 'organized'] });
seed('archetype', 'gaming-platform', 'Gaming Platform', 'Gaming community hub with profiles and stats', ['gaming', 'community', 'social'], { terroir_affinity: ['gaming-platform'], character: ['immersive', 'energetic'] });

// ── Recipes ──────────────────────────────────────────────────────
seed('recipe', 'auradecantism', 'Auradecantism', 'Default recipe with mesh gradients and glass panels', ['default', 'gradient'], { style: 'auradecantism' });
seed('recipe', 'clean', 'Clean', 'Minimal recipe for the clean style', ['minimal', 'light'], { style: 'clean' });
seed('recipe', 'clay', 'Clay', 'Soft clay morphism recipe', ['clay', '3d'], { style: 'clay' });

// ── Vignettes ─────────────────────────────────────────────────────
seed('vignette', 'saas-dashboard', 'SaaS Dashboard', 'Analytics and admin dashboard with KPIs, data tables, charts, user management, and settings.', ['dashboard', 'saas', 'analytics'], { compose: ['saas-dashboard'] });
seed('vignette', 'ecommerce', 'E-Commerce', 'Online retail with product catalog, cart, checkout, and account management.', ['ecommerce', 'store', 'shop'], { compose: ['ecommerce'] });
seed('vignette', 'portfolio', 'Portfolio', 'Personal or agency portfolio with project showcase, bio, and contact.', ['portfolio', 'showcase', 'creative'], { compose: ['portfolio'] });
seed('vignette', 'content-site', 'Content Site', 'Blog, magazine, or documentation site with post list and article views.', ['blog', 'content', 'editorial'], { compose: ['content-site'] });
seed('vignette', 'workbench', 'Workbench', 'Technical documentation workbench with sidebar navigation and API reference.', ['docs', 'documentation', 'workbench'], { compose: ['workbench'] });
seed('vignette', 'financial-dashboard', 'Financial Dashboard', 'Financial analytics with portfolio overview, transactions, and reporting.', ['finance', 'dashboard', 'analytics'], { compose: ['financial-dashboard'] });
seed('vignette', 'gaming-platform', 'Gaming Platform', 'Gaming community hub with profiles, leaderboards, and stats.', ['gaming', 'community', 'social'], { compose: ['gaming-platform'] });
seed('vignette', 'recipe-community', 'Recipe Community', 'Food and recipe sharing community with discovery and user profiles.', ['food', 'community', 'recipes'], { compose: ['recipe-community'] });
seed('vignette', 'ecommerce-admin', 'E-Commerce Admin', 'Admin panel for managing orders, products, and customers.', ['ecommerce', 'admin', 'dashboard'], { compose: ['ecommerce-admin'] });
seed('vignette', 'cloud-platform', 'Cloud Platform', 'Cloud infrastructure dashboard with resource management and monitoring.', ['cloud', 'infrastructure', 'devops'], { compose: ['cloud-platform'] });

// --from <dir>: Seed from a local Decantr project
const fromIdx = process.argv.indexOf('--from');
if (fromIdx !== -1 && process.argv[fromIdx + 1]) {
  try {
    const { seedFromDirectory } = await import('./seed-from-dir.js');
    const dir = process.argv[fromIdx + 1];
    const localImported = seedFromDirectory(db, dir, systemUserId);
    console.log(`Imported ${localImported} local content entries from ${dir}.`);
  } catch (err) {
    console.error(`Failed to seed from local directory: ${err.message}`);
    process.exitCode = 1;
  }
}

console.log(`Imported ${imported} built-in content entries.`);
closeDb();
