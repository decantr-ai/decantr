import type { ReactNode } from 'react';
import { BentoCard } from './bento-card';

interface VisualBriefCardProps {
  visualBrief?: string;
}

/** Common UI layout and component terms to auto-bold in visual briefs */
const BOLD_TERMS = new Set([
  'grid', 'row', 'column', 'card', 'badge', 'button', 'input', 'select',
  'icon', 'avatar', 'chip', 'header', 'footer', 'sidebar', 'nav', 'tab',
  'tabs', 'modal', 'drawer', 'tooltip', 'dropdown', 'menu', 'list',
  'table', 'form', 'section', 'panel', 'container', 'wrapper', 'flex',
  'responsive', 'mobile', 'tablet', 'desktop', 'heading', 'label',
  'breadcrumb', 'pagination', 'toggle', 'switch', 'checkbox', 'radio',
  'slider', 'progress', 'skeleton', 'spinner', 'toast', 'alert',
  'banner', 'overlay', 'popover', 'accordion',
]);

function highlightTerms(text: string): ReactNode[] {
  const words = text.split(/(\s+)/);
  const parts: ReactNode[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const stripped = word.replace(/[^a-zA-Z-]/g, '').toLowerCase();
    if (stripped && BOLD_TERMS.has(stripped)) {
      parts.push(<strong key={i} className="font-semibold text-d-text">{word}</strong>);
    } else {
      parts.push(word);
    }
  }

  return parts;
}

export function VisualBriefCard({ visualBrief }: VisualBriefCardProps) {
  if (!visualBrief) return null;

  return (
    <BentoCard span={2} label="Visual brief">
      <p className="d-label mb-3">Visual Brief</p>
      <div className="lum-quote text-[0.9375rem]">
        <p>{highlightTerms(visualBrief)}</p>
      </div>
    </BentoCard>
  );
}
