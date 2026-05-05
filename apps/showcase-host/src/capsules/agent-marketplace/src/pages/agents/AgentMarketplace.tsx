import { useMemo, useState } from 'react';
import { Download, Search, Star } from 'lucide-react';
import { css } from '@decantr/css';
import { PageHeader, SectionHeader } from '../../components/PageHeader';
import { marketplaceAgents, marketplaceCategories } from '../../data/mock';

export function AgentMarketplace() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<(typeof marketplaceCategories)[number]>('All');

  const filteredAgents = useMemo(
    () => marketplaceAgents.filter((agent) => {
      const query = `${agent.name} ${agent.description} ${agent.prompt}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || agent.category === activeCategory;
      return matchesSearch && matchesCategory;
    }),
    [activeCategory, search],
  );

  return (
    <div className="page-stack">
      <PageHeader
        label="Marketplace"
        title="Discover deployable agent templates"
        description="The marketplace route stays hero-first and catalog-forward. Search, filter, then drop directly into a template that already reflects the product voice."
      />

      <div className="marketplace-toolbar carbon-fade-slide">
        <SectionHeader
          label="Marketplace hero"
          title="Search by workflow shape, not by generic asset tag"
          description="Every card leads with the promptable workflow and keeps supporting stats secondary."
        />
        <div className="marketplace-search">
          <div className="search-field">
            <Search size={16} />
            <input
              className="d-control carbon-input"
              placeholder="Search templates, prompts, or capability language"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search marketplace templates"
            />
          </div>
          <button type="button" className="d-interactive" data-variant="primary">
            Search
          </button>
        </div>
        <div className="chip-filter-row">
          {marketplaceCategories.map((category) => (
            <button
              key={category}
              type="button"
              className="chip-filter"
              data-active={activeCategory === category}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="d-surface carbon-card empty-state">
          <Search size={42} />
          <strong>No templates match the current query.</strong>
          <p className="empty-state__message">Clear the filters and start with the full marketplace set.</p>
          <button type="button" className="d-interactive" data-variant="ghost" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="agent-catalog-grid">
          {filteredAgents.map((agent) => {
            const Icon = agent.icon;
            return (
              <article key={agent.id} className="d-surface carbon-card catalog-card carbon-fade-slide">
                <div className="catalog-card__preview">
                  <div className="catalog-card__meta">
                    <span className="d-annotation" data-status="info">{agent.category}</span>
                    {agent.badge ? <span className="d-annotation" data-status="success">{agent.badge}</span> : null}
                  </div>
                  <p className={css('_textsm _fgmuted')}>
                    {agent.prompt}
                  </p>
                </div>

                <div className="catalog-card__body">
                  <div className="catalog-card__identity">
                    <span className="catalog-card__icon">
                      <Icon size={17} />
                    </span>
                    <div className={css('_flex _col _gap1')}>
                      <strong>{agent.name}</strong>
                      <span className="mono-kicker">@{agent.author}</span>
                    </div>
                  </div>
                  <p className="catalog-card__description">{agent.description}</p>
                </div>

                <div className="catalog-card__footer">
                  <div className="catalog-card__stats">
                    <span><Star size={12} /> {agent.rating}</span>
                    <span><Download size={12} /> {agent.installs}</span>
                  </div>
                  <button type="button" className="d-interactive" data-variant="primary" aria-label={`Deploy ${agent.name}`}>
                    Deploy
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
