import { tags } from 'decantr/tags';
import { onMount } from 'decantr/core';
import { css } from 'decantr/css';
import { Avatar, Badge, Button, Card, Chip, Statistic, icon } from 'decantr/components';

const { div, span, h2, h3, p } = tags;

// ─── Mock data ──────────────────────────────────────────────────
const player = {
  name: 'ShadowBlade',
  rank: 'Diamond III',
  guild: 'Nexus Guild',
  joined: 'Jun 2025',
  xp: 142500,
  nextLevel: 160000,
  xpPercent: 89,
};

const profileKpis = [
  { label: 'TOTAL XP', value: 142500, trend: 'up', trendValue: '+2,400' },
  { label: 'WIN RATE', value: 87, suffix: '%', trend: 'up', trendValue: '+2.1%' },
  { label: 'QUESTS COMPLETED', value: 340, trend: 'up', trendValue: '+12' },
  { label: 'GUILD RANK', value: 12, prefix: '#', trend: 'up', trendValue: '+3' },
];

const achievements = [
  { title: 'Dragon Slayer', description: 'Defeated 100 dragons', icon: 'flame', earned: true, date: 'Mar 2026' },
  { title: 'Speed Demon', description: 'Win 10 matches under 5 min', icon: 'zap', earned: true, date: 'Feb 2026' },
  { title: 'Guild Champion', description: 'Win a guild tournament', icon: 'trophy', earned: true, date: 'Jan 2026' },
  { title: 'Raid Master', description: 'Complete all raid dungeons', icon: 'swords', earned: true, date: 'Dec 2025' },
  { title: 'Social Butterfly', description: 'Add 50 guild friends', icon: 'users', earned: true, date: 'Nov 2025' },
  { title: 'Sharpshooter', description: '95% accuracy in ranked', icon: 'crosshair', earned: false, date: null },
  { title: 'Night Owl', description: 'Play 100 midnight sessions', icon: 'moon', earned: false, date: null },
  { title: 'Completionist', description: 'Unlock all achievements', icon: 'check-circle', earned: false, date: null },
];

const recentActivity = [
  { action: 'Won ranked match vs. TeamPhoenix', time: '30 min ago', ic: 'trophy', variant: 'success' },
  { action: 'Completed Raid: Dragon\'s Lair (Heroic)', time: '2 hours ago', ic: 'swords', variant: 'success' },
  { action: 'Earned achievement: Speed Demon', time: '5 hours ago', ic: 'zap', variant: 'success' },
  { action: 'Joined Tournament #43 queue', time: '1 day ago', ic: 'calendar', variant: 'default' },
  { action: 'Updated loadout: Phantom Blade Set', time: '2 days ago', ic: 'settings', variant: 'default' },
];

const timeline = [
  { date: 'Mar 2026', title: 'Reached Diamond III', description: 'Climbed from Platinum to Diamond in Season 4', ic: 'trending-up' },
  { date: 'Feb 2026', title: 'Speed Demon Achievement', description: 'Won 10 matches under 5 minutes', ic: 'zap' },
  { date: 'Jan 2026', title: 'Guild Tournament Champion', description: 'Won the New Year Invitational', ic: 'trophy' },
  { date: 'Dec 2025', title: 'All Raids Completed', description: 'Cleared every raid dungeon on heroic', ic: 'swords' },
  { date: 'Jun 2025', title: 'Joined Nexus Guild', description: 'Started the journey as a Bronze II player', ic: 'shield' },
];

// ─── Profile Header ────────────────────────────────────────────
function ProfileHeader() {
  return div({ class: css('_flex _col _aic _gap4 _py12 _px6 gg-mesh _r4') },
    Avatar({ size: 'xl', fallback: 'S', class: css('gg-glow-strong') }),
    div({ class: css('_flex _col _aic _gap2') },
      h2({ class: css('_heading2 d-gradient-text') }, player.name),
      div({ class: css('_flex _aic _gap2') },
        Badge({ variant: 'primary', class: css('gg-shimmer') }, player.rank),
        Chip({ label: player.guild, variant: 'outline', size: 'sm' }),
      ),
      span({ class: css('gg-data _textxs _fgmuted') }, `Joined ${player.joined}`)
    ),
    div({ class: css('_w[300px]') },
      div({ class: css('_flex _jcsb _mb1') },
        span({ class: css('gg-label _textxs') }, 'XP PROGRESS'),
        span({ class: css('gg-data _textxs _fgmuted') }, `${player.xp.toLocaleString()} / ${player.nextLevel.toLocaleString()}`)
      ),
      div({ class: css('gg-xp-bar'), style: `--gg-xp:${player.xpPercent}%` })
    ),
    div({ class: css('_flex _gap2') },
      Button({ variant: 'outline', size: 'sm' }, icon('edit', { size: '1em' }), ' Edit Profile'),
      Button({ variant: 'outline', size: 'sm' }, icon('share', { size: '1em' }), ' Share')
    )
  );
}

