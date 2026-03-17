/**
 * Decantr Figma Plugin — Main Thread.
 * Reads pre-generated token/component/pattern manifests and
 * creates Figma nodes (Variables, Component Sets, Frames).
 */

// CDN base for published manifests
const CDN_BASE = 'https://unpkg.com/decantr@latest/dist/figma';

// ============================================================
// Plugin Entry
// ============================================================

figma.showUI(__html__, { width: 400, height: 520, themeColors: true });

figma.ui.onmessage = async (msg) => {
  switch (msg.type) {
    case 'generate':
      await generate(msg.options);
      break;
    case 'generate-from-essence':
      await generateFromEssence(msg.essence, msg.options);
      break;
    case 'cancel':
      figma.closePlugin();
      break;
  }
};

// ============================================================
// Full Library Generation (Tier 1 & 2)
// ============================================================

async function generate(options) {
  const { style, mode, shape } = options;

  try {
    figma.ui.postMessage({ type: 'progress', step: 'tokens', percent: 0 });

    // Step 1: Fetch token manifest
    const tokensUrl = `${CDN_BASE}/tokens/combined.tokens.json`;
    const tokensResp = await fetchJSON(tokensUrl);
    if (!tokensResp) throw new Error('Failed to fetch token manifest from CDN');

    // Step 2: Create Variable Collections from tokens
    const styleTokens = tokensResp[style];
    if (styleTokens) {
      await createVariableCollection(styleTokens, style);
    }

    figma.ui.postMessage({ type: 'progress', step: 'tokens', percent: 30 });

    // Step 3: Create shape tokens
    if (tokensResp.shapes) {
      await createShapeCollection(tokensResp.shapes, shape);
    }

    figma.ui.postMessage({ type: 'progress', step: 'components', percent: 40 });

    // Step 4: Fetch and create component sets
    const componentsUrl = `${CDN_BASE}/components.json`;
    const componentsResp = await fetchJSON(componentsUrl);
    if (componentsResp?.componentSets) {
      await createComponentSets(componentsResp.componentSets);
    }

    figma.ui.postMessage({ type: 'progress', step: 'patterns', percent: 70 });

    // Step 5: Fetch and create pattern templates
    const patternsUrl = `${CDN_BASE}/patterns.json`;
    const patternsResp = await fetchJSON(patternsUrl);
    if (patternsResp) {
      await createPatternTemplates(patternsResp);
    }

    figma.ui.postMessage({ type: 'progress', step: 'done', percent: 100 });
    figma.notify('Decantr design system generated successfully!');

  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: e.message });
    figma.notify(`Error: ${e.message}`, { error: true });
  }
}

// ============================================================
// Scoped Generation from Essence (Tier 3)
// ============================================================

async function generateFromEssence(essenceStr, options) {
  let essence;
  try {
    essence = JSON.parse(essenceStr);
  } catch {
    figma.ui.postMessage({ type: 'error', message: 'Invalid JSON in essence' });
    return;
  }

  const style = essence.vintage?.style || options.style || 'auradecantism';
  const mode = essence.vintage?.mode || options.mode || 'dark';

  try {
    figma.ui.postMessage({ type: 'progress', step: 'tokens', percent: 0 });

    // Fetch tokens for the specified style only
    const tokensUrl = `${CDN_BASE}/tokens/${style}.tokens.json`;
    const tokens = await fetchJSON(tokensUrl);
    if (tokens) {
      await createVariableCollection(tokens, style);
    }

    figma.ui.postMessage({ type: 'progress', step: 'patterns', percent: 40 });

    // Fetch patterns and filter to only those in the structure
    const patternsUrl = `${CDN_BASE}/patterns.json`;
    const patternsResp = await fetchJSON(patternsUrl);

    if (patternsResp && essence.structure) {
      // Collect all pattern IDs from the essence
      const usedPatterns = new Set();
      for (const page of essence.structure) {
        if (page.blend) {
          for (const item of page.blend) {
            if (typeof item === 'string') usedPatterns.add(item);
            else if (item.cols) item.cols.forEach(c => usedPatterns.add(c));
          }
        }
      }

      // Filter to only used patterns
      const filteredPatterns = {
        ...patternsResp,
        patterns: (patternsResp.patterns || []).filter(p => usedPatterns.has(p.id)),
        archetypes: [], // Skip archetypes for scoped generation
      };

      await createPatternTemplates(filteredPatterns);
    }

    figma.ui.postMessage({ type: 'progress', step: 'pages', percent: 70 });

    // Generate page frames from structure
    if (essence.structure) {
      await createEssencePages(essence);
    }

    figma.ui.postMessage({ type: 'progress', step: 'done', percent: 100 });
    figma.notify('Scoped design system generated from Essence!');

  } catch (e) {
    figma.ui.postMessage({ type: 'error', message: e.message });
    figma.notify(`Error: ${e.message}`, { error: true });
  }
}

