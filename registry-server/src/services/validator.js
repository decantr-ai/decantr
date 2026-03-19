/**
 * Server-side artifact validator — ported from tools/registry-validator.js.
 *
 * Validates content type, ID, version, size, and type-specific structure.
 */

// ── Constants ────────────────────────────────────────────────────

export const VALID_TYPES = ['style', 'recipe', 'pattern', 'archetype', 'plugin', 'template'];

const ID_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;

const BUILT_IN_IDS = {
  style: ['auradecantism', 'clean', 'glassmorphism', 'retro', 'bioluminescent', 'clay', 'dopamine', 'editorial', 'liquid-glass', 'prismatic', 'gaming-guild'],
  recipe: ['auradecantism', 'clean', 'clay', 'gaming-guild'],
  pattern: ['hero', 'card-grid', 'data-table', 'kpi-grid', 'filter-bar', 'activity-feed', 'chart-grid', 'stat-card', 'stats-bar', 'stats-section', 'timeline', 'form-sections', 'pricing-table', 'testimonials', 'footer-columns', 'logo-strip', 'cta-section', 'post-list', 'category-nav', 'detail-header', 'detail-panel', 'comparison-panel', 'pipeline-tracker', 'goal-tracker', 'scorecard', 'showcase-gallery', 'code-preview', 'chat-interface', 'wizard', 'steps-card', 'checklist-card', 'announcement-bar', 'photo-to-recipe', 'contact-form', 'auth-form', 'article-content', 'filter-sidebar', 'component-showcase'],
  archetype: ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community', 'gaming-platform', 'creative-tool'],
  plugin: [],
  template: ['saas-dashboard', 'ecommerce', 'portfolio', 'content-site', 'landing-page'],
};

const SIZE_LIMITS = {
  style: 10 * 1024,
  recipe: 50 * 1024,
  pattern: 50 * 1024,
  archetype: 100 * 1024,
  plugin: 100 * 1024,
  template: 500 * 1024,
};

