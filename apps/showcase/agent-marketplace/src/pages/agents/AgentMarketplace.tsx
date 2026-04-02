import { css } from '@decantr/css';
import { Search, Filter, Star, Download, Bot, Sparkles, Shield, Gauge, Code, FileSearch } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { StatusRing } from '../../components/StatusRing';

const CATEGORIES = ['All', 'Code', 'Data', 'Security', 'DevOps', 'Research'] as const;

const AGENTS = [
  { name: 'CodeGen Pro', author: '@openai', stars: 2847, downloads: '12.4k', category: 'Code', status: 'active' as const, description: 'Production-grade code generation with multi-language support and test generation.', icon: Code },
  { name: 'DataForge', author: '@anthropic', stars: 1923, downloads: '8.7k', category: 'Data', status: 'active' as const, description: 'ETL pipeline builder with schema inference and data validation.', icon: FileSearch },
  { name: 'SecGuard AI', author: '@security-lab', stars: 1456, downloads: '5.2k', category: 'Security', status: 'active' as const, description: 'Automated vulnerability scanning and threat modeling for codebases.', icon: Shield },
  { name: 'PerfTuner', author: '@meta-ai', stars: 987, downloads: '3.1k', category: 'DevOps', status: 'idle' as const, description: 'Real-time performance profiling and optimization recommendations.', icon: Gauge },
  { name: 'DocBot v4', author: '@google', stars: 2134, downloads: '9.8k', category: 'Code', status: 'active' as const, description: 'Intelligent documentation generation from code analysis.', icon: Sparkles },
  { name: 'TestPilot', author: '@vercel', stars: 1678, downloads: '6.3k', category: 'Code', status: 'active' as const, description: 'AI-driven test case generation with edge case discovery.', icon: Bot },
];

export function AgentMarketplace() {
  return (
    <>
      {/* Hero */}
      <section className="d-section" style={{ paddingTop: 0, paddingBottom: 'var(--d-gap-8)' }}>
        <div
          className="neon-entrance"
          style={{
            textAlign: 'center',
            padding: 'var(--d-gap-12) var(--d-gap-6)',
            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%)',
            borderRadius: 'var(--d-radius-lg)',
            border: '1px solid var(--d-border)',
          }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: 'var(--d-gap-3)' }}>
            Agent <span style={{ color: 'var(--d-accent)' }} className="neon-text-glow">Marketplace</span>
          </h1>
          <p className="mono-data" style={{ fontSize: '0.875rem', color: 'var(--d-text-muted)', maxWidth: 480, margin: '0 auto var(--d-gap-6)' }}>
            Discover, deploy, and orchestrate autonomous agents from the community registry.
          </p>
          <div className={css('_flex _aic _gap2 _jcc')}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
              <input
                className="d-control mono-data neon-glow-hover"
                placeholder="Search agents..."
                style={{ paddingLeft: 36, fontSize: '0.8125rem' }}
                aria-label="Search agents"
              />
            </div>
            <button className="d-interactive neon-glow-hover" data-variant="ghost" style={{ border: '1px solid var(--d-border)' }}>
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>
      </section>

      {/* Category chips */}
      <div className={css('_flex _gap2 _wrap')} style={{ marginBottom: 'var(--d-gap-6)' }}>
        {CATEGORIES.map((cat, i) => (
          <button
            key={cat}
            className="d-interactive neon-glow-hover"
            data-variant={i === 0 ? undefined : 'ghost'}
            style={{
              fontSize: '0.75rem',
              padding: 'var(--d-gap-1) var(--d-gap-3)',
              ...(i === 0 ? { background: 'var(--d-accent)', color: 'var(--d-bg)', borderColor: 'var(--d-accent)' } : { border: '1px solid var(--d-border)' }),
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent card grid */}
      <section className="d-section" style={{ paddingTop: 0 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--d-gap-4)',
          }}
        >
          {AGENTS.map((agent) => (
            <div
              key={agent.name}
              className="d-surface carbon-glass neon-glow-hover neon-entrance"
              data-interactive=""
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 'var(--d-gap-3)' }}
            >
              <div className={css('_flex _aic _gap3')}>
                <StatusRing status={agent.status} size={40}>
                  <agent.icon size={18} style={{ color: 'var(--d-accent)' }} />
                </StatusRing>
                <div style={{ flex: 1 }}>
                  <div className={css('_flex _aic _gap2')}>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>{agent.name}</span>
                    <span className="d-annotation" data-status="success">{agent.category}</span>
                  </div>
                  <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>{agent.author}</span>
                </div>
              </div>

              <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', lineHeight: 1.5, flex: 1 }}>
                {agent.description}
              </p>

              <div className={css('_flex _jcsb _aic')} style={{ borderTop: '1px solid var(--d-border)', paddingTop: 'var(--d-gap-3)' }}>
                <div className={css('_flex _aic _gap3')}>
                  <span className={css('_flex _aic _gap1') + ' mono-data'} style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                    <Star size={12} /> {agent.stars.toLocaleString()}
                  </span>
                  <span className={css('_flex _aic _gap1') + ' mono-data'} style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
                    <Download size={12} /> {agent.downloads}
                  </span>
                </div>
                <button
                  className="d-interactive neon-glow-hover"
                  style={{
                    fontSize: '0.75rem',
                    padding: 'var(--d-gap-1) var(--d-gap-3)',
                    background: 'var(--d-accent)',
                    color: 'var(--d-bg)',
                    borderColor: 'var(--d-accent)',
                  }}
                >
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
