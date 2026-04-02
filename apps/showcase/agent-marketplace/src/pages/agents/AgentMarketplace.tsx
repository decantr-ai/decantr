import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import {
  Search, Filter, Star, Download, ArrowRight,
  Bot, Brain, Shield, BarChart3, Workflow, Database,
  Eye, Zap,
} from 'lucide-react';
import { useState } from 'react';

const categories = ['All', 'Monitor', 'ETL', 'Classifier', 'Orchestrator', 'Security', 'Inference'];

const marketplaceAgents = [
  { id: 'sentinel-pro', name: 'Sentinel Pro', author: '@coreai', category: 'Monitor', stars: 2847, downloads: '12.4k', icon: Eye, description: 'Enterprise-grade anomaly detection with sub-second alerting. Monitors API latency, error rates, and resource utilization.', tags: ['monitoring', 'alerting', 'anomaly'], verified: true, price: 'Free' },
  { id: 'neural-router', name: 'Neural Router', author: '@swarmtech', category: 'Orchestrator', stars: 1923, downloads: '8.1k', icon: Workflow, description: 'Intelligent task routing using reinforcement learning. Dynamically distributes workloads across agent clusters.', tags: ['routing', 'RL', 'load-balancing'], verified: true, price: '$29/mo' },
  { id: 'dataweave', name: 'DataWeave', author: '@pipelineai', category: 'ETL', stars: 3421, downloads: '19.7k', icon: Database, description: 'Schema-aware ETL agent with automatic type inference and validation. Handles JSON, CSV, Parquet, and streaming data.', tags: ['etl', 'streaming', 'schema'], verified: true, price: 'Free' },
  { id: 'guardian-shield', name: 'Guardian Shield', author: '@secureai', category: 'Security', stars: 1547, downloads: '6.2k', icon: Shield, description: 'Real-time threat detection and response. Monitors agent communications for prompt injection and data exfiltration.', tags: ['security', 'threat-detection', 'audit'], verified: false, price: '$49/mo' },
  { id: 'deep-classifier', name: 'Deep Classifier', author: '@mlops', category: 'Classifier', stars: 4102, downloads: '24.8k', icon: Brain, description: 'Multi-modal classification agent supporting text, image, and structured data. Fine-tunable with zero-shot capability.', tags: ['classification', 'multi-modal', 'fine-tune'], verified: true, price: 'Free' },
  { id: 'insight-engine', name: 'Insight Engine', author: '@analytics', category: 'Inference', stars: 892, downloads: '3.4k', icon: BarChart3, description: 'Statistical inference agent for time-series forecasting, causal analysis, and automated hypothesis testing.', tags: ['inference', 'forecasting', 'statistics'], verified: false, price: '$19/mo' },
  { id: 'swarm-coordinator', name: 'Swarm Coordinator', author: '@coreai', category: 'Orchestrator', stars: 2156, downloads: '11.2k', icon: Bot, description: 'Multi-agent coordination protocol with consensus mechanisms. Enables collaborative problem-solving across heterogeneous agents.', tags: ['orchestration', 'consensus', 'multi-agent'], verified: true, price: '$39/mo' },
  { id: 'fast-parser', name: 'Fast Parser', author: '@pipelineai', category: 'ETL', stars: 1789, downloads: '9.3k', icon: Zap, description: 'High-throughput log parsing with automatic format detection. Handles 100k+ events/second with structured output.', tags: ['parsing', 'logs', 'high-throughput'], verified: true, price: 'Free' },
];

export function AgentMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = marketplaceAgents.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={css('_flex _col _gap6') + ' fade-in'}>
      {/* Marketplace hero */}
      <div className={css('_flex _col _aic _textc _py8 _gap4') + ' neon-glow carbon-card'} style={{ background: 'linear-gradient(180deg, color-mix(in srgb, var(--d-primary) 8%, var(--d-bg)), var(--d-surface))' }}>
        <h1 className={'font-mono neon-text-glow ' + css('_text3xl _fontbold')}>
          Agent Marketplace
        </h1>
        <p className={'font-mono ' + css('_textlg _fgmuted')} style={{ maxWidth: 480 }}>
          Discover, deploy, and orchestrate autonomous agents for your swarm.
        </p>
        <div className={css('_flex _gap3 _mt2')}>
          <Link to="/agents" className="btn btn-primary">
            <Bot size={16} /> Browse Catalog
          </Link>
          <a href="#" className="btn btn-secondary">
            Publish Agent <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Search + filters */}
      <div className={css('_flex _aic _gap3')}>
        <div className={css('_flex _aic _gap2 _flex1 _rel')}>
          <Search size={16} style={{ position: 'absolute', left: 12, color: 'var(--d-text-muted)' }} />
          <input
            type="text"
            className="carbon-input font-mono"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 36 }}
          />
        </div>
        <button className="btn btn-secondary btn-sm">
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Category tabs */}
      <div className={css('_flex _gap2 _wrap')}>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            className={
              'btn btn-sm font-mono ' +
              (activeCategory === cat ? 'btn-primary' : 'btn-ghost')
            }
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent card grid */}
      <div className={css('_grid _gc1 _lg:gc2 _gap4')}>
        {filtered.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id} className={css('_flex _col _gap3 _p5') + ' carbon-card hover-lift'}>
              <div className={css('_flex _aic _jcsb')}>
                <div className={css('_flex _aic _gap3')}>
                  <div
                    className={css('_flex _aic _jcc _rounded')}
                    style={{
                      width: 40, height: 40,
                      background: 'color-mix(in srgb, var(--d-primary) 15%, transparent)',
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--d-primary)' }} />
                  </div>
                  <div>
                    <div className={css('_flex _aic _gap2')}>
                      <span className={'font-mono ' + css('_fontsemi')}>{agent.name}</span>
                      {agent.verified && (
                        <span className="badge badge-success">verified</span>
                      )}
                    </div>
                    <span className={'font-mono ' + css('_textxs _fgmuted')}>{agent.author}</span>
                  </div>
                </div>
                <span className={'font-mono ' + css('_textsm _fontbold')} style={{
                  color: agent.price === 'Free' ? 'var(--d-success)' : 'var(--d-text)',
                }}>
                  {agent.price}
                </span>
              </div>

              <p className={'font-mono ' + css('_textsm _fgmuted')} style={{ lineHeight: '1.5' }}>
                {agent.description}
              </p>

              <div className={css('_flex _wrap _gap2')}>
                {agent.tags.map((tag) => (
                  <span key={tag} className="badge badge-muted">{tag}</span>
                ))}
              </div>

              <div className={css('_flex _aic _jcsb _mt1')}>
                <div className={css('_flex _aic _gap3')}>
                  <span className={css('_flex _aic _gap1 _textxs _fgmuted') + ' font-mono'}>
                    <Star size={12} /> {agent.stars.toLocaleString()}
                  </span>
                  <span className={css('_flex _aic _gap1 _textxs _fgmuted') + ' font-mono'}>
                    <Download size={12} /> {agent.downloads}
                  </span>
                </div>
                <button className="btn btn-primary btn-sm">Deploy</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
