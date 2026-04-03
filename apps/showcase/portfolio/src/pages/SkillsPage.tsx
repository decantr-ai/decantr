import { css } from '@decantr/css';
import {
  Code2, FileCode, Globe, Palette, Box, BarChart3,
  Server, Database, GitBranch, Container, Figma,
  Clapperboard, Eye, Zap, PenTool,
} from 'lucide-react';
import { skills } from '../data/mock';

const iconMap: Record<string, typeof Code2> = {
  Code2, FileCode, Globe, Palette, Box, BarChart3,
  Server, Database, GitBranch, Container, Figma,
  Clapperboard, Eye, Zap, PenTool,
};

export function SkillsPage() {
  const categories = [...new Set(skills.map((s) => s.category))];

  return (
    <div className="entrance-fade" style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <section className="d-section">
        <h1
          className="d-gradient-text"
          style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 600, marginBottom: '0.75rem' }}
        >
          Skills & Expertise
        </h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '1.0625rem', marginBottom: '3rem', maxWidth: '36rem' }}>
          Eight years of building at the intersection of design and engineering.
        </p>

        <div className={css('_flex _col _gap12')}>
          {categories.map((category) => (
            <div key={category}>
              <h2
                className="d-label"
                style={{
                  marginBottom: '1.5rem',
                  borderLeft: '2px solid var(--d-accent)',
                  paddingLeft: '0.5rem',
                }}
              >
                {category}
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
                  gap: '1rem',
                }}
              >
                {skills
                  .filter((s) => s.category === category)
                  .map((skill) => {
                    const Icon = iconMap[skill.icon] || Code2;
                    return (
                      <div
                        key={skill.name}
                        className="d-surface d-glass"
                        style={{ borderRadius: 'var(--d-radius)', display: 'flex', alignItems: 'center', gap: '1rem' }}
                      >
                        <div className="d-icon-glow" style={{ flexShrink: 0 }}>
                          <Icon size={18} style={{ color: 'var(--d-text)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className={css('_flex _aic _jcsb')} style={{ marginBottom: '0.375rem' }}>
                            <span className={css('_textsm _fontmedium')}>{skill.name}</span>
                            <span className={css('_textsm') + ' d-stat-glow'} style={{ color: 'var(--d-primary)' }}>
                              {skill.level}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: 4,
                              background: 'var(--d-surface-raised)',
                              borderRadius: 'var(--d-radius-full)',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${skill.level}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, var(--d-primary), var(--d-accent))',
                                borderRadius: 'var(--d-radius-full)',
                                transition: 'width 0.6s ease',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