// ============================================================
// Figma Node Creators
// ============================================================

async function createVariableCollection(dtcg, styleName) {
  const collection = figma.variables.createVariableCollection(
    dtcg.$name || `Decantr — ${styleName}`
  );

  // Rename default mode to Light
  const lightModeId = collection.modes[0].modeId;
  collection.renameMode(lightModeId, 'Light');

  // Add Dark mode
  const darkModeId = collection.addMode('Dark');

  // Create variables for each token group
  for (const [group, tokens] of Object.entries(dtcg)) {
    if (group.startsWith('$') || typeof tokens !== 'object') continue;

    for (const [key, token] of Object.entries(tokens)) {
      if (!token.$type) continue;

      const resolvedType = dtcgToFigmaType(token.$type);
      const variable = figma.variables.createVariable(
        `${group}/${key}`,
        collection,
        resolvedType
      );

      // Set values per mode
      if (token.$value != null) {
        const val = convertValue(token.$value, token.$type);
        variable.setValueForMode(lightModeId, val);
        variable.setValueForMode(darkModeId, val);
      } else if (token.$extensions?.mode) {
        if (token.$extensions.mode.light != null) {
          variable.setValueForMode(
            lightModeId,
            convertValue(token.$extensions.mode.light, token.$type)
          );
        }
        if (token.$extensions.mode.dark != null) {
          variable.setValueForMode(
            darkModeId,
            convertValue(token.$extensions.mode.dark, token.$type)
          );
        }
      }
    }
  }
}

async function createShapeCollection(shapeDTCG, activeShape) {
  const collection = figma.variables.createVariableCollection('Decantr — Shapes');

  const sharpModeId = collection.modes[0].modeId;
  collection.renameMode(sharpModeId, 'Sharp');
  const roundedModeId = collection.addMode('Rounded');
  const pillModeId = collection.addMode('Pill');

  const modeMap = { sharp: sharpModeId, rounded: roundedModeId, pill: pillModeId };

  for (const [key, token] of Object.entries(shapeDTCG.radius || {})) {
    const variable = figma.variables.createVariable(
      `radius/${key}`,
      collection,
      'FLOAT'
    );

    if (token.$extensions?.mode) {
      for (const [shape, val] of Object.entries(token.$extensions.mode)) {
        if (modeMap[shape]) {
          variable.setValueForMode(
            modeMap[shape],
            parseDimension(val)
          );
        }
      }
    }
  }
}

async function createComponentSets(componentSets) {
  const page = figma.createPage();
  page.name = 'Components';

  let y = 0;
  for (const cs of componentSets) {
    const setFrame = figma.createFrame();
    setFrame.name = cs.name;
    setFrame.layoutMode = 'HORIZONTAL';
    setFrame.layoutWrap = 'WRAP';
    setFrame.itemSpacing = 24;
    setFrame.counterAxisSpacing = 24;
    setFrame.paddingTop = 24;
    setFrame.paddingRight = 24;
    setFrame.paddingBottom = 24;
    setFrame.paddingLeft = 24;
    setFrame.y = y;

    // Create individual variant components
    for (const variant of (cs.variants || [])) {
      const component = figma.createComponent();
      component.name = variant.name;

      if (variant.node?.absoluteRenderBounds) {
        const bounds = variant.node.absoluteRenderBounds;
        if (bounds.width > 0) component.resize(bounds.width, bounds.height || 40);
      }

      setFrame.appendChild(component);
    }

    page.appendChild(setFrame);
    y += setFrame.height + 48;
  }
}

