import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { link, navigate } from 'decantr/router';
import { Button, Card, icon } from 'decantr/components';

const { div, span, h1, h2, h3, p, nav, section, footer, a } = tags;

// ─── Floating Nav ───────────────────────────────────────────────
function FloatingNav() {
  return nav({ class: css('_flex _aic _jcsb _px6 _py3 _position[sticky] _top0 _z[100] _bg[rgba(15,11,26,0.85)] _backdrop[blur(12px)] _bc[#2A2040] _borderB') },
    div({ class: css('_flex _aic _gap2') },
      icon('cloud', { size: '1.25rem', class: css('_fgprimary') }),
      span({ class: css('_heading5 _bold _fg[#EEEDF5]') }, 'CloudLaunch')
    ),
    div({ class: css('_flex _aic _gap6') },
      a({ href: '#features', class: css('_textsm _fg[rgba(238,237,245,0.6)] _h:fg[#EEEDF5] _nounder _trans[color_0.2s_ease]') }, 'Features'),
      a({ href: '#pricing', class: css('_textsm _fg[rgba(238,237,245,0.6)] _h:fg[#EEEDF5] _nounder _trans[color_0.2s_ease]') }, 'Pricing'),
      a({ href: '#docs', class: css('_textsm _fg[rgba(238,237,245,0.6)] _h:fg[#EEEDF5] _nounder _trans[color_0.2s_ease]') }, 'Docs')
    ),
    div({ class: css('_flex _aic _gap3') },
      Button({ variant: 'ghost', size: 'sm' }, 'Login'),
      Button({ variant: 'primary', size: 'sm' }, 'Sign Up')
    )
  );
}

// ─── Section 1: Hero ────────────────────────────────────────────
function HeroSection() {
  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 _minh[80vh] _jcc lp-brand-bg _relative') },
    div({ class: css('_flex _col _aic _gap6 _mw[800px]') },
      h1({ class: css('_heading1 _bold _lh[1.1]') }, 'Deploy globally in seconds'),
      p({ class: css('_textlg _fg[rgba(255,255,255,0.7)] _mw[600px] _lh[1.6]') },
        'The cloud infrastructure platform built for speed. Ship apps, databases, and services to 30+ regions with a single command.'
      ),
      div({ class: css('_flex _gap3 _wrap _jcc') },
        Button({ variant: 'primary', size: 'lg', onclick: () => navigate('/signup') }, icon('rocket'), 'Get Started'),
        Button({ variant: 'outline', size: 'lg' }, icon('book-open'), 'View Docs')
      )
    )
  );
}

// ─── Section 2: Feature Grid ────────────────────────────────────
function FeatureGrid() {
  const features = [
    { ic: 'globe', title: 'Global Edge Network', desc: 'Deploy to 30+ regions worldwide. Your app runs close to your users, everywhere.' },
    { ic: 'zap', title: 'Auto-Scaling', desc: 'Scale to zero when idle, burst to thousands of instances under load. Pay only for what you use.' },
    { ic: 'git-branch', title: 'Deploy from Git', desc: 'Push to your repo and we handle the rest. Automatic builds, previews, and rollbacks.' },
    { ic: 'database', title: 'Managed Databases', desc: 'Postgres, Redis, and object storage with automatic backups and point-in-time recovery.' },
  ];

  return section({ class: css('_flex _col _gap8 _py16 _px6 _aic') },
    div({ class: css('_tc _mw[640px]') },
      h2({ class: css('_heading3 _bold _fgfg _mb3') }, 'Ship faster with less ops'),
      p({ class: css('_textsm _fgmuted') }, 'Everything you need to run production workloads at any scale.')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc4 _gap6 _mw[1200px] _wfull') },
      ...features.map(f =>
        Card({ class: css('_flex _col _gap3') },
          Card.Body({ class: css('_flex _col _gap3') },
            div({ class: css('_w[40px] _h[40px] _r2 _bgprimary/10 _flex _aic _jcc') },
              icon(f.ic, { size: '1rem', class: css('_fgprimary') })
            ),
            h3({ class: css('_heading5 _bold') }, f.title),
            p({ class: css('_textsm _fgmuted _lh[1.6]') }, f.desc)
          )
        )
      )
    )
  );
}

// ─── Section 3: Logo Strip ──────────────────────────────────────
function LogoStrip() {
  const frameworks = ['React', 'Vue', 'Next.js', 'Rails', 'Django', 'Go', 'Rust', 'Node.js'];

  return section({ class: css('_flex _col _aic _gap6 _py12 _bcborder _borderT _borderB _overflow[hidden]') },
    span({ class: css('_textxs _fgmuted _uppercase _tracking[0.15em]') }, 'Works with your stack'),
    div({ class: css('_flex _aic _gap8 _wfull _jcc _wrap') },
      ...frameworks.map(name =>
        span({ class: css('_textsm _fgmuted _opacity[0.5] _bold _uppercase _tracking[0.05em]') }, name)
      ),
      ...frameworks.map(name =>
        span({ class: css('_textsm _fgmuted _opacity[0.5] _bold _uppercase _tracking[0.05em]') }, name)
      )
    )
  );
}

