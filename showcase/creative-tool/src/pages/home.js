import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Badge, Button, Card, Marquee, Separator, Statistic, icon } from 'decantr/components';
import { navigate } from 'decantr/router';

const { div, h1, h2, h3, p, span, a, section, footer } = tags;

// ─── Section 1: Brand Hero ──────────────────────────────────────
function BrandHero() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _minh[100vh] _jcc _relative cy-pastel-mesh') },
    // Decorative blobs
    span({ class: css('cy-blob _w[400px] _h[400px] _top[-10%] _left[-5%] _bg[rgba(167,139,250,0.2)]') }),
    span({ class: css('cy-blob _w[300px] _h[300px] _bottom[10%] _right[-5%] _bg[rgba(103,232,249,0.15)]') }),
    span({ class: css('cy-blob _w[250px] _h[250px] _top[30%] _right[20%] _bg[rgba(253,164,175,0.12)]') }),
    // Content
    Badge({ variant: 'outline', icon: 'palette', class: css('cy-bounce') }, 'Color Palette Generator'),
    h1({ class: css('_heading1 d-gradient-text _mw[800px]') }, 'Craft beautiful color palettes in seconds'),
    p({ class: css('_textlg _fgmuted _mw[580px] _lh[1.6]') },
      'Generate harmonious palettes from any base color. Explore complementary, analogous, triadic, and monochromatic combinations with a soft, tactile interface.'
    ),
    div({ class: css('_flex _gap3 _wrap _jcc') },
      Button({ variant: 'primary', size: 'lg', class: css('cy-glow cy-squish'), onclick: () => navigate('/workspace') },
        icon('palette'), 'Open Workspace'
      ),
      Button({ variant: 'outline', size: 'lg', class: css('cy-squish'), onclick: () => navigate('/explore') },
        icon('grid'), 'Browse Palettes'
      )
    )
  );
}

// ─── Section 2: Feature Grid ────────────────────────────────────
function FeatureGrid() {
  const features = [
    { ic: 'droplet', title: 'Smart Harmony', desc: 'Generate complementary, analogous, triadic, and split-complementary palettes from any base color.' },
    { ic: 'eye', title: 'Contrast Checker', desc: 'WCAG-compliant contrast ratios for every color pair. Ensure your palettes are accessible.' },
    { ic: 'copy', title: 'One-Click Export', desc: 'Copy hex, RGB, or HSL values instantly. Export palettes as CSS variables or JSON.' },
    { ic: 'layers', title: 'Palette Collections', desc: 'Browse curated collections by mood — warm, cool, pastel, vibrant, and earthy.' },
    { ic: 'sliders', title: 'Fine Tuning', desc: 'Adjust hue, saturation, and lightness with intuitive controls. Real-time preview.' },
    { ic: 'heart', title: 'Save Favorites', desc: 'Bookmark your best palettes and build a personal library of go-to color schemes.' },
  ];

  return section({ class: css('_flex _col _gap8 _py24 _px6 _aic') },
    div({ class: css('_tc _mw[580px]') },
      h2({ class: css('_heading2 d-gradient-text _mb3') }, 'Everything you need for color'),
      p({ class: css('_body _fgmuted') }, 'A complete toolkit for exploring, generating, and refining color palettes.')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _mw[1100px] _wfull d-stagger') },
      ...features.map((f, i) => {
        const card = Card({ class: css('cy-pillow cy-jelly _flex _col _gap3') },
          Card.Body({},
            div({ class: css('_flex _aic _gap3 _mb2') },
              div({ class: css('_w[40px] _h[40px] _rfull _bgprimary/10 _flex _aic _jcc _fgprimary cy-float') },
                icon(f.ic)
              ),
              h3({ class: css('_heading4') }, f.title)
            ),
            p({ class: css('_textsm _fgmuted _lh[1.6]') }, f.desc)
          )
        );
        card.style.setProperty('--d-i', String(i));
        return card;
      })
    )
  );
}

// ─── Section 3: Stats ───────────────────────────────────────────
function StatsSection() {
  return section({ class: css('_py24 _px6 _grid _gc1 _md:gc4 _gap8 _tc cy-pastel-mesh') },
    Statistic({ label: 'Palettes Generated', value: 25000, suffix: '+', animate: 1500, class: css('cy-pillow') }),
    Statistic({ label: 'Color Harmonies', value: 6, animate: 1200, class: css('cy-pillow') }),
    Statistic({ label: 'Export Formats', value: 4, animate: 1000, class: css('cy-pillow') }),
    Statistic({ label: 'Happy Creators', value: 5000, suffix: '+', animate: 800, class: css('cy-pillow') })
  );
}

