import { h } from '../runtime/index.js';
import { css } from '../css/index.js';
import { Button } from '../components/button.js';
import { Card } from '../components/card.js';
import { Badge } from '../components/badge.js';
import type { Child } from '../types.js';

export type PatternRenderer = (props: PatternRenderProps) => HTMLElement;

export interface PatternRenderProps {
  dna: { style: string; mode: string; shape: string; density: string; contentGap: string };
  props: Record<string, unknown>;
  slots: Record<string, () => HTMLElement>;
}

const renderers = new Map<string, PatternRenderer>();

export function registerPattern(id: string, renderer: PatternRenderer): void {
  renderers.set(id, renderer);
}

export function getPatternRenderer(id: string): PatternRenderer | undefined {
  return renderers.get(id);
}

export function hasPattern(id: string): boolean {
  return renderers.has(id);
}

/** Fallback renderer for unregistered patterns */
export function fallbackRenderer(patternId: string): HTMLElement {
  return h('section', {
    class: css('_p6 _border _border-subtle _rounded _flex _col _gap2'),
    'data-pattern': patternId,
  },
    h('p', { class: css('_text-sm _text-muted') }, `Pattern: ${patternId}`),
    h('p', { class: css('_text-xs _text-muted') }, 'No renderer registered for this pattern.'),
  );
}

// ─── Density helpers ─────────────────────────────────────────

function densityPadding(density: string): string {
  switch (density) {
    case 'compact': return '_py6 _px4';
    case 'spacious': return '_py16 _px8';
    default: return '_py12 _px6';
  }
}

function densityHeading(density: string): string {
  switch (density) {
    case 'compact': return '_text-3xl';
    case 'spacious': return '_text-6xl';
    default: return '_text-5xl';
  }
}

function densitySubheading(density: string): string {
  switch (density) {
    case 'compact': return '_text-base';
    case 'spacious': return '_text-2xl';
    default: return '_text-lg';
  }
}

function densityButtonSize(density: string): string {
  switch (density) {
    case 'compact': return 'default';
    case 'spacious': return 'lg';
    default: return 'lg';
  }
}

// ─── Built-in pattern: hero ──────────────────────────────────

registerPattern('hero', ({ dna, props, slots }) => {
  const title = (props.title as string) || 'Welcome';
  const subtitle = (props.subtitle as string) || '';
  const ctaText = (props.ctaText as string) || '';
  const ctaAction = props.ctaAction as (() => void) | undefined;

  const children: Child[] = [
    h('h1', { class: css(`${densityHeading(dna.density)} _font-bold`) }, title),
  ];

  if (subtitle) {
    children.push(
      h('p', { class: css(`${densitySubheading(dna.density)} _text-muted _mt2`) }, subtitle),
    );
  }

  if (ctaText) {
    children.push(
      h('div', { class: css('_mt4') },
        Button({
          variant: 'primary',
          size: densityButtonSize(dna.density),
          onclick: ctaAction,
        }, ctaText),
      ),
    );
  }

  if (slots.extra) {
    children.push(slots.extra());
  }

  return h('section', {
    class: css(`_flex _col _items-center _text-center _gap${dna.contentGap} ${densityPadding(dna.density)}`),
    'data-pattern': 'hero',
  }, ...children);
});

// ─── Built-in pattern: feature-grid ──────────────────────────

registerPattern('feature-grid', ({ dna, props }) => {
  const features = (props.features as Array<{ title: string; description: string; icon?: string }>) || [];

  const gridCols = features.length <= 2 ? '_gc2' : features.length === 4 ? '_gc2 _sm:gc2' : '_gc3';

  const cards = features.map((feature) => {
    const cardChildren: Child[] = [];
    if (feature.icon) {
      cardChildren.push(
        h('div', { class: css('_text-2xl _mb2') }, feature.icon),
      );
    }
    cardChildren.push(
      h('p', { class: css('_text-sm _text-muted') }, feature.description),
    );
    return Card({ title: feature.title, size: dna.density === 'compact' ? 'sm' : 'default' }, ...cardChildren);
  });

  return h('section', {
    class: css(`_grid ${gridCols} _gap${dna.contentGap} ${densityPadding(dna.density)}`),
    'data-pattern': 'feature-grid',
  }, ...cards);
});

// ─── Built-in pattern: cta-section ───────────────────────────

