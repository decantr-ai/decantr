import { h } from '@decantr/ui/runtime';

const FOOTER_LINKS = [
  { href: 'https://github.com/decantr/decantr-monorepo', label: 'GitHub' },
  { href: 'https://www.npmjs.com/org/decantr', label: 'npm' },
  { href: '/getting-started', label: 'Docs', internal: true },
];

export function Footer() {
  const footer = h('footer', {
    style: 'padding: 32px 24px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: rgba(255,255,255,0.4)',
  });

  // Links
  const links = h('div', { style: 'display: flex; gap: 20px' });
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
