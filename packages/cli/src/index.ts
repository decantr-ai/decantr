import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildGraphImpactContext,
  buildGraphRouteContext,
  type ExecutionPackBundle,
  type GraphSnapshot,
  graphPayloadString,
  summarizeGraphDiff,
} from '@decantr/core';
import type { EssenceFile, EssenceV4 } from '@decantr/essence-spec';
import { evaluateGuard, isV4, validateEssence } from '@decantr/essence-spec';
import type {
  ContentIntelligenceMetadata,
  ContentIntelligenceSource,
  ExecutionPackBundleResponse,
  PublicBlueprintSet,
  Blueprint as RegistryBlueprint,
  RegistryIntelligenceSummaryResponse,
  SelectedExecutionPackResponse,
  ShowcaseManifestResponse,
  ShowcaseShortlistReport,
  ShowcaseShortlistResponse,
} from '@decantr/registry';
import {
  CONTENT_TYPE_TO_API_CONTENT_TYPE,
  CONTENT_TYPES as GET_CONTENT_TYPES,
  getBlueprintPortfolioMetadata,
  isApiContentType,
  isContentIntelligenceSource,
  isContentType as isGetContentType,
  isPublicBlueprintSet,
  API_CONTENT_TYPES as LIST_CONTENT_TYPES,
  type Pattern,
  type PatternDiscoveryCandidate,
  patternToDiscoveryCandidate,
  RegistryAPIClient,
  rankPatternCandidates,
} from '@decantr/registry';
import {
  auditProject,
  critiqueFile as critiqueProjectFile,
  type FileCritiqueReport,
  LOOP_READINESS_V2_SCHEMA_URL,
  type LoopReadiness,
  type ProjectAuditReport,
  type ScanFindingV1,
  type ScanGraphPreviewV1,
  type ScanReport,
  scanProject as scanProjectReadOnly,
  type VerificationFinding,
} from '@decantr/verifier';
import { scanStyling } from './analyzers/styling.js';
import { writeArtifactReadme } from './artifacts.js';
import {
  applyAssistantBridge,
  buildAssistantBridgeContent,
  writeAssistantBridgePreview,
} from './assistant-bridge.js';
import { clearCredentials, getCredentials, saveCredentials } from './auth.js';
import { resolveBootstrapTarget } from './bootstrap.js';
import {
  mergeEssenceWithProposal,
  proposalPath,
  readBrownfieldProposal,
} from './brownfield-proposal.js';
import { loadBundledContentItem, loadBundledContentList } from './bundled-content.js';
import { cmdAddFeature, cmdAddPage, cmdAddSection } from './commands/add.js';
import { cmdAnalyze } from './commands/analyze.js';
import { cmdCi, cmdCiHelp } from './commands/ci.js';
import { cmdConnectCursor, cmdConnectHelp } from './commands/connect.js';
import { cmdCreate } from './commands/create.js';
import { cmdDoctor, cmdDoctorHelp } from './commands/doctor.js';
import type { ExportTarget } from './commands/export.js';
import { cmdExport } from './commands/export.js';
import { buildGraphArtifacts, cmdGraph, cmdGraphHelp } from './commands/graph.js';
import { cmdMagic } from './commands/magic.js';
import { cmdMigrate } from './commands/migrate.js';
import { cmdNewProject } from './commands/new-project.js';
import { cmdPublish } from './commands/publish.js';
import { cmdRefresh } from './commands/refresh.js';
import { cmdRegistryMirror } from './commands/registry-mirror.js';
import { cmdRemoveFeature, cmdRemovePage, cmdRemoveSection } from './commands/remove.js';
import { cmdResolve } from './commands/resolve.js';
import { cmdSyncDrift, resolveDriftEntries } from './commands/sync-drift.js';
import { cmdTelemetry } from './commands/telemetry.js';
import { cmdThemeSwitch } from './commands/theme-switch.js';
import { detectProject, formatDetection } from './detect.js';
import { buildGuardRegistryContext } from './guard-context.js';
// V4 C5 wiring — scan source for missing interaction implementations.
import { scanProjectInteractions } from './lib/scan-interactions.js';
import {
  acceptBrownfieldLocalLaw,
  changedFiles as collectChangedFiles,
  createBrownfieldCodifyProposal,
  createLocalLawTaskSummary,
  type LocalBehaviorObligationSummary,
  type LocalHostedPatternRef,
  localPatternsPath,
  localPatternsProposalPath,
  localRulesPath,
  localRulesProposalPath,
  readLocalPatternPack,
  routeImpacts,
  validateLocalLaw,
  writeBrownfieldCodifyProposal,
  writeHostedPatternMappingProposal,
} from './local-law.js';
import { seedOfflineRegistry } from './offline-content.js';
import {
  confirm,
  type InitOptions,
  mergeWithDefaults,
  parseFlags,
  runInteractivePrompts,
  runSimplifiedInit,
} from './prompts.js';
import { RegistryClient, syncRegistry } from './registry.js';
import {
  type ComposeSectionsResult,
  collectPatternIdsFromItems,
  composeArchetypes,
  composeSections,
  deriveTransitions,
  deriveZones,
  generateTopologySection,
  type LayoutItem,
  mapRegistryArchetypeToArchetypeData,
  mapRegistryPatternToPatternSpecSummary,
  mapRegistryThemeToThemeData,
  type PatternSpecSummary,
  refreshDerivedFiles,
  scaffoldMinimal,
  scaffoldProject,
  type ThemeData,
  writeExecutionPackBundleArtifacts,
  type ZoneInput,
} from './scaffold.js';
import {
  acceptStyleBridge,
  createStyleBridgeProposal,
  createStyleBridgeTaskSummary,
  styleBridgeMatches,
  styleBridgePath,
  styleBridgeProposalPath,
  writeStyleBridgeProposal,
} from './style-bridge.js';
import { optIn, sendCliCommandTelemetry } from './telemetry.js';
import {
  createTheme,
  deleteTheme,
  importTheme,
  listCustomThemes,
  validateCustomTheme,
} from './theme-commands.js';
import {
  type AdoptionMode,
  type AssistantBridgeMode,
  readBrownfieldInitSeed,
  resolveWorkflowPolicy,
  type WorkflowMode,
} from './workflow-model.js';
import { resolveWorkspaceInfo } from './workspace.js';

// ── Helpers ──

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

function heading(text: string): string {
  return `\n${BOLD}${text}${RESET}\n`;
}
function success(text: string): string {
  return `${GREEN}${text}${RESET}`;
}
function error(text: string): string {
  return `${RED}${text}${RESET}`;
}
function dim(text: string): string {
  return `${DIM}${text}${RESET}`;
}
function cyan(text: string): string {
  return `${CYAN}${text}${RESET}`;
}

function formatIntelligenceSummary(
  intelligence?: ContentIntelligenceMetadata | null,
): string | null {
  if (!intelligence) {
    return null;
  }

  const parts: string[] = [];
  const recommendationReasons = intelligence.recommendation_reasons ?? [];
  const recommendationBlockers = intelligence.recommendation_blockers ?? [];

  if (intelligence.recommended) {
    parts.push('recommended');
  }

  switch (intelligence.source) {
    case 'authored':
      parts.push('authored intelligence');
      break;
    case 'hybrid':
      parts.push('hybrid intelligence');
      break;
    case 'benchmark':
      parts.push('benchmark-backed');
      break;
    default:
      break;
  }

  switch (intelligence.verification_status) {
    case 'smoke-green':
      parts.push('smoke verified');
      break;
    case 'build-green':
      parts.push('build verified');
      break;
    case 'smoke-red':
      parts.push('smoke failed');
      break;
    case 'build-red':
      parts.push('build failed');
      break;
    default:
      break;
  }

  if (intelligence.confidence_tier === 'verified') {
    parts.push('verified confidence');
  } else if (intelligence.confidence_tier === 'high') {
    parts.push('high confidence');
  } else if (intelligence.confidence_tier === 'medium') {
    parts.push('medium confidence');
  } else if (intelligence.benchmark_confidence !== 'none') {
    parts.push(`${intelligence.benchmark_confidence} confidence`);
  }

  if (intelligence.quality_score != null) {
    parts.push(`quality ${intelligence.quality_score}`);
  }

  if (intelligence.recommended && recommendationReasons.length > 0) {
    parts.push(`because ${recommendationReasons[0]}`);
  } else if (!intelligence.recommended && recommendationBlockers.length > 0) {
    parts.push(`held back by ${recommendationBlockers[0]}`);
  }

  return parts.length > 0 ? parts.join(' | ') : null;
}

interface PromptContext {
  workflow: WorkflowMode;
  adoptionMode?: AdoptionMode;
  analysisArtifacts?: boolean;
  hasCompiledPacks?: boolean;
  archetype: string;
  blueprint?: string;
  theme: string;
  mode: string;
  target: string;
  pages: Array<{ id: string; sectionId?: string; shell: string; layout: string[] }>;
  personality: string[];
  features: string[];
  guard: string;
}

function extractPatternName(item: unknown): string {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    const obj = item as Record<string, unknown>;
    if (typeof obj.pattern === 'string') return obj.pattern;
    // Handle column layouts
    if (Array.isArray(obj.cols)) {
      return obj.cols.map(extractPatternName).join(' | ');
    }
  }
  return 'custom';
}

function generateGreenfieldPrompt(ctx: PromptContext): string {
  const lines: string[] = [];
  const usesDecantrCss = ctx.adoptionMode === 'decantr-css' || !ctx.adoptionMode;
  const hasCompiledPacks = ctx.hasCompiledPacks ?? true;

  lines.push('Build this greenfield application using the Decantr design system.');
  lines.push('');
  if (ctx.blueprint) lines.push(`Blueprint: ${ctx.blueprint}`);
  if (ctx.archetype) lines.push(`Primary archetype: ${ctx.archetype}`);
  if (ctx.theme) lines.push(`Theme: ${ctx.theme}${ctx.mode ? ` (${ctx.mode})` : ''}`);
  if (ctx.target) lines.push(`Target: ${ctx.target}`);
  if (ctx.pages.length > 0) {
    lines.push(
      `Routes/pages: ${ctx.pages
        .map((page) => `${page.sectionId ? `${page.sectionId}/` : ''}${page.id}:${page.shell}`)
        .join(', ')}`,
    );
  }
  lines.push('');
  lines.push(
    'This workspace is a new Decantr scaffold. Use the contract to create or extend the runtime deliberately, not to reverse-engineer a hidden starter.',
  );
  lines.push('');
  if (hasCompiledPacks) {
    lines.push('Treat the compiled execution-pack files as the primary source of truth.');
    lines.push(
      'Use narrative docs only as secondary explanation when the compiled packs are not enough.',
    );
  } else {
    lines.push(
      'Compiled execution-pack files are not present in this scaffold. Treat narrative Decantr context as the temporary source of truth and run `decantr refresh` after fixing the reported validation issue.',
    );
  }
  lines.push(
    'Use only files present in this workspace as the source of truth. If local scaffold files disagree, stop and report the mismatch instead of relying on external Decantr assumptions or prior examples.',
  );
  lines.push('');
  lines.push('Read in this order:');
  if (hasCompiledPacks) {
    lines.push(
      '1. .decantr/context/scaffold-pack.md — the canonical compiled contract. Contains route plan, shell layouts, navigation, Required Theme Decorators, and project-wide execution rules.',
    );
    lines.push(
      '2. Before section work, read the matching .decantr/context/section-*-pack.md first, then .decantr/context/section-*.md only for extra slot/layout detail.',
    );
    lines.push(
      '3. Before route work, read the matching .decantr/context/page-*-pack.md file. Its pattern layout and interaction checklists are contract.',
    );
    lines.push(
      '4. .decantr/context/scaffold.md for broader topology, route map, and voice guidance after the compact packs are understood.',
    );
    lines.push(
      '5. DECANTR.md as a lookup reference for atoms, treatments, decorators, interaction implementations, and guard rules. Do not let narrative docs override compiled packs.',
    );
    lines.push('');
    lines.push('═══ INTERACTIONS ARE CONTRACT, NOT GUIDANCE ═══');
    lines.push('');
    lines.push(
      'Each page pack lists "Interactions (MUST implement each)" per pattern. Implement the actual behavior, not visible text saying it exists. Use DECANTR.md only to look up the canonical implementation shape when needed.',
    );
    lines.push(
      'Examples: pointer handlers for dragging/panning, onWheel for zoom, onKeyDown + tabIndex for keyboard navigation, IntersectionObserver for scroll reveal, state updates for real-time indicators, and d-* motion classes where the contract calls for animation.',
    );
    lines.push('');
    lines.push(
      '`decantr check --strict` fails when a declared interaction has no matching implementation.',
    );
    lines.push('');
  } else {
    lines.push(
      '1. .decantr/context/scaffold.md for topology, route map, voice, and section inventory.',
    );
    lines.push(
      '2. The matching .decantr/context/section-*.md file before implementing each section.',
    );
    lines.push(
      '3. DECANTR.md for atoms, treatments, decorators, interaction shapes, and guard rules.',
    );
    lines.push(
      '4. Run `decantr refresh` and switch to compiled pack files once validation passes.',
    );
    lines.push('');
  }
  lines.push('═══ STYLING ADOPTION ═══');
  lines.push('');
  if (ctx.adoptionMode === 'contract-only') {
    lines.push(
      'This project is contract-only. Use Decantr packs for design intent and governance, but implement through the app runtime and styling system already present or explicitly chosen for this project.',
    );
    lines.push(
      'Do not install @decantr/css or add Decantr style files unless the adoption mode changes.',
    );
  } else if (ctx.adoptionMode === 'style-bridge') {
    lines.push(
      'This project uses Decantr style-bridge mode. Use generated bridge tokens as a mapping layer onto the selected styling system; @decantr/css is not required.',
    );
  } else {
    lines.push(
      'Use @decantr/css atoms via `css(...)` for layout, spacing, sizing, flex/grid, position, and typography sizing. Static visual values should not live in inline style props.',
    );
  }
  if (usesDecantrCss) {
    lines.push('');
    lines.push('Use these canonical compact atom shapes:');
    lines.push('- Layout: _flex, _col, _aic, _jcc, _jcsb, _grid, _gc3, _gc[2fr_1fr], _gap4, _wrap');
    lines.push('- Spacing/sizing: _p4, _py4, _px6, _wfull, _maxw[40rem], _mxauto, _h[20rem]');
    lines.push('- Position/type: _rel, _abs, _sticky, _top0, _text2xl, _textlg, _fgmuted');
    lines.push('- Responsive: _sm:gc2, _lg:gc3, _mdmax:p4, _lg:gc[1.05fr_1fr]');
    lines.push('');
    lines.push(
      'Use compact atom names: `_aic` not `_items-center`, `_jcsb` not `_justify-between`, `_wfull` not `_w-full`, `_top0` not `_t0`. For arbitrary values, use brackets such as `_maxw[72rem]`.',
    );
    lines.push('');
    lines.push(
      'Combine atoms with treatment / decorator strings: `className={css("_flex _col _gap4") + " d-card clean-card"}`.',
    );
  } else {
    lines.push('');
    lines.push(
      'When packs mention atoms, treatments, decorators, or shell class names, treat them as Decantr vocabulary and map the intent into the selected runtime. Keep the literal class names only if this project has a compatible implementation.',
    );
  }
  lines.push('');
  lines.push('Inline `style={{...}}` is ONLY acceptable for:');
  lines.push(
    '  1. CSS custom-property writes the contract requires (`--d-stagger-index`, theme color vars, etc.)',
  );
  lines.push(
    '  2. Truly dynamic geometry no atom can express (computed transforms, drag positions, live chart geometry).',
  );
  lines.push('');
  if (usesDecantrCss) {
    lines.push(
      'If a component accumulates static inline visual styles, migrate them to atoms, treatments, decorators, or CSS vars. `decantr check` flags inline-style drift.',
    );
  } else {
    lines.push(
      'If a component accumulates static inline visual styles, migrate them into the project styling system or mapped Decantr bridge variables. `decantr check` flags inline-style drift.',
    );
  }
  lines.push('');
  lines.push('═══ TREATMENT SURFACE — USE WHAT EXISTS ═══');
  lines.push('');
  if (usesDecantrCss) {
    lines.push(
      '60+ treatment classes ship in src/styles/treatments.css. Reach for these before inventing CSS:',
    );
    lines.push(
      '- Shells: d-shell + data-layout, d-shell-sidebar/main/aside/header/body/footer, d-shell-mobile-trigger/backdrop',
    );
    lines.push(
      '- Core UI: d-interactive, d-icon-btn, d-nav-link, d-step-chip, d-control, d-card, d-data, d-label, d-annotation',
    );
    lines.push(
      '- Overlays: d-modal, d-modal-backdrop, d-modal-panel, d-palette, d-tooltip, d-popover',
    );
    lines.push(
      '- Motion/type/data-viz: d-enter-*, d-stagger-children, d-pulse, d-lift-hover, d-display/headline/title, d-sparkline, d-conic-ring, d-heatmap-cell',
    );
  } else {
    lines.push(
      'The treatment names in the packs describe reusable UI roles. Map shells, cards, controls, overlays, motion, typography, and data-viz roles into the project styling system instead of inventing unrelated component language.',
    );
  }
  lines.push('');
  lines.push('Consult DECANTR.md only when you need the full table or exact data-* attributes.');
  lines.push('');
  lines.push('═══ THEME DECORATOR CONTRACT — APPLY OR THE THEME DOES NOT LAND ═══');
  lines.push('');
  if (hasCompiledPacks) {
    lines.push(
      'Each theme ships namespaced decorator classes (`clean-card`, `lum-glass`, `carbon-canvas`, `paper-card`, etc.). Apply the scaffold-pack.md "Required Theme Decorators" as additive classes alongside d-* treatments so the theme lands as more than token colors.',
    );
    lines.push(
      'Section packs may point back to the scaffold-pack table; scaffold-pack.md is authoritative.',
    );
  } else {
    lines.push(
      'Each theme ships namespaced decorator classes (`clean-card`, `lum-glass`, `carbon-canvas`, `paper-card`, etc.). Use DECANTR.md and section context to apply the theme, then rerun `decantr refresh` to restore the authoritative decorator table.',
    );
  }
  lines.push('');
  lines.push('═══ HARD RULES (NON-NEGOTIABLE) ═══');
  lines.push('');
  if (usesDecantrCss) {
    lines.push(
      '- Auth pages use `d-shell[data-layout="centered"]` with `d-shell-centered-card` around the form.',
    );
    lines.push(
      '- Command palette uses `d-modal[data-align="top"]` + `d-modal-backdrop` + `d-palette`; rows include Lucide icon, label, and d-kbd hotkey.',
    );
  } else {
    lines.push('- Auth pages use a centered shell with a focused centered-card form surface.');
    lines.push(
      '- Command palette uses an accessible modal/palette structure; rows include Lucide icon, label, and keyboard hint where the product contract calls for it.',
    );
  }
  lines.push(
    '- Use lucide-react for ALL iconography (already in package.json). Pick semantic icons (Bot, Activity, Database, Search) over generic ones. Do NOT inline SVGs for icons that have Lucide equivalents.',
  );
  lines.push(
    hasCompiledPacks
      ? '- Section Directives in section packs are execution rules for layout proportions, treatment stacks, copy conventions, and pattern fitness.'
      : '- Section context files are execution rules for layout proportions, treatment stacks, copy conventions, and pattern fitness until compiled packs are restored.',
  );
  lines.push(
    '- Filter chip rows / tab strips use `d-step-chip[data-step-state]`, not bare `d-interactive` buttons.',
  );
  lines.push(
    '- Do not render Decantr guard prose, implementation notes, keyboard shortcut hints, or treatment/debug labels as product UI unless a route/shell contract explicitly declares that text as user-facing.',
  );
  lines.push(
    '- Prevent layout collisions: hero content, CTA banners, cards, footers, and sticky chrome must not overlap or clip at desktop or mobile widths.',
  );
  lines.push('');
  lines.push('═══ IMPLEMENTATION RULES ═══');
  lines.push(
    hasCompiledPacks
      ? '- Do not invent routes, sections, shells, themes, or features beyond the compiled packs.'
      : '- Do not invent routes, sections, shells, themes, or features beyond decantr.essence.json and generated narrative context.',
  );
  lines.push(
    hasCompiledPacks
      ? '- Prefer scaffold-pack, section-pack, and page-pack guidance over narrative docs.'
      : '- Prefer decantr.essence.json and generated section context over assumptions from prior examples.',
  );
  lines.push(
    '- Start with the shell layouts and route structure first, then build section pages route by route.',
  );
  if (ctx.adoptionMode === 'decantr-css') {
    lines.push(
      '- Import src/styles/global.css, src/styles/tokens.css, and src/styles/treatments.css.',
    );
  } else if (ctx.adoptionMode === 'style-bridge') {
    lines.push(
      '- Import src/styles/tokens.css and src/styles/decantr-bridge.css where appropriate.',
    );
  } else {
    lines.push(
      '- Keep styling imports aligned with the selected runtime; Decantr does not own CSS here.',
    );
  }
  lines.push(
    usesDecantrCss
      ? '- Use the existing Decantr tokens, treatments, and decorators instead of inventing a new visual system.'
      : '- Map Decantr tokens, treatments, and decorators into the selected runtime instead of inventing an unrelated visual system.',
  );
  lines.push(
    '- If package.json, app entry files, or router/runtime files are absent, create them for the declared target.',
  );
  lines.push(
    usesDecantrCss
      ? '- Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables.'
      : '- Colors, spacing, borders, shadows, gradients, and transitions should come from the project styling system or mapped Decantr variables.',
  );
  lines.push(
    '- Let shells own spacing, centering, and scroll containers unless the route contract says otherwise.',
  );
  lines.push(
    '- If command_palette or hotkeys are declared, implement them as real features rather than visible copy.',
  );
  lines.push(
    '- Treat declared hotkeys as interaction bindings by default, not visible navigation label text, unless the shell or route contract explicitly calls for shown shortcut hints.',
  );
  lines.push(
    '- If a required decorator class is missing from generated CSS, report the contract gap instead of inventing a parallel system.',
  );
  lines.push(
    '- Do not modify generated context files unless the task is explicitly to regenerate or refresh Decantr context.',
  );
  lines.push('');
  lines.push('═══ EXECUTION FLOW ═══');
  lines.push('- Build the shell and shared layout first.');
  lines.push(
    hasCompiledPacks
      ? "- Then implement each section's pages using the matching section and page packs."
      : "- Then implement each section's pages using decantr.essence.json and the matching section context.",
  );
  lines.push(
    '- After implementation, run `decantr check` (primary gate) and `decantr audit` (supplementary diagnostics).',
  );
  lines.push('- Fix all violations until `decantr check` exits 0.');
  lines.push(
    '- If a required context file is missing or inconsistent, stop and report exactly which file is missing before continuing.',
  );

  return lines.join('\n');
}

function generateBrownfieldPrompt(ctx: PromptContext): string {
  const lines: string[] = [];

  lines.push(
    ctx.workflow === 'hybrid-compose'
      ? 'Compose the requested Decantr registry contract into this existing application without rebuilding it from scratch.'
      : 'Attach Decantr to this existing application without rebuilding it from scratch.',
  );
  lines.push('');
  if (ctx.blueprint) lines.push(`Blueprint: ${ctx.blueprint}`);
  if (ctx.archetype) lines.push(`Primary archetype: ${ctx.archetype}`);
  if (ctx.theme) lines.push(`Theme: ${ctx.theme}${ctx.mode ? ` (${ctx.mode})` : ''}`);
  if (ctx.target) lines.push(`Target: ${ctx.target}`);
  if (ctx.pages.length > 0) {
    lines.push(
      `Routes/pages: ${ctx.pages
        .map((page) => `${page.sectionId ? `${page.sectionId}/` : ''}${page.id}:${page.shell}`)
        .join(', ')}`,
    );
  }
  lines.push('');
  lines.push(
    'Preserve the current framework, package manager, router, build tooling, and working runtime structure unless the generated Decantr contract gives you a reviewed reason to change them.',
  );
  lines.push('');
  if (ctx.analysisArtifacts) {
    lines.push('Treat .decantr/analysis.json as the factual inventory of the current app.');
    lines.push(
      'Treat .decantr/doctrine-map.json, .decantr/ambient-context.json, and .decantr/brownfield-report.md as the ranked doctrine inventory and conflict report.',
    );
    lines.push(
      'Treat the accepted observed proposal as the source of Decantr route/section coverage.',
    );
  } else {
    lines.push(
      'No Decantr analysis seed is present. Start by inventorying the app before changing runtime files.',
    );
  }
  lines.push(
    'Treat the compiled execution-pack files as the Decantr contract you are layering onto the app.',
  );
  lines.push(
    'Use only files present in this workspace as the source of truth. If the runtime and contract disagree, call out the drift explicitly instead of improvising a rewrite.',
  );
  lines.push('');
  lines.push('Read in this order:');
  if (ctx.analysisArtifacts) {
    lines.push(
      '1. .decantr/analysis.json for the detected framework, routes, styling, layout, and dependencies.',
    );
    lines.push(
      '2. .decantr/doctrine-map.json for ranked source precedence across security/data, architecture, design-system, workflow, feature, and assistant evidence.',
    );
    lines.push(
      '3. .decantr/ambient-context.json for assistant rules, docs, design-system, CI, schema, and workflow evidence.',
    );
    lines.push(
      '4. .decantr/brownfield-report.md for conflicts, stale risks, and acceptance context.',
    );
    lines.push('5. DECANTR.md for guard rules, CSS expectations, and Decantr operating rules.');
    lines.push(
      '6. .decantr/context/scaffold-pack.md for the compact compiled shell, theme, feature, and route contract.',
    );
    lines.push(
      '7. .decantr/context/scaffold.md for broader topology, route map, and voice guidance.',
    );
    lines.push(
      '8. The matching section and page pack files only when you are working on those specific surfaces.',
    );
  } else {
    lines.push(
      '1. Inventory existing framework, routes, styling, layout, rule files, and dependencies.',
    );
    lines.push('2. DECANTR.md for guard rules, adoption mode, and Decantr operating rules.');
    lines.push(
      '3. .decantr/context/scaffold-pack.md for the compact compiled shell, theme, feature, and route contract.',
    );
    lines.push(
      '4. .decantr/context/scaffold.md for broader topology, route map, and voice guidance.',
    );
    lines.push(
      '5. The matching section and page pack files only when you are working on those specific surfaces.',
    );
  }
  lines.push('');
  lines.push('Implementation rules:');
  lines.push(
    '- Preserve existing files and working flows whenever possible. Prefer incremental attachment over whole-app rewrites.',
  );
  lines.push(
    '- Map existing routes and components onto the declared Decantr sections/pages before creating new files.',
  );
  lines.push(
    '- If package.json, router files, or style files already exist, extend them deliberately instead of replacing them with a different starter shape.',
  );
  if (ctx.adoptionMode === 'decantr-css') {
    lines.push(
      '- If Decantr style files are absent, add src/styles/global.css, src/styles/tokens.css, and src/styles/treatments.css in a way that fits the current app structure.',
    );
    lines.push(
      '- Use the existing Decantr tokens, treatments, and decorators instead of inventing a parallel visual system.',
    );
  } else if (ctx.adoptionMode === 'style-bridge') {
    lines.push(
      '- Use Decantr bridge files as a mapping layer onto the existing styling system; do not install @decantr/css unless explicitly requested.',
    );
  } else {
    lines.push(
      '- Keep the existing styling system. Do not add Decantr CSS files or @decantr/css unless the adoption mode changes.',
    );
  }
  lines.push(
    ctx.workflow === 'hybrid-compose'
      ? '- Registry content is part of this task. Layer it onto the current app through existing route/component anchors before creating new runtime structure.'
      : '- Registry content is optional in this workflow unless the task explicitly asks for blueprint/theme/pattern enrichment.',
  );
  lines.push(
    '- Do not invent routes, sections, shells, themes, or features that are not present in the compiled packs.',
  );
  if (ctx.adoptionMode === 'decantr-css') {
    lines.push(
      '- Do not use inline visual style values or component-scoped <style> tags as the primary styling path. Colors, spacing, borders, shadows, gradients, and transitions should come from atoms, treatments, decorators, or CSS variables.',
    );
  }
  lines.push(
    '- Let shells own spacing, centering, and scroll containers. Preserve app structure, but remove duplicated shell responsibilities when the contract makes them explicit.',
  );
  lines.push(
    '- If command_palette or hotkeys are declared in the generated context, implement them as real features.',
  );
  lines.push(
    '- If a required decorator class is referenced in the contract but missing from generated CSS, report the contract gap instead of inventing a parallel visual system.',
  );
  lines.push(
    '- Do not modify generated context files unless the task is explicitly to regenerate or refresh Decantr context.',
  );
  lines.push('');
  lines.push('Execution flow:');
  lines.push(
    '- Start by inventorying the current runtime and identifying the safest route/component anchors for attachment.',
  );
  lines.push(
    '- Align the shared shell and route structure incrementally instead of replacing the app shell wholesale.',
  );
  lines.push('- Then attach or refine section pages using the matching section and page packs.');
  lines.push(
    '- After implementation, run decantr check --brownfield and decantr audit and fix contract or drift issues.',
  );
  lines.push(
    '- If a required context file or runtime anchor is missing, stop and report exactly what is missing before continuing.',
  );

  return lines.join('\n');
}

function generateCuratedPrompt(ctx: PromptContext): string {
  return ctx.workflow === 'brownfield-attach' || ctx.workflow === 'hybrid-compose'
    ? generateBrownfieldPrompt(ctx)
    : generateGreenfieldPrompt(ctx);
}

function getAPIClient(): RegistryAPIClient {
  return new RegistryAPIClient({
    baseUrl: process.env.DECANTR_API_URL || undefined,
    apiKey: process.env.DECANTR_API_KEY || undefined,
  });
}

function getPublicAPIClient(): RegistryAPIClient {
  return new RegistryAPIClient({
    baseUrl: process.env.DECANTR_API_URL || undefined,
  });
}

function resolveUserPath(inputPath: string, cwd: string = process.cwd()): string {
  return isAbsolute(inputPath) ? inputPath : resolve(cwd, inputPath);
}

function extractHostedAssetPaths(indexHtml: string): string[] {
  const assetPaths = new Set<string>();

  for (const match of indexHtml.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    const assetPath = match[1];
    const assetsIndex = assetPath.indexOf('/assets/');
    if (assetsIndex === -1) continue;
    assetPaths.add(assetPath.slice(assetsIndex));
  }

  return [...assetPaths];
}

function readHostedDistSnapshot(
  distPath?: string,
): { indexHtml: string; assets?: Record<string, string> } | undefined {
  const resolvedDistPath = distPath ? resolveUserPath(distPath) : join(process.cwd(), 'dist');
  const indexPath = join(resolvedDistPath, 'index.html');
  if (!existsSync(indexPath)) {
    return undefined;
  }

  const indexHtml = readFileSync(indexPath, 'utf-8');
  const assetPaths = extractHostedAssetPaths(indexHtml);
  const assets: Record<string, string> = {};

  for (const assetPath of assetPaths) {
    const assetFilePath = join(resolvedDistPath, assetPath.replace(/^[/\\]+/, ''));
    if (existsSync(assetFilePath)) {
      assets[assetPath] = readFileSync(assetFilePath, 'utf-8');
    }
  }

  return {
    indexHtml,
    assets,
  };
}

function isHostedSourceSnapshotFile(path: string): boolean {
  if (/\.d\.ts$/i.test(path)) return false;
  return /\.(?:[cm]?[jt]sx?)$/i.test(path);
}

function readHostedSourceSnapshot(
  sourcePath?: string,
): { files: Record<string, string> } | undefined {
  if (!sourcePath) return undefined;

  const resolvedSourcePath = resolveUserPath(sourcePath);
  if (!existsSync(resolvedSourcePath)) {
    return undefined;
  }

  const files: Record<string, string> = {};
  const ignoredDirNames = new Set([
    'node_modules',
    '.git',
    '.decantr',
    'dist',
    'build',
    'coverage',
  ]);
  const rootPrefix = basename(resolvedSourcePath);

  const walk = (absoluteDir: string, relativeDir: string) => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (ignoredDirNames.has(entry.name)) continue;
      const absolutePath = join(absoluteDir, entry.name);
      const relativePath = join(relativeDir, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walk(absolutePath, relativePath);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!isHostedSourceSnapshotFile(relativePath)) continue;
      files[relativePath] = readFileSync(absolutePath, 'utf-8');
    }
  };

  walk(resolvedSourcePath, rootPrefix);
  return Object.keys(files).length > 0 ? { files } : undefined;
}

