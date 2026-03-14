import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function run() {
  const cwd = process.cwd();
  const essencePath = join(cwd, 'decantr.essence.json');
  const configPath = join(cwd, 'decantr.config.json');
  const registryRoot = join(__dirname, '..', '..', 'src', 'registry');

  // Read essence
  let essence;
  try {
    essence = JSON.parse(await readFile(essencePath, 'utf-8'));
  } catch (e) {
    console.error('  ✗ decantr.essence.json not found or invalid JSON');
    console.error('    Run the CLARIFY stage to create your project essence.');
    process.exitCode = 1;
    return;
  }

  const errors = [];
  const warnings = [];

  // Detect schema form
  const isSectioned = Array.isArray(essence.sections);
  const isSimple = typeof essence.terroir === 'string' || essence.terroir === null;

  if (!isSectioned && !isSimple) {
    errors.push('Essence must have either "terroir" (simple) or "sections" (sectioned)');
  }

  // Known archetypes
  const KNOWN_ARCHETYPES = ['ecommerce', 'saas-dashboard', 'portfolio', 'content-site', 'docs-explorer', 'financial-dashboard'];

  // Known styles
  const KNOWN_STYLES = ['auradecantism', 'clean', 'retro', 'glassmorphism', 'command-center'];

  // Validate vintage
  function validateVintage(vintage, prefix) {
    if (!vintage) return;
    if (vintage.style && !KNOWN_STYLES.includes(vintage.style)) {
      warnings.push(`${prefix}vintage.style "${vintage.style}" is not a built-in style (may be registered via registerStyle()). Built-in: ${KNOWN_STYLES.join(', ')}`);
    }
    if (vintage.mode && !['light', 'dark', 'auto'].includes(vintage.mode)) {
      errors.push(`${prefix}vintage.mode must be light|dark|auto, got "${vintage.mode}"`);
    }
  }

  // Validate structure entries
  function validateStructure(structure, prefix) {
    if (!Array.isArray(structure)) return;
    for (const page of structure) {
      if (!page.id) errors.push(`${prefix}structure entry missing "id"`);
      if (!page.skeleton) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "skeleton"`);
      if (!page.blend && !page.patterns) warnings.push(`${prefix}structure entry "${page.id || '?'}" missing "blend"`);
    }
  }

  if (isSectioned) {
    // Sectioned validation
    const sectionPaths = new Set();
    for (const section of essence.sections) {
      if (!section.id) errors.push('Section missing "id"');
      if (!section.path) errors.push(`Section "${section.id || '?'}" missing "path"`);
      if (section.path && sectionPaths.has(section.path)) {
        errors.push(`Duplicate section path: "${section.path}"`);
      }
      if (section.path) sectionPaths.add(section.path);

      if (section.terroir && !KNOWN_ARCHETYPES.includes(section.terroir)) {
        errors.push(`Section "${section.id}": terroir "${section.terroir}" is not a known archetype`);
      }

      validateVintage(section.vintage, `Section "${section.id || '?'}": `);
      validateStructure(section.structure, `Section "${section.id || '?'}": `);
    }

    // Check shared_tannins not duplicated in sections
    if (Array.isArray(essence.shared_tannins)) {
      for (const section of essence.sections) {
        if (Array.isArray(section.tannins)) {
          for (const t of section.tannins) {
            if (essence.shared_tannins.includes(t)) {
              warnings.push(`Tannin "${t}" is in both shared_tannins and section "${section.id}"`);
            }
          }
        }
      }
    }
  } else {
    // Simple validation
    if (essence.terroir && !KNOWN_ARCHETYPES.includes(essence.terroir)) {
      errors.push(`terroir "${essence.terroir}" is not a known archetype. Known: ${KNOWN_ARCHETYPES.join(', ')}`);
    }
    validateVintage(essence.vintage, '');
    validateStructure(essence.structure, '');
  }

  // Vessel validation
  if (essence.vessel) {
    if (essence.vessel.type && !['spa', 'mpa'].includes(essence.vessel.type)) {
      warnings.push(`vessel.type "${essence.vessel.type}" is unusual (expected spa|mpa)`);
    }
    if (essence.vessel.routing && !['hash', 'history'].includes(essence.vessel.routing)) {
      errors.push(`vessel.routing must be hash|history, got "${essence.vessel.routing}"`);
    }
  }

  // Cork validation
  if (essence.cork && typeof essence.cork !== 'object') {
    errors.push('cork must be an object');
  }

  // Cross-reference with config
  try {
    const config = JSON.parse(await readFile(configPath, 'utf-8'));
    const essenceStyle = isSectioned ? null : essence.vintage?.style;
    const essenceMode = isSectioned ? null : essence.vintage?.mode;

    if (essenceStyle && config.style && essenceStyle !== config.style) {
      warnings.push(`Style mismatch: essence="${essenceStyle}", config="${config.style}". Essence is authoritative.`);
    }
    if (essenceMode && config.mode && essenceMode !== config.mode) {
      warnings.push(`Mode mismatch: essence="${essenceMode}", config="${config.mode}". Essence is authoritative.`);
    }

    // Validate icons config
    if (config.icons != null) {
      if (typeof config.icons !== 'object' || Array.isArray(config.icons)) {
        errors.push('icons must be an object');
      } else if (config.icons.library != null && typeof config.icons.library !== 'string') {
        errors.push('icons.library must be a string');
      } else if (config.icons.library) {
        const KNOWN_LIBS = ['lucide', 'heroicons', 'material', 'fontawesome', 'phosphor', 'tabler', 'feather'];
        if (!KNOWN_LIBS.includes(config.icons.library)) {
          warnings.push(`icons.library "${config.icons.library}" is not a recognized library (known: ${KNOWN_LIBS.join(', ')}). LLM code generation will use it as-is.`);
        }
      }
    }
  } catch {
    // No config file — that's fine
  }

  // ─── Generate prerequisites ───────────────────────────────────

  // Collect all structures for validation
  const allStructures = isSectioned
    ? essence.sections.flatMap(s => s.structure || [])
    : (essence.structure || []);

  // Warn on empty structure
  if (allStructures.length === 0) {
    warnings.push('No pages in structure — `decantr generate` will have nothing to produce');
  }

  // Check patterns in blend arrays exist in registry
  try {
    const patternFiles = await readdir(join(registryRoot, 'patterns'));
    const knownPatterns = new Set(patternFiles.filter(f => f.endsWith('.json') && f !== 'index.json').map(f => f.replace('.json', '')));

    for (const page of allStructures) {
      const blend = page.blend || page.patterns || [];
      for (const item of blend) {
        const ids = typeof item === 'string' ? [item] : (item.cols || []);
        for (const id of ids) {
          if (!knownPatterns.has(id)) {
            warnings.push(`Page "${page.id}": pattern "${id}" in blend not found in registry`);
          }
        }
      }
    }
  } catch {
    // Registry not accessible — skip pattern validation
  }

  // Check skeletons referenced exist
  try {
    const skeletonsData = JSON.parse(await readFile(join(registryRoot, 'skeletons.json'), 'utf-8'));
    const knownSkeletons = new Set(Object.keys(skeletonsData.skeletons || {}));

    for (const page of allStructures) {
      if (page.skeleton && !knownSkeletons.has(page.skeleton)) {
        warnings.push(`Page "${page.id}": skeleton "${page.skeleton}" not found in skeletons.json`);
      }
    }
  } catch {
    // skeletons.json not accessible — skip
  }

  // Check recipe referenced in vintage exists
  const allVintages = isSectioned
    ? essence.sections.map(s => s.vintage).filter(Boolean)
    : (essence.vintage ? [essence.vintage] : []);

  try {
    const registryFiles = await readdir(registryRoot);
    const knownRecipes = new Set(
      registryFiles.filter(f => f.startsWith('recipe-') && f.endsWith('.json')).map(f => f.replace('recipe-', '').replace('.json', ''))
    );

    for (const vintage of allVintages) {
      if (vintage.recipe && !knownRecipes.has(vintage.recipe)) {
        warnings.push(`Recipe "${vintage.recipe}" referenced in vintage not found in registry. Known: ${[...knownRecipes].join(', ')}`);
      }
    }
  } catch {
    // Registry not accessible — skip
  }

  // Report
  if (errors.length === 0 && warnings.length === 0) {
    const mode = isSectioned ? `sectioned (${essence.sections.length} sections)` : `simple (${essence.terroir || 'unset'})`;
    console.log(`  ✓ Essence valid — ${mode}`);
  } else {
    if (errors.length > 0) {
      console.error(`\n  ${errors.length} error(s):`);
      for (const e of errors) console.error(`    ✗ ${e}`);
    }
    if (warnings.length > 0) {
      console.log(`\n  ${warnings.length} warning(s):`);
      for (const w of warnings) console.log(`    ⚠ ${w}`);
    }
    if (errors.length > 0) process.exitCode = 1;
  }
}
