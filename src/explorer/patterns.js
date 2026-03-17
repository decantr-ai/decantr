import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chip, Separator, Tabs, CodeBlock } from 'decantr/components';
import { renderPatternExample, hasPatternExample } from './shared/pattern-examples.js';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, h4, p, span, section, code, strong } = tags;

let patternsData = {};
let patternsLoaded = false;

async function loadPatterns() {
  if (patternsLoaded) return patternsData;
  try {
    const indexResp = await fetch('/__decantr/registry/patterns/index.json');
    const index = await indexResp.json();
    const entries = Object.entries(index.patterns || {});
    for (const [id, meta] of entries) {
      try {
        const resp = await fetch(`/__decantr/registry/patterns/${meta.file || id + '.json'}`);
        patternsData[id] = await resp.json();
      } catch { patternsData[id] = { id, name: id, components: [], default_blend: {} }; }
    }
    patternsLoaded = true;
  } catch {
    patternsLoaded = true;
  }
  return patternsData;
}

export function PatternDetail(patternId, navigateTo) {
  // Normalize title-cased URL slugs back to kebab-case keys (e.g. "Card Grid" → "card-grid", "Hero" → "hero")
  const normalizedId = decodeURIComponent(patternId).toLowerCase().replace(/\s+/g, '-');

  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading pattern...')
  );

  loadPatterns().then(patterns => {
    const pattern = patterns[normalizedId] || patterns[patternId];
    container.innerHTML = '';

    if (!pattern) {
      container.appendChild(p({ class: css('_fgmutedfg _body') }, `Pattern "${patternId}" not found.`));
      return;
    }

    const tabs = Tabs({
      tabs: [
        {
          id: 'features',
          label: 'Features',
          content: () => featuresTab(pattern)
        },
        {
          id: 'api',
          label: 'API',
          content: () => apiTab(pattern, patternId, navigateTo)
        }
      ]
    });

    container.appendChild(
      div({ class: css('_flex _col _gap1 _mb3') },
        h2({ class: css('_heading4') }, pattern.name || patternId),
        p({ class: css('_body _fgmutedfg') }, pattern.description || 'Composable UI building block.')
      )
    );
    container.appendChild(tabs);
  });

  return container;
}

function featuresTab(pattern) {
  const sections = [];

  // Presets section (v2 patterns)
  if (pattern.presets && Object.keys(pattern.presets).length > 0) {
    const presetEntries = Object.entries(pattern.presets);
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb2') }, 'Presets'),
        p({ class: css('_caption _fgmutedfg _mb3') }, `${presetEntries.length} variants. Default: ${pattern.default_preset || 'default'}`),
        ...presetEntries.map(([presetId, preset]) =>
          div({ class: css('_flex _col _gap2 _p3 _b1 _r4 _mb2') },
            div({ class: css('_flex _aic _gap2') },
              strong({ class: css('_heading6') }, presetId),
              presetId === pattern.default_preset ? Chip({ label: 'default', variant: 'primary', size: 'sm' }) : null
            ),
            p({ class: css('_caption _fgmutedfg') }, preset.description || ''),
            preset.components ? div({ class: css('_flex _gap1 _wrap _mt1') },
              ...(preset.components || []).map(c => Chip({ label: c, variant: 'outline', size: 'sm' }))
            ) : null,
            preset.blend?.atoms ? code({ class: css('_caption _fgmutedfg _mt1') }, `Atoms: ${preset.blend.atoms}`) : null
          )
        )
      )
    );
    sections.push(Separator({}));
  }

  // Live preview
  if (hasPatternExample(pattern.id)) {
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, 'Live Preview'),
        div({ class: css('_border _bcborder _radius _p4 _overflow[auto]') },
          renderPatternExample(pattern.id)
        )
      )
    );
  }

  // Source code
  if (pattern.code?.example) {
    sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, 'Source Code'),
        CodeBlock({ language: 'javascript' }, pattern.code.example)
      )
    );
  }

  return div({ class: css('_flex _col _gap8') }, ...sections);
}

