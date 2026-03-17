import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { Button, Card, Input, Tabs, Badge, Switch, Slider, Avatar, Tooltip, Chip } from 'decantr/components';

const { section, div, h2, h3, p, span, a } = tags;

const PREVIEWS = [
  {
    label: 'Buttons',
    render: () => div({ class: css('_flex _row _gap3 _wrap _aic') },
      Button({ variant: 'primary' }, 'Primary'),
      Button({ variant: 'outline' }, 'Outline'),
      Button({ variant: 'ghost' }, 'Ghost'),
      Button({ variant: 'destructive' }, 'Destructive'),
      Button({ variant: 'primary', loading: true }, 'Loading'),
      Button({ variant: 'primary', size: 'sm' }, 'Small'),
    ),
  },
  {
    label: 'Form Controls',
    render: () => div({ class: css('_flex _col _gap4 _maxw[400px]') },
      Input({ placeholder: 'Enter your email...', type: 'email' }),
      div({ class: css('_flex _aic _gap4') },
        Switch({ label: 'Dark mode' }),
        Switch({ label: 'Notifications', checked: true }),
      ),
      Slider({ min: 0, max: 100, value: 65, showValue: true }),
    ),
  },
  {
    label: 'Cards & Badges',
    render: () => div({ class: css('_flex _row _gap4 _wrap') },
      Card({},
        div({ class: css('_flex _col _gap2 _p4') },
          div({ class: css('_flex _aic _gap2') },
            h3({ class: css('_heading6') }, 'Revenue'),
            Badge({ variant: 'success' }, '+12.5%'),
          ),
          p({ class: css('_heading3') }, '$48,290'),
          p({ class: css('_caption _fgmutedfg') }, 'vs $42,960 last month'),
        ),
      ),
      Card({},
        div({ class: css('_flex _col _gap2 _p4') },
          div({ class: css('_flex _aic _gap2') },
            h3({ class: css('_heading6') }, 'Users'),
            Badge({ variant: 'info' }, 'Active'),
          ),
          p({ class: css('_heading3') }, '2,847'),
          p({ class: css('_caption _fgmutedfg') }, '142 new this week'),
        ),
      ),
    ),
  },
  {
    label: 'Navigation',
    render: () => Tabs({
      tabs: [
        { id: 'overview', label: 'Overview', content: () => p({ class: css('_p4 _fgmutedfg') }, 'Dashboard overview with KPIs and charts') },
        { id: 'analytics', label: 'Analytics', content: () => p({ class: css('_p4 _fgmutedfg') }, 'Traffic and conversion analytics') },
        { id: 'settings', label: 'Settings', content: () => p({ class: css('_p4 _fgmutedfg') }, 'Application configuration') },
      ],
    }),
  },
];

export function ShowcaseSection() {
  const [active, setActive] = createSignal(0);

  const previewArea = div({ class: `ds-glass ${css('_p6 _r3 _minh[200px]')}` });
  const renderPreview = () => {
    previewArea.innerHTML = '';
    previewArea.appendChild(PREVIEWS[active()].render());
  };
  renderPreview();
  createEffect(renderPreview);

  const tabs = div({ class: css('_flex _row _gap2 _wrap') },
    ...PREVIEWS.map((item, i) => {
      const chip = Chip({
        label: item.label,
        variant: 'outline',
        size: 'sm',
        onClick: () => setActive(i),
      });
      createEffect(() => {
        chip.classList.toggle('d-chip-selected', active() === i);
      });
      return chip;
    }),
  );

  return section({ class: `ds-section ${css('_flex _col _aic _gap8')}`, id: 'showcase' },
    div({ class: css('_flex _col _aic _gap3 _tc _maxw[600px]') },
      span({ class: css('_caption _uppercase _ls[0.1em] _fgprimary _bold') }, 'Live Components'),
      h2({ class: 'ds-heading' }, 'See It In Action'),
      p({ class: css('_textlg _fgmutedfg _lhrelaxed') },
        '100+ production-ready components. Every one works out of the box, fully themed, fully accessible.'
      ),
    ),
    div({ class: css('_flex _col _gap4 _w100 _maxw[700px]') },
      tabs,
      previewArea,
    ),
  );
}
