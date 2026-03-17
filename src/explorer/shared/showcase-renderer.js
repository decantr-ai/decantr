import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { createSignal } from 'decantr/state';
import * as Components from 'decantr/components';
import { Chart, Sparkline } from 'decantr/chart';
import { injectExplorerCSS } from '../styles.js';
injectExplorerCSS();

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
const VISIBLE_SIGNAL = new Set(['Modal', 'Drawer', 'AlertDialog', 'Command']);

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

/** Override showcase rendering for specific component+state combinations. */
const SHOWCASE_PROP_OVERRIDES = {
  'Button:loading': (defaults) => ({
    props: { ...defaults, disabled: true, iconLeft: Components.Spinner({ size: 'xs' }) },
    children: 'Loading...'
  }),
  'Button:Loading state': (defaults) => ({
    props: { ...defaults, variant: 'primary', disabled: true, iconLeft: Components.Spinner({ size: 'xs' }) },
    children: 'Loading...'
  })
};

/** Components with fully custom showcase rendering. */
const CUSTOM_EXAMPLES = new Set(['Card', 'Placeholder', 'Timeline', 'Comment', 'QRCode']);

/** Map group IDs to grid classes for adaptive layout. */
const STACK_GROUPS = new Set(['layout', 'navigation', 'chart', 'data']);
const MD_GROUPS = new Set(['form', 'form-basic', 'form-advanced']);
const WIDE_COMPONENTS = new Set(['ToggleGroup']);

/**
 * Get the showcase grid class for a component based on its group.
 * @param {string} componentName
 * @param {string} [groupId]
 * @returns {string}
 */
