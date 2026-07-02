import { readdirSync, readFileSync } from 'fs';
import { basename, join } from 'path';
import Ajv2020 from 'ajv/dist/2020.js';
import {
  CONTENT_DIRECTORIES,
  DIRECTORY_TO_SCHEMA_URL,
  SCHEMA_FILES,
  isIgnoredLocalContentFile,
} from './scripts/content-contract.js';
import {
  CERTIFICATION_TIERS,
  getContentCertification,
  lintDangerousScaffoldingPolicy,
} from './scripts/content-certification.js';
import { emitContentTelemetry } from './scripts/telemetry.js';

let errors = 0;
let warnings = 0;
let total = 0;
const startedAt = Date.now();

function fail(msg) {
  console.error(`  FAIL ${msg}`);
  errors++;
}

function warn(msg) {
  console.log(`  WARN ${msg}`);
  warnings++;
}

const validRoles = ['primary', 'gateway', 'public', 'auxiliary'];
const BLUEPRINT_PORTFOLIO_VISIBILITIES = ['featured', 'public', 'labs', 'hidden'];
const BLUEPRINT_PORTFOLIO_MATURITIES = [
  'certified-flagship',
  'supported-contract',
  'experimental',
  'fold-candidate',
  'legacy-hidden',
];
const BLUEPRINT_ARTIFACT_STATUSES = ['none', 'planned', 'candidate', 'certified'];

let blueprintIds = new Set();
try {
  blueprintIds = new Set(
    readdirSync('blueprints')
      .filter(file => file.endsWith('.json') && !isIgnoredLocalContentFile(file))
      .map(file => basename(file, '.json')),
  );
} catch {
  blueprintIds = new Set();
}

function loadJson(relativePath) {
  return JSON.parse(readFileSync(join(process.cwd(), relativePath), 'utf-8'));
}

function formatSchemaError(error) {
  const instancePath = error.instancePath || '/';
  return `${instancePath} ${error.message}`.trim();
}

const ajv = new Ajv2020({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});

ajv.addSchema(loadJson(join('schemas', SCHEMA_FILES.common)));

const validators = {
  patterns: ajv.compile(loadJson(join('schemas', SCHEMA_FILES.patterns))),
  themes: ajv.compile(loadJson(join('schemas', SCHEMA_FILES.themes))),
  blueprints: ajv.compile(loadJson(join('schemas', SCHEMA_FILES.blueprints))),
  archetypes: ajv.compile(loadJson(join('schemas', SCHEMA_FILES.archetypes))),
  shells: ajv.compile(loadJson(join('schemas', SCHEMA_FILES.shells))),
};

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.every(item => typeof item === 'string' && item.trim().length > 0);
}

function isRecordOfNonEmptyStrings(value) {
  return isRecord(value) && Object.values(value).every(item => typeof item === 'string' && item.trim().length > 0);
}

function isDependencyMap(value) {
  return isRecord(value) && Object.values(value).every(group => isRecordOfNonEmptyStrings(group));
}

function isPatternReference(value) {
  return typeof value === 'string'
    || (isRecord(value) && typeof value.pattern === 'string' && value.pattern.trim().length > 0);
}

function isLayoutGroup(value) {
  return isRecord(value)
    && Array.isArray(value.cols)
    && value.cols.every(item => isPatternReference(item))
    && (value.at === undefined || (typeof value.at === 'string' && value.at.trim().length > 0))
    && (value.span === undefined || (isRecord(value.span) && Object.values(value.span).every(item => typeof item === 'number')));
}

