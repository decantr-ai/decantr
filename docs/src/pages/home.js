import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { Button, Separator, icon } from 'decantr/components';
import { link } from 'decantr/router';
import { VisionComparisonSection } from '../sections/vision-comparison.js';
import { BentoFeaturesSection } from '../sections/bento-features.js';
import { ShowcasePreviewSection } from '../sections/showcase-preview.js';

const { div, h1, h2, p, span, a, section, footer, h3 } = tags;

// ─── Section 1: Vision Hero ───────────────────────────────────────
function VisionHero() {
  return section({ class: css('_minh[100vh] _relative d-mesh _flex _aic _jcc _px6 _py24') },
    // Decorative orbs
    span({ class: css('aura-orb _w[400px] _h[400px] _top[-10%] _left[-5%] _bg[rgba(254,68,116,0.15)]') }),
    span({ class: css('aura-orb _w[300px] _h[300px] _bottom[10%] _right[-5%] _bg[rgba(10,243,235,0.1)]') }),
    span({ class: css('aura-orb _w[250px] _h[250px] _top[30%] _right[20%] _bg[rgba(101,0,198,0.1)]') }),
    // Content
    div({ class: css('_flex _col _aic _tc _gap8 _relative _z10 _mw[900px]') },
      h1({ class: css('d-heading-hero') }, 'Frameworks were built for humans. Decantr is built for AI.'),
      p({ class: css('_textxl _fgmuted _mw[640px] _lh[1.6]') },
        'The AI UI-native web framework. Registry-driven generation, signal reactivity, and 100+ components — all designed for LLMs to generate, read, and maintain.'
      ),
      div({ class: css('_flex _gap4 _wrap _jcc') },
        Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),
        link({ href: '/showcase', class: css('_nounder') },
          Button({ variant: 'outline', size: 'lg' }, 'View Showcase')
        )
      )
    )
  );
}

// ─── Section 2: Process Section ───────────────────────────────────
function ProcessSection() {
  const stages = [
    { name: 'POUR', desc: 'Describe what you want' },
    { name: 'SETTLE', desc: 'AI decomposes layers' },
    { name: 'CLARIFY', desc: 'Write the Essence' },
    { name: 'DECANT', desc: 'Resolve layout' },
    { name: 'SERVE', desc: 'Generate code' },
    { name: 'AGE', desc: 'Guard against drift' },
  ];

  return section({ class: css('_py16 _px6 _bcborder _borderT _borderB') },
    div({ class: css('_mw[1100px] _mx[auto] _flex _col _gap6 _aic') },
      span({ class: css('_textsm _fgmuted _uppercase _tracking[0.15em]') }, 'The Decantation Process'),
      div({ class: css('_flex _wrap _jcc _gap4') },
        ...stages.map((s, i) =>
          div({ class: css('_flex _aic _gap3') },
            div({ class: css('_flex _col _aic') },
              span({ class: css('_textbase _fgprimary _bold') }, s.name),
              span({ class: css('_textsm _fgmuted') }, s.desc)
            ),
            i < stages.length - 1 ? icon('arrow-right', { class: css('_fgmuted/50') }) : null
          )
        )
      )
    )
  );
}

// ─── Section 6: CTA ──────────────────────────────────────────────
function CtaSection() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _relative d-mesh') },
    span({ class: css('aura-orb _w[300px] _h[300px] _top[10%] _right[-5%] _bg[rgba(254,68,116,0.12)]') }),
    span({ class: css('aura-orb _w[200px] _h[200px] _bottom[20%] _left[-3%] _bg[rgba(10,243,235,0.08)]') }),
    h2({ class: css('_heading1 _fgfg _mw[700px]') }, 'Start building today'),
    p({ class: css('_textlg _fgmuted _mw[540px] _lh[1.6]') },
      'Join the community of developers shipping faster with the AI-native web framework. Free and open source.'
    ),
    div({ class: css('_flex _gap4 _wrap _jcc') },
      Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),
      a({ href: '#/docs', class: css('_nounder') },
        Button({ variant: 'outline', size: 'lg' }, icon('book-open'), 'Read the Docs')
      )
    )
  );
}

// ─── Section 7: Footer ───────────────────────────────────────────
function FooterSection() {
  const linkGroup = (title, links) =>
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_textsm _bold _fgfg') }, title),
      ...links.map(l =>
        a({ href: l.href, class: css('_textsm _fgmuted _h:fgfg _nounder _trans[color_0.2s_ease]') }, l.label)
      )
    );

  return footer({ class: css('_bcborder _borderT') },
    div({ class: css('_grid _gc1 _md:gc4 _gap8 _py12 _px6 _mw[1100px] _mx[auto]') },
      div({ class: css('_flex _col _gap3') },
        span({ class: css('_textlg _bold d-gradient-text') }, 'Decantr'),
        p({ class: css('_textsm _fgmuted _mw[240px]') }, 'The AI-native web framework for building stunning applications.'),
        div({ class: css('_flex _gap3 _mt2') },
          a({ href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener', 'aria-label': 'GitHub', class: css('_fgmuted _h:fgfg') }, icon('github')),
          a({ href: '#', 'aria-label': 'X', class: css('_fgmuted _h:fgfg') }, icon('x-brand')),
          a({ href: '#', 'aria-label': 'Discord', class: css('_fgmuted _h:fgfg') }, icon('message-circle'))
        )
      ),
      linkGroup('Product', [
        { label: 'Features', href: '#features' },
        { label: 'Components', href: '#components' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#changelog' }
      ]),
      linkGroup('Resources', [
        { label: 'Documentation', href: '#docs' },
        { label: 'Examples', href: '#examples' },
        { label: 'Blog', href: '#blog' },
        { label: 'Community', href: '#community' }
      ]),
      linkGroup('Company', [
        { label: 'About', href: '#about' },
        { label: 'Careers', href: '#careers' },
        { label: 'Contact', href: '#contact' },
        { label: 'Privacy', href: '#privacy' }
      ])
    ),
    Separator({}),
    div({ class: css('_flex _aic _jcc _py4 _px6') },
      p({ class: css('_textxs _fgmuted') }, `\u00A9 ${new Date().getFullYear()} Decantr. All rights reserved.`)
    )
  );
}

// ─── Page Composition ────────────────────────────────────────────
export function HomePage() {
  return div({ class: css('_flex _col _gap0 _overflow[auto] _flex1 d-page-enter') },
    VisionHero(),                // Section 1: Vision statement
    ProcessSection(),            // Section 2: Decantation process
    VisionComparisonSection(),   // Section 3: Code comparison
    BentoFeaturesSection(),      // Section 4: Bento features
    ShowcasePreviewSection(),    // Section 5: Showcase preview
    CtaSection(),                // Section 6: CTA
    FooterSection()              // Section 7: Footer
  );
}