async function getShowcaseBenchmarkView(
  view: 'manifest' | 'shortlist' | 'verification' = 'shortlist',
) {
  const client = getPublicAPIClient();

  if (view === 'manifest') {
    return client.getShowcaseManifest();
  }

  if (view === 'verification') {
    return client.getShowcaseShortlistVerification();
  }

  return client.getShowcaseShortlist();
}

async function printShowcaseBenchmarks(
  view: 'manifest' | 'shortlist' | 'verification',
  jsonOutput: boolean,
) {
  const fmtBytes = (bytes: number) =>
    bytes >= 1_000_000 ? `${(bytes / 1_000_000).toFixed(2)} MB` : `${Math.round(bytes / 1_000)} KB`;
  const data = await getShowcaseBenchmarkView(view);

  if (jsonOutput) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (view === 'manifest') {
    const manifest = data as ShowcaseManifestResponse;
    console.log(heading('Showcase Corpus'));
    console.log(`  Active apps: ${manifest.total}`);
    console.log(`  Shortlisted apps: ${manifest.shortlisted}`);
    console.log('');
    for (const entry of manifest.apps) {
      const verification = entry.verification;
      const verificationSummary = verification
        ? ` | ${verification.verificationStatus} | drift ${verification.drift.signal}`
        : '';
      console.log(`  ${cyan(entry.slug)}  class ${entry.classification}${verificationSummary}`);
    }
    return;
  }

  if (view === 'verification') {
    const report = data as ShowcaseShortlistReport;
    console.log(heading('Showcase Verification'));
    if (report.generatedAt) {
      console.log(`  Generated: ${report.generatedAt}`);
    }
    if (report.summary) {
      console.log(`  Passed builds: ${report.summary.passedBuilds}/${report.summary.appCount}`);
      console.log(`  Avg build: ${report.summary.averageDurationMs} ms`);
      console.log(`  Passed smokes: ${report.summary.passedSmokes}/${report.summary.appCount}`);
      console.log(`  Avg smoke: ${report.summary.averageSmokeDurationMs} ms`);
      console.log(
        `  Title checks: ${report.summary.appsWithTitleOkCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Lang checks: ${report.summary.appsWithLangOkCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Viewport checks: ${report.summary.appsWithViewportOkCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Charset checks: ${report.summary.appsWithCharsetOkCount}/${report.summary.appCount}`,
      );
      console.log(
        `  No inline scripts: ${report.summary.appsWithoutInlineScriptsCount}/${report.summary.appCount}`,
      );
      console.log(
        `  CSP signals: ${report.summary.appsWithCspSignalCount}/${report.summary.appCount}`,
      );
      console.log(
        `  External script integrity ok: ${report.summary.appsWithExternalScriptIntegrityCount}/${report.summary.appCount}`,
      );
      console.log(
        `  External stylesheet integrity ok: ${report.summary.appsWithExternalStylesheetIntegrityCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Route coverage: ${report.summary.appsWithRouteCoverageCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Full route coverage: ${report.summary.appsWithFullRouteCoverageCount}/${report.summary.appCount}`,
      );
      console.log(
        `  Avg assets: total ${fmtBytes(report.summary.averageTotalAssetBytes)} | js ${fmtBytes(report.summary.averageJsAssetBytes)} | css ${fmtBytes(report.summary.averageCssAssetBytes)}`,
      );
      console.log(
        `  Drift: lower ${report.summary.lowerDriftCount}, moderate ${report.summary.moderateDriftCount}, elevated ${report.summary.elevatedDriftCount}`,
      );
      console.log(
        `  Pack manifests: ${report.summary.withPackManifestCount}/${report.summary.appCount}`,
      );
      console.log('');
    }
    for (const entry of report.results) {
      console.log(
        `  ${cyan(entry.slug)}  ${entry.verificationStatus} | smoke ${entry.smoke.passed ? 'green' : entry.build.passed ? 'red' : 'pending'} | routes ${entry.smoke.routeDocumentsPassed}/${entry.smoke.routeDocumentsChecked}${entry.smoke.fullRouteCoverageOk ? ' full' : ' partial'} | js ${fmtBytes(entry.smoke.jsAssetBytes)} | drift ${entry.drift.signal} | build ${entry.build.durationMs} ms | smoke ${entry.smoke.durationMs} ms`,
      );
    }
    return;
  }

  const shortlist = data as ShowcaseShortlistResponse;

  console.log(heading('Showcase Shortlist'));
  if (shortlist.generatedAt) {
    console.log(`  Generated: ${shortlist.generatedAt}`);
  }
  if (shortlist.summary) {
    console.log(`  Passed builds: ${shortlist.summary.passedBuilds}/${shortlist.summary.appCount}`);
    console.log(`  Passed smokes: ${shortlist.summary.passedSmokes}/${shortlist.summary.appCount}`);
    console.log(
      `  Route coverage: ${shortlist.summary.appsWithRouteCoverageCount}/${shortlist.summary.appCount}`,
    );
    console.log(
      `  Full route coverage: ${shortlist.summary.appsWithFullRouteCoverageCount}/${shortlist.summary.appCount}`,
    );
    console.log(
      `  Drift mix: lower ${shortlist.summary.lowerDriftCount}, moderate ${shortlist.summary.moderateDriftCount}, elevated ${shortlist.summary.elevatedDriftCount}`,
    );
    console.log('');
  }
  for (const entry of shortlist.apps) {
    const verification = entry.verification;
    const verificationSummary = verification
      ? `${verification.verificationStatus} | smoke ${verification.smoke.passed ? 'green' : verification.build.passed ? 'red' : 'pending'} | drift ${verification.drift.signal}`
      : 'verification pending';
    console.log(`  ${cyan(entry.slug)}  class ${entry.classification} | ${verificationSummary}`);
  }
}

async function printRegistryIntelligenceSummary(namespace?: string, jsonOutput: boolean = false) {
  const client = getPublicAPIClient();
  const summary = await client.getRegistryIntelligenceSummary(
    namespace ? { namespace } : undefined,
  );

  if (jsonOutput) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const typedSummary = summary as RegistryIntelligenceSummaryResponse;
  console.log(heading('Registry Intelligence Summary'));
  console.log(`  Namespace: ${typedSummary.namespace ?? 'all public content'}`);
  console.log(`  Generated: ${typedSummary.generated_at}`);
  console.log(`  Public items: ${typedSummary.totals.total_public_items}`);
  console.log(`  With intelligence: ${typedSummary.totals.with_intelligence}`);
  console.log(`  Recommended: ${typedSummary.totals.recommended}`);
  console.log(
    `  Sources: authored ${typedSummary.totals.authored}, benchmark ${typedSummary.totals.benchmark}, hybrid ${typedSummary.totals.hybrid}, missing ${typedSummary.totals.missing_source}`,
  );
  console.log(
    `  Verification: smoke green ${typedSummary.totals.smoke_green}, build green ${typedSummary.totals.build_green}, high confidence ${typedSummary.totals.high_confidence}, verified ${typedSummary.totals.verified_confidence}`,
  );
  console.log('');

  for (const [type, bucket] of Object.entries(typedSummary.by_type)) {
    console.log(
      `  ${cyan(type.padEnd(10))} total ${bucket.total_public_items} | intelligence ${bucket.with_intelligence} | recommended ${bucket.recommended} | authored ${bucket.authored} | benchmark ${bucket.benchmark} | hybrid ${bucket.hybrid}`,
    );
  }
}

async function printHostedExecutionPackBundle(
  essencePath?: string,
  namespace?: string,
  jsonOutput: boolean = false,
  writeContext: boolean = false,
) {
  const { resolvedPath, bundle, contextDir } = await compileHostedExecutionPackBundle(
    essencePath,
    namespace,
  );

  let writtenContextPaths: string[] = [];
  if (writeContext) {
    const written = writeHostedExecutionPackContextArtifacts(
      contextDir,
      bundle as unknown as ExecutionPackBundle,
    );
    writtenContextPaths = written.paths;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(bundle, null, 2));
    return;
  }

  const typedBundle = bundle as ExecutionPackBundleResponse;
  console.log(heading('Hosted Execution Packs'));
  console.log(`  Source essence: ${resolvedPath}`);
  console.log(`  Essence version: ${typedBundle.sourceEssenceVersion}`);
  console.log(`  Generated: ${typedBundle.generatedAt}`);
  console.log(`  Adapter: ${typedBundle.scaffold.target.adapter}`);
  console.log(`  Shell: ${typedBundle.scaffold.data.shell}`);
  console.log(
    `  Theme: ${typedBundle.scaffold.data.theme.id} (${typedBundle.scaffold.data.theme.mode})`,
  );
  console.log(`  Pages: ${typedBundle.pages.length}`);
  console.log(`  Sections: ${typedBundle.sections.length}`);
  console.log(`  Mutations: ${typedBundle.mutations.length}`);
  if (writeContext) {
    console.log(`  Context bundle: ${contextDir}`);
    console.log(`  Files written: ${writtenContextPaths.length}`);
  }
  console.log('');
  console.log(`${BOLD}Route Plan:${RESET}`);
  for (const route of typedBundle.scaffold.data.routes) {
    const patterns = route.patternIds.length > 0 ? route.patternIds.join(', ') : 'none';
    const pageLabel = route.sectionId ? `${route.sectionId}/${route.pageId}` : route.pageId;
    console.log(`  ${cyan(route.path)} -> ${pageLabel} [${patterns}]`);
  }
}

async function compileHostedExecutionPackBundle(
  essencePath?: string,
  namespace?: string,
): Promise<{
  resolvedPath: string;
  bundle: unknown;
  contextDir: string;
}> {
  const client = getPublicAPIClient();
  const resolvedPath = essencePath
    ? resolveUserPath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');

  if (!existsSync(resolvedPath)) {
    throw new Error(`Essence file not found at ${resolvedPath}`);
  }

  const essence = JSON.parse(readFileSync(resolvedPath, 'utf-8')) as EssenceFile;
  const bundle = await client.compileExecutionPacks(essence, namespace ? { namespace } : undefined);
  const contextDir = join(dirname(resolvedPath), '.decantr', 'context');

  return { resolvedPath, bundle, contextDir };
}

function writeHostedExecutionPackContextArtifacts(
  contextDir: string,
  bundle: ExecutionPackBundle,
): { paths: string[] } {
  mkdirSync(contextDir, { recursive: true });
  return writeExecutionPackBundleArtifacts(contextDir, bundle);
}

function resolvePagePackIdForRoute(essencePath: string, route: string): string {
  if (!existsSync(essencePath)) {
    throw new Error(`Essence file not found at ${essencePath}`);
  }
  const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
  if (!isV4(essence)) {
    throw new Error('Route-based pack resolution requires Essence v4.0.0.');
  }
  const target = essence.blueprint.routes?.[route];
  if (!target) {
    const known = Object.keys(essence.blueprint.routes ?? {}).sort();
    throw new Error(
      `Route "${route}" was not found in blueprint.routes. Known routes: ${known.join(', ') || 'none'}.`,
    );
  }
  return target.page;
}

async function printHostedSelectedExecutionPack(
  packType: 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
  id?: string,
  essencePath?: string,
  namespace?: string,
  jsonOutput: boolean = false,
  writeContext: boolean = false,
) {
  const client = getPublicAPIClient();
  const resolvedPath = essencePath
    ? resolveUserPath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');

  if (!existsSync(resolvedPath)) {
    throw new Error(`Essence file not found at ${resolvedPath}`);
  }

  if ((packType === 'section' || packType === 'page' || packType === 'mutation') && !id) {
    throw new Error(`Pack type "${packType}" requires an id.`);
  }

  const essence = JSON.parse(readFileSync(resolvedPath, 'utf-8')) as EssenceFile;
  const selected = await client.selectExecutionPack(
    {
      essence,
      pack_type: packType,
      ...(id ? { id } : {}),
    },
    namespace ? { namespace } : undefined,
  );

  let writtenContextDir: string | null = null;
  if (writeContext) {
    const contextDir = join(dirname(resolvedPath), '.decantr', 'context');
    mkdirSync(contextDir, { recursive: true });
    writeFileSync(
      join(contextDir, 'pack-manifest.json'),
      JSON.stringify(selected.manifest, null, 2) + '\n',
    );

    const manifestEntry =
      selected.selector.packType === 'scaffold'
        ? selected.manifest.scaffold
        : selected.selector.packType === 'review'
          ? selected.manifest.review
          : selected.selector.packType === 'section'
            ? selected.manifest.sections.find((entry) => entry.id === selected.selector.id)
            : selected.selector.packType === 'page'
              ? selected.manifest.pages.find((entry) => entry.id === selected.selector.id)
              : selected.manifest.mutations.find((entry) => entry.id === selected.selector.id);

    const markdownFile =
      manifestEntry?.markdown ??
      `${selected.selector.packType}${selected.selector.id ? `-${selected.selector.id}` : ''}-pack.md`;
    const jsonFile =
      manifestEntry?.json ??
      `${selected.selector.packType}${selected.selector.id ? `-${selected.selector.id}` : ''}-pack.json`;
    writeFileSync(join(contextDir, markdownFile), selected.pack.renderedMarkdown);
    writeFileSync(join(contextDir, jsonFile), JSON.stringify(selected.pack, null, 2) + '\n');
    writtenContextDir = contextDir;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(selected, null, 2));
    return;
  }

  const typedSelected = selected as SelectedExecutionPackResponse;
  console.log(heading('Hosted Execution Pack'));
  console.log(`  Source essence: ${resolvedPath}`);
  console.log(`  Generated: ${typedSelected.generatedAt}`);
  console.log(`  Pack type: ${typedSelected.selector.packType}`);
  if (typedSelected.selector.id) {
    console.log(`  Pack id: ${typedSelected.selector.id}`);
  }
  console.log(`  Adapter: ${typedSelected.pack.target.adapter}`);
  console.log(`  Objective: ${typedSelected.pack.objective}`);
  if (writtenContextDir) {
    console.log(`  Context artifact: ${writtenContextDir}`);
  }
  console.log('');
  process.stdout.write(typedSelected.pack.renderedMarkdown);
}

