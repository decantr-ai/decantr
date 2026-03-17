import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, Input, Select, icon } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

const categories = ['All', 'Announcements', 'Patch Notes', 'Events', 'Community'];

const posts = [
  {
    title: 'Season 4: Rise of the Ancients — Now Live',
    excerpt: 'The new season brings 3 new raid dungeons, legendary weapons, and a revamped ranking system. Dive into the ancient temples and prove your worth.',
    category: 'Announcements',
    author: 'GuildMaster',
    date: 'Mar 15, 2026',
    featured: true,
    ic: 'megaphone',
  },
  {
    title: 'Patch 4.1.2 — Balance Updates & Bug Fixes',
    excerpt: 'Adjusted damage scaling for Warrior class, fixed inventory duplication exploit, improved matchmaking queue times.',
    category: 'Patch Notes',
    author: 'DevTeam',
    date: 'Mar 14, 2026',
    featured: false,
    ic: 'wrench',
  },
  {
    title: 'Weekend Tournament: Double XP Showdown',
    excerpt: 'This Saturday and Sunday, earn double XP in all competitive modes. Top 10 players win exclusive cosmetic rewards.',
    category: 'Events',
    author: 'EventCoord',
    date: 'Mar 13, 2026',
    featured: false,
    ic: 'calendar',
  },
  {
    title: 'Community Spotlight: Best Raid Strategies',
    excerpt: 'Our community members share their top strategies for clearing the Obsidian Fortress. Learn from the best raiders in the guild.',
    category: 'Community',
    author: 'StormRider',
    date: 'Mar 12, 2026',
    featured: false,
    ic: 'message-circle',
  },
  {
    title: 'New Guild Hall Customization Options',
    excerpt: 'Unlock banners, trophies, and decorations for your guild hall. Show off your achievements with the new display system.',
    category: 'Announcements',
    author: 'GuildMaster',
    date: 'Mar 10, 2026',
    featured: false,
    ic: 'palette',
  },
  {
    title: 'Esports League Registration Open',
    excerpt: 'Form your squad and register for the Nexus Esports League. Prize pool: 50,000 Guild Coins. Registration closes March 25.',
    category: 'Events',
    author: 'EventCoord',
    date: 'Mar 8, 2026',
    featured: false,
    ic: 'trophy',
  },
];

const [category, setCategory] = createSignal('All');

// ─── Filter Bar ─────────────────────────────────────────────────
function FilterBar() {
  const [search, setSearch] = createSignal('');

  return div({ class: css('_flex _gap3 _aic _flexWrap') },
    Input({ placeholder: 'Search news...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[260px]') }),
    Select({ value: category, onchange: v => setCategory(v), options: categories.map(c => ({ label: c, value: c })) }),
    div({ class: css('_flex1') }),
    div({ class: css('_flex _gap2') },
      ...categories.slice(1).map(c =>
        Chip({ label: c, variant: category() === c ? 'primary' : 'outline', size: 'sm', class: css('gg-label'), onclick: () => setCategory(category() === c ? 'All' : c) })
      )
    )
  );
}

// ─── Post List ──────────────────────────────────────────────────
function PostList() {
  const filtered = () => {
    const cat = category();
    return cat === 'All' ? posts : posts.filter(p => p.category === cat);
  };

  return div({ class: css('_flex _col _gap3 d-stagger') },
    ...filtered().map(post =>
      Card({ hover: true, class: css(post.featured ? 'gg-glow' : '') },
        Card.Body({},
          div({ class: css('_flex _gap4') },
            div({ class: css('_flex _center _w12 _h12 _r3 _bgprimary/10 _shrink0') },
              icon(post.ic, { size: '1.25rem', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _gap2 _flex1') },
              div({ class: css('_flex _aic _gap2 _flexWrap') },
                Chip({ label: post.category, variant: post.featured ? 'primary' : 'outline', size: 'xs', class: css('gg-label') }),
                post.featured ? Badge({ variant: 'success', size: 'sm' }, 'FEATURED') : null,
              ),
              h3({ class: css('_heading5 _medium') }, post.title),
              p({ class: css('_textsm _fgmuted') }, post.excerpt),
              div({ class: css('_flex _aic _gap3 _mt1') },
                div({ class: css('_flex _aic _gap2') },
                  Avatar({ size: 'xs', fallback: post.author[0] }),
                  span({ class: css('_textxs _medium') }, post.author)
                ),
                span({ class: css('gg-data _textxs _fgmuted') }, post.date)
              )
            )
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function NewsPage() {
  onMount(() => {
    document.title = 'News — Nexus Guild';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _aic _gap2') },
        icon('newspaper', { size: '1.25rem', class: css('_fgprimary') }),
        h2({ class: css('gg-label _fgmutedfg') }, 'GUILD NEWS')
      ),
      span({ class: css('gg-data _textxs _fgmuted') }, `${posts.length} POSTS`)
    ),
    FilterBar(),
    PostList()
  );
}
