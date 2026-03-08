import { mount } from 'decantr/core';
import { createSignal, createEffect } from 'decantr/state';
import { css, setTheme, getThemeList } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Select } from 'decantr/components';
import { ActionSection } from './sections/action.js';
import { InputSection } from './sections/form.js';
import { DisplaySection } from './sections/display.js';
import { LayoutSection } from './sections/layout.js';
import { FeedbackSection } from './sections/feedback.js';
import { ChartSection } from './sections/charts.js';

const { div, header, main, nav, h1, span, button } = tags;

const CATEGORIES = [
  { id: 'action', label: 'Action', children: ['Button', 'Dropdown', 'Spinner'], section: ActionSection },
  { id: 'input', label: 'Input', children: ['Input', 'Textarea', 'Checkbox', 'Switch', 'Select', 'Combobox', 'RadioGroup', 'Slider'], section: InputSection },
  { id: 'display', label: 'Display', children: ['Card', 'Badge', 'Table', 'Avatar', 'Progress', 'Skeleton', 'Chip'], section: DisplaySection },
  { id: 'layout', label: 'Layout', children: ['Tabs', 'Accordion', 'Separator', 'Breadcrumb', 'Pagination'], section: LayoutSection },
  { id: 'feedback', label: 'Feedback', children: ['Modal', 'Drawer', 'Popover', 'Tooltip', 'Alert', 'Toast'], section: FeedbackSection },
  { id: 'chart', label: 'Chart', children: ['Line', 'Bar', 'Area', 'Pie', 'Sparkline'], section: ChartSection }
];

function Sidebar(activeCategory, setActiveCategory) {
  return nav({ class: css('_flex _col _py4'), style: 'width:200px;min-width:200px;height:calc(100vh - 49px);overflow-y:auto;border-right:1px solid var(--c5);background:var(--c0)' },
    ...CATEGORIES.map(cat =>
      div({ class: css('_flex _col _mb2') },
        button({
          class: css('_t12 _bold _tl _px4 _py2 _fg4'),
          style: 'background:none;border:none;text-transform:uppercase;letter-spacing:0.05em;cursor:pointer',
          onclick: () => setActiveCategory(cat.id)
        }, cat.label),
        ...cat.children.map(child =>
          button({
            class: css('_t12 _tl _pl6 _pr4 _py1'),
            style: () => `background:none;border:none;cursor:pointer;color:${activeCategory() === cat.id ? 'var(--c1)' : 'var(--c4)'}`,
            onclick: () => setActiveCategory(cat.id)
          }, child)
        )
      )
    )
  );
}

function App() {
  const themes = getThemeList();
  const [activeTheme, setActiveTheme] = createSignal('light');
  const [activeCategory, setActiveCategory] = createSignal('action');

  createEffect(() => setTheme(activeTheme()));

  const themeOptions = themes.map(t => ({ value: t.id, label: t.name }));

  const contentArea = div({ class: css('_p6'), style: 'max-width:1080px;width:100%' });

  function renderSection() {
    contentArea.innerHTML = '';
    const cat = CATEGORIES.find(c => c.id === activeCategory());
    if (cat) contentArea.appendChild(cat.section());
  }

  createEffect(renderSection);

  return div({ class: css('_flex _col'), style: 'height:100vh' },
    header({ class: css('_flex _aic _jcsb _px6 _py3'), style: 'background:var(--c0);border-bottom:1px solid var(--c5);min-height:49px' },
      h1({ class: css('_t14 _bold'), style: 'letter-spacing:-0.025em' }, 'decantr workbench'),
      div({ class: css('_flex _aic _gap3') },
        span({ class: css('_t12 _fg4') }, 'Theme:'),
        Select({
          options: themeOptions,
          value: activeTheme,
          onchange: v => setActiveTheme(v)
        })
      )
    ),
    div({ class: css('_flex _grow'), style: 'overflow:hidden' },
      Sidebar(activeCategory, setActiveCategory),
      main({ class: css('_grow'), style: 'overflow-y:auto;height:calc(100vh - 49px)' },
        contentArea
      )
    )
  );
}

mount(document.getElementById('app'), App);