async function printHostedExecutionPackManifest(
  essencePath?: string,
  namespace?: string,
  jsonOutput: boolean = false,
  writeContext: boolean = false,
) {
  const client = getPublicAPIClient();
  const resolvedPath = essencePath
    ? resolveUserPath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');

  if (!existsSync(resolvedPath)) {
    throw new Error(`Essence file not found at ${resolvedPath}`);
  }

  const essence = JSON.parse(readFileSync(resolvedPath, 'utf-8')) as EssenceFile;
  const manifest = await client.getExecutionPackManifest(
    essence,
    namespace ? { namespace } : undefined,
  );

  let writtenContextDir: string | null = null;
  if (writeContext) {
    const contextDir = join(dirname(resolvedPath), '.decantr', 'context');
    mkdirSync(contextDir, { recursive: true });
    writeFileSync(join(contextDir, 'pack-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
    writtenContextDir = contextDir;
  }

  if (jsonOutput) {
    console.log(JSON.stringify(manifest, null, 2));
    return;
  }

  console.log(heading('Hosted Pack Manifest'));
  console.log(`  Source essence: ${resolvedPath}`);
  console.log(`  Generated: ${manifest.generatedAt}`);
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Scaffold: ${manifest.scaffold ? 'present' : 'missing'}`);
  console.log(`  Review: ${manifest.review ? 'present' : 'missing'}`);
  console.log(`  Sections: ${manifest.sections.length}`);
  console.log(`  Pages: ${manifest.pages.length}`);
  console.log(`  Mutations: ${manifest.mutations.length}`);
  if (writtenContextDir) {
    console.log(`  Context artifact: ${writtenContextDir}`);
  }
}

interface HostedPackHydrationResult {
  attempted: boolean;
  hydrated: boolean;
  scope?: 'review' | 'bundle';
}

async function hydrateHostedExecutionPacksIfMissing(
  projectRoot: string,
  namespace: string = '@official',
): Promise<HostedPackHydrationResult> {
  const contextDir = join(projectRoot, '.decantr', 'context');
  const reviewPackPath = join(contextDir, 'review-pack.json');
  const manifestPath = join(contextDir, 'pack-manifest.json');

  if (existsSync(reviewPackPath) && existsSync(manifestPath)) {
    return { attempted: false, hydrated: false };
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return { attempted: false, hydrated: false };
  }

  const reviewHydration = await hydrateHostedReviewPackIfMissing(projectRoot, namespace);
  if (reviewHydration.hydrated || !reviewHydration.attempted) {
    return reviewHydration;
  }

  try {
    const client = getPublicAPIClient();
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
    const bundle = await client.compileExecutionPacks(essence, { namespace });
    mkdirSync(contextDir, { recursive: true });
    writeExecutionPackBundleArtifacts(contextDir, bundle as unknown as ExecutionPackBundle);
    return { attempted: true, hydrated: true, scope: 'bundle' };
  } catch {
    return { attempted: true, hydrated: false };
  }
}

async function hydrateHostedReviewPackIfMissing(
  projectRoot: string,
  namespace: string = '@official',
): Promise<HostedPackHydrationResult> {
  const contextDir = join(projectRoot, '.decantr', 'context');
  const reviewPackPath = join(contextDir, 'review-pack.json');
  const manifestPath = join(contextDir, 'pack-manifest.json');

  if (existsSync(reviewPackPath) && existsSync(manifestPath)) {
    return { attempted: false, hydrated: false };
  }

  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (!existsSync(essencePath)) {
    return { attempted: false, hydrated: false };
  }

  try {
    const client = getPublicAPIClient();
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
    const selected = (await client.selectExecutionPack(
      {
        essence,
        pack_type: 'review',
      },
      { namespace },
    )) as SelectedExecutionPackResponse;

    mkdirSync(contextDir, { recursive: true });
    writeFileSync(join(contextDir, 'review-pack.md'), selected.pack.renderedMarkdown);
    writeFileSync(
      join(contextDir, 'review-pack.json'),
      JSON.stringify(selected.pack, null, 2) + '\n',
    );
    if (!existsSync(manifestPath)) {
      writeFileSync(manifestPath, JSON.stringify(selected.manifest, null, 2) + '\n');
    }
    return { attempted: true, hydrated: true, scope: 'review' };
  } catch {
    return { attempted: true, hydrated: false };
  }
}

async function printHostedFileCritique(
  sourcePath: string,
  namespace?: string,
  jsonOutput: boolean = false,
  essencePath?: string,
  treatmentsPath?: string,
) {
  const client = getPublicAPIClient();
  const resolvedSourcePath = resolveUserPath(sourcePath);
  const resolvedEssencePath = essencePath
    ? resolveUserPath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');
  const resolvedTreatmentsPath = treatmentsPath
    ? resolveUserPath(treatmentsPath)
    : join(process.cwd(), 'src', 'styles', 'treatments.css');

  if (!existsSync(resolvedSourcePath)) {
    throw new Error(`Source file not found at ${resolvedSourcePath}`);
  }

  if (!existsSync(resolvedEssencePath)) {
    throw new Error(`Essence file not found at ${resolvedEssencePath}`);
  }

  const code = readFileSync(resolvedSourcePath, 'utf-8');
  const essence = JSON.parse(readFileSync(resolvedEssencePath, 'utf-8')) as EssenceFile;
  const treatmentsCss = existsSync(resolvedTreatmentsPath)
    ? readFileSync(resolvedTreatmentsPath, 'utf-8')
    : undefined;

  const report = await client.critiqueFile(
    {
      essence,
      filePath: sourcePath,
      code,
      treatmentsCss,
    },
    namespace ? { namespace } : undefined,
  );

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(heading('Hosted File Critique'));
  console.log(`  Source file: ${resolvedSourcePath}`);
  console.log(`  Essence: ${resolvedEssencePath}`);
  if (treatmentsCss) {
    console.log(`  Treatments: ${resolvedTreatmentsPath}`);
  }
  printFileCritiqueReport(report);
}

async function printHostedProjectAudit(
  namespace?: string,
  jsonOutput: boolean = false,
  essencePath?: string,
  distPath?: string,
  sourcesPath?: string,
) {
  const client = getPublicAPIClient();
  const resolvedEssencePath = essencePath
    ? resolveUserPath(essencePath)
    : join(process.cwd(), 'decantr.essence.json');

  if (!existsSync(resolvedEssencePath)) {
    throw new Error(`Essence file not found at ${resolvedEssencePath}`);
  }

  const essence = JSON.parse(readFileSync(resolvedEssencePath, 'utf-8')) as EssenceFile;
  const dist = readHostedDistSnapshot(distPath);
  const sources = readHostedSourceSnapshot(sourcesPath);
  const report = await client.auditProject(
    {
      essence,
      dist,
      sources,
    },
    namespace ? { namespace } : undefined,
  );

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  console.log(heading('Hosted Project Audit'));
  console.log(`  Essence: ${resolvedEssencePath}`);
  console.log(
    `  Dist snapshot: ${dist ? (distPath ? resolveUserPath(distPath) : join(process.cwd(), 'dist')) : 'none'}`,
  );
  console.log(
    `  Source snapshot: ${sources && sourcesPath ? resolveUserPath(sourcesPath) : 'none'}`,
  );
  printProjectAuditReport(report as unknown as ProjectAuditReport);
}

// ── Commands ──

function formatBlueprintPortfolioSummary(value: unknown): string | null {
  const portfolio = getBlueprintPortfolioMetadata(value);
  if (!portfolio) return null;

  const labels: string[] = [];
  if (portfolio.artifact.status === 'certified') labels.push('Certified');
  if (portfolio.visibility === 'featured') labels.push('Featured');
  if (portfolio.visibility === 'labs') labels.push('Labs');
  if (portfolio.visibility === 'hidden') labels.push('Folded');
  if (labels.length === 0) labels.push('All');

  const alternative = portfolio.recommended_alternative
    ? `; recommended alternative: ${portfolio.recommended_alternative}`
    : '';
  return `Blueprint set: ${labels.join(' + ')}${alternative}`;
}

function formatRegistryListIdentifier(item: unknown): string {
  if (!item || typeof item !== 'object') return String(item ?? '');
  const record = item as Record<string, unknown>;
  return (
    (typeof record.slug === 'string' && record.slug) ||
    (typeof record.id === 'string' && record.id) ||
    (typeof record.name === 'string' && record.name) ||
    ''
  );
}

function printBlueprintPortfolioNotice(blueprint: RegistryBlueprint): void {
  const portfolio = getBlueprintPortfolioMetadata(blueprint);
  if (!portfolio) return;

  if (portfolio.visibility === 'hidden' || portfolio.maturity === 'fold-candidate') {
    console.log(
      `${YELLOW}  Warning:${RESET} blueprint "${blueprint.id}" is folded out of public browsing.`,
    );
    if (portfolio.recommended_alternative) {
      console.log(
        dim(
          `  Recommended public alternative: decantr new <name> --blueprint=${portfolio.recommended_alternative}`,
        ),
      );
    }
    return;
  }

  if (portfolio.visibility === 'labs') {
    console.log(
      `${YELLOW}  Note:${RESET} blueprint "${blueprint.id}" is a Labs blueprint; direct scaffolding is supported, but it is not a default recommendation yet.`,
    );
  }
}

async function cmdSearch(
  query: string,
  type?: string,
  sort?: string,
  recommended?: boolean,
  intelligenceSource?: ContentIntelligenceSource,
  blueprintSet?: PublicBlueprintSet,
) {
  const apiClient = getAPIClient();
  try {
    const response = await apiClient.search({
      q: query,
      type,
      sort,
      recommended,
      intelligenceSource,
      blueprintSet,
    });
    const results = response.results;

    if (results.length === 0) {
      console.log(dim(`No results for "${query}"`));
      return;
    }

    console.log(heading(`${results.length} result(s) for "${query}"`));
    for (const r of results) {
      console.log(`  ${cyan(r.type.padEnd(12))} ${BOLD}${r.slug}${RESET}`);
      console.log(`  ${dim(r.description || '')}`);
      const intelligenceSummary = formatIntelligenceSummary(r.intelligence);
      if (intelligenceSummary) {
        console.log(`  ${dim(intelligenceSummary)}`);
      }
      const portfolioSummary = formatBlueprintPortfolioSummary(
        (r as { blueprint_portfolio?: unknown }).blueprint_portfolio,
      );
      if (portfolioSummary) {
        console.log(`  ${dim(portfolioSummary)}`);
      }
      console.log('');
    }
  } catch {
    console.log(dim(`Search failed. API may be unavailable.`));
  }
}

interface SuggestOptions {
  type?: string;
  route?: string;
  file?: string;
  fromCode?: boolean;
  projectRoot?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function patternCandidateFromRegistryItem(
  item: Pattern | Record<string, unknown>,
  source: string,
): PatternDiscoveryCandidate {
  const record = item as Record<string, unknown>;
  const data = isRecord(record.data) ? record.data : record;
  const slug =
    (typeof record.slug === 'string' && record.slug) ||
    (typeof data.slug === 'string' && data.slug) ||
    (typeof data.id === 'string' && data.id) ||
    (typeof record.id === 'string' && record.id) ||
    'pattern';
  return patternToDiscoveryCandidate(
    {
      ...data,
      id: typeof data.id === 'string' ? data.id : slug,
      slug,
      name:
        typeof data.name === 'string'
          ? data.name
          : typeof record.name === 'string'
            ? record.name
            : slug,
      description:
        typeof data.description === 'string'
          ? data.description
          : typeof record.description === 'string'
            ? record.description
            : undefined,
    },
    { source, slug },
  );
}

function hostedPatternRefFromCandidate(
  candidate: PatternDiscoveryCandidate,
): LocalHostedPatternRef {
  const slug = candidate.slug || candidate.id;
  return {
    slug,
    source: candidate.source ?? 'registry',
    name: candidate.name,
    description: candidate.description,
    tags: candidate.tags,
    components: candidate.components,
    interactions: candidate.interactions,
    visualBrief: candidate.visual_brief,
  };
}

function findPatternCandidateBySlug(
  candidates: PatternDiscoveryCandidate[],
  slug: string,
): PatternDiscoveryCandidate | null {
  const normalized = slug.toLowerCase();
  return (
    candidates.find(
      (candidate) =>
        candidate.slug?.toLowerCase() === normalized ||
        candidate.id.toLowerCase() === normalized ||
        candidate.name?.toLowerCase() === normalized,
    ) ?? null
  );
}

function readSuggestCodeContext(
  projectRoot: string,
  route: string | undefined,
  file: string | undefined,
): string {
  const pieces: string[] = [];
  if (file) {
    const resolved = isAbsolute(file) ? file : join(projectRoot, file);
    if (existsSync(resolved)) {
      pieces.push(readFileSync(resolved, 'utf-8'));
    }
  }

  if (route) {
    const analysisPath = join(projectRoot, '.decantr', 'analysis.json');
    if (existsSync(analysisPath)) {
      try {
        const analysis = JSON.parse(readFileSync(analysisPath, 'utf-8')) as {
          routes?: { routes?: Array<{ path?: string; file?: string }> };
        };
        const routeEntry = analysis.routes?.routes?.find((entry) => entry.path === route);
        if (routeEntry?.file) {
          const resolved = join(projectRoot, routeEntry.file);
          if (existsSync(resolved)) {
            pieces.push(readFileSync(resolved, 'utf-8'));
          }
        }
      } catch {
        /* best effort */
      }
    }
  }

  return pieces.join('\n\n').slice(0, 20000);
}

function localPatternMatches(
  projectRoot: string | undefined,
  query: string,
): Array<{ id: string; label: string | null; role: string | null; score: number }> {
  if (!projectRoot) return [];
  const pack = readLocalPatternPack(projectRoot);
  const patterns = Array.isArray(pack?.patterns) ? pack.patterns : [];
  const queryTerms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1)
    .flatMap((term) =>
      term.endsWith('s') && term.length > 3 ? [term, term.slice(0, -1)] : [term],
    );
  if (queryTerms.length === 0) return [];

  return patterns
    .map((pattern) => {
      const id = typeof pattern.id === 'string' ? pattern.id : 'local-pattern';
      const label = typeof pattern.label === 'string' ? pattern.label : null;
      const role = typeof pattern.role === 'string' ? pattern.role : null;
      const haystack = [
        id,
        label,
        role,
        typeof pattern.decide === 'string' ? pattern.decide : null,
        ...(Array.isArray(pattern.appliesTo) ? pattern.appliesTo : []),
        ...(Array.isArray(pattern.componentPaths) ? pattern.componentPaths : []),
        ...(Array.isArray(pattern.tokenHints) ? pattern.tokenHints : []),
        ...(Array.isArray(pattern.classHints) ? pattern.classHints : []),
        ...(Array.isArray(pattern.evidence) ? pattern.evidence : []),
        ...(Array.isArray(pattern.forbiddenAlternatives) ? pattern.forbiddenAlternatives : []),
      ]
        .filter((entry): entry is string => typeof entry === 'string')
        .join(' ')
        .toLowerCase();
      const score = queryTerms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      return { id, label, role, score };
    })
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5);
}

async function loadPatternDiscoveryCandidates(
  registryClient: RegistryClient,
): Promise<PatternDiscoveryCandidate[]> {
  const candidates: PatternDiscoveryCandidate[] = [];
  const seen = new Set<string>();
  const add = (candidate: PatternDiscoveryCandidate) => {
    const key = candidate.slug || candidate.id;
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push(candidate);
  };

  const bundledPatterns = loadBundledContentList<Pattern>('patterns');
  for (const entry of bundledPatterns) {
    add(patternToDiscoveryCandidate(entry.data, { source: 'bundled', slug: entry.id }));
  }

  try {
    const result = await registryClient.fetchContentList('patterns');
    for (const item of result.data.items) {
      const source = result.source.type === 'api' ? 'hosted' : result.source.type;
      add(patternCandidateFromRegistryItem(item as Pattern | Record<string, unknown>, source));
    }
  } catch {
    /* API/cache discovery is best effort; bundled/custom still work. */
  }

  for (const item of registryClient.listCustomContent('patterns')) {
    add(patternCandidateFromRegistryItem(item as Pattern | Record<string, unknown>, 'custom'));
  }

  return candidates;
}

async function cmdSuggest(query: string, options: SuggestOptions = {}) {
  const searchType = options.type || 'pattern';
  const projectRoot = options.projectRoot ?? process.cwd();
  if (searchType !== 'pattern' && searchType !== 'patterns') {
    const apiClient = getAPIClient();
    try {
      const response = await apiClient.search({ q: query, type: searchType });
      const results = response.results;
      if (results.length === 0) {
        console.log(dim(`No suggestions for "${query}"`));
        return;
      }
      console.log(heading(`Suggestions for "${query}"`));
      for (const r of results.slice(0, 8)) {
        console.log(`  ${cyan(r.slug)} - ${r.description || r.name || ''}`);
      }
      return;
    } catch {
      console.log(dim(`Suggestion search failed. API may be unavailable.`));
      return;
    }
  }

  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
  });
  const code =
    options.fromCode || options.file
      ? readSuggestCodeContext(projectRoot, options.route, options.file)
      : '';
  const localMatches = localPatternMatches(projectRoot, [query, code].filter(Boolean).join('\n'));
  const bridgeMatches = styleBridgeMatches(projectRoot, [query, code].filter(Boolean).join('\n'));
  const candidates = await loadPatternDiscoveryCandidates(registryClient);
  const matches = rankPatternCandidates(
    {
      query,
      route: options.route,
      code,
      limit: 10,
    },
    candidates,
  );

  if (matches.length === 0 && localMatches.length === 0 && bridgeMatches.length === 0) {
    console.log(dim(`No pattern suggestions for "${query}"`));
    console.log('');
    console.log('Try:');
    console.log(`  ${cyan('decantr list patterns')} - browse slug, name, domain, and source`);
    console.log(
      `  ${cyan('decantr suggest "<broader description>" --from-code --route <route>')} - rank from observed code`,
    );
    return;
  }

  const contextBits = [
    options.route ? `route ${options.route}` : null,
    options.file ? `file ${options.file}` : null,
    code ? 'code context' : null,
  ].filter((entry): entry is string => Boolean(entry));

  console.log(
    heading(
      `Pattern suggestions for "${query}"${contextBits.length > 0 ? ` (${contextBits.join(', ')})` : ''}`,
    ),
  );
  if (bridgeMatches.length > 0) {
    console.log(`${BOLD}Project-owned style bridge:${RESET}`);
    for (const match of bridgeMatches) {
      const hints = [...match.tokenHints, ...match.classHints].slice(0, 3).join(', ');
      console.log(`  ${cyan(match.id)}  ${match.label}${hints ? `  ${dim(hints)}` : ''}`);
    }
    console.log('');
  }
  if (localMatches.length > 0) {
    console.log(`${BOLD}Project-owned local law:${RESET}`);
    for (const match of localMatches) {
      const details = [match.label, match.role].filter(Boolean).join(' | ');
      console.log(`  ${cyan(match.id)}${details ? `  ${dim(details)}` : ''}`);
    }
    console.log('');
    console.log(`${BOLD}Registry patterns:${RESET}`);
  }
  if (matches.length === 0) {
    console.log(dim('No hosted/bundled registry patterns matched this query.'));
    console.log('');
    console.log(
      dim('Use local law first, or run "decantr list patterns" to browse registry options.'),
    );
    return;
  }
  for (const match of matches.slice(0, 8)) {
    const candidate = match.candidate;
    const slug = candidate.slug || candidate.id;
    const details = [
      candidate.name && candidate.name !== slug ? candidate.name : null,
      candidate.domain || candidate.category || null,
      candidate.source || null,
    ].filter(Boolean);
    console.log(
      `  ${cyan(slug)}  score ${match.score}${details.length > 0 ? `  ${dim(details.join(' | '))}` : ''}`,
    );
    if (candidate.description) {
      console.log(`    ${dim(candidate.description)}`);
    }
    if (match.reasons.length > 0) {
      console.log(`    ${dim(`why: ${match.reasons.slice(0, 2).join('; ')}`)}`);
    }
  }
  console.log('');
  console.log(dim('Use "decantr get pattern <slug>" for full details.'));
}

async function cmdGet(type: string, id: string) {
  if (!isGetContentType(type)) {
    console.error(error(`Invalid type "${type}". Must be one of: ${GET_CONTENT_TYPES.join(', ')}`));
    process.exitCode = 1;
    return;
  }

  const apiType = CONTENT_TYPE_TO_API_CONTENT_TYPE[type];

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });
  const result = await registryClient.fetchContentItem(apiType, id);
  if (result) {
    console.log(JSON.stringify(result.data, null, 2));
    return;
  }

  const bundled = loadBundledContentItem(apiType, id);
  if (bundled) {
    console.log(JSON.stringify(bundled.data, null, 2));
    return;
  }

  console.error(error(`${type} "${id}" not found.`));
  process.exitCode = 1;
  return;
}

async function cmdValidate(path?: string) {
  const essencePath = path || join(process.cwd(), 'decantr.essence.json');
  let raw: string;

  try {
    raw = readFileSync(essencePath, 'utf-8');
  } catch {
    console.error(error(`Could not read ${essencePath}`));
    process.exitCode = 1;
    return;
  }

  let essence: EssenceFile;
  try {
    essence = JSON.parse(raw);
  } catch (e) {
    console.error(error(`Invalid JSON: ${(e as Error).message}`));
    process.exitCode = 1;
    return;
  }

  const detectedVersion = isV4(essence) ? 'v4' : 'legacy';
  console.log(`${DIM}Detected essence version: ${detectedVersion}${RESET}`);

  const result = validateEssence(essence);

  if (result.valid) {
    console.log(success(`Essence is valid (${detectedVersion}).`));
  } else {
    console.error(error('Validation failed:'));
    for (const err of result.errors) {
      console.error(`  ${RED}${err}${RESET}`);
    }
    process.exitCode = 1;
    return;
  }

  try {
    // Build registry context for guard validation
    const { themeRegistry, patternRegistry } = buildGuardRegistryContext(process.cwd());
    // V4 C5: scan project source for missing interaction implementations.
    // Returns formatted issues for the experiential guard rule (8th rule).
    // Gracefully no-ops when the project has no pack-manifest or no
    // declared interactions.
    let interactionIssues: string[] = [];
    try {
      interactionIssues = scanProjectInteractions(process.cwd());
    } catch {
      // Source-scan is non-fatal — guard runs without it
    }
    const violations = evaluateGuard(essence, {
      themeRegistry,
      patternRegistry,
      interaction_issues: interactionIssues,
    });
    if (violations.length > 0) {
      console.log(heading('Guard violations:'));
      for (const v of violations) {
        const vr = v as Record<string, string>;
        console.log(`  ${YELLOW}[${vr.rule}]${RESET} ${vr.message}`);
        if (vr.suggestion) {
          console.log(`    ${DIM}Suggestion: ${vr.suggestion}${RESET}`);
        }
      }
      // C5 strict mode → process exits with code 1 (build failure semantics)
      const hasError = violations.some((v) => (v as Record<string, string>).severity === 'error');
      if (hasError) {
        process.exitCode = 1;
      }
    } else if (result.valid) {
      console.log(success('No guard violations.'));
    }
  } catch {
    /* guard is optional */
  }
}

async function cmdList(
  type: string,
  sort?: string,
  recommended?: boolean,
  intelligenceSource?: ContentIntelligenceSource,
  blueprintSet?: PublicBlueprintSet,
) {
  if (!isApiContentType(type)) {
    console.error(
      error(`Invalid type "${type}". Must be one of: ${LIST_CONTENT_TYPES.join(', ')}`),
    );
    process.exitCode = 1;
    return;
  }

  const registryClient = new RegistryClient({
    cacheDir: join(process.cwd(), '.decantr', 'cache'),
  });

  const result = await registryClient.fetchContentList(
    type,
    undefined,
    sort,
    recommended,
    intelligenceSource,
    blueprintSet,
  );
  const bundledPatternItems =
    type === 'patterns'
      ? loadBundledContentList<Pattern>('patterns').map((entry) => ({
          ...entry.data,
          id: entry.data.id || entry.id,
          slug: (entry.data as Pattern & { slug?: string }).slug || entry.id,
          source: 'bundled',
        }))
      : [];
  const items =
    type === 'patterns' ? [...bundledPatternItems, ...result.data.items] : result.data.items;

  if (items.length === 0) {
    console.log(dim(`No ${type} found.`));
    return;
  }

  // For themes, show custom items separately
  if (type === 'themes') {
    const customItems = registryClient.listCustomContent('themes');
    const customIds = new Set(customItems.map((c) => c.id));
    const registryItems = items.filter((i) => !customIds.has(i.id));

    console.log(heading(`Registry themes (${registryItems.length}):`));
    for (const item of registryItems) {
      console.log(`  ${cyan(item.id)}  ${dim(item.description || item.name || '')}`);
    }
    if (customItems.length > 0) {
      console.log('');
      console.log(heading(`Custom themes (${customItems.length}):`));
      for (const item of customItems) {
        console.log(`  ${cyan(`custom:${item.id}`)}  ${dim(item.description || item.name || '')}`);
      }
    } else {
      console.log('');
      console.log(dim('Custom themes (0):'));
      console.log(dim('  Run "decantr theme create <name>" to create a custom theme.'));
    }
  } else {
    console.log(heading(`${items.length} ${type} found`));
    for (const item of items) {
      if (type === 'patterns') {
        const pattern = item as Pattern & { slug?: string; source?: string; domain?: string };
        const slug = pattern.slug || pattern.id;
        const domain = pattern.domain || pattern.category || pattern.tags?.[0] || 'general';
        const source =
          pattern.source || (result.source.type === 'api' ? 'hosted' : result.source.type);
        const label = [pattern.name && pattern.name !== slug ? pattern.name : null, domain, source]
          .filter(Boolean)
          .join(' | ');
        console.log(`  ${cyan(slug)}  ${dim(label)}`);
        if (pattern.description) {
          console.log(`    ${dim(pattern.description)}`);
        }
      } else {
        console.log(
          `  ${cyan(formatRegistryListIdentifier(item))}  ${dim(item.description || item.name || '')}`,
        );
      }
      const intelligenceSummary = formatIntelligenceSummary(
        (item as { intelligence?: ContentIntelligenceMetadata | null }).intelligence,
      );
      if (intelligenceSummary) {
        console.log(`  ${dim(intelligenceSummary)}`);
      }
      const portfolioSummary = formatBlueprintPortfolioSummary(
        (item as { blueprint_portfolio?: unknown }).blueprint_portfolio ?? item,
      );
      if (portfolioSummary) {
        console.log(`  ${dim(portfolioSummary)}`);
      }
    }
  }
}

// ── Init command (updated) ──

interface InitArgs {
  blueprint?: string;
  archetype?: string;
  theme?: string;
  mode?: string;
  shape?: string;
  target?: string;
  guard?: string;
  density?: string;
  shell?: string;
  personality?: string;
  features?: string;
  existing?: boolean;
  offline?: boolean;
  yes?: boolean;
  registry?: string;
  workflow?: string;
  adoption?: string;
  telemetry?: boolean;
  'assistant-bridge'?: string;
  project?: string;
  'accept-proposal'?: boolean;
  'merge-proposal'?: boolean;
  'replace-essence'?: boolean;
  internalSuppressNextSteps?: boolean;
}

function enableCliTelemetry(projectRoot: string): void {
  optIn(projectRoot);
  console.log(
    `\n${CYAN}Telemetry enabled.${RESET} Decantr will send privacy-filtered CLI product telemetry for this project.`,
  );
  console.log(`${DIM}Set "telemetry": false in .decantr/project.json to opt out.${RESET}`);
}

function readCliPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(here, '..', 'package.json'), join(here, '..', '..', 'package.json')];
  for (const candidate of candidates) {
    try {
      const pkg = JSON.parse(readFileSync(candidate, 'utf-8')) as { version?: string };
      if (pkg.version) return pkg.version;
    } catch {
      /* try next */
    }
  }
  return '0.0.0';
}

function timestampForFile(): string {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function backupExistingEssence(projectRoot: string, label: string): string | null {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (!existsSync(essencePath)) return null;
  const backupPath = join(
    projectRoot,
    `decantr.essence.${label}.${timestampForFile()}.backup.json`,
  );
  writeFileSync(backupPath, readFileSync(essencePath, 'utf-8'), 'utf-8');
  return backupPath;
}

function writeBrownfieldProjectJson(input: {
  projectRoot: string;
  detected: ReturnType<typeof detectProject>;
  workspaceInfo: ReturnType<typeof resolveWorkspaceInfo>;
  assistantBridge: AssistantBridgeMode;
  mode: 'accept' | 'merge' | 'replace';
}): void {
  const decantrDir = join(input.projectRoot, '.decantr');
  mkdirSync(join(decantrDir, 'context'), { recursive: true });
  mkdirSync(join(decantrDir, 'cache'), { recursive: true });
  const now = new Date().toISOString();
  const projectJson = {
    detected: {
      framework: input.detected.framework,
      version: input.detected.version || null,
      packageManager: input.detected.packageManager,
      hasTypeScript: input.detected.hasTypeScript,
      hasTailwind: input.detected.hasTailwind,
      existingRuleFiles: input.detected.existingRuleFiles,
      workspaceRoot: input.workspaceInfo.workspaceRoot,
      appRoot: input.workspaceInfo.appRoot,
    },
    sync: {
      status: 'not-required',
      lastSync: now,
      registrySource: 'cache',
      cachedContent: {
        archetypes: [],
        patterns: [],
        themes: [],
      },
    },
    initialized: {
      at: now,
      via: 'cli',
      version: readCliPackageVersion(),
      flags: `--existing --${input.mode === 'replace' ? 'replace-essence' : input.mode === 'merge' ? 'merge-proposal' : 'accept-proposal'}`,
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      contentSource: 'none',
      assistantBridge: input.assistantBridge,
      projectScope: input.workspaceInfo.projectScope,
      adapterId: null,
      analysisArtifacts: true,
      acceptedProposal: {
        mode: input.mode,
        path: '.decantr/observed-essence.proposal.json',
      },
    },
  };
  writeFileSync(join(decantrDir, 'project.json'), JSON.stringify(projectJson, null, 2) + '\n');
}

async function applyAcceptedBrownfieldProposal(input: {
  projectRoot: string;
  detected: ReturnType<typeof detectProject>;
  workspaceInfo: ReturnType<typeof resolveWorkspaceInfo>;
  mode: 'accept' | 'merge' | 'replace';
  assistantBridge: AssistantBridgeMode;
  suppressNextSteps?: boolean;
}): Promise<void> {
  const proposal = readBrownfieldProposal(input.projectRoot);
  if (!proposal) {
    console.log(
      error(`No observed brownfield proposal found at ${proposalPath(input.projectRoot)}.`),
    );
    console.log(
      dim(
        'Run `decantr analyze` first, review `.decantr/brownfield-report.md`, then accept or merge the proposal.',
      ),
    );
    process.exitCode = 1;
    return;
  }

  const essencePath = join(input.projectRoot, 'decantr.essence.json');
  const hasEssence = existsSync(essencePath);
  let essence: EssenceV4;
  let backupPath: string | null = null;

  if (input.mode === 'accept' && hasEssence) {
    console.log(error('Refusing to accept proposal over an existing decantr.essence.json.'));
    console.log(
      dim(
        'Use `--merge-proposal` to preserve the existing contract or `--replace-essence` for an explicit destructive replacement.',
      ),
    );
    process.exitCode = 1;
    return;
  }

  if (input.mode === 'merge' && hasEssence) {
    const existing = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
    if (!isV4(existing)) {
      console.log(
        error(
          'Existing essence is not v4. Run `decantr migrate --to v4` before merging a brownfield proposal.',
        ),
      );
      process.exitCode = 1;
      return;
    }
    essence = mergeEssenceWithProposal(existing, proposal);
  } else {
    essence = proposal.essence;
  }

  const validation = validateEssence(essence);
  if (!validation.valid) {
    console.log(
      error('Brownfield proposal produced an invalid Decantr essence. No files were changed.'),
    );
    for (const validationError of validation.errors) {
      console.log(`  ${RED}${validationError}${RESET}`);
    }
    process.exitCode = 1;
    return;
  }

  if (input.mode === 'merge' && hasEssence) {
    backupPath = backupExistingEssence(input.projectRoot, 'merge');
  } else if (input.mode === 'replace' && hasEssence) {
    backupPath = backupExistingEssence(input.projectRoot, 'replace');
  }

  writeBrownfieldProjectJson({
    projectRoot: input.projectRoot,
    detected: input.detected,
    workspaceInfo: input.workspaceInfo,
    assistantBridge: input.assistantBridge,
    mode: input.mode,
  });
  writeFileSync(essencePath, JSON.stringify(essence, null, 2) + '\n', 'utf-8');

  const registryClient = new RegistryClient({
    cacheDir: join(input.projectRoot, '.decantr', 'cache'),
    offline: true,
    projectRoot: input.projectRoot,
  });
  const refreshResult = await refreshDerivedFiles(
    input.projectRoot,
    essence,
    registryClient,
    undefined,
    {
      isInitialScaffold: true,
      workflowMode: 'brownfield-attach',
      adoptionMode: 'contract-only',
      analysisArtifacts: true,
    },
  );

  let assistantBridgePath: string | null = null;
  if (input.assistantBridge === 'preview' || input.assistantBridge === 'apply') {
    assistantBridgePath = writeAssistantBridgePreview({
      projectRoot: input.projectRoot,
      detected: input.detected,
      workflowMode: 'brownfield-attach',
      assistantBridge: input.assistantBridge,
    });
  }
  const appliedRuleFiles =
    input.assistantBridge === 'apply'
      ? applyAssistantBridge(input.projectRoot, input.detected)
      : [];

  console.log(success('\nBrownfield proposal accepted.\n'));
  const projectLabel =
    input.workspaceInfo.appRoot !== input.workspaceInfo.workspaceRoot
      ? relative(input.workspaceInfo.workspaceRoot, input.workspaceInfo.appRoot).replace(/\\/g, '/')
      : undefined;
  console.log('  Files created/updated:');
  console.log(
    `    ${cyan(displayProjectPath(input.workspaceInfo, 'decantr.essence.json'))}    Observed brownfield contract`,
  );
  console.log(
    `    ${cyan(displayProjectPath(input.workspaceInfo, 'DECANTR.md'))}              Reconciled assistant guidance`,
  );
  console.log(
    `    ${cyan(displayProjectPath(input.workspaceInfo, '.decantr/project.json'))}  Brownfield attach metadata`,
  );
  console.log(
    `    ${cyan(displayProjectPath(input.workspaceInfo, '.decantr/context/'))}      Generated contract context`,
  );
  if (assistantBridgePath) {
    console.log(
      `    ${cyan(displayProjectPath(input.workspaceInfo, '.decantr/context/assistant-bridge.md'))} Assistant bridge preview`,
    );
  }
  if (appliedRuleFiles.length > 0) {
    console.log(`    ${dim(`Rule bridge applied: ${appliedRuleFiles.join(', ')}`)}`);
  }
  if (backupPath) {
    console.log(`    ${dim(`Backup: ${backupPath}`)}`);
  }
  console.log('');
  console.log('  Generated context:');
  for (const contextFile of refreshResult.contextFiles.slice(0, 8)) {
    console.log(
      `    ${dim(displayProjectPath(input.workspaceInfo, contextFile.replace(`${input.projectRoot}/`, '')))}`,
    );
  }
  if (refreshResult.contextFiles.length > 8) {
    console.log(`    ${dim(`(+${refreshResult.contextFiles.length - 8} more)`)}`);
  }
  if (!input.suppressNextSteps) {
    console.log('');
    console.log('  Next steps:');
    console.log(
      `    1. Run ${cyan(withProject('decantr doctor', projectLabel))} to explain adoption state and the next command`,
    );
    console.log(
      `    2. Run ${cyan(withProject('decantr codify --from-audit', projectLabel))} when you are ready to propose project-owned UI law`,
    );
    console.log(
      `    3. Use ${cyan(withProject('decantr task / "change summary"', projectLabel))} before LLM edits`,
    );
    console.log(
      `    4. Run ${cyan(withProject('decantr verify --brownfield', projectLabel))} after edits`,
    );
    console.log('');
  }
}

async function cmdInit(args: InitArgs) {
  const workspaceInfo = resolveWorkspaceInfo(process.cwd(), args.project);
  if (args.yes && workspaceInfo.requiresProjectSelection) {
    printWorkspaceProjectSelection(workspaceInfo, 'init');
    process.exitCode = 1;
    return;
  }
  const projectRoot = workspaceInfo.appRoot;

  console.log(heading('Decantr Project Setup'));

  // Detect project configuration
  const detected = detectProject(projectRoot);
  const workflowSeed = readBrownfieldInitSeed(projectRoot);

  if (workflowSeed) {
    console.log(dim('  Found .decantr/init-seed.json brownfield guidance.'));
  }

  // Check for existing essence
  if (detected.existingEssence && !args.existing) {
    console.log(`${YELLOW}Warning: decantr.essence.json already exists.${RESET}`);
    const overwrite = await confirm('Overwrite existing configuration?', false);
    if (!overwrite) {
      console.log(dim('Cancelled.'));
      return;
    }
  }

  const requestedBlueprint = Boolean(args.blueprint);
  const requestedArchetype = Boolean(args.archetype);
  const requestedTheme = Boolean(args.theme);
  const policy = resolveWorkflowPolicy({
    command: 'init',
    detected,
    workflowSeed,
    requestedWorkflow: args.workflow,
    requestedAdoption: args.adoption,
    requestedAssistantBridge: args['assistant-bridge'],
    requestedBlueprint,
    requestedArchetype,
    requestedTheme,
    explicitExisting: args.existing,
    offline: args.offline,
    projectScope: workspaceInfo.projectScope,
  });

  const proposalMode: 'accept' | 'merge' | 'replace' | null = args['replace-essence']
    ? 'replace'
    : args['merge-proposal']
      ? 'merge'
      : args['accept-proposal']
        ? 'accept'
        : null;

  if (proposalMode) {
    await applyAcceptedBrownfieldProposal({
      projectRoot,
      detected,
      workspaceInfo,
      mode: proposalMode,
      assistantBridge: policy.assistantBridge,
      suppressNextSteps: args.internalSuppressNextSteps,
    });
    if (args.telemetry) enableCliTelemetry(projectRoot);
    writeArtifactReadme(projectRoot);
    return;
  }

  if (policy.workflowMode === 'brownfield-attach' && detected.existingEssence) {
    console.log(
      error('Refusing to overwrite existing decantr.essence.json in brownfield attach mode.'),
    );
    console.log(
      dim(
        'Run `decantr analyze`, then use `decantr init --existing --merge-proposal` or the explicit destructive `--replace-essence`.',
      ),
    );
    process.exitCode = 1;
    return;
  }

  if (policy.workflowMode === 'brownfield-attach' && readBrownfieldProposal(projectRoot)) {
    console.log(error('Observed brownfield proposal found, but it was not accepted.'));
    console.log(
      dim(
        'Review `.decantr/brownfield-report.md`, then run `decantr init --existing --accept-proposal`.',
      ),
    );
    process.exitCode = 1;
    return;
  }

  const preferContractOnly =
    policy.contentSource === 'none' &&
    (policy.workflowMode === 'brownfield-attach' ||
      policy.workflowMode === 'greenfield-contract-only');
  const shouldUseRegistry = !preferContractOnly || policy.registryRequired;

  let offlineSeed = {
    seeded: false,
    strategy: null as 'workspace-cache' | 'configured-content-root' | 'sibling-content-root' | null,
  };
  if (args.offline && shouldUseRegistry) {
    offlineSeed = seedOfflineRegistry(projectRoot, projectRoot);
    if (offlineSeed.seeded) {
      console.log(dim(`  Seeded offline registry content from ${offlineSeed.strategy}.`));
    } else if (requestedBlueprint || requestedArchetype) {
      console.log(
        error('\nOffline blueprint/archetype scaffolding requires a local Decantr content source.'),
      );
      console.log(
        dim(
          'Set DECANTR_CONTENT_DIR, seed .decantr/cache or .decantr/custom, or run without --offline.',
        ),
      );
      process.exitCode = 1;
      return;
    }
  }

  // Create registry client
  const registryClient = new RegistryClient({
    cacheDir: join(projectRoot, '.decantr', 'cache'),
    apiUrl: args.registry,
    offline: args.offline,
    projectRoot,
  });

  // Check connectivity
  const apiAvailable = shouldUseRegistry ? await registryClient.checkApiAvailability() : false;
  if (!apiAvailable && !args.offline && (requestedBlueprint || requestedArchetype)) {
    const fallbackSeed = seedOfflineRegistry(projectRoot, projectRoot);
    if (fallbackSeed.seeded) {
      offlineSeed = fallbackSeed;
      console.log(dim(`  Seeded local registry fallback from ${fallbackSeed.strategy}.`));
    }
  }

  let selectedBlueprint = 'default';
  let registrySource: 'api' | 'cache' = 'cache';

  if (args.yes) {
    // Non-interactive: use --blueprint flag or default
    selectedBlueprint = args.blueprint || 'default';
  } else if (shouldUseRegistry && !apiAvailable) {
    // Offline mode with no blueprint specified: use minimal scaffold
    if (!args.blueprint) {
      console.log(`\n${YELLOW}You're offline. Scaffolding minimal Decantr project.${RESET}`);
      console.log(
        dim('Run `decantr sync` or `decantr upgrade` when online to pull full registry content.\n'),
      );

      const result = scaffoldMinimal(projectRoot, {
        workflowMode: policy.workflowMode,
        adoptionMode: policy.adoptionMode,
        contentSource: policy.contentSource,
        assistantBridge: policy.assistantBridge,
      });
      writeArtifactReadme(projectRoot);

      console.log(success('\nProject scaffolded (minimal/offline)!\n'));
      console.log('  Files created:');
      console.log(`    ${cyan('decantr.essence.json')}    Design specification`);
      console.log(`    ${cyan('DECANTR.md')}              LLM instructions`);
      console.log(`    ${cyan('.decantr/')}               Project state & custom content dirs`);
      if (result.gitignoreUpdated) {
        console.log(`    ${dim('.gitignore updated')}`);
      }
      console.log('');
      console.log('  Next steps:');
      console.log(`    1. Run ${cyan('decantr sync')} when online`);
      console.log(
        `    2. Run ${cyan('decantr refresh')} after syncing to generate scaffold, section, and page packs`,
      );
      console.log(
        `    3. Read ${cyan('.decantr/context/scaffold-pack.md')} first, then use ${cyan('DECANTR.md')} as a lookup reference`,
      );
      console.log(
        `    4. Use ${cyan('decantr create <type> <name>')} to create custom content if needed`,
      );
      if (args.telemetry) enableCliTelemetry(projectRoot);
      return;
    }

    if (requestedBlueprint || requestedArchetype) {
      console.log(
        error(
          '\nThe requested blueprint/archetype could not be resolved from the hosted registry or local cache.',
        ),
      );
      console.log(
        dim(
          'Run `decantr sync`, set DECANTR_CONTENT_DIR, or retry when the registry is reachable.',
        ),
      );
      process.exitCode = 1;
      return;
    }

    console.log(`\n${YELLOW}You're offline. Scaffolding Decantr default.${RESET}`);
    console.log(dim('Run `decantr upgrade` when online, or visit decantr.ai/registry\n'));
    selectedBlueprint = 'default';
  } else if (shouldUseRegistry) {
    // Online: fetch blueprints and show simplified prompt
    console.log(dim('Fetching registry content...'));
    const blueprintsResult = await registryClient.fetchBlueprints();
    registrySource = blueprintsResult.source.type === 'api' ? 'api' : 'cache';

    const { selectedBlueprint: selected } = await runSimplifiedInit(blueprintsResult.data.items);

    selectedBlueprint = selected || 'default';
  }

  // Fetch registry content for scaffold (sequential to avoid overwhelming the API)
  const archetypesResult = shouldUseRegistry ? await registryClient.fetchArchetypes() : null;
  const blueprintsResult = shouldUseRegistry ? await registryClient.fetchBlueprints() : null;
  const themesResult = shouldUseRegistry ? await registryClient.fetchThemes() : null;

  if (archetypesResult?.source.type === 'api') {
    registrySource = 'api';
  }

  const archetypes = archetypesResult?.data.items ?? [];
  const blueprints = blueprintsResult?.data.items ?? [];
  const themes = themesResult?.data.items ?? [];

  let options: InitOptions;

  // Track which flags the user explicitly provided (before defaults are merged in)
  const userExplicit = {
    theme: Boolean(args.theme),
    mode: Boolean(args.mode),
    shape: Boolean(args.shape),
    personality: Boolean(args.personality),
  };

  if (preferContractOnly) {
    const flags = parseFlags(args as Record<string, unknown>, detected);
    options = mergeWithDefaults(flags, detected, workflowSeed ?? undefined);
  } else if (args.yes || selectedBlueprint !== 'default') {
    // Non-interactive mode or simplified selection: use flags with defaults
    const flags = parseFlags(args as Record<string, unknown>, detected);
    flags.blueprint = selectedBlueprint !== 'default' ? selectedBlueprint : flags.blueprint;
    options = mergeWithDefaults(flags, detected, workflowSeed ?? undefined);
  } else {
    // Full interactive mode (default blueprint selected)
    options = await runInteractivePrompts(
      detected,
      archetypes,
      blueprints,
      themes,
      workflowSeed ?? undefined,
    );
    // In interactive mode, all choices are explicit
    userExplicit.theme = true;
    userExplicit.mode = true;
    userExplicit.shape = true;
    userExplicit.personality = true;
  }
  options.workflowMode = policy.workflowMode;
  options.adoptionMode = policy.adoptionMode;
  options.contentSource = policy.contentSource;
  options.assistantBridge = policy.assistantBridge;
  options.projectScope = policy.projectScope;
  options.workspaceRoot = workspaceInfo.workspaceRoot;
  options.appRoot = workspaceInfo.appRoot;
  options.analysisArtifacts = policy.hasAnalysisArtifacts;
  options.adapterId = resolveBootstrapTarget(options.target).adapterId;

  // Topology markdown (populated when blueprint has composition)
  let topologyMarkdown = '';

  // Fetch blueprint/archetype data
  let archetypeData:
    | {
        id: string;
        pages?: Array<{
          id: string;
          shell: string;
          default_layout: LayoutItem[];
          patterns?: Array<{ pattern: string; preset?: string; as?: string }>;
        }>;
        features?: string[];
      }
    | undefined;

  // Essence v4 composition data (populated when blueprint has compose entries)
  let composedSections: ComposeSectionsResult | undefined;
  let routeMap: Record<string, { section: string; page: string }> | undefined;
  let patternSpecs: Record<string, PatternSpecSummary> | undefined;
  let blueprintData: RegistryBlueprint | undefined;

  if (shouldUseRegistry && options.blueprint) {
    // Fetch the blueprint to get its primary archetype and theme
    const blueprintResult = await registryClient.fetchBlueprint(options.blueprint);
    if (blueprintResult) {
      const blueprint = blueprintResult.data as RegistryBlueprint;
      printBlueprintPortfolioNotice(blueprint);

      // Apply blueprint theme settings (unless user explicitly provided flags)
      if (blueprint.theme) {
        if (!userExplicit.theme && blueprint.theme.id) {
          options.theme = blueprint.theme.id;
        }
        if (!userExplicit.mode && blueprint.theme.mode) {
          options.mode = blueprint.theme.mode as 'dark' | 'light' | 'auto';
        }
        if (!userExplicit.shape && blueprint.theme.shape) {
          options.shape = blueprint.theme.shape as 'rounded' | 'sharp' | 'pill';
        }
      }

      // Apply blueprint personality (unless user explicitly provided --personality)
      // Personality can be a string (narrative) or string[] (traits) — normalize to string[]
      if (!userExplicit.personality && blueprint.personality) {
        options.personality =
          typeof blueprint.personality === 'string'
            ? [blueprint.personality]
            : blueprint.personality;
      }

      if (blueprint.compose && blueprint.compose.length > 0) {
        // Fetch all archetypes in parallel
        const entries = blueprint.compose;
        // Fetch archetypes sequentially to avoid overwhelming the API
        const results: Array<
          readonly [string, ReturnType<typeof mapRegistryArchetypeToArchetypeData> | null]
        > = [];
        for (const entry of entries) {
          const id = typeof entry === 'string' ? entry : entry.archetype;
          const r = await registryClient.fetchArchetype(id);
          results.push([id, r?.data ? mapRegistryArchetypeToArchetypeData(r.data) : null] as const);
        }
        const archetypeMap = new Map(results);

        // Compose pages from all archetypes
        const composed = composeArchetypes(entries, archetypeMap);
        const primaryId = typeof entries[0] === 'string' ? entries[0] : entries[0].archetype;
        archetypeData = {
          id: primaryId,
          pages: composed.pages.map((p) => ({
            id: p.id,
            shell: p.shell_override || composed.defaultShell,
            default_layout: p.layout,
          })),
          features: composed.features,
        };
        options.archetype = primaryId;
        options.shell = composed.defaultShell;

        // Compose sections (keeps pages grouped by archetype)
        composedSections = composeSections(entries, archetypeMap, blueprint.overrides);

        // Store blueprint data for Essence v4 enrichment
        blueprintData = blueprint;

        // Map blueprint routes to section pages
        routeMap = {};
        if (blueprint.routes) {
          for (const [path, entry] of Object.entries(blueprint.routes)) {
            const archId = entry.archetype;
            const pageId = entry.page;
            if (archId && pageId) {
              routeMap[path] = { section: archId, page: pageId };
              // Set route on the page in the composed section
              const section = composedSections.sections.find((s) => s.id === archId);
              const page = section?.pages.find((p) => p.id === pageId);
              if (page) page.route = path;
            }
          }
        }

        // Fetch pattern specs for inlining in section contexts
        const allPatternIds = new Set<string>();
        for (const section of composedSections.sections) {
          for (const page of section.pages) {
            if (page.patterns) {
              for (const ref of page.patterns) allPatternIds.add(ref.pattern);
            }
            for (const patternId of collectPatternIdsFromItems(page.layout))
              allPatternIds.add(patternId);
          }
        }

        patternSpecs = {};
        if (allPatternIds.size > 0) {
          // Fetch patterns sequentially to avoid overwhelming the API
          for (const pid of allPatternIds) {
            try {
              const result = await registryClient.fetchPattern(pid);
              if (result) {
                patternSpecs[pid] = mapRegistryPatternToPatternSpecSummary(
                  result.data,
                  undefined,
                  false,
                );
              }
            } catch {
              /* pattern not found — skip */
            }
          }
        }

        // Collect zone inputs for topology
        const zoneInputs: ZoneInput[] = [];
        for (const entry of entries) {
          const arcId = typeof entry === 'string' ? entry : entry.archetype;
          const explicitRole = typeof entry === 'string' ? undefined : entry.role;
          const archData = archetypeMap.get(arcId);
          if (archData) {
            zoneInputs.push({
              archetypeId: arcId,
              role: explicitRole || archData.role || 'auxiliary',
              shell: archData.pages?.[0]?.shell || options.shell || 'sidebar-main',
              features: archData.features || [],
              description: archData.description || '',
            });
          }
        }

        // Derive topology
        const zones = deriveZones(zoneInputs);
        const transitions = deriveTransitions(zones);
        const primaryZonePages =
          archetypeData?.pages?.filter((p) => !p.shell || p.shell === composed.defaultShell) || [];
        topologyMarkdown =
          zones.length > 0
            ? generateTopologySection(
                {
                  intent:
                    archetypeMap.get(primaryId)?.description || options.blueprint || 'Application',
                  zones,
                  transitions,
                  entryPoints: {
                    anonymous: '/',
                    authenticated: `/${primaryZonePages[0]?.id || archetypeData?.pages?.[0]?.id || 'home'}`,
                  },
                },
                options.personality || [],
              )
            : '';
      }
    } else {
      if (requestedBlueprint) {
        console.log(error(`  Error: Could not fetch blueprint "${options.blueprint}".`));
        console.log(dim('Resolve local registry content or retry against the hosted registry.'));
        process.exitCode = 1;
        return;
      }
      console.log(
        `${YELLOW}  Warning: Could not fetch blueprint "${options.blueprint}". Using defaults.${RESET}`,
      );
    }
  } else if (shouldUseRegistry && options.archetype) {
    // Direct archetype selection
    const archetypeResult = await registryClient.fetchArchetype(options.archetype);
    if (archetypeResult) {
      archetypeData = mapRegistryArchetypeToArchetypeData(archetypeResult.data);
    } else {
      if (requestedArchetype) {
        console.log(error(`  Error: Could not fetch archetype "${options.archetype}".`));
        console.log(dim('Resolve local registry content or retry against the hosted registry.'));
        process.exitCode = 1;
        return;
      }
      console.log(
        `${YELLOW}  Warning: Could not fetch archetype "${options.archetype}". Using defaults.${RESET}`,
      );
    }
  }

  // Fetch theme data — single fetch, theme now contains all visual treatment data
  let themeData: ThemeData | undefined;

  if (shouldUseRegistry && options.theme) {
    const themeResult = await registryClient.fetchTheme(options.theme);
    if (themeResult) {
      themeData = mapRegistryThemeToThemeData(themeResult.data);
    } else {
      if (requestedTheme) {
        console.log(error(`  Error: Could not fetch theme "${options.theme}".`));
        console.log(dim('Resolve local registry content or retry against the hosted registry.'));
        process.exitCode = 1;
        return;
      }
      console.log(
        `${YELLOW}  Warning: Could not fetch theme "${options.theme}". Using defaults.${RESET}`,
      );
    }
  }

  // Scaffold the project
  console.log(heading('Scaffolding project...'));

  const result = await scaffoldProject(
    projectRoot,
    options,
    detected,
    registryClient,
    archetypeData,
    registrySource as 'api' | 'cache',
    themeData,
    topologyMarkdown,
    // Essence v4 composition data:
    composedSections,
    routeMap,
    patternSpecs,
    blueprintData,
  );

  let assistantBridgePath: string | null = null;
  let appliedRuleFiles: string[] = [];
  if (policy.assistantBridge === 'preview' || policy.assistantBridge === 'apply') {
    assistantBridgePath = writeAssistantBridgePreview({
      projectRoot,
      detected,
      workflowMode: policy.workflowMode,
      assistantBridge: policy.assistantBridge,
    });
  }
  if (policy.assistantBridge === 'apply') {
    appliedRuleFiles = applyAssistantBridge(projectRoot, detected);
  }

  if (args.telemetry) enableCliTelemetry(projectRoot);
  writeArtifactReadme(projectRoot);

  // Output summary
  console.log(success('\nProject scaffolded!\n'));
  console.log('  Files created:');
  console.log(`    ${cyan('decantr.essence.json')}    Design specification`);
  console.log(`    ${cyan('DECANTR.md')}              LLM instructions`);
  console.log(`    ${cyan('.decantr/')}               Project state & cache`);

  if (result.gitignoreUpdated) {
    console.log(`    ${dim('.gitignore updated')}`);
  }
  if (assistantBridgePath) {
    console.log(`    ${cyan('.decantr/context/assistant-bridge.md')} Assistant bridge preview`);
  }
  if (appliedRuleFiles.length > 0) {
    console.log(`    ${dim(`Rule bridge applied: ${appliedRuleFiles.join(', ')}`)}`);
  }

  if (!existsSync(join(projectRoot, 'package.json'))) {
    console.log('');
    console.log(
      dim(`  Note: ${cyan('decantr init')} created Decantr contract/context files only.`),
    );
    console.log(
      dim(
        `  For a runnable starter in a new directory, prefer ${cyan('decantr new <name> --blueprint=...')}.`,
      ),
    );
  }

  const hasCompiledPacks = existsSync(join(projectRoot, '.decantr', 'context', 'scaffold-pack.md'));

  console.log('');
  console.log('  Next steps:');
  if (hasCompiledPacks) {
    console.log(
      '    1. Read .decantr/context/scaffold-pack.md first as the primary compiled contract',
    );
    console.log(
      '    2. Read .decantr/context/scaffold.md for broader topology, route map, and voice guidance',
    );
    console.log('    3. Read the matching section and page packs before implementing each route');
    console.log(
      '    4. Use DECANTR.md as a lookup reference for atoms, treatments, and guard rules',
    );
    console.log('    5. Build the shell and route structure first, then implement the pages');
    console.log('    6. Run decantr check and decantr audit after implementation');
    console.log('    7. Explore more at decantr.ai/registry');
  } else {
    console.log('    1. Fix the validation issue reported above');
    console.log('    2. Run decantr refresh to restore compiled execution packs');
    console.log(
      '    3. Until packs exist, read .decantr/context/scaffold.md and section context files',
    );
    console.log(
      '    4. Use DECANTR.md as a lookup reference for atoms, treatments, and guard rules',
    );
    console.log('    5. Run decantr check and decantr audit after implementation');
  }
  console.log('');
  console.log('  Commands:');
  console.log(`    ${cyan('decantr status')}     Project health`);
  console.log(`    ${cyan('decantr health')}     Contract health report`);
  console.log(`    ${cyan('decantr content-health')} Registry content health report`);
  console.log(`    ${cyan('decantr studio')}     Local health dashboard`);
  console.log(`    ${cyan('decantr search')}     Search registry`);
  console.log(`    ${cyan('decantr get')}        Fetch content details`);
  console.log(`    ${cyan('decantr validate')}   Check essence file`);
  console.log(`    ${cyan('decantr upgrade')}    Update to latest patterns`);
  console.log(`    ${cyan('decantr check')}      Detect drift issues`);
  console.log(`    ${cyan('decantr migrate --to v4')} Migrate older essence files to v4`);

  const essenceContent = readFileSync(result.essencePath, 'utf-8');
  const essence = JSON.parse(essenceContent);
  const validation = validateEssence(essence);
  if (!validation.valid) {
    console.log(error(`\nValidation warnings: ${validation.errors.join(', ')}`));
  }

  console.log('');

  // Generate curated prompt
  let promptPages: PromptContext['pages'];
  if (isV4(essence)) {
    const allPages = essence.blueprint.sections.flatMap((s: any) =>
      s.pages.map((p: any) => ({ ...p, _sectionId: s.id, _shell: s.shell })),
    );
    promptPages = allPages.map(
      (p: {
        id: string;
        shell_override?: string | null;
        layout: unknown[];
        _sectionId?: string;
        _shell?: string;
      }) => ({
        id: p.id,
        sectionId: p._sectionId,
        shell: p.shell_override ?? p._shell ?? essence.blueprint.shell,
        layout: (p.layout || []).map((item: unknown) =>
          typeof item === 'string' ? item : extractPatternName(item),
        ),
      }),
    );
  } else {
    promptPages = [];
  }

  const promptCtx: PromptContext = {
    workflow: options.workflowMode || 'greenfield-scaffold',
    adoptionMode: options.adoptionMode,
    analysisArtifacts: options.analysisArtifacts,
    archetype: options.archetype || 'custom',
    blueprint: options.blueprint,
    theme: options.theme,
    mode: options.mode,
    target: options.target,
    pages: promptPages,
    personality: options.personality,
    features: options.features,
    guard: options.guard,
    hasCompiledPacks,
  };

  const curatedPrompt = generateCuratedPrompt(promptCtx);
  console.log('');
  console.log(`${BOLD}Prompt for your AI assistant:${RESET}`);
  console.log(dim('─'.repeat(50)));
  console.log('');
  console.log(curatedPrompt);
  console.log('');
  console.log(dim('─'.repeat(50)));
  console.log('');

  if (registrySource === 'cache') {
    console.log(dim('Run "decantr sync" when online to get the latest registry content.'));
  }
}

