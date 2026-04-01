import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { link } from '@decantr/ui/router';

const NAV_LINKS = [
  { href: '/components', label: 'Components' },
  { href: '/charts', label: 'Charts' },
  { href: '/icons', label: 'Icons' },
  { href: '/css', label: 'CSS' },
  { href: '/getting-started', label: 'Docs' },
];

const GITHUB_URL = 'https://github.com/decantr/decantr-monorepo';

export function Nav() {
  const nav = h('nav', {
    class: css('flex', 'aic', 'gap2', 'sticky', 'top0', 'z100'),
    style: 'height: 56px; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.1); background: var(--color-surface, #111)',
  });

  // Logo / brand
  const brand = link(
    { href: '/', exact: true, class: css('flex', 'aic', 'gap2', 'fontbold', 'mrauto'), style: 'text-decoration: none; color: inherit; font-size: 16px' },
    '\u2B21 Decantr UI'
  );
  nav.appendChild(brand);

  // Nav links
  for (const { href, label } of NAV_LINKS) {
    const a = link(
      { href, activeClass: 'd-nav-active', class: css('textsm', 'rounded'), style: 'text-decoration: none; color: rgba(255,255,255,0.7); padding: 4px 12px; transition: color 0.15s' },
      label
    );
    nav.appendChild(a);
  }

  // GitHub external link
  const gh = h('a', {
    href: GITHUB_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
    class: css('textsm'),
    style: 'text-decoration: none; color: rgba(255,255,255,0.7); padding: 4px 12px',
  }, 'GitHub');
  nav.appendChild(gh);

  return nav;
}
