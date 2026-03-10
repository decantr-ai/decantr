import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, icon } from 'decantr/components';
import { Hero, Features, Pricing, Testimonials, CTA, Footer, Timeline, StatsRow, ProjectGrid } from 'decantr/blocks';
import { SectionHeader, DemoGroup } from './_shared.js';

const { div, section } = tags;

export function BlocksSection() {
  return section({ id: 'blocks', class: css('_flex _col _gap10') },
    SectionHeader('Block Components', 'Pre-composed content sections for landing pages, portfolios, and marketing sites.'),

    // ── Hero ──────────────────────────────────────────────────────
    DemoGroup('Hero', 'Full-width hero section with headline, description, and CTA.',
      Hero({
        headline: 'Build faster with Decantr',
        description: 'AI-first web framework. Zero dependencies. Ship in hours, not weeks.',
        cta: { label: 'Get Started', variant: 'primary' },
        ctaSecondary: { label: 'Documentation', variant: 'outline' }
      })
    ),

    // ── Features ────────────────────────────────────────────────
    DemoGroup('Features', 'Feature grid with icons, titles, and descriptions.',
      Features({
        items: [
          { icon: icon('zap'), title: 'Lightning Fast', description: 'Zero-dependency runtime. No virtual DOM overhead.' },
          { icon: icon('shield'), title: 'Secure by Default', description: 'No innerHTML, no eval. CSP-compliant out of the box.' },
          { icon: icon('palette'), title: 'Themeable', description: '170+ tokens derived from 10 seed colors. 4 built-in styles.' },
          { icon: icon('code'), title: 'AI-First', description: 'Every API optimized for token efficiency and machine readability.' },
          { icon: icon('layers'), title: 'Component Library', description: '23+ components, 3 domain kits, blocks, and a CLI.' },
          { icon: icon('globe'), title: 'Accessible', description: 'WCAG 2.1 AA compliant. Keyboard navigation everywhere.' }
        ]
      })
    ),

    // ── Pricing ──────────────────────────────────────────────────
    DemoGroup('Pricing', 'Pricing cards with feature lists and CTA buttons.',
      Pricing({
        plans: [
          { name: 'Starter', price: '$0', period: '/mo', features: ['5 projects', 'Community support', 'Basic analytics'], cta: { label: 'Get Started', variant: 'outline' } },
          { name: 'Pro', price: '$29', period: '/mo', features: ['Unlimited projects', 'Priority support', 'Advanced analytics', 'Team features'], cta: { label: 'Start Trial', variant: 'primary' }, highlighted: true },
          { name: 'Enterprise', price: '$99', period: '/mo', features: ['Everything in Pro', 'SSO', 'Dedicated support', 'Custom integrations'], cta: { label: 'Contact Sales', variant: 'outline' } }
        ]
      })
    ),

    // ── Testimonials ─────────────────────────────────────────────
    DemoGroup('Testimonials', 'Customer quotes with attribution.',
      Testimonials({
        items: [
          { quote: 'Decantr let us ship our entire dashboard in a weekend. The AI-first design is a game changer.', author: 'Sarah Chen', role: 'CTO, TechCorp' },
          { quote: 'The zero-dependency approach means our bundle is tiny and our builds are fast.', author: 'Marcus Johnson', role: 'Lead Engineer, StartupX' },
          { quote: 'Best component library I have ever used. The token system is incredibly well thought out.', author: 'Priya Sharma', role: 'Frontend Architect, DataFlow' }
        ]
      })
    ),

    // ── CTA ──────────────────────────────────────────────────────
    DemoGroup('CTA', 'Call-to-action banner with headline and button.',
      CTA({
        headline: 'Ready to build?',
        description: 'Start building your next project with Decantr today.',
        cta: { label: 'Get Started Free', variant: 'primary' }
      })
    ),

    // ── Footer ───────────────────────────────────────────────────
    DemoGroup('Footer', 'Site footer with columns and copyright.',
      Footer({
        columns: [
          { title: 'Product', links: [{ label: 'Features' }, { label: 'Pricing' }, { label: 'Docs' }] },
          { title: 'Company', links: [{ label: 'About' }, { label: 'Blog' }, { label: 'Careers' }] },
          { title: 'Legal', links: [{ label: 'Privacy' }, { label: 'Terms' }] }
        ],
        copyright: '\u00a9 2026 Decantr. All rights reserved.'
      })
    ),

    // ── Timeline ─────────────────────────────────────────────────
    DemoGroup('Timeline', 'Vertical timeline for history or changelog.',
      Timeline({
        items: [
          { period: 'Mar 2026', role: 'v0.4.0', company: 'Enterprise', description: 'DataTable, form system, accessibility hardening.' },
          { period: 'Feb 2026', role: 'v0.3.0', company: 'Styles', description: 'Auradecantism, glassmorphism, seed-derived tokens.' },
          { period: 'Jan 2026', role: 'v0.2.0', company: 'Kits', description: 'Dashboard, auth, and content domain kits.' },
          { period: 'Dec 2025', role: 'v0.1.0', company: 'Launch', description: 'Core framework, 23 components, CLI.' }
        ]
      })
    ),

    // ── StatsRow ─────────────────────────────────────────────────
    DemoGroup('StatsRow', 'Horizontal statistics display.',
      StatsRow({
        items: [
          { label: 'Downloads', value: '1.2M' },
          { label: 'GitHub Stars', value: '15.4k' },
          { label: 'Contributors', value: '342' },
          { label: 'Components', value: '97+' }
        ]
      })
    ),

    // ── ProjectGrid ──────────────────────────────────────────────
    DemoGroup('ProjectGrid', 'Portfolio project cards.',
      ProjectGrid({
        items: [
          { name: 'E-Commerce Platform', description: 'Full-stack marketplace with payments.', tags: ['React', 'Node.js'] },
          { name: 'Analytics Dashboard', description: 'Real-time data visualization suite.', tags: ['Decantr', 'D3'] },
          { name: 'Mobile App', description: 'Cross-platform fitness tracker.', tags: ['Flutter', 'Firebase'] }
        ]
      })
    )
  );
}
