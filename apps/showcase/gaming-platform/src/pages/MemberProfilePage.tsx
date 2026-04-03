import { useParams } from 'react-router-dom';
import { KpiGrid } from '@/components/KpiGrid';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Timeline } from '@/components/Timeline';
import { userProfiles, achievements as allAchievements, activityFeed, hallOfFameTimeline } from '@/data/mock';
import { Shield, Star, Clock, Gamepad2 } from 'lucide-react';
import type { GuildStat } from '@/data/mock';

const rarityColors: Record<string, string> = {
  common: '#6b7280',
  rare: '#3b82f6',
  epic: '#a855f7',
  legendary: '#f59e0b',
};

export function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const profile = userProfiles.find(p => p.id === id) || userProfiles[0];
  const profileAchievements = profile.achievements.length > 0 ? profile.achievements : allAchievements.slice(0, 6);
  const profileActivity = profile.recentActivity.length > 0 ? profile.recentActivity : activityFeed.slice(0, 5);

  const profileStats: GuildStat[] = [
    { label: 'Games Played', value: profile.gamesPlayed.toLocaleString(), change: 5.2, icon: 'swords' },
    { label: 'Wins', value: profile.wins.toLocaleString(), change: 3.8, icon: 'trophy' },
    { label: 'Hours Played', value: profile.hoursPlayed.toLocaleString(), change: 12.1, icon: 'trending-up' },
    { label: 'Win Rate', value: `${Math.round((profile.wins / profile.gamesPlayed) * 100)}%`, change: 1.4, icon: 'users' },
  ];

  return (
    <div className="gg-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-6)' }}>
      {/* Player Header (detail-header profile preset) */}
      <div className="d-section" style={{ paddingBottom: 'var(--d-gap-6)', borderBottom: '1px solid var(--d-border)' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 96,
            height: 96,
            borderRadius: 'var(--d-radius-lg)',
            background: 'linear-gradient(135deg, var(--d-primary), var(--d-accent))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: '0 0 24px rgba(59, 130, 246, 0.2)',
          }}>
            {profile.avatar}
          </div>
          {/* Info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{profile.name}</h1>
              <span className="d-annotation" data-status="success">{profile.title}</span>
              <span
                className="gg-rank-badge"
                data-rank={profile.rank <= 3 ? String(profile.rank) : 'default'}
              >
                #{profile.rank}
              </span>
            </div>
            <p style={{ color: 'var(--d-text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {profile.guildRole} &middot; Joined {profile.joinDate} &middot; Level {profile.level}
            </p>
            {/* XP Bar */}
            <div style={{ marginTop: '0.75rem', maxWidth: 320 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--d-text-muted)', marginBottom: '0.25rem' }}>
                <span>Level {profile.level}</span>
                <span>{profile.xp.toLocaleString()} / {profile.xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="gg-xp-bar">
                <div className="gg-xp-bar-fill" style={{ width: `${(profile.xp / profile.xpToNext) * 100}%` }} />
              </div>
            </div>
            {/* Quick stats row */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {[
                { icon: Gamepad2, label: 'Games', value: profile.gamesPlayed },
                { icon: Shield, label: 'Wins', value: profile.wins },
                { icon: Star, label: 'Rank', value: `#${profile.rank}` },
                { icon: Clock, label: 'Hours', value: profile.hoursPlayed },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem' }}>
                  <s.icon size={14} style={{ color: 'var(--d-text-muted)' }} />
                  <span style={{ color: 'var(--d-text-muted)' }}>{s.label}:</span>
                  <span style={{ fontWeight: 500 }}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <KpiGrid stats={profileStats} />

      {/* Two-column: Achievements (2 span) + Activity Feed */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 'var(--d-gap-4)',
      }}>
        {/* Achievements */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)', gridColumn: 'span 1' }}>
          <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
            Achievements
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--d-gap-3)' }}>
            {profileAchievements.map(ach => (
              <div
                key={ach.id}
                className="gg-achievement-shine"
                data-rarity={ach.rarity}
                style={{ padding: '0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 'var(--d-radius-sm)',
                    background: `color-mix(in srgb, ${rarityColors[ach.rarity]} 15%, transparent)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Star size={14} style={{ color: rarityColors[ach.rarity] }} />
                  </div>
                  <span className="d-annotation" style={{
                    background: `color-mix(in srgb, ${rarityColors[ach.rarity]} 15%, transparent)`,
                    color: rarityColors[ach.rarity],
                    fontSize: '0.6rem',
                    textTransform: 'uppercase',
                  }}>
                    {ach.rarity}
                  </span>
                </div>
                <div style={{ fontWeight: 500, fontSize: '0.8rem', marginBottom: '0.125rem' }}>{ach.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>{ach.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="d-surface" style={{ padding: 'var(--d-surface-p)' }}>
          <ActivityFeed events={profileActivity} />
        </div>
      </div>

      {/* Timeline */}
      <div className="d-section" data-density="compact">
        <div className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem', marginBottom: '1rem' }}>
          Journey
        </div>
        <Timeline entries={hallOfFameTimeline.map(e => ({ ...e, description: `${profile.name} — ${e.description}` }))} />
      </div>
    </div>
  );
}