function apiTab(pattern, patternId, navigateTo) {
  const sections = [];

  // Components list
  sections.push(
    div({ class: css('_flex _col _gap2') },
      h4({ class: css('_heading6') }, 'Components'),
      (pattern.components || []).length > 0
        ? div({ class: css('_flex _gap2 _wrap') },
            ...(pattern.components || []).map(c => Chip({ label: c, variant: 'outline', size: 'sm' }))
          )
        : span({ class: css('_fgmutedfg _caption') }, 'No components listed.')
    )
  );

  // Default blend spec
  if (pattern.default_blend) {
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Default Blend'),
        div({ class: css('_flex _col _gap1') },
          code({ class: css('_caption _fgmutedfg') }, `Layout: ${pattern.default_blend.layout || 'stack'}`),
          code({ class: css('_caption _fgmutedfg') }, `Atoms: ${pattern.default_blend.atoms || '(none)'}`)
        ),
        pattern.default_blend.slots ? div({ class: css('_flex _col _gap1 _mt2') },
          h4({ class: css('_heading6') }, 'Slots'),
          ...Object.entries(pattern.default_blend.slots).map(([name, desc]) =>
            div({ class: css('_flex _gap2') },
              strong({ class: css('_caption') }, name + ':'),
              span({ class: css('_caption _fgmutedfg') }, desc)
            )
          )
        ) : null
      )
    );
  }

  return div({ class: css('_flex _col _gap6') }, ...sections);
}

export function PatternListView(navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Patterns'),
    p({ class: css('_body _fgmutedfg') }, 'Loading patterns...')
  );

  loadPatterns().then(patterns => {
    container.innerHTML = '';
    container.appendChild(h2({ class: css('_heading4 _mb2') }, 'Patterns'));
    container.appendChild(p({ class: css('_body _fgmutedfg _mb3') }, `${Object.keys(patterns).length} composable UI building blocks.`));

    const grid = div({ class: 'de-card-grid' });
    for (const [id, pat] of Object.entries(patterns)) {
      const cat = patternToCategory[id];
      const href = cat ? `/patterns/${cat}/${titleCase(id)}` : `/patterns/${id}`;
      grid.appendChild(div({
        class: 'de-card-item',
        onclick: () => navigateTo(href)
      },
        div({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading6') }, pat.name || id),
          p({ class: css('_caption _fgmutedfg') }, pat.description || ''),
          div({ class: css('_flex _gap1 _wrap') },
            ...(pat.components || []).slice(0, 4).map(c => Chip({ label: c, variant: 'outline', size: 'sm' }))
          )
        )
      ));
    }
    container.appendChild(grid);
  });

  return container;
}

// Reverse map: pattern id → category id
const patternToCategory = {};

const PATTERN_CATEGORIES = [
  { id: 'layout',     label: 'Layout',        ids: ['hero', 'cta-section', 'detail-header', 'detail-panel'] },
  { id: 'data',       label: 'Data Display',   ids: ['kpi-grid', 'data-table', 'chart-grid', 'scorecard', 'comparison-panel', 'stat-card', 'stats-bar'] },
  { id: 'content',    label: 'Content',         ids: ['article-content', 'post-list', 'testimonials', 'author-card', 'media-gallery', 'checklist-card', 'steps-card'] },
  { id: 'navigation', label: 'Navigation',      ids: ['category-nav', 'table-of-contents', 'pagination', 'search-bar', 'filter-bar', 'filter-sidebar'] },
  { id: 'forms',      label: 'Forms',            ids: ['auth-form', 'contact-form', 'form-sections', 'wizard'] },
  { id: 'commerce',   label: 'Commerce',         ids: ['card-grid', 'pricing-table', 'order-history'] },
  { id: 'activity',   label: 'Activity',         ids: ['activity-feed', 'timeline', 'goal-tracker', 'pipeline-tracker'] },
  { id: 'social',     label: 'Social',            ids: ['chat-interface', 'photo-to-recipe'] },
  { id: 'meta',       label: 'Meta / Docs',      ids: ['component-showcase', 'specimen-grid', 'token-inspector', 'explorer-shell'] },
];

for (const cat of PATTERN_CATEGORIES) {
  for (const id of cat.ids) patternToCategory[id] = cat.id;
}

function titleCase(id) {
  return id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export async function loadPatternItems() {
  try {
    const resp = await fetch('/__decantr/registry/patterns/index.json');
    const data = await resp.json();
    const available = new Set(Object.keys(data.patterns || {}));

    return PATTERN_CATEGORIES
      .map(cat => {
        const children = cat.ids.filter(id => available.has(id));
        if (children.length === 0) return null;
        return {
          id: cat.id,
          label: cat.label,
          children: children.map(id => titleCase(id))
        };
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}