// ── Status command ──

async function cmdStatus(projectRoot: string = process.cwd()) {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  const projectJsonPath = join(projectRoot, '.decantr', 'project.json');

  console.log(heading('Decantr Project Status'));

  // Check essence
  if (!existsSync(essencePath)) {
    console.log(`${RED}No decantr.essence.json found.${RESET}`);
    console.log(dim('Run "decantr init" to create one.'));
    return;
  }

  // Validate essence
  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as EssenceFile;
    const validation = validateEssence(essence);

    const essenceVersion = isV4(essence) ? 'v4' : 'legacy';
    console.log(`${BOLD}Essence:${RESET}`);
    if (validation.valid) {
      console.log(`  ${GREEN}Valid${RESET} (${essenceVersion})`);
    } else {
      console.log(`  ${RED}Invalid: ${validation.errors.join(', ')}${RESET}`);
    }

    if (isV4(essence)) {
      const v4 = essence as EssenceV4;
      const sections = v4.blueprint.sections;
      const flatPages = sections.flatMap((section: any) => section.pages ?? []);
      const resolvedShell =
        sections.find((section: any) => section.role === 'primary')?.shell ||
        sections[0]?.shell ||
        (v4.blueprint as any).shell ||
        'unknown';
      const resolvedFeatures = v4.blueprint.features ?? [];
      // DNA axioms
      console.log(`  ${BOLD}DNA:${RESET}`);
      console.log(`    Theme: ${v4.dna.theme.id} (${v4.dna.theme.mode})`);
      console.log(
        `    Spacing: ${v4.dna.spacing.density} density, ${v4.dna.spacing.content_gap} gap`,
      );
      console.log(`    Typography: ${v4.dna.typography.scale} scale`);
      console.log(`    Radius: ${v4.dna.radius.philosophy} (base ${v4.dna.radius.base}px)`);
      console.log(
        `    Motion: ${v4.dna.motion.preference} (reduce: ${v4.dna.motion.reduce_motion})`,
      );
      console.log(`    Accessibility: WCAG ${v4.dna.accessibility.wcag_level}`);
      console.log(`    Personality: ${v4.dna.personality.join(', ')}`);
      // Blueprint
      console.log(`  ${BOLD}Blueprint:${RESET}`);
      console.log(`    Shell: ${resolvedShell}`);
      console.log(`    Pages: ${flatPages.length}`);
      console.log(`    Sections: ${sections.length}`);
      console.log(
        `    Features: ${resolvedFeatures.length > 0 ? resolvedFeatures.join(', ') : 'none'}`,
      );
      // Meta
      console.log(`  ${BOLD}Meta:${RESET}`);
      console.log(`    Archetype: ${v4.meta.archetype}`);
      console.log(`    Target: ${v4.meta.target}`);
      console.log(
        `    Guard: ${v4.meta.guard.mode} (DNA: ${v4.meta.guard.dna_enforcement}, Blueprint: ${v4.meta.guard.blueprint_enforcement})`,
      );
    } else {
      console.log(`  ${YELLOW}Run \`decantr migrate --to v4\` to upgrade this project.${RESET}`);
    }
  } catch (e) {
    console.log(`  ${RED}Error reading essence: ${(e as Error).message}${RESET}`);
  }

  // Check project.json
  console.log('');
  console.log(`${BOLD}Sync Status:${RESET}`);

  if (existsSync(projectJsonPath)) {
    try {
      const projectJson = JSON.parse(readFileSync(projectJsonPath, 'utf-8'));
      const syncStatus = projectJson.sync?.status || 'unknown';
      const lastSync = projectJson.sync?.lastSync || 'never';
      const source = projectJson.sync?.registrySource || 'unknown';

      const statusColor = syncStatus === 'synced' ? GREEN : YELLOW;
      console.log(`  Status: ${statusColor}${syncStatus}${RESET}`);
      console.log(`  Last sync: ${dim(lastSync)}`);
      console.log(`  Source: ${dim(source)}`);
    } catch {
      console.log(`  ${YELLOW}Could not read project.json${RESET}`);
    }
  } else {
    console.log(`  ${YELLOW}No .decantr/project.json found${RESET}`);
    console.log(dim('  Run "decantr init" to create project files.'));
  }
}

// ── Sync command ──

async function cmdSync() {
  const projectRoot = process.cwd();
  const cacheDir = join(projectRoot, '.decantr', 'cache');

  console.log(heading('Syncing registry content...'));

  const result = await syncRegistry(cacheDir);

  if (result.synced.length > 0) {
    console.log(success('Sync completed successfully.'));
    console.log(`  Synced: ${result.synced.join(', ')}`);
    if (result.failed.length > 0) {
      console.log(`  ${YELLOW}Failed: ${result.failed.join(', ')}${RESET}`);
    }
  } else {
    console.log(`${YELLOW}Could not sync: API unavailable${RESET}`);
    if (result.failed.length > 0) {
      console.log(`  ${YELLOW}Failed: ${result.failed.join(', ')}${RESET}`);
    }
  }
}

// ── Audit command ──

function printVerificationFindings(findings: VerificationFinding[]) {
  if (findings.length === 0) {
    console.log(success('No findings.'));
    return;
  }

  for (const finding of findings) {
    const color = finding.severity === 'error' ? RED : finding.severity === 'warn' ? YELLOW : CYAN;
    console.log(
      `  ${color}[${finding.severity.toUpperCase()}]${RESET} ${finding.category}: ${finding.message}`,
    );
    for (const evidence of finding.evidence) {
      console.log(`    ${DIM}${evidence}${RESET}`);
    }
    if (finding.suggestedFix) {
      console.log(`    ${DIM}Fix: ${finding.suggestedFix}${RESET}`);
    }
  }
}

