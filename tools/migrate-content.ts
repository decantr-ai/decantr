#!/usr/bin/env npx tsx
/**
 * Content Migration Tool for Decantr v3
 *
 * Normalizes content items (patterns, archetypes, recipes, themes, blueprints, shells)
 * for v3 compatibility. Changes are purely additive — new optional fields and schema
 * normalization. No breaking changes to existing structure.
 *
 * Usage:
 *   npx tsx tools/migrate-content.ts <content-dir>
 *
 * Examples:
 *   npx tsx tools/migrate-content.ts ../decantr-content
 *   npx tsx tools/migrate-content.ts packages/registry/test/fixtures
 *   npx tsx tools/migrate-content.ts packages/cli/src/bundled
 */

import * as fs from "node:fs";
import * as path from "node:path";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ContentType =
  | "archetypes"
  | "blueprints"
  | "themes"
  | "recipes"
  | "patterns"
  | "shells";

interface MigrationResult {
  file: string;
  type: ContentType;
  changes: string[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Discovery
// ---------------------------------------------------------------------------

function discoverContentFiles(
  rootDir: string
): { type: ContentType; filePath: string }[] {
  const contentTypes: ContentType[] = [
    "archetypes",
    "blueprints",
    "themes",
    "recipes",
    "patterns",
    "shells",
  ];
  const results: { type: ContentType; filePath: string }[] = [];

  for (const contentType of contentTypes) {
    const typeDir = path.join(rootDir, contentType);
    if (!fs.existsSync(typeDir)) continue;

    const files = fs.readdirSync(typeDir, { recursive: true });
    for (const file of files) {
      const fileName = String(file);
      if (!fileName.endsWith(".json")) continue;
      results.push({
        type: contentType,
        filePath: path.join(typeDir, fileName),
      });
    }
  }

  // Also check for content nested under core/ (e.g. core/patterns/)
  const coreDir = path.join(rootDir, "core");
  if (fs.existsSync(coreDir)) {
    for (const contentType of contentTypes) {
      const typeDir = path.join(coreDir, contentType);
      if (!fs.existsSync(typeDir)) continue;

      const files = fs.readdirSync(typeDir, { recursive: true });
      for (const file of files) {
        const fileName = String(file);
        if (!fileName.endsWith(".json")) continue;
        results.push({
          type: contentType,
          filePath: path.join(typeDir, fileName),
        });
      }
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Schema URLs
// ---------------------------------------------------------------------------

const SCHEMA_URLS: Record<ContentType, string> = {
  archetypes: "https://decantr.ai/schemas/archetype.v2.json",
  blueprints: "https://decantr.ai/schemas/blueprint.v1.json",
  themes: "https://decantr.ai/schemas/theme.v1.json",
  recipes: "https://decantr.ai/schemas/recipe.v2.json",
  patterns: "https://decantr.ai/schemas/pattern.v2.json",
  shells: "https://decantr.ai/schemas/shell.v1.json",
};

// ---------------------------------------------------------------------------
// Migration rules per content type
// ---------------------------------------------------------------------------

function migrateArchetype(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.archetypes;
    changes.push("added $schema");
  }

  // Add decantr_compat if missing
  if (!data.decantr_compat) {
    data.decantr_compat = ">=0.10.0";
    changes.push("added decantr_compat");
  }

  return { data, changes };
}

function migrateBlueprint(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.blueprints;
    changes.push("added $schema");
  }

  // Normalize suggested_theme -> theme
  if ("suggested_theme" in data && !("theme" in data)) {
    data.theme = data.suggested_theme;
    delete data.suggested_theme;
    changes.push("renamed suggested_theme -> theme");
  }

  // Ensure personality is an array
  if (data.personality && !Array.isArray(data.personality)) {
    const personalityStr = String(data.personality);
    data.personality = personalityStr
      .split(/\s*\+\s*/)
      .map((s: string) => s.trim())
      .filter(Boolean);
    changes.push("converted personality to array");
  }

  // Add decantr_compat if missing
  if (!data.decantr_compat) {
    data.decantr_compat = ">=1.0.0";
    changes.push("added decantr_compat");
  }

  return { data, changes };
}

function migrateTheme(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.themes;
    changes.push("added $schema");
  }

  // Add typography_hints if missing
  if (!data.typography_hints) {
    data.typography_hints = {
      scale: "modular",
      heading_weight: 600,
      body_weight: 400,
    };
    changes.push("added typography_hints");
  }

  // Add motion_hints if missing
  if (!data.motion_hints) {
    data.motion_hints = {
      preference: "subtle",
      reduce_motion_default: true,
    };
    changes.push("added motion_hints");
  }

  return { data, changes };
}

function migrateRecipe(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.recipes;
    changes.push("added $schema");
  }

  // Add radius_hints if missing
  if (!data.radius_hints) {
    data.radius_hints = {
      philosophy: "rounded",
      base: 8,
    };
    changes.push("added radius_hints");
  }

  return { data, changes };
}

function migratePattern(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.patterns;
    changes.push("added $schema");
  }

  return { data, changes };
}

function migrateShell(
  data: Record<string, unknown>
): { data: Record<string, unknown>; changes: string[] } {
  const changes: string[] = [];

  // Add $schema if missing
  if (!data.$schema) {
    data.$schema = SCHEMA_URLS.shells;
    changes.push("added $schema");
  }

  return { data, changes };
}

