import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Bot, Star, Download, ArrowRight, Sparkles, Search, Package } from 'lucide-react';

interface AgentListing {
  id: string;
  name: string;
  description: string;
  category: string;
  rating: number;
  downloads: string;
  model: string;
  author: string;
  tags: string[];
}

const categories = ['All', 'Classification', 'Generation', 'Analysis', 'Orchestration', 'Security', 'Embedding'];

const listings: AgentListing[] = [
  { id: 'l1', name: 'SentimentPro', description: 'Production-grade sentiment analysis with multi-language support and confidence scoring.', category: 'Classification', rating: 4.8, downloads: '12.4k', model: 'GPT-4o', author: 'nexus-labs', tags: ['nlp', 'sentiment'] },
  { id: 'l2', name: 'CodeReviewer', description: 'Automated code review agent that detects bugs, security vulnerabilities, and style issues.', category: 'Analysis', rating: 4.6, downloads: '8.2k', model: 'Claude-3.5', author: 'devtools-co', tags: ['code', 'security'] },
  { id: 'l3', name: 'DataSynth', description: 'Generate realistic synthetic datasets for testing and model training with configurable schemas.', category: 'Generation', rating: 4.5, downloads: '5.1k', model: 'GPT-4o-mini', author: 'synthetics-ai', tags: ['data', 'testing'] },
  { id: 'l4', name: 'SwarmRouter', description: 'Intelligent task routing and load balancing across multi-agent swarms with real-time optimization.', category: 'Orchestration', rating: 4.9, downloads: '15.7k', model: 'Custom', author: 'nexus-labs', tags: ['routing', 'scaling'] },
  { id: 'l5', name: 'GuardianShield', description: 'Content moderation and safety filtering with customizable policy rules and appeal workflows.', category: 'Security', rating: 4.7, downloads: '9.8k', model: 'GPT-4o', author: 'safety-first', tags: ['moderation', 'safety'] },
  { id: 'l6', name: 'SemanticSearch', description: 'High-performance semantic search with hybrid retrieval, re-ranking, and contextual embedding.', category: 'Embedding', rating: 4.4, downloads: '11.3k', model: 'text-embed-3', author: 'search-labs', tags: ['search', 'rag'] },
  { id: 'l7', name: 'DocuForge', description: 'Automatic documentation generation from codebases with API reference, guides, and changelogs.', category: 'Generation', rating: 4.3, downloads: '3.9k', model: 'Claude-3', author: 'devtools-co', tags: ['docs', 'api'] },
  { id: 'l8', name: 'AnomalyDetector', description: 'Real-time anomaly detection for metrics, logs, and traces with configurable sensitivity.', category: 'Analysis', rating: 4.6, downloads: '7.5k', model: 'Custom', author: 'observability-io', tags: ['monitoring', 'alerts'] },
  { id: 'l9', name: 'TranslateAgent', description: 'Multi-language translation with context preservation, terminology management, and quality scoring.', category: 'Generation', rating: 4.7, downloads: '6.8k', model: 'GPT-4o', author: 'i18n-labs', tags: ['translation', 'nlp'] },
];

function AgentCard({ listing }: { listing: AgentListing }) {
  return (
    <div className={css('_flex _col _gap3 _p4') + ' d-surface carbon-glass neon-glow-hover'} data-interactive>
      <div className={css('_flex _aic _jcsb')}>
        <div className="status-ring" data-status="active" style={{ width: '40px', height: '40px' }}>
          <Bot size={18} />
        </div>
        <span className="d-annotation" data-status="info">{listing.category}</span>
      </div>

      <div className={css('_flex _col _gap1')}>
        <h3 className={css('_fontmedium') + ' mono-data'}>{listing.name}</h3>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          {listing.description}
        </p>
      </div>

      <div className={css('_flex _gap2 _wrap')}>
        {listing.tags.map(tag => (
          <span key={tag} className={css('_textxs _px2 _py1 _rounded') + ' mono-data'} style={{ background: 'var(--d-surface-raised)', color: 'var(--d-text-muted)' }}>
            {tag}
          </span>
        ))}
      </div>

      <div className={css('_flex _aic _jcsb _textxs _mt1') + ' mono-data'} style={{ color: 'var(--d-text-muted)' }}>
        <span className={css('_flex _aic _gap1')}>
          <Star size={12} style={{ color: 'var(--d-warning)' }} /> {listing.rating}
        </span>
        <span className={css('_flex _aic _gap1')}>
          <Download size={12} /> {listing.downloads}
        </span>
        <span>{listing.model}</span>
      </div>

      <Link
        to={`/agents/${listing.id}`}
        className={css('_wfull _jcc') + ' d-interactive neon-glow-hover'}
        data-variant="ghost"
        style={{ textDecoration: 'none', fontSize: '0.8125rem' }}
      >
        View Details <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export function AgentMarketplace() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = listings.filter(l => {
    const matchesCategory = activeCategory === 'All' || l.category === activeCategory;
    const matchesSearch = !searchQuery || l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Hero — no card wrapper per guidance */}
      <section className="d-section">
        <div className={css('_flex _col _aic _textc _gap3')} style={{ maxWidth: '640px', margin: '0 auto' }}>
          <span className="d-annotation" data-status="info" style={{ background: 'rgba(0, 212, 255, 0.1)', border: '1px solid rgba(0, 212, 255, 0.2)', color: 'var(--d-accent)' }}>
            <Sparkles size={12} /> Agent Marketplace
          </span>
          <h1 className={css('_text2xl _fontsemi') + ' mono-data neon-text-glow'}>
            Discover & Deploy AI Agents
          </h1>
          <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', lineHeight: 1.7 }}>
            Browse production-ready agents built by the community. One-click deploy into your swarm.
          </p>
          <div className={css('_flex _gap3')}>
            <Link to="/agents" className="d-interactive neon-glow-hover" data-variant="primary" style={{ textDecoration: 'none' }}>
              Browse Agents
            </Link>
            <button className="d-interactive" data-variant="ghost">
              Submit Agent
            </button>
          </div>
        </div>
      </section>

      {/* Search + filters */}
      <div className={css('_flex _col _gap3')}>
        <div className={css('_flex _aic _gap3')}>
          <div className={css('_rel _flex1')}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--d-text-muted)' }} />
            <input
              className="d-control carbon-input"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem' }}
            />
          </div>
        </div>

        <div className={css('_flex _gap2 _wrap')}>
          {categories.map(cat => (
            <button
              key={cat}
              className="d-interactive"
              data-variant={activeCategory === cat ? 'primary' : 'ghost'}
              onClick={() => setActiveCategory(cat)}
              style={{ fontSize: '0.8125rem' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Agent grid */}
      {filtered.length === 0 ? (
        <div className={css('_flex _col _aic _jcc _py8')} style={{ color: 'var(--d-text-muted)' }}>
          <Package size={48} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
          <p className={css('_textsm')}>No agents match your search.</p>
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          className={css('_grid _gap4')}
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
        >
          {filtered.map(listing => <AgentCard key={listing.id} listing={listing} />)}
        </div>
      )}
    </div>
  );
}