function printProjectAuditReport(report: ProjectAuditReport) {
  if (report.valid) {
    console.log(success('Project contract is valid.'));
  } else {
    console.log(`${RED}Project audit found blocking issues.${RESET}`);
  }

  console.log('');
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  Essence version: ${report.summary.essenceVersion ?? 'missing'}`);
  console.log(`  Pages defined: ${report.summary.pageCount}`);
  console.log(`  Pack manifest: ${report.summary.packManifestPresent ? 'present' : 'missing'}`);
  console.log(`  Review pack: ${report.summary.reviewPackPresent ? 'present' : 'missing'}`);
  const runtimeStatus = report.summary.runtimeAuditChecked
    ? report.summary.runtimePassed
      ? 'passed'
      : 'failed'
    : report.runtimeAudit.distPresent
      ? 'incomplete'
      : 'pending (no dist/)';
  console.log(`  Runtime audit: ${runtimeStatus}`);
  if (report.summary.runtimeAuditChecked && report.runtimeAudit.assetCount > 0) {
    const fmt = (bytes: number) =>
      bytes >= 1_000_000
        ? `${(bytes / 1_000_000).toFixed(2)} MB`
        : `${Math.round(bytes / 1_000)} KB`;
    console.log(
      `  Built assets: total ${fmt(report.runtimeAudit.totalAssetBytes)} | js ${fmt(report.runtimeAudit.jsAssetBytes)} | css ${fmt(report.runtimeAudit.cssAssetBytes)}`,
    );
    console.log(
      `  Document hardening: lang ${report.runtimeAudit.langOk ? 'ok' : 'missing'} | viewport ${report.runtimeAudit.viewportOk ? 'ok' : 'missing'} | charset ${report.runtimeAudit.charsetOk ? 'ok' : 'missing'} | csp ${report.runtimeAudit.cspSignalOk ? 'present' : 'missing'}`,
    );
    console.log(
      `  Route document shell: root docs ${report.runtimeAudit.routeDocumentsPassed}/${report.runtimeAudit.routeDocumentsChecked} | hardened docs ${report.runtimeAudit.routeDocumentsHardenedCount}/${report.runtimeAudit.routeDocumentsChecked}`,
    );
    console.log(
      `  Script hygiene: inline scripts ${report.runtimeAudit.inlineScriptCount} | inline event handlers ${report.runtimeAudit.inlineEventHandlerCount} | scripts without integrity ${report.runtimeAudit.externalScriptsWithoutIntegrityCount} | scripts missing crossorigin ${report.runtimeAudit.externalScriptsWithIntegrityMissingCrossoriginCount} | stylesheets without integrity ${report.runtimeAudit.externalStylesheetsWithoutIntegrityCount} | stylesheets missing crossorigin ${report.runtimeAudit.externalStylesheetsWithIntegrityMissingCrossoriginCount} | insecure external scripts ${report.runtimeAudit.externalScriptsWithInsecureTransportCount} | insecure external stylesheets ${report.runtimeAudit.externalStylesheetsWithInsecureTransportCount} | insecure external media ${report.runtimeAudit.externalMediaSourcesWithInsecureTransportCount} | external blank links missing rel ${report.runtimeAudit.externalBlankLinksWithoutRelCount} | external iframes missing sandbox ${report.runtimeAudit.externalIframesWithoutSandboxCount} | insecure external iframes ${report.runtimeAudit.externalIframesWithInsecureTransportCount}`,
    );
    console.log(
      `  JS risk signals: dynamic code ${report.runtimeAudit.jsEvalSignalCount} | html injection ${report.runtimeAudit.jsHtmlInjectionSignalCount} | insecure/dev transport ${report.runtimeAudit.jsInsecureTransportSignalCount} | secret markers ${report.runtimeAudit.jsSecretSignalCount}`,
    );
  }
  console.log(
    `  Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`,
  );

  console.log('');
  console.log(`${BOLD}Findings:${RESET}`);
  printVerificationFindings(report.findings);
}

function printFileCritiqueReport(report: FileCritiqueReport) {
  console.log(success(`Critiqued ${report.file}`));
  console.log('');
  console.log(`${BOLD}Summary:${RESET}`);
  console.log(`  Overall score: ${report.overall}/5`);
  console.log(`  Focus areas: ${report.focusAreas.join(', ')}`);
  console.log(`  Review pack: ${report.reviewPack ? 'present' : 'missing'}`);

  console.log('');
  console.log(`${BOLD}Scores:${RESET}`);
  for (const score of report.scores) {
    console.log(`  ${cyan(score.category.padEnd(20))} ${score.score}/5  ${dim(score.details)}`);
  }

  console.log('');
  console.log(`${BOLD}Findings:${RESET}`);
  printVerificationFindings(report.findings);
}

async function cmdAudit(filePath?: string) {
  const projectRoot = process.cwd();

  try {
    if (filePath) {
      const hydration = await hydrateHostedReviewPackIfMissing(projectRoot);
      console.log(heading(`Critiquing ${filePath}...`));
      if (hydration.hydrated) {
        console.log(dim('Hydrated missing review pack from hosted registry.'));
        console.log('');
      }
      const report = await critiqueProjectFile(filePath, projectRoot);
      printFileCritiqueReport(report);
      if (report.findings.some((finding) => finding.severity === 'error')) {
        process.exitCode = 1;
      }
      return;
    }

    const hydration = await hydrateHostedExecutionPacksIfMissing(projectRoot);
    console.log(heading('Auditing project...'));
    if (hydration.hydrated) {
      console.log(
        dim(
          hydration.scope === 'bundle'
            ? 'Hydrated missing execution packs from hosted registry.'
            : 'Hydrated missing review pack and manifest from hosted registry.',
        ),
      );
      console.log('');
    }
    const report = await auditProject(projectRoot);
    printProjectAuditReport(report);

    if (!report.valid) {
      process.exitCode = 1;
      return;
    }

    if (report.findings.length > 0) {
      console.log('');
      console.log(dim('Project audit completed with advisory findings.'));
    }
  } catch (e) {
    console.log(`${RED}Error: ${(e as Error).message}${RESET}`);
    process.exitCode = 1;
  }
}

// ── Theme subcommand ──

async function cmdTheme(args: string[], projectRoot: string = process.cwd()) {
  const subcommand = args[0];

  if (!subcommand || subcommand === 'help') {
    console.log(`
${BOLD}decantr theme${RESET} — Manage custom themes

${BOLD}Commands:${RESET}
  ${cyan('create')} <name>        Create a new custom theme
  ${cyan('create')} <name> --guided   Interactive theme creation
  ${cyan('list')}                 List custom themes
  ${cyan('validate')} <name>      Validate a custom theme
  ${cyan('delete')} <name>        Delete a custom theme
  ${cyan('import')} <path>        Import theme from JSON file

${BOLD}Examples:${RESET}
  decantr theme create mytheme
  decantr theme list
  decantr theme validate mytheme
  decantr theme import ./external-theme.json
`);
    return;
  }

  switch (subcommand) {
    case 'create': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme create <name>'));
        process.exitCode = 1;
        return;
      }
      // Convert to display name (capitalize first letter)
      const displayName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');
      const result = createTheme(projectRoot, name, displayName);
      if (result.success) {
        console.log(success(`Created custom theme "${name}"`));
        console.log(dim(`  Path: ${result.path}`));
        console.log('');
        console.log(`Use in essence: ${cyan(`"id": "custom:${name}"`)}`);
      } else {
        console.error(error(result.error || 'Failed to create theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'list': {
      const themes = listCustomThemes(projectRoot);
      if (themes.length === 0) {
        console.log(dim('No custom themes found.'));
        console.log(dim('Run "decantr theme create <name>" to create one.'));
      } else {
        console.log(heading(`${themes.length} custom theme(s)`));
        for (const theme of themes) {
          console.log(`  ${cyan(`custom:${theme.id}`)}  ${dim(theme.description || theme.name)}`);
        }
      }
      break;
    }

    case 'validate': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme validate <name>'));
        process.exitCode = 1;
        return;
      }
      const themePath = join(projectRoot, '.decantr', 'custom', 'themes', `${name}.json`);
      if (!existsSync(themePath)) {
        console.error(error(`Theme "${name}" not found at ${themePath}`));
        process.exitCode = 1;
        return;
      }
      try {
        const theme = JSON.parse(readFileSync(themePath, 'utf-8'));
        const result = validateCustomTheme(theme);
        if (result.valid) {
          console.log(success(`Custom theme "${name}" is valid`));
        } else {
          console.error(error('Validation failed:'));
          for (const err of result.errors) {
            console.error(`  ${RED}${err}${RESET}`);
          }
          process.exitCode = 1;
        }
      } catch (e) {
        console.error(error(`Invalid JSON: ${(e as Error).message}`));
        process.exitCode = 1;
      }
      break;
    }

    case 'delete': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme delete <name>'));
        process.exitCode = 1;
        return;
      }
      const result = deleteTheme(projectRoot, name);
      if (result.success) {
        console.log(success(`Deleted custom theme "${name}"`));
      } else {
        console.error(error(result.error || 'Failed to delete theme'));
        process.exitCode = 1;
      }
      break;
    }

    case 'import': {
      const sourcePath = args[1];
      if (!sourcePath) {
        console.error(error('Usage: decantr theme import <path>'));
        process.exitCode = 1;
        return;
      }
      const result = importTheme(projectRoot, sourcePath);
      if (result.success) {
        console.log(success('Theme imported successfully'));
        console.log(dim(`  Path: ${result.path}`));
      } else {
        console.error(error('Import failed:'));
        for (const err of result.errors || []) {
          console.error(`  ${RED}${err}${RESET}`);
        }
        process.exitCode = 1;
      }
      break;
    }

    case 'switch': {
      const name = args[1];
      if (!name) {
        console.error(error('Usage: decantr theme switch <themeName> [--shape <s>] [--mode <m>]'));
        process.exitCode = 1;
        return;
      }
      await cmdThemeSwitch(name, args.slice(1), projectRoot);
      break;
    }

    default:
      console.error(error(`Unknown theme command: ${subcommand}`));
      process.exitCode = 1;
  }
}

// ── Workflow commands ──

interface LooseParsedArgs {
  flags: Record<string, string | boolean>;
  positional: string[];
}

function parseLooseArgs(args: string[], startIndex = 1): LooseParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positional: string[] = [];

  for (let index = startIndex; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '-y') {
      flags.yes = true;
      continue;
    }
    if (arg.startsWith('--no-')) {
      flags[arg.slice(5)] = false;
      continue;
    }
    if (arg.startsWith('--')) {
      const body = arg.slice(2);
      const equalsIndex = body.indexOf('=');
      if (equalsIndex !== -1) {
        flags[body.slice(0, equalsIndex)] = body.slice(equalsIndex + 1);
        continue;
      }
      if (args[index + 1] && !args[index + 1].startsWith('-')) {
        flags[body] = args[++index];
      } else {
        flags[body] = true;
      }
      continue;
    }
    positional.push(arg);
  }

  return { flags, positional };
}

function flagString(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

function flagBoolean(
  flags: Record<string, string | boolean>,
  key: string,
  defaultValue = false,
): boolean {
  const value = flags[key];
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value !== 'false';
  return defaultValue;
}

function withoutWorkflowOnlyFlags(args: string[]): string[] {
  const stripped: string[] = [];
  const flagsWithValues = new Set(['--project']);
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (
      arg === '--brownfield' ||
      arg === '--local-patterns' ||
      arg === '--workspace' ||
      arg === '--baseline'
    ) {
      continue;
    }
    if (arg.startsWith('--project=')) {
      continue;
    }
    if (flagsWithValues.has(arg)) {
      index += 1;
      continue;
    }
    stripped.push(arg);
  }
  return stripped;
}

function withProject(command: string, projectArg?: string): string {
  return projectArg ? `${command} --project ${projectArg}` : command;
}

function displayProjectPath(
  workspaceInfo: { cwd: string; appRoot: string },
  projectPath: string,
): string {
  const absolutePath = join(workspaceInfo.appRoot, projectPath);
  const relativePath = relative(workspaceInfo.cwd, absolutePath).replace(/\\/g, '/');
  if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
    return relativePath;
  }
  return absolutePath;
}

function projectRelativeGraphPath(projectRoot: string, filePath: string): string | null {
  const relativePath = relative(projectRoot, isAbsolute(filePath) ? filePath : resolve(filePath));
  if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
    return relativePath.replace(/\\/g, '/');
  }
  return null;
}

function graphSourceNodeIdForTaskFile(
  projectRoot: string,
  snapshot: GraphSnapshot,
  filePath: string,
): string | null {
  const trimmed = filePath.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('src:') && snapshot.nodes.some((node) => node.id === trimmed)) {
    return trimmed;
  }

  const candidates = new Set<string>();
  candidates.add(trimmed.replace(/\\/g, '/').replace(/^\.\//, ''));
  const cwdRelative = projectRelativeGraphPath(projectRoot, trimmed);
  if (cwdRelative) candidates.add(cwdRelative);
  const projectRelative = projectRelativeGraphPath(projectRoot, join(projectRoot, trimmed));
  if (projectRelative) candidates.add(projectRelative);

  for (const candidate of candidates) {
    const nodeId = `src:${candidate}`;
    if (snapshot.nodes.some((node) => node.id === nodeId)) return nodeId;
  }

  return (
    snapshot.nodes.find((node) => {
      if (node.type !== 'SourceArtifact') return false;
      const path = graphPayloadString(node.payload, 'path');
      return Boolean(path && (path === trimmed || candidates.has(path)));
    })?.id ?? null
  );
}

function stripProjectArgs(args: string[], startIndex = 1): string[] {
  const stripped = [args[0]];
  for (let index = startIndex; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--project' && args[index + 1]) {
      index += 1;
      continue;
    }
    if (arg.startsWith('--project=')) continue;
    stripped.push(arg);
  }
  return stripped;
}

function normalizedProjectPath(value: string | undefined): string | null {
  if (!value) return null;
  return value.replace(/\\/g, '/').replace(/\/+$/g, '');
}

function printProjectNotFound(projectArg: string, commandName: string): void {
  console.error(error(`decantr ${commandName} could not find project path: ${projectArg}`));
  console.error(dim('Pass an existing app path, for example `--project apps/web`.'));
}

function ensureAllowedFlags(
  flags: Record<string, string | boolean>,
  allowed: string[],
  commandName: string,
): boolean {
  const allowedSet = new Set(allowed);
  const unknown = Object.keys(flags).filter((flag) => !allowedSet.has(flag));
  if (unknown.length === 0) return true;
  console.error(error(`Unsupported option for decantr ${commandName}: --${unknown[0]}`));
  console.error(dim('Run `decantr help` or the command-specific help to see supported options.'));
  process.exitCode = 1;
  return false;
}

function compilePacksCommandForProject(projectArg?: string): string {
  const essencePath = projectArg ? `${projectArg}/decantr.essence.json` : 'decantr.essence.json';
  return `decantr registry compile-packs ${essencePath} --write-context`;
}

function firstWorkspaceCandidate(workspaceInfo: ReturnType<typeof resolveWorkspaceInfo>): string {
  return workspaceInfo.appCandidates[0] ?? 'apps/web';
}

function printWorkspaceProjectSelection(
  workspaceInfo: ReturnType<typeof resolveWorkspaceInfo>,
  commandName = 'command',
): void {
  const candidate = firstWorkspaceCandidate(workspaceInfo);
  const noun = commandName === 'adopt' ? 'Brownfield adoption' : `decantr ${commandName}`;
  console.log(error(`${noun} needs an app path.`));
  console.log('');
  console.log(`${BOLD}This looks like a monorepo.${RESET}`);
  console.log('Install Decantr at the workspace root, then attach it to one app with --project.');
  console.log('');
  console.log('App candidates:');
  for (const appCandidate of workspaceInfo.appCandidates) {
    console.log(`  ${appCandidate}`);
  }
  console.log('');
  console.log('Start by attaching one app:');
  console.log(`  ${cyan(`decantr adopt --project ${candidate} --yes`)}`);
  console.log(`  ${cyan(`decantr codify --from-audit --style-bridge --project ${candidate}`)}`);
  console.log('');
  console.log('Optional visual evidence after the app is running:');
  console.log(
    `  ${cyan(`decantr verify --project ${candidate} --base-url http://localhost:3000 --evidence`)}`,
  );
}

function printMonorepoSetupGuidance(workspaceInfo: ReturnType<typeof resolveWorkspaceInfo>): void {
  const candidate = firstWorkspaceCandidate(workspaceInfo);
  const attachedProjects = workspaceInfo.appCandidates.filter((appCandidate) =>
    existsSync(join(workspaceInfo.workspaceRoot, appCandidate, 'decantr.essence.json')),
  );
  const firstAttached = attachedProjects[0];
  console.log(heading('Decantr Setup'));
  console.log(`${BOLD}This looks like a monorepo.${RESET}`);
  console.log(`  Workspace root: ${workspaceInfo.workspaceRoot}`);
  console.log('');
  if (firstAttached) {
    console.log('Decantr is already attached to at least one app.');
    console.log('');
    console.log('Attached projects:');
    for (const project of attachedProjects) {
      console.log(`  ${project}`);
    }
    console.log('');
    console.log(`${BOLD}Next:${RESET}`);
    console.log(
      `  ${cyan(`decantr doctor --project ${firstAttached}`)}                    Explain current state and next command`,
    );
    console.log(
      `  ${cyan(`decantr task <route> "<change>" --project ${firstAttached}`)}   Prepare LLM context before edits`,
    );
    console.log(
      `  ${cyan(`decantr verify --brownfield --local-patterns --project ${firstAttached}`)}  Check after edits`,
    );
    console.log(
      `  ${cyan(`decantr ci init --project ${firstAttached}`)}                  Wire the app into CI`,
    );
    const unattached = workspaceInfo.appCandidates.filter(
      (appCandidate) => !attachedProjects.includes(appCandidate),
    );
    if (unattached.length > 0) {
      console.log('');
      console.log('Other app candidates:');
      for (const appCandidate of unattached) {
        console.log(`  ${appCandidate}`);
      }
    }
    return;
  }

  console.log(
    'Install Decantr at the workspace root, then attach it to the app you want Decantr to govern.',
  );
  console.log('');
  console.log('App candidates:');
  for (const appCandidate of workspaceInfo.appCandidates) {
    console.log(`  ${appCandidate}`);
  }
  console.log('');
  console.log(`${BOLD}Start here:${RESET}`);
  console.log(
    `  ${cyan('decantr workspace list')}                         Show attached projects and app candidates`,
  );
  console.log(
    `  ${cyan(`decantr adopt --project ${candidate} --yes`)}          Attach Decantr to one app`,
  );
  console.log(
    `  ${cyan(`decantr codify --from-audit --style-bridge --project ${candidate}`)}  Propose project-owned UI law and style bridge`,
  );
  console.log('');
  console.log(`${BOLD}Optional visual evidence:${RESET}`);
  console.log(
    `  ${cyan(`decantr verify --project ${candidate} --base-url http://localhost:3000 --evidence`)}`,
  );
}

function resolveWorkflowProject(
  flags: Record<string, string | boolean>,
  commandName = 'command',
  options: {
    requireExisting?: boolean;
    requireAppCandidate?: boolean;
    allowPackageProject?: boolean;
  } = {},
) {
  const projectArg = flagString(flags, 'project');
  const workspaceInfo = resolveWorkspaceInfo(process.cwd(), projectArg);
  if (projectArg && options.requireExisting !== false && !existsSync(workspaceInfo.appRoot)) {
    printProjectNotFound(projectArg, commandName);
    process.exitCode = 1;
    return null;
  }
  if (projectArg && options.requireAppCandidate && workspaceInfo.appCandidates.length > 0) {
    const normalizedProject = normalizedProjectPath(projectArg);
    const normalizedWorkspaceProject = normalizedProjectPath(
      relative(workspaceInfo.workspaceRoot, workspaceInfo.appRoot),
    );
    const knownCandidate = normalizedProject
      ? workspaceInfo.appCandidates.includes(normalizedProject) ||
        Boolean(
          normalizedWorkspaceProject &&
            workspaceInfo.appCandidates.includes(normalizedWorkspaceProject),
        )
      : false;
    const forcePackage =
      flagBoolean(flags, 'force-package') ||
      flagBoolean(flags, 'allow-package') ||
      flagBoolean(flags, 'force');
    if (!knownCandidate && !forcePackage && !options.allowPackageProject) {
      console.error(
        error(`decantr ${commandName} is app-scoped, but "${projectArg}" is not an app candidate.`),
      );
      if (workspaceInfo.appCandidates.length > 0) {
        console.error(dim(`App candidates: ${workspaceInfo.appCandidates.join(', ')}`));
      }
      console.error(
        dim(
          'Use --force-package only if you intentionally want Decantr attached to a non-app package.',
        ),
      );
      process.exitCode = 1;
      return null;
    }
  }
  if (workspaceInfo.requiresProjectSelection) {
    printWorkspaceProjectSelection(workspaceInfo, commandName);
    process.exitCode = 1;
    return null;
  }
  return workspaceInfo;
}

function printWorkflowPlan(title: string, steps: string[]): void {
  console.log(heading(title));
  console.log('  Decantr will run this workflow:');
  for (const step of steps) {
    console.log(`    ${cyan(step)}`);
  }
  console.log('');
}

function studioCommandForProject(projectArg?: string): string {
  return projectArg ? `cd ${projectArg} && decantr studio` : 'decantr studio';
}

function formatWhichCommandFirst(projectArg?: string): string {
  return [
    `${BOLD}Which command first?${RESET}`,
    `  ${cyan(withProject('decantr scan', projectArg))}          Existing app, read-only preview`,
    `  ${cyan(withProject('decantr adopt --yes', projectArg))}   Existing app, attach Decantr`,
    `  ${cyan('decantr new my-app --blueprint=<slug>')}  New runnable app`,
    `  ${cyan(withProject('decantr init --existing', projectArg))}  Advanced attach primitive`,
  ].join('\n');
}

function routeHintFromScanReport(report: ScanReport): string | null {
  const routes = report.routes.map((route) => route.path).filter(Boolean);
  return (
    routes.find((route) => route !== '/' && !route.includes('*') && !route.includes(':')) ??
    routes.find((route) => route !== '/' && !route.includes('*')) ??
    routes.find((route) => route !== '/') ??
    routes[0] ??
    null
  );
}

function scanSeverityColor(finding: ScanFindingV1): string {
  if (finding.severity === 'success') return success('ok');
  if (finding.severity === 'error') return error('error');
  if (finding.severity === 'warn') return `${YELLOW}warn${RESET}`;
  return cyan('info');
}

function formatScanApplicability(status: ScanReport['applicability']['status']): string {
  if (status === 'strong_fit') return success('strong fit');
  if (status === 'partial_fit') return `${YELLOW}partial fit${RESET}`;
  if (status === 'not_applicable') return dim('not applicable');
  return dim('unknown');
}

function formatScanGraphPreviewStatus(status: ScanGraphPreviewV1['status']): string {
  if (status === 'current') return success('current');
  if (status === 'stale') return `${YELLOW}stale or missing${RESET}`;
  if (status === 'needs_migration') return `${YELLOW}needs migration${RESET}`;
  if (status === 'not_attached') return dim('not attached');
  return dim('unavailable');
}

function relativeGraphArtifactPath(projectRoot: string, artifactPath: string): string {
  return relative(projectRoot, artifactPath).replace(/\\/g, '/');
}

function buildScanGraphPreview(
  workspaceInfo: { cwd: string; appRoot: string },
  projectArg?: string,
): ScanGraphPreviewV1 {
  let artifacts: ReturnType<typeof buildGraphArtifacts>;
  try {
    artifacts = buildGraphArtifacts(workspaceInfo.appRoot);
  } catch (error) {
    const message = (error as Error).message;
    const needsMigration = message.includes('Essence v4');
    return {
      status: needsMigration ? 'needs_migration' : 'unavailable',
      canPreview: false,
      readOnly: true,
      message: needsMigration
        ? 'Existing Decantr contract needs Essence v4 before a typed Contract graph can be previewed.'
        : message,
      nextCommand: needsMigration ? withProject('decantr migrate --to v4', projectArg) : null,
      staleArtifacts: [],
      snapshot: null,
      capsule: null,
      diff: null,
    };
  }

  if (!artifacts) {
    return {
      status: 'not_attached',
      canPreview: false,
      readOnly: true,
      message:
        'No decantr.essence.json found. Adopt the project to create the first typed Contract graph baseline.',
      nextCommand: withProject('decantr adopt --yes', projectArg),
      staleArtifacts: [],
      snapshot: null,
      capsule: null,
      diff: null,
    };
  }

  const stale = artifacts.staleArtifacts.length > 0;
  const diffSummary = summarizeGraphDiff(artifacts.diff);
  return {
    status: stale ? 'stale' : 'current',
    canPreview: true,
    readOnly: true,
    message: stale
      ? 'A typed Contract graph can be derived now, but saved graph artifacts are missing or stale.'
      : 'Typed Contract graph artifacts are current with the project-owned contract sources.',
    nextCommand: stale ? withProject('decantr graph', projectArg) : null,
    staleArtifacts: artifacts.staleArtifacts.map((path) =>
      displayProjectPath(workspaceInfo, relativeGraphArtifactPath(artifacts.projectRoot, path)),
    ),
    snapshot: {
      id: artifacts.snapshot.id,
      schemaVersion: artifacts.snapshot.schema_version,
      sourceHash: artifacts.snapshot.source_hash,
      nodes: artifacts.snapshot.summary.nodes,
      edges: artifacts.snapshot.summary.edges,
      findings: artifacts.snapshot.summary.findings,
      evidence: artifacts.snapshot.summary.evidence,
      sourceArtifacts: artifacts.snapshot.nodes.filter((node) => node.type === 'SourceArtifact')
        .length,
    },
    capsule: {
      cacheKey: artifacts.capsule.cache_key,
      routes: artifacts.capsule.summary.routes,
      components: artifacts.capsule.summary.components,
      tokens: artifacts.capsule.summary.tokens,
      localRules: artifacts.capsule.summary.local_rules,
      styleBridge: artifacts.capsule.summary.style_bridge,
      sourceArtifacts: artifacts.capsule.summary.source_artifacts,
      sourceArtifactLimit: artifacts.capsule.source_artifact_limit,
      sourceArtifactsTruncated: artifacts.capsule.source_artifacts_truncated,
      openFindings: artifacts.capsule.summary.open_findings,
    },
    diff: {
      ops: diffSummary.total,
      findingsAdded: diffSummary.findings.added,
      findingsResolved: diffSummary.findings.resolved,
      evidenceAdded: diffSummary.evidence.added,
    },
  };
}

function printScanGraphPreview(preview?: ScanGraphPreviewV1): void {
  if (!preview) return;
  console.log(`${BOLD}Typed Contract Graph${RESET}`);
  console.log(`  Status:         ${formatScanGraphPreviewStatus(preview.status)}`);
  console.log(`  Read-only:      ${preview.readOnly ? 'yes' : 'no'}`);
  if (preview.snapshot && preview.capsule) {
    console.log(
      `  Snapshot:       ${preview.snapshot.nodes} nodes, ${preview.snapshot.edges} edges`,
    );
    console.log(
      `  Evidence:       ${preview.snapshot.findings} finding nodes, ${preview.snapshot.evidence} evidence nodes, ${preview.snapshot.sourceArtifacts} sources`,
    );
    console.log(
      `  Capsule:        ${preview.capsule.routes} routes, ${preview.capsule.localRules} local rules, ${preview.capsule.styleBridge} style bridge mappings`,
    );
    const sourceArtifactIndex = preview.capsule.sourceArtifactsTruncated
      ? `${preview.capsule.sourceArtifactLimit}/${preview.capsule.sourceArtifacts} source handles`
      : `${preview.capsule.sourceArtifacts} source handles`;
    console.log(`  Source handles: ${sourceArtifactIndex}`);
    if (preview.diff) {
      const diffHints = [
        preview.diff.findingsAdded > 0 ? `${preview.diff.findingsAdded} finding added` : null,
        preview.diff.findingsResolved > 0
          ? `${preview.diff.findingsResolved} finding resolved`
          : null,
        preview.diff.evidenceAdded > 0 ? `${preview.diff.evidenceAdded} evidence added` : null,
      ].filter(Boolean);
      console.log(
        `  Diff:           ${preview.diff.ops} ops${
          diffHints.length > 0 ? ` (${diffHints.join(', ')})` : ''
        }`,
      );
    }
  }
  console.log(`  ${dim(preview.message)}`);
  if (preview.staleArtifacts.length > 0) {
    console.log(`  Stale artifacts:${' '} ${preview.staleArtifacts.slice(0, 3).join(', ')}`);
    if (preview.staleArtifacts.length > 3) {
      console.log(`                  ${dim(`...${preview.staleArtifacts.length - 3} more`)}`);
    }
  }
  if (preview.nextCommand) {
    console.log(`  Next:           ${cyan(preview.nextCommand)}`);
  }
  console.log('');
}

function printScanReport(report: ScanReport, projectArg?: string): void {
  console.log(heading('Decantr Scan'));
  console.log(dim('Read-only Brownfield reconnaissance. No files were written.'));
  console.log('');
  console.log(`${BOLD}Verdict${RESET}`);
  console.log(
    `  ${formatScanApplicability(report.applicability.status)}  ${report.applicability.label}`,
  );
  console.log(
    `  Confidence: ${cyan(`${report.confidence.score}/100`)} (${report.confidence.level})`,
  );
  for (const reason of report.applicability.reasons.slice(0, 3)) {
    console.log(`  ${dim('-')} ${reason}`);
  }
  console.log('');

  console.log(`${BOLD}Project${RESET}`);
  console.log(
    `  Framework:      ${cyan(report.project.framework)}${report.project.frameworkVersion ? ` ${report.project.frameworkVersion}` : ''}`,
  );
  console.log(`  Package manager:${' '} ${report.project.packageManager}`);
  console.log(`  Language:       ${report.project.primaryLanguage}`);
  console.log(`  TypeScript:     ${report.project.hasTypeScript ? 'yes' : 'no'}`);
  console.log(`  Decantr:        ${report.project.hasDecantr ? 'present' : 'not attached'}`);
  console.log('');

  printScanGraphPreview(report.graphPreview);

  console.log(`${BOLD}Routes And Styling${RESET}`);
  const routeSignalCount = report.routes.routeSignalCount ?? report.routes.count;
  const taskableRouteCount = report.routes.taskableRouteCount ?? report.routes.count;
  console.log(
    `  Routes:         ${taskableRouteCount} taskable / ${routeSignalCount} signal(s) (${report.routes.strategy}, ${report.routes.confidence})`,
  );
  for (const route of report.routes.items.slice(0, 8)) {
    console.log(`    ${cyan(route.path.padEnd(18))} ${dim(route.file)}`);
  }
  if (report.routes.items.length > 8) {
    console.log(`    ${dim(`...${report.routes.items.length - 8} more route(s)`)}`);
  }
  console.log(
    `  Components:     ${report.components.componentCount} discovered (${report.components.confidence} confidence)`,
  );
  if (report.components.limitations?.[0]) {
    console.log(`                  ${dim(report.components.limitations[0])}`);
  }
  console.log(
    `  Styling:        ${report.styling.approach}${report.styling.configFile ? ` (${report.styling.configFile})` : ''}`,
  );
  console.log(`  CSS variables:  ${report.styling.cssVariableCount}`);
  console.log(`  Dark mode:      ${report.styling.darkMode ? 'yes' : 'no'}`);
  console.log('');

  if (report.staticHosting.githubPagesLikely || report.pagesProbe) {
    console.log(`${BOLD}Published Surface${RESET}`);
    console.log(
      `  GitHub Pages:   ${report.staticHosting.githubPagesLikely ? 'likely' : 'not detected'}`,
    );
    if (report.source.publishedSiteUrl) {
      console.log(`  Site URL:       ${report.source.publishedSiteUrl}`);
    }
    if (report.pagesProbe?.checked) {
      console.log(
        `  HTTP probe:     ${report.pagesProbe.reachable ? success('reachable') : `${YELLOW}unreachable${RESET}`} ${report.pagesProbe.status ?? ''}`,
      );
      if (report.pagesProbe.title) console.log(`  Title:          ${report.pagesProbe.title}`);
    }
    for (const item of report.staticHosting.evidence.slice(0, 4)) {
      console.log(`  ${dim('-')} ${item}`);
    }
    console.log('');
  }

  console.log(`${BOLD}Findings${RESET}`);
  for (const finding of report.findings.slice(0, 8)) {
    console.log(`  [${scanSeverityColor(finding)}] ${finding.title}`);
    console.log(`      ${finding.message}`);
    if (finding.recommendation) console.log(`      ${dim(finding.recommendation)}`);
  }
  console.log('');

  console.log(`${BOLD}Next Commands${RESET}`);
  for (const command of report.recommendedCommands) {
    console.log(`  ${cyan(command)}`);
  }
  console.log('');
  console.log(dim(report.privacy.notes[0] ?? 'Scan completed without writing files.'));
  console.log(
    dim(
      'This scan was read-only: no Decantr files, dependencies, scripts, uploads, or reports were created.',
    ),
  );
  if (report.applicability.status !== 'not_applicable') {
    console.log(
      `When ready to attach Decantr, run ${cyan(withProject('decantr adopt --yes', projectArg))}.`,
    );
    console.log(
      `After adoption, inspect what Decantr found with ${cyan(studioCommandForProject(projectArg))}.`,
    );
  }
}

async function cmdScanWorkflow(args: string[]): Promise<void> {
  const { flags } = parseLooseArgs(args);
  if (!ensureAllowedFlags(flags, ['project', 'json'], 'scan')) return;
  const workspaceInfo = resolveWorkflowProject(flags, 'scan');
  if (!workspaceInfo) return;
  const jsonOutput = flagBoolean(flags, 'json');
  const projectArg = flagString(flags, 'project');
  const inputValue = projectArg ?? '.';
  const report = await scanProjectReadOnly(workspaceInfo.appRoot, {
    input: { kind: 'local', value: inputValue },
  });
  const graphPreview = buildScanGraphPreview(workspaceInfo, projectArg);
  const reportWithGraph: ScanReport = { ...report, graphPreview };
  if (jsonOutput) {
    console.log(JSON.stringify(reportWithGraph, null, 2));
    return;
  }
  printScanReport(reportWithGraph, projectArg);
}

async function scanRouteHint(projectRoot: string, projectArg?: string): Promise<string | null> {
  try {
    const report = await scanProjectReadOnly(projectRoot, {
      input: { kind: 'local', value: projectArg ?? '.' },
    });
    return routeHintFromScanReport(report);
  } catch {
    return null;
  }
}

async function cmdSetupWorkflow(args: string[]): Promise<void> {
  const { flags } = parseLooseArgs(args);
  const projectArg = flagString(flags, 'project');
  const workspaceInfo = resolveWorkspaceInfo(process.cwd(), projectArg);
  if (
    !projectArg &&
    workspaceInfo.workspaceRoot === workspaceInfo.cwd &&
    workspaceInfo.appCandidates.length > 0
  ) {
    printMonorepoSetupGuidance(workspaceInfo);
    return;
  }
  if (workspaceInfo.requiresProjectSelection) {
    printWorkspaceProjectSelection(workspaceInfo, 'setup');
    process.exitCode = 1;
    return;
  }

  const detected = detectProject(workspaceInfo.appRoot);
  const hasFootprint =
    detected.framework !== 'unknown' ||
    detected.packageManager !== 'unknown' ||
    detected.hasTypeScript ||
    detected.hasTailwind ||
    detected.existingRuleFiles.length > 0;

  console.log(heading('Decantr Setup'));
  console.log(`  Project: ${workspaceInfo.appRoot}`);
  console.log(`  Detected: ${formatDetection(detected)}`);
  console.log('');

  if (detected.existingEssence) {
    const hasLocalPatterns = existsSync(localPatternsPath(workspaceInfo.appRoot));
    const hasLocalRules = existsSync(localRulesPath(workspaceInfo.appRoot));
    const hasStyleBridge = existsSync(styleBridgePath(workspaceInfo.appRoot));
    const verifyCommand =
      hasLocalPatterns || hasLocalRules
        ? 'decantr verify --brownfield --local-patterns'
        : 'decantr verify --brownfield';
    console.log(`${BOLD}Recommended path:${RESET} maintain an attached Decantr project`);
    console.log(
      `  ${cyan(withProject('decantr doctor', projectArg))}                   Explain current state and next command`,
    );
    if (!hasLocalPatterns || !hasLocalRules || !hasStyleBridge) {
      const codifyCommand =
        hasLocalPatterns && hasLocalRules
          ? 'decantr codify --style-bridge'
          : 'decantr codify --from-audit --style-bridge';
      console.log(
        `  ${cyan(withProject(codifyCommand, projectArg))}     Propose missing local law/style bridge`,
      );
    }
    console.log(
      `  ${cyan(withProject('decantr task <route> "<change>"', projectArg))}  Prepare LLM context before edits`,
    );
    console.log(
      `  ${cyan(withProject(verifyCommand, projectArg))}     Run local health and drift checks`,
    );
    console.log(
      `  ${cyan(withProject('decantr ci init', projectArg))}              Wire the app into CI`,
    );
    return;
  }

  if (hasFootprint) {
    console.log(`${BOLD}Recommended path:${RESET} brownfield adoption`);
    console.log(
      `  ${cyan(withProject('decantr adopt --yes', projectArg))}                       Analyze, attach, and verify`,
    );
    console.log(
      `  ${cyan(withProject('decantr codify --from-audit --style-bridge', projectArg))}               Propose local UI law and style bridge`,
    );
    console.log('');
    console.log(`${BOLD}Optional visual evidence after the app is running:${RESET}`);
    console.log(
      `  ${cyan(withProject('decantr verify --base-url http://localhost:3000 --evidence', projectArg))}`,
    );
    return;
  }

  console.log(`${BOLD}Recommended path:${RESET} greenfield start`);
  console.log(`  ${cyan('decantr new my-app --blueprint=<slug>')}`);
  console.log(`  ${cyan('decantr init --workflow=greenfield --adoption=contract-only')}`);
}

async function cmdAdoptWorkflow(args: string[]): Promise<void> {
  const { flags } = parseLooseArgs(args);
  if (
    !ensureAllowedFlags(
      flags,
      [
        'project',
        'dry-run',
        'yes',
        'y',
        'base-url',
        'verify',
        'browser',
        'evidence',
        'baseline',
        'save-baseline',
        'packs',
        'skip-packs',
        'offline',
        'ci',
        'init-ci',
        'assistant-bridge',
        'replace-essence',
        'merge-proposal',
        'telemetry',
        'force-package',
        'allow-package',
        'force',
      ],
      'adopt',
    )
  ) {
    return;
  }
  const workspaceInfo = resolveWorkflowProject(flags, 'adopt', { requireAppCandidate: true });
  if (!workspaceInfo) return;

  const projectRoot = workspaceInfo.appRoot;
  const projectArg = flagString(flags, 'project');
  const dryRun = flagBoolean(flags, 'dry-run');
  const yes = flagBoolean(flags, 'yes') || flagBoolean(flags, 'y');
  const baseUrl = flagString(flags, 'base-url');
  const runVerify = flagBoolean(flags, 'verify', true);
  const runBrowser = flagBoolean(flags, 'browser') || Boolean(baseUrl);
  const evidence = flagBoolean(flags, 'evidence') || runBrowser;
  const saveBaseline = flagBoolean(flags, 'baseline', true) || flagBoolean(flags, 'save-baseline');
  const hydratePacks =
    flagBoolean(flags, 'packs', true) &&
    !flagBoolean(flags, 'skip-packs') &&
    !flagBoolean(flags, 'offline') &&
    process.env.DECANTR_OFFLINE !== 'true';
  const initCi = flagBoolean(flags, 'ci') || flagBoolean(flags, 'init-ci');
  const assistantBridge = flagString(flags, 'assistant-bridge');
  const hasEssence = existsSync(join(projectRoot, 'decantr.essence.json'));
  const proposalFlag = flagBoolean(flags, 'replace-essence')
    ? '--replace-essence'
    : flagBoolean(flags, 'merge-proposal') || hasEssence
      ? '--merge-proposal'
      : '--accept-proposal';

  const steps = [
    'analyze current app and write .decantr/brownfield intelligence',
    `init --existing ${proposalFlag} as contract-only Brownfield`,
  ];
  if (hydratePacks) {
    steps.push('hydrate hosted execution packs into the app context');
  }
  steps.push('write typed Contract graph baseline');
  if (runVerify) {
    steps.push(
      runBrowser
        ? 'verify with Project Health, browser evidence, visual manifest, and baseline'
        : 'verify with Project Health and baseline',
    );
  }
  if (initCi) {
    steps.push('install Decantr CI gate');
  }
  printWorkflowPlan('Decantr Adopt', steps);

  if (dryRun) {
    console.log(dim('Dry run only. No files were written.'));
    return;
  }

  if (!yes) {
    const ok = await confirm('Run this Brownfield adoption workflow?', false);
    if (!ok) {
      console.log(dim('Cancelled.'));
      return;
    }
  }

  await cmdAnalyze(projectRoot, workspaceInfo, { printNextStep: false });
  if (process.exitCode && process.exitCode !== 0) return;
  const initCommand = projectArg
    ? `decantr init --project ${projectArg} --existing ${proposalFlag}`
    : `decantr init --existing ${proposalFlag}`;
  console.log(dim(`Analysis artifacts written; continuing with ${initCommand}.`));

  await cmdInit({
    existing: true,
    yes: true,
    project: flagString(flags, 'project'),
    'accept-proposal': proposalFlag === '--accept-proposal',
    'merge-proposal': proposalFlag === '--merge-proposal',
    'replace-essence': proposalFlag === '--replace-essence',
    'assistant-bridge': assistantBridge,
    telemetry: flagBoolean(flags, 'telemetry'),
    internalSuppressNextSteps: true,
  });
  if (process.exitCode && process.exitCode !== 0) return;

  if (hydratePacks) {
    try {
      const { bundle, contextDir } = await compileHostedExecutionPackBundle(
        join(projectRoot, 'decantr.essence.json'),
      );
      const written = writeHostedExecutionPackContextArtifacts(
        contextDir,
        bundle as ExecutionPackBundle,
      );
      console.log(
        success(
          `Hydrated Decantr execution packs (${written.paths.length} files) into ${contextDir}.`,
        ),
      );
    } catch (e) {
      console.log(`${YELLOW}Pack hydration skipped:${RESET} ${(e as Error).message}`);
      console.log(
        dim(
          `Run ${compilePacksCommandForProject(projectArg)} after adoption if you want hosted page/review packs.`,
        ),
      );
    }
  } else if (flagBoolean(flags, 'offline') || process.env.DECANTR_OFFLINE === 'true') {
    console.log(dim('Skipping hosted pack hydration in offline mode.'));
  }

  await cmdGraph(projectRoot, { displayRoot: process.cwd() });
  if (process.exitCode && process.exitCode !== 0) return;

  if (runVerify) {
    const { cmdHealth } = await import('./commands/health.js');
    await cmdHealth(projectRoot, {
      browser: runBrowser,
      browserBaseUrl: baseUrl,
      evidence,
      output: evidence ? '.decantr/evidence/latest.json' : undefined,
      saveBaseline,
    });
  }

  if (initCi) {
    const ciArgs = ['ci', 'init'];
    if (flagString(flags, 'project'))
      ciArgs.push('--project', flagString(flags, 'project') as string);
    await cmdCi(ciArgs, process.cwd());
  }

  console.log('');
  console.log(`${BOLD}Brownfield operating loop:${RESET}`);
  console.log(
    `  ${cyan(withProject('decantr codify --from-audit --style-bridge', projectArg))}  Propose project-owned UI law and style bridge`,
  );
  console.log(
    `  ${cyan(withProject('decantr codify --accept', projectArg))}              Accept reviewed local patterns, rules, and bridge`,
  );
  console.log(
    `  ${cyan(withProject('decantr task <route> "<change>"', projectArg))}      Give your LLM route-specific context before edits`,
  );
  console.log(
    `  ${cyan(withProject('decantr verify --brownfield --local-patterns', projectArg))}  Check contract, health, and local law after edits`,
  );
  console.log(
    `  ${cyan(studioCommandForProject(projectArg))}                      Inspect routes, findings, and attention areas visually`,
  );
  console.log(
    `  ${cyan(withProject('decantr verify --since-baseline', projectArg))}      Compare future work against this baseline`,
  );
}

async function cmdVerifyWorkflow(args: string[]): Promise<void> {
  const { flags } = parseLooseArgs(args);
  const projectArg = flagString(flags, 'project');
  if (
    !ensureAllowedFlags(
      flags,
      [
        'project',
        'workspace',
        'changed',
        'since',
        'json',
        'markdown',
        'format',
        'output',
        'ci',
        'fail-on',
        'prompt',
        'brownfield',
        'local-patterns',
        'evidence',
        'browser',
        'require-browser',
        'base-url',
        'design-tokens',
        'save-baseline',
        'since-baseline',
        'baseline',
      ],
      'verify',
    )
  ) {
    return;
  }
  const workspaceMode = flagBoolean(flags, 'workspace');

  if (args[1] === 'init-ci') {
    await cmdCi(['ci', 'init', ...args.slice(2)], process.cwd());
    return;
  }

  if (workspaceMode) {
    const { cmdWorkspace } = await import('./commands/workspace.js');
    await cmdWorkspace(process.cwd(), ['workspace', 'health', ...withoutWorkflowOnlyFlags(args)]);
    return;
  }

  const workspaceInfo = resolveWorkflowProject(flags, 'verify');
  if (!workspaceInfo) return;

  const brownfield = flagBoolean(flags, 'brownfield');
  const localPatterns = flagBoolean(flags, 'local-patterns');
  const evidence = flagBoolean(flags, 'evidence');
  const baseUrl = flagString(flags, 'base-url');
  const failOn = flagString(flags, 'fail-on') ?? 'error';
  const healthArgs = ['health', ...withoutWorkflowOnlyFlags(args)];
  if (flagBoolean(flags, 'baseline') && !healthArgs.includes('--save-baseline')) {
    healthArgs.push('--save-baseline');
  }
  if (evidence && !flagString(flags, 'output')) {
    healthArgs.push('--output', '.decantr/evidence/latest.json');
  }
  if (baseUrl && !healthArgs.includes('--browser')) {
    healthArgs.push('--browser');
  }

  const quietOutput =
    flagBoolean(flags, 'json') || flagBoolean(flags, 'ci') || Boolean(flagString(flags, 'output'));
  if (!quietOutput) {
    console.log(heading('Decantr Verify'));
    console.log(
      dim(
        brownfield
          ? 'Running Brownfield guard validation before Project Health.'
          : 'Running Project Health as the canonical reliability gate.',
      ),
    );
    console.log('');
  }

  let guardExitCode: number | undefined;
  if (brownfield) {
    const { cmdHeal, collectCheckIssues } = await import('./commands/heal.js');
    if (quietOutput) {
      const result = collectCheckIssues(workspaceInfo.appRoot, { brownfield: true });
      guardExitCode = result.issues.some((issue) => issue.type === 'error') ? 1 : undefined;
    } else {
      await cmdHeal(workspaceInfo.appRoot, { brownfield: true });
      guardExitCode = process.exitCode;
      process.exitCode = undefined;
    }
  }

  const { cmdHealth, parseHealthArgs } = await import('./commands/health.js');
  await cmdHealth(workspaceInfo.appRoot, parseHealthArgs(healthArgs));

  if (localPatterns) {
    const validation = validateLocalLaw(workspaceInfo.appRoot);
    if (!validation.patternPackPresent) {
      if (!quietOutput) {
        console.log('');
        console.log(
          `${YELLOW}Local pattern pack missing.${RESET} Run ${cyan(withProject('decantr codify --from-audit', projectArg))}, review the proposal, then run ${cyan(withProject('decantr codify --accept', projectArg))}.`,
        );
      }
      process.exitCode = process.exitCode || 1;
    } else {
      const blockingFindings =
        failOn === 'none'
          ? []
          : validation.findings.filter((finding) =>
              failOn === 'warn'
                ? finding.severity === 'warn' || finding.severity === 'error'
                : finding.severity === 'error',
            );
      const blockingWarnings = failOn === 'warn' ? validation.warnings : [];
      if (!quietOutput) {
        console.log('');
        console.log(`${GREEN}Local pattern pack found:${RESET} ${validation.patternsPath}`);
        if (validation.ruleManifestPresent) {
          console.log(`${GREEN}Local rule manifest found:${RESET} ${validation.rulesPath}`);
          console.log(
            `${DIM}Enforcement: accepted .decantr/rules.json is the Decantr-scanned layer; --fail-on controls whether findings block.${RESET}`,
          );
        } else {
          console.log(
            `${YELLOW}Local rule manifest missing.${RESET} Run ${cyan('decantr codify --from-audit')} to propose .decantr/rules.json.`,
          );
        }
        for (const warning of validation.warnings.slice(0, 8)) {
          console.log(`${YELLOW}warn${RESET} ${warning}`);
        }
        if (validation.findings.length > 0) {
          console.log('');
          console.log(`${BOLD}Local law findings:${RESET}`);
          for (const finding of validation.findings.slice(0, 20)) {
            console.log(
              `  ${finding.severity.toUpperCase()} ${finding.ruleId} ${finding.file}:${finding.line}:${finding.column} ${finding.message}`,
            );
          }
          if (validation.findings.length > 20) {
            console.log(dim(`  ...${validation.findings.length - 20} more finding(s)`));
          }
        } else if (validation.ruleManifestPresent) {
          console.log(`${GREEN}Local rule checks passed.${RESET}`);
        }
      }
      if (blockingFindings.length > 0 || blockingWarnings.length > 0) {
        process.exitCode = process.exitCode || 1;
      }
    }
  }

  const styleBridge = createStyleBridgeTaskSummary(workspaceInfo.appRoot);
  if (!quietOutput && styleBridge.path) {
    console.log('');
    console.log(`${GREEN}Style bridge found:${RESET} ${styleBridge.path}`);
    console.log(
      `${DIM}${styleBridge.mappingCount} mapping(s), ${styleBridge.stylingApproach ?? 'unknown'} styling${styleBridge.themeModes.length > 0 ? `, themes: ${styleBridge.themeModes.join(', ')}` : ''}${RESET}`,
    );
    console.log(
      `${DIM}Enforcement: advisory style-intent mapping; pair with accepted local rules, lint, tests, or visual regression when it should block.${RESET}`,
    );
  }

  if (guardExitCode && guardExitCode !== 0 && (!process.exitCode || process.exitCode === 0)) {
    process.exitCode = guardExitCode;
  }
}

function readJsonIfPresent<T>(path: string): T | null {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function mentionsWord(text: string, term: string): boolean {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

function createTaskAuthoritySummary(input: {
  projectRoot: string;
  workflowMode: string | null;
  adoptionMode: string | null;
  hasLocalPatterns: boolean;
  hasLocalRules: boolean;
  hasPackManifest: boolean;
  taskSummary: string;
  hasStyleBridge: boolean;
}): {
  lane: string;
  sourceAuthority: string;
  styleAuthority: string;
  activeAuthorities: string[];
  runtimeBoundary: string;
  warnings: string[];
} {
  const detected = detectProject(input.projectRoot);
  const hasLocalLaw = input.hasLocalPatterns || input.hasLocalRules;
  const hasStyleBridge = input.hasStyleBridge || input.adoptionMode === 'style-bridge';
  let lane = 'Brownfield contract-only';
  let sourceAuthority = 'Existing app is authoritative; Decantr supplies contract context.';
  let styleAuthority = 'Use the existing styling system.';
  const activeAuthorities = ['existing source', 'Essence V4 contract'];

  if (input.workflowMode === 'hybrid-compose') {
    lane = 'Hybrid composition';
    sourceAuthority = 'Existing app plus selected Decantr/local law are authoritative.';
  } else if (input.workflowMode === 'brownfield-attach' && input.adoptionMode === 'decantr-css') {
    lane = 'Hybrid with Decantr CSS';
    sourceAuthority =
      'Existing app remains authoritative except where Decantr CSS is explicitly adopted.';
    styleAuthority = 'Decantr CSS runtime is active where adopted.';
    activeAuthorities.push('Decantr CSS runtime');
  } else if (input.workflowMode === 'brownfield-attach' && hasStyleBridge) {
    lane = 'Hybrid style bridge';
    sourceAuthority =
      'Existing app remains authoritative; Decantr intent maps through the style bridge.';
    styleAuthority = 'Use bridge tokens/classes as a mapping layer onto the app styling system.';
    activeAuthorities.push('accepted style bridge');
  } else if (input.workflowMode === 'brownfield-attach' && hasLocalLaw) {
    lane = 'Hybrid local law';
    sourceAuthority = 'Existing app plus accepted project-owned UI law are authoritative.';
    styleAuthority = 'Use project-owned components, tokens, classes, and accepted local rules.';
  } else if (input.workflowMode?.startsWith('greenfield')) {
    lane =
      input.workflowMode === 'greenfield-contract-only'
        ? 'Greenfield contract-only'
        : 'Greenfield scaffold';
    sourceAuthority = 'Essence V4 and generated context are authoritative.';
    styleAuthority =
      input.adoptionMode === 'contract-only'
        ? 'Use the project-chosen styling system.'
        : 'Use Decantr CSS where generated by the adapter.';
  }

  if (hasLocalLaw) activeAuthorities.push('accepted local patterns/rules');
  if (input.hasPackManifest) activeAuthorities.push('hosted execution packs as guidance');

  const framework = detected.framework ?? 'unknown';
  const runtimeBoundary = `Detected ${framework}; do not introduce another frontend runtime inside this route unless the task is explicitly a reviewed migration or isolated integration plan.`;
  const warnings: string[] = [];
  const task = input.taskSummary;
  const runtimeTerms = [
    'angular',
    'vue',
    'svelte',
    'solid',
    'nextjs',
    'next.js',
    'react',
    'bootstrap',
    'shadcn',
  ];
  const compatibleMentions = new Set<string>();
  if (framework === 'nextjs') compatibleMentions.add('react');
  if (framework === 'react') compatibleMentions.add('react');
  if (framework === 'vue' || framework === 'nuxt') compatibleMentions.add('vue');
  for (const term of runtimeTerms) {
    if (!mentionsWord(task, term)) continue;
    if (term === framework || compatibleMentions.has(term)) continue;
    if ((term === 'nextjs' || term === 'next.js') && framework === 'nextjs') continue;
    if (term === 'shadcn' || term === 'bootstrap') {
      warnings.push(
        `Requested ${term} should be treated as optional Hybrid guidance unless this project already owns that library or the task explicitly adopts it.`,
      );
      continue;
    }
    warnings.push(
      `Task mentions ${term}, but the detected runtime is ${framework}. Prefer a dry-run plan or local pattern mapping before adding cross-runtime code.`,
    );
  }
  if (
    input.adoptionMode !== 'decantr-css' &&
    (/@decantr\/css/i.test(task) || /\bdecantr css\b/i.test(task) || /\bd-[a-z0-9-]+/i.test(task))
  ) {
    warnings.push(
      'This project is not in decantr-css adoption mode. Do not add @decantr/css or d-* classes unless the user explicitly changes adoption mode.',
    );
  }

  return { lane, sourceAuthority, styleAuthority, activeAuthorities, runtimeBoundary, warnings };
}

function behaviorTaskKeywords(task: string): string[] {
  return [
    ...new Set(
      task
        .toLowerCase()
        .split(/[^a-z0-9_-]+/)
        .map((term) => term.trim())
        .filter((term) => term.length >= 3),
    ),
  ];
}

function rankBehaviorObligationsForTask(
  obligations: LocalBehaviorObligationSummary[],
  routePatterns: string[],
  taskSummary: string,
): Array<LocalBehaviorObligationSummary & { relevance: { score: number; reasons: string[] } }> {
  const routePatternSet = new Set(routePatterns.map((pattern) => pattern.toLowerCase()));
  const keywords = behaviorTaskKeywords(taskSummary);
  const ranked = obligations.map((entry) => {
    const haystack = [
      entry.patternId,
      entry.patternRole,
      entry.intent,
      ...entry.riskProfile,
      ...entry.componentPaths,
      ...entry.obligations.flatMap((obligation) => [obligation.id, obligation.label]),
    ]
      .filter((value): value is string => typeof value === 'string')
      .join(' ')
      .toLowerCase();
    const reasons: string[] = [];
    let score = 0;
    if (routePatternSet.has(entry.patternId.toLowerCase())) {
      score += 5;
      reasons.push('route_pattern');
    }
    for (const keyword of keywords) {
      if (!haystack.includes(keyword)) continue;
      score += 2;
      reasons.push(`task:${keyword}`);
    }
    if (/dialog|modal|confirm|delete|destructive|remove|account/.test(taskSummary)) {
      if (/dialog|modal|confirm|destructive/.test(haystack)) {
        score += 3;
        reasons.push('interaction_intent');
      }
    }
    if (/form|input|field|label|submit|validation/.test(taskSummary)) {
      if (/form|input|label|submit|validation/.test(haystack)) {
        score += 3;
        reasons.push('form_intent');
      }
    }
    return {
      ...entry,
      relevance: {
        score,
        reasons: reasons.length > 0 ? [...new Set(reasons)] : ['accepted_local_law'],
      },
    };
  });
  return ranked.sort(
    (a, b) => b.relevance.score - a.relevance.score || a.patternId.localeCompare(b.patternId),
  );
}

async function cmdTaskWorkflow(args: string[]): Promise<void> {
  const { flags, positional } = parseLooseArgs(args);
  const workspaceInfo = resolveWorkflowProject(flags, 'task');
  if (!workspaceInfo) return;
  const projectArg = flagString(flags, 'project');

  const routeInput = positional[0];
  if (!routeInput) {
    console.error(
      error(
        'Usage: decantr task <route> ["task summary"] [--project <path>] [--since origin/main] [--json]',
      ),
    );
    process.exitCode = 1;
    return;
  }

  const route = routeInput.startsWith('/') ? routeInput : `/${routeInput}`;
  const taskSummary = positional.slice(1).join(' ').trim();
  const essencePath = join(workspaceInfo.appRoot, 'decantr.essence.json');
  const essence = readJsonIfPresent<EssenceFile>(essencePath);
  if (!essence) {
    console.error(
      error('No decantr.essence.json found. Run `decantr adopt` or `decantr init` first.'),
    );
    process.exitCode = 1;
    return;
  }
  if (!isV4(essence)) {
    console.error(error('Task context requires Essence v4. Run `decantr migrate --to v4` first.'));
    process.exitCode = 1;
    return;
  }

  const target = essence.blueprint.routes?.[route];
  if (!target) {
    const knownRoutes = Object.keys(essence.blueprint.routes ?? {}).sort();
    console.error(error(`Route not found in Decantr contract: ${route}`));
    console.error(dim(`Known routes: ${knownRoutes.join(', ') || 'none'}`));
    process.exitCode = 1;
    return;
  }

  const section = essence.blueprint.sections.find((entry) => entry.id === target.section);
  const page = section?.pages.find((entry) => entry.id === target.page);
  const contextDir = join(workspaceInfo.appRoot, '.decantr', 'context');
  const manifest = readJsonIfPresent<{
    scaffold?: { markdown?: string } | null;
    pages?: Array<{ id: string; markdown: string; json: string; sectionId: string | null }>;
    sections?: Array<{ id: string; markdown: string; json: string }>;
  }>(join(contextDir, 'pack-manifest.json'));
  const projectJson = readJsonIfPresent<{
    initialized?: { workflowMode?: string; adoptionMode?: string };
  }>(join(workspaceInfo.appRoot, '.decantr', 'project.json'));
  const pagePack = manifest?.pages?.find((entry) => entry.id === target.page);
  const sectionPack = manifest?.sections?.find((entry) => entry.id === target.section);
  const visualManifest = readJsonIfPresent<{
    routes?: Array<{ route: string; screenshot?: string | null }>;
  }>(join(workspaceInfo.appRoot, '.decantr', 'evidence', 'visual-manifest.json'));
  const screenshot = visualManifest?.routes?.find((entry) => entry.route === route)?.screenshot;
  const localPatternPackPath = localPatternsPath(workspaceInfo.appRoot);
  const localRuleManifestPath = localRulesPath(workspaceInfo.appRoot);
  const acceptedStyleBridgePath = styleBridgePath(workspaceInfo.appRoot);
  const graphDir = join(workspaceInfo.appRoot, '.decantr', 'graph');
  const contractCapsulePath = join(graphDir, 'contract-capsule.json');
  const graphSnapshotPath = join(graphDir, 'graph.snapshot.json');
  const contractCapsule = readJsonIfPresent<{
    snapshot_id?: string;
    cache_key?: string;
    contract_hash?: string;
    contract_cache_key?: string;
    summary?: {
      routes?: number;
      local_rules?: number;
      style_bridge?: number;
      source_artifacts?: number;
      open_findings?: number;
    };
  }>(contractCapsulePath);
  const graphSnapshot = readJsonIfPresent<
    {
      id?: string;
      source_hash?: string;
      summary?: { nodes?: number; edges?: number; findings?: number; evidence?: number };
    } & GraphSnapshot
  >(graphSnapshotPath);
  const routeGraphContext = buildGraphRouteContext(graphSnapshot, route, { task: taskSummary });
  const routePatterns = page?.layout?.map(extractPatternName) ?? [];
  const localLaw = createLocalLawTaskSummary(workspaceInfo.appRoot);
  const rankedBehaviorObligations = rankBehaviorObligationsForTask(
    localLaw.behaviorObligations,
    routePatterns,
    taskSummary,
  );
  const styleBridge = createStyleBridgeTaskSummary(workspaceInfo.appRoot);
  const displayedStyleBridge = {
    ...styleBridge,
    path: styleBridge.path ? displayProjectPath(workspaceInfo, styleBridge.path) : null,
  };
  const displayedLocalLaw = {
    ...localLaw,
    patternsPath: localLaw.patternsPath
      ? displayProjectPath(workspaceInfo, localLaw.patternsPath)
      : null,
    rulesPath: localLaw.rulesPath ? displayProjectPath(workspaceInfo, localLaw.rulesPath) : null,
    behaviorObligations: rankedBehaviorObligations,
  };
  const changedSince = flagString(flags, 'since');
  const currentChangedFiles = collectChangedFiles(workspaceInfo.appRoot, changedSince);
  const changedRoutes = routeImpacts(workspaceInfo.appRoot, currentChangedFiles);
  const changedFileSourceNodes = graphSnapshot
    ? currentChangedFiles.map((file) => ({
        file,
        nodeId: graphSourceNodeIdForTaskFile(workspaceInfo.appRoot, graphSnapshot, file),
      }))
    : [];
  const changedFileSourceNodeIds = [
    ...new Set(
      changedFileSourceNodes
        .map((entry) => entry.nodeId)
        .filter((nodeId): nodeId is string => Boolean(nodeId)),
    ),
  ];
  const changedFileMissingFiles = graphSnapshot
    ? changedFileSourceNodes.filter((entry) => !entry.nodeId).map((entry) => entry.file)
    : currentChangedFiles;
  const changedFileGraphContext =
    graphSnapshot && changedFileSourceNodeIds.length > 0
      ? buildGraphImpactContext(graphSnapshot, changedFileSourceNodeIds, {
          task: taskSummary,
          limit: 120,
        })
      : null;
  const authority = createTaskAuthoritySummary({
    projectRoot: workspaceInfo.appRoot,
    workflowMode: projectJson?.initialized?.workflowMode ?? null,
    adoptionMode: projectJson?.initialized?.adoptionMode ?? null,
    hasLocalPatterns: existsSync(localPatternPackPath),
    hasLocalRules: existsSync(localRuleManifestPath),
    hasPackManifest: Boolean(manifest),
    taskSummary,
    hasStyleBridge: existsSync(acceptedStyleBridgePath),
  });
  const readTargets = [
    pagePack
      ? displayProjectPath(workspaceInfo, join('.decantr/context', pagePack.markdown))
      : null,
    sectionPack
      ? displayProjectPath(workspaceInfo, join('.decantr/context', sectionPack.markdown))
      : null,
    manifest?.scaffold?.markdown
      ? displayProjectPath(workspaceInfo, join('.decantr/context', manifest.scaffold.markdown))
      : null,
    displayProjectPath(workspaceInfo, '.decantr/context/scaffold.md'),
    displayProjectPath(workspaceInfo, 'DECANTR.md'),
    existsSync(localPatternPackPath)
      ? displayProjectPath(workspaceInfo, '.decantr/local-patterns.json')
      : null,
    existsSync(localRuleManifestPath)
      ? displayProjectPath(workspaceInfo, '.decantr/rules.json')
      : null,
    existsSync(acceptedStyleBridgePath)
      ? displayProjectPath(workspaceInfo, '.decantr/style-bridge.json')
      : null,
    contractCapsule
      ? displayProjectPath(workspaceInfo, '.decantr/graph/contract-capsule.json')
      : null,
    routeGraphContext && !contractCapsule
      ? displayProjectPath(workspaceInfo, '.decantr/graph/graph.snapshot.json')
      : null,
  ].filter((value): value is string => Boolean(value));
  const taskLoopState: LoopReadiness['state'] =
    readTargets.length === 0
      ? 'blocked_missing_context'
      : !routeGraphContext
        ? 'blocked_missing_graph'
        : 'ready_to_edit';
  const taskLoop: LoopReadiness = {
    $schema: LOOP_READINESS_V2_SCHEMA_URL,
    schemaVersion: 2,
    state: taskLoopState,
    status: taskLoopState === 'ready_to_edit' ? 'healthy' : 'blocked',
    verdict:
      taskLoopState === 'ready_to_edit'
        ? 'Task context is ready for an agent edit.'
        : 'Task context is missing required context or graph evidence.',
    summary: `${route} task context with ${readTargets.length} read target(s), ${routeGraphContext ? routeGraphContext.summary.nodes : 0} graph node(s), and ${changedRoutes.length} changed-route hint(s).`,
    authority: {
      activeLane:
        projectJson?.initialized?.workflowMode === 'brownfield-attach'
          ? 'production-source'
          : 'essence-contract',
      summary: `${authority.lane}: ${authority.sourceAuthority}`,
      stopRule:
        'If runtime source and Decantr context disagree, stop and report drift instead of guessing.',
    },
    evidenceTier: {
      schemaVersion: 2,
      stage: routeGraphContext ? 'graph' : 'static',
      status: taskLoopState === 'ready_to_edit' ? 'healthy' : 'incomplete',
      capabilities: routeGraphContext
        ? ['static-audit', 'project-health', 'typed-graph']
        : ['static-audit', 'project-health'],
      coverage: {
        declaredRoutes: 1,
        runtimeRoutesChecked: 0,
        findingsAnchored: routeGraphContext?.summary.openFindings ?? 0,
        findingsWithRepairPlan: 0,
        runtimeProbeCount: 0,
        visualArtifactCount: screenshot ? 1 : 0,
      },
      confidence: {
        level: routeGraphContext ? 'moderate' : 'low',
        score: routeGraphContext ? 0.64 : 0.32,
        reasons: [
          routeGraphContext ? 'route graph context is present' : 'route graph context is missing',
          screenshot
            ? 'visual evidence reference is available'
            : 'no visual evidence reference was found',
        ],
      },
    },
    blockingReasons:
      taskLoopState === 'ready_to_edit'
        ? []
        : [
            taskLoopState === 'blocked_missing_graph'
              ? 'Route graph context is missing or stale.'
              : 'Route context read targets are missing.',
          ],
    nextActions:
      taskLoopState === 'ready_to_edit'
        ? ['Edit only after reading the listed context, then run the verify command.']
        : [
            taskLoopState === 'blocked_missing_graph'
              ? 'Run `decantr graph`, then rerun `decantr task`.'
              : 'Run `decantr refresh`, then rerun `decantr task`.',
          ],
    maker: {
      title: 'Maker instructions',
      instructions: [
        'Read the listed route, section, scaffold, DECANTR, local-law, and graph targets before editing.',
        'Preserve the active authority lane and existing production behavior outside this task.',
        'Stop and report drift if source, graph, and contract context disagree.',
      ],
    },
    checker: {
      title: 'Checker instructions',
      instructions: [
        'Rerun the verify command after edits.',
        'Use changed-file graph impact and route findings to decide whether more routes need review.',
        'Do not treat advisory critique as blocking without T1/T2 evidence.',
      ],
    },
    readTargets,
    graphImpact: {
      status: routeGraphContext ? 'ready' : graphSnapshot ? 'stale' : 'missing',
      snapshotId: routeGraphContext?.snapshotId ?? graphSnapshot?.id ?? null,
      sourceHash: routeGraphContext?.sourceHash ?? graphSnapshot?.source_hash ?? null,
      sourceArtifactCount: routeGraphContext?.summary.sourceArtifacts ?? 0,
      staleArtifacts: [],
    },
    stopConditions: [
      'Runtime source and Decantr context disagree.',
      'The route graph cannot resolve a source file affected by the edit.',
      'A fix requires contract/source/local-law mutation outside the explicit workflow.',
    ],
    verifyCommand: withProject('decantr verify --brownfield --local-patterns', projectArg),
  };

  const context = {
    route,
    task: taskSummary || null,
    section: target.section,
    page: target.page,
    shell: page?.shell ?? section?.shell ?? null,
    patterns: routePatterns,
    read: readTargets,
    graph:
      contractCapsule || graphSnapshot
        ? {
            capsule: contractCapsule
              ? {
                  path: displayProjectPath(workspaceInfo, '.decantr/graph/contract-capsule.json'),
                  snapshotId: contractCapsule.snapshot_id ?? null,
                  cacheKey: contractCapsule.cache_key ?? null,
                  contractHash: contractCapsule.contract_hash ?? null,
                  contractCacheKey: contractCapsule.contract_cache_key ?? null,
                  summary: contractCapsule.summary ?? null,
                }
              : null,
            snapshot: graphSnapshot
              ? {
                  path: displayProjectPath(workspaceInfo, '.decantr/graph/graph.snapshot.json'),
                  id: graphSnapshot.id ?? null,
                  sourceHash: graphSnapshot.source_hash ?? null,
                  summary: graphSnapshot.summary ?? null,
                }
              : null,
            routeContext: routeGraphContext
              ? {
                  path: displayProjectPath(workspaceInfo, '.decantr/graph/graph.snapshot.json'),
                  ...routeGraphContext,
                }
              : null,
            changedFileContext:
              currentChangedFiles.length > 0
                ? {
                    path: displayProjectPath(workspaceInfo, '.decantr/graph/graph.snapshot.json'),
                    changedFiles: currentChangedFiles.slice(0, 40),
                    resolvedNodeIds: changedFileSourceNodeIds,
                    missingFiles: changedFileMissingFiles.slice(0, 40),
                    impact: changedFileGraphContext
                      ? {
                          snapshotId: changedFileGraphContext.snapshotId,
                          sourceHash: changedFileGraphContext.sourceHash,
                          ranking: changedFileGraphContext.ranking,
                          summary: changedFileGraphContext.summary,
                          ids: changedFileGraphContext.ids,
                          ranked: changedFileGraphContext.ranked.slice(0, 24),
                          nodes: changedFileGraphContext.nodes,
                          edges: changedFileGraphContext.edges,
                        }
                      : null,
                  }
                : null,
          }
        : null,
    screenshot: screenshot?.startsWith('.decantr/')
      ? displayProjectPath(workspaceInfo, screenshot)
      : (screenshot ?? null),
    authority,
    localLaw: displayedLocalLaw,
    styleBridge: displayedStyleBridge,
    changedFiles: currentChangedFiles,
    changedRoutes,
    loop: taskLoop,
    verifyCommand: withProject('decantr verify --brownfield --local-patterns', projectArg),
  };

  if (flagBoolean(flags, 'json')) {
    console.log(JSON.stringify(context, null, 2));
    return;
  }

  console.log(heading('Decantr Task Context'));
  console.log(`  Route: ${cyan(context.route)}`);
  console.log(`  Section/page: ${context.section}/${context.page}`);
  if (context.shell) console.log(`  Shell: ${context.shell}`);
  if (context.patterns.length > 0) console.log(`  Patterns: ${context.patterns.join(', ')}`);
  if (taskSummary) console.log(`  Task: ${taskSummary}`);
  console.log('');
  console.log(`${BOLD}Read before editing:${RESET}`);
  for (const path of context.read) {
    console.log(`  ${cyan(path as string)}`);
  }
  if (context.screenshot) {
    console.log('');
    console.log(`${BOLD}Visual evidence:${RESET}`);
    console.log(`  ${cyan(context.screenshot)}`);
  }
  if (context.graph?.capsule || context.graph?.snapshot) {
    console.log('');
    console.log(`${BOLD}Typed contract graph:${RESET}`);
    if (context.graph.capsule) {
      console.log(`  Capsule: ${cyan(context.graph.capsule.path)}`);
      if (context.graph.capsule.cacheKey) {
        console.log(`  Cache key: ${context.graph.capsule.cacheKey}`);
      }
      if (
        context.graph.capsule.contractCacheKey &&
        context.graph.capsule.contractCacheKey !== context.graph.capsule.cacheKey
      ) {
        console.log(`  Contract cache key: ${context.graph.capsule.contractCacheKey}`);
      }
    }
    if (context.graph.snapshot) {
      const summary = context.graph.snapshot.summary;
      const counts =
        summary && typeof summary.nodes === 'number' && typeof summary.edges === 'number'
          ? ` (${summary.nodes} nodes, ${summary.edges} edges)`
          : '';
      console.log(`  Snapshot: ${cyan(context.graph.snapshot.path)}${counts}`);
    }
    if (context.graph.routeContext) {
      const routeSummary = context.graph.routeContext.summary;
      const routeFindings = context.graph.routeContext.nodes
        .filter((node) => node.type === 'Finding')
        .map((node) => graphPayloadString(node.payload, 'code') ?? node.id)
        .slice(0, 4);
      const routeSources = context.graph.routeContext.nodes
        .filter((node) => node.type === 'SourceArtifact')
        .map((node) => graphPayloadString(node.payload, 'path') ?? node.id.replace(/^src:/, ''))
        .slice(0, 4);
      const routeHints = [
        context.graph.routeContext.ids.patterns.length > 0
          ? `patterns ${context.graph.routeContext.ids.patterns.join(', ')}`
          : null,
        routeSummary.openFindings > 0 ? `${routeSummary.openFindings} finding(s)` : null,
        routeSummary.evidence > 0 ? `${routeSummary.evidence} evidence node(s)` : null,
        routeSummary.sourceArtifacts > 0
          ? `${routeSummary.sourceArtifacts} source artifact(s)`
          : null,
      ].filter(Boolean);
      console.log(
        `  Route subgraph: ${routeSummary.nodes} nodes, ${routeSummary.edges} edges${
          routeHints.length > 0 ? `; ${routeHints.join('; ')}` : ''
        }`,
      );
      if (routeFindings.length > 0) {
        console.log(`  Route findings: ${routeFindings.join(', ')}`);
      }
      if (routeSources.length > 0) {
        console.log(`  Route sources: ${routeSources.join(', ')}`);
      }
    }
    if (context.graph.changedFileContext?.impact) {
      const impact = context.graph.changedFileContext.impact;
      const impactHints = [
        impact.ids.routes.length > 0 ? `routes ${impact.ids.routes.join(', ')}` : null,
        impact.summary.pages > 0 ? `${impact.summary.pages} page(s)` : null,
        impact.summary.openFindings > 0 ? `${impact.summary.openFindings} finding(s)` : null,
      ].filter(Boolean);
      console.log(
        `  Changed-file impact: ${impact.summary.nodes} nodes, ${impact.summary.edges} edges${
          impactHints.length > 0 ? `; ${impactHints.join('; ')}` : ''
        }`,
      );
    }
  }
  console.log('');
  console.log(`${BOLD}Authority for this task:${RESET}`);
  console.log(`  Lane: ${context.authority.lane}`);
  console.log(`  Source: ${context.authority.sourceAuthority}`);
  console.log(`  Style: ${context.authority.styleAuthority}`);
  console.log(`  Active: ${context.authority.activeAuthorities.join(', ')}`);
  console.log(`  Runtime: ${context.authority.runtimeBoundary}`);
  for (const warning of context.authority.warnings) {
    console.log(`  ${YELLOW}Boundary:${RESET} ${warning}`);
  }
  if (context.localLaw.patternCount > 0 || context.localLaw.ruleCount > 0) {
    console.log('');
    console.log(`${BOLD}Project-owned local law:${RESET}`);
    if (context.localLaw.patternsPath) {
      console.log(
        `  Patterns: ${cyan(context.localLaw.patternsPath)} (${context.localLaw.patternCount})`,
      );
    }
    if (context.localLaw.rulesPath) {
      console.log(`  Rules: ${cyan(context.localLaw.rulesPath)} (${context.localLaw.ruleCount})`);
      console.log('  Enforcement: accepted local rules are the Decantr-scanned layer.');
    }
    for (const pattern of context.localLaw.patterns.slice(0, 4)) {
      const pathHint =
        pattern.componentPaths.length > 0
          ? ` — ${pattern.componentPaths.slice(0, 2).join(', ')}`
          : '';
      const authorityHint = [
        pattern.role ?? 'local pattern',
        pattern.confidenceTier ? `confidence ${pattern.confidenceTier}` : null,
        pattern.enforcementLevel ? `${pattern.enforcementLevel}` : null,
        pattern.hostedPatternRefs.length > 0
          ? `maps ${pattern.hostedPatternRefs.slice(0, 2).join(', ')}`
          : null,
      ]
        .filter(Boolean)
        .join(' | ');
      console.log(`  ${pattern.id}: ${authorityHint}${pathHint}`);
    }
    if (context.localLaw.behaviorObligations.length > 0) {
      console.log('');
      console.log(`${BOLD}Behavior obligations:${RESET}`);
      for (const behavior of context.localLaw.behaviorObligations.slice(0, 3)) {
        const obligations = behavior.obligations
          .slice(0, 3)
          .map((obligation) => obligation.label)
          .join('; ');
        const reasons = behavior.relevance.reasons.slice(0, 3).join(', ');
        console.log(
          `  ${behavior.patternId}: ${behavior.intent ?? behavior.patternRole ?? 'interaction law'} (${reasons})`,
        );
        console.log(`    ${obligations}`);
      }
      if (context.localLaw.behaviorObligations.length > 3) {
        console.log(
          dim(`  ...${context.localLaw.behaviorObligations.length - 3} more behavior pattern(s)`),
        );
      }
    }
  } else {
    console.log('');
    console.log(`${BOLD}Project-owned local law:${RESET}`);
    console.log(
      `  ${YELLOW}Not codified yet.${RESET} Run ${cyan(withProject('decantr codify --from-audit', projectArg))} after adoption.`,
    );
  }
  if (context.styleBridge.path) {
    console.log('');
    console.log(`${BOLD}Project-owned style bridge:${RESET}`);
    console.log(
      `  Bridge: ${cyan(context.styleBridge.path)} (${context.styleBridge.mappingCount} mappings, ${context.styleBridge.stylingApproach ?? 'unknown'} styling)`,
    );
    console.log(
      '  Enforcement: advisory mapping layer; accepted local rules or project lint/tests do the blocking.',
    );
    if (context.styleBridge.themeModes.length > 0) {
      console.log(`  Theme modes: ${context.styleBridge.themeModes.join(', ')}`);
    }
    for (const mapping of context.styleBridge.mappings.slice(0, 4)) {
      const hints = [...mapping.tokenHints, ...mapping.classHints].slice(0, 4).join(', ');
      console.log(`  ${mapping.id}: ${mapping.label}${hints ? ` — ${hints}` : ''}`);
    }
  }
  if (context.changedFiles.length > 0) {
    console.log('');
    console.log(`${BOLD}Changed-file context:${RESET}`);
    for (const file of context.changedFiles.slice(0, 8)) {
      console.log(`  ${file}`);
    }
    if (context.changedFiles.length > 8) {
      console.log(dim(`  ...${context.changedFiles.length - 8} more changed file(s)`));
    }
    if (context.changedRoutes.length > 0) {
      console.log(`  Impacted routes: ${context.changedRoutes.join(', ')}`);
    }
  }
  console.log('');
  console.log(`${BOLD}Control loop:${RESET}`);
  console.log(
    `  State: ${context.loop.state} | evidence ${context.loop.evidenceTier.confidence.level}`,
  );
  console.log(`  Next: ${context.loop.nextActions[0]}`);
  console.log(`  Stop: ${context.loop.stopConditions[0]}`);
  console.log('');
  console.log(`${BOLD}LLM instruction:${RESET}`);
  console.log(
    '  Preserve the active authority above. Use the route pack, section context, typed route graph, local laws, changed-file impact, and visual evidence as the task contract before changing code.',
  );
  console.log(`  After editing, run ${cyan(context.verifyCommand)}.`);
}

async function cmdCodifyWorkflow(args: string[]): Promise<void> {
  const { flags } = parseLooseArgs(args);
  const projectArg = flagString(flags, 'project');
  if (
    !ensureAllowedFlags(
      flags,
      [
        'project',
        'from-audit',
        'discover-local-patterns',
        'codify-local-patterns',
        'style-bridge',
        'map-pattern',
        'hosted-pattern',
        'accept',
      ],
      'codify',
    )
  ) {
    return;
  }
  const workspaceInfo = resolveWorkflowProject(flags, 'codify');
  if (!workspaceInfo) return;

  if (flagBoolean(flags, 'accept')) {
    if (
      !existsSync(localPatternsProposalPath(workspaceInfo.appRoot)) &&
      !existsSync(localRulesProposalPath(workspaceInfo.appRoot)) &&
      !existsSync(styleBridgeProposalPath(workspaceInfo.appRoot))
    ) {
      console.error(
        error(
          'No codify proposal found. Run `decantr codify --from-audit`, `decantr codify --style-bridge`, or `decantr codify` first.',
        ),
      );
      process.exitCode = 1;
      return;
    }
    const result = acceptBrownfieldLocalLaw(workspaceInfo.appRoot);
    const bridgeAcceptedPath = acceptStyleBridge(workspaceInfo.appRoot);
    if (result.patternAcceptedPath) {
      console.log(success(`Accepted local pattern pack: ${result.patternAcceptedPath}`));
    }
    if (result.rulesAcceptedPath) {
      console.log(success(`Accepted local rule manifest: ${result.rulesAcceptedPath}`));
    }
    if (bridgeAcceptedPath) {
      console.log(success(`Accepted style bridge: ${bridgeAcceptedPath}`));
    }
    console.log(
      dim(
        bridgeAcceptedPath
          ? 'Hybrid style bridge is now active: Decantr will map design intent through accepted project tokens/classes in task, doctor, suggest, and CI flows.'
          : 'Hybrid local law is now active: Decantr will treat accepted local patterns and rules as project-owned authority in task and verify flows.',
      ),
    );
    console.log(
      dim(
        `Run \`${withProject('decantr verify --brownfield --local-patterns', projectArg)}\` after project edits.`,
      ),
    );
    return;
  }

  const detected = detectProject(workspaceInfo.appRoot);
  const essence = readJsonIfPresent<EssenceFile>(
    join(workspaceInfo.appRoot, 'decantr.essence.json'),
  );
  const fromAudit =
    flagBoolean(flags, 'from-audit') ||
    flagBoolean(flags, 'discover-local-patterns') ||
    flagBoolean(flags, 'codify-local-patterns');
  const wantsStyleBridge = flagBoolean(flags, 'style-bridge');
  const mapPatternSlug = flagString(flags, 'map-pattern') ?? flagString(flags, 'hosted-pattern');
  if (mapPatternSlug) {
    const registryClient = new RegistryClient({
      cacheDir: join(workspaceInfo.appRoot, '.decantr', 'cache'),
    });
    const candidates = await loadPatternDiscoveryCandidates(registryClient);
    const candidate = findPatternCandidateBySlug(candidates, mapPatternSlug);
    if (!candidate) {
      const suggestions = rankPatternCandidates({ query: mapPatternSlug, limit: 5 }, candidates);
      console.error(error(`Could not find pattern "${mapPatternSlug}" to map into local law.`));
      if (suggestions.length > 0) {
        console.error(dim('Closest registry patterns:'));
        for (const suggestion of suggestions) {
          const slug = suggestion.candidate.slug || suggestion.candidate.id;
          console.error(dim(`  ${slug} - ${suggestion.candidate.name ?? slug}`));
        }
      }
      process.exitCode = 1;
      return;
    }
    const result = writeHostedPatternMappingProposal({
      projectRoot: workspaceInfo.appRoot,
      hostedPattern: hostedPatternRefFromCandidate(candidate),
    });
    const slug = candidate.slug || candidate.id;
    console.log(
      success(
        `${result.replacedExisting ? 'Updated' : 'Wrote'} hosted pattern mapping proposal: ${result.patternPath}`,
      ),
    );
    console.log(
      dim(
        `Mapped registry pattern "${slug}" into local pattern "${result.localPatternId}" as advisory Hybrid law. No source files were changed.`,
      ),
    );
    console.log(
      dim(
        `Fill in project-owned component paths, token/class recipes, variants, and exceptions, then run \`${withProject('decantr codify --accept', projectArg)}\`.`,
      ),
    );
    return;
  }
  const wantsLocalLaw = !wantsStyleBridge || fromAudit;

  let localResult: { patternPath: string; rulesPath: string } | null = null;
  if (wantsLocalLaw) {
    const proposal = createBrownfieldCodifyProposal({
      projectRoot: workspaceInfo.appRoot,
      detected,
      essence,
      fromAudit,
    });
    localResult = writeBrownfieldCodifyProposal(workspaceInfo.appRoot, proposal);
  }

  let styleBridgeResult: string | null = null;
  if (wantsStyleBridge) {
    const styling = scanStyling(workspaceInfo.appRoot);
    styleBridgeResult = writeStyleBridgeProposal(
      workspaceInfo.appRoot,
      createStyleBridgeProposal({
        projectRoot: workspaceInfo.appRoot,
        detected,
        essence,
        styling,
      }),
    );
  }

  if (localResult) {
    console.log(success(`Wrote local pattern proposal: ${localResult.patternPath}`));
    console.log(success(`Wrote local rule proposal: ${localResult.rulesPath}`));
  }
  if (styleBridgeResult) {
    console.log(success(`Wrote style bridge proposal: ${styleBridgeResult}`));
  }
  if (fromAudit && localResult) {
    console.log(
      dim(
        'Proposal includes source-derived component candidates, starter mechanical rules, and Hybrid authority guidance.',
      ),
    );
  }
  console.log(
    dim(
      `Review the proposal files, add real component paths/token/class recipes, map hosted pattern ideas into project-owned law, then run \`${withProject('decantr codify --accept', projectArg)}\`.`,
    ),
  );
}

