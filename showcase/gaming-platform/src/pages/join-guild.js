import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, icon } from 'decantr/components';

const { div, span, h1, h2, h3, p } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const perks = [
  { title: 'Exclusive Raids', description: 'Access guild-only raid dungeons with legendary loot drops.', ic: 'swords' },
  { title: 'Weekly Tournaments', description: 'Compete in members-only tournaments with prize pools.', ic: 'trophy' },
  { title: 'Custom Loadouts', description: 'Unlock exclusive weapons, skins, and character builds.', ic: 'palette' },
  { title: 'Discord Access', description: 'Join our private Discord with 4,000+ active members.', ic: 'message-circle' },
  { title: 'Coaching & Mentorship', description: 'Learn from Diamond+ ranked players and guild veterans.', ic: 'graduation-cap' },
  { title: 'Early Access', description: 'Be the first to test new game updates and features.', ic: 'rocket' },
];

const testimonials = [
  {
    name: 'StormRider',
    rank: 'Diamond I',
    quote: 'Joining Nexus Guild was the best gaming decision I ever made. The community is incredible and I went from Gold to Diamond in one season.',
  },
  {
    name: 'CrimsonFox',
    rank: 'Platinum II',
    quote: 'The weekly tournaments keep me motivated. Plus, the coaching from senior members helped me improve my win rate by 15%.',
  },
  {
    name: 'PixelKnight',
    rank: 'Diamond III',
    quote: 'I was a solo player for years. Now I can\'t imagine gaming without my guild squad. The raid nights are legendary.',
  },
];

// ─── Hero ───────────────────────────────────────────────────────
function JoinHero() {
  return div({ class: css('_flex _col _aic _tc _gap6 _py16 _px6 gg-mesh _r4') },
    div({ class: css('_flex _center _w16 _h16 _r4 _bgprimary/15 gg-float') },
      icon('shield', { size: '2rem', class: css('_fgprimary') })
    ),
    h1({ class: css('_heading1 d-gradient-text') }, 'Join the Guild'),
    p({ class: css('_body _fgmuted _mw[640px]') }, 'Become part of something legendary. Join 4,500+ players who compete, collaborate, and conquer together.'),
    div({ class: css('_flex _gap3') },
      Button({ variant: 'primary', size: 'lg', class: css('gg-glow-strong'), onclick: () => { if (globalThis.__openAuth) globalThis.__openAuth(); } },
        icon('shield', { size: '1em' }), ' JOIN THE GUILD'
      ),
      Button({ variant: 'outline', size: 'lg' }, 'Learn More')
    )
  );
}

// ─── Perks Grid ─────────────────────────────────────────────────
function PerksGrid() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_tc') },
      h2({ class: css('_heading3 _mb2') }, 'Guild Perks'),
      p({ class: css('_fgmuted') }, 'Everything you get as a Nexus Guild member')
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc3 _gap4 d-stagger-scale') },
      ...perks.map(perk =>
        Card({ hover: true, class: css('_tc') },
          Card.Body({ class: css('_flex _col _aic _gap3 _py6') },
            div({ class: css('_flex _center _w12 _h12 _r3 _bgprimary/10') },
              icon(perk.ic, { size: '1.5rem', class: css('_fgprimary') })
            ),
            h3({ class: css('_heading5 _medium') }, perk.title),
            p({ class: css('_textxs _fgmuted') }, perk.description)
          )
        )
      )
    )
  );
}

// ─── Testimonials ───────────────────────────────────────────────
function Testimonials() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_tc') },
      h2({ class: css('_heading3 _mb2') }, 'What Members Say'),
      p({ class: css('_fgmuted') }, 'Hear from our guild members')
    ),
    div({ class: css('_grid _gc1 _md:gc3 _gap4 d-stagger') },
      ...testimonials.map(t =>
        Card({ class: css('gg-panel') },
          Card.Body({ class: css('_flex _col _gap3') },
            div({ class: css('_flex _aic _gap1 _fgprimary') },
              icon('quote', { size: '1.25rem', class: css('gg-glow-accent _fgaccent') })
            ),
            p({ class: css('_textsm _fgmuted _italic') }, `"${t.quote}"`),
            div({ class: css('_flex _aic _gap2 _mt2') },
              Avatar({ size: 'sm', fallback: t.name[0] }),
              div({ class: css('_flex _col') },
                span({ class: css('_textsm _medium') }, t.name),
                Badge({ variant: 'outline', size: 'sm' }, t.rank)
              )
            )
          )
        )
      )
    )
  );
}

// ─── CTA Section ────────────────────────────────────────────────
function CtaSection() {
  return div({ class: css('_flex _col _aic _tc _gap4 _py12 _px6 gg-mesh _r4') },
    h2({ class: css('_heading2 d-gradient-text') }, 'Ready to Level Up?'),
    p({ class: css('_body _fgmuted _mw[480px]') }, 'Your adventure begins here. Join the guild and start your journey to the top.'),
    Button({ variant: 'primary', size: 'lg', class: css('gg-glow-strong'), onclick: () => { if (globalThis.__openAuth) globalThis.__openAuth(); } },
      icon('shield', { size: '1em' }), ' JOIN NOW'
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function JoinGuildPage() {
  onMount(() => {
    document.title = 'Join Guild — Nexus Guild';
  });

  return div({ class: css('d-page-enter _flex _col _gap6') },
    JoinHero(),
    PerksGrid(),
    Testimonials(),
    CtaSection()
  );
}
