import { useState, useEffect, useCallback } from 'react';
import { css } from '@decantr/css';
import {
  Rocket,
  Heart,
  Eye,
  Copy,
  Trash2,
  Search,
} from 'lucide-react';

interface AgentTemplate {
  id: string;
  name: string;
  category: string;
  model: string;
  genTime: string;
  description: string;
}

const AGENT_TEMPLATES: AgentTemplate[] = [
  { id: 'tpl-1', name: 'Document Analyzer', category: 'NLP', model: 'gpt-4-turbo', genTime: '2.3s', description: 'Extracts structured data from unstructured documents' },
  { id: 'tpl-2', name: 'Code Reviewer', category: 'Code', model: 'claude-3-opus', genTime: '1.8s', description: 'Automated code review with security analysis' },
  { id: 'tpl-3', name: 'Image Classifier', category: 'Vision', model: 'gpt-4-vision', genTime: '3.1s', description: 'Multi-label image classification and tagging' },
  { id: 'tpl-4', name: 'Data Pipeline', category: 'Data', model: 'claude-3-sonnet', genTime: '1.5s', description: 'ETL pipeline orchestration with schema validation' },
  { id: 'tpl-5', name: 'Threat Detector', category: 'Security', model: 'gpt-4-turbo', genTime: '2.7s', description: 'Real-time threat detection and anomaly scoring' },
  { id: 'tpl-6', name: 'Chat Assistant', category: 'General', model: 'claude-3-haiku', genTime: '0.9s', description: 'Conversational assistant with context management' },
  { id: 'tpl-7', name: 'Sentiment Analyzer', category: 'NLP', model: 'claude-3-sonnet', genTime: '1.2s', description: 'Multi-language sentiment analysis with aspect detection' },
  { id: 'tpl-8', name: 'Object Detector', category: 'Vision', model: 'gpt-4-vision', genTime: '3.8s', description: 'Real-time object detection with bounding boxes' },
  { id: 'tpl-9', name: 'SQL Generator', category: 'Code', model: 'gpt-4-turbo', genTime: '1.4s', description: 'Natural language to SQL query conversion' },
  { id: 'tpl-10', name: 'Anomaly Scanner', category: 'Data', model: 'claude-3-opus', genTime: '2.1s', description: 'Statistical anomaly detection across time-series data' },
  { id: 'tpl-11', name: 'Compliance Auditor', category: 'Security', model: 'claude-3-opus', genTime: '3.4s', description: 'Automated compliance checking against regulatory frameworks' },
  { id: 'tpl-12', name: 'Task Planner', category: 'General', model: 'gpt-4-turbo', genTime: '1.6s', description: 'Autonomous task decomposition and execution planning' },
];

const CATEGORY_GRADIENTS: Record<string, string> = {
  NLP: 'linear-gradient(135deg, #00D4FF22, #7C93B044)',
  Code: 'linear-gradient(135deg, #A78BFA22, #7C93B044)',
  Vision: 'linear-gradient(135deg, #00D4FF22, #A78BFA44)',
  Data: 'linear-gradient(135deg, #22D3EE22, #06B6D444)',
  Security: 'linear-gradient(135deg, #EF444422, #F9731644)',
  General: 'linear-gradient(135deg, #3F3F4622, #71717A44)',
};

const ACTION_BUTTONS = [
  { icon: Rocket, label: 'Deploy' },
  { icon: Heart, label: 'Favorite' },
  { icon: Eye, label: 'Inspect' },
  { icon: Copy, label: 'Copy' },
  { icon: Trash2, label: 'Delete' },
] as const;

export function GenerativeCardGrid() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [loadedCards, setLoadedCards] = useState<Set<string>>(new Set());

  const categories = ['All', ...Array.from(new Set(AGENT_TEMPLATES.map((t) => t.category)))];

  const filtered =
    activeFilter === 'All'
      ? AGENT_TEMPLATES
      : AGENT_TEMPLATES.filter((t) => t.category === activeFilter);

  // Shimmer effect: mark cards as loaded after 1s
  const markLoaded = useCallback((id: string) => {
    const timer = setTimeout(() => {
      setLoadedCards((prev) => new Set(prev).add(id));
    }, 1000);
    return timer;
  }, []);

  useEffect(() => {
    const timers = filtered.map((t) => markLoaded(t.id));
    return () => timers.forEach(clearTimeout);
  }, [activeFilter, filtered, markLoaded]);

  return (
    <div className={css('_flex _col _gap6')} role="feed" aria-label="Agent marketplace grid">
      {/* Filter tabs */}
      <div className={css('_flex _row _gap2 _wrap')}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={css('_px3 _py1 _textsm') + ' d-interactive'}
            data-variant={activeFilter === cat ? 'primary' : 'ghost'}
            onClick={() => {
              setActiveFilter(cat);
              setLoadedCards(new Set());
            }}
            aria-pressed={activeFilter === cat}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="card-grid">
          {filtered.map((template, index) => (
            <div
              key={template.id}
              className={css('_flex _col _rel _overhidden') + ' d-surface carbon-card card-hover-lift stagger-fade-up'}
              style={{
                animationDelay: `${index * 50}ms`,
                padding: 0,
              }}
              tabIndex={0}
              aria-label={`${template.name} — ${template.description}`}
            >
              {/* Preview area */}
              <div
                className={!loadedCards.has(template.id) ? 'shimmer-loading' : ''}
                style={{
                  height: 140,
                  background: loadedCards.has(template.id)
                    ? CATEGORY_GRADIENTS[template.category] || CATEGORY_GRADIENTS.General
                    : undefined,
                  borderBottom: '1px solid var(--d-border)',
                }}
              />

              {/* Generation badge */}
              <span
                className={css('_abs') + ' d-annotation'}
                style={{ top: 8, right: 8, fontSize: '0.65rem' }}
              >
                {template.model} &middot; {template.genTime}
              </span>

              {/* Content */}
              <div className={css('_flex _col _gap1 _p4')}>
                <span className={css('_fontbold _textsm') + ' mono-data'}>
                  {template.name}
                </span>
                <span
                  className={css('_textsm')}
                  style={{
                    color: 'var(--d-text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {template.description}
                </span>
              </div>

              {/* Action bar */}
              <div
                className={css('_flex _row _gap1 _px4 _pb3 _jcse') + ' card-action-bar'}
              >
                {ACTION_BUTTONS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className={css('_p1') + ' d-interactive'}
                    data-variant="ghost"
                    aria-label={label}
                    style={{ border: 'none', minWidth: 0 }}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className={css('_flex _col _aic _jcc _gap3 _py16')}>
          <Search size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
          <span style={{ color: 'var(--d-text-muted)' }}>No agents found</span>
          <button
            className={css('_px4 _py2 _textsm') + ' d-interactive'}
            data-variant="ghost"
            onClick={() => {
              setActiveFilter('All');
              setLoadedCards(new Set());
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