async function cmdContentWorkflow(args: string[]): Promise<void> {
  const subcommand = args[1] ?? 'check';
  if (subcommand === 'check' || subcommand === 'health') {
    const { cmdContentHealth, parseContentHealthArgs } = await import(
      './commands/content-health.js'
    );
    await cmdContentHealth(
      process.cwd(),
      parseContentHealthArgs(['content-health', ...args.slice(2)]),
    );
    return;
  }
  if (subcommand === 'create') {
    const { flags } = parseLooseArgs(args);
    if (!ensureAllowedFlags(flags, [], 'content create')) return;
    const type = args[2];
    const name = args[3];
    if (!type || !name) {
      console.error(error('Usage: decantr content create <type> <name>'));
      process.exitCode = 1;
      return;
    }
    cmdCreate(type, name);
    return;
  }
  if (subcommand === 'publish') {
    const { flags } = parseLooseArgs(args);
    if (!ensureAllowedFlags(flags, [], 'content publish')) return;
    const type = args[2];
    const name = args[3];
    if (!type || !name) {
      console.error(error('Usage: decantr content publish <type> <name>'));
      process.exitCode = 1;
      return;
    }
    await cmdPublish(type, name);
    return;
  }
  console.error(error('Usage: decantr content <check|create|publish>'));
  process.exitCode = 1;
}

