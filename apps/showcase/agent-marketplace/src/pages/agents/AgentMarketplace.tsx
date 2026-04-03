import { useState, useRef } from 'react';
import { css } from '@decantr/css';
import { PackageOpen, Rocket, Search, X } from 'lucide-react';

/* ── Mock Data ── */

type Category = 'All' | 'Data Processing' | 'Communication' | 'Analysis' | 'Automation';

interface MarketplaceAgent {
  id: string;
  name: string;
  description: string;
  category: Exclude<Category, 'All'>;
  gradient: string;
}

const FILTER_TABS: Category[] = ['All', 'Data Processing', 'Communication', 'Analysis', 'Automation'];

const AGENTS: MarketplaceAgent[] = [
  { id: 'mkt-001', name: 'DataPipe Pro', description: 'High-throughput ETL agent for real-time data ingestion, transformation, and warehouse loading.', category: 'Data Processing', gradient: 'linear-gradient(135deg, #0d9488, #065f46)' },
  { id: 'mkt-002', name: 'SlackSync', description: 'Bi-directional Slack integration agent for automated notifications and thread summarization.', category: 'Communication', gradient: 'linear-gradient(135deg, #7c3aed, #4338ca)' },
  { id: 'mkt-003', name: 'InsightMiner', description: 'Deep analytics agent that discovers patterns and generates natural language insights from datasets.', category: 'Analysis', gradient: 'linear-gradient(135deg, #ea580c, #b91c1c)' },
  { id: 'mkt-004', name: 'FlowAutomator', description: 'Workflow orchestration agent for chaining multi-step processes with conditional branching.', category: 'Automation', gradient: 'linear-gradient(135deg, #0284c7, #1d4ed8)' },
  { id: 'mkt-005', name: 'StreamNorm', description: 'Schema normalization agent that validates and transforms streaming data against defined contracts.', category: 'Data Processing', gradient: 'linear-gradient(135deg, #059669, #047857)' },
  { id: 'mkt-006', name: 'MailRelay', description: 'Email triage and routing agent with priority classification and auto-response drafting.', category: 'Communication', gradient: 'linear-gradient(135deg, #d946ef, #9333ea)' },
  { id: 'mkt-007', name: 'AnomalyWatch', description: 'Statistical anomaly detection agent with configurable sensitivity thresholds and alert routing.', category: 'Analysis', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'mkt-008', name: 'CronAgent', description: 'Time-based task scheduler agent with cron expression support and failure recovery logic.', category: 'Automation', gradient: 'linear-gradient(135deg, #64748b, #334155)' },
];

/* ── Component ── */

export function AgentMarketplace() {
  const [activeFilter, setActiveFilter] = useState<Category>('All');
  const gridRef = useRef<HTMLDivElement>(null);

  const filtered = activeFilter === 'All'
    ? AGENTS
    : AGENTS.filter(a => a.category === activeFilter);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className={css('_flex _col _gap6')}>
      {/* ── Hero Section ── */}
      <div
        className="d-section"
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
        }}
      >
        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--d-text)',
            margin: '0 0 0.5rem',
          }}
        >
          Agent Marketplace
        </h1>
        <p
          style={{
            fontSize: '0.9375rem',
            color: 'var(--d-text-muted)',
            margin: '0 0 1.5rem',
            maxWidth: 480,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Browse and deploy pre-built autonomous agents
        </p>
        <button
          className="d-interactive neon-glow"
          data-variant="primary"
          onClick={scrollToGrid}
        >
          <Search size={16} />
          Browse Catalog
        </button>
      </div>

      {/* ── Filter Tabs + Grid ── */}
      <div ref={gridRef} className={css('_flex _col _gap4')}>
        {/* Filter row */}
        <div className={css('_flex _wrap _gap2')}>
          {FILTER_TABS.map(tab => {
            const isActive = tab === activeFilter;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className="d-interactive"
                data-variant={isActive ? 'primary' : 'ghost'}
                style={{ fontSize: 13 }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Card grid or empty state */}
        {filtered.length > 0 ? (
          <div
            className={css('_grid _gap4')}
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {filtered.map(agent => (
              <div
                key={agent.id}
                className={css('_flex _col') + ' d-surface carbon-card'}
                style={{ overflow: 'hidden' }}
              >
                {/* Thumbnail gradient */}
                <div
                  style={{
                    height: 120,
                    background: agent.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PackageOpen size={32} style={{ color: 'rgba(255,255,255,0.5)' }} />
                </div>

                {/* Content */}
                <div className={css('_flex _col _gap2')} style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--d-text)' }}>
                    {agent.name}
                  </span>
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--d-text-muted)',
                      margin: 0,
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {agent.description}
                  </p>
                  <div className={css('_flex _aic _jcsb')} style={{ marginTop: '0.25rem' }}>
                    <span className="d-annotation">{agent.category}</span>
                    <button
                      className="d-interactive neon-glow-hover"
                      style={{ fontSize: 12, padding: '0.25rem 0.625rem' }}
                    >
                      <Rocket size={12} />
                      Deploy
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty state */
          <div
            className={css('_flex _col _aic _jcc')}
            style={{ padding: '4rem 1rem', textAlign: 'center' }}
          >
            <PackageOpen size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.4, marginBottom: '1rem' }} />
            <p style={{ color: 'var(--d-text-muted)', fontSize: 14, margin: '0 0 1rem' }}>
              No agents found for "{activeFilter}"
            </p>
            <button
              className="d-interactive"
              data-variant="ghost"
              onClick={() => setActiveFilter('All')}
            >
              <X size={14} />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