// ─── Section 4: Testimonial Marquee ─────────────────────────────
function TestimonialMarquee() {
  const testimonials = [
    { quote: 'Chromaform made my design workflow 10x faster. The clay interface is so satisfying to use.', name: 'Mia Torres', role: 'UI Designer' },
    { quote: 'I use this for every new project. The harmony algorithms generate beautiful combinations every time.', name: 'Alex Kim', role: 'Frontend Developer' },
    { quote: 'The contrast checker alone is worth it. Finally accessible color palettes without the guesswork.', name: 'Jordan Lee', role: 'Accessibility Lead' },
    { quote: 'The pillow-soft design makes working with colors feel fun and creative. Love the attention to detail.', name: 'Sam Rivera', role: 'Brand Designer' },
    { quote: 'Replaced three different color tools with this one. The export options are perfect.', name: 'Chris Morgan', role: 'Full-Stack Developer' },
    { quote: 'Our entire design system palette was built with Chromaform. Can not recommend it enough.', name: 'Dana Park', role: 'Design Systems Lead' },
  ];

  const makeCard = (t) =>
    Card({ class: css('cy-pillow _miw[300px] _flex _col _gap3') },
      Card.Body({},
        p({ class: css('_textsm _fgmuted _italic _lh[1.6]') }, `\u201C${t.quote}\u201D`),
        div({ class: css('_flex _aic _gap3 _mt2') },
          div({ class: css('_w8 _h8 _rfull _bgprimary/15 _flex _aic _jcc _fgprimary _textsm _bold') },
            span({}, t.name[0])
          ),
          div({},
            span({ class: css('_textsm _bold _fgfg') }, t.name),
            span({ class: css('_textxs _fgmuted _block') }, t.role)
          )
        )
      )
    );

  return section({ class: css('_flex _col _gap8 _py24 _aic') },
    div({ class: css('_tc') },
      h2({ class: css('_heading2 d-gradient-text _mb3') }, 'Loved by creators'),
      p({ class: css('_body _fgmuted') }, 'See what designers and developers are saying')
    ),
    Marquee({ speed: 30, gap: 4 },
      ...testimonials.slice(0, 3).map(makeCard)
    ),
    Marquee({ speed: 30, direction: 'right', gap: 4 },
      ...testimonials.slice(3).map(makeCard)
    )
  );
}

// ─── Section 5: Brand CTA ───────────────────────────────────────
function BrandCta() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _relative cy-pastel-mesh') },
    span({ class: css('cy-blob _w[300px] _h[300px] _top[10%] _right[-5%] _bg[rgba(167,139,250,0.15)]') }),
    span({ class: css('cy-blob _w[200px] _h[200px] _bottom[20%] _left[-3%] _bg[rgba(103,232,249,0.1)]') }),
    h2({ class: css('_heading2 d-gradient-text _mw[600px]') }, 'Start creating palettes today'),
    p({ class: css('_textlg _fgmuted _mw[480px] _lh[1.6]') },
      'Open the workspace and generate your first palette in under 10 seconds. No sign-up required.'
    ),
    Button({ variant: 'primary', size: 'lg', class: css('cy-glow cy-squish'), onclick: () => navigate('/workspace') },
      icon('palette'), 'Open Workspace'
    )
  );
}

// ─── Section 6: Footer ──────────────────────────────────────────
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
        span({ class: css('_textlg _bold d-gradient-text') }, 'Chromaform'),
        p({ class: css('_textsm _fgmuted _mw[240px]') }, 'A playful color palette generator with a clay-soft interface.'),
      ),
      linkGroup('Tool', [
        { label: 'Workspace', href: '#/workspace' },
        { label: 'Explore', href: '#/explore' },
        { label: 'Detail', href: '#/detail' },
      ]),
      linkGroup('Resources', [
        { label: 'Color Theory', href: '#' },
        { label: 'Accessibility', href: '#' },
        { label: 'API', href: '#' },
      ]),
      linkGroup('About', [
        { label: 'GitHub', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Privacy', href: '#' },
      ])
    ),
    Separator({}),
    div({ class: css('_flex _aic _jcc _py4 _px6') },
      p({ class: css('_textxs _fgmuted') }, `\u00A9 ${new Date().getFullYear()} Chromaform. Built with Decantr + Clay.`)
    )
  );
}

// ─── Page Composition ───────────────────────────────────────────
export default function HomePage() {
  onMount(() => {
    document.title = 'Chromaform — Color Palette Generator';
  });

  return div({ class: css('_flex _col _gap0 _overflow[auto] _flex1 d-page-enter') },
    BrandHero(),
    FeatureGrid(),
    StatsSection(),
    TestimonialMarquee(),
    BrandCta(),
    FooterSection()
  );
}