export function getShowcaseGridClass(componentName, groupId) {
  if (groupId && STACK_GROUPS.has(groupId)) return 'de-showcase-stack';
  if (groupId && MD_GROUPS.has(groupId)) return 'de-showcase-grid-md';
  if (WIDE_COMPONENTS.has(componentName)) return 'de-showcase-grid-md';
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

  // Custom showcase rendering for complex components
  if (CUSTOM_EXAMPLES.has(componentName)) {
    if (componentName === 'Placeholder') return renderPlaceholderExamples();
    if (componentName === 'Timeline') return renderTimelineExamples();
    if (componentName === 'Comment') return renderCommentExamples();
    if (componentName === 'QRCode') return renderQRCodeExamples();
    return renderCardExamples();
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
        const overrideKey = componentName + ':' + stateProp;
        if (SHOWCASE_PROP_OVERRIDES[overrideKey]) {
          const ov = SHOWCASE_PROP_OVERRIDES[overrideKey](defaults);
          const el = renderWithVariant(ComponentFn, componentName, ov.props, ov.children, labelProp);
          stateItems.push(labeledItem(el, stateProp));
          continue;
        }
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
              const overrideKey = componentName + ':' + ex.name;
              let el;
              if (SHOWCASE_PROP_OVERRIDES[overrideKey]) {
                const ov = SHOWCASE_PROP_OVERRIDES[overrideKey](defaults);
                el = renderExample(ComponentFn, componentName, ov.props, ov.children, labelProp);
              } else {
                const mergedProps = { ...defaults, ...ex.props };
                el = renderExample(ComponentFn, componentName, mergedProps, children, labelProp);
              }
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

  // ── Visible-signal overlays (Modal, Drawer, AlertDialog, Command) ──
  if (VISIBLE_SIGNAL.has(componentName)) {
    const [visible, setVisible] = createSignal(false);
    const label = mergedProps.title || componentName;
    const toggle = triggerBtn(`Open ${label}`);
    toggle.onclick = () => setVisible(true);
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
      { class: css('_p6 _r2 _b1 _bcborder _fgmutedfg _body _tac _pointer') },
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
    trigger.onclick = () => {
      try { ComponentFn(mergedProps); } catch { /* ignore */ }
    };
    return trigger;
  }

  // ── Controller components (Tour) — returns {start, next, ...} ──
  if (CONTROLLER_FN.has(componentName)) {
    const trigger = triggerBtn('Start Tour');
    trigger.onclick = () => {
      try {
        const ctrl = ComponentFn(mergedProps);
        if (ctrl && typeof ctrl.start === 'function') ctrl.start();
      } catch { /* ignore */ }
    };
    return trigger;
  }

  // ── Default rendering ──
  return renderWithVariant(ComponentFn, componentName, mergedProps, children, labelProp);
}

/**
 * Custom showcase rendering for Placeholder component.
 */
function renderPlaceholderExamples() {
  const { Placeholder, Card, Avatar } = Components;
  if (!Placeholder) return div({ class: css('_fgmutedfg _body') }, 'Placeholder not found');

  const example = (title, description, el) =>
    div({ class: 'de-example-card' },
      div({ class: 'de-example-demo' }, el),
      div({ class: 'de-example-meta' },
        span({ class: css('_label _fgfg') }, title),
        description ? p({ class: css('_caption _fgmutedfg') }, description) : null
      )
    );

  const examples = [];

  // 1. Default 16:9
  examples.push(example('Default (16:9)', 'Image placeholder with brand watermark',
    Placeholder()
  ));

  // 2. With Label
  examples.push(example('With Label', 'Text overlay above watermark',
    Placeholder({ label: 'Cover Image' })
  ));

  // 3. In Card Cover
  if (Card) {
    examples.push(example('In Card Cover', 'Replaces emoji hack in Card.Cover',
      Card({ cover: Placeholder({ variant: 'image', label: 'Cover Image' }) },
        Card.Body({},
          Card.Meta({
            avatar: Avatar ? Avatar({ name: 'Jane Doe', size: 'md' }) : span({}, 'JD'),
            title: 'Jane Doe',
            description: 'Senior Product Designer'
          })
        )
      )
    ));
  }

  // 4. Avatar variants at different sizes
  examples.push(example('Avatar Variants', 'Circular placeholders at multiple sizes',
    div({ class: css('_flex _aic _gap4') },
      Placeholder({ variant: 'avatar', width: '32px' }),
      Placeholder({ variant: 'avatar', width: '48px' }),
      Placeholder({ variant: 'avatar', width: '64px' }),
      Placeholder({ variant: 'avatar', width: '96px' })
    )
  ));

  // 5. Icon variant
  examples.push(example('Icon Variant', 'Square placeholder for app icons',
    div({ class: css('_flex _aic _gap4') },
      Placeholder({ variant: 'icon', width: '32px' }),
      Placeholder({ variant: 'icon', width: '48px' }),
      Placeholder({ variant: 'icon', width: '64px' })
    )
  ));

  // 6. Custom aspect ratios
  examples.push(example('Custom Aspect Ratios', 'Override default 16:9',
    div({ class: css('_flex _gap4') },
      div({ class: css('_flex1') }, Placeholder({ aspectRatio: '1/1', label: '1:1' })),
      div({ class: css('_flex1') }, Placeholder({ aspectRatio: '4/3', label: '4:3' })),
      div({ class: css('_flex1') }, Placeholder({ aspectRatio: '21/9', label: '21:9' }))
    )
  ));

  // 7. Shimmer animation
  examples.push(example('Animated', 'Shimmer loading effect',
    Placeholder({ animate: true, label: 'Loading...' })
  ));

  return div({ class: css('_flex _col _gap8') },
    showcaseSection('Examples',
      div({ class: css('_flex _col _gap4') }, ...examples)
    )
  );
}

/**
 * Custom showcase rendering for Card component with rich composed examples.
 */
function renderCardExamples() {
  const { Card, Avatar, Button, Tabs, Skeleton, icon, Separator } = Components;
  if (!Card) return div({ class: css('_fgmutedfg _body') }, 'Card not found');

  const example = (title, description, el) =>
    div({ class: 'de-example-card' },
      div({ class: 'de-example-demo' }, el),
      div({ class: 'de-example-meta' },
        span({ class: css('_label _fgfg') }, title),
        description ? p({ class: css('_caption _fgmutedfg') }, description) : null
      )
    );

  const placeholderCover = () =>
    Components.Placeholder ? Components.Placeholder({ variant: 'image', height: '180px', label: 'Cover Image' })
      : div({ class: css('_h[180px] _bgmuted _flex _aic _jcc _fgmutedfg _textlg') }, 'Cover Image');

  const examples = [];

  // 1. Basic Card
  examples.push(example('Basic Card', 'Title + paragraph body',
    Card({ title: 'Card Title' },
      Card.Body({}, p({}, 'Some quick example text to build on the card title and make up the bulk of the card\'s content.'))
    )
  ));

  // 2. Card with Extra
  examples.push(example('Card with Extra', 'Title + "More" link in header extra',
    Card({ title: 'Card Title', extra: span({ class: css('_fgprimary _textsm _pointer') }, 'More →') },
      Card.Body({}, p({}, 'Card content with an action link in the header.'))
    )
  ));

  // 3. Cover + Avatar + Meta
  examples.push(example('Cover + Meta', 'Cover image with avatar meta section',
    Card({ cover: placeholderCover() },
      Card.Body({},
        Card.Meta({
          avatar: Avatar ? Avatar({ name: 'Jane Doe', size: 'md' }) : span({}, 'JD'),
          title: 'Jane Doe',
          description: 'Senior Product Designer at Acme Inc.'
        })
      )
    )
  ));

  // 4. Loading Card
  examples.push(example('Loading', 'Skeleton loading state',
    Card({ loading: true })
  ));

  // 5. Inner Card
  examples.push(example('Inner Card', 'Parent card containing nested inner cards',
    Card({ title: 'Group Title' },
      Card.Body({ class: css('_flex _col _gap3') },
        Card({ type: 'inner', title: 'Inner Card 1' },
          Card.Body({}, p({}, 'Inner card content.'))
        ),
        Card({ type: 'inner', title: 'Inner Card 2' },
          Card.Body({}, p({}, 'Another inner card.'))
        )
      )
    )
  ));

  // 6. Borderless Card
  examples.push(example('Borderless', 'Card without visible border',
    div({ class: css('_bgmuted _p4 _r2') },
      Card({ title: 'Borderless', bordered: false },
        Card.Body({}, p({}, 'On muted background to show the effect.'))
      )
    )
  ));

  // 7. Small Size
  examples.push(example('Small Size', 'Compact card with reduced padding',
    Card({ title: 'Compact Card', size: 'sm' },
      Card.Body({}, p({}, 'Smaller padding and font size for dense layouts.'))
    )
  ));

  // 8. Card with Actions
  examples.push(example('Card with Actions', 'Bottom action bar with icons',
    Card({
      title: 'Actions Card',
      actions: [
        span({}, icon ? icon('settings', { size: '1em' }) : '⚙'),
        span({}, icon ? icon('edit', { size: '1em' }) : '✏'),
        span({}, icon ? icon('more-horizontal', { size: '1em' }) : '⋯')
      ]
    },
      Card.Body({}, p({}, 'Card content with an action bar below.'))
    )
  ));

  // 9. Grid Card
  examples.push(example('Grid Card', 'Card.Grid with multiple cells',
    Card({},
      Card.Grid({ hoverable: true },
        ...[1, 2, 3, 4, 5, 6].map(n =>
          div({ class: css('_p4 _tac') }, `Cell ${n}`)
        )
      )
    )
  ));

  // 10. Hoverable Card
  examples.push(example('Hoverable', 'Interactive hover elevation',
    Card({ title: 'Hover Me', hoverable: true },
      Card.Body({}, p({}, 'Try hovering over this card.'))
    )
  ));

  // 11. Profile Card
  examples.push(example('Profile Card', 'Full composition: cover, avatar meta, bio, footer',
    Card({ cover: placeholderCover() },
      Card.Body({ class: css('_flex _col _gap3') },
        Card.Meta({
          avatar: Avatar ? Avatar({ name: 'Alex Rivera', size: 'lg' }) : span({}, 'AR'),
          title: 'Alex Rivera',
          description: '@alexrivera'
        }),
        p({ class: css('_textsm _fgmutedfg') }, 'Full-stack engineer. Open source enthusiast. Coffee ☕ and code.')
      ),
      Card.Footer({ class: css('_flex _jcc') },
        Button ? Button({ variant: 'primary', size: 'sm' }, 'Follow') : btn({}, 'Follow')
      )
    )
  ));

  // 12. Product Card
  examples.push(example('Product Card', 'Cover image, title + price, CTA button',
    Card({ cover: placeholderCover() },
      Card.Body({ class: css('_flex _col _gap2') },
        h4({ class: css('_heading5') }, 'Premium Headphones'),
        p({ class: css('_textsm _fgmutedfg') }, 'Wireless noise-cancelling over-ear headphones.'),
        div({ class: css('_flex _aic _jcsb _mt2') },
          span({ class: css('_heading4') }, '$299'),
          Button ? Button({ variant: 'primary', size: 'sm' }, 'Add to Cart') : btn({}, 'Add to Cart')
        )
      )
    )
  ));

  // 13. Pricing Card
  examples.push(example('Pricing Card', 'Header with price, feature list, CTA footer',
    Card({},
      Card.Header({ class: css('_tac') },
        h4({ class: css('_heading4') }, 'Pro Plan'),
        div({ class: css('_mt2') },
          span({ class: css('_heading2') }, '$29'),
          span({ class: css('_fgmutedfg') }, '/month')
        )
      ),
      Card.Body({},
        div({ class: css('_flex _col _gap2') },
          ...['Unlimited projects', 'Priority support', 'Advanced analytics', 'Custom domains'].map(f =>
            div({ class: css('_flex _aic _gap2 _textsm') },
              icon ? icon('check', { size: '1em', class: css('_fg[var(--d-success)]') }) : span({}, '✓'),
              f
            )
          )
        )
      ),
      Card.Footer({},
        Button ? Button({ variant: 'primary', class: css('_wfull') }, 'Get Started') : btn({}, 'Get Started')
      )
    )
  ));

  return div({ class: css('_flex _col _gap8') },
    showcaseSection('Examples',
      div({ class: css('_flex _col _gap4') }, ...examples)
    )
  );
}

/**
 * Custom showcase rendering for Timeline component.
 */
function renderTimelineExamples() {
  const { Timeline, icon: iconFn } = Components;
  if (!Timeline) return div({ class: css('_fgmutedfg _body') }, 'Timeline not found');

  const example = (title, description, el) =>
    div({ class: 'de-example-card' },
      div({ class: 'de-example-demo' }, el),
      div({ class: 'de-example-meta' },
        span({ class: css('_label _fgfg') }, title),
        description ? p({ class: css('_caption _fgmutedfg') }, description) : null
      )
    );

  const examples = [];

  examples.push(example('Basic', 'Simple left-aligned timeline',
    Timeline({
      items: [
        { content: 'Created project', time: 'Jan 1' },
        { content: 'First release', time: 'Mar 15' },
        { content: 'Reached 1k users', time: 'Jun 1' },
        { content: 'v2.0 launched', time: 'Sep 20' }
      ]
    })
  ));

  examples.push(example('Status Colors', 'Success, info, warning, error indicators',
    Timeline({
      items: [
        { content: 'Build succeeded', status: 'success', time: '10:00 AM' },
        { content: 'Tests passed', status: 'info', time: '10:05 AM' },
        { content: 'Deployment warning', status: 'warning', time: '10:10 AM' },
        { content: 'Rollback triggered', status: 'error', time: '10:15 AM' }
      ]
    })
  ));

  examples.push(example('Alternate with Labels', 'Labels on opposite sides',
    Timeline({
      mode: 'alternate',
      items: [
        { content: 'Research phase', label: 'Q1 2024' },
        { content: 'Design phase', label: 'Q2 2024' },
        { content: 'Development', label: 'Q3 2024' },
        { content: 'Launch', label: 'Q4 2024' }
      ]
    })
  ));

  examples.push(example('Right-aligned', 'Content on the right side',
    Timeline({
      mode: 'right',
      items: [
        { content: 'Step one', time: '9:00 AM' },
        { content: 'Step two', time: '10:00 AM' },
        { content: 'Step three', time: '11:00 AM' }
      ]
    })
  ));

  let iconItems;
  try {
    iconItems = [
      { content: 'Task completed', icon: iconFn('check', { size: '14' }) },
      { content: 'In progress', icon: iconFn('clock', { size: '14' }) },
      { content: 'Issue found', icon: iconFn('alert-triangle', { size: '14' }) }
    ];
  } catch {
    iconItems = [
      { content: 'Task completed', icon: '\u2713' },
      { content: 'In progress', icon: '\u25F7' },
      { content: 'Issue found', icon: '\u26A0' }
    ];
  }
  examples.push(example('With Icons', 'Custom icons as dots', Timeline({ items: iconItems })));

  examples.push(example('Branded', 'Gradient connector + glass dots',
    Timeline({
      variant: 'branded',
      items: [
        { content: 'Premium feature A' },
        { content: 'Premium feature B' },
        { content: 'Premium feature C' }
      ]
    })
  ));

  examples.push(example('Pending State', 'Pulsing pending dot at the tail',
    Timeline({
      pending: 'Processing...',
      items: [
        { content: 'Order placed', status: 'success' },
        { content: 'Payment confirmed', status: 'success' },
        { content: 'Shipping', status: 'info' }
      ]
    })
  ));

  examples.push(example('Horizontal', 'Left-to-right process flow',
    Timeline({
      direction: 'horizontal',
      items: [
        { content: 'Step 1' },
        { content: 'Step 2' },
        { content: 'Step 3' },
        { content: 'Step 4' }
      ]
    })
  ));

  examples.push(example('Collapsible Items', 'Expandable long content',
    Timeline({
      items: [
        { content: 'This is a long detailed description that can be collapsed.', collapsible: true, defaultOpen: false, time: 'Event 1' },
        { content: 'Another detailed item with lots of text.', collapsible: true, defaultOpen: true, time: 'Event 2' },
        { content: 'Short item', time: 'Event 3' }
      ]
    })
  ));

  examples.push(example('Clickable + Disabled', 'Interactive items with disabled state',
    Timeline({
      items: [
        { content: 'Click me', onclick: () => {} },
        { content: 'Disabled item', disabled: true },
        { content: 'Also clickable', onclick: () => {} }
      ]
    })
  ));

  examples.push(example('Small Size', 'Compact variant',
    Timeline({ size: 'sm', items: [{ content: 'A', time: '1:00' }, { content: 'B', time: '2:00' }, { content: 'C', time: '3:00' }] })
  ));

  examples.push(example('Large Size', 'Spacious variant',
    Timeline({ size: 'lg', items: [{ content: 'A', time: 'AM' }, { content: 'B', time: 'PM' }, { content: 'C', time: 'EVE' }] })
  ));

  examples.push(example('Custom Mode', 'Per-item left/right positioning',
    Timeline({
      mode: 'custom',
      items: [
        { content: 'Left side', position: 'left' },
        { content: 'Right side', position: 'right' },
        { content: 'Left again', position: 'left' },
        { content: 'Right again', position: 'right' }
      ]
    })
  ));

  examples.push(example('Reverse Order', 'Items rendered bottom-to-top',
    Timeline({
      reverse: true,
      items: [
        { content: 'First (now last)', time: 'Jan' },
        { content: 'Second', time: 'Feb' },
        { content: 'Third (now first)', time: 'Mar' }
      ]
    })
  ));

  return div({ class: css('_flex _col _gap8') },
    showcaseSection('Examples',
      div({ class: css('_flex _col _gap4') }, ...examples)
    )
  );
}

/**
 * Custom showcase rendering for Comment component.
 */
function renderCommentExamples() {
  const { Comment, Button: BtnComp } = Components;
  if (!Comment) return div({ class: css('_fgmutedfg _body') }, 'Comment not found');

  const example = (title, description, el) =>
    div({ class: 'de-example-card' },
      div({ class: 'de-example-demo' }, el),
      div({ class: 'de-example-meta' },
        span({ class: css('_label _fgfg') }, title),
        description ? p({ class: css('_caption _fgmutedfg') }, description) : null
      )
    );

  const examples = [];

  examples.push(example('Basic', 'Single comment with avatar, author, content, datetime',
    Comment({ author: 'Jane Doe', avatar: 'JD', content: 'This is a great feature! Really love the design.', datetime: '2 hours ago' })
  ));

  const [likeCount, setLikeCount] = createSignal(3);
  const [liked, setLiked] = createSignal(false);
  examples.push(example('With Actions', 'Like, dislike, and reply action buttons',
    Comment({
      author: 'Alice Chen', avatar: 'AC',
      content: 'The new dashboard looks amazing.',
      datetime: '5 min ago',
      actions: [
        { label: 'Like', icon: 'thumbs-up', count: likeCount, active: liked, onclick: () => { setLiked(!liked()); setLikeCount(liked() ? likeCount() + 1 : likeCount() - 1); } },
        { label: 'Dislike', icon: 'thumbs-down', count: 0 }
      ]
    })
  ));

  examples.push(example('Nested Thread', '3-level deep reply chain',
    Comment(
      { author: 'Bob Smith', avatar: 'BS', content: 'What do you think about the new API?', datetime: '1 day ago' },
      Comment(
        { author: 'Carol Lee', avatar: 'CL', content: 'I think it looks solid. The pagination is well designed.', datetime: '20 hours ago' },
        Comment({ author: 'Bob Smith', avatar: 'BS', content: 'Agreed, much better than the previous version.', datetime: '18 hours ago' })
      )
    )
  ));

  examples.push(example('With Reply Editor', 'Inline textarea with submit/cancel',
    Comment({ author: 'David Kim', avatar: 'DK', content: 'Has anyone tested this with the new data layer?', datetime: '3 hours ago', onReply: () => {} })
  ));

  examples.push(example('Bordered Variant', 'Card-style container',
    Comment({ author: 'Eve Wilson', avatar: 'EW', content: 'Card-style container with border, surface background, and panel radius.', datetime: '1 hour ago', variant: 'bordered' })
  ));

  examples.push(example('Minimal Variant', 'Tighter spacing, no borders',
    Comment({ author: 'Frank Zhang', avatar: 'FZ', content: 'Compact layout for dense comment feeds.', datetime: '30 min ago', variant: 'minimal' })
  ));

  const [count2, setCount2] = createSignal(42);
  examples.push(example('Reactive Counts', 'Live updating counter \u2014 click to increment',
    Comment({
      author: 'Grace Park', avatar: 'GP',
      content: 'Click the like button to see the reactive counter update.',
      datetime: 'Just now',
      actions: [{ label: 'Like', icon: 'thumbs-up', count: count2, onclick: () => setCount2(count2() + 1) }]
    })
  ));

  examples.push(example('Multiple Comments', 'List of comments with nested replies',
    div({ class: css('_flex _col _gap4') },
      Comment(
        { author: 'User A', avatar: 'UA', content: 'First top-level comment.', datetime: '5 hours ago' },
        Comment({ author: 'User B', avatar: 'UB', content: 'Reply to first comment.', datetime: '4 hours ago' })
      ),
      Comment({ author: 'User C', avatar: 'UC', content: 'Second top-level comment.', datetime: '3 hours ago' }),
      Comment({ author: 'User D', avatar: 'UD', content: 'Third top-level comment.', datetime: '1 hour ago' })
    )
  ));

  return div({ class: css('_flex _col _gap8') },
    showcaseSection('Examples',
      div({ class: css('_flex _col _gap4') }, ...examples)
    )
  );
}

/**
 * Custom showcase rendering for QRCode component.
 */
function renderQRCodeExamples() {
  const { QRCode } = Components;
  if (!QRCode) return div({ class: css('_fgmutedfg _body') }, 'QRCode not found');

  const example = (title, description, el) =>
    div({ class: 'de-example-card' },
      div({ class: 'de-example-demo' }, el),
      div({ class: 'de-example-meta' },
        span({ class: css('_label _fgfg') }, title),
        description ? p({ class: css('_caption _fgmutedfg') }, description) : null
      )
    );

  const examples = [];

  examples.push(example('Basic', 'Encode a URL',
    QRCode({ value: 'https://decantr.ai' })
  ));

  examples.push(example('Custom Sizes', '80px vs 160px vs 240px',
    div({ class: css('_flex _aic _gap4') },
      QRCode({ value: 'https://decantr.ai', size: 80 }),
      QRCode({ value: 'https://decantr.ai', size: 160 }),
      QRCode({ value: 'https://decantr.ai', size: 240 })
    )
  ));

  examples.push(example('SVG Mode', 'Scalable vector output',
    QRCode({ value: 'https://decantr.ai', type: 'svg' })
  ));

  examples.push(example('Loading Status', 'Spinner overlay',
    QRCode({ value: 'https://decantr.ai', status: 'loading' })
  ));

  examples.push(example('Expired Status', 'Blur + refresh button',
    QRCode({ value: 'https://decantr.ai', status: 'expired', onRefresh: () => {} })
  ));

  examples.push(example('Scanned Status', 'Checkmark overlay',
    QRCode({ value: 'https://decantr.ai', status: 'scanned' })
  ));

  examples.push(example('Error Correction Levels', 'L / M / Q / H',
    div({ class: css('_flex _aic _gap4 _wrap') },
      ...['L', 'M', 'Q', 'H'].map(lv =>
        div({ class: css('_flex _col _aic _gap1') },
          QRCode({ value: 'https://decantr.ai', level: lv, size: 120 }),
          span({ class: css('_caption _fgmutedfg') }, 'Level ' + lv)
        )
      )
    )
  ));

  examples.push(example('No Border', 'Borderless QR code',
    QRCode({ value: 'https://decantr.ai', bordered: false })
  ));

  return div({ class: css('_flex _col _gap8') },
    showcaseSection('Examples',
      div({ class: css('_flex _col _gap4') }, ...examples)
    )
  );
}