// ─── KPI Grid ───────────────────────────────────────────────────
function PlayerKpis() {
  return div({ class: css('_grid _gc1 _sm:gc2 _lg:gc4 _gap3 d-stagger-scale') },
    ...profileKpis.map(kpi =>
      Statistic({
        label: kpi.label,
        value: kpi.value,
        prefix: kpi.prefix,
        suffix: kpi.suffix,
        trend: kpi.trend,
        trendValue: kpi.trendValue,
        animate: 1200,
        class: css('gg-glow'),
      })
    )
  );
}

// ─── Achievement Grid ───────────────────────────────────────────
function AchievementGrid() {
  const earned = achievements.filter(a => a.earned).length;

  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        h3({ class: css('gg-label') }, 'ACHIEVEMENTS'),
        Badge({ variant: 'outline', size: 'sm' }, `${earned}/${achievements.length}`)
      )
    ),
    Card.Body({},
      div({ class: css('_grid _gc2 _md:gc3 _lg:gc4 _gap3 d-stagger-scale') },
        ...achievements.map(a =>
          Card({ class: css(`_tc ${a.earned ? 'gg-badge-pop' : '_opacity50'}`) },
            Card.Body({ class: css('_flex _col _aic _gap2 _py4') },
              div({ class: css('_flex _center _w12 _h12 _r3 _bgprimary/10') },
                icon(a.icon, { size: '1.5rem', class: css(a.earned ? '_fgprimary' : '_fgmuted') })
              ),
              span({ class: css('_textsm _medium') }, a.title),
              span({ class: css('_textxs _fgmuted _tc') }, a.description),
              a.earned
                ? Badge({ variant: 'success', size: 'sm' }, a.date)
                : Badge({ variant: 'outline', size: 'sm' }, 'Locked')
            )
          )
        )
      )
    )
  );
}

// ─── Activity Feed ──────────────────────────────────────────────
function PlayerActivity() {
  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        h3({ class: css('gg-label') }, 'RECENT ACTIVITY'),
        span({ class: css('gg-data _textxs _fgmuted') }, 'LAST 7 DAYS')
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...recentActivity.map(item =>
          div({ class: css('_flex _gap3 _aic _py2 _borderB') },
            div({ class: css(`_flex _center _w8 _h8 _r2 ${item.variant === 'success' ? '_bgaccent/10' : '_bgprimary/10'}`) },
              icon(item.ic, { size: '1em', class: css(item.variant === 'success' ? '_fgaccent' : '_fgprimary') })
            ),
            div({ class: css('_flex _col _flex1') },
              span({ class: css('_textsm') }, item.action),
              span({ class: css('gg-data _textxs _fgmuted') }, item.time)
            ),
            item.variant === 'success'
              ? Chip({ label: 'GG', variant: 'success', size: 'xs' })
              : null
          )
        )
      )
    )
  );
}

// ─── Timeline ───────────────────────────────────────────────────
function PlayerTimeline() {
  return Card({ class: css('gg-panel') },
    Card.Header({},
      div({ class: css('_flex _aic _jcsb _wfull') },
        h3({ class: css('gg-label') }, 'JOURNEY'),
        Badge({ variant: 'outline', size: 'sm' }, `${timeline.length} MILESTONES`)
      )
    ),
    Card.Body({},
      div({ class: css('_flex _col _gap1 d-stagger') },
        ...timeline.map((item, i) =>
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
export default function MemberProfilePage() {
  onMount(() => {
    document.title = `${player.name} — Nexus Guild`;
  });

  return div({ class: css('d-page-enter _flex _col _gap4') },
    ProfileHeader(),
    PlayerKpis(),
    div({ class: css('_grid _gc1 _lg:gc3 _gap4') },
      div({ class: css('_span1 _lg:span2') }, AchievementGrid()),
      PlayerActivity()
    ),
    PlayerTimeline()
  );
}
