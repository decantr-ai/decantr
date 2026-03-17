import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, Statistic, icon } from 'decantr/components';

const { div, span, h1, h3, p } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const kpis = [
  { label: 'GUILD MEMBERS', value: 4500, suffix: '+', trend: 'up', trendValue: '+120', ic: 'users' },
  { label: 'ACTIVE QUESTS', value: 150, suffix: '+', trend: 'up', trendValue: '+12', ic: 'swords' },
  { label: 'EVENTS THIS MONTH', value: 12, trend: 'up', trendValue: '+3', ic: 'calendar' },
  { label: 'REWARDS GIVEN', value: 250, suffix: 'K+', trend: 'up', trendValue: '+15K', ic: 'gem' },
];

const activities = [
  { user: 'ShadowBlade', action: 'earned Diamond III rank', time: '2 min ago', variant: 'success', ic: 'trophy' },
  { user: 'NeonViper', action: 'completed Raid: Dragon\'s Lair', time: '15 min ago', variant: 'default', ic: 'swords' },
  { user: 'StormRider', action: 'won Tournament #42', time: '1 hour ago', variant: 'success', ic: 'medal' },
  { user: 'PixelKnight', action: 'joined the guild', time: '3 hours ago', variant: 'default', ic: 'shield' },
  { user: 'CrimsonFox', action: 'unlocked achievement: Speed Demon', time: '4 hours ago', variant: 'success', ic: 'zap' },
];

const topPlayers = [
  { name: 'ShadowBlade', stat: '142,500 XP', rank: '#1' },
  { name: 'NeonViper', stat: '138,200 XP', rank: '#2' },
  { name: 'StormRider', stat: '125,800 XP', rank: '#3' },
];

// ─── Hero ───────────────────────────────────────────────────────
function Hero() {
  return div({ class: css('_flex _col _aic _tc _gap6 _py12 _px6 gg-mesh _r4') },
    div({ class: css('_flex _aic _gap2') },
      span({ class: css('gg-live') }),
      Badge({ variant: 'success', size: 'sm', class: css('gg-glow-pulse') }, 'LIVE NOW')
    ),
    h1({ class: css('_heading1 d-gradient-text') }, 'Level Up Your Gaming Journey'),
    p({ class: css('_body _fgmuted _mw[640px]') }, 'Join thousands of players in the ultimate guild experience. Compete, collaborate, and conquer together.'),
    div({ class: css('_flex _gap3') },
      Button({ variant: 'primary', size: 'lg', class: css('gg-glow'), onclick: () => { if (globalThis.__openAuth) globalThis.__openAuth(); } }, 'JOIN THE GUILD'),
      Button({ variant: 'outline', size: 'lg' }, icon('gamepad-2', { size: '1em' }), ' Browse Games')
    )
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────
function KpiGrid() {
  return div({ class: css('_flex _col _gap3') },
    div({ class: css('_flex _aic _jcsb') },
      div({ class: css('_flex _aic _gap2') },
        span({ class: css('gg-live') }),
        h3({ class: css('gg-label _fgmutedfg') }, 'GUILD METRICS')
      ),
      span({ class: css('gg-data _textxs _fgmuted') }, new Date().toLocaleDateString())
    ),
    div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap3 d-stagger-scale') },
      ...kpis.map(kpi =>
        Statistic({
          label: kpi.label,
          value: kpi.value,
          suffix: kpi.suffix,
          trend: kpi.trend,
          trendValue: kpi.trendValue,
          animate: 1200,
          class: css('gg-glow'),
        })
      )
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function ActivityFeed() {
  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        span({ class: css('gg-label') }, 'RECENT ACTIVITY'),
        div({ class: css('_flex _aic _gap1') },
          span({ class: css('gg-live') }),
          span({ class: css('gg-data _textxs _fgmuted') }, 'LIVE')
        )
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...activities.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css('_flex _center _w8 _h8 _r2 _bgprimary/10') },
              icon(item.ic, { size: '1em', class: css('_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') },
                span({ class: css('_medium') }, item.user),
                span({ class: css('_fgmuted') }, ` ${item.action}`)
              ),
              span({ class: css('gg-data _textxs _fgmuted') }, item.time)
            ),
            Chip({
              label: item.variant === 'success' ? 'GG' : 'INFO',
              variant: item.variant === 'success' ? 'success' : 'info',
              size: 'xs',
            })
          )
        )
      )
    ),
    Card.Footer({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        span({ class: css('gg-label _textxs _fgmuted') }, `${activities.length} EVENTS`),
        Button({ variant: 'ghost', size: 'sm', class: css('gg-label _textxs') }, 'VIEW ALL')
      )
    )
  );
}

// ─── Spotlight Leaderboard ──────────────────────────────────────
function SpotlightLeaderboard() {
  const rankColors = ['_fgprimary', '_fgaccent', '_fgwarning'];

  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        span({ class: css('gg-label') }, 'TOP PLAYERS'),
        Badge({ variant: 'outline', size: 'sm' }, 'This Week')
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap2 d-stagger') },
        ...topPlayers.map((player, i) =>
          div({ class: css('_flex _aic _gap3 _py2') },
            span({ class: css(`_w6 _tc gg-data _medium ${rankColors[i]}`) }, player.rank),
            Avatar({ size: 'sm', fallback: player.name[0] }),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm _medium') }, player.name),
              span({ class: css('gg-data _textxs _fgmuted') }, player.stat)
            ),
            icon(i === 0 ? 'trophy' : 'medal', { size: '1em', class: css(rankColors[i]) })
          )
        )
      )
    ),
    Card.Footer({},
      Button({ variant: 'ghost', size: 'sm', class: css('gg-label _textxs _wfull') }, 'VIEW FULL LEADERBOARD')
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function MainPage() {
  onMount(() => {
    document.title = 'Main — Nexus Guild';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    Hero(),
    KpiGrid(),
    div({ class: css('_grid _gc1 _lg:gc2 _gap4') },
      ActivityFeed(),
      SpotlightLeaderboard()
    )
  );
}
