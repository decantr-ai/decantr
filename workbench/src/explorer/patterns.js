import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chip, Separator, Tabs } from 'decantr/components';
import { PatternUsageLinks } from '../shared/usage-links.js';

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
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading pattern...')
  );

  loadPatterns().then(patterns => {
    const pattern = patterns[patternId];
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
      div({ class: css('_flex _col _gap1 _mb4') },
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

  // Live preview
  const atoms = pattern.default_blend?.atoms || '_flex _col _gap4 _p4';
  sections.push(
    div({ class: css('_flex _col _gap4') },
      h4({ class: css('_heading5 _mb3') }, 'Live Preview'),
      div({ class: css(atoms + ' _border _bcborder _radius _p4 _minh12') },
        ...(pattern.components || []).map(comp =>
          div({ class: css('_p3 _bgmuted/10 _radius _border _bcborder') },
            span({ class: css('_caption _fgmutedfg') }, `<${comp} />`)
          )
        )
      )
    )
  );

  // Recipe overrides
  const overrides = pattern.recipe_overrides || {};
  if (Object.keys(overrides).length > 0) {
    sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, 'Recipe Overrides'),
        ...Object.entries(overrides).map(([recipeId, override]) =>
          div({ class: css('_flex _col _gap2') },
            h4({ class: css('_heading6') }, recipeId),
            override.wrapper ? div({}, strong({ class: css('_caption') }, 'Wrapper: '), code({ class: css('_caption') }, override.wrapper)) : null,
            override.atoms ? div({}, strong({ class: css('_caption') }, 'Atoms: '), code({ class: css('_caption') }, override.atoms)) : null,
            override.notes ? p({ class: css('_caption _fgmutedfg') }, override.notes) : null
          )
        )
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

  sections.push(Separator({}));
  sections.push(PatternUsageLinks(patternId, navigateTo));

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
    container.appendChild(p({ class: css('_body _fgmutedfg _mb4') }, `${Object.keys(patterns).length} composable UI building blocks.`));

    const grid = div({ class: 'de-card-grid' });
    for (const [id, pat] of Object.entries(patterns)) {
      grid.appendChild(div({
        class: 'de-card-item',
        onclick: () => navigateTo(`/patterns/${id}`)
      },
        h3({ class: css('_heading6') }, pat.name || id),
        p({ class: css('_caption _fgmutedfg _mt1') }, pat.description || ''),
        div({ class: css('_flex _gap1 _wrap _mt2') },
          ...(pat.components || []).slice(0, 4).map(c => span({ class: css('_px2 _py1 _bgmuted/10 _radius _overline') }, c))
        )
      ));
    }
    container.appendChild(grid);
  });

  return container;
}

export async function loadPatternItems() {
  try {
    const resp = await fetch('/__decantr/registry/patterns/index.json');
    const data = await resp.json();
    return Object.entries(data.patterns || {}).map(([id, meta]) => ({
      id, label: meta.name || id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    }));
  } catch {
    return [];
  }
}