// Dangerous patterns to reject
const UNSAFE_PATTERNS = [
  /\beval\s*\(/,
  /\bnew\s+Function\s*\(/,
  /\bdocument\.cookie\b/,
];

// ── Validators ───────────────────────────────────────────────────

export function validateId(id, type) {
  const errors = [];
  if (!id || typeof id !== 'string') {
    errors.push('ID is required and must be a string');
    return { valid: false, errors };
  }
  if (!ID_PATTERN.test(id)) {
    errors.push(`ID "${id}" must be kebab-case, 2-50 characters, starting with a letter`);
  }
  if (BUILT_IN_IDS[type]?.includes(id)) {
    errors.push(`ID "${id}" conflicts with a built-in ${type}`);
  }
  return { valid: errors.length === 0, errors };
}

export function validateVersion(version) {
  const errors = [];
  if (!version || typeof version !== 'string') {
    errors.push('Version is required');
    return { valid: false, errors };
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    errors.push(`Version "${version}" must be valid semver (X.Y.Z)`);
  }
  return { valid: errors.length === 0, errors };
}

export function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

function validateStyleArtifact(content) {
  const errors = [];
  const warnings = [];
  if (!content.includes('export')) errors.push('Style must have a named export');
  if (!content.includes('id:') && !content.includes('id :')) errors.push('Style object must have an "id" field');
  if (!content.includes('name:') && !content.includes('name :')) errors.push('Style object must have a "name" field');
  if (!content.includes('seed:') && !content.includes('seed :')) errors.push('Style object must have a "seed" field');
  if (content.includes('import ') && !content.includes("from 'decantr")) {
    warnings.push('Style imports from non-decantr modules');
  }
  return { valid: errors.length === 0, errors, warnings };
}

function validateRecipeArtifact(content) {
  const errors = [];
  const warnings = [];
  let data;
  try { data = JSON.parse(content); } catch {
    return { valid: false, errors: ['Recipe must be valid JSON'], warnings };
  }
  if (!data.id) errors.push('Recipe must have an "id" field');
  if (!data.name) errors.push('Recipe must have a "name" field');
  if (!data.style) errors.push('Recipe must reference a "style"');
  if (!data.decorators || typeof data.decorators !== 'object') {
    warnings.push('Recipe has no decorators — it may be empty');
  }
  return { valid: errors.length === 0, errors, warnings };
}

function validatePatternArtifact(content) {
  const errors = [];
  const warnings = [];
  let data;
  try { data = JSON.parse(content); } catch {
    return { valid: false, errors: ['Pattern must be valid JSON'], warnings };
  }
  if (!data.id) errors.push('Pattern must have an "id" field');
  if (!data.name) errors.push('Pattern must have a "name" field');
  if (!data.default_blend) warnings.push('Pattern has no default_blend');
  if (!data.components || !Array.isArray(data.components)) warnings.push('Pattern has no components list');
  return { valid: errors.length === 0, errors, warnings };
}

function validateArchetypeArtifact(content) {
  const errors = [];
  const warnings = [];
  let data;
  try { data = JSON.parse(content); } catch {
    return { valid: false, errors: ['Archetype must be valid JSON'], warnings };
  }
  if (!data.id) errors.push('Archetype must have an "id" field');
  if (!data.name) errors.push('Archetype must have a "name" field');
  if (!data.pages || !Array.isArray(data.pages)) errors.push('Archetype must have a "pages" array');
  return { valid: errors.length === 0, errors, warnings };
}

function validatePluginArtifact(content) {
  const errors = [];
  const warnings = [];
  if (!content.includes('export')) errors.push('Plugin must have an export');
  if (content.includes('import ') && !content.includes("from 'decantr")) {
    warnings.push('Plugin imports from non-decantr modules');
  }
  return { valid: errors.length === 0, errors, warnings };
}

export function validateArtifact(type, content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, errors: ['Artifact content is empty or not a string'], warnings: [] };
  }

  const sizeLimit = SIZE_LIMITS[type];
  if (sizeLimit && Buffer.byteLength(content) > sizeLimit) {
    return {
      valid: false,
      errors: [`Artifact exceeds size limit of ${sizeLimit} bytes (${Buffer.byteLength(content)} bytes)`],
      warnings: [],
    };
  }

  switch (type) {
    case 'style': return validateStyleArtifact(content);
    case 'recipe': return validateRecipeArtifact(content);
    case 'pattern': return validatePatternArtifact(content);
    case 'archetype': return validateArchetypeArtifact(content);
    case 'plugin': return validatePluginArtifact(content);
    case 'template': return { valid: true, errors: [], warnings: [] };
    default: return { valid: false, errors: [`Unknown content type: ${type}`], warnings: [] };
  }
}

/**
 * Safety scan — reject dangerous code patterns.
 */
export function safetyScan(content) {
  const errors = [];
  const warnings = [];
  for (const pat of UNSAFE_PATTERNS) {
    if (pat.test(content)) {
      errors.push(`Content contains unsafe pattern: ${pat.source}`);
    }
  }
  return { safe: errors.length === 0, errors, warnings };
}

/**
 * Full pre-publish validation.
 */
export function validateForPublish(type, id, version, content, latestVersion) {
  const errors = [];
  const warnings = [];

  if (!VALID_TYPES.includes(type)) {
    errors.push(`Invalid content type: "${type}". Valid: ${VALID_TYPES.join(', ')}`);
    return { valid: false, errors, warnings };
  }

  const idResult = validateId(id, type);
  errors.push(...idResult.errors);

  const versionResult = validateVersion(version);
  errors.push(...versionResult.errors);

  if (latestVersion && versionResult.valid) {
    if (compareSemver(version, latestVersion) <= 0) {
      errors.push(`Version ${version} must be greater than latest published version ${latestVersion}`);
    }
  }

  const artifactResult = validateArtifact(type, content);
  errors.push(...artifactResult.errors);
  warnings.push(...artifactResult.warnings);

  // Safety scan
  const safety = safetyScan(content);
  errors.push(...safety.errors);
  warnings.push(...safety.warnings);

  return { valid: errors.length === 0, errors, warnings };
}
