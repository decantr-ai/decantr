import { useState } from 'react';
import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import {
  Bot,
  ArrowRight,
  Search,
  Inbox,
  Cpu,
  Tag,
} from 'lucide-react';
import { marketplaceAgents } from '../../data';
import type { Agent } from '../../data';
import { StatusRing } from '../../components/StatusRing';
import { SectionLabel } from '../../components/SectionLabel';
import { EmptyState } from '../../components/EmptyState';

/**
 * Marketplace page — hero (standard) + generative-card-grid.
 * Per layout_hints for hero: NO d-surface card wrapping visual proof.
 * Per layout_hints for generative-card-grid: tabs must ACTUALLY filter content.
 */

const categories = ['all', 'monitoring', 'generation', 'analysis', 'security', 'orchestration'];

export function AgentMarketplacePage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = marketplaceAgents.filter((agent) => {
    const matchesCategory = activeCategory === 'all' || agent.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Hero — no card, ambient style */}
      <div className="d-section" data-density="compact">
        <div className={css('_flex _col _gap3 _mb6')}>
          <span className={css('_textsm _fgaccent') + ' mono-data neon-text-glow'}>
            Marketplace
          </span>
          <h1 className={css('_text2xl _fontsemi')}>
            Discover & deploy agents
          </h1>
          <p className={css('_textsm _fgmuted')} style={{ maxWidth: '36rem', lineHeight: 1.6 }}>
            Browse pre-built agents for monitoring, code generation, security scanning, and more.
            Deploy to your swarm in one click.
          </p>
        </div>

        {/* Search bar */}
        <div className={css('_flex _aic _gap3 _mb4')} style={{ maxWidth: '28rem' }}>
          <div className={css('_rel _flex1')}>
            <Search
              size={16}
              className={css('_abs')}
              style={{
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--d-text-muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="d-control carbon-input"
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>
      </div>

      {/* Category tabs — filtering must work */}
      <div className="d-section" data-density="compact">
        <SectionLabel>Agent Catalog</SectionLabel>
        <div className={css('_flex _wrap _gap2 _mb4')}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={
                css('_textsm _pointer _trans') +
                ' d-interactive neon-glow-hover' +
                (activeCategory === cat ? ' neon-border-glow' : '')
              }
              data-variant={activeCategory === cat ? undefined : 'ghost'}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: '0.25rem 0.75rem',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Agent grid */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            message={`No agents found${searchQuery ? ` matching "${searchQuery}"` : ''} in the "${activeCategory}" category.`}
            action={{ label: 'Clear Filters', onClick: () => { setActiveCategory('all'); setSearchQuery(''); } }}
          />
        ) : (
          <div className={css('_grid _gc1 _md:gc2 _lg:gc3 _gap4')}>
            {filtered.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      to={`/agents/${agent.id}`}
      className={css('_flex _col _gap3 _p4') + ' d-surface carbon-card neon-glow-hover'}
      data-interactive=""
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div className={css('_flex _aic _gap3')}>
        <StatusRing status={agent.status} size={40}>
          <Bot size={16} style={{ color: agent.status === 'active' ? 'var(--d-success)' : 'var(--d-text-muted)' }} />
        </StatusRing>
        <div className={css('_flex _col _flex1 _minw0')}>
          <span className={css('_fontsemi _truncate')}>{agent.name}</span>
          <span className={css('_textxs _fgmuted') + ' mono-data'}>{agent.type} &middot; {agent.model}</span>
        </div>
        <span
          className="d-annotation"
          data-status={agent.status === 'active' ? 'success' : agent.status === 'error' ? 'error' : agent.status === 'warning' ? 'warning' : undefined}
        >
          {agent.status}
        </span>
      </div>

      <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.5 }}>
        {agent.description}
      </p>

      <div className={css('_flex _aic _jcsb')}>
        <div className={css('_flex _wrap _gap1')}>
          {agent.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={css('_textxs _flex _aic _gap1') + ' d-annotation'}>
              <Tag size={8} /> {tag}
            </span>
          ))}
        </div>
        <div className={css('_flex _aic _gap1 _textxs _fgmuted') + ' mono-data'}>
          <Cpu size={10} /> {Math.round(agent.confidence * 100)}%
        </div>
      </div>

      <div className={css('_flex _aic _gap2 _textsm _fgaccent')}>
        Deploy <ArrowRight size={14} />
      </div>
    </Link>
  );
}
