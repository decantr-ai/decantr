import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { footer, div, a, p, span, img } = tags;

export function SiteFooter() {
  return footer({ class: css('_flex _col _aic _gap6 _py12 _px8'), style: 'border-top:1px solid var(--d-border)' },
    div({ class: css('_flex _row _aic _gap4') },
      img({ src: './images/logo.svg', alt: 'decantr', style: 'width:32px;height:auto' }),
      span({ style: 'font-size:1.25rem;font-weight:700;letter-spacing:-0.02em;color:var(--d-fg)' },
        'decantr',
        span({ class: 'ds-pink' }, '.'),
        'ai',
      ),
    ),

    div({ class: css('_flex _row _aic _gap6') },
      a({
        href: 'https://github.com/decantr-ai/decantr',
        target: '_blank',
        rel: 'noopener',
        class: css('_flex _row _aic _gap2'),
        style: 'color:var(--d-muted-fg);text-decoration:none;font-size:0.875rem;transition:color 0.15s',
        onmouseenter: (e) => e.currentTarget.style.color = 'var(--d-accent)',
        onmouseleave: (e) => e.currentTarget.style.color = 'var(--d-muted-fg)',
      },
        icon('code', { size: '16px' }),
        'GitHub',
      ),
      span({ style: 'color:var(--d-border-strong)' }, '|'),
      span({ style: 'color:var(--d-muted);font-size:0.875rem' }, 'Docs \u2014 Coming Soon'),
      span({ style: 'color:var(--d-border-strong)' }, '|'),
      span({ style: 'color:var(--d-muted);font-size:0.875rem' }, 'Discord \u2014 Coming Soon'),
    ),

    p({ style: 'color:var(--d-muted);font-size:0.75rem' },
      '\u00A9 2026 decantr. AI-first web framework. Built with decantr.',
    ),
  );
}
