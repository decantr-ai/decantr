/**
 * Figma REST API Upload — Push design tokens as Figma Variables.
 * Reads DTCG token files from dist/figma/tokens/ and creates/updates
 * Variable Collections in a Figma file via the Variables REST API.
 *
 * @module figma-upload
 */

import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const API_BASE = 'https://api.figma.com';

// ============================================================
// Figma API Client
// ============================================================

class FigmaClient {
  constructor(token) {
    if (!token) throw new Error('Figma Personal Access Token is required (--token or FIGMA_TOKEN env)');
    this.token = token;
  }

  async request(method, path, body) {
    const url = `${API_BASE}${path}`;
    const opts = {
      method,
      headers: {
        'X-Figma-Token': this.token,
        'Content-Type': 'application/json',
      },
    };
    if (body) opts.body = JSON.stringify(body);

    const res = await fetch(url, opts);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Figma API ${method} ${path} failed (${res.status}): ${text}`);
    }
    return res.json();
  }

  /** Get existing local variables for diffing */
  async getLocalVariables(fileKey) {
    return this.request('GET', `/v1/files/${fileKey}/variables/local`);
  }

  /** Bulk create/update variables and collections */
  async postVariables(fileKey, payload) {
    return this.request('POST', `/v1/files/${fileKey}/variables`, payload);
  }
}

// ============================================================
// DTCG → Figma Variables Conversion
// ============================================================

/**
 * Convert a DTCG token value to a Figma-compatible variable value.
 */
function toFigmaVariableValue(value, type) {
  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) {
    return hexToFigmaRGBA(value);
  }
  if (typeof value === 'number') return value;
  if (type === 'dimension' && typeof value === 'string') {
    if (value.endsWith('rem')) return parseFloat(value) * 16;
    if (value.endsWith('px')) return parseFloat(value);
    if (value.endsWith('em')) return parseFloat(value) * 16;
    return parseFloat(value) || 0;
  }
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

function hexToFigmaRGBA(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function dtcgTypeToFigmaResolvedType(dtcgType) {
  switch (dtcgType) {
    case 'color': return 'COLOR';
    case 'dimension':
    case 'number':
    case 'fontWeight':
    case 'duration':
      return 'FLOAT';
    default:
      return 'STRING';
  }
}

// ============================================================
// Sync Logic
// ============================================================

/**
 * Build the Figma POST /variables payload from DTCG token files.
 * Creates one Variable Collection per style file, with Light + Dark modes.
 */
function buildSyncPayload(dtcgData, existingCollections) {
  const payload = {
    variableCollections: [],
    variableModes: [],
    variables: [],
    variableModeValues: [],
  };

  // Index existing collections by name for updates
  const existingByName = {};
  if (existingCollections) {
    for (const [id, coll] of Object.entries(existingCollections)) {
      existingByName[coll.name] = { ...coll, id };
    }
  }

  for (const { name, dtcg, isShape } of dtcgData) {
    const collectionName = dtcg.$name || name;
    const existing = existingByName[collectionName];
    const modes = isShape ? ['sharp', 'rounded', 'pill'] : ['light', 'dark'];
    const modeLabels = isShape
      ? ['Sharp', 'Rounded', 'Pill']
      : ['Light', 'Dark'];

    // Use a temp ID for new collections, real ID for existing
    const collectionId = existing?.id || `temp_coll_${name}`;

    if (!existing) {
      payload.variableCollections.push({
        action: 'CREATE',
        id: collectionId,
        name: collectionName,
        initialModeId: `temp_mode_${name}_${modes[0]}`,
      });

      // Create modes
      for (let i = 0; i < modes.length; i++) {
        if (i === 0) {
          // Rename the initial mode
          payload.variableModes.push({
            action: 'UPDATE',
            id: `temp_mode_${name}_${modes[0]}`,
            name: modeLabels[0],
            variableCollectionId: collectionId,
          });
        } else {
          payload.variableModes.push({
            action: 'CREATE',
            id: `temp_mode_${name}_${modes[i]}`,
            name: modeLabels[i],
            variableCollectionId: collectionId,
          });
        }
      }
    }

    // Resolve mode IDs
    const modeIds = {};
    if (existing) {
      for (const mode of existing.modes) {
        const matchIdx = modeLabels.findIndex(l => l === mode.name);
        if (matchIdx !== -1) modeIds[modes[matchIdx]] = mode.modeId;
      }
    } else {
      for (const mode of modes) {
        modeIds[mode] = `temp_mode_${name}_${mode}`;
      }
    }

    // Index existing variables by name
    const existingVars = {};
    // Note: existing variables would need to be passed separately
    // For now, we create all variables fresh

    // Iterate token groups
    for (const [group, tokens] of Object.entries(dtcg)) {
      if (group.startsWith('$') || typeof tokens !== 'object') continue;

      for (const [key, token] of Object.entries(tokens)) {
        if (!token.$type) continue;

        const varName = `${group}/${key}`;
        const varId = `temp_var_${name}_${varName}`;
        const resolvedType = dtcgTypeToFigmaResolvedType(token.$type);

        payload.variables.push({
          action: 'CREATE',
          id: varId,
          name: varName,
          resolvedType,
          variableCollectionId: collectionId,
        });

        // Set values per mode
        if (token.$value != null) {
          // Same value both modes
          for (const mode of modes) {
            if (modeIds[mode]) {
              payload.variableModeValues.push({
                variableId: varId,
                modeId: modeIds[mode],
                value: toFigmaVariableValue(token.$value, token.$type),
              });
            }
          }
        } else if (token.$extensions?.mode) {
          for (const mode of modes) {
            const val = token.$extensions.mode[mode];
            if (val != null && modeIds[mode]) {
              payload.variableModeValues.push({
                variableId: varId,
                modeId: modeIds[mode],
                value: toFigmaVariableValue(val, token.$type),
              });
            }
          }
        }
      }
    }
  }

  return payload;
}

// ============================================================
// Public API
// ============================================================

/**
 * Sync Figma tokens to a Figma file via the Variables REST API.
 * @param {Object} opts
 * @param {string} opts.token - Figma Personal Access Token
 * @param {string} opts.file - Figma file key
 * @param {string} [opts.style='all'] - Style filter
 * @param {string} [opts.input] - Token directory (default: dist/figma/tokens/)
 * @param {boolean} [opts.dryRun=false] - Preview without uploading
 * @param {string} [opts.cwd] - Working directory
 * @returns {Promise<{ collections: number, variables: number }>}
 */
export async function syncFigmaTokens(opts = {}) {
  const {
    token: apiToken,
    file: fileKey,
    style: styleFilter = 'all',
    input: inputDir,
    'dry-run': dryRun = false,
    dryRun: dryRunAlt = false,
    cwd = process.cwd(),
  } = opts;

  const isDryRun = dryRun || dryRunAlt;
  const tokenDir = inputDir ? resolve(cwd, inputDir) : join(cwd, 'dist', 'figma', 'tokens');

  if (!fileKey) {
    throw new Error('Figma file key is required (--file)');
  }

  // Read DTCG token files
  const files = await readdir(tokenDir);
  const tokenFiles = files.filter(f => f.endsWith('.tokens.json') && f !== 'combined.tokens.json');

  const dtcgData = [];
  for (const file of tokenFiles) {
    const content = await readFile(join(tokenDir, file), 'utf-8');
    const dtcg = JSON.parse(content);
    const id = file.replace('.tokens.json', '');

    // Filter by style
    if (styleFilter !== 'all' && id !== styleFilter && id !== 'shapes') continue;

    dtcgData.push({
      name: id,
      dtcg,
      isShape: id === 'shapes',
    });
  }

  if (dtcgData.length === 0) {
    throw new Error('No token files found. Run `npx decantr figma:tokens` first.');
  }

  // Get existing variables for diffing
  let existingCollections = null;
  if (!isDryRun) {
    const client = new FigmaClient(apiToken || process.env.FIGMA_TOKEN);
    try {
      const existing = await client.getLocalVariables(fileKey);
      existingCollections = existing.meta?.variableCollections || null;
    } catch {
      // File may not have variables yet — that's fine
    }
  }

  const payload = buildSyncPayload(dtcgData, existingCollections);

  const stats = {
    collections: payload.variableCollections.length,
    variables: payload.variables.length,
    modeValues: payload.variableModeValues.length,
  };

  if (isDryRun) {
    return { ...stats, payload };
  }

  // Upload
  const client = new FigmaClient(apiToken || process.env.FIGMA_TOKEN);
  await client.postVariables(fileKey, payload);

  return stats;
}
