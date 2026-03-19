/**
 * Registry Artifact Validator — validates content artifacts for
 * publish and post-install verification.
 *
 * @module tools/registry-validator
 */

import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

// ── Constants ────────────────────────────────────────────────────

const VALID_TYPES = ['style', 'recipe', 'pattern', 'archetype', 'plugin', 'template'];

const ID_PATTERN = /^[a-z][a-z0-9-]{1,49}$/;

const BUILT_IN_IDS = {
  style: ['auradecantism', 'clean', 'glassmorphism', 'retro', 'bioluminescent', 'launchpad', 'dopamine', 'editorial', 'liquid-glass', 'prismatic', 'gaming-guild'],
  recipe: ['auradecantism', 'clean', 'launchpad', 'gaming-guild'],
  pattern: ['hero', 'card-grid', 'data-table', 'kpi-grid', 'filter-bar', 'activity-feed', 'chart-grid', 'stat-card', 'stats-bar', 'stats-section', 'timeline', 'form-sections', 'pricing-table', 'testimonials', 'footer-columns', 'logo-strip', 'cta-section', 'post-list', 'category-nav', 'detail-header', 'detail-panel', 'comparison-panel', 'pipeline-tracker', 'goal-tracker', 'scorecard', 'showcase-gallery', 'code-preview', 'chat-interface', 'wizard', 'steps-card', 'checklist-card', 'announcement-bar', 'photo-to-recipe', 'contact-form', 'auth-form', 'article-content', 'filter-sidebar', 'component-showcase'],
  archetype: ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard', 'recipe-community', 'gaming-platform', 'cloud-platform'],
  plugin: [],
  template: ['saas-dashboard', 'ecommerce', 'portfolio', 'content-site', 'landing-page'],
};

/** Maximum file sizes in bytes per content type. */
const SIZE_LIMITS = {
  style: 10 * 1024,
  recipe: 50 * 1024,
  pattern: 50 * 1024,
  archetype: 100 * 1024,
  plugin: 100 * 1024,
  template: 500 * 1024,
};

// ── Helpers ──────────────────────────────────────────────────────

/**
 * Compute SHA-256 checksum of content.
 * @param {string} content
 * @returns {string} Prefixed checksum string
 */
export function computeChecksum(content) {
  const hash = createHash('sha256').update(content).digest('hex');
  return `sha256:${hash}`;
}

/**
 * Verify a file's checksum matches the expected value.
 * @param {string} filePath - Absolute file path
 * @param {string} expectedChecksum - Expected checksum (sha256:...)
 * @returns {Promise<boolean>}
 */
export async function verifyChecksum(filePath, expectedChecksum) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return computeChecksum(content) === expectedChecksum;
  } catch {
    return false;
  }
}

// ── Validation ───────────────────────────────────────────────────

/**
 * Validate a content ID.
 * @param {string} id
 * @param {string} type
 * @returns {{valid: boolean, errors: string[]}}
 */
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

/**
 * Validate a semver version string.
 * @param {string} version
 * @returns {{valid: boolean, errors: string[]}}
 */
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

