import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, join } from 'node:path';
import type {
  ApiContentType,
  ContentHealthFinding,
  ContentHealthFindingSource,
  ContentHealthReport,
  ContentHealthStatus,
  ContentHealthTypeSummary,
  ContentType,
  VerificationSeverity,
} from '@decantr/content';
import type { ErrorObject, ValidateFunction } from 'ajv';
import Ajv2020 from 'ajv/dist/2020.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';

const CONTENT_HEALTH_SCHEMA_URL = 'https://decantr.ai/schemas/content-health-report.v1.json';
const DEFAULT_IGNORED_LOCAL_PREFIXES = ['recipefork'];

export type ContentHealthOutputFormat = 'text' | 'json' | 'markdown';
export type ContentHealthFailOn = 'error' | 'warn' | 'none';

export interface ContentHealthCommandOptions {
  format?: ContentHealthOutputFormat;
  json?: boolean;
  markdown?: boolean;
  output?: string;
  ci?: boolean;
  failOn?: ContentHealthFailOn;
  promptId?: string;
  includeIgnored?: boolean;
}

interface ContentDirectoryConfig {
  type: ContentType;
  directory: ApiContentType;
  schemaSpecifier: string;
  expectedSchema: string;
}

interface LoadedContentItem {
  type: ContentType;
  directory: ApiContentType;
  file: string;
  id: string;
  data: Record<string, unknown>;
}

const CONTENT_DIRECTORIES: ContentDirectoryConfig[] = [
  {
    type: 'pattern',
    directory: 'patterns',
    schemaSpecifier: '@decantr/content/schema/pattern.v2.json',
    expectedSchema: 'https://decantr.ai/schemas/pattern.v2.json',
  },
  {
    type: 'theme',
    directory: 'themes',
    schemaSpecifier: '@decantr/content/schema/theme.v1.json',
    expectedSchema: 'https://decantr.ai/schemas/theme.v1.json',
  },
  {
    type: 'blueprint',
    directory: 'blueprints',
    schemaSpecifier: '@decantr/content/schema/blueprint.v1.json',
    expectedSchema: 'https://decantr.ai/schemas/blueprint.v1.json',
  },
  {
    type: 'archetype',
    directory: 'archetypes',
    schemaSpecifier: '@decantr/content/schema/archetype.v2.json',
    expectedSchema: 'https://decantr.ai/schemas/archetype.v2.json',
  },
  {
    type: 'shell',
    directory: 'shells',
    schemaSpecifier: '@decantr/content/schema/shell.v1.json',
    expectedSchema: 'https://decantr.ai/schemas/shell.v1.json',
  },
];

const TYPE_DIRECTORY = Object.fromEntries(
  CONTENT_DIRECTORIES.map((entry) => [entry.type, entry.directory]),
) as Record<ContentType, ApiContentType>;

const require = createRequire(import.meta.url);

function loadJsonSchema(specifier: string): Record<string, unknown> {
  return JSON.parse(readFileSync(require.resolve(specifier), 'utf-8')) as Record<string, unknown>;
}

function createValidators(): Record<ContentType, ValidateFunction<unknown>> {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });
  ajv.addSchema(loadJsonSchema('@decantr/content/schema/common.v1.json'));

  return Object.fromEntries(
    CONTENT_DIRECTORIES.map((entry) => [
      entry.type,
      ajv.compile(loadJsonSchema(entry.schemaSpecifier)),
    ]),
  ) as Record<ContentType, ValidateFunction<unknown>>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => isNonEmptyString(entry))
    : [];
}

