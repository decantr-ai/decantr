import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Card, Statistic, icon } from 'decantr/components';

const { div, span, h2, h3 } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const guildStats = [
  { label: 'TOTAL MEMBERS', value: 4500, suffix: '+', trend: 'up', trendValue: '+120' },
  { label: 'ACTIVE TODAY', value: 1280, trend: 'up', trendValue: '+85' },
  { label: 'TOURNAMENTS HELD', value: 42, trend: 'up', trendValue: '+3' },
  { label: 'REWARDS DISTRIBUTED', value: 1.2, suffix: 'M', trend: 'up', trendValue: '+150K' },
];

const leaderboardEntries = [
  { name: 'ShadowBlade', xp: '142,500', winRate: '87%', rank: 'Diamond III', avatar: null },
  { name: 'NeonViper', xp: '138,200', winRate: '84%', rank: 'Diamond II', avatar: null },
  { name: 'StormRider', xp: '125,800', winRate: '81%', rank: 'Diamond I', avatar: null },
  { name: 'PixelKnight', xp: '118,400', winRate: '79%', rank: 'Platinum III', avatar: null },
  { name: 'CrimsonFox', xp: '112,100', winRate: '77%', rank: 'Platinum II', avatar: null },
  { name: 'IronWolf', xp: '105,600', winRate: '75%', rank: 'Platinum I', avatar: null },
  { name: 'BlazeThorn', xp: '98,900', winRate: '73%', rank: 'Gold III', avatar: null },
  { name: 'FrostByte', xp: '94,200', winRate: '71%', rank: 'Gold II', avatar: null },
  { name: 'VenomStrike', xp: '89,700', winRate: '69%', rank: 'Gold I', avatar: null },
  { name: 'LunarPhoenix', xp: '85,300', winRate: '68%', rank: 'Silver III', avatar: null },
];

const milestones = [
  { date: 'Mar 2026', title: 'Season 4 Launch', description: 'Rise of the Ancients season begins', ic: 'rocket' },
  { date: 'Feb 2026', title: '1,000th Tournament', description: 'Guild hosts its 1,000th competitive tournament', ic: 'trophy' },
  { date: 'Jan 2026', title: '4,000 Members', description: 'Guild surpasses 4,000 active members', ic: 'users' },
  { date: 'Dec 2025', title: 'Esports Partnership', description: 'Official partnership with Nexus Esports League', ic: 'handshake' },
  { date: 'Oct 2025', title: 'Guild Hall 2.0', description: 'Complete redesign of the guild platform', ic: 'layout-dashboard' },
  { date: 'Jun 2025', title: 'Guild Founded', description: 'Nexus Guild established by founding members', ic: 'shield' },
];

// ─── Stats Bar ──────────────────────────────────────────────────
function StatsBar() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap3 d-stagger-scale') },
    ...guildStats.map(stat =>
      Statistic({
        label: stat.label,
        value: stat.value,
        suffix: stat.suffix,
        trend: stat.trend,
        trendValue: stat.trendValue,
        animate: 1200,
        class: css('gg-glow'),
      })
    )
  );
}

// ─── Podium ─────────────────────────────────────────────────────
function Podium() {
  const top3 = leaderboardEntries.slice(0, 3);
  const order = [top3[1], top3[0], top3[2]]; // #2, #1, #3
  const medals = ['medal', 'trophy', 'award'];
  const ranks = [2, 1, 3];

  return div({ class: css('_grid _gc3 _gap4 _aic _mb4 d-stagger-scale') },
    ...order.map((entry, i) => {
      const isFirst = ranks[i] === 1;
      return Card({ class: css(`_tc ${isFirst ? 'gg-glow-strong gg-shimmer' : 'gg-glow'}`) },
        Card.Body({ class: css(`_flex _col _aic _gap2 ${isFirst ? '_py8' : '_py4'}`) },
          Avatar({ size: isFirst ? 'xl' : 'lg', fallback: entry.name[0], class: css(isFirst ? 'gg-glow-strong' : '') }),
          span({ class: css(`_medium ${isFirst ? '_heading4 d-gradient-text' : '_textsm'}`) }, entry.name),
          span({ class: css('gg-data _textxs _fgmuted') }, `${entry.xp} XP`),
          Badge({ variant: isFirst ? 'primary' : 'outline' },
            icon(medals[i], { size: '0.75rem' }),
            ` #${ranks[i]}`
          ),
          Badge({ variant: 'outline', size: 'sm' }, entry.rank)
        )
      );
    })
  );
}

// ─── Ranked List ────────────────────────────────────────────────
function RankedList() {
  const rest = leaderboardEntries.slice(3);

  return div({ class: css('_flex _col _gap1 d-stagger') },
    ...rest.map((entry, i) =>
      div({ class: css('_flex _aic _gap3 _py3 _px4 _borderB _r2 _h:bgmuted/5') },
        span({ class: css('_w8 _tc gg-data _medium _fgmuted') }, `#${i + 4}`),
        Avatar({ size: 'sm', fallback: entry.name[0] }),
        div({ class: css('_flex _col _flex1') },
          span({ class: css('_textsm _medium') }, entry.name),
          span({ class: css('gg-data _textxs _fgmuted') }, `${entry.xp} XP · ${entry.winRate} Win Rate`)
        ),
        Badge({ variant: 'outline', size: 'sm' }, entry.rank)
      )
    )
  );
}

// ─── Full Leaderboard ───────────────────────────────────────────
function FullLeaderboard() {
  return Card({ class: css('gg-panel gg-glow') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        h3({ class: css('gg-label') }, 'GUILD LEADERBOARD'),
        span({ class: css('gg-data _textxs _fgmuted') }, 'SEASON 4')
      )
    ),
    Card.Body({},
      Podium(),
      RankedList()
    )
  );
}

// ─── Timeline ───────────────────────────────────────────────────
function GuildTimeline() {
  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        h3({ class: css('gg-label') }, 'GUILD MILESTONES'),
        Badge({ variant: 'outline', size: 'sm' }, `${milestones.length} EVENTS`)
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...milestones.map((item, i) =>
          div({ class: css('_flex _gap4 _py3 _borderB') },
            div({ class: css('_flex _col _aic _w16 _shrink0') },
              div({ class: css(`_flex _center _w8 _h8 _r2 _bgprimary/10 ${i === 0 ? 'gg-glow-accent' : ''}`) },
                icon(item.ic, { size: '1em', class: css(i === 0 ? '_fgaccent' : '_fgprimary') })
              ),
              span({ class: css('gg-data _textxs _fgmuted _mt2') }, item.date)
            ),
            div({ class: css('_flex _col _gap1') },
              span({ class: css('_textsm _medium') }, item.title),
              span({ class: css('_textxs _fgmuted') }, item.description)
            )
          )
        )
      )
    )
  );
}

// ─── Page ───────────────────────────────────────────────────────
export default function HallOfFamePage() {
  onMount(() => {
    document.title = 'Hall of Fame — Nexus Guild';
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    div({ class: css('_flex _aic _gap2') },
      icon('trophy', { size: '1.25rem', class: css('_fgprimary') }),
      h2({ class: css('gg-label _fgmutedfg') }, 'HALL OF FAME')
    ),
    StatsBar(),
    FullLeaderboard(),
    GuildTimeline()
  );
}