// ── Help ──

function cmdHelp() {
  console.log(`
${BOLD}decantr${RESET} — AI Frontend Governance for codebases touched by AI agents

${BOLD}Usage:${RESET}
  decantr setup [--project <path>]
  decantr scan [--project <path>] [--json]
  decantr new <name> [--blueprint=X] [--archetype=X] [--theme=X] [--workflow=greenfield] [--adoption=decantr-css] [--telemetry]
  decantr adopt [--project <path>] [--base-url <url>] [--evidence] [--ci] [--no-packs] [--yes]
  decantr task <route> ["task summary"] [--project <path>] [--since origin/main] [--json]
  decantr verify [--project <path>] [--brownfield] [--local-patterns] [health options]
  decantr resolve [--project <path>] [--json] [--defer <finding-id>] [--mark-advisory <finding-id>]
  decantr graph [--project <path>] [--route <route>] [--node <id>] [--file <path>] [--task <text>] [--snapshot-id <id>] [--compare-to <id>] [--capsule-source-limit <count>] [--check] [--json]
  decantr ci [--project <path>] [--workspace] [--fail-on error|warn|none]
  decantr doctor [--project <path>] [--workspace] [--json]
  decantr connect cursor [--project <path>] [--preview]
  decantr codify [--from-audit] [--style-bridge] [--map-pattern <slug>] [--accept] [--project <path>]
  decantr studio [--port 4319] [--host 127.0.0.1] [--report decantr-health.json] [--workspace]

${formatWhichCommandFirst()}

${BOLD}Advanced primitives:${RESET}
  decantr init [options]
  decantr analyze
  decantr magic <prompt> [--dry-run]
  decantr status
  decantr sync
  decantr audit [file]
  decantr migrate --to v4
  decantr check
  decantr check --brownfield
  decantr sync-drift
  decantr resolve [--json]
  decantr graph [--project <path>] [--route <route>] [--node <id>] [--file <path>] [--task <text>] [--snapshot-id <id>] [--compare-to <id>] [--capsule-source-limit <count>] [--check] [--json]
  decantr search <query> [--type <type>] [--sort <recommended|recent|name>] [--recommended] [--source <authored|benchmark|hybrid>]
  decantr suggest <query> [--type <type>] [--route <route>] [--file <path>] [--from-code]
  decantr get <type> <id>
  decantr list <type> [--sort <recommended|recent|name>] [--recommended] [--source <authored|benchmark|hybrid>]
  decantr showcase [manifest|shortlist|verification] [--json]
  decantr registry summary [--namespace <namespace>] [--json]
  decantr registry compile-packs [path] [--namespace <namespace>] [--json] [--write-context]
  decantr registry get-pack <manifest|scaffold|review|section|page|mutation> [id] [--namespace <namespace>] [--json] [--essence <path>] [--write-context]
  decantr registry critique-file <file> [--namespace <namespace>] [--json] [--essence <path>] [--treatments <path>]
  decantr registry audit-project [--namespace <namespace>] [--json] [--essence <path>] [--dist <path>] [--sources <dir>]
  decantr health [--format text|json|markdown] [--ci] [--fail-on error|warn|none]
  decantr health --evidence [--browser] [--base-url <url>] [--design-tokens <path>]
  decantr health --diagnostics [--json|--markdown]
  decantr health --save-baseline | --since-baseline
  decantr health init-ci [legacy alias for decantr ci init]
  decantr ci init [--project <path>] [--workspace] [--provider github|generic] [--force]
  decantr connect cursor [--project <path>] [--preview] [--mcp-only|--rules-only]
  decantr workspace list [--json]
  decantr workspace health [--json] [--changed --since origin/main]
  decantr content check [--json] [--markdown] [--ci]
  decantr content-health [--json] [--markdown] [--ci]
  decantr telemetry status [--json]
  decantr telemetry explain [--json]
  decantr telemetry link [--enable] [--org <slug>]
  decantr rules preview [--project=<path>]
  decantr rules apply [--project=<path>]
  decantr validate [path]
  decantr theme <subcommand>
  decantr create <type> <name>
  decantr publish <type> <name>
  decantr login
  decantr logout
  decantr help

${BOLD}Init Options:${RESET}
  --blueprint, -b    Blueprint ID
  --theme            Theme ID
  --mode             Color mode: dark | light | auto
  --shape            Border shape: pill | rounded | sharp
  --target           Framework: react | vue | svelte | angular | solid | nextjs | nuxt | astro | html
  --guard            Guard mode: creative | guided | strict
  --density          Spacing: compact | comfortable | spacious
  --shell            Default shell layout
  --workflow         Workflow: greenfield | brownfield | hybrid
  --adoption         Adoption: contract-only | style-bridge | decantr-css
  --assistant-bridge Assistant rules: none | preview | apply
  --accept-proposal  Brownfield: accept observed proposal when no essence exists
  --merge-proposal   Brownfield: merge observed proposal into an existing essence
  --replace-essence  Brownfield: explicit destructive proposal replacement with backup
  --project          App path inside a workspace/monorepo
  --existing         Initialize in existing project
  --offline          Force offline mode
  --yes, -y          Accept defaults, skip confirmations
  --registry         Custom registry URL
  --telemetry        Opt this project into privacy-filtered CLI product telemetry

${BOLD}Commands:${RESET}
  ${cyan('setup')}       Detect project state and recommend the right Decantr workflow
  ${cyan('scan')}        Read-only Brownfield reconnaissance; no files written
  ${cyan('new')}         Create a new greenfield workspace and bootstrap the available starter adapter
  ${cyan('adopt')}       Brownfield one-liner: analyze, attach, verify, and show next steps
  ${cyan('task')}        Prepare route/task context, local law, behavior obligations, evidence, and changed-file impact for an AI coding assistant
  ${cyan('verify')}      One reliability gate over Project Health, Brownfield checks, baselines, and evidence
  ${cyan('resolve')}     Read authority conflicts and explicitly defer/advisory-mark drift
  ${cyan('graph')}       Build typed Contract graph artifacts and the agent cache capsule
  ${cyan('ci')}          Non-mutating CI gate and CI integration generator
  ${cyan('doctor')}      Explain Decantr state, artifact ownership, and the next command
  ${cyan('connect')}     Connect Decantr to AI coding tools such as Cursor
  ${cyan('codify')}      Propose or accept project-owned Brownfield UI patterns, behavior obligations, and rules
  ${cyan('studio')}      Open a local Project Health dashboard backed by the same report
  ${cyan('content')}     Content-author namespace: check, create, publish

${BOLD}Advanced commands:${RESET}
  ${cyan('magic')}       Greenfield-first intent flow; steers existing apps into analyze + init
  ${cyan('init')}        Attach Decantr contract/context files to an existing project or empty workspace
  ${cyan('status')}      Show project status, DNA axioms, and blueprint info
  ${cyan('health')}      Advanced Project Health primitive [--json] [--markdown] [--ci]; use decantr ci for automation
  ${cyan('workspace')}   Discover and aggregate health across Decantr projects in a monorepo
  ${cyan('content-health')} Generate a local official-vocabulary health report [--json] [--markdown] [--ci]
  ${cyan('sync')}        Sync official vocabulary from API
  ${cyan('audit')}       Audit the project or critique a specific file against compiled packs
  ${cyan('migrate')}     Migrate older essence files to v4 format (with .pre-v4.backup.json backup)
  ${cyan('check')}       Detect drift issues (validate + guard rules) [--telemetry] [--brownfield]
  ${cyan('sync-drift')}  Review and resolve drift log entries
  ${cyan('resolve')}     Group source-vs-contract conflicts and print exact resolution actions
  ${cyan('graph')}       Generate .decantr/graph snapshot, history, manifest, diff, and contract capsule
  ${cyan('search')}      Search official/community vocabulary
  ${cyan('suggest')}     Suggest patterns or alternatives for a query
  ${cyan('get')}         Get full details of a vocabulary item
  ${cyan('list')}        List items by type
  ${cyan('showcase')}    Inspect audited showcase benchmark metadata
  ${cyan('validate')}    Validate an Essence v4 file
  ${cyan('theme')}       Manage custom themes (create, list, validate, delete, import)
  ${cyan('create')}      Create a custom content item (pattern, theme, blueprint, etc.)
  ${cyan('publish')}     Publish a custom vocabulary item to the community content service
  ${cyan('login')}       Authenticate with the Decantr registry
  ${cyan('logout')}      Remove stored credentials
  ${cyan('analyze')}     Brownfield entrypoint: scan an existing project and emit attach guidance
  ${cyan('telemetry')}   Inspect or link this project's opted-in CLI telemetry identity
  ${cyan('export')}      Export design tokens to framework format (shadcn, tailwind, css-vars)
  ${cyan('registry')}    Registry management and intelligence summary
  ${cyan('rules')}       Preview/apply Decantr assistant bridge blocks to repo rule files
  ${cyan('connect')}     Configure editor-specific Decantr rules and MCP where supported
  ${cyan('upgrade')}     Check for content updates from registry
  ${cyan('help')}        Show this help

${BOLD}Examples:${RESET}
  decantr setup
  decantr scan
  decantr scan --json
  decantr new my-app --blueprint=carbon-ai-portal
  decantr adopt --yes
  decantr adopt --project apps/web --yes
  decantr task /feed "add saved recipe actions"
  decantr verify --brownfield --local-patterns
  decantr resolve
  decantr graph --project apps/web
  decantr graph --project apps/web --route /feed --task "improve loading" --json
  decantr graph --project apps/web --file src/app/page.tsx --impact --json
  decantr graph --project apps/web --compare-to graph:previous --include-diff-ops --json
  decantr graph --check --json
  decantr verify --base-url http://localhost:3000 --evidence
  decantr verify --since-baseline
  decantr doctor --project apps/web
  decantr connect cursor --project apps/web
  decantr connect cursor --preview
  decantr ci --project apps/web
  decantr ci init --project apps/web
  decantr codify --from-audit
  decantr codify --map-pattern hero --project apps/web
  decantr codify --accept
  decantr content check --ci --fail-on error
  decantr magic "AI chatbot with dark cyber theme — bold and futuristic"
  decantr init
  decantr analyze
  decantr init --existing --accept-proposal
  decantr init --existing --merge-proposal
  decantr init --existing --adoption=style-bridge --assistant-bridge=preview
  decantr init --workflow=greenfield --adoption=contract-only
  decantr init --project=apps/web --yes
  decantr rules preview
  decantr rules apply
  decantr status
  decantr health
  decantr health --evidence --output .decantr/evidence/latest.json
  decantr workspace list
  decantr verify --workspace --changed --since origin/main
  decantr content check --ci --fail-on error
  decantr studio
  decantr studio --report decantr-health.json
  decantr telemetry status
  decantr telemetry explain
  decantr telemetry link --enable --org my-team
  decantr audit
  decantr audit src/pages/HomePage.tsx
  decantr migrate --to v4
  decantr check --brownfield
  decantr sync-drift
  decantr search dashboard
  decantr suggest "recipe feed with infinite scroll" --route /feed --from-code
  decantr list patterns
  decantr showcase shortlist
  decantr showcase verification --json
  decantr registry summary --namespace @official
  decantr registry compile-packs decantr.essence.json --json
  decantr registry compile-packs decantr.essence.json --write-context
  decantr registry get-pack manifest --namespace @official --json
  decantr registry get-pack review --namespace @official --write-context
  decantr registry critique-file src/pages/Home.tsx --namespace @official --json
  decantr registry audit-project --namespace @official --json
  decantr registry audit-project --namespace @official --dist dist --sources src
  decantr create pattern my-card

${BOLD}Workflow Model:${RESET}
  ${cyan('Greenfield blueprint')}   decantr new my-app --blueprint=X --workflow=greenfield --adoption=decantr-css
  ${cyan('Greenfield contract')}    decantr init --workflow=greenfield --adoption=contract-only
  ${cyan('Brownfield adoption')}    decantr adopt --yes
  ${cyan('Brownfield preview')}     decantr scan -> decantr adopt --yes
  ${cyan('Brownfield monorepo')}    decantr adopt --project apps/web --yes
  ${cyan('Daily LLM work')}          decantr task <route> "<change>" -> decantr verify --brownfield --local-patterns
  ${cyan('Cursor activation')}       decantr connect cursor -> Cursor Agent calls decantr_context action=task
  ${cyan('Drift resolution')}        decantr resolve -> codify/init/graph/repair source explicitly
  ${cyan('Typed contract graph')}    decantr graph -> agent session loads .decantr/graph/contract-capsule.json
  ${cyan('Project-owned law')}       decantr codify --from-audit -> edit proposal -> decantr codify --accept
  ${cyan('Hybrid composition')}     decantr add/remove, decantr theme switch, decantr registry, decantr upgrade

${BOLD}Bootstrap adapters:${RESET}
  Runnable starter adapters: ${cyan('react-vite')}, ${cyan('next-app')}, ${cyan('vanilla-vite')}, ${cyan('vue-vite')}, ${cyan('sveltekit')}, ${cyan('angular')}, ${cyan('solid-vite')}
  Unsupported targets resolve through ${cyan('generic-web')} contract-only mode until their starter adapters land.
`);
}

function cmdRulesHelp() {
  console.log(`
${BOLD}decantr rules${RESET} — Preview or apply assistant bridge snippets

${BOLD}Usage:${RESET}
  decantr rules preview [--project=<path>]
  decantr rules apply [--project=<path>]

${BOLD}Subcommands:${RESET}
  ${cyan('preview')}  Print target-specific Decantr bridge guidance without mutating rule files
  ${cyan('apply')}    Idempotently write Decantr bridge blocks to supported assistant rule files

${BOLD}Examples:${RESET}
  decantr rules preview
  decantr rules preview --project=apps/web
  decantr rules apply --project=apps/web
`);
}

function cmdScanHelp() {
  console.log(`
${BOLD}decantr scan${RESET} — Read-only Brownfield reconnaissance

${BOLD}Usage:${RESET}
  decantr scan [--project <path>] [--json]

${BOLD}Options:${RESET}
  --project   App path inside a workspace/monorepo
  --json      Emit the ScanReportV2 JSON to stdout

${BOLD}Behavior:${RESET}
  Reads local project files, detects frontend framework/routes/styling/static-hosting signals,
  and prints a terminal report. It does not write .decantr files, install dependencies,
  build the app, execute scripts, upload source, or open pull requests.

${formatWhichCommandFirst()}

${BOLD}Examples:${RESET}
  decantr scan
  decantr scan --project apps/web
  decantr scan --json
`);
}

function isCommandHelpRequest(args: string[]): boolean {
  return args[1] === 'help' || args.slice(1).some((arg) => arg === '--help' || arg === '-h');
}

function cmdHealthHelp() {
  console.log(`
${BOLD}decantr health${RESET} — Generate a local Project Health report

${BOLD}Usage:${RESET}
  decantr health [--format text|json|markdown] [--output <file>]
  decantr health --json
  decantr health --markdown
  decantr health --ci [--fail-on error|warn|none]
  decantr health --prompt <finding-id>
  decantr health --evidence [--browser] [--design-tokens <path>]
  decantr health --diagnostics [--json|--markdown]
  decantr health --browser --base-url <url> --evidence
  decantr health --save-baseline
  decantr health --since-baseline
  decantr health init-ci [legacy alias for decantr ci init]

${BOLD}Options:${RESET}
  --format      Output format: text, json, or markdown
  --json        Emit JSON report
  --markdown    Emit markdown report
  --output      Write the selected report format to a file
  --ci          Enable CI exit-code behavior
  --fail-on     CI threshold: error, warn, or none
  --prompt      Print an AI-ready remediation prompt for a finding
  --evidence    Emit a local Evidence Bundle JSON artifact
  --diagnostics Print the stable diagnostic code and repair ID catalog
  --browser     Include optional rendered-browser setup/evidence checks
  --base-url    Base URL for rendered route checks when --browser is enabled
  --save-baseline Save the current health state for later comparison
  --since-baseline Compare this run to .decantr/health-baseline.json
  --design-tokens Compare against a Figma/Tokens Studio JSON export

${BOLD}Examples:${RESET}
  decantr health
  decantr health --json
  decantr health --markdown --output decantr-health.md
  decantr ci --project apps/web
  decantr health --prompt audit-essence-missing
  decantr health --diagnostics --markdown
  decantr health --evidence --output .decantr/evidence/latest.json
  decantr ci init --project apps/web
  decantr ci init --workspace
`);
}

function cmdWorkspaceHelp() {
  console.log(`
${BOLD}decantr workspace${RESET} — Inspect Decantr projects and app candidates across a monorepo

${BOLD}Usage:${RESET}
  decantr workspace list [--json]
  decantr workspace health [--json|--markdown] [--output <file>]
  decantr workspace health --changed --since origin/main

${BOLD}Examples:${RESET}
  decantr workspace list
  decantr adopt --project apps/web --yes
  decantr workspace health
  decantr workspace health --json --output .decantr/workspace-health.json
  decantr workspace health --changed --since origin/main
`);
}

function cmdContentHealthHelp() {
  console.log(`
${BOLD}decantr content-health${RESET} — Generate a local official-vocabulary health report

${BOLD}Usage:${RESET}
  decantr content-health [--format text|json|markdown] [--output <file>]
  decantr content-health --json
  decantr content-health --markdown
  decantr content-health --ci [--fail-on error|warn|none]
  decantr content-health --prompt <finding-id>

${BOLD}Options:${RESET}
  --format      Output format: text, json, or markdown
  --json        Emit JSON report
  --markdown    Emit markdown report
  --output      Write the selected report format to a file
  --ci          Enable CI exit-code behavior
  --fail-on     CI threshold: error, warn, or none
  --prompt      Print an AI-ready remediation prompt for a finding

${BOLD}Examples:${RESET}
  decantr content-health
  decantr content-health --json
  decantr content-health --markdown --output content-health.md
  decantr content-health --ci --fail-on error
`);
}

function cmdStudioHelp() {
  console.log(`
${BOLD}decantr studio${RESET} — Run a local Project Health dashboard

${BOLD}Usage:${RESET}
  decantr studio [--port 4319] [--host 127.0.0.1] [--report decantr-health.json]

${BOLD}Options:${RESET}
  --port        Local port to bind; defaults to 4319
  --host        Local host to bind; defaults to 127.0.0.1
  --report      Serve a read-only Project Health JSON artifact instead of scanning the current project
  --workspace   Serve a monorepo workspace health dashboard

${BOLD}Endpoints:${RESET}
  GET  /
  GET  /api/health
  GET  /api/control-room
  GET  /api/resolve
  GET  /api/evidence
  GET  /api/graph-impact
  GET  /api/task-preview
  GET  /api/proof
  POST /api/refresh

${BOLD}Examples:${RESET}
  decantr studio
  decantr studio --port 4320
  decantr studio --host 127.0.0.1 --port 4319
  decantr health --json --output decantr-health.json
  decantr studio --report decantr-health.json
  decantr studio --workspace
`);
}

function cmdRegistryHelp() {
  console.log(`
${BOLD}decantr registry${RESET} — Read hosted execution packs and registry intelligence

${BOLD}Usage:${RESET}
  decantr registry summary [--namespace <namespace>] [--json]
  decantr registry compile-packs [path] [--namespace <namespace>] [--json] [--write-context]
  decantr registry get-pack <manifest|scaffold|review|section|page|mutation> [id] [--namespace <namespace>] [--json] [--essence <path>] [--write-context]
  decantr registry get-pack page --route <route> [--namespace <namespace>] [--json] [--essence <path>]
  decantr registry critique-file <file> [--namespace <namespace>] [--json] [--essence <path>] [--treatments <path>]
  decantr registry audit-project [--namespace <namespace>] [--json] [--essence <path>] [--dist <path>] [--sources <dir>]
`);
}

function cmdThemeHelp() {
  console.log(`
${BOLD}decantr theme${RESET} — Manage custom themes

${BOLD}Usage:${RESET}
  decantr theme create <name>
  decantr theme create <name> --guided
  decantr theme list
  decantr theme validate <name>
  decantr theme delete <name>
  decantr theme import <path>
`);
}

function cmdSetupHelp() {
  console.log(`
${BOLD}decantr setup${RESET} — Detect the project state and recommend the right Decantr path

${BOLD}Usage:${RESET}
  decantr setup [--project <path>]

${formatWhichCommandFirst()}

${BOLD}Examples:${RESET}
  decantr setup
  decantr setup --project apps/web
`);
}

function cmdAdoptHelp() {
  console.log(`
${BOLD}decantr adopt${RESET} — Brownfield one-liner: analyze, attach, hydrate packs, verify, and show the operating loop

${BOLD}Usage:${RESET}
  decantr adopt [--project <path>] [--yes] [--dry-run] [--no-packs]
  decantr adopt [--project <path>] --base-url <url> [--evidence] [--ci] [--yes] [--no-packs]

${BOLD}Options:${RESET}
  --project           App path inside a workspace/monorepo
  --yes, -y           Run without confirmation
  --dry-run           Show the workflow without writing files
  --base-url          Include browser evidence against this dev server URL
  --evidence          Write .decantr/evidence/latest.json
  --baseline          Save a health baseline (default)
  --no-baseline       Skip baseline save
  --no-verify         Skip the verification step
  --no-packs          Skip hosted execution-pack hydration
  --ci, --init-ci     Install the Decantr CI gate after adoption
  --telemetry         Opt this project into privacy-filtered CLI product telemetry
  --merge-proposal    Merge the observed proposal into an existing essence
  --replace-essence   Replace an existing essence with backup

${BOLD}Examples:${RESET}
  decantr adopt --yes
  decantr adopt --project apps/web --yes
  decantr adopt --project apps/web --base-url http://localhost:3000 --evidence --yes
  decantr adopt --project apps/web --ci --yes
  decantr codify --from-audit --project apps/web
`);
}

function cmdVerifyHelp() {
  console.log(`
${BOLD}decantr verify${RESET} — One reliability command for local work and LLM agent loops

${BOLD}Usage:${RESET}
  decantr verify [--project <path>] [--brownfield] [--local-patterns]
  decantr verify --base-url <url> --evidence
  decantr verify --since-baseline
  decantr verify --workspace [--changed --since origin/main]
  decantr verify init-ci [legacy alias for decantr ci init]

${BOLD}Examples:${RESET}
  decantr verify
  decantr verify --brownfield --local-patterns
  decantr verify --brownfield --local-patterns --project apps/web
  decantr verify --brownfield --local-patterns --fail-on warn
  decantr verify --base-url http://localhost:3000 --evidence
  decantr verify --workspace --changed --since origin/main
  decantr ci init --project apps/web
`);
}

function cmdTaskHelp() {
  console.log(`
${BOLD}decantr task${RESET} — Prepare compact route/task context for an AI coding assistant

${BOLD}Usage:${RESET}
  decantr task <route> ["task summary"] [--project <path>] [--since origin/main] [--json]

${BOLD}Behavior:${RESET}
  Includes accepted local law and behavior obligations, plus the typed contract capsule path when
  .decantr/graph exists. Run decantr graph first when you want graph-backed agent context in
  CLI-only workflows.

${BOLD}Examples:${RESET}
  decantr task /feed "add saved recipe actions"
  decantr task /feed "add saved recipe actions" --since origin/main
  decantr task /profile --json
`);
}

function cmdResolveHelp() {
  console.log(`
${BOLD}decantr resolve${RESET} — Explain source-vs-contract authority conflicts

${BOLD}Usage:${RESET}
  decantr resolve [--project <path>] [--json]
  decantr resolve --defer <finding-id>
  decantr resolve --mark-advisory <finding-id>

${BOLD}Behavior:${RESET}
  Read-only by default. Writes are limited to .decantr/drift-log.json and require
  --defer or --mark-advisory. Contract, source, local-law, and style-bridge changes
  still go through explicit commands such as codify, init --existing --merge-proposal,
  graph, or contract_write over MCP.

${BOLD}Examples:${RESET}
  decantr resolve
  decantr resolve --json
  decantr resolve --project apps/web
  decantr resolve --defer brownfield-route-drift
`);
}

function cmdCodifyHelp() {
  console.log(`
${BOLD}decantr codify${RESET} — Propose or accept project-owned Brownfield UI law, behavior obligations, and style bridges

${BOLD}Usage:${RESET}
  decantr codify [--from-audit] [--style-bridge] [--project <path>]
  decantr codify --map-pattern <registry-pattern-slug> [--project <path>]
  decantr codify --accept [--project <path>]

${BOLD}Examples:${RESET}
  decantr codify
  decantr codify --from-audit
  decantr codify --style-bridge
  decantr codify --from-audit --style-bridge
  decantr codify --map-pattern hero --project apps/web
  decantr codify --accept
  decantr verify --brownfield --local-patterns
`);
}

function cmdContentHelp() {
  console.log(`
${BOLD}decantr content${RESET} — Content-author namespace for official-vocabulary repositories

${BOLD}Usage:${RESET}
  decantr content check [content-health options]
  decantr content create <type> <name>
  decantr content publish <type> <name>

${BOLD}Examples:${RESET}
  decantr content check --ci --fail-on error
  decantr content create pattern my-card
  decantr content publish pattern my-card
`);
}

function printCommandHelp(command: string, args: string[]): boolean {
  if (!isCommandHelpRequest(args)) return false;
  switch (command) {
    case 'setup':
      cmdSetupHelp();
      return true;
    case 'scan':
      cmdScanHelp();
      return true;
    case 'adopt':
      cmdAdoptHelp();
      return true;
    case 'verify':
      cmdVerifyHelp();
      return true;
    case 'graph':
      cmdGraphHelp();
      return true;
    case 'ci':
      cmdCiHelp();
      return true;
    case 'doctor':
      cmdDoctorHelp();
      return true;
    case 'task':
      cmdTaskHelp();
      return true;
    case 'resolve':
      cmdResolveHelp();
      return true;
    case 'codify':
      cmdCodifyHelp();
      return true;
    case 'content':
      cmdContentHelp();
      return true;
    case 'health':
      cmdHealthHelp();
      return true;
    case 'content-health':
      cmdContentHealthHelp();
      return true;
    case 'studio':
      cmdStudioHelp();
      return true;
    case 'workspace':
      cmdWorkspaceHelp();
      return true;
    case 'rules':
      cmdRulesHelp();
      return true;
    case 'connect':
      cmdConnectHelp();
      return true;
    case 'registry':
      cmdRegistryHelp();
      return true;
    case 'theme':
      cmdThemeHelp();
      return true;
    default:
      cmdHelp();
      return true;
  }
}