function isLayoutItem(value) {
  return isPatternReference(value) || isLayoutGroup(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

for (const type of CONTENT_DIRECTORIES) {
  let files;
  try {
    files = readdirSync(type).filter(f => f.endsWith('.json') && !isIgnoredLocalContentFile(f));
  } catch {
    console.log(`  Warning: directory ${type}/ not found`);
    continue;
  }

  for (const file of files) {
    total++;
    try {
      const content = JSON.parse(readFileSync(`${type}/${file}`, 'utf-8'));
      const expectedSchema = DIRECTORY_TO_SCHEMA_URL[type];

      if (content.$schema !== expectedSchema) {
        fail(`${type}/${file}: $schema must be "${expectedSchema}"`);
      }

      const validate = validators[type];
      if (!validate(content)) {
        for (const schemaError of validate.errors || []) {
          fail(`${type}/${file}: schema ${formatSchemaError(schemaError)}`);
        }
      }

      // --- ERROR checks (fail the build) ---

      if (!content.id && !content.slug) fail(`${type}/${file}: missing id or slug`);
      const expectedId = basename(file, '.json');
      if (content.id !== expectedId) {
        fail(`${type}/${file}: id must match filename (${expectedId})`);
      }

      const certification = getContentCertification(content);
      if (!CERTIFICATION_TIERS.includes(certification.tier)) {
        fail(`${type}/${file}: certification.tier must be one of: ${CERTIFICATION_TIERS.join(', ')}`);
      }
      const policyFindings = lintDangerousScaffoldingPolicy(content);
      if (policyFindings.length > 0 && certification.tier === 'enterprise') {
        fail(`${type}/${file}: enterprise content contains unsafe scaffolding policy: ${policyFindings.join(', ')}`);
      } else if (policyFindings.length > 0) {
        warn(`${type}/${file}: non-enterprise policy finding(s): ${policyFindings.join(', ')}`);
      }

      if (type === 'archetypes') {
        if (!content.role || !validRoles.includes(content.role)) {
          fail(`${type}/${file}: missing or invalid role (must be one of: ${validRoles.join(', ')})`);
        }

        if (!Array.isArray(content.pages) || content.pages.some(page => !isRecord(page)
          || typeof page.id !== 'string'
          || page.id.trim().length === 0
          || typeof page.shell !== 'string'
          || page.shell.trim().length === 0
          || !Array.isArray(page.default_layout)
          || page.default_layout.some(item => !isLayoutItem(item))
          || (page.patterns !== undefined && (!Array.isArray(page.patterns) || page.patterns.some(item => !isPatternReference(item))))
        )) {
          fail(`${type}/${file}: pages must define id, shell, and valid pattern/layout references`);
        }

        if (content.dependencies !== undefined && !isDependencyMap(content.dependencies)) {
          fail(`${type}/${file}: dependencies must be an object of dependency maps`);
        }

        if (content.shells !== undefined && !isRecordOfNonEmptyStrings(content.shells)) {
          fail(`${type}/${file}: shells must be an object of non-empty descriptions`);
        }

        if (content.suggested_theme !== undefined) {
          const suggestedTheme = content.suggested_theme;

          if (!isRecord(suggestedTheme)) {
            fail(`${type}/${file}: suggested_theme must be an object`);
          } else {
            if (Object.hasOwn(suggestedTheme, 'styles')) {
              fail(`${type}/${file}: suggested_theme.styles is legacy; use suggested_theme.ids`);
            }
            if (Object.hasOwn(suggestedTheme, 'id')) {
              fail(`${type}/${file}: suggested_theme.id is legacy; use suggested_theme.ids`);
            }
            if (Object.hasOwn(suggestedTheme, 'mode')) {
              fail(`${type}/${file}: suggested_theme.mode is legacy; use suggested_theme.modes`);
            }
            if (Object.hasOwn(suggestedTheme, 'shape')) {
              fail(`${type}/${file}: suggested_theme.shape is legacy; use suggested_theme.shapes`);
            }

            for (const [key, value] of Object.entries(suggestedTheme)) {
              if (!['ids', 'modes', 'shapes'].includes(key)) {
                fail(`${type}/${file}: suggested_theme.${key} is not supported`);
                continue;
              }
              if (!isNonEmptyStringArray(value)) {
                fail(`${type}/${file}: suggested_theme.${key} must be an array of non-empty strings`);
              }
            }
          }
        }

        if (content.personality !== undefined && !isNonEmptyStringArray(content.personality)) {
          fail(`${type}/${file}: personality must be an array of non-empty strings when present`);
        }

        if (content.hero_customization !== undefined && !isRecord(content.hero_customization)) {
          fail(`${type}/${file}: hero_customization must be an object when present`);
        }
      }
      if (type === 'blueprints') {
        const portfolio = content.blueprint_portfolio;
        if (!isRecord(portfolio)) {
          fail(`${type}/${file}: blueprint_portfolio is required`);
        } else {
          if (!BLUEPRINT_PORTFOLIO_VISIBILITIES.includes(portfolio.visibility)) {
            fail(`${type}/${file}: blueprint_portfolio.visibility must be one of: ${BLUEPRINT_PORTFOLIO_VISIBILITIES.join(', ')}`);
          }
          if (!BLUEPRINT_PORTFOLIO_MATURITIES.includes(portfolio.maturity)) {
            fail(`${type}/${file}: blueprint_portfolio.maturity must be one of: ${BLUEPRINT_PORTFOLIO_MATURITIES.join(', ')}`);
          }
          if (!isNonEmptyString(portfolio.rationale)) {
            fail(`${type}/${file}: blueprint_portfolio.rationale must be a non-empty string`);
          }

          const alternative = portfolio.recommended_alternative;
          if ((portfolio.visibility === 'hidden' || portfolio.maturity === 'fold-candidate' || portfolio.maturity === 'legacy-hidden') && !isNonEmptyString(alternative)) {
            fail(`${type}/${file}: blueprint_portfolio.recommended_alternative is required for hidden, fold-candidate, or legacy-hidden blueprints`);
          }
          if (isNonEmptyString(alternative)) {
            if (alternative === content.id) {
              fail(`${type}/${file}: blueprint_portfolio.recommended_alternative must not point to itself`);
            } else if (!blueprintIds.has(alternative)) {
              fail(`${type}/${file}: blueprint_portfolio.recommended_alternative must point to an existing blueprint id`);
            }
          }

          const artifact = portfolio.artifact;
          if (!isRecord(artifact)) {
            fail(`${type}/${file}: blueprint_portfolio.artifact is required`);
          } else {
            if (!BLUEPRINT_ARTIFACT_STATUSES.includes(artifact.status)) {
              fail(`${type}/${file}: blueprint_portfolio.artifact.status must be one of: ${BLUEPRINT_ARTIFACT_STATUSES.join(', ')}`);
            }
            if (artifact.showcase !== undefined && !isNonEmptyString(artifact.showcase)) {
              fail(`${type}/${file}: blueprint_portfolio.artifact.showcase must be a non-empty string when present`);
            }
            if (artifact.notes !== undefined && !isNonEmptyString(artifact.notes)) {
              fail(`${type}/${file}: blueprint_portfolio.artifact.notes must be a non-empty string when present`);
            }
            if (artifact.status === 'certified' && portfolio.maturity !== 'certified-flagship') {
              fail(`${type}/${file}: blueprint_portfolio.artifact.status=certified requires maturity=certified-flagship`);
            }
            if (portfolio.maturity === 'certified-flagship' && artifact.status !== 'certified') {
              fail(`${type}/${file}: blueprint_portfolio.maturity=certified-flagship requires artifact.status=certified`);
            }
          }
        }

        if (!isRecord(content.theme) || typeof content.theme.id !== 'string' || content.theme.id.trim().length === 0) {
          fail(`${type}/${file}: theme.id is required`);
        } else if (Object.hasOwn(content.theme, 'style')) {
          fail(`${type}/${file}: theme.style is legacy; use theme.id`);
        }

        if (!isRecord(content.routes)) {
          fail(`${type}/${file}: routes must be an object`);
        }

        if (content.compose !== undefined && (!Array.isArray(content.compose) || content.compose.some(entry => !(
          typeof entry === 'string'
          || (isRecord(entry)
            && typeof entry.archetype === 'string'
            && entry.archetype.trim().length > 0
            && typeof entry.prefix === 'string'
            && entry.prefix.trim().length > 0
            && (entry.role === undefined || validRoles.includes(entry.role))
          )
        )))) {
          fail(`${type}/${file}: compose entries must be strings or { archetype, prefix, role? } objects`);
        }

        if (content.overrides !== undefined) {
          const { overrides } = content;
          if (!isRecord(overrides)) {
            fail(`${type}/${file}: overrides must be an object`);
          } else {
            if (overrides.features_add !== undefined && !isNonEmptyStringArray(overrides.features_add)) {
              fail(`${type}/${file}: overrides.features_add must be an array of non-empty strings`);
            }
            if (overrides.features_remove !== undefined && !Array.isArray(overrides.features_remove)) {
              fail(`${type}/${file}: overrides.features_remove must be an array`);
            }
            if (overrides.pages_remove !== undefined && !Array.isArray(overrides.pages_remove)) {
              fail(`${type}/${file}: overrides.pages_remove must be an array`);
            }
            if (overrides.pages !== undefined && !isRecord(overrides.pages)) {
              fail(`${type}/${file}: overrides.pages must be an object`);
            }
          }
        }

        if (content.navigation !== undefined) {
          const { navigation } = content;
          if (!isRecord(navigation)) {
            fail(`${type}/${file}: navigation must be an object`);
          } else {
            // command_palette accepts boolean (legacy "enabled?" flag) or a
            // structured CommandPaletteContract object. The full shape is
            // validated by AJV against common.v1.json#/$defs/commandPaletteContract;
            // this custom check just gates out string/number/array.
            if (
              navigation.command_palette !== undefined &&
              typeof navigation.command_palette !== 'boolean' &&
              !isRecord(navigation.command_palette)
            ) {
              fail(`${type}/${file}: navigation.command_palette must be a boolean or a structured contract object`);
            }
            if (navigation.hotkeys !== undefined && (!Array.isArray(navigation.hotkeys) || navigation.hotkeys.some(hotkey => !isRecord(hotkey)
              || typeof hotkey.key !== 'string'
              || hotkey.key.trim().length === 0
              || (hotkey.route !== undefined && (typeof hotkey.route !== 'string' || hotkey.route.trim().length === 0))
              || (hotkey.label !== undefined && (typeof hotkey.label !== 'string' || hotkey.label.trim().length === 0))
            ))) {
              fail(`${type}/${file}: navigation.hotkeys must contain objects with a non-empty key`);
            }
          }
        }

        if (content.seo_hints !== undefined) {
          const { seo_hints: seoHints } = content;
          if (!isRecord(seoHints)) {
            fail(`${type}/${file}: seo_hints must be an object`);
          } else {
            if (seoHints.schema_org !== undefined && !isNonEmptyStringArray(seoHints.schema_org)) {
              fail(`${type}/${file}: seo_hints.schema_org must be an array of non-empty strings`);
            }
            if (seoHints.meta_priorities !== undefined && !isNonEmptyStringArray(seoHints.meta_priorities)) {
              fail(`${type}/${file}: seo_hints.meta_priorities must be an array of non-empty strings`);
            }
          }
        }

        if (content.dependencies !== undefined && !isDependencyMap(content.dependencies)) {
          fail(`${type}/${file}: dependencies must be an object of dependency maps`);
        }

        if (content.suggested_themes !== undefined && !isNonEmptyStringArray(content.suggested_themes)) {
          fail(`${type}/${file}: suggested_themes must be an array of non-empty strings`);
        }

        const composeIds = Array.isArray(content.compose)
          ? content.compose.map(e => typeof e === 'string' ? e : e.archetype)
          : [];
        const routeEntries = isRecord(content.routes) ? Object.entries(content.routes) : [];
        for (const [path, route] of routeEntries) {
          if (!isRecord(route)) {
            fail(`${type}/${file}: route "${path}" must be an object`);
            continue;
          }
          if (route.archetype && !composeIds.includes(route.archetype)) {
            fail(`${type}/${file}: route "${path}" references archetype "${route.archetype}" not in compose`);
          }
        }
      }

      // --- Quality gate WARNINGS (do not fail the build) ---

      if (type === 'patterns') {
        if (!content.visual_brief && !content.layout_hints) {
          warn(`${type}/${file}: missing both visual_brief and layout_hints`);
        }
        if (!content.components || !Array.isArray(content.components) || content.components.length === 0) {
          warn(`${type}/${file}: missing or empty components array`);
        }
        if (content.presets) {
          for (const [presetName, preset] of Object.entries(content.presets)) {
            if (preset.description && preset.description.length < 30) {
              warn(`${type}/${file}: preset "${presetName}" description shorter than 30 chars`);
            }
          }
        }
      }

      if (type === 'blueprints') {
        if (content.personality === undefined || content.personality === null) {
          warn(`${type}/${file}: missing personality`);
        } else if (Array.isArray(content.personality) && content.personality.length === 0) {
          warn(`${type}/${file}: personality is empty array`);
        } else if (typeof content.personality === 'string' && content.personality.length === 0) {
          warn(`${type}/${file}: personality is empty`);
        } else if (typeof content.personality === 'string' && content.personality.length < 100) {
          warn(`${type}/${file}: personality shorter than 100 chars`);
        }
      }

      if (type === 'themes') {
        if (content.palette) {
          const semanticColors = Object.keys(content.palette);
          if (semanticColors.length < 5) {
            warn(`${type}/${file}: palette has fewer than 5 semantic colors (${semanticColors.length})`);
          }
        }
        if (!content.decorators) {
          warn(`${type}/${file}: no decorators defined`);
        } else {
          for (const [name, desc] of Object.entries(content.decorators)) {
            if (typeof desc === 'string' && desc.length < 20) {
              warn(`${type}/${file}: decorator "${name}" description shorter than 20 chars`);
            }
          }
        }
      }

    } catch (e) {
      fail(`${type}/${file}: invalid JSON - ${e.message}`);
    }
  }
}

console.log(`\nValidated ${total} files: ${errors} errors, ${warnings} quality warnings`);

await emitContentTelemetry({
  name: 'content.validation.completed',
  properties: {
    valid: errors === 0,
    durationMs: Date.now() - startedAt,
    errorCount: errors,
    itemCount: total,
    warningCount: warnings,
  },
});

process.exit(errors > 0 ? 1 : 0);
