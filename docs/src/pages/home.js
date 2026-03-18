import { tags } from 'decantr/tags';
import { cond, onMount, onDestroy } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css } from 'decantr/css';
import {
  Badge, Button, Card, Chip, Separator, Statistic,
  Avatar, CodeBlock, Marquee, BrowserFrame,
  icon, createHighlighter, createScrollReveal
} from 'decantr/components';

const { div, h1, h2, h3, p, span, a, section, footer, img } = tags;

// ─── Section 1: Announcement Bar ─────────────────────────────────
function AnnouncementBar() {
  const [visible, setVisible] = createSignal(true);

  return cond(visible,
    () => div({ class: css('_flex _aic _jcc _gap3 _py2 _px4 _textsm d-glass-subtle') },
      Badge({ variant: 'outline', size: 'sm', icon: 'sparkles' }, 'New'),
      span({}, 'Decantr v0.9.2 is here — new patterns, presets, and more'),
      // Button({ variant: 'link', size: 'sm' }, 'Learn more', icon('arrow-right')),
      Button({ variant: 'ghost', size: 'xs', onclick: () => setVisible(false), 'aria-label': 'Dismiss' }, icon('x'))
    )
  );
}

// ─── Section 2: Brand Hero (split preset) ───────────────────────
function BrandHero() {
  return section({ class: css('_minh[100vh] _relative d-mesh _flex _aic _jcc _px6 _py24') },
    // Decorative orbs (absolute, outside grid flow)
    span({ class: css('aura-orb _w[400px] _h[400px] _top[-10%] _left[-5%] _bg[rgba(254,68,116,0.15)]') }),
    span({ class: css('aura-orb _w[300px] _h[300px] _bottom[10%] _right[-5%] _bg[rgba(10,243,235,0.1)]') }),
    span({ class: css('aura-orb _w[250px] _h[250px] _top[30%] _right[20%] _bg[rgba(101,0,198,0.1)]') }),
    // Two-column grid (logo 1fr, content 2fr)
    div({ class: css('_grid _gc1 _lg:gc3 _gap8 _mw[1200px] _wfull _aic') },
      // Left: Logo (span 1)
      div({ class: css('_flex _aic _jcc') },
        img({ src: './images/logo-portrait.svg', alt: 'Decantr', class: css('_w[280px] ds-float ds-logo-glow') })
      ),
      // Right: Content (span 2)
      div({ class: css('_flex _col _gap6 _tc _lg:tl _lg:span2') },
        h1({ class: css('d-heading-display d-gradient-text') }, 'Build stunning apps in minutes, not months'),
        p({ class: css('_textlg _fgmuted _mw[640px] _lh[1.6]') },
          'The zero-dependency web framework that transforms your ideas into production-ready applications with signal-based reactivity, atomic CSS, and 100+ components.'
        ),
        div({ class: css('_flex _gap3 _wrap _jcc _lg:jcfs') },
          Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'Get Started'),
          a({ href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener', class: css('_nounder') },
            Button({ variant: 'outline', size: 'lg' }, icon('github'), 'View on GitHub')
          )
        )
      )
    )
  );
}

// ─── Section 3: Logo Strip (Marquee) ─────────────────────────────
function LogoStripSection() {
  const logos = ['vercel', 'stripe', 'github', 'figma', 'slack', 'notion', 'linear', 'discord'];

  const logoItem = (name) =>
    div({ class: css('_flex _aic _jcc _px6 _fgmuted _opacity[0.4] _h:opacity[0.8] _trans[opacity_0.2s_ease]') },
      span({ class: css('_textlg _tracking[0.05em] _uppercase _bold') }, name)
    );

  return section({ class: css('_flex _col _aic _gap6 _py12 _bcborder _borderT _borderB') },
    span({ class: css('_textxs _fgmuted _uppercase _tracking[0.15em] d-gradient-text-alt') }, 'Trusted by teams worldwide'),
    Marquee({ speed: 35, gap: 6 },
      ...logos.slice(0, 4).map(logoItem)
    ),
    Marquee({ speed: 35, direction: 'right', gap: 6 },
      ...logos.slice(4).map(logoItem)
    )
  );
}