/**
 * Compare semver versions. Returns 1 if a > b, -1 if a < b, 0 if equal.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareSemver(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return 1;
    if (pa[i] < pb[i]) return -1;
  }
  return 0;
}

/**
 * Validate a style artifact.
 * @param {string} content - JavaScript source code
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateStyleArtifact(content) {
  const errors = [];
  const warnings = [];

  if (!content.includes('export')) {
    errors.push('Style must have a named export');
  }
  // Check for required fields in the style object
  if (!content.includes("id:") && !content.includes("id :")) {
    errors.push('Style object must have an "id" field');
  }
  if (!content.includes("name:") && !content.includes("name :")) {
    errors.push('Style object must have a "name" field');
  }
  if (!content.includes("seed:") && !content.includes("seed :")) {
    errors.push('Style object must have a "seed" field');
  }
  // Warn on potential issues
  if (content.includes('import ') && !content.includes("from 'decantr")) {
    warnings.push('Style imports from non-decantr modules — ensure no third-party runtime dependencies');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a recipe artifact.
 * @param {string} content - JSON string
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateRecipeArtifact(content) {
  const errors = [];
  const warnings = [];

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    errors.push('Recipe must be valid JSON');
    return { valid: false, errors, warnings };
  }

  if (!data.id) errors.push('Recipe must have an "id" field');
  if (!data.name) errors.push('Recipe must have a "name" field');
  if (!data.style) errors.push('Recipe must reference a "style"');
  if (!data.decorators || typeof data.decorators !== 'object') {
    warnings.push('Recipe has no decorators — it may be empty');
  }

  // v2 optional fields validation
  if (data.spatial_hints) {
    if (typeof data.spatial_hints !== 'object') {
      errors.push('spatial_hints must be an object');
    } else {
      if (data.spatial_hints.density_bias != null && (data.spatial_hints.density_bias < -2 || data.spatial_hints.density_bias > 2)) {
        errors.push('spatial_hints.density_bias must be between -2 and 2');
      }
      if (data.spatial_hints.content_gap_shift != null && (data.spatial_hints.content_gap_shift < -2 || data.spatial_hints.content_gap_shift > 2)) {
        errors.push('spatial_hints.content_gap_shift must be between -2 and 2');
      }
      const validWrapping = ['always', 'minimal', 'none'];
      if (data.spatial_hints.card_wrapping && !validWrapping.includes(data.spatial_hints.card_wrapping)) {
        errors.push(`spatial_hints.card_wrapping must be one of: ${validWrapping.join(', ')}`);
      }
    }
  }

  if (data.skeleton) {
    if (typeof data.skeleton !== 'object') {
      errors.push('skeleton must be an object');
    } else {
      const validNavStyles = ['filled', 'pill', 'underline', 'minimal', 'icon-glow'];
      if (data.skeleton.nav_style && !validNavStyles.includes(data.skeleton.nav_style)) {
        warnings.push(`skeleton.nav_style "${data.skeleton.nav_style}" is not a known variant (${validNavStyles.join(', ')})`);
      }
      const validNavStates = ['expanded', 'rail'];
      if (data.skeleton.default_nav_state && !validNavStates.includes(data.skeleton.default_nav_state)) {
        errors.push(`skeleton.default_nav_state must be one of: ${validNavStates.join(', ')}`);
      }
      const validSkeletons = ['sidebar-main', 'top-nav-main', 'centered', 'full-bleed', 'minimal-header', 'top-nav-sidebar', 'sidebar-right', 'sidebar-main-footer', 'sidebar-aside', 'top-nav-footer'];
      if (data.skeleton.preferred) {
        for (const s of data.skeleton.preferred) {
          if (!validSkeletons.includes(s)) warnings.push(`skeleton.preferred "${s}" is not a known skeleton`);
        }
      }
      if (data.skeleton.avoid) {
        for (const s of data.skeleton.avoid) {
          if (!validSkeletons.includes(s)) warnings.push(`skeleton.avoid "${s}" is not a known skeleton`);
        }
      }
    }
  }

  if (data.animation) {
    if (typeof data.animation !== 'object') {
      errors.push('animation must be an object');
    } else {
      const validMicro = ['instant', 'snappy', 'smooth', 'bouncy'];
      if (data.animation.micro && !validMicro.includes(data.animation.micro)) {
        warnings.push(`animation.micro "${data.animation.micro}" is not a known variant (${validMicro.join(', ')})`);
      }
    }
  }

  if (data.pattern_preferences) {
    if (typeof data.pattern_preferences !== 'object') {
      errors.push('pattern_preferences must be an object');
    }
  }

  if (data.schema_version && data.schema_version !== '2.0' && data.schema_version !== '1.0') {
    warnings.push(`Unknown schema_version "${data.schema_version}"`);
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a pattern artifact.
 * @param {string} content - JSON string
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validatePatternArtifact(content) {
  const errors = [];
  const warnings = [];

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    errors.push('Pattern must be valid JSON');
    return { valid: false, errors, warnings };
  }

  if (!data.id) errors.push('Pattern must have an "id" field');
  if (!data.name) errors.push('Pattern must have a "name" field');
  if (!data.default_blend) warnings.push('Pattern has no default_blend');
  if (!data.components || !Array.isArray(data.components)) {
    warnings.push('Pattern has no components list');
  }

  // io field validation (optional, for cross-pattern wiring metadata)
  if (data.io) {
    if (typeof data.io !== 'object') {
      errors.push('io must be an object');
    } else {
      const validIoKeys = ['produces', 'consumes', 'actions'];
      for (const key of Object.keys(data.io)) {
        if (!validIoKeys.includes(key)) {
          warnings.push(`io has unknown key "${key}" — valid keys: ${validIoKeys.join(', ')}`);
        }
      }
      for (const key of validIoKeys) {
        if (data.io[key] && !Array.isArray(data.io[key])) {
          errors.push(`io.${key} must be an array`);
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an archetype artifact.
 * @param {string} content - JSON string
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateArchetypeArtifact(content) {
  const errors = [];
  const warnings = [];

  let data;
  try {
    data = JSON.parse(content);
  } catch {
    errors.push('Archetype must be valid JSON');
    return { valid: false, errors, warnings };
  }

  if (!data.id) errors.push('Archetype must have an "id" field');
  if (!data.name) errors.push('Archetype must have a "name" field');
  if (!data.pages || !Array.isArray(data.pages)) {
    errors.push('Archetype must have a "pages" array');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate a plugin artifact.
 * @param {string} content - JavaScript source code
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validatePluginArtifact(content) {
  const errors = [];
  const warnings = [];

  if (!content.includes('export')) {
    errors.push('Plugin must have an export');
  }
  if (content.includes('import ') && !content.includes("from 'decantr")) {
    warnings.push('Plugin imports from non-decantr modules — ensure no third-party runtime dependencies');
  }

  return { valid: errors.length === 0, errors, warnings };
}

/**
 * Validate an artifact by type.
 * @param {string} type - Content type (style, recipe, pattern, archetype, plugin, template)
 * @param {string} content - Artifact source code or JSON
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
 */
export function validateArtifact(type, content) {
  if (!content || typeof content !== 'string') {
    return { valid: false, errors: ['Artifact content is empty or not a string'], warnings: [] };
  }

  // Check size limit
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
    default:
      return { valid: false, errors: [`Unknown content type: ${type}`], warnings: [] };
  }
}

/**
 * Full pre-publish validation: ID + version + artifact content.
 * @param {string} type
 * @param {string} id
 * @param {string} version
 * @param {string} content
 * @param {string} [latestVersion] - Latest published version (for comparison)
 * @returns {{valid: boolean, errors: string[], warnings: string[]}}
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

  return { valid: errors.length === 0, errors, warnings };
}

export { VALID_TYPES, BUILT_IN_IDS, SIZE_LIMITS };
