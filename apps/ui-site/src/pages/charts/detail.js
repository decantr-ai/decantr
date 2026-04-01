import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { navigate } from '@decantr/ui/router';
import { getStory } from '@decantr/ui-catalog';
import { renderVariants, renderUsage } from '@decantr/ui-catalog/renderer';
import { Badge } from '@decantr/ui/components';

export function ChartDetail(params) {
  const slug = params.slug;

  const container = h('div', { class: css('_flex _col _gap8 _p6 _max-w-5xl _mx-auto') });

  const story = getStory(slug);

  if (!story) {
    const notFound = h('div', { class: css('_flex _col _items-center _justify-center _gap4 _py16') });
    notFound.appendChild(h('h1', { class: css('_text-2xl _font-bold') }, 'Chart not found'));
    notFound.appendChild(h('p', { class: css('_text-muted') }, `No chart with slug "${slug}" exists in the catalog.`));
    const backBtn = h('button', {
      class: css('_px4 _py2 _rounded _bg-primary _text-on-primary _cursor-pointer _border-none _font-medium'),
      onclick: () => navigate('/charts'),
    }, 'Back to Charts');
    notFound.appendChild(backBtn);
    container.appendChild(notFound);
    return container;
  }

  // Back link
  const backLink = h('button', {
    class: css('_text-sm _text-muted _cursor-pointer _border-none _bg-transparent _hover:text-default _transition'),
    onclick: () => navigate('/charts'),
  }, '\u2190 All Charts');
  container.appendChild(backLink);

  // Header
  const header = h('div', { class: css('_flex _col _gap2') });
  header.appendChild(h('h1', { class: css('_text-3xl _font-bold') }, story.title));
  header.appendChild(h('p', { class: css('_text-muted _text-lg') }, story.description));
  header.appendChild(Badge({ variant: 'outline' }, 'Charts'));
  container.appendChild(header);

  // Variants section
  const variantsSection = h('section', { class: css('_flex _col _gap3') });
  variantsSection.appendChild(h('h2', { class: css('_text-xl _font-semibold') }, 'Variants'));
  variantsSection.appendChild(renderVariants(story));
  container.appendChild(variantsSection);

  // Usage section
  const usageEl = renderUsage(story);
  if (usageEl) {
    const usageSection = h('section', { class: css('_flex _col _gap3') });
    usageSection.appendChild(h('h2', { class: css('_text-xl _font-semibold') }, 'Usage'));
    usageSection.appendChild(usageEl);
    container.appendChild(usageSection);
  }

  return container;
}