// ─── Section 4: Feature Grid (card-grid:icon) ────────────────────
function FeatureGrid() {
  const features = [
    { icon: 'zap', title: 'Signal Reactivity', desc: 'Fine-grained reactive primitives. No virtual DOM overhead — updates exactly what changed.' },
    { icon: 'layers', title: '100+ Components', desc: 'From buttons to data tables, every component you need — zero dependencies required.' },
    { icon: 'palette', title: 'Atomic CSS', desc: 'Utility-first atoms resolve at build time. Tree-shaken, purged, and compressed to <13KB.' },
    { icon: 'moon', title: 'Dark Mode First', desc: 'Auradecantism dark mode by default. 10 style themes with light/dark/auto modes.' },
    { icon: 'code', title: 'AI-First DX', desc: 'Designed for LLM code generation. Registry-driven patterns and archetypes for instant scaffolding.' },
    { icon: 'shield', title: 'Enterprise Ready', desc: 'WCAG AA contrast validation, route guards, form validation, error boundaries, and more.' },
  ];

  const el = section({ class: css('_flex _col _gap8 _py24 _px6 _aic') },
    div({ class: css('_tc _mw[640px]') },
      h2({ class: css('_heading2 d-gradient-text _mb3') }, 'Everything you need to ship'),
      p({ class: css('_body _fgmuted') }, 'A complete framework with batteries included — no third-party runtime dependencies.')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _mw[1100px] _wfull d-stagger') },
      ...features.map((f, i) => {
        const card = Card({ class: css('d-glass _flex _col _gap3 _trans[transform_0.3s_ease] _h:scale[1.02]') },
          Card.Body({},
            div({ class: css('_flex _aic _gap3 _mb2') },
              div({ class: css('_w[40px] _h[40px] _r[12px] _bgprimary/10 _flex _aic _jcc _fgprimary') },
                icon(f.icon)
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

  return el;
}

// ─── Section 5: Code Preview (split) ─────────────────────────────
function CodePreviewSection() {
  const prompts = [
    `$ npx decantr init my-app`,
    `$ cd my-app && npx decantr dev`,
    ``,
    `# Then tell your AI what to build:`,
    ``,
    `> "Build me a SaaS dashboard with KPI cards,`,
    `   charts, and a data table for user management"`,
    ``,
    `> "Create a portfolio site with a hero section,`,
    `   project gallery, and a contact form"`,
    ``,
    `> "Scaffold an e-commerce storefront with product`,
    `   grid, cart drawer, and checkout flow"`,
  ].join('\n');

  return section({ class: css('_grid _gc1 _lg:gc2 _gap8 _py24 _px6 _aic _mw[1100px] _mx[auto]') },
    div({ class: css('_flex _col _gap6') },
      h2({ class: css('_heading2 d-gradient-text') }, 'Get started in seconds'),
      p({ class: css('_body _fgmuted _lh[1.6]') },
        'Scaffold a project, start the dev server, and describe what you want. Your AI handles the rest — components, routing, styling, and data.'
      ),
      div({ class: css('_flex _gap2 _wrap') },
        Chip({ icon: 'zap', label: 'Zero Config' }),
        Chip({ icon: 'refresh-cw', label: 'Hot Reload' }),
        Chip({ icon: 'scissors', label: 'Tree Shaking' })
      )
    ),
    div({ class: css('d-glass-strong _r[16px] _overflow[hidden]') },
      CodeBlock({ language: 'bash', copyable: true, highlight: createHighlighter }, prompts)
    )
  );
}

// ─── Section 6: Stats ────────────────────────────────────────────
function StatsSection() {
  return section({ class: css('_py24 _px6 _grid _gc1 _md:gc4 _gap8 _tc d-mesh') },
    Statistic({ label: 'Components', value: 100, suffix: '+', animate: 1500 }),
    Statistic({ label: 'Patterns', value: 42, animate: 1200 }),
    Statistic({ label: 'Bundle (Brotli)', value: 12.9, suffix: 'KB', precision: 1, animate: 1000 }),
    Statistic({ label: 'Dependencies', value: 0, animate: 800 })
  );
}

// ─── Section 7: Testimonial Wall ─────────────────────────────────
function TestimonialWall() {
  const testimonials = [
    { quote: 'Decantr replaced our entire React stack. The signal system is incredibly fast and the bundle size dropped 80%.', name: 'Sarah Chen', role: 'CTO at LaunchPad' },
    { quote: 'The AI-first approach means I can scaffold an entire dashboard in minutes. Game changer for prototyping.', name: 'Marcus Johnson', role: 'Senior Engineer at Nimbus Labs' },
    { quote: 'Zero dependencies. That alone sold us. But the component quality rivals anything out there.', name: 'Priya Patel', role: 'Tech Lead at Paystream' },
    { quote: 'We migrated in a weekend. The atomic CSS system is what utility-first CSS should have been.', name: 'James Wright', role: 'Founder at DevTools Co' },
    { quote: 'The Decantation Process is brilliant. It forces you to think about structure before code. Our team ships cleaner work now.', name: 'Elena Volkov', role: 'Engineering Manager at Gridwork' },
    { quote: 'Best docs I have seen for any framework. The registry system makes code generation actually reliable.', name: 'Tomás Rivera', role: 'Staff Engineer at Canopy' },
    { quote: 'Auradecantism is gorgeous out of the box. Our designers were impressed without any custom CSS.', name: 'Aisha Okafor', role: 'Product Designer at PixelForge' },
    { quote: 'The enterprise features — form validation, error boundaries, route guards — saved us months of work.', name: 'David Kim', role: 'VP Engineering at Vectrix' },
    { quote: 'I built a production SaaS dashboard in 3 days with Decantr. The pattern system is incredibly powerful.', name: 'Lisa Park', role: 'Indie Hacker' },
  ];

  const cards = testimonials.map((t, i) => {
    const card = Card({ class: css('d-glass _flex _col _gap4 d-reveal') },
      Card.Body({},
        p({ class: css('_textsm _fgmuted _italic _lh[1.6]') }, `"${t.quote}"`),
        div({ class: css('_flex _aic _gap3 _mt3') },
          Avatar({ name: t.name, size: 'sm' }),
          div({},
            span({ class: css('_textsm _bold _fgfg') }, t.name),
            span({ class: css('_textxs _fgmuted _block') }, t.role)
          )
        )
      )
    );
    card.style.setProperty('--d-i', String(i));
    return card;
  });

  const el = section({ class: css('_flex _col _gap8 _py24 _px6 _aic') },
    div({ class: css('_tc') },
      h2({ class: css('_heading2 d-gradient-text _mb3') }, 'Loved by developers'),
      p({ class: css('_body _fgmuted') }, 'Join thousands of teams building better software')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap4 _mw[1100px] _wfull d-stagger') },
      ...cards
    )
  );

  const cleanups = [];
  onMount(() => {
    el.querySelectorAll('.d-reveal').forEach(card => {
      cleanups.push(createScrollReveal(card));
    });
  });
  onDestroy(() => cleanups.forEach(fn => fn()));

  return el;
}

// ─── Section 8: Showcase Gallery ─────────────────────────────────
function ShowcaseGallery() {
  const items = [
    { title: 'SaaS Dashboard', url: 'dashboard.decantr.ai', desc: 'Command-center style analytics dashboard' },
    { title: 'E-Commerce Store', url: 'shop.decantr.ai', desc: 'Product catalog with cart and checkout' },
    { title: 'Developer Docs', url: 'docs.decantr.ai', desc: 'Full documentation site with search' },
    { title: 'Blog Platform', url: 'blog.decantr.ai', desc: 'Content-first blog with dark mode' },
    { title: 'Portfolio Site', url: 'portfolio.decantr.ai', desc: 'Personal brand landing page' },
    { title: 'Admin Panel', url: 'admin.decantr.ai', desc: 'Data management with CRUD tables' },
  ];

  return section({ class: css('_flex _col _gap8 _py24 _px6 _aic') },
    div({ class: css('_tc') },
      h2({ class: css('_heading2 d-gradient-text _mb3') }, 'Built with Decantr'),
      p({ class: css('_body _fgmuted') }, 'See what developers are creating')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc3 _gap6 _mw[1100px] _wfull') },
      ...items.map(item =>
        div({ class: css('_trans[transform_0.3s_ease] _h:scale[1.03]') },
          BrowserFrame({ url: item.url },
            div({ class: css('_h[200px] _bgmuted _flex _aic _jcc _fgmuted') },
              div({ class: css('_tc _p4') },
                h3({ class: css('_heading4 _fgfg _mb2') }, item.title),
                p({ class: css('_textsm _fgmuted') }, item.desc)
              )
            )
          )
        )
      )
    )
  );
}

// ─── Section 9: Brand CTA ────────────────────────────────────────
function BrandCta() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _relative d-mesh') },
    span({ class: css('aura-orb _w[300px] _h[300px] _top[10%] _right[-5%] _bg[rgba(254,68,116,0.12)]') }),
    span({ class: css('aura-orb _w[200px] _h[200px] _bottom[20%] _left[-3%] _bg[rgba(10,243,235,0.08)]') }),
    h2({ class: css('d-heading-display d-gradient-text _mw[700px]') }, 'Start building today'),
    p({ class: css('_textlg _fgmuted _mw[540px] _lh[1.6]') },
      'Join the community of developers shipping faster with the AI-first web framework. Free and open source.'
    ),
    div({ class: css('_flex _gap3 _wrap _jcc') },
      Button({ variant: 'primary', size: 'lg', class: css('aura-glow') }, icon('terminal'), 'npx decantr init'),
      Button({ variant: 'outline', size: 'lg' }, icon('book-open'), 'Read the Docs')
    )
  );
}

// ─── Section 10: Footer ──────────────────────────────────────────
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
        p({ class: css('_textsm _fgmuted _mw[240px]') }, 'The AI-first web framework for building stunning applications.'),
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
    AnnouncementBar(),
    BrandHero(),
    LogoStripSection(),
    FeatureGrid(),
    CodePreviewSection(),
    StatsSection(),
    TestimonialWall(),
    ShowcaseGallery(),
    BrandCta(),
    FooterSection()
  );
}
