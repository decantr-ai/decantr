import { css } from '@decantr/css';
import { useState } from 'react';
import { Search, Star, Download, Bot, Sparkles, Shield, Code2, Database, Globe } from 'lucide-react';

const CATEGORIES = ['All', 'Data', 'Code', 'Security', 'Research', 'Automation'];

const MOCK_AGENTS = [
  { id: 1, name: 'DataCrawler Pro', author: 'agentops', category: 'Data', desc: 'High-performance web scraping agent with intelligent rate limiting and content extraction.', stars: 342, downloads: 1240, badge: 'Featured', icon: Database },
  { id: 2, name: 'CodeReview Agent', author: 'devtools-ai', category: 'Code', desc: 'Automated code review with security scanning, style checking, and actionable suggestions.', stars: 289, downloads: 980, badge: null, icon: Code2 },
  { id: 3, name: 'Sentinel Guard', author: 'sec-ai', category: 'Security', desc: 'Real-time threat detection agent monitoring API endpoints and infrastructure.', stars: 456, downloads: 2100, badge: 'Popular', icon: Shield },
  { id: 4, name: 'ResearchBot', author: 'lab-ai', category: 'Research', desc: 'Multi-source research agent that aggregates, summarizes, and cites academic papers.', stars: 198, downloads: 650, badge: null, icon: Sparkles },
  { id: 5, name: 'APIMapper', author: 'agentops', category: 'Automation', desc: 'Automatically discovers, documents, and tests API endpoints from OpenAPI specs.', stars: 167, downloads: 520, badge: null, icon: Globe },
  { id: 6, name: 'DataPipeline', author: 'data-eng', category: 'Data', desc: 'ETL pipeline orchestrator with schema validation, dedup, and incremental loading.', stars: 234, downloads: 870, badge: null, icon: Database },
  { id: 7, name: 'TestGen Agent', author: 'devtools-ai', category: 'Code', desc: 'Generates comprehensive test suites from source code with edge case detection.', stars: 312, downloads: 1100, badge: 'New', icon: Code2 },
  { id: 8, name: 'ComplianceBot', author: 'sec-ai', category: 'Security', desc: 'Audits codebases for GDPR, SOC2, and HIPAA compliance violations.', stars: 178, downloads: 430, badge: null, icon: Shield },
];

export function AgentMarketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = MOCK_AGENTS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.desc.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || a.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Hero */}
      <div className="d-section" style={{ padding: '2rem 0 1.5rem', textAlign: 'center' }}>
        <h1 className={css('_fontbold')} style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '0.5rem' }}>
          Agent <span className="neon-text-glow" style={{ color: 'var(--d-accent)' }}>Marketplace</span>
        </h1>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', maxWidth: 480, margin: '0 auto 1.5rem' }}>
          Browse and deploy pre-built autonomous agents from the community.
        </p>

        {/* Search */}
        <div className={css('_flex _aic _gap2')} style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className={css('_flex _aic _flex1')} style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--d-text-muted)', pointerEvents: 'none' }} />
            <input
              className="d-control carbon-input"
              placeholder="Search agents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className={css('_flex _aic _gap2 _wrap')}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className="d-interactive"
            data-variant={activeCategory === cat ? 'primary' : 'ghost'}
            onClick={() => setActiveCategory(cat)}
            style={{ fontSize: '0.8125rem', padding: '0.25rem 0.75rem' }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      {filtered.length === 0 ? (
        <div className={css('_flex _col _aic _jcc')} style={{ padding: '4rem 0' }}>
          <Bot size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--d-text-muted)' }}>No agents match your search</p>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            style={{ marginTop: '0.5rem' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={css('_grid _gap4')} style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {filtered.map((agent, i) => (
            <div
              key={agent.id}
              className="d-surface carbon-card neon-glow-hover"
              data-interactive
              style={{
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
                animationDelay: `${i * 50}ms`,
                position: 'relative',
              }}
            >
              {agent.badge && (
                <span
                  className="d-annotation"
                  data-status={agent.badge === 'Featured' ? 'info' : agent.badge === 'Popular' ? 'success' : 'warning'}
                  style={{ position: 'absolute', top: 12, right: 12 }}
                >
                  {agent.badge}
                </span>
              )}

              <div className={css('_flex _aic _gap3')} style={{ marginBottom: '0.75rem' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--d-accent) 12%, transparent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <agent.icon size={18} style={{ color: 'var(--d-accent)' }} />
                </div>
                <div>
                  <h3 className={css('_fontsemi _textsm')}>{agent.name}</h3>
                  <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>@{agent.author}</span>
                </div>
              </div>

              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {agent.desc}
              </p>

              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap3')}>
                  <span className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                    <Star size={12} /> {agent.stars}
                  </span>
                  <span className={css('_flex _aic _gap1 _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                    <Download size={12} /> {agent.downloads}
                  </span>
                </div>
                <button className="d-interactive" data-variant="primary" style={{ fontSize: '0.75rem', padding: '0.25rem 0.625rem' }}>
                  Deploy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .d-surface[data-interactive]:hover {
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}