function formatSchemaError(error: ErrorObject): string {
  const instancePath = error.instancePath || '/';
  return `${instancePath} ${error.message}`.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isIgnoredLocalContentFile(fileName: string): boolean {
  return DEFAULT_IGNORED_LOCAL_PREFIXES.some((prefix) => fileName.startsWith(prefix));
}

function commandsForFinding(source: ContentHealthFindingSource): string[] {
  switch (source) {
    case 'schema':
      return ['npm run validate', 'decantr content-health'];
    case 'reference':
      return ['decantr content-health', 'npm run validate'];
    case 'quality':
    case 'coverage':
      return ['decantr content-health --markdown --output content-health.md'];
    default:
      return ['decantr content-health'];
  }
}

function buildRemediationPrompt(input: {
  id: string;
  source: ContentHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence: string[];
  file?: string;
  type?: ContentType;
  itemId?: string;
  suggestedFix?: string;
  commands: string[];
}): string {
  return [
    'You are fixing one Decantr Content Health finding in the official content corpus.',
    '',
    'Read the referenced JSON content file and the matching Decantr schema before editing. Preserve the item id, published intent, and content type unless the finding explicitly says the id or type is wrong.',
    '',
    `Finding: ${input.id}`,
    `Source: ${input.source}`,
    `Severity: ${input.severity}`,
    `Category: ${input.category}`,
    input.type ? `Content type: ${input.type}` : null,
    input.itemId ? `Item id: ${input.itemId}` : null,
    input.file ? `File: ${input.file}` : null,
    `Message: ${input.message}`,
    input.evidence.length > 0
      ? `Evidence:\n${input.evidence.map((entry) => `- ${entry}`).join('\n')}`
      : null,
    input.suggestedFix ? `Suggested fix: ${input.suggestedFix}` : null,
    '',
    'Make the smallest coherent content change that resolves this finding. Do not add new source-code runtime dependencies for content-only fixes.',
    '',
    `After the fix, run:\n${input.commands.map((command) => `- ${command}`).join('\n')}`,
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

function createContentFinding(input: {
  source: ContentHealthFindingSource;
  category: string;
  severity: VerificationSeverity;
  message: string;
  evidence?: string[];
  file?: string;
  type?: ContentType;
  itemId?: string;
  rule?: string;
  suggestedFix?: string;
  baseId?: string;
}): ContentHealthFinding {
  const idBase =
    input.baseId || input.rule || `${input.category}-${input.file ?? ''}-${input.message}`;
  const id = `${input.source}-${slugify(idBase)}`;
  const commands = commandsForFinding(input.source);
  const remediation = {
    summary: input.suggestedFix || `Resolve ${input.category.toLowerCase()} finding.`,
    commands,
    prompt: buildRemediationPrompt({
      id,
      source: input.source,
      category: input.category,
      severity: input.severity,
      message: input.message,
      evidence: input.evidence ?? [],
      file: input.file,
      type: input.type,
      itemId: input.itemId,
      suggestedFix: input.suggestedFix,
      commands,
    }),
  };

  return {
    id,
    source: input.source,
    category: input.category,
    severity: input.severity,
    message: input.message,
    evidence: input.evidence ?? [],
    file: input.file,
    type: input.type,
    itemId: input.itemId,
    rule: input.rule,
    suggestedFix: input.suggestedFix,
    remediation,
  };
}

function countFindings(findings: ContentHealthFinding[]) {
  return {
    errorCount: findings.filter((finding) => finding.severity === 'error').length,
    warnCount: findings.filter((finding) => finding.severity === 'warn').length,
    infoCount: findings.filter((finding) => finding.severity === 'info').length,
  };
}

function statusFromCounts(counts: { errorCount: number; warnCount: number }): ContentHealthStatus {
  if (counts.errorCount > 0) return 'error';
  if (counts.warnCount > 0) return 'warning';
  return 'healthy';
}

function scoreFromCounts(counts: {
  errorCount: number;
  warnCount: number;
  infoCount: number;
}): number {
  const warningPenalty = Math.min(counts.warnCount * 2, 75);
  const infoPenalty = Math.min(counts.infoCount * 0.5, 10);
  return Math.round(
    Math.max(0, Math.min(100, 100 - counts.errorCount * 15 - warningPenalty - infoPenalty)),
  );
}

function percentage(count: number, total: number): number {
  if (total === 0) return 1;
  return Math.round((count / total) * 1000) / 1000;
}

function patternIdsFromReference(value: unknown): string[] {
  if (isNonEmptyString(value)) return [value];
  if (!isRecord(value)) return [];
  if (isNonEmptyString(value.pattern)) return [value.pattern];
  if (Array.isArray(value.cols)) {
    return value.cols.flatMap((item) => patternIdsFromReference(item));
  }
  return [];
}

function collectDependencyReferences(data: Record<string, unknown>): Array<{
  referencedType: ContentType;
  id: string;
  rule: string;
  suggestedFix: string;
}> {
  if (!isRecord(data.dependencies)) return [];

  const map: Partial<Record<string, ContentType>> = {
    patterns: 'pattern',
    themes: 'theme',
    blueprints: 'blueprint',
    archetypes: 'archetype',
    shells: 'shell',
  };
  const refs: Array<{
    referencedType: ContentType;
    id: string;
    rule: string;
    suggestedFix: string;
  }> = [];

  for (const [group, values] of Object.entries(data.dependencies)) {
    const referencedType = map[group];
    if (!referencedType || !isRecord(values)) continue;
    for (const id of Object.keys(values)) {
      refs.push({
        referencedType,
        id,
        rule: `dependency-${referencedType}`,
        suggestedFix: `Add ${referencedType} "${id}" or remove the stale dependency reference.`,
      });
    }
  }

  return refs;
}

function collectBlueprintReferences(item: LoadedContentItem): Array<{
  referencedType: ContentType;
  id: string;
  rule: string;
  severity: VerificationSeverity;
  suggestedFix: string;
}> {
  const refs: Array<{
    referencedType: ContentType;
    id: string;
    rule: string;
    severity: VerificationSeverity;
    suggestedFix: string;
  }> = [];
  const data = item.data;

  if (isRecord(data.theme) && isNonEmptyString(data.theme.id)) {
    refs.push({
      referencedType: 'theme',
      id: data.theme.id,
      rule: 'blueprint-theme',
      severity: 'error',
      suggestedFix: `Add theme "${data.theme.id}" or choose an existing theme id.`,
    });
  }

  if (isNonEmptyString(data.archetype)) {
    refs.push({
      referencedType: 'archetype',
      id: data.archetype,
      rule: 'blueprint-archetype',
      severity: 'error',
      suggestedFix: `Add archetype "${data.archetype}" or update the blueprint archetype field.`,
    });
  }

  for (const entry of Array.isArray(data.compose) ? data.compose : []) {
    const archetype = isNonEmptyString(entry)
      ? entry
      : isRecord(entry) && isNonEmptyString(entry.archetype)
        ? entry.archetype
        : null;
    if (archetype) {
      refs.push({
        referencedType: 'archetype',
        id: archetype,
        rule: 'blueprint-compose-archetype',
        severity: 'error',
        suggestedFix: `Add archetype "${archetype}" or remove it from blueprint compose.`,
      });
    }
  }

  for (const theme of toStringArray(data.suggested_themes)) {
    refs.push({
      referencedType: 'theme',
      id: theme,
      rule: 'blueprint-suggested-theme',
      severity: 'warn',
      suggestedFix: `Add suggested theme "${theme}" or remove it from suggested_themes.`,
    });
  }

  if (isRecord(data.routes)) {
    for (const [route, routeConfig] of Object.entries(data.routes)) {
      if (!isRecord(routeConfig)) continue;
      if (isNonEmptyString(routeConfig.archetype)) {
        refs.push({
          referencedType: 'archetype',
          id: routeConfig.archetype,
          rule: 'blueprint-route-archetype',
          severity: 'error',
          suggestedFix: `Add archetype "${routeConfig.archetype}" or update route "${route}".`,
        });
      }
      if (isNonEmptyString(routeConfig.shell)) {
        refs.push({
          referencedType: 'shell',
          id: routeConfig.shell,
          rule: 'blueprint-route-shell',
          severity: 'error',
          suggestedFix: `Add shell "${routeConfig.shell}" or update route "${route}".`,
        });
      }
    }
  }

  for (const dependency of collectDependencyReferences(data)) {
    refs.push({
      ...dependency,
      severity: 'error',
    });
  }

  return refs;
}

function collectArchetypeReferences(item: LoadedContentItem): Array<{
  referencedType: ContentType;
  id: string;
  rule: string;
  severity: VerificationSeverity;
  suggestedFix: string;
}> {
  const refs: Array<{
    referencedType: ContentType;
    id: string;
    rule: string;
    severity: VerificationSeverity;
    suggestedFix: string;
  }> = [];
  const data = item.data;

  if (Array.isArray(data.pages)) {
    for (const page of data.pages) {
      if (!isRecord(page)) continue;
      if (isNonEmptyString(page.shell) && page.shell !== 'inherit') {
        refs.push({
          referencedType: 'shell',
          id: page.shell,
          rule: 'archetype-page-shell',
          severity: 'error',
          suggestedFix: `Add shell "${page.shell}" or update the page shell reference.`,
        });
      }
      for (const patternId of Array.isArray(page.default_layout)
        ? page.default_layout.flatMap((entry) => patternIdsFromReference(entry))
        : []) {
        refs.push({
          referencedType: 'pattern',
          id: patternId,
          rule: 'archetype-page-layout-pattern',
          severity: 'warn',
          suggestedFix: `Add pattern "${patternId}" for stronger generation guidance or update the page default_layout reference to an existing pattern.`,
        });
      }
      for (const patternId of Array.isArray(page.patterns)
        ? page.patterns.flatMap((entry) => patternIdsFromReference(entry))
        : []) {
        refs.push({
          referencedType: 'pattern',
          id: patternId,
          rule: 'archetype-page-pattern',
          severity: 'warn',
          suggestedFix: `Add pattern "${patternId}" for stronger generation guidance or update the page patterns reference to an existing pattern.`,
        });
      }
    }
  }

  if (isRecord(data.suggested_theme)) {
    for (const theme of toStringArray(data.suggested_theme.ids)) {
      refs.push({
        referencedType: 'theme',
        id: theme,
        rule: 'archetype-suggested-theme',
        severity: 'warn',
        suggestedFix: `Add suggested theme "${theme}" or remove it from suggested_theme.ids.`,
      });
    }
  }

  for (const dependency of collectDependencyReferences(data)) {
    refs.push({
      ...dependency,
      severity: 'error',
    });
  }

  return refs;
}

function collectItemReferences(item: LoadedContentItem): Array<{
  referencedType: ContentType;
  id: string;
  rule: string;
  severity: VerificationSeverity;
  suggestedFix: string;
}> {
  if (item.type === 'blueprint') return collectBlueprintReferences(item);
  if (item.type === 'archetype') return collectArchetypeReferences(item);
  return collectDependencyReferences(item.data).map((dependency) => ({
    ...dependency,
    severity: 'error' as const,
  }));
}

function addQualityFindings(item: LoadedContentItem, findings: ContentHealthFinding[]): void {
  const { data, file, type, id } = item;

  if (type === 'pattern') {
    if (!data.visual_brief && !data.layout_hints) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Pattern Guidance',
          severity: 'warn',
          message: 'Pattern is missing both visual_brief and layout_hints.',
          evidence: ['AI scaffolds rely on visual guidance to avoid generic layouts.'],
          file,
          type,
          itemId: id,
          rule: 'pattern-guidance-missing',
          suggestedFix:
            'Add a visual_brief or layout_hints that describes the intended composition.',
          baseId: `${file}-pattern-guidance-missing`,
        }),
      );
    }
    if (!Array.isArray(data.components) || data.components.length === 0) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Pattern Components',
          severity: 'warn',
          message: 'Pattern has no component inventory.',
          evidence: ['components[] is empty or missing.'],
          file,
          type,
          itemId: id,
          rule: 'pattern-components-missing',
          suggestedFix: 'Add a compact components array naming the expected UI building blocks.',
          baseId: `${file}-pattern-components-missing`,
        }),
      );
    }
    if (isRecord(data.presets)) {
      for (const [presetName, preset] of Object.entries(data.presets)) {
        if (
          isRecord(preset) &&
          isNonEmptyString(preset.description) &&
          preset.description.length < 30
        ) {
          findings.push(
            createContentFinding({
              source: 'quality',
              category: 'Preset Guidance',
              severity: 'warn',
              message: `Preset "${presetName}" description is too short to guide generation.`,
              evidence: [`Description length: ${preset.description.length}`],
              file,
              type,
              itemId: id,
              rule: 'preset-description-short',
              suggestedFix: 'Expand the preset description with layout, density, and usage intent.',
              baseId: `${file}-${presetName}-preset-description-short`,
            }),
          );
        }
      }
    }
  }

  if (type === 'theme') {
    const paletteSize = isRecord(data.palette) ? Object.keys(data.palette).length : 0;
    if (paletteSize > 0 && paletteSize < 5) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Theme Palette',
          severity: 'warn',
          message: 'Theme palette has fewer than five semantic colors.',
          evidence: [`Palette entries: ${paletteSize}`],
          file,
          type,
          itemId: id,
          rule: 'theme-palette-shallow',
          suggestedFix:
            'Add semantic palette entries for background, surface, text, muted text, and accent roles.',
          baseId: `${file}-theme-palette-shallow`,
        }),
      );
    }
    if (!isRecord(data.decorators) || Object.keys(data.decorators).length === 0) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Theme Decorators',
          severity: 'warn',
          message: 'Theme has no decorator definitions.',
          evidence: ['decorators is missing or empty.'],
          file,
          type,
          itemId: id,
          rule: 'theme-decorators-missing',
          suggestedFix:
            'Add theme-specific decorator classes that can be rendered into DECANTR.md and section packs.',
          baseId: `${file}-theme-decorators-missing`,
        }),
      );
    } else {
      for (const [decorator, description] of Object.entries(data.decorators)) {
        if (typeof description === 'string' && description.length < 20) {
          findings.push(
            createContentFinding({
              source: 'quality',
              category: 'Theme Decorators',
              severity: 'warn',
              message: `Decorator "${decorator}" description is too short.`,
              evidence: [`Description length: ${description.length}`],
              file,
              type,
              itemId: id,
              rule: 'theme-decorator-description-short',
              suggestedFix: 'Describe where and how this decorator should be applied.',
              baseId: `${file}-${decorator}-theme-decorator-description-short`,
            }),
          );
        }
      }
    }
  }

  if (type === 'blueprint') {
    const personality = data.personality;
    const personalityMissing =
      personality === undefined ||
      personality === null ||
      (Array.isArray(personality) && personality.length === 0) ||
      (typeof personality === 'string' && personality.trim().length === 0);
    if (personalityMissing) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Blueprint Personality',
          severity: 'warn',
          message: 'Blueprint is missing personality guidance.',
          evidence: ['personality is missing or empty.'],
          file,
          type,
          itemId: id,
          rule: 'blueprint-personality-missing',
          suggestedFix: 'Add a concise but specific personality string or trait array.',
          baseId: `${file}-blueprint-personality-missing`,
        }),
      );
    } else if (typeof personality === 'string' && personality.length < 100) {
      findings.push(
        createContentFinding({
          source: 'quality',
          category: 'Blueprint Personality',
          severity: 'warn',
          message: 'Blueprint personality is shorter than 100 characters.',
          evidence: [`Length: ${personality.length}`],
          file,
          type,
          itemId: id,
          rule: 'blueprint-personality-short',
          suggestedFix:
            'Expand personality with visual direction, tone, density, and interaction posture.',
          baseId: `${file}-blueprint-personality-short`,
        }),
      );
    }

    if (!isRecord(data.voice)) {
      findings.push(
        createContentFinding({
          source: 'coverage',
          category: 'Blueprint Voice',
          severity: 'info',
          message: 'Blueprint has no voice guidance.',
          evidence: ['voice is missing.'],
          file,
          type,
          itemId: id,
          rule: 'blueprint-voice-missing',
          suggestedFix:
            'Add voice.tone, cta_verbs, avoid words, and state copy guidance when this blueprint needs product copy consistency.',
          baseId: `${file}-blueprint-voice-missing`,
        }),
      );
    }
  }

  if (type === 'archetype' && !isRecord(data.page_briefs)) {
    findings.push(
      createContentFinding({
        source: 'coverage',
        category: 'Archetype Page Briefs',
        severity: 'info',
        message: 'Archetype has no page_briefs.',
        evidence: ['page_briefs is missing.'],
        file,
        type,
        itemId: id,
        rule: 'archetype-page-briefs-missing',
        suggestedFix:
          'Add page_briefs when route-level visual direction should be more specific than page names.',
        baseId: `${file}-archetype-page-briefs-missing`,
      }),
    );
  }
}