async function createPatternTemplates(patternsData) {
  // Patterns page
  if (patternsData.patterns?.length > 0) {
    const page = figma.createPage();
    page.name = 'Patterns';

    let y = 0;
    for (const pattern of patternsData.patterns) {
      const frame = createFrameFromSpec(pattern);
      frame.y = y;
      page.appendChild(frame);
      y += (frame.height || 200) + 48;
    }
  }

  // Skeletons page
  if (patternsData.skeletons?.length > 0) {
    const page = figma.createPage();
    page.name = 'Skeletons';

    let x = 0;
    for (const skeleton of patternsData.skeletons) {
      const frame = createFrameFromSpec(skeleton);
      frame.x = x;
      if (skeleton.width) frame.resize(skeleton.width, skeleton.height || 900);
      page.appendChild(frame);
      x += (skeleton.width || 1440) + 48;
    }
  }

  // Archetypes page
  if (patternsData.archetypes?.length > 0) {
    const page = figma.createPage();
    page.name = 'Archetypes';

    let y = 0;
    for (const archetype of patternsData.archetypes) {
      const frame = createFrameFromSpec(archetype);
      frame.y = y;
      if (archetype.width) frame.resize(archetype.width, archetype.height || 900);
      page.appendChild(frame);
      y += (archetype.height || 900) + 48;
    }
  }
}

async function createEssencePages(essence) {
  const page = figma.createPage();
  page.name = 'Pages';

  let y = 0;
  for (const pageSpec of essence.structure || []) {
    const frame = figma.createFrame();
    frame.name = pageSpec.id;
    frame.resize(1440, 900);
    frame.layoutMode = 'VERTICAL';
    frame.y = y;

    // Add a label
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' }).catch(() => {});
    label.characters = `${pageSpec.id} — ${pageSpec.skeleton || 'default'}`;
    frame.appendChild(label);

    page.appendChild(frame);
    y += 948;
  }
}

// ============================================================
// Helpers
// ============================================================

function createFrameFromSpec(spec) {
  const frame = figma.createFrame();
  frame.name = spec.name || spec.id || 'Frame';

  if (spec.layoutMode) frame.layoutMode = spec.layoutMode;
  if (spec.itemSpacing != null) frame.itemSpacing = spec.itemSpacing;
  if (spec.paddingTop != null) frame.paddingTop = spec.paddingTop;
  if (spec.paddingRight != null) frame.paddingRight = spec.paddingRight;
  if (spec.paddingBottom != null) frame.paddingBottom = spec.paddingBottom;
  if (spec.paddingLeft != null) frame.paddingLeft = spec.paddingLeft;
  if (spec.cornerRadius != null) frame.cornerRadius = spec.cornerRadius;
  if (spec.clipsContent != null) frame.clipsContent = spec.clipsContent;

  // Create child frames for regions
  if (spec.regions) {
    for (const region of spec.regions) {
      if (region.visible === false) continue;
      const child = createFrameFromSpec(region);
      frame.appendChild(child);
    }
  }

  // Create child frames for rows
  if (spec.rows) {
    for (const row of spec.rows) {
      if (row.type === 'pattern') {
        const child = createFrameFromSpec(row.frame || {});
        child.name = row.id || 'pattern';
        frame.appendChild(child);
      } else if (row.type === 'columns') {
        const rowFrame = figma.createFrame();
        rowFrame.name = 'columns';
        rowFrame.layoutMode = 'HORIZONTAL';
        rowFrame.itemSpacing = row.itemSpacing || 16;

        for (const col of row.columns || []) {
          const colFrame = createFrameFromSpec(col.frame || {});
          colFrame.name = col.id || 'column';
          if (col.layoutGrow) colFrame.layoutGrow = col.layoutGrow;
          rowFrame.appendChild(colFrame);
        }

        frame.appendChild(rowFrame);
      }
    }
  }

  return frame;
}

async function fetchJSON(url) {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    return await resp.json();
  } catch {
    return null;
  }
}

function dtcgToFigmaType(type) {
  switch (type) {
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

function convertValue(value, type) {
  if (type === 'color' && typeof value === 'string' && value.startsWith('#')) {
    return hexToFigmaColor(value);
  }
  if (type === 'dimension') return parseDimension(value);
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (!isNaN(num) && (type === 'number' || type === 'fontWeight' || type === 'duration')) {
      return num;
    }
  }
  return String(value);
}

function hexToFigmaColor(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  return {
    r: parseInt(hex.slice(0, 2), 16) / 255,
    g: parseInt(hex.slice(2, 4), 16) / 255,
    b: parseInt(hex.slice(4, 6), 16) / 255,
    a: hex.length >= 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
  };
}

function parseDimension(value) {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  if (value.endsWith('rem')) return parseFloat(value) * 16;
  if (value.endsWith('px')) return parseFloat(value);
  if (value.endsWith('em')) return parseFloat(value) * 16;
  return parseFloat(value) || 0;
}
