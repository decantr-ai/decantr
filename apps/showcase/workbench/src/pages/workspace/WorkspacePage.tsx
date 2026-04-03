import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Box, Layers, Component as ComponentIcon, Layout,
  Circle,
} from 'lucide-react';
import { components } from '@/data/mock';
import type { ComponentItem } from '@/data/mock';

const categories = [
  { id: 'primitives', label: 'Primitives', icon: Box },
  { id: 'composites', label: 'Composites', icon: Layers },
  { id: 'patterns', label: 'Patterns', icon: ComponentIcon },
  { id: 'layouts', label: 'Layouts', icon: Layout },
] as const;

const statusColor: Record<string, string> = {
  stable: 'var(--d-success)',
  beta: 'var(--d-warning)',
  experimental: 'var(--d-info)',
  deprecated: 'var(--d-error)',
};

export function WorkspacePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(components[0]?.id ?? null);

  const filtered = activeCategory
    ? components.filter(c => c.category === activeCategory)
    : components;

  const selected = components.find(c => c.id === selectedId) ?? components[0];

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>
      {/* Left pane — component tree */}
      <div style={{ width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--d-border)', marginRight: 0, marginLeft: '-1.5rem', marginTop: '-1.5rem', marginBottom: '-1.5rem' }}>
        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            COMPONENT TREE
          </span>
        </div>
        {/* Category filters */}
        <div style={{ display: 'flex', gap: '2px', padding: '0.5rem', borderBottom: '1px solid var(--d-border)' }}>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                className="wb-tab"
                data-active={isActive ? 'true' : undefined}
                title={cat.label}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
              >
                <Icon size={12} />
              </button>
            );
          })}
        </div>
        {/* Tree items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.25rem' }}>
          {filtered.map(item => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className="wb-tree-item"
              data-active={selectedId === item.id ? 'true' : undefined}
              style={{ width: '100%', border: 'none', background: selectedId === item.id ? undefined : 'transparent', textAlign: 'left' }}
            >
              <Circle size={6} style={{ color: statusColor[item.status], flexShrink: 0 }} />
              <span className="mono-data" style={{ fontSize: '0.8125rem', flex: 1 }}>{item.name}</span>
              <span style={{ fontSize: '0.625rem', color: 'var(--d-text-muted)' }}>{item.version}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Center pane — live preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{selected?.name ?? 'Select a component'}</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              {selected?.description}
            </p>
          </div>
          {selected && (
            <Link
              to={`/workspace/${selected.id}`}
              className="d-interactive"
              data-variant="ghost"
              style={{ fontSize: '0.8125rem', textDecoration: 'none', border: 'none', gap: '0.25rem', padding: '0.375rem 0.75rem' }}
            >
              Inspect <ChevronRight size={14} />
            </Link>
          )}
        </div>

        {/* Preview area */}
        {selected && (
          <div className="d-terminal-chrome" style={{ flex: 1, minHeight: 0 }}>
            <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
              <PreviewDemo component={selected} />
            </div>
          </div>
        )}

        {/* Stats bar */}
        {selected && (
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--d-border)' }}>
            <StatItem label="PROPS" value={String(selected.props)} />
            <StatItem label="VARIANTS" value={String(selected.variants)} />
            <StatItem label="VERSION" value={selected.version} />
            <StatItem label="STATUS" value={selected.status} statusColor={statusColor[selected.status]} />
            <StatItem label="UPDATED" value={selected.updatedAt} />
          </div>
        )}
      </div>

      {/* Right pane — quick props */}
      <div style={{ width: 240, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '1px solid var(--d-border)', marginRight: '-1.5rem', marginTop: '-1.5rem', marginBottom: '-1.5rem' }}>
        <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--d-border)' }}>
          <span className="d-label" style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}>
            QUICK PROPS
          </span>
        </div>
        {selected && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0.75rem' }}>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>category</span>
              <span className="mono-data" style={{ fontSize: '0.75rem' }}>{selected.category}</span>
            </div>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>id</span>
              <span className="mono-data" style={{ fontSize: '0.75rem' }}>{selected.id}</span>
            </div>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>props</span>
              <span className="mono-data" style={{ fontSize: '0.75rem' }}>{selected.props}</span>
            </div>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>variants</span>
              <span className="mono-data" style={{ fontSize: '0.75rem' }}>{selected.variants}</span>
            </div>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>version</span>
              <span className="mono-data" style={{ fontSize: '0.75rem' }}>{selected.version}</span>
            </div>
            <div className="wb-prop-row">
              <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>status</span>
              <span className="d-annotation" data-status={selected.status === 'stable' ? 'success' : selected.status === 'beta' ? 'warning' : selected.status === 'experimental' ? 'info' : 'error'} style={{ fontSize: '0.625rem' }}>
                {selected.status}
              </span>
            </div>

            {/* JSON preview */}
            <div style={{ marginTop: '1rem' }}>
              <span className="d-label" style={{ display: 'block', marginBottom: '0.5rem' }}>JSON</span>
              <div className="wb-code-block" style={{ fontSize: '0.6875rem', lineHeight: 1.5, maxHeight: 200, overflowY: 'auto' }}>
{`{
  "name": "${selected.name}",
  "id": "${selected.id}",
  "category": "${selected.category}",
  "status": "${selected.status}",
  "version": "${selected.version}",
  "props": ${selected.props},
  "variants": ${selected.variants}
}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value, statusColor: sc }: { label: string; value: string; statusColor?: string }) {
  return (
    <div>
      <div className="d-label" style={{ marginBottom: '0.25rem', fontSize: '0.625rem' }}>{label}</div>
      <div className="mono-data" style={{ fontSize: '0.875rem', fontWeight: 600, color: sc }}>
        {value}
      </div>
    </div>
  );
}

function PreviewDemo({ component }: { component: ComponentItem }) {
  if (component.category === 'primitives' && component.name === 'Button') {
    return (
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="d-interactive" data-variant="primary" style={{ border: 'none' }}>Primary</button>
        <button className="d-interactive" data-variant="ghost" style={{ border: 'none' }}>Ghost</button>
        <button className="d-interactive" data-variant="danger" style={{ border: 'none' }}>Danger</button>
        <button className="d-interactive" style={{ border: 'none' }}>Default</button>
        <button className="d-interactive" disabled style={{ border: 'none' }}>Disabled</button>
      </div>
    );
  }
  if (component.category === 'primitives' && component.name === 'Input') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: 320 }}>
        <input className="d-control" placeholder="Default input" />
        <input className="d-control" placeholder="With value" defaultValue="Hello World" />
        <input className="d-control" placeholder="Disabled" disabled />
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: 'var(--d-text-muted)' }}>
      <Box size={48} style={{ opacity: 0.3 }} />
      <span className="mono-data" style={{ fontSize: '0.8125rem' }}>
        {component.name} Preview
      </span>
      <span style={{ fontSize: '0.75rem' }}>
        Live preview of the {component.name} component
      </span>
    </div>
  );
}
