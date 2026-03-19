#!/usr/bin/env node
/**
 * Decantr Registry MCP Server
 *
 * Provides Claude Code tools for:
 * - Searching patterns
 * - Getting archetypes
 * - Validating essence files
 * - Listing components
 * - Getting recipes
 *
 * Reads from local src/registry/ directory for development,
 * or can connect to remote registry server via REGISTRY_URL env var.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = join(__dirname, "..", "src", "registry");

// Tool definitions
const TOOLS = [
  {
    name: "search_patterns",
    description: "Search for UI patterns by name, description, or layout type. Returns matching patterns with their presets.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query (pattern name or description keywords)"
        },
        layout: {
          type: "string",
          enum: ["hero", "row", "contained", "grid"],
          description: "Filter by layout type"
        }
      },
      required: ["query"]
    }
  },
  {
    name: "get_archetype",
    description: "Get full archetype JSON by name. Archetypes define domain-specific page structures and default blends.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Archetype name (e.g., 'saas-dashboard', 'portfolio', 'ecommerce-admin')"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "validate_essence",
    description: "Validate a decantr.essence.json file against schema. Returns errors and warnings.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Path to the essence file to validate"
        }
      },
      required: ["path"]
    }
  },
  {
    name: "list_components",
    description: "List available Decantr components, optionally filtered by category.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          enum: ["form", "display", "layout", "overlay", "feedback", "navigation", "data"],
          description: "Filter by component category"
        }
      }
    }
  },
  {
    name: "get_recipe",
    description: "Get full recipe JSON by name. Recipes define visual language including spatial hints, pattern preferences, and decorations.",
    inputSchema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Recipe name (e.g., 'auradecantism', 'clean', 'gaming-guild')"
        }
      },
      required: ["name"]
    }
  },
  {
    name: "list_archetypes",
    description: "List all available archetypes with their descriptions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "list_recipes",
    description: "List all available recipes with their descriptions.",
    inputSchema: {
      type: "object",
      properties: {}
    }
  }
];

// Helper: Read JSON file safely
function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    return null;
  }
}

// Tool implementations
function searchPatterns({ query, layout }) {
  const patternsDir = join(REGISTRY_PATH, "patterns");
  const indexPath = join(patternsDir, "index.json");

  if (!existsSync(indexPath)) {
    return { error: "Pattern index not found" };
  }

  const index = readJson(indexPath);
  if (!index?.patterns) {
    return { error: "Invalid pattern index" };
  }

  const queryLower = query.toLowerCase();
  const results = [];

  for (const pattern of index.patterns) {
    const nameMatch = pattern.id?.toLowerCase().includes(queryLower);
    const descMatch = pattern.description?.toLowerCase().includes(queryLower);
    const layoutMatch = !layout || pattern.layout === layout;

    if ((nameMatch || descMatch) && layoutMatch) {
      // Load full pattern for presets
      const patternPath = join(patternsDir, `${pattern.id}.json`);
      const fullPattern = existsSync(patternPath) ? readJson(patternPath) : null;

      results.push({
        id: pattern.id,
        name: pattern.name || pattern.id,
        description: pattern.description,
        layout: pattern.layout,
        presets: fullPattern?.presets ? Object.keys(fullPattern.presets) : [],
        default_preset: fullPattern?.default_preset
      });
    }
  }

  return { results, total: results.length };
}

function getArchetype({ name }) {
  const archetypePath = join(REGISTRY_PATH, "archetypes", `${name}.json`);

  if (!existsSync(archetypePath)) {
    // Check index for available archetypes
    const indexPath = join(REGISTRY_PATH, "archetypes", "index.json");
    const index = existsSync(indexPath) ? readJson(indexPath) : null;
    const available = index?.archetypes?.map(a => a.id) || [];

    return {
      error: `Archetype '${name}' not found`,
      available
    };
  }

  return readJson(archetypePath);
}

function validateEssence({ path }) {
  if (!existsSync(path)) {
    return { valid: false, errors: [`File not found: ${path}`], warnings: [] };
  }

  const essence = readJson(path);
  if (!essence) {
    return { valid: false, errors: ["Invalid JSON"], warnings: [] };
  }

  const errors = [];
  const warnings = [];

  // Required fields
  if (!essence.version) warnings.push("Missing 'version' field");
  if (!essence.terroir && !essence.sections) errors.push("Missing 'terroir' (simple) or 'sections' (sectioned)");
  if (!essence.vintage && !essence.sections) errors.push("Missing 'vintage' field");
  if (!essence.structure && !essence.sections) errors.push("Missing 'structure' array");

  // Validate terroir exists
  if (essence.terroir) {
    const archetypePath = join(REGISTRY_PATH, "archetypes", `${essence.terroir}.json`);
    if (!existsSync(archetypePath)) {
      errors.push(`Unknown terroir: '${essence.terroir}'`);
    }
  }

  // Validate recipe exists
  if (essence.vintage?.recipe) {
    const recipePath = join(REGISTRY_PATH, `recipe-${essence.vintage.recipe}.json`);
    if (!existsSync(recipePath)) {
      errors.push(`Unknown recipe: '${essence.vintage.recipe}'`);
    }
  }

  // Validate patterns in blends
  if (essence.structure) {
    for (const page of essence.structure) {
      if (!page.id) errors.push("Page missing 'id' field");
      if (page.blend) {
        for (const item of page.blend) {
          const patternId = typeof item === "string" ? item : item.pattern;
          if (patternId && !patternId.startsWith("local:")) {
            const patternPath = join(REGISTRY_PATH, "patterns", `${patternId}.json`);
            if (!existsSync(patternPath)) {
              warnings.push(`Unknown pattern in ${page.id}: '${patternId}'`);
            }
          }
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    essence: errors.length === 0 ? essence : undefined
  };
}

function listComponents({ category }) {
  const componentsPath = join(REGISTRY_PATH, "components.json");

  if (!existsSync(componentsPath)) {
    return { error: "Components registry not found" };
  }

  const registry = readJson(componentsPath);
  if (!registry?.components) {
    return { error: "Invalid components registry" };
  }

  const components = [];

  for (const [name, def] of Object.entries(registry.components)) {
    if (!category || def.category === category) {
      components.push({
        name,
        category: def.category,
        description: def.description,
        props: def.props ? Object.keys(def.props) : []
      });
    }
  }

  return {
    components,
    total: components.length,
    categories: [...new Set(Object.values(registry.components).map(c => c.category))]
  };
}

function getRecipe({ name }) {
  const recipePath = join(REGISTRY_PATH, `recipe-${name}.json`);

  if (!existsSync(recipePath)) {
    // List available recipes
    const available = readdirSync(REGISTRY_PATH)
      .filter(f => f.startsWith("recipe-") && f.endsWith(".json"))
      .map(f => f.replace("recipe-", "").replace(".json", ""));

    return {
      error: `Recipe '${name}' not found`,
      available
    };
  }

  return readJson(recipePath);
}

function listArchetypes() {
  const indexPath = join(REGISTRY_PATH, "archetypes", "index.json");

  if (!existsSync(indexPath)) {
    return { error: "Archetypes index not found" };
  }

  const index = readJson(indexPath);
  return {
    archetypes: index?.archetypes || [],
    total: index?.archetypes?.length || 0
  };
}

function listRecipes() {
  const recipes = readdirSync(REGISTRY_PATH)
    .filter(f => f.startsWith("recipe-") && f.endsWith(".json"))
    .map(f => {
      const name = f.replace("recipe-", "").replace(".json", "");
      const recipe = readJson(join(REGISTRY_PATH, f));
      return {
        name,
        style: recipe?.style,
        description: recipe?.description
      };
    });

  return { recipes, total: recipes.length };
}

// Main server setup
async function main() {
  const server = new Server(
    {
      name: "decantr-registry",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      let result;

      switch (name) {
        case "search_patterns":
          result = searchPatterns(args);
          break;
        case "get_archetype":
          result = getArchetype(args);
          break;
        case "validate_essence":
          result = validateEssence(args);
          break;
        case "list_components":
          result = listComponents(args);
          break;
        case "get_recipe":
          result = getRecipe(args);
          break;
        case "list_archetypes":
          result = listArchetypes();
          break;
        case "list_recipes":
          result = listRecipes();
          break;
        default:
          throw new Error(`Unknown tool: ${name}`);
      }

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Decantr Registry MCP Server running on stdio");
}

main().catch(console.error);
