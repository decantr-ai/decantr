import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Separator, Tabs } from 'decantr/components';
import { SpecTable } from './shared/spec-table.js';
import { ComponentUsageLinks } from './shared/usage-links.js';
import { renderShowcase, getShowcaseGridClass } from './shared/showcase-renderer.js';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, p, section } = tags;

// Component groups — loaded from registry, cached locally
let componentGroups = null;

// Registry data (loaded async)
let registryData = null;
let registryLoaded = false;

async function loadRegistry() {
  if (registryLoaded) return registryData;
  try {
    const resp = await fetch('/__decantr/registry/components.json');
    registryData = await resp.json();
    componentGroups = registryData.groups || {};
    registryLoaded = true;
  } catch {
    registryData = { components: {}, groups: {} };
    componentGroups = {};
    registryLoaded = true;
  }
  return registryData;
}

/**
 * Component detail view with Features | API tabs.
 */
export function ComponentDetail(componentName, navigateTo, groupId) {
  const container = div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, componentName),
      p({ class: css('_body _fgmutedfg') }, 'Loading component data...')
    )
  );

  loadRegistry().then(registry => {
    const compData = registry.components?.[componentName] || registry.components?.[componentName.toLowerCase()] || {};
    const props = compData.props || {};
    const gridClass = getShowcaseGridClass(componentName, groupId);

    container.innerHTML = '';

    const tabs = Tabs({
      tabs: [
        {
          id: 'features',
          label: 'Features',
          content: () => renderShowcase(componentName, compData, navigateTo, gridClass)
        },
        {
          id: 'api',
          label: 'API',
          content: () => div({ class: css('_flex _col _gap6') },
            SpecTable({ props }),
            Separator({}),
            ComponentUsageLinks(componentName, navigateTo)
          )
        }
      ]
    });

    container.appendChild(
      div({ class: css('_flex _col _gap1 _mb3') },
        h2({ class: css('_heading4') }, componentName),
        p({ class: css('_body _fgmutedfg') }, compData.description || `UI component returning HTMLElement.`)
      )
    );
    container.appendChild(tabs);
  });

  return container;
}

/**
 * Component group listing (when no specific component selected).
 */
export function ComponentGroupView(groupId, navigateTo) {
  const container = div({ id: 'components-' + groupId, class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading...')
  );

  loadRegistry().then(() => {
    const group = componentGroups?.[groupId];
    if (!group) {
      container.innerHTML = '';
      container.appendChild(p({}, 'Group not found.'));
      return;
    }

    container.innerHTML = '';
    container.appendChild(
      section({ class: css('_flex _col _gap4') },
        h2({ class: css('_heading4') }, `Components — ${group.label}`),
        p({ class: css('_body _fgmutedfg') }, `${group.items.length} components in this group.`),
        div({ class: 'de-card-grid' },
          ...group.items.map(name =>
            div({
              class: 'de-card-item',
              onclick: () => navigateTo(`/components/${groupId}/${name}`)
            },
              h3({ class: css('_heading6') }, name),
            )
          )
        )
      )
    );
  });

  return container;
}

export async function loadComponentItems() {
  const registry = await loadRegistry();
  const groups = registry.groups || {};
  return Object.entries(groups).map(([id, group]) => ({
    id,
    label: group.label,
    children: group.items,
  }));
}