// ── Main ──

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    cmdHelp();
    return;
  }

  if (command === '--version' || command === '-v' || command === 'version') {
    // Print the @decantr/cli package version. Resolve from the CLI's own
    // package.json (read via fileURLToPath relative to this module) so we
    // never drift from what `npm view @decantr/cli version` reports.
    try {
      const here = dirname(fileURLToPath(import.meta.url));
      // Walk up from dist/* to packages/cli — package.json lives at the package root.
      // In a published install the dist/ sits alongside package.json (one level up).
      const candidates = [join(here, '..', 'package.json'), join(here, '..', '..', 'package.json')];
      for (const candidate of candidates) {
        if (existsSync(candidate)) {
          const pkg = JSON.parse(readFileSync(candidate, 'utf-8')) as { version?: string };
          if (pkg.version) {
            console.log(pkg.version);
            return;
          }
        }
      }
      console.error(error('Could not resolve @decantr/cli version from package.json.'));
      process.exitCode = 1;
    } catch (e) {
      console.error(error(`Failed to read CLI version: ${(e as Error).message}`));
      process.exitCode = 1;
    }
    return;
  }

  if (printCommandHelp(command, args)) {
    return;
  }

  switch (command) {
    case 'setup': {
      await cmdSetupWorkflow(args);
      break;
    }

    case 'scan': {
      await cmdScanWorkflow(args);
      break;
    }

    case 'adopt': {
      await cmdAdoptWorkflow(args);
      break;
    }

    case 'task': {
      await cmdTaskWorkflow(args);
      break;
    }

    case 'verify': {
      await cmdVerifyWorkflow(args);
      break;
    }

    case 'resolve': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['project', 'json', 'defer', 'mark-advisory'], 'resolve')) {
        break;
      }
      const workspaceInfo = resolveWorkflowProject(flags, 'resolve');
      if (!workspaceInfo) break;
      await cmdResolve(workspaceInfo.appRoot, args);
      break;
    }

    case 'graph': {
      const { flags } = parseLooseArgs(args);
      if (
        !ensureAllowedFlags(
          flags,
          [
            'project',
            'route',
            'node',
            'file',
            'task',
            'snapshot-id',
            'compare-to',
            'include-diff-ops',
            'impact',
            'limit',
            'capsule-source-limit',
            'check',
            'json',
          ],
          'graph',
        )
      )
        break;
      const workspaceInfo = resolveWorkflowProject(flags, 'graph');
      if (!workspaceInfo) break;
      const limitArg = flagString(flags, 'limit');
      const limit = limitArg ? Number(limitArg) : undefined;
      const capsuleSourceLimitArg = flagString(flags, 'capsule-source-limit');
      const capsuleSourceLimit = capsuleSourceLimitArg ? Number(capsuleSourceLimitArg) : undefined;
      await cmdGraph(workspaceInfo.appRoot, {
        check: flagBoolean(flags, 'check'),
        json: flagBoolean(flags, 'json'),
        route: flagString(flags, 'route'),
        node: flagString(flags, 'node'),
        file: flagString(flags, 'file'),
        impact: flagBoolean(flags, 'impact'),
        task: flagString(flags, 'task'),
        snapshotId: flagString(flags, 'snapshot-id'),
        compareTo: flagString(flags, 'compare-to'),
        includeDiffOps: flagBoolean(flags, 'include-diff-ops'),
        limit,
        capsuleSourceLimit,
        displayRoot: workspaceInfo.cwd,
      });
      break;
    }

    case 'ci': {
      await cmdCi(args, process.cwd());
      break;
    }

    case 'doctor': {
      await cmdDoctor(args, process.cwd());
      break;
    }

    case 'codify': {
      await cmdCodifyWorkflow(args);
      break;
    }

    case 'content': {
      await cmdContentWorkflow(args);
      break;
    }

    case 'new': {
      const newName = args[1];
      if (!newName) {
        console.error(
          error('Usage: decantr new <project-name> [--blueprint=X] [--archetype=X] [--theme=X]'),
        );
        process.exitCode = 1;
        break;
      }
      const newOpts: Record<string, string | boolean> = {};
      for (let i = 2; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--offline') {
          newOpts.offline = true;
        } else if (arg === '--telemetry') {
          newOpts.telemetry = true;
        } else if (arg.startsWith('--')) {
          const [key, value] = arg.slice(2).split('=');
          if (value) {
            newOpts[key] = value;
          } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
            newOpts[key] = args[++i];
          }
        }
      }
      await cmdNewProject(newName, {
        blueprint: newOpts.blueprint as string | undefined,
        archetype: newOpts.archetype as string | undefined,
        theme: newOpts.theme as string | undefined,
        mode: newOpts.mode as string | undefined,
        shape: newOpts.shape as string | undefined,
        target: newOpts.target as string | undefined,
        offline: newOpts.offline === true,
        registry: newOpts.registry as string | undefined,
        workflow: newOpts.workflow as string | undefined,
        adoption: newOpts.adoption as string | undefined,
        assistantBridge: newOpts['assistant-bridge'] as string | undefined,
        telemetry: newOpts.telemetry === true,
      });
      break;
    }

    case 'init': {
      // Parse init flags
      const initArgs: InitArgs = {};
      for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--yes' || arg === '-y') {
          initArgs.yes = true;
        } else if (arg === '--offline') {
          initArgs.offline = true;
        } else if (arg === '--telemetry') {
          initArgs.telemetry = true;
        } else if (arg === '--existing') {
          initArgs.existing = true;
        } else if (arg === '--accept-proposal') {
          initArgs['accept-proposal'] = true;
        } else if (arg === '--merge-proposal') {
          initArgs['merge-proposal'] = true;
        } else if (arg === '--replace-essence') {
          initArgs['replace-essence'] = true;
        } else if (arg.startsWith('--')) {
          const [key, value] = arg.slice(2).split('=');
          if (value) {
            (initArgs as Record<string, string>)[key] = value;
          } else if (args[i + 1] && !args[i + 1].startsWith('-')) {
            (initArgs as Record<string, string>)[key] = args[++i];
          }
        } else if (arg.startsWith('-')) {
          const key = arg.slice(1);
          if (key === 'b' && args[i + 1]) initArgs.blueprint = args[++i];
          if (key === 'y') initArgs.yes = true;
        }
      }
      await cmdInit(initArgs);
      break;
    }

    case 'status': {
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = resolveWorkflowProject(flags, 'status');
      if (!workspaceInfo) break;
      await cmdStatus(workspaceInfo.appRoot);
      break;
    }

    case 'sync': {
      await cmdSync();
      break;
    }

    case 'upgrade': {
      const { cmdUpgrade } = await import('./commands/upgrade.js');
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = resolveWorkflowProject(flags, 'upgrade');
      if (!workspaceInfo) break;
      const applyFlag = args.includes('--apply');
      await cmdUpgrade(workspaceInfo.appRoot, { apply: applyFlag });
      break;
    }

    case 'check':
    case 'heal': {
      // `heal` is deprecated, aliased to `check`
      if (command === 'heal') {
        console.log(
          `${YELLOW}Note: \`decantr heal\` is deprecated. Use \`decantr check\` instead.${RESET}`,
        );
      }
      const { cmdHeal } = await import('./commands/heal.js');
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = resolveWorkflowProject(flags, 'check');
      if (!workspaceInfo) break;
      const telemetryFlag = args.includes('--telemetry');
      const brownfieldFlag = args.includes('--brownfield');
      await cmdHeal(workspaceInfo.appRoot, {
        telemetry: telemetryFlag,
        brownfield: brownfieldFlag,
      });
      break;
    }

    case 'health': {
      try {
        if (isCommandHelpRequest(args)) {
          cmdHealthHelp();
          break;
        }
        if (args[1] === 'init-ci') {
          await cmdCi(['ci', 'init', ...args.slice(2)], process.cwd());
          break;
        }
        const { flags } = parseLooseArgs(args);
        const workspaceInfo = resolveWorkflowProject(flags, 'health');
        if (!workspaceInfo) break;
        const { cmdHealth, parseHealthArgs } = await import('./commands/health.js');
        await cmdHealth(workspaceInfo.appRoot, parseHealthArgs(stripProjectArgs(args)));
      } catch (e) {
        console.error(error((e as Error).message));
        process.exitCode = 1;
      }
      break;
    }

    case 'content-health': {
      try {
        if (isCommandHelpRequest(args)) {
          cmdContentHealthHelp();
          break;
        }
        const { cmdContentHealth, parseContentHealthArgs } = await import(
          './commands/content-health.js'
        );
        await cmdContentHealth(process.cwd(), parseContentHealthArgs(args));
      } catch (e) {
        console.error(error((e as Error).message));
        process.exitCode = 1;
      }
      break;
    }

    case 'studio': {
      try {
        if (isCommandHelpRequest(args)) {
          cmdStudioHelp();
          break;
        }
        const { cmdStudio, parseStudioArgs } = await import('./commands/studio.js');
        await cmdStudio(process.cwd(), parseStudioArgs(args));
      } catch (e) {
        console.error(error((e as Error).message));
        process.exitCode = 1;
      }
      break;
    }

    case 'workspace': {
      try {
        if (isCommandHelpRequest(args)) {
          cmdWorkspaceHelp();
          break;
        }
        const { cmdWorkspace } = await import('./commands/workspace.js');
        await cmdWorkspace(process.cwd(), args);
      } catch (e) {
        console.error(error((e as Error).message));
        process.exitCode = 1;
      }
      break;
    }

    case 'migrate': {
      await cmdMigrate(process.cwd(), args.slice(1));
      break;
    }

    case 'sync-drift': {
      // Handle flags
      const resolveAllFlag = args.includes('--resolve-all');
      const clearFlag = args.includes('--clear');
      const resolveIdx = args.indexOf('--resolve');
      const resolveNum = resolveIdx !== -1 ? parseInt(args[resolveIdx + 1], 10) : undefined;

      if (resolveAllFlag || clearFlag || resolveNum !== undefined) {
        const result = resolveDriftEntries(process.cwd(), {
          resolveAll: resolveAllFlag,
          clear: clearFlag,
          resolveIndex: resolveNum,
        });
        if (result.success) {
          console.log(success(clearFlag ? 'Drift log cleared.' : 'Entries resolved.'));
        } else {
          console.error(error(result.error || 'Failed'));
          process.exitCode = 1;
        }
      } else {
        await cmdSyncDrift(process.cwd());
      }
      break;
    }

    case 'audit': {
      await cmdAudit(args[1]);
      break;
    }

    case 'search': {
      const query = args[1];
      if (!query) {
        console.error(
          error(
            'Usage: decantr search <query> [--type <type>] [--sort <recommended|recent|name>] [--source <authored|benchmark|hybrid>] [--blueprint-set <all|featured|certified|labs>]',
          ),
        );
        process.exitCode = 1;
        return;
      }
      const typeIdx = args.indexOf('--type');
      const type = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
      const sortIdx = args.indexOf('--sort');
      const sort = sortIdx !== -1 ? args[sortIdx + 1] : undefined;
      const sourceIdx = args.indexOf('--source');
      const intelligenceSource = sourceIdx !== -1 ? args[sourceIdx + 1] : undefined;
      const blueprintSetIdx = args.indexOf('--blueprint-set');
      const rawBlueprintSet = args.includes('--labs')
        ? 'labs'
        : blueprintSetIdx !== -1
          ? args[blueprintSetIdx + 1]
          : undefined;
      const blueprintSet =
        rawBlueprintSet && isPublicBlueprintSet(rawBlueprintSet) ? rawBlueprintSet : undefined;
      if (rawBlueprintSet && !blueprintSet) {
        console.error(
          error(
            `Invalid blueprint set "${rawBlueprintSet}". Must be one of: all, featured, certified, labs.`,
          ),
        );
        process.exitCode = 1;
        return;
      }
      if (intelligenceSource && !isContentIntelligenceSource(intelligenceSource)) {
        console.error(
          error(
            `Invalid source "${intelligenceSource}". Must be one of: authored, benchmark, hybrid.`,
          ),
        );
        process.exitCode = 1;
        return;
      }
      const recommended = args.includes('--recommended');
      await cmdSearch(query, type, sort, recommended, intelligenceSource, blueprintSet);
      break;
    }

    case 'suggest': {
      const { flags, positional } = parseLooseArgs(args);
      if (
        !ensureAllowedFlags(flags, ['type', 'route', 'file', 'from-code', 'project'], 'suggest')
      ) {
        break;
      }
      const projectArg = flagString(flags, 'project');
      const route = flagString(flags, 'route');
      let file = flagString(flags, 'file');
      const normalizedProject = normalizedProjectPath(projectArg);
      if (
        file &&
        normalizedProject &&
        normalizedProjectPath(file)?.startsWith(`${normalizedProject}/`)
      ) {
        file = normalizedProjectPath(file)?.slice(normalizedProject.length + 1);
      }
      const fromCode = flagBoolean(flags, 'from-code');
      let query = positional.join(' ').trim();
      if (!query && (route || file || fromCode)) {
        query = [
          route ? `route ${route}` : null,
          file ? `file ${basename(file)}` : null,
          fromCode ? 'source code patterns' : null,
        ]
          .filter((entry): entry is string => Boolean(entry))
          .join(' ');
      }
      if (!query) {
        console.error(
          error(
            'Usage: decantr suggest <query> [--type <type>] [--route <route>] [--file <path>] [--from-code] [--project <path>]',
          ),
        );
        process.exitCode = 1;
        return;
      }
      const workspaceInfo = projectArg ? resolveWorkflowProject(flags, 'suggest') : null;
      if (projectArg && !workspaceInfo) break;
      await cmdSuggest(query, {
        type: flagString(flags, 'type'),
        route,
        file,
        fromCode,
        projectRoot: workspaceInfo?.appRoot ?? process.cwd(),
      });
      break;
    }

    case 'get': {
      const type = args[1];
      const id = args[2];
      if (!type || !id) {
        console.error(error('Usage: decantr get <type> <id>'));
        process.exitCode = 1;
        return;
      }
      await cmdGet(type, id);
      break;
    }

    case 'list': {
      const type = args[1];
      if (!type) {
        console.error(
          error(
            'Usage: decantr list <type> [--sort <recommended|recent|name>] [--source <authored|benchmark|hybrid>] [--blueprint-set <all|featured|certified|labs>]',
          ),
        );
        process.exitCode = 1;
        return;
      }
      const sortIdx = args.indexOf('--sort');
      const sort = sortIdx !== -1 ? args[sortIdx + 1] : undefined;
      const sourceIdx = args.indexOf('--source');
      const intelligenceSource = sourceIdx !== -1 ? args[sourceIdx + 1] : undefined;
      const blueprintSetIdx = args.indexOf('--blueprint-set');
      const rawBlueprintSet = args.includes('--labs')
        ? 'labs'
        : blueprintSetIdx !== -1
          ? args[blueprintSetIdx + 1]
          : undefined;
      const blueprintSet =
        rawBlueprintSet && isPublicBlueprintSet(rawBlueprintSet) ? rawBlueprintSet : undefined;
      if (rawBlueprintSet && !blueprintSet) {
        console.error(
          error(
            `Invalid blueprint set "${rawBlueprintSet}". Must be one of: all, featured, certified, labs.`,
          ),
        );
        process.exitCode = 1;
        return;
      }
      if (intelligenceSource && !isContentIntelligenceSource(intelligenceSource)) {
        console.error(
          error(
            `Invalid source "${intelligenceSource}". Must be one of: authored, benchmark, hybrid.`,
          ),
        );
        process.exitCode = 1;
        return;
      }
      const recommended = args.includes('--recommended');
      await cmdList(type, sort, recommended, intelligenceSource, blueprintSet);
      break;
    }

    case 'showcase': {
      const requestedView = args[1];
      const view =
        requestedView === 'manifest' ||
        requestedView === 'shortlist' ||
        requestedView === 'verification'
          ? requestedView
          : 'shortlist';
      const jsonOutput = args.includes('--json');

      if (requestedView?.startsWith('--')) {
        await printShowcaseBenchmarks('shortlist', jsonOutput);
        break;
      }

      if (requestedView && !['manifest', 'shortlist', 'verification'].includes(requestedView)) {
        console.error(error('Usage: decantr showcase [manifest|shortlist|verification] [--json]'));
        process.exitCode = 1;
        break;
      }

      await printShowcaseBenchmarks(view, jsonOutput);
      break;
    }

    case 'validate': {
      await cmdValidate(args[1]);
      break;
    }

    case 'theme': {
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = flagString(flags, 'project')
        ? resolveWorkflowProject(flags, 'theme')
        : null;
      if (flagString(flags, 'project') && !workspaceInfo) break;
      await cmdTheme(stripProjectArgs(args).slice(1), workspaceInfo?.appRoot ?? process.cwd());
      break;
    }

    case 'login': {
      const apiKeyArg = args[1];
      if (apiKeyArg?.startsWith('--api-key=')) {
        const key = apiKeyArg.split('=')[1];
        saveCredentials({ access_token: key, api_key: key });
        console.log(success('API key saved.'));
      } else {
        console.log(heading('Decantr Login'));
        console.log('  To authenticate, get your API key from the Decantr dashboard:');
        console.log('');
        console.log(`    ${cyan('https://decantr.ai/dashboard/api-keys')}`);
        console.log('');
        console.log('  Then run:');
        console.log(`    ${cyan('decantr login --api-key=<your-key>')}`);
        console.log('');
        console.log('  Or set the environment variable:');
        console.log(`    ${cyan('export DECANTR_API_KEY=<your-key>')}`);

        const existingCreds = getCredentials();
        if (existingCreds) {
          console.log('');
          console.log(dim('You are currently authenticated.'));
        }
      }
      break;
    }

    case 'logout': {
      clearCredentials();
      console.log(success('Logged out. Credentials removed.'));
      break;
    }

    case 'telemetry': {
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = flagString(flags, 'project')
        ? resolveWorkflowProject(flags, 'telemetry')
        : null;
      if (flagString(flags, 'project') && !workspaceInfo) break;
      await cmdTelemetry(stripProjectArgs(args).slice(1), workspaceInfo?.appRoot ?? process.cwd());
      break;
    }

    case 'create': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, [], 'create')) break;
      const type = args[1];
      const name = args[2];
      if (!type || !name) {
        console.error(error('Usage: decantr create <type> <name>'));
        console.error(dim('Types: pattern, theme, blueprint, archetype, shell'));
        process.exitCode = 1;
        break;
      }
      cmdCreate(type, name);
      break;
    }

    case 'publish': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, [], 'publish')) break;
      const type = args[1];
      const name = args[2];
      if (!type || !name) {
        console.error(error('Usage: decantr publish <type> <name>'));
        console.error(dim('Types: pattern, theme, blueprint, archetype, shell'));
        process.exitCode = 1;
        break;
      }
      await cmdPublish(type, name);
      break;
    }

    case 'refresh': {
      const { flags } = parseLooseArgs(args);
      const workspaceInfo = resolveWorkflowProject(flags, 'refresh');
      if (!workspaceInfo) break;
      const refreshOffline = args.includes('--offline');
      await cmdRefresh(workspaceInfo.appRoot, {
        offline: refreshOffline,
        check: args.includes('--check'),
        listChanges: args.includes('--list-changes'),
        json: args.includes('--json'),
        displayRoot: workspaceInfo.cwd,
      });
      break;
    }

    case 'registry': {
      const subcommand = args[1];
      if (subcommand === 'mirror') {
        const typeIdx = args.indexOf('--type');
        const mirrorType = typeIdx !== -1 ? args[typeIdx + 1] : undefined;
        await cmdRegistryMirror(process.cwd(), { type: mirrorType });
      } else if (subcommand === 'summary') {
        const namespaceIdx = args.indexOf('--namespace');
        const namespace = namespaceIdx !== -1 ? args[namespaceIdx + 1] : undefined;
        const jsonOutput = args.includes('--json');
        await printRegistryIntelligenceSummary(namespace, jsonOutput);
      } else if (subcommand === 'compile-packs') {
        const namespaceIdx = args.indexOf('--namespace');
        const namespace = namespaceIdx !== -1 ? args[namespaceIdx + 1] : undefined;
        const jsonOutput = args.includes('--json');
        const writeContext = args.includes('--write-context');
        const essencePath = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
        await printHostedExecutionPackBundle(essencePath, namespace, jsonOutput, writeContext);
      } else if (subcommand === 'get-pack') {
        const namespaceIdx = args.indexOf('--namespace');
        const namespace = namespaceIdx !== -1 ? args[namespaceIdx + 1] : undefined;
        const jsonOutput = args.includes('--json');
        const writeContext = args.includes('--write-context');
        const essenceIdx = args.indexOf('--essence');
        const essencePath = essenceIdx !== -1 ? args[essenceIdx + 1] : undefined;
        const packType = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
        const routeIdx = args.indexOf('--route');
        const route = routeIdx !== -1 ? args[routeIdx + 1] : undefined;
        let id = args[3] && !args[3].startsWith('--') ? args[3] : undefined;
        if (
          !packType ||
          !['manifest', 'scaffold', 'review', 'section', 'page', 'mutation'].includes(packType)
        ) {
          console.error(
            `${RED}Usage: decantr registry get-pack <manifest|scaffold|review|section|page|mutation> [id] [--namespace <namespace>] [--json] [--essence <path>] [--write-context]${RESET}`,
          );
          process.exitCode = 1;
          break;
        }
        if (packType === 'manifest') {
          await printHostedExecutionPackManifest(essencePath, namespace, jsonOutput, writeContext);
          break;
        }
        if (packType === 'page' && route && !id) {
          const resolvedPath = essencePath
            ? resolveUserPath(essencePath)
            : join(process.cwd(), 'decantr.essence.json');
          id = resolvePagePackIdForRoute(resolvedPath, route);
        }
        await printHostedSelectedExecutionPack(
          packType as 'scaffold' | 'review' | 'section' | 'page' | 'mutation',
          id,
          essencePath,
          namespace,
          jsonOutput,
          writeContext,
        );
      } else if (subcommand === 'critique-file') {
        const namespaceIdx = args.indexOf('--namespace');
        const namespace = namespaceIdx !== -1 ? args[namespaceIdx + 1] : undefined;
        const jsonOutput = args.includes('--json');
        const essenceIdx = args.indexOf('--essence');
        const essencePath = essenceIdx !== -1 ? args[essenceIdx + 1] : undefined;
        const treatmentsIdx = args.indexOf('--treatments');
        const treatmentsPath = treatmentsIdx !== -1 ? args[treatmentsIdx + 1] : undefined;
        const sourcePath = args[2] && !args[2].startsWith('--') ? args[2] : undefined;
        if (!sourcePath) {
          console.error(
            `${RED}Usage: decantr registry critique-file <file> [--namespace <namespace>] [--json] [--essence <path>] [--treatments <path>]${RESET}`,
          );
          process.exitCode = 1;
          break;
        }
        await printHostedFileCritique(
          sourcePath,
          namespace,
          jsonOutput,
          essencePath,
          treatmentsPath,
        );
      } else if (subcommand === 'audit-project') {
        const namespaceIdx = args.indexOf('--namespace');
        const namespace = namespaceIdx !== -1 ? args[namespaceIdx + 1] : undefined;
        const jsonOutput = args.includes('--json');
        const essenceIdx = args.indexOf('--essence');
        const essencePath = essenceIdx !== -1 ? args[essenceIdx + 1] : undefined;
        const distIdx = args.indexOf('--dist');
        const distPath = distIdx !== -1 ? args[distIdx + 1] : undefined;
        const sourcesIdx = args.indexOf('--sources');
        const sourcesPath = sourcesIdx !== -1 ? args[sourcesIdx + 1] : undefined;
        await printHostedProjectAudit(namespace, jsonOutput, essencePath, distPath, sourcesPath);
      } else {
        console.error(
          `${RED}Usage: decantr registry mirror [--type <type>] | decantr registry summary [--namespace <namespace>] [--json] | decantr registry compile-packs [path] [--namespace <namespace>] [--json] [--write-context] | decantr registry get-pack <manifest|scaffold|review|section|page|mutation> [id] [--namespace <namespace>] [--json] [--essence <path>] [--write-context] | decantr registry critique-file <file> [--namespace <namespace>] [--json] [--essence <path>] [--treatments <path>] | decantr registry audit-project [--namespace <namespace>] [--json] [--essence <path>] [--dist <path>] [--sources <dir>]${RESET}`,
        );
        process.exitCode = 1;
      }
      break;
    }

    case 'add': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['project', 'route', 'section'], 'add')) break;
      const workspaceInfo = resolveWorkflowProject(flags, 'add');
      if (!workspaceInfo) break;
      const subcommand = args[1];
      if (!subcommand) {
        console.error(error('Usage: decantr add <section|page|feature> <target>'));
        process.exitCode = 1;
        break;
      }
      switch (subcommand) {
        case 'section': {
          const id = args[2];
          if (!id) {
            console.error(error('Usage: decantr add section <archetypeId>'));
            process.exitCode = 1;
            break;
          }
          await cmdAddSection(id, args, workspaceInfo.appRoot);
          break;
        }
        case 'page': {
          const pagePath = args[2];
          if (!pagePath) {
            console.error(error('Usage: decantr add page <section>/<page>'));
            process.exitCode = 1;
            break;
          }
          await cmdAddPage(pagePath, args, workspaceInfo.appRoot);
          break;
        }
        case 'feature': {
          const feature = args[2];
          if (!feature) {
            console.error(error('Usage: decantr add feature <feature> [--section <id>]'));
            process.exitCode = 1;
            break;
          }
          await cmdAddFeature(feature, args, workspaceInfo.appRoot);
          break;
        }
        default:
          console.error(
            error(`Unknown add subcommand: ${subcommand}. Use section, page, or feature.`),
          );
          process.exitCode = 1;
      }
      break;
    }

    case 'remove': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['project', 'section'], 'remove')) break;
      const workspaceInfo = resolveWorkflowProject(flags, 'remove');
      if (!workspaceInfo) break;
      const subcommand = args[1];
      if (!subcommand) {
        console.error(error('Usage: decantr remove <section|page|feature> <target>'));
        process.exitCode = 1;
        break;
      }
      switch (subcommand) {
        case 'section': {
          const id = args[2];
          if (!id) {
            console.error(error('Usage: decantr remove section <sectionId>'));
            process.exitCode = 1;
            break;
          }
          await cmdRemoveSection(id, args, workspaceInfo.appRoot);
          break;
        }
        case 'page': {
          const pagePath = args[2];
          if (!pagePath) {
            console.error(error('Usage: decantr remove page <section>/<page>'));
            process.exitCode = 1;
            break;
          }
          await cmdRemovePage(pagePath, args, workspaceInfo.appRoot);
          break;
        }
        case 'feature': {
          const feature = args[2];
          if (!feature) {
            console.error(error('Usage: decantr remove feature <feature> [--section <id>]'));
            process.exitCode = 1;
            break;
          }
          await cmdRemoveFeature(feature, args, workspaceInfo.appRoot);
          break;
        }
        default:
          console.error(
            error(`Unknown remove subcommand: ${subcommand}. Use section, page, or feature.`),
          );
          process.exitCode = 1;
      }
      break;
    }

    case 'analyze': {
      const { flags } = parseLooseArgs(args);
      if (
        !ensureAllowedFlags(
          flags,
          ['project', 'force-package', 'allow-package', 'force'],
          'analyze',
        )
      ) {
        break;
      }
      const workspaceInfo = resolveWorkflowProject(flags, 'analyze', {
        requireAppCandidate: true,
      });
      if (!workspaceInfo) break;
      await cmdAnalyze(workspaceInfo.appRoot, workspaceInfo);
      break;
    }

    case 'connect': {
      const subcommand = args[1];
      if (!subcommand || subcommand === '--help' || subcommand === '-h' || subcommand === 'help') {
        cmdConnectHelp();
        break;
      }
      if (subcommand !== 'cursor') {
        console.error(error('Usage: decantr connect cursor [--project <path>] [--preview]'));
        process.exitCode = 1;
        break;
      }
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['project', 'preview', 'mcp-only', 'rules-only'], 'connect')) {
        break;
      }
      const workspaceInfo = resolveWorkflowProject(flags, 'connect');
      if (!workspaceInfo) break;
      const projectArg = flagString(flags, 'project');
      const detected = detectProject(workspaceInfo.appRoot);
      const routeHint = await scanRouteHint(workspaceInfo.appRoot, projectArg);
      cmdConnectCursor({
        connectionRoot: workspaceInfo.cwd,
        appRoot: workspaceInfo.appRoot,
        detected,
        projectArg,
        preview: flagBoolean(flags, 'preview'),
        mcpOnly: flagBoolean(flags, 'mcp-only'),
        rulesOnly: flagBoolean(flags, 'rules-only'),
        routeHint,
        attached: existsSync(join(workspaceInfo.appRoot, 'decantr.essence.json')),
      });
      break;
    }

    case 'rules': {
      const subcommand = args[1];
      if (!subcommand || subcommand === '--help' || subcommand === '-h' || subcommand === 'help') {
        cmdRulesHelp();
        break;
      }
      if (subcommand !== 'apply' && subcommand !== 'preview') {
        console.error(error('Usage: decantr rules <preview|apply> [--project=<path>]'));
        process.exitCode = 1;
        break;
      }
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['project'], 'rules')) break;
      const workspaceInfo = resolveWorkflowProject(flags, 'rules');
      if (!workspaceInfo) break;
      const detected = detectProject(workspaceInfo.appRoot);
      if (subcommand === 'preview') {
        console.log(
          buildAssistantBridgeContent({
            detected,
            workflowMode: 'brownfield-attach',
            assistantBridge: 'preview',
          }),
        );
        break;
      }
      const updated = applyAssistantBridge(workspaceInfo.appRoot, detected);
      if (updated.length === 0) {
        console.log(dim('Assistant bridge rule files are already up to date.'));
      } else {
        console.log(success(`Applied Decantr assistant bridge to ${updated.join(', ')}.`));
      }
      break;
    }

    case 'magic': {
      const { flags, positional } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['dry-run', 'offline', 'registry', 'project'], 'magic')) {
        break;
      }
      const workspaceInfo = flagString(flags, 'project')
        ? resolveWorkflowProject(flags, 'magic')
        : null;
      if (flagString(flags, 'project') && !workspaceInfo) break;
      const projectArg = flagString(flags, 'project');
      const magicPrompt = positional.join(' ').trim();
      if (!magicPrompt) {
        console.error(
          error('Usage: decantr magic <prompt> [--dry-run] [--offline] [--project <path>]'),
        );
        console.error('');
        console.error('  Example:');
        console.error(
          `    ${CYAN}decantr magic "AI agent dashboard — dark, neon, confident"${RESET}`,
        );
        process.exitCode = 1;
        break;
      }
      await cmdMagic(magicPrompt, workspaceInfo?.appRoot ?? process.cwd(), {
        dryRun: flagBoolean(flags, 'dry-run'),
        offline: flagBoolean(flags, 'offline'),
        registry: flagString(flags, 'registry'),
        projectLabel: projectArg,
      });
      break;
    }

    case 'export': {
      const { flags } = parseLooseArgs(args);
      if (!ensureAllowedFlags(flags, ['to', 'output', 'project'], 'export')) break;
      const workspaceInfo = flagString(flags, 'project')
        ? resolveWorkflowProject(flags, 'export')
        : null;
      if (flagString(flags, 'project') && !workspaceInfo) break;
      const exportTarget = flagString(flags, 'to');
      const exportOutput = flagString(flags, 'output');
      const validTargets = ['shadcn', 'tailwind', 'css-vars', 'figma-tokens'];
      if (!exportTarget || !validTargets.includes(exportTarget)) {
        console.error(error(`Usage: decantr export --to <${validTargets.join('|')}>`));
        process.exitCode = 1;
        break;
      }
      await cmdExport(exportTarget as ExportTarget, workspaceInfo?.appRoot ?? process.cwd(), {
        output: exportOutput,
      });
      break;
    }

    default:
      console.error(error(`Unknown command: ${command}`));
      cmdHelp();
      process.exitCode = 1;
  }
}

const cliStartedAt = Date.now();
const cliArgs = process.argv.slice(2);

main()
  .then(async () => {
    await sendCliCommandTelemetry({
      args: cliArgs,
      durationMs: Date.now() - cliStartedAt,
      projectRoot: process.cwd(),
      success: !process.exitCode || process.exitCode === 0,
    });
  })
  .catch(async (e) => {
    console.error(error((e as Error).message));
    if ((e as Error).stack) console.error((e as Error).stack);
    process.exitCode = 1;
    await sendCliCommandTelemetry({
      args: cliArgs,
      durationMs: Date.now() - cliStartedAt,
      projectRoot: process.cwd(),
      success: false,
    });
  });
