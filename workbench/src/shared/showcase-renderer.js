import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { createSignal } from 'decantr/state';
import * as Components from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';

const { div, h4, p, span, code, button: btn } = tags;

/** Sample data for chart examples. */
const CHART_SAMPLE_DATA = [
  { month: 'Jan', value: 40 },
  { month: 'Feb', value: 55 },
  { month: 'Mar', value: 70 },
  { month: 'Apr', value: 62 },
  { month: 'May', value: 85 },
  { month: 'Jun', value: 78 }
];

/** Components that require a `visible` signal getter to show/hide. */
const VISIBLE_SIGNAL = new Set(['Modal', 'Drawer', 'Sheet', 'AlertDialog', 'Command']);

/** Components that require a `trigger` prop (function returning element). */
const TRIGGER_PROP = new Set(['Popover', 'Popconfirm', 'Dropdown', 'HoverCard']);

/** Components that use children as the trigger element. */
const CHILDREN_TRIGGER = new Set(['Tooltip']);

/** Components that require a `target` element. */
const TARGET_PROP = new Set(['ContextMenu']);

/** Imperative functions — call them to show ephemeral UI (both casings for group lookup). */
const IMPERATIVE_FN = new Set(['toast', 'message', 'notification', 'Toast', 'Message', 'Notification']);

/** Components returning controller objects, not elements. */
const CONTROLLER_FN = new Set(['Tour']);

/** Map group IDs to grid classes for adaptive layout. */
const STACK_GROUPS = new Set(['layout', 'navigation', 'chart', 'data']);
const MD_GROUPS = new Set(['form', 'form-basic', 'form-advanced']);

/**
 * Get the showcase grid class for a component based on its group.
 * @param {string} componentName
 * @param {string} [groupId]
 * @returns {string}
 */
export function getShowcaseGridClass(componentName, groupId) {
  if (groupId && STACK_GROUPS.has(groupId)) return 'de-showcase-stack';
  if (groupId && MD_GROUPS.has(groupId)) return 'de-showcase-grid-md';
  return 'de-showcase-grid';
}

/**
 * Render a full component showcase from registry data.
 * @param {string} componentName
 * @param {object} registryEntry
 * @param {Function} navigateTo
 * @param {string} [gridClass='de-showcase-grid']
 * @returns {HTMLElement}
 */