function typeSummary(
  config: ContentDirectoryConfig,
  items: LoadedContentItem[],
  findings: ContentHealthFinding[],
  invalidFiles: Set<string>,
  ignoredCount: number,
): ContentHealthTypeSummary {
  const typeFindings = findings.filter((finding) => finding.type === config.type);
  return {
    type: config.type,
    directory: config.directory,
    itemCount: items.length,
    validCount: items.filter((item) => !invalidFiles.has(item.file)).length,
    ...countFindings(typeFindings),
    ignoredCount,
  };
}

function missingByTypeInitial(): Record<ContentType, number> {
  return {
    pattern: 0,
    theme: 0,
    blueprint: 0,
    archetype: 0,
    shell: 0,
  };
}

export async function createContentHealthReport(
  contentRoot: string = process.cwd(),
  options: Pick<ContentHealthCommandOptions, 'includeIgnored'> = {},
): Promise<ContentHealthReport> {
  const validators = createValidators();
  const findings: ContentHealthFinding[] = [];
  const invalidFiles = new Set<string>();
  const allItems: LoadedContentItem[] = [];
  const itemsByType = new Map<ContentType, Map<string, LoadedContentItem>>();
  const ignoredCounts = new Map<ContentType, number>();
  let contentDirectoryCount = 0;

  for (const config of CONTENT_DIRECTORIES) {
    const directoryPath = join(contentRoot, config.directory);
    const typeItems = new Map<string, LoadedContentItem>();
    itemsByType.set(config.type, typeItems);
    ignoredCounts.set(config.type, 0);

    if (!existsSync(directoryPath)) {
      findings.push(
        createContentFinding({
          source: 'content',
          category: 'Content Directory',
          severity: 'warn',
          message: `Missing ${config.directory}/ directory.`,
          evidence: [`Expected ${config.directory}/ under the content root.`],
          type: config.type,
          rule: 'content-directory-missing',
          suggestedFix: `Create ${config.directory}/ when this repository is expected to publish ${config.type} content.`,
          baseId: `${config.directory}-content-directory-missing`,
        }),
      );
      continue;
    }

    contentDirectoryCount += 1;
    const files = readdirSync(directoryPath)
      .filter((file) => file.endsWith('.json'))
      .sort();

    for (const fileName of files) {
      if (!options.includeIgnored && isIgnoredLocalContentFile(fileName)) {
        ignoredCounts.set(config.type, (ignoredCounts.get(config.type) ?? 0) + 1);
        continue;
      }

      const relativeFile = `${config.directory}/${fileName}`;
      const expectedId = basename(fileName, '.json');
      let data: unknown;

      try {
        data = JSON.parse(readFileSync(join(contentRoot, relativeFile), 'utf-8'));
      } catch (e) {
        invalidFiles.add(relativeFile);
        findings.push(
          createContentFinding({
            source: 'schema',
            category: 'JSON Parse',
            severity: 'error',
            message: `Invalid JSON: ${(e as Error).message}`,
            evidence: [`File: ${relativeFile}`],
            file: relativeFile,
            type: config.type,
            itemId: expectedId,
            rule: 'json-invalid',
            suggestedFix: 'Repair the JSON syntax.',
            baseId: `${relativeFile}-json-invalid`,
          }),
        );
        continue;
      }

      if (!isRecord(data)) {
        invalidFiles.add(relativeFile);
        findings.push(
          createContentFinding({
            source: 'schema',
            category: 'Content Shape',
            severity: 'error',
            message: 'Content item must be a JSON object.',
            evidence: [`File: ${relativeFile}`],
            file: relativeFile,
            type: config.type,
            itemId: expectedId,
            rule: 'content-object-required',
            suggestedFix: 'Replace the file with a JSON object matching the content schema.',
            baseId: `${relativeFile}-content-object-required`,
          }),
        );
        continue;
      }

      const id = isNonEmptyString(data.id)
        ? data.id
        : isNonEmptyString(data.slug)
          ? data.slug
          : expectedId;
      const item: LoadedContentItem = {
        type: config.type,
        directory: config.directory,
        file: relativeFile,
        id,
        data,
      };
      allItems.push(item);

      if (typeItems.has(id)) {
        invalidFiles.add(relativeFile);
        findings.push(
          createContentFinding({
            source: 'schema',
            category: 'Duplicate Content ID',
            severity: 'error',
            message: `${config.type} id "${id}" is declared more than once.`,
            evidence: [`Duplicate file: ${relativeFile}`],
            file: relativeFile,
            type: config.type,
            itemId: id,
            rule: 'content-id-duplicate',
            suggestedFix: 'Make ids unique within each content type.',
            baseId: `${relativeFile}-content-id-duplicate`,
          }),
        );
      } else {
        typeItems.set(id, item);
      }

      if (data.$schema !== config.expectedSchema) {
        invalidFiles.add(relativeFile);
        findings.push(
          createContentFinding({
            source: 'schema',
            category: 'Schema URL',
            severity: 'error',
            message: `$schema must be "${config.expectedSchema}".`,
            evidence: [`Found: ${typeof data.$schema === 'string' ? data.$schema : 'missing'}`],
            file: relativeFile,
            type: config.type,
            itemId: id,
            rule: 'schema-url-mismatch',
            suggestedFix: `Set $schema to ${config.expectedSchema}.`,
            baseId: `${relativeFile}-schema-url-mismatch`,
          }),
        );
      }

      if (id !== expectedId) {
        invalidFiles.add(relativeFile);
        findings.push(
          createContentFinding({
            source: 'schema',
            category: 'Content ID',
            severity: 'error',
            message: `id must match filename (${expectedId}).`,
            evidence: [`Found id: ${id}`],
            file: relativeFile,
            type: config.type,
            itemId: id,
            rule: 'content-id-filename-mismatch',
            suggestedFix: `Rename the file or set id to "${expectedId}".`,
            baseId: `${relativeFile}-content-id-filename-mismatch`,
          }),
        );
      }

      const validate = validators[config.type];
      if (!validate(data)) {
        invalidFiles.add(relativeFile);
        for (const schemaError of (validate.errors || []).slice(0, 6)) {
          findings.push(
            createContentFinding({
              source: 'schema',
              category: 'Schema Validation',
              severity: 'error',
              message: `Schema validation failed: ${formatSchemaError(schemaError)}`,
              evidence: [`File: ${relativeFile}`],
              file: relativeFile,
              type: config.type,
              itemId: id,
              rule: 'schema-validation-failed',
              suggestedFix: 'Update the content item to match the published schema.',
              baseId: `${relativeFile}-${formatSchemaError(schemaError)}`,
            }),
          );
        }
      }
    }
  }

  if (contentDirectoryCount === 0 || allItems.length === 0) {
    findings.push(
      createContentFinding({
        source: 'content',
        category: 'Content Root',
        severity: 'error',
        message: 'No Decantr content corpus files were found in this directory.',
        evidence: [
          'Expected one or more of patterns/, themes/, blueprints/, archetypes/, shells/.',
        ],
        rule: 'content-root-empty',
        suggestedFix:
          'Run this command from packages/content or another Decantr content corpus directory.',
        baseId: 'content-root-empty',
      }),
    );
  }

  let referencesChecked = 0;
  const missingByType = missingByTypeInitial();
  const missingReferenceGroups = new Map<
    string,
    {
      item: LoadedContentItem;
      referencedType: ContentType;
      rule: string;
      severity: VerificationSeverity;
      ids: string[];
      suggestedFix: string;
    }
  >();
  for (const item of allItems) {
    for (const reference of collectItemReferences(item)) {
      referencesChecked += 1;
      const referenced = itemsByType.get(reference.referencedType)?.has(reference.id);
      if (referenced) continue;

      missingByType[reference.referencedType] += 1;
      const key = `${item.file}|${reference.rule}|${reference.severity}|${reference.referencedType}`;
      const group = missingReferenceGroups.get(key);
      if (group) {
        group.ids.push(reference.id);
      } else {
        missingReferenceGroups.set(key, {
          item,
          referencedType: reference.referencedType,
          rule: reference.rule,
          severity: reference.severity,
          ids: [reference.id],
          suggestedFix: reference.suggestedFix,
        });
      }
    }
  }

  for (const group of missingReferenceGroups.values()) {
    const missingList = [...new Set(group.ids)].sort();
    const preview = missingList.slice(0, 12);
    findings.push(
      createContentFinding({
        source: 'reference',
        category: 'Missing Reference',
        severity: group.severity,
        message:
          missingList.length === 1
            ? `${group.item.type} "${group.item.id}" references missing ${group.referencedType} "${missingList[0]}".`
            : `${group.item.type} "${group.item.id}" references ${missingList.length} missing ${group.referencedType} items.`,
        evidence: [
          `Reference directory: ${TYPE_DIRECTORY[group.referencedType]}/`,
          `Rule: ${group.rule}`,
          `Missing ${group.referencedType}: ${preview.join(', ')}${missingList.length > preview.length ? `, and ${missingList.length - preview.length} more` : ''}`,
        ],
        file: group.item.file,
        type: group.item.type,
        itemId: group.item.id,
        rule: group.rule,
        suggestedFix:
          missingList.length === 1
            ? group.suggestedFix
            : `Add the missing ${group.referencedType} items or update stale ${group.rule} references.`,
        baseId: `${group.item.file}-${group.rule}-${group.referencedType}-missing`,
      }),
    );
  }

  for (const item of allItems) {
    addQualityFindings(item, findings);
  }

  const byType = CONTENT_DIRECTORIES.map((config) =>
    typeSummary(
      config,
      allItems.filter((item) => item.type === config.type),
      findings,
      invalidFiles,
      ignoredCounts.get(config.type) ?? 0,
    ),
  );
  const counts = countFindings(findings);
  const validCount = allItems.filter((item) => !invalidFiles.has(item.file)).length;
  const ignoredCount = [...ignoredCounts.values()].reduce((sum, count) => sum + count, 0);
  const patterns = allItems.filter((item) => item.type === 'pattern');
  const themes = allItems.filter((item) => item.type === 'theme');
  const blueprints = allItems.filter((item) => item.type === 'blueprint');
  const archetypes = allItems.filter((item) => item.type === 'archetype');

  return {
    $schema: CONTENT_HEALTH_SCHEMA_URL,
    generatedAt: new Date().toISOString(),
    contentRoot,
    status: statusFromCounts(counts),
    score: scoreFromCounts(counts),
    summary: {
      itemCount: allItems.length,
      validCount,
      ...counts,
      findingCount: findings.length,
      ignoredCount,
      contentDirectoryCount,
    },
    content: byType,
    references: {
      checked: referencesChecked,
      missing: Object.values(missingByType).reduce((sum, count) => sum + count, 0),
      missingByType,
    },
    quality: {
      patternVisualBriefCoverage: percentage(
        patterns.filter((item) => item.data.visual_brief || item.data.layout_hints).length,
        patterns.length,
      ),
      patternInteractionCoverage: percentage(
        patterns.filter(
          (item) => Array.isArray(item.data.interactions) && item.data.interactions.length > 0,
        ).length,
        patterns.length,
      ),
      themeDecoratorCoverage: percentage(
        themes.filter(
          (item) => isRecord(item.data.decorators) && Object.keys(item.data.decorators).length > 0,
        ).length,
        themes.length,
      ),
      blueprintPersonalityCoverage: percentage(
        blueprints.filter((item) => {
          const personality = item.data.personality;
          return (
            isNonEmptyString(personality) ||
            (Array.isArray(personality) && personality.some((entry) => isNonEmptyString(entry)))
          );
        }).length,
        blueprints.length,
      ),
      blueprintVoiceCoverage: percentage(
        blueprints.filter((item) => isRecord(item.data.voice)).length,
        blueprints.length,
      ),
      archetypePageBriefCoverage: percentage(
        archetypes.filter((item) => isRecord(item.data.page_briefs)).length,
        archetypes.length,
      ),
    },
    ci: {
      recommendedCommand: 'decantr content-health --ci --fail-on error',
      failOn: 'error',
    },
    findings,
  };
}

