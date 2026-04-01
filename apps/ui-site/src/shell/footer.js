import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';

const FOOTER_LINKS = [
  { href: 'https://github.com/decantr/decantr-monorepo', label: 'GitHub' },
  { href: 'https://www.npmjs.com/org/decantr', label: 'npm' },
  { href: '/getting-started', label: 'Docs', internal: true },
];

export function Footer() {
  const footer = h('footer', {
    class: css('flex', 'aic', 'jcsb', 'textsm', 'fgmuted'),
    style: 'padding: 32px 24px; border-top: 1px solid rgba(255,255,255,0.1)',
  });

  // Links
  const links = h('div', { class: css('flex', 'gap5') });
  for (const { href, label } of FOOTER_LINKS) {
    const a = h('a', {
      href,
      target: href.startsWith('http') ? '_blank' : undefined,
      rel: href.startsWith('http') ? 'noopener noreferrer' : undefined,
      style: 'color: rgba(255,255,255,0.5); text-decoration: none; transition: color 0.15s',
    }, label);
    links.appendChild(a);
  }
  footer.appendChild(links);

  // Copyright
  footer.appendChild(h('span', null, '\u00A9 2026 Decantr'));

  return footer;
}