export function renderShowcase(componentName, registryEntry, navigateTo, gridClass) {
  gridClass = gridClass || 'de-showcase-grid';
  const { Separator, icon } = Components;
  const chartType = registryEntry?.chartType;
  // Resolve component function: chart types → Chart/Sparkline, else lookup by name (try exact, then lowercase)
  const resolvedName = Components[componentName] ? componentName
    : Components[componentName.toLowerCase()] ? componentName.toLowerCase()
    : componentName;
  const ComponentFn = chartType
    ? (chartType === 'sparkline' ? (props) => Sparkline({ data: CHART_SAMPLE_DATA.map(d => d.value), ...props }) : (props) => Chart({ data: CHART_SAMPLE_DATA, ...props }))
    : Components[resolvedName];
  const props = registryEntry?.props || {};
  const showcase = registryEntry?.showcase;
  const defaults = showcase?.defaults || {};
  const labelProp = showcase?.labelProp || null;

  if (!ComponentFn) {
    return div({ class: css('_fgmutedfg _body') }, `Component "${componentName}" not found in exports.`);
  }

  const sections = [];

  // ── Variant Grid ──────────────────────────────────────────
  const variantEnum = props.variant?.enum;
  if (showcase?.sections?.includes('variants') && variantEnum?.length > 0) {
    const children = getDefaultChildren(componentName, showcase);
    sections.push(
      showcaseSection('Variants',
        div({ class: gridClass },
          ...variantEnum.map(v => {
            try {
              return labeledItem(renderWithVariant(ComponentFn, componentName, { ...defaults, variant: v }, children, labelProp), v);
            } catch { return span({ class: css('_fgerror _caption') }, `Error: ${v}`); }
          })
        )
      )
    );
  }

  // ── Size Grid ─────────────────────────────────────────────
  const sizeEnum = props.size?.enum?.filter(s => !s.startsWith('icon'));
  if (showcase?.sections?.includes('sizes') && sizeEnum?.length > 0) {
    const children = getDefaultChildren(componentName, showcase);
    const allSizes = [{ label: 'default', value: undefined }, ...sizeEnum.map(s => ({ label: s, value: s }))];
    sections.push(
      showcaseSection('Sizes',
        div({ class: gridClass },
          ...allSizes.map(({ label, value }) => {
            try {
              const sizeProps = { ...defaults };
              if (value) sizeProps.size = value;
              return labeledItem(renderWithVariant(ComponentFn, componentName, sizeProps, children, labelProp), label);
            } catch { return span({ class: css('_fgerror _caption') }, `Error: ${label}`); }
          })
        )
      )
    );
  }

  // ── Icon Grid ─────────────────────────────────────────────
  if (showcase?.sections?.includes('icons') && showcase?.icons?.samples?.length > 0) {
    sections.push(
      showcaseSection('With Icons',
        div({ class: gridClass },
          ...showcase.icons.samples.map(iconName => {
            try {
              return ComponentFn(
                { ...defaults, variant: 'primary', iconLeft: icon(iconName, { size: '1em' }) },
                iconName
              );
            } catch { return span({ class: css('_fgerror _caption') }, `Error: ${iconName}`); }
          })
        )
      )
    );
  }

  // ── State Grid ────────────────────────────────────────────
  if (showcase?.sections?.includes('states') && showcase?.states) {
    const children = getDefaultChildren(componentName, showcase);
    const stateItems = [];
    for (const [stateProp, defaultVal] of Object.entries(showcase.states)) {
      try {
        const propObj = { ...defaults, [stateProp]: defaultVal };
        if (props.variant) propObj.variant = propObj.variant || 'primary';
        const el = renderWithVariant(ComponentFn, componentName, propObj, children, labelProp);
        stateItems.push(labeledItem(el, stateProp));
      } catch { /* skip */ }
    }
    if (stateItems.length > 0) {
      sections.push(
        showcaseSection('States',
          div({ class: gridClass }, ...stateItems)
        )
      );
    }
  }

  // ── Examples ──────────────────────────────────────────────
  if (showcase?.sections?.includes('examples') && showcase?.examples?.length > 0) {
    const children = getDefaultChildren(componentName, showcase);
    sections.push(
      showcaseSection('Examples',
        div({ class: css('_flex _col _gap4') },
          ...showcase.examples.map(ex => {
            try {
              const mergedProps = { ...defaults, ...ex.props };
              const el = renderExample(ComponentFn, componentName, mergedProps, children, labelProp);
              return div({ class: 'de-example-card' },
                div({ class: 'de-example-demo' }, el),
                div({ class: 'de-example-meta' },
                  span({ class: css('_label _fgfg') }, ex.name),
                  ex.description ? p({ class: css('_caption _fgmutedfg') }, ex.description) : null
                )
              );
            } catch { return span({ class: css('_fgerror _caption') }, `Error: ${ex.name}`); }
          })
        )
      )
    );
  }

  if (sections.length === 0) {
    return div({ class: css('_fgmutedfg _body') }, 'No showcase sections available. See the API tab for props and usage.');
  }

  // Strip leading separator from first section — it's only useful as a divider between sections
  if (sections.length > 0) {
    const first = sections[0];
    const firstChild = first.firstElementChild;
    if (firstChild && firstChild.classList.contains('d-separator')) {
      firstChild.remove();
    }
  }

  return div({ class: css('_flex _col _gap8') }, ...sections);
}

/**
 * Render a single showcase section with heading.
 */
function showcaseSection(title, content) {
  const { Separator } = Components;
  return div({ class: css('_flex _col _gap4') },
    Separator ? Separator({}) : div({ class: css('_bt[var(--d-border-width)_solid_var(--d-border)]') }),
    h4({ class: css('_heading5 _mb3') }, title),
    content
  );
}

/**
 * Wrap an element with a label underneath.
 */
function labeledItem(el, label) {
  return div({ class: 'de-specimen' }, el,
    span({ class: 'de-specimen-label' }, label)
  );
}

