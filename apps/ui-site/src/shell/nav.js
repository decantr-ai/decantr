import { h } from '@decantr/ui/runtime';
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
    style: 'height: 56px; display: flex; align-items: center; padding: 0 24px; border-bottom: 1px solid rgba(255,255,255,0.1); background: var(--color-surface, #111); position: sticky; top: 0; z-index: 100; gap: 8px',
  });

  // Logo / brand
  const brand = link(
    { href: '/', exact: true, style: 'text-decoration: none; color: inherit; font-weight: 700; font-size: 16px; display: flex; align-items: center; gap: 8px; margin-right: auto' },
    '\u2B21 Decantr UI'
  );
  nav.appendChild(brand);

  // Nav links
  for (const { href, label } of NAV_LINKS) {
    const a = link(
      { href, activeClass: 'd-nav-active', style: 'text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; padding: 4px 12px; border-radius: 6px; transition: color 0.15s' },
      label
    );
    nav.appendChild(a);
  }

  // GitHub external link
  const gh = h('a', {
    href: GITHUB_URL,
    target: '_blank',
    rel: 'noopener noreferrer',
    style: 'text-decoration: none; color: rgba(255,255,255,0.7); font-size: 14px; padding: 4px 12px',
  }, 'GitHub');
  nav.appendChild(gh);

  return nav;
}
