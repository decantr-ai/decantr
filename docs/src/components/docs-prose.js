/**
 * Docs prose components — styled content elements for documentation pages
 * Includes: headings, paragraphs, code blocks, callouts, prompt examples
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { icon } from 'decantr/components';

const { div, p, span, h2, h3, pre, code, a, ul, li, strong } = tags;

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  // Prose container
  prose: css('_flex _col _gap6'),

  // Headings
  h2: css('_heading3 _mt4 _mb2 _fgfg _scroll[mt-20]'),
  h3: css('_heading4 _mt3 _mb2 _fgfg _scroll[mt-20]'),

  // Paragraph
  paragraph: css('_textbase _lhrelaxed _fgfg/90'),

  // Links
  link: css('_fgprimary _underline _h:fgprimary/80 _trans[color_0.15s]'),

  // Code inline
  codeInline: css('_px1 _py[2px] _r1 _bgmuted/50 _fgprimary _textsm _font[var(--d-font-mono)]'),

  // Code block
  codeBlock: css('_relative _r2 _p4 _bgmuted/30 _border _bcborder/50 _overflow[auto] _font[var(--d-font-mono)] _textsm _lh[1.6]'),
  codeBlockHeader: css('_flex _aic _jcsb _px4 _py2 _bgmuted/20 _borderB _bcborder/50 _r[8px_8px_0_0]'),
  codeBlockLang: css('_caption _fgmutedfg _uppercase'),
  codeBlockCopy: css('_flex _aic _gap1 _px2 _py1 _r1 _textsm _fgmutedfg _bg[transparent] _border _bcborder/30 _cursor[pointer] _trans[all_0.15s] _h:bgmuted/30 _h:fgfg'),
  codeBlockBody: css('_p4 _overflow[auto]'),

  // Lists
  ul: css('_flex _col _gap2 _pl5'),
  li: css('_textbase _lhrelaxed _fgfg/90 _list[disc]'),

  // Callout base
  callout: css('_flex _gap3 _p4 _r2 _border'),
  calloutIcon: css('_shrink0 _mt[2px]'),
  calloutContent: css('_flex _col _gap1 _flex1'),
  calloutTitle: css('_label _bold'),
  calloutBody: css('_textsm _lhrelaxed'),

  // Callout variants
  calloutTip: css('_bgprimary/10 _bcprimary/30'),
  calloutTipIcon: css('_fgprimary'),
  calloutWarning: css('_bgwarning/10 _bcwarning/30'),
  calloutWarningIcon: css('_fgwarning'),
  calloutInfo: css('_bginfo/10 _bcinfo/30'),
  calloutInfoIcon: css('_fginfo'),

  // Prompt example
  promptBox: css('_flex _col _gap2 _p4 _r2 _bg[linear-gradient(135deg,var(--c-primary)/10,var(--c-primary)/5)] _border _bcprimary/30'),
  promptLabel: css('_flex _aic _gap2 _textsm _fgprimary _fw[500]'),
  promptText: css('_textbase _lhrelaxed _fgfg _italic'),

  // Related links
  relatedSection: css('_flex _col _gap3 _mt8 _pt6 _borderT _bcborder/50'),
  relatedTitle: css('_label _fgmutedfg _uppercase _ls[0.06em]'),
  relatedLinks: css('_flex _col _gap2'),
  relatedLink: css('_flex _aic _gap2 _px3 _py2 _r1 _bgmuted/20 _nounder _fgfg _trans[all_0.15s] _h:bgmuted/40'),
};

// ── Prose Container ─────────────────────────────────────────────────
export function Prose(...children) {
  return div({ class: styles.prose }, ...children);
}

// ── Headings ────────────────────────────────────────────────────────
export function H2(text, id) {
  const slug = id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return h2({ id: slug, class: styles.h2 }, text);
}

export function H3(text, id) {
  const slug = id || text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return h3({ id: slug, class: styles.h3 }, text);
}

// ── Paragraph ───────────────────────────────────────────────────────
export function P(...children) {
  return p({ class: styles.paragraph }, ...children);
}

// ── List ────────────────────────────────────────────────────────────
export function List(...items) {
  return ul({ class: styles.ul },
    ...items.map(item => li({ class: styles.li }, item))
  );
}

// ── Inline Code ─────────────────────────────────────────────────────
export function Code(text) {
  return code({ class: styles.codeInline }, text);
}

// ── Code Block ──────────────────────────────────────────────────────
export function CodeBlock({ lang = 'js', code: codeText }) {
  const container = div({ class: styles.codeBlock });

  // Header with language and copy button
  const header = div({ class: styles.codeBlockHeader },
    span({ class: styles.codeBlockLang }, lang),
    (() => {
      const btn = div({ class: styles.codeBlockCopy },
        icon('copy', { size: '14px' }),
        span('Copy'),
      );
      btn.onclick = () => {
        navigator.clipboard.writeText(codeText);
        btn.querySelector('span').textContent = 'Copied!';
        setTimeout(() => {
          btn.querySelector('span').textContent = 'Copy';
        }, 2000);
      };
      return btn;
    })(),
  );

  // Code body
  const body = pre({ class: styles.codeBlockBody },
    code({ class: css('_fgfg') }, codeText),
  );

  container.appendChild(header);
  container.appendChild(body);
  return container;
}

// ── Callout ─────────────────────────────────────────────────────────
export function Callout({ type = 'tip', title } = {}, ...children) {
  const icons = { tip: 'lightbulb', warning: 'alert-triangle', info: 'info' };
  const variantStyles = {
    tip: { box: styles.calloutTip, icon: styles.calloutTipIcon },
    warning: { box: styles.calloutWarning, icon: styles.calloutWarningIcon },
    info: { box: styles.calloutInfo, icon: styles.calloutInfoIcon },
  };
  const variant = variantStyles[type] || variantStyles.tip;

  return div({ class: `${styles.callout} ${variant.box}` },
    div({ class: `${styles.calloutIcon} ${variant.icon}` },
      icon(icons[type] || 'lightbulb', { size: '18px' }),
    ),
    div({ class: styles.calloutContent },
      title && span({ class: styles.calloutTitle }, title),
      div({ class: styles.calloutBody }, ...children),
    ),
  );
}

// ── Prompt Example ──────────────────────────────────────────────────
export function PromptExample(promptText) {
  return div({ class: styles.promptBox },
    div({ class: styles.promptLabel },
      icon('message-square', { size: '16px' }),
      span('Try this prompt:'),
    ),
    p({ class: styles.promptText }, `"${promptText}"`),
  );
}

// ── Related Links ───────────────────────────────────────────────────
export function RelatedLinks(links = []) {
  if (links.length === 0) return null;

  return div({ class: styles.relatedSection },
    span({ class: styles.relatedTitle }, 'Related'),
    div({ class: styles.relatedLinks },
      ...links.map(({ label, path, iconName = 'arrow-right' }) =>
        a({ href: path, class: styles.relatedLink },
          icon(iconName, { size: '16px', class: css('_fgmutedfg') }),
          span(label),
        )
      ),
    ),
  );
}

// ── Link ────────────────────────────────────────────────────────────
export function Link(text, href) {
  return a({ href, class: styles.link }, text);
}

// ── Strong ──────────────────────────────────────────────────────────
export function Strong(text) {
  return strong({ class: css('_fw[600]') }, text);
}
