import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { onMount, onDestroy } from 'decantr/core';

const { div, nav, a, span } = tags;

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  container: css('_sticky _top[80px] _flex _col _gap2 _py4 _pr4'),
  label: css('_caption _fgmutedfg _uppercase _ls[0.06em] _fw[600] _pb2'),
  nav: css('_flex _col _gap0 _borderL _bcborder _pl3'),
  link: css('_textsm _fgmutedfg _nounder _py1 _trans[color_0.15s] _h:fgfg'),
  linkActive: css('_fgprimary _fw[500]'),
  indicator: css('_absolute _left[-1px] _w[2px] _h[20px] _bgprimary _r1 _trans[top_0.15s_ease]'),
};

/**
 * DocsToc — Right-side table of contents with scroll spy
 * @param {Object} props
 * @param {Array<{id: string, label: string, level: number}>} props.headings - Page headings
 * @param {number} [props.minHeadings=3] - Minimum headings to show TOC
 */
export function DocsToc({ headings = [], minHeadings = 3 } = {}) {
  // Don't render if not enough headings
  if (headings.length < minHeadings) {
    return div();
  }

  const [activeId, setActiveId] = createSignal(headings[0]?.id || '');
  const container = div({ class: styles.container });

  // Label
  container.appendChild(
    span({ class: styles.label }, 'On this page')
  );

  // Nav with indicator
  const navEl = nav({ class: `${styles.nav} _relative` });

  // Active indicator bar
  const indicator = div({ class: styles.indicator });
  indicator.style.top = '0px';
  navEl.appendChild(indicator);

  // Links
  const linkEls = [];
  for (const heading of headings) {
    const indent = heading.level > 2 ? css('_pl3') : '';
    const linkEl = a({
      href: `#${heading.id}`,
      class: `${styles.link} ${indent}`,
      onclick: (e) => {
        e.preventDefault();
        const target = document.getElementById(heading.id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Update URL hash without scrolling
          history.replaceState(null, '', `#${heading.id}`);
        }
      },
    }, heading.label);

    linkEls.push({ el: linkEl, id: heading.id });
    navEl.appendChild(linkEl);
  }

  container.appendChild(navEl);

  // Update active link styling
  createEffect(() => {
    const active = activeId();
    let activeIndex = 0;

    for (let i = 0; i < linkEls.length; i++) {
      const { el, id } = linkEls[i];
      const isActive = id === active;
      if (isActive) {
        el.className = `${styles.link} ${styles.linkActive}`;
        activeIndex = i;
      } else {
        const heading = headings.find(h => h.id === id);
        const indent = heading && heading.level > 2 ? css('_pl3') : '';
        el.className = `${styles.link} ${indent}`;
      }
    }

    // Move indicator
    indicator.style.top = `${activeIndex * 28 + 4}px`;
  });

  // Scroll spy using IntersectionObserver
  let observer;
  onMount(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const headingEls = headings
      .map(h => document.getElementById(h.id))
      .filter(Boolean);

    if (headingEls.length === 0) return;

    // Track visible headings
    const visibleHeadings = new Set();

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleHeadings.add(entry.target.id);
          } else {
            visibleHeadings.delete(entry.target.id);
          }
        }

        // Set active to first visible heading in document order
        for (const heading of headings) {
          if (visibleHeadings.has(heading.id)) {
            setActiveId(heading.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: 0,
      }
    );

    for (const el of headingEls) {
      observer.observe(el);
    }
  });

  onDestroy(() => {
    if (observer) observer.disconnect();
  });

  return container;
}

/**
 * Extract headings from a content element
 * @param {HTMLElement} contentEl - The content container
 * @returns {Array<{id: string, label: string, level: number}>}
 */
export function extractHeadings(contentEl) {
  if (!contentEl) return [];

  const headings = [];
  const els = contentEl.querySelectorAll('h2, h3');

  for (const el of els) {
    // Ensure heading has an ID
    if (!el.id) {
      el.id = el.textContent
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }

    headings.push({
      id: el.id,
      label: el.textContent,
      level: parseInt(el.tagName[1], 10),
    });
  }

  return headings;
}