// ─── Section 4: Capability Grid ─────────────────────────────────
function CapabilityGrid() {
  const capabilities = [
    { ic: 'network', title: 'Private Networking', desc: 'Encrypted WireGuard mesh connects your services. No public internet exposure required.' },
    { ic: 'cpu', title: 'GPU Machines', desc: 'Run ML inference and training on dedicated GPU instances with NVIDIA A100 and L4 support.' },
    { ic: 'hard-drive', title: 'Object Storage', desc: 'S3-compatible storage with global replication. Store and serve assets from the edge.' },
    { ic: 'activity', title: 'Observability', desc: 'Built-in metrics, logs, and traces. See exactly what your app is doing in real time.' },
  ];

  return section({ class: css('_flex _col _gap8 _py16 _px6 _aic') },
    div({ class: css('_tc _mw[640px]') },
      h2({ class: css('_heading3 _bold _fgfg _mb3') }, 'Infrastructure that scales with you'),
      p({ class: css('_textsm _fgmuted') }, 'From side projects to enterprise workloads, we have you covered.')
    ),
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc4 _gap6 _mw[1200px] _wfull') },
      ...capabilities.map(c =>
        Card({ class: css('_flex _col _gap3') },
          Card.Body({ class: css('_flex _col _gap3') },
            div({ class: css('_w[40px] _h[40px] _r2 _bgprimary/10 _flex _aic _jcc') },
              icon(c.ic, { size: '1rem', class: css('_fgprimary') })
            ),
            h3({ class: css('_heading5 _bold') }, c.title),
            p({ class: css('_textsm _fgmuted _lh[1.6]') }, c.desc)
          )
        )
      )
    )
  );
}

// ─── Section 5: Stats ───────────────────────────────────────────
function StatsSection() {
  const stats = [
    { value: '30+', label: 'Regions' },
    { value: '99.99%', label: 'Uptime' },
    { value: '2M+', label: 'Deploys' },
    { value: '50k+', label: 'Apps' },
  ];

  return section({ class: css('_py16 _px6 _aic lp-surface') },
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc4 _gap8 _mw[1200px] _mx[auto] _tc') },
      ...stats.map(s =>
        div({ class: css('_flex _col _gap2 _aic') },
          span({ class: css('_heading1 _bold _fgprimary') }, s.value),
          span({ class: css('_textsm _fgmuted') }, s.label)
        )
      )
    )
  );
}

// ─── Section 6: Enterprise CTA ──────────────────────────────────
function EnterpriseCta() {
  const features = [
    'SOC 2 Type II certified',
    'Dedicated support and SLAs',
    'Private clusters and custom regions',
    'SSO and role-based access control',
  ];

  return section({ class: css('_flex _col _aic _tc _gap8 _py24 _px6 lp-brand-bg') },
    div({ class: css('_flex _col _aic _gap6 _mw[700px]') },
      h2({ class: css('_heading3 _bold') }, 'Built for enterprise'),
      p({ class: css('_textsm _fg[rgba(255,255,255,0.7)] _lh[1.6]') },
        'Trusted by the world\'s most demanding teams. CloudLaunch meets the security, compliance, and performance needs of enterprise organizations.'
      ),
      div({ class: css('_flex _col _gap3 _ais _wfull _mw[400px]') },
        ...features.map(f =>
          div({ class: css('_flex _aic _gap3') },
            icon('check', { size: '1rem', class: css('_fgprimary') }),
            span({ class: css('_textsm _fg[rgba(255,255,255,0.7)]') }, f)
          )
        )
      ),
      Button({ variant: 'primary', size: 'lg', onclick: () => navigate('/contact') }, 'Contact Sales')
    )
  );
}

// ─── Section 7: Footer ──────────────────────────────────────────
function FooterSection() {
  const linkGroup = (title, links) =>
    div({ class: css('_flex _col _gap3') },
      h3({ class: css('_textsm _bold _fgfg') }, title),
      ...links.map(l =>
        a({ href: l.href, class: css('_textsm _fgmuted _h:fgfg _nounder _trans[color_0.2s_ease]') }, l.label)
      )
    );

  return footer({ class: css('_bcborder _borderT') },
    div({ class: css('_grid _gc1 _md:gc2 _lg:gc4 _gap8 _py12 _px6 _mw[1200px] _mx[auto]') },
      linkGroup('Product', [
        { label: 'Machines', href: '#' },
        { label: 'Kubernetes', href: '#' },
        { label: 'Storage', href: '#' },
        { label: 'Databases', href: '#' },
        { label: 'Pricing', href: '#' },
      ]),
      linkGroup('Platform', [
        { label: 'Edge Network', href: '#' },
        { label: 'GPU Compute', href: '#' },
        { label: 'Private Networking', href: '#' },
        { label: 'Observability', href: '#' },
      ]),
      linkGroup('Resources', [
        { label: 'Documentation', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Community', href: '#' },
        { label: 'Status', href: '#' },
      ]),
      linkGroup('Company', [
        { label: 'About', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Security', href: '#' },
        { label: 'Privacy', href: '#' },
      ])
    ),
    div({ class: css('_flex _aic _jcsb _py4 _px6 _mw[1200px] _mx[auto] _bcborder _borderT') },
      span({ class: css('_textxs _fgmuted') }, '\u00A9 2026 CloudLaunch. All rights reserved.'),
      div({ class: css('_flex _gap4') },
        a({ href: '#', 'aria-label': 'GitHub', class: css('_fgmuted _h:fgfg _trans[color_0.2s_ease]') }, icon('github')),
        a({ href: '#', 'aria-label': 'Twitter', class: css('_fgmuted _h:fgfg _trans[color_0.2s_ease]') }, icon('twitter')),
        a({ href: '#', 'aria-label': 'Discord', class: css('_fgmuted _h:fgfg _trans[color_0.2s_ease]') }, icon('discord'))
      )
    )
  );
}

// ─── Page Composition ───────────────────────────────────────────
export default function HomePage() {
  onMount(() => {
    document.title = 'CloudLaunch — Deploy Globally in Seconds';
  });

  return div({ class: css('d-page-enter _flex _col _gap0 _overflow[auto] _flex1') },
    FloatingNav(),
    HeroSection(),
    FeatureGrid(),
    LogoStrip(),
    CapabilityGrid(),
    StatsSection(),
    EnterpriseCta(),
    FooterSection()
  );
}
