import { useState } from 'react';
import { css } from '@decantr/css';
import { Search, Star, Download, Bot, Sparkles, Filter } from 'lucide-react';

interface AgentCard {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: string;
  status: 'verified' | 'community' | 'experimental';
}

const agents: AgentCard[] = [
  { id: '1', name: 'Data Pipeline Pro', description: 'Enterprise-grade ETL agent with 50+ connectors and automatic schema detection.', category: 'Data', rating: 4.9, downloads: '12.4k', status: 'verified' },
  { id: '2', name: 'NLP Sentinel', description: 'Natural language processing agent for entity extraction, sentiment, and summarization.', category: 'AI/ML', rating: 4.7, downloads: '8.2k', status: 'verified' },
  { id: '3', name: 'Alert Dispatcher', description: 'Multi-channel alert routing with escalation policies and on-call scheduling.', category: 'Ops', rating: 4.5, downloads: '5.1k', status: 'verified' },
  { id: '4', name: 'Code Reviewer', description: 'Automated code review agent using static analysis and LLM-powered suggestions.', category: 'Dev', rating: 4.3, downloads: '3.7k', status: 'community' },
  { id: '5', name: 'Log Analyzer', description: 'Pattern detection and anomaly identification across distributed log streams.', category: 'Ops', rating: 4.6, downloads: '6.9k', status: 'verified' },
  { id: '6', name: 'Schema Migrator', description: 'Zero-downtime database schema migration agent with rollback capabilities.', category: 'Data', rating: 4.1, downloads: '2.3k', status: 'experimental' },
];

const categories = ['All', 'Data', 'AI/ML', 'Ops', 'Dev'];

export function AgentMarketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = agents.filter(a => {
    if (activeCategory !== 'All' && a.category !== activeCategory) return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className={css('_flex _col _gap8 _p6')}>
      {/* Hero */}
      <div className="d-section" style={{ textAlign: 'center', paddingBottom: 'var(--d-gap-8)' }}>
        <div className={css('_flex _col _aic _gap4')}>
          <span className="d-annotation neon-border-glow" style={{ color: 'var(--d-accent)' }}>
            <Sparkles size={12} />
            Agent Marketplace
          </span>
          <h1 className={css('_text3xl _fontbold')}>Discover Intelligent Agents</h1>
          <p className={css('_textlg')} style={{ color: 'var(--d-text-muted)', maxWidth: '600px', lineHeight: 1.7 }}>
            Browse, deploy, and orchestrate production-ready agents built by the community.
          </p>
          <div className={css('_flex _gap3')}>
            <a href="#/marketplace" className={'d-interactive neon-glow-hover'} data-variant="primary" style={{ textDecoration: 'none' }}>
              <Search size={14} />
              Explore Agents
            </a>
            <a href="#/agents" className={'d-interactive'} data-variant="ghost" style={{ textDecoration: 'none' }}>
              My Swarm
            </a>
          </div>
        </div>
      </div>

      {/* Search + filters */}
      <div className={css('_flex _aic _gap4 _wrap')}>
        <div className={css('_flex _aic _gap2 _flex1')} style={{ position: 'relative', minWidth: '240px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--d-text-muted)' }} />
          <input
            type="text"
            placeholder="Search agents..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="d-control carbon-input"
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <div className={css('_flex _gap2')} role="group" aria-label="Category filters">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={'d-interactive'}
              data-variant={activeCategory === cat ? 'primary' : 'ghost'}
              style={{ fontSize: '0.8125rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className={css('_flex _col _aic _jcc _gap3 _py12')} style={{ color: 'var(--d-text-muted)' }}>
          <Filter size={48} style={{ opacity: 0.3 }} />
          <p className={css('_textsm')}>No agents match your filters.</p>
          <button
            onClick={() => { setActiveCategory('All'); setSearch(''); }}
            className={'d-interactive'}
            data-variant="ghost"
            style={{ color: 'var(--d-accent)' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          className={css('_grid _gap4')}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          role="feed"
          aria-label="Agent catalog"
        >
          {filtered.map(agent => (
            <div
              key={agent.id}
              className={css('_flex _col _gap3 _p4') + ' d-surface carbon-card neon-glow-hover'}
              data-interactive
              tabIndex={0}
            >
              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap2')}>
                  <div
                    className="status-ring"
                    data-status="active"
                    style={{ width: '36px', height: '36px' }}
                  >
                    <Bot size={16} />
                  </div>
                  <div className={css('_flex _col')}>
                    <span className={css('_textsm _fontsemi')}>{agent.name}</span>
                    <span className={css('_textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                      {agent.category}
                    </span>
                  </div>
                </div>
                <span
                  className="d-annotation"
                  data-status={agent.status === 'verified' ? 'success' : agent.status === 'experimental' ? 'warning' : undefined}
                >
                  {agent.status}
                </span>
              </div>

              <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
                {agent.description}
              </p>

              <div className={css('_flex _aic _jcsb _textxs') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
                <span className={css('_flex _aic _gap1')}>
                  <Star size={12} style={{ color: 'var(--d-warning)' }} />
                  {agent.rating}
                </span>
                <span className={css('_flex _aic _gap1')}>
                  <Download size={12} />
                  {agent.downloads}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
