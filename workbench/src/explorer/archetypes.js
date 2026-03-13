import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Chip, Separator, Tabs } from 'decantr/components';

const { div, h2, h3, h4, p, span, section, code, strong, a } = tags;

let archetypesData = {};
let archetypesLoaded = false;

async function loadArchetypes() {
  if (archetypesLoaded) return archetypesData;
  try {
    const indexResp = await fetch('/__decantr/registry/archetypes/index.json');
    const index = await indexResp.json();
    const entries = Object.entries(index.archetypes || index);
    for (const [id, meta] of entries) {
      if (typeof meta !== 'object' || !meta.file) continue;
      try {
        const resp = await fetch(`/__decantr/registry/archetypes/${meta.file}`);
        archetypesData[id] = await resp.json();
        archetypesData[id]._meta = meta;
      } catch { archetypesData[id] = { _meta: meta, pages: [] }; }
    }
    archetypesLoaded = true;
  } catch {
    archetypesLoaded = true;
  }
  return archetypesData;
}

export function ArchetypeDetail(archetypeId, navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading archetype...')
  );

  loadArchetypes().then(archetypes => {
    const arch = archetypes[archetypeId];
    container.innerHTML = '';

    if (!arch) {
      container.appendChild(p({ class: css('_fgmutedfg _body') }, `Archetype "${archetypeId}" not found.`));
      return;
    }

    const tabs = Tabs({
      tabs: [
        {
          id: 'features',
          label: 'Features',
          content: () => featuresTab(arch, navigateTo)
        },
        {
          id: 'api',
          label: 'API',
          content: () => apiTab(arch)
        }
      ]
    });

    container.appendChild(
      div({ class: css('_flex _col _gap1 _mb4') },
        h2({ class: css('_heading4') }, arch._meta?.name || archetypeId),
        p({ class: css('_body _fgmutedfg') }, arch._meta?.description || 'Domain application blueprint.')
      )
    );
    container.appendChild(tabs);
  });

  return container;
}

function featuresTab(arch, navigateTo) {
  const sections = [];
  const pages = arch.pages || [];

  // Live page rendering (first page)
  if (pages.length > 0) {
    const page = pages[0];
    const blend = page.blend || page.default_blend || [];
    const surface = page.surface || '_flex _col _gap4 _p4';

    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, `Live Page: ${page.id}`),
        div({ class: css(surface + ' _border _bcborder _radius _minh[300px]') },
          ...(Array.isArray(blend) ? blend : []).map(row => {
            if (typeof row === 'string') {
              return div({ class: css('_p4 _bgmuted/10 _radius _border _bcborder') },
                span({ class: css('_caption _fgmutedfg') }, row)
              );
            }
            if (row.cols) {
              return div({ class: css(`_grid _gc${row.cols.length} _gap4`) },
                ...row.cols.map(col =>
                  div({ class: css('_p4 _bgmuted/10 _radius _border _bcborder') },
                    span({ class: css('_caption _fgmutedfg') }, col)
                  )
                )
              );
            }
            return div({ class: css('_p2 _bgmuted/10 _radius') }, code({}, JSON.stringify(row)));
          })
        )
      )
    );
  }

  // Pages overview
  if (pages.length > 0) {
    sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, `${pages.length} Pages`),
        ...pages.map(page =>
          div({ class: css('_p3 _border _bcborder _radius _flex _col _gap2') },
            div({ class: css('_flex _jcsb _aic') },
              strong({ class: css('_heading6') }, page.id),
              span({ class: css('_caption _fgmutedfg') }, `skeleton: ${page.skeleton || '—'}`)
            ),
            page.patterns ? div({ class: css('_flex _gap1 _wrap') },
              ...(page.patterns || []).map(pat =>
                Chip({
                  label: pat,
                  variant: 'outline',
                  size: 'sm',
                  onclick: () => navigateTo(`/patterns/${pat}`)
                })
              )
            ) : null,
            page.blend ? div({ class: css('_flex _col _gap1') },
              span({ class: css('_caption _fgmutedfg') }, 'Blend:'),
              code({ class: css('_caption _wsprewrap') }, JSON.stringify(page.blend || page.default_blend, null, 2))
            ) : null
          )
        )
      )
    );
  }

  if (sections.length === 0) {
    return div({ class: css('_fgmutedfg _body') }, 'No pages defined.');
  }

  return div({ class: css('_flex _col _gap8') }, ...sections);
}

function apiTab(arch) {
  const sections = [];
  const tannins = arch.tannins || arch.organs || [];
  const suggested = arch.suggested_vintage || {};

  // Tannins
  if (tannins.length > 0) {
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Tannins (Functional Systems)'),
        div({ class: css('_flex _gap2 _wrap') },
          ...tannins.map(t => Chip({ label: t, variant: 'outline', size: 'sm' }))
        )
      )
    );
  }

  // Suggested vintage
  if (Object.keys(suggested).length > 0) {
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Suggested Vintage'),
        div({ class: css('_flex _col _gap1') },
          ...Object.entries(suggested).map(([key, val]) =>
            div({}, strong({ class: css('_caption') }, key + ': '), span({ class: css('_caption _fgmutedfg') }, Array.isArray(val) ? val.join(', ') : String(val)))
          )
        )
      )
    );
  }

  // Skeletons
  if (arch.skeletons) {
    sections.push(
      div({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading6') }, 'Skeletons'),
        ...Object.entries(arch.skeletons).map(([name, desc]) =>
          div({}, strong({ class: css('_caption') }, name + ': '), span({ class: css('_caption _fgmutedfg') }, typeof desc === 'string' ? desc : JSON.stringify(desc)))
        )
      )
    );
  }

  if (sections.length === 0) {
    return div({ class: css('_fgmutedfg _body') }, 'No API metadata available.');
  }

  return div({ class: css('_flex _col _gap6') }, ...sections);
}

export function ArchetypeListView(navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Archetypes'),
    p({ class: css('_body _fgmutedfg') }, 'Loading archetypes...')
  );

  loadArchetypes().then(archetypes => {
    container.innerHTML = '';
    container.appendChild(h2({ class: css('_heading4 _mb2') }, 'Archetypes'));
    container.appendChild(p({ class: css('_body _fgmutedfg _mb4') }, 'Domain application blueprints with pre-mapped pages, patterns, and tannins.'));

    const grid = div({ class: 'de-card-grid' });
    for (const [id, arch] of Object.entries(archetypes)) {
      grid.appendChild(div({
        class: 'de-card-item',
        onclick: () => navigateTo(`/archetypes/${id}`)
      },
        h3({ class: css('_heading6') }, arch._meta?.name || id),
        p({ class: css('_caption _fgmutedfg _mt1') }, arch._meta?.description || ''),
        div({ class: css('_flex _gap2 _mt2') },
          span({ class: css('_caption _fgmutedfg') }, `${(arch.pages || []).length} pages`),
          span({ class: css('_caption _fgmutedfg') }, `${(arch.tannins || arch.organs || []).length} tannins`)
        )
      ));
    }
    container.appendChild(grid);
  });

  return container;
}

export async function loadArchetypeItems() {
  try {
    const resp = await fetch('/__decantr/registry/archetypes/index.json');
    const data = await resp.json();
    const entries = data.archetypes || data;
    return Object.entries(entries)
      .filter(([, meta]) => typeof meta === 'object' && meta.file)
      .map(([id, meta]) => ({ id, label: meta.name || id }));
  } catch {
    return [];
  }
}