registerPattern('cta-section', ({ dna, props }) => {
  const heading = (props.heading as string) || (props.title as string) || '';
  const description = (props.description as string) || '';
  const primaryText = (props.primaryText as string) || '';
  const secondaryText = (props.secondaryText as string) || '';
  const primaryAction = props.primaryAction as (() => void) | undefined;
  const secondaryAction = props.secondaryAction as (() => void) | undefined;

  const children: Child[] = [];

  if (heading) {
    children.push(h('h2', { class: css('_text-3xl _font-bold') }, heading));
  }
  if (description) {
    children.push(h('p', { class: css('_text-lg _text-muted _mt2') }, description));
  }

  const buttons: Child[] = [];
  if (primaryText) {
    buttons.push(Button({
      variant: 'primary',
      size: densityButtonSize(dna.density),
      onclick: primaryAction,
    }, primaryText));
  }
  if (secondaryText) {
    buttons.push(Button({
      variant: 'outline',
      size: densityButtonSize(dna.density),
      onclick: secondaryAction,
    }, secondaryText));
  }

  if (buttons.length) {
    children.push(h('div', { class: css(`_flex _gap${dna.contentGap} _mt4 _justify-center`) }, ...buttons));
  }

  return h('section', {
    class: css(`_flex _col _items-center _text-center _gap${dna.contentGap} ${densityPadding(dna.density)}`),
    'data-pattern': 'cta-section',
  }, ...children);
});

// ─── Built-in pattern: nav-header ────────────────────────────

registerPattern('nav-header', ({ dna, props }) => {
  const brand = (props.brand as string) || '';
  const links = (props.links as Array<{ label: string; href: string }>) || [];

  const navChildren: Child[] = [];

  if (brand) {
    navChildren.push(h('div', { class: css('_font-bold _text-lg') }, brand));
  }

  if (links.length) {
    const linkEls = links.map((link) =>
      h('a', { href: link.href, class: css('_text-sm _text-muted _h:text-fg _transtiming') }, link.label)
    );
    navChildren.push(h('nav', { class: css(`_flex _gap${dna.contentGap} _items-center`) }, ...linkEls));
  }

  return h('header', {
    class: css(`_flex _justify-between _items-center _px6 ${dna.density === 'compact' ? '_py2' : '_py4'} _border-b _border-subtle`),
    'data-pattern': 'nav-header',
  }, ...navChildren);
});

// ─── Built-in pattern: footer ────────────────────────────────

registerPattern('footer', ({ dna, props }) => {
  const linkGroups = (props.links as Array<{ title: string; links: Array<{ label: string; href: string }> }>) || [];
  const copyright = (props.copyright as string) || '';

  const children: Child[] = [];

  if (linkGroups.length) {
    const groups = linkGroups.map((group) => {
      const groupLinks = group.links.map((link) =>
        h('a', { href: link.href, class: css('_text-sm _text-muted _h:text-fg') }, link.label)
      );
      return h('div', { class: css(`_flex _col _gap2`) },
        h('h4', { class: css('_text-sm _font-semibold') }, group.title),
        ...groupLinks,
      );
    });
    children.push(
      h('div', { class: css(`_grid _gc${Math.min(linkGroups.length, 4)} _gap${dna.contentGap}`) }, ...groups)
    );
  }

  if (copyright) {
    children.push(
      h('div', { class: css('_text-sm _text-muted _mt4 _pt4 _border-t _border-subtle') }, copyright),
    );
  }

  return h('footer', {
    class: css(`_px6 ${densityPadding(dna.density)} _border-t _border-subtle`),
    'data-pattern': 'footer',
  }, ...children);
});

// ─── Built-in pattern: content-section ───────────────────────

registerPattern('content-section', ({ dna, props, slots }) => {
  const heading = (props.heading as string) || (props.title as string) || '';
  const body = (props.body as string) || '';

  const children: Child[] = [];

  if (heading) {
    children.push(h('h2', { class: css('_text-3xl _font-bold') }, heading));
  }
  if (body) {
    children.push(h('p', { class: css('_text-base _text-muted') }, body));
  }
  if (slots.content) {
    children.push(slots.content());
  }

  return h('section', {
    class: css(`_flex _col _gap${dna.contentGap} ${densityPadding(dna.density)}`),
    'data-pattern': 'content-section',
  }, ...children);
});
