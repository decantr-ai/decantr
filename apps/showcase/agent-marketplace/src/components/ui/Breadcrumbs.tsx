import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={css('_flex _aic _gap1')}>
      {items.map((item, i) => (
        <span key={i} className={css('_flex _aic _gap1')}>
          {i > 0 && <ChevronRight size={14} style={{ color: 'var(--d-text-muted)' }} />}
          {item.href ? (
            <Link
              to={item.href}
              className={css('_textsm') + ' mono-data'}
              style={{ color: 'var(--d-text-muted)', textDecoration: 'none' }}
            >
              {item.label}
            </Link>
          ) : (
            <span className={css('_textsm') + ' mono-data'} style={{ color: 'var(--d-text)' }}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