function colorForStatus(status: ContentHealthStatus): string {
  if (status === 'healthy') return GREEN;
  if (status === 'warning') return YELLOW;
  return RED;
}

function percentLabel(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatContentHealthText(report: ContentHealthReport): string {
  const color = colorForStatus(report.status);
  const lines = [
    `${BOLD}Decantr Content Health${RESET}`,
    '',
    `${color}${report.status.toUpperCase()}${RESET}  score ${report.score}/100`,
    `${DIM}${report.contentRoot}${RESET}`,
    '',
    `${BOLD}Summary:${RESET}`,
    `  Items: ${report.summary.itemCount} total, ${report.summary.validCount} valid, ${report.summary.ignoredCount} ignored`,
    `  Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`,
    `  References: ${report.references.checked} checked, ${report.references.missing} missing`,
    `  Quality: pattern guidance ${percentLabel(report.quality.patternVisualBriefCoverage)} | theme decorators ${percentLabel(report.quality.themeDecoratorCoverage)} | blueprint voice ${percentLabel(report.quality.blueprintVoiceCoverage)}`,
    '',
    `${BOLD}Content:${RESET}`,
  ];

  for (const entry of report.content) {
    lines.push(
      `  ${entry.directory.padEnd(10)} ${entry.itemCount} item(s), ${entry.validCount} valid, ${entry.errorCount} error(s), ${entry.warnCount} warn(s), ${entry.ignoredCount} ignored`,
    );
  }

  lines.push('');
  lines.push(`${BOLD}Findings:${RESET}`);
  if (report.findings.length === 0) {
    lines.push(`  ${GREEN}No findings. Content supply chain is healthy.${RESET}`);
  } else {
    for (const finding of report.findings.slice(0, 40)) {
      const findingColor =
        finding.severity === 'error' ? RED : finding.severity === 'warn' ? YELLOW : CYAN;
      lines.push(
        `  ${findingColor}[${finding.severity.toUpperCase()}]${RESET} ${finding.id}: ${finding.message}`,
      );
      if (finding.file) lines.push(`    ${DIM}${finding.file}${RESET}`);
      if (finding.suggestedFix) lines.push(`    ${DIM}Fix: ${finding.suggestedFix}${RESET}`);
      lines.push(`    ${DIM}Prompt: decantr content check --prompt ${finding.id}${RESET}`);
    }
    if (report.findings.length > 40) {
      lines.push(
        `  ${DIM}Showing first 40 of ${report.findings.length} findings. Use --json for the full report.${RESET}`,
      );
    }
  }

  lines.push('');
  lines.push(`${BOLD}CI:${RESET} ${report.ci.recommendedCommand}`);
  return `${lines.join('\n')}\n`;
}

export function formatContentHealthMarkdown(report: ContentHealthReport): string {
  const lines = [
    '# Decantr Content Health',
    '',
    `- Status: **${report.status}**`,
    `- Score: **${report.score}/100**`,
    `- Content root: \`${report.contentRoot}\``,
    `- Items: ${report.summary.itemCount} total, ${report.summary.validCount} valid, ${report.summary.ignoredCount} ignored`,
    `- Findings: ${report.summary.errorCount} error(s), ${report.summary.warnCount} warn(s), ${report.summary.infoCount} info`,
    `- References: ${report.references.checked} checked, ${report.references.missing} missing`,
    '',
    '## Content',
    '',
    '| Type | Items | Valid | Errors | Warnings | Info | Ignored |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];

  for (const entry of report.content) {
    lines.push(
      `| ${entry.type} | ${entry.itemCount} | ${entry.validCount} | ${entry.errorCount} | ${entry.warnCount} | ${entry.infoCount} | ${entry.ignoredCount} |`,
    );
  }

  lines.push('');
  lines.push('## Quality Coverage');
  lines.push('');
  lines.push(
    `- Pattern visual guidance: ${percentLabel(report.quality.patternVisualBriefCoverage)}`,
  );
  lines.push(`- Pattern interactions: ${percentLabel(report.quality.patternInteractionCoverage)}`);
  lines.push(`- Theme decorators: ${percentLabel(report.quality.themeDecoratorCoverage)}`);
  lines.push(
    `- Blueprint personality: ${percentLabel(report.quality.blueprintPersonalityCoverage)}`,
  );
  lines.push(`- Blueprint voice: ${percentLabel(report.quality.blueprintVoiceCoverage)}`);
  lines.push(`- Archetype page briefs: ${percentLabel(report.quality.archetypePageBriefCoverage)}`);
  lines.push('');
  lines.push('## Findings');
  lines.push('');

  if (report.findings.length === 0) {
    lines.push('No findings. Content supply chain is healthy.');
  } else {
    for (const finding of report.findings) {
      lines.push(`### ${finding.id}`);
      lines.push('');
      lines.push(`- Severity: ${finding.severity}`);
      lines.push(`- Source: ${finding.source}`);
      lines.push(`- Category: ${finding.category}`);
      if (finding.file) lines.push(`- File: \`${finding.file}\``);
      if (finding.type) lines.push(`- Type: ${finding.type}`);
      if (finding.itemId) lines.push(`- Item: \`${finding.itemId}\``);
      lines.push(`- Message: ${finding.message}`);
      if (finding.suggestedFix) lines.push(`- Fix: ${finding.suggestedFix}`);
      if (finding.evidence.length > 0) {
        lines.push('- Evidence:');
        for (const evidence of finding.evidence) lines.push(`  - ${evidence}`);
      }
      lines.push(`- Prompt: \`decantr content check --prompt ${finding.id}\``);
      lines.push('');
    }
  }

  lines.push('## CI');
  lines.push('');
  lines.push(`\`${report.ci.recommendedCommand}\``);
  return `${lines.join('\n')}\n`;
}

export function formatContentHealthJson(report: ContentHealthReport): string {
  return `${JSON.stringify(report, null, 2)}\n`;
}

function resolveFormat(options: ContentHealthCommandOptions): ContentHealthOutputFormat {
  if (options.json) return 'json';
  if (options.markdown) return 'markdown';
  return options.format ?? 'text';
}

export function shouldFailContentHealth(
  report: ContentHealthReport,
  failOn: ContentHealthFailOn,
): boolean {
  if (failOn === 'none') return false;
  if (failOn === 'warn') return report.summary.errorCount > 0 || report.summary.warnCount > 0;
  return report.summary.errorCount > 0;
}

export async function cmdContentHealth(
  contentRoot: string = process.cwd(),
  options: ContentHealthCommandOptions = {},
): Promise<void> {
  const report = await createContentHealthReport(contentRoot, options);

  if (options.promptId) {
    const finding = report.findings.find((entry) => entry.id === options.promptId);
    if (!finding) {
      console.error(`${RED}No content health finding found for id: ${options.promptId}${RESET}`);
      process.exitCode = 1;
      return;
    }
    console.log(finding.remediation.prompt);
    return;
  }

  const format = resolveFormat(options);
  const payload =
    format === 'json'
      ? formatContentHealthJson(report)
      : format === 'markdown'
        ? formatContentHealthMarkdown(report)
        : formatContentHealthText(report);

  if (options.output) {
    writeFileSync(options.output, payload, 'utf-8');
    if (!options.ci) {
      console.log(`${GREEN}Wrote Decantr content health report:${RESET} ${options.output}`);
    }
  } else {
    process.stdout.write(payload);
  }

  if (options.ci && shouldFailContentHealth(report, options.failOn ?? 'error')) {
    process.exitCode = 1;
  }
}

export function parseContentHealthArgs(args: string[]): ContentHealthCommandOptions {
  const options: ContentHealthCommandOptions = {};

  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--json') {
      options.json = true;
    } else if (arg === '--markdown') {
      options.markdown = true;
    } else if (arg === '--ci') {
      options.ci = true;
    } else if (arg === '--include-ignored') {
      options.includeIgnored = true;
    } else if (arg === '--format' && args[index + 1]) {
      options.format = args[++index] as ContentHealthOutputFormat;
    } else if (arg.startsWith('--format=')) {
      options.format = arg.split('=')[1] as ContentHealthOutputFormat;
    } else if (arg === '--output' && args[index + 1]) {
      options.output = args[++index];
    } else if (arg.startsWith('--output=')) {
      options.output = arg.split('=')[1];
    } else if (arg === '--fail-on' && args[index + 1]) {
      options.failOn = args[++index] as ContentHealthFailOn;
    } else if (arg.startsWith('--fail-on=')) {
      options.failOn = arg.split('=')[1] as ContentHealthFailOn;
    } else if (arg === '--prompt' && args[index + 1]) {
      options.promptId = args[++index];
    } else if (arg.startsWith('--prompt=')) {
      options.promptId = arg.split('=')[1];
    }
  }

  if (options.format && !['text', 'json', 'markdown'].includes(options.format)) {
    throw new Error('Invalid --format value. Use text, json, or markdown.');
  }
  if (options.failOn && !['error', 'warn', 'none'].includes(options.failOn)) {
    throw new Error('Invalid --fail-on value. Use error, warn, or none.');
  }

  return options;
}