const MIGRATORS: Record<
  ContentType,
  (
    data: Record<string, unknown>
  ) => { data: Record<string, unknown>; changes: string[] }
> = {
  archetypes: migrateArchetype,
  blueprints: migrateBlueprint,
  themes: migrateTheme,
  recipes: migrateRecipe,
  patterns: migratePattern,
  shells: migrateShell,
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateItem(
  data: Record<string, unknown>,
  type: ContentType
): string[] {
  const errors: string[] = [];

  // Every content item must have an id
  if (!data.id) {
    errors.push("missing required field: id");
  }

  // Every content item should have a name
  if (!data.name) {
    errors.push("missing required field: name");
  }

  // Type-specific validations
  switch (type) {
    case "archetypes":
      if (!data.pages || !Array.isArray(data.pages)) {
        errors.push("archetypes must have a pages array");
      }
      break;

    case "blueprints":
      if (data.personality && !Array.isArray(data.personality)) {
        errors.push("blueprint personality must be an array after migration");
      }
      if ("suggested_theme" in data) {
        errors.push(
          "blueprint still contains suggested_theme (should be theme)"
        );
      }
      break;

    case "themes":
      if (!data.seed && !data.palette) {
        errors.push("themes must have seed or palette");
      }
      break;

    case "recipes":
      if (!data.style) {
        errors.push("recipes must have a style field");
      }
      break;

    case "patterns":
      if (!data.default_layout && !data.presets && !data.layout) {
        errors.push("patterns must have default_layout, presets, or layout");
      }
      break;

    case "shells":
      if (!data.layout && !data.config) {
        errors.push("shells must have layout or config");
      }
      break;
  }

  return errors;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function migrateContentDirectory(rootDir: string): void {
  const resolvedDir = path.resolve(rootDir);

  if (!fs.existsSync(resolvedDir)) {
    console.error(`Error: directory does not exist: ${resolvedDir}`);
    process.exit(1);
  }

  console.log(`\nDecantr Content Migration (v3)\n`);
  console.log(`Source: ${resolvedDir}\n`);

  const files = discoverContentFiles(resolvedDir);

  if (files.length === 0) {
    console.log(
      "No content files found. Expected subdirectories: archetypes/, blueprints/, themes/, recipes/, patterns/, shells/"
    );
    process.exit(0);
  }

  console.log(`Found ${files.length} content file(s)\n`);

  const results: MigrationResult[] = [];
  let totalChanges = 0;
  let totalErrors = 0;

  for (const { type, filePath } of files) {
    const relativePath = path.relative(resolvedDir, filePath);
    const result: MigrationResult = {
      file: relativePath,
      type,
      changes: [],
    };

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      let data: Record<string, unknown>;

      try {
        data = JSON.parse(raw);
      } catch {
        result.error = "invalid JSON";
        results.push(result);
        totalErrors++;
        continue;
      }

      // Run type-specific migration
      const migrator = MIGRATORS[type];
      const { data: migrated, changes } = migrator(data);
      result.changes = changes;

      // Validate post-migration
      const validationErrors = validateItem(migrated, type);
      if (validationErrors.length > 0) {
        result.error = `validation: ${validationErrors.join("; ")}`;
        totalErrors++;
      }

      // Write back if changes were made
      if (changes.length > 0) {
        fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2) + "\n");
        totalChanges += changes.length;
      }
    } catch (err) {
      result.error = `unexpected error: ${err instanceof Error ? err.message : String(err)}`;
      totalErrors++;
    }

    results.push(result);
  }

  // Report
  console.log("Results:\n");

  for (const r of results) {
    const status = r.error ? "WARN" : r.changes.length > 0 ? "MIGRATED" : "OK";
    const icon =
      status === "WARN" ? "!" : status === "MIGRATED" ? "*" : " ";

    console.log(`  [${icon}] ${r.file} (${r.type})`);

    if (r.changes.length > 0) {
      for (const change of r.changes) {
        console.log(`      + ${change}`);
      }
    }

    if (r.error) {
      console.log(`      ! ${r.error}`);
    }
  }

  console.log(`\nSummary:`);
  console.log(`  Files scanned:  ${files.length}`);
  console.log(`  Changes made:   ${totalChanges}`);
  console.log(`  Warnings:       ${totalErrors}`);
  console.log();

  if (totalErrors > 0) {
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: npx tsx tools/migrate-content.ts <content-dir>

Normalizes content items for Decantr v3 compatibility.
Changes are additive only — no existing fields are removed.

Migration rules:
  archetypes   Add $schema, decantr_compat where missing
  blueprints   Normalize suggested_theme -> theme, ensure personality is array, add $schema
  themes       Add typography_hints, motion_hints
  recipes      Add radius_hints
  patterns     Add $schema where missing (no structural changes)
  shells       Add $schema where missing (no structural changes)

Examples:
  npx tsx tools/migrate-content.ts ../decantr-content
  npx tsx tools/migrate-content.ts packages/registry/test/fixtures
  npx tsx tools/migrate-content.ts packages/cli/src/bundled
`);
  process.exit(0);
}

migrateContentDirectory(args[0]);
