import { useState } from 'react';
import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Search, Rocket } from 'lucide-react';
import { Button, Card, Input, Avatar, Badge } from '@/components';

const agents = [
  { id: 'code-reviewer', name: 'Code Reviewer', category: 'Code', status: 'online' as const, rating: '4.9', deploys: '12.4k', uptime: '99.8%', desc: 'Reviews pull requests for bugs, security issues, and style violations. Supports 20+ languages.', color: '#6366f1' },
  { id: 'data-analyst', name: 'Data Analyst', category: 'Data', status: 'online' as const, rating: '4.8', deploys: '8.2k', uptime: '99.5%', desc: 'Analyzes datasets, generates visualizations, and produces insights reports from structured data.', color: '#06b6d4' },
  { id: 'content-writer', name: 'Content Writer', category: 'Writing', status: 'busy' as const, rating: '4.7', deploys: '15.1k', uptime: '99.2%', desc: 'Creates blog posts, documentation, and marketing copy tuned to your brand voice.', color: '#f59e0b' },
  { id: 'devops-pilot', name: 'DevOps Pilot', category: 'DevOps', status: 'offline' as const, rating: '4.6', deploys: '5.7k', uptime: '98.9%', desc: 'Manages CI/CD pipelines, monitors infrastructure, and auto-remediates common incidents.', color: '#ef4444' },
  { id: 'security-scanner', name: 'Security Scanner', category: 'Security', status: 'online' as const, rating: '4.9', deploys: '9.8k', uptime: '99.9%', desc: 'Scans codebases for vulnerabilities, checks dependencies, and generates compliance reports.', color: '#10b981' },
  { id: 'api-architect', name: 'API Architect', category: 'Code', status: 'online' as const, rating: '4.8', deploys: '6.3k', uptime: '99.4%', desc: 'Designs RESTful and GraphQL APIs from natural language specs. Generates OpenAPI schemas.', color: '#8b5cf6' },
];

const categories = ['All', 'Code', 'Data', 'Writing', 'DevOps', 'Security'];

export function NewChatPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = agents.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.desc.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={css('_flex _col _flex1 _p6') + ' carbon-fade-slide'}>
      {/* Header */}
      <div className={css('_mb6')}>
        <h1 className={css('_heading3 _fontbold')}>Agent Marketplace</h1>
        <p className={css('_textsm _fgmuted _mt1')}>
          Browse and deploy production-ready AI agents
        </p>
      </div>

      {/* Search */}
      <div className={css('_mb4')}>
        <div className={css('_flex _aic _gap3 _p3 _rounded') + ' carbon-card'}>
          <Search size={18} style={{ color: 'var(--d-muted)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search agents by name, capability, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={css('_flex1 _textbase')}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--d-text)',
            }}
          />
        </div>
      </div>

      {/* Filter row */}
      <div className={css('_flex _row _aic _gap2 _mb6')} style={{ flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={css('_px3 _py1 _textsm _fontsemi _rounded _trans _pointer _selectnone')}
            style={{
              background:
                activeCategory === cat
                  ? 'var(--d-primary)'
                  : 'color-mix(in srgb, var(--d-muted) 15%, var(--d-surface))',
              color: activeCategory === cat ? 'var(--d-on-primary, #fff)' : 'var(--d-muted)',
              border: 'none',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Agent grid */}
      <div className={css('_grid _gc1 _sm:gc2 _lg:gc3 _gap4')}>
        {filtered.map((agent) => (
          <Card key={agent.id} hover>
            <div className={css('_flex _col _gap3')}>
              {/* Top row */}
              <div className={css('_flex _row _aic _gap3')}>
                <div
                  className={css('_flex _aic _jcc _roundedfull _shrink0 _fontsemi')}
                  style={{
                    width: 40,
                    height: 40,
                    background: agent.color,
                    color: '#fff',
                    fontSize: 14,
                  }}
                >
                  {agent.name.charAt(0)}
                </div>
                <div className={css('_flex _col _flex1 _minh0')}>
                  <div className={css('_flex _row _aic _gap2')}>
                    <span className={css('_fontsemi _truncate')}>{agent.name}</span>
                    <span className={`status-pulse status-pulse-${agent.status}`} />
                  </div>
                </div>
                <Badge>{agent.category}</Badge>
              </div>

              {/* Description */}
              <p className={css('_textsm _fgmuted')} style={{ lineHeight: 1.5 }}>
                {agent.desc}
              </p>

              {/* Stats row */}
              <div className={css('_flex _row _gap4')}>
                <span className={css('_textxs _fgmuted') + ' metric-value'}>{agent.rating} rating</span>
                <span className={css('_textxs _fgmuted') + ' metric-value'}>{agent.deploys} deploys</span>
                <span className={css('_textxs _fgmuted') + ' metric-value'}>{agent.uptime} uptime</span>
              </div>

              {/* Actions */}
              <div className={css('_flex _row _gap2')}>
                <Button size="sm" variant="primary">
                  <Rocket size={14} />
                  Deploy
                </Button>
                <Link to={`/chat/${agent.id}`}>
                  <Button size="sm" variant="secondary">
                    Details
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