/**
 * Get default children for a component based on showcase spec.
 */
function getDefaultChildren(componentName, showcase) {
  return showcase?.children ?? componentName;
}

/**
 * Render a component with specific props, handling children properly.
 */
function renderWithVariant(ComponentFn, componentName, mergedProps, children, labelProp) {
  if (labelProp && children) {
    mergedProps[labelProp] = children;
    return ComponentFn(mergedProps);
  }

  if (children) {
    try {
      const el = ComponentFn(mergedProps, children);
      if (el instanceof HTMLElement) return el;
    } catch { /* fall through */ }
  }
  return ComponentFn(mergedProps);
}

/**
 * Render an example, with special handling for overlays and trigger components.
 * - Visible-signal components get a toggle button + signal wiring.
 * - Trigger-prop components get a trigger button injected.
 * - Children-trigger components get a button as children.
 * - Target-prop components get a target zone element.
 * - Imperative functions get a trigger button that calls the function.
 * - Controller functions get a trigger button that calls start().
 * - Everything else delegates to renderWithVariant.
 */
function renderExample(ComponentFn, componentName, mergedProps, children, labelProp) {
  const { Button } = Components;
  const triggerBtn = (label) => Button
    ? Button({ variant: 'outline', size: 'sm' }, label)
    : btn({ class: css('_body _p3 _r2 _b1 _bcborder _bgmuted _fgfg _pointer') }, label);

  // ── Visible-signal overlays (Modal, Drawer, Sheet, AlertDialog, Command) ──
  if (VISIBLE_SIGNAL.has(componentName)) {
    const [visible, setVisible] = createSignal(false);
    const label = mergedProps.title || componentName;
    const toggle = triggerBtn(`Open ${label}`);
    toggle.addEventListener('click', () => setVisible(true));
    const overlay = ComponentFn({
      ...mergedProps,
      visible,
      onClose: () => setVisible(false),
      onCancel: () => setVisible(false)
    }, ...(children ? [children] : ['Example content']));
    return div({ class: css('_flex _aic _gap3') }, toggle, overlay);
  }

  // ── Trigger-prop components (Popover, Popconfirm, Dropdown, HoverCard) ──
  if (TRIGGER_PROP.has(componentName)) {
    const btnLabel = componentName === 'Popconfirm' ? 'Delete'
      : componentName === 'Dropdown' ? 'Menu'
      : componentName;
    mergedProps.trigger = () => triggerBtn(btnLabel);
    if (componentName === 'Popover' || componentName === 'HoverCard') {
      return ComponentFn(mergedProps, children || 'Example content');
    }
    return ComponentFn(mergedProps);
  }

  // ── Children-trigger components (Tooltip) ──
  if (CHILDREN_TRIGGER.has(componentName)) {
    return ComponentFn(mergedProps, triggerBtn(mergedProps.content || componentName));
  }

  // ── Target-prop components (ContextMenu) ──
  if (TARGET_PROP.has(componentName)) {
    const zone = div(
      { class: css('_p6 _r2 _bgmuted _fgmutedfg _body _tac _pointer') },
      'Right-click here'
    );
    mergedProps.target = zone;
    const menu = ComponentFn(mergedProps);
    return div({ class: css('_flex _col _gap2') }, zone, menu);
  }

  // ── Imperative functions (toast, message, notification) ──
  if (IMPERATIVE_FN.has(componentName)) {
    const label = mergedProps.title || mergedProps.content || componentName;
    const trigger = triggerBtn(`Show ${label}`);
    trigger.addEventListener('click', () => {
      try { ComponentFn(mergedProps); } catch { /* ignore */ }
    });
    return trigger;
  }

  // ── Controller components (Tour) — returns {start, next, ...} ──
  if (CONTROLLER_FN.has(componentName)) {
    const trigger = triggerBtn('Start Tour');
    trigger.addEventListener('click', () => {
      try {
        const ctrl = ComponentFn(mergedProps);
        if (ctrl && typeof ctrl.start === 'function') ctrl.start();
      } catch { /* ignore */ }
    });
    return trigger;
  }

  // ── Default rendering ──
  return renderWithVariant(ComponentFn, componentName, mergedProps, children, labelProp);
}
