import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Box, Code, Paintbrush, Accessibility, Smartphone } from 'lucide-react';
import { components, buttonProperties } from '@/data/mock';

const tabs = [
  { id: 'props', label: 'Props', icon: Code },
  { id: 'variants', label: 'Variants', icon: Paintbrush },
  { id: 'a11y', label: 'A11y', icon: Accessibility },
  { id: 'responsive', label: 'Responsive', icon: Smartphone },
] as const;

export function ComponentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('props');
  const component = components.find(c => c.id === id) ?? components[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Breadcrumb + header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/workspace"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--d-text-muted)', textDecoration: 'none', marginBottom: '0.75rem' }}
        >
          <ArrowLeft size={14} /> Back to Workspace
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{component.name}</h1>
            <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              {component.description}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="d-annotation" data-status={component.status === 'stable' ? 'success' : component.status === 'beta' ? 'warning' : 'info'}>
              {component.status}
            </span>
            <span className="mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              v{component.version}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--d-border)', marginBottom: '1.5rem' }}>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="wb-tab"
              data-active={activeTab === tab.id ? 'true' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              <Icon size={12} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="entrance-fade" key={activeTab} style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'props' && <PropsTable />}
        {activeTab === 'variants' && <VariantsView name={component.name} variants={component.variants} />}
        {activeTab === 'a11y' && <A11yView name={component.name} />}
        {activeTab === 'responsive' && <ResponsiveView name={component.name} />}
      </div>
    </div>
  );
}

function PropsTable() {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="d-data" style={{ minWidth: 600 }}>
        <thead>
          <tr>
            <th className="d-data-header">Name</th>
            <th className="d-data-header">Type</th>
            <th className="d-data-header">Default</th>
            <th className="d-data-header">Required</th>
            <th className="d-data-header">Description</th>
          </tr>
        </thead>
        <tbody>
          {buttonProperties.map(prop => (
            <tr key={prop.name} className="d-data-row">
              <td className="d-data-cell mono-data" style={{ color: 'var(--d-primary)' }}>{prop.name}</td>
              <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem', color: 'var(--d-secondary)' }}>{prop.type}</td>
              <td className="d-data-cell mono-data" style={{ fontSize: '0.75rem' }}>{prop.default}</td>
              <td className="d-data-cell">
                {prop.required && <span className="d-annotation" data-status="warning" style={{ fontSize: '0.625rem' }}>required</span>}
              </td>
              <td className="d-data-cell" style={{ color: 'var(--d-text-muted)', fontSize: '0.8125rem' }}>{prop.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VariantsView({ name, variants }: { name: string; variants: number }) {
  const variantNames = ['primary', 'ghost', 'danger', 'outline', 'default'].slice(0, variants);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {variantNames.map(v => (
        <div key={v} className="d-surface d-glass" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>{v}</h3>
            <span className="mono-data" style={{ fontSize: '0.6875rem', color: 'var(--d-text-muted)' }}>
              {name.toLowerCase()}[variant="{v}"]
            </span>
          </div>
          <div className="d-terminal-chrome">
            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button className="d-interactive" data-variant={v === 'default' ? undefined : v} style={{ border: v === 'outline' ? undefined : 'none' }}>
                {name} ({v})
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function A11yView({ name }: { name: string }) {
  const checks = [
    { label: 'Keyboard navigation', status: 'pass', detail: 'Focusable via Tab, activates on Enter/Space' },
    { label: 'ARIA role', status: 'pass', detail: 'role="button" is implicit' },
    { label: 'Focus visible', status: 'pass', detail: '2px solid outline on :focus-visible' },
    { label: 'Color contrast', status: 'pass', detail: '7.2:1 ratio (AAA) on primary variant' },
    { label: 'Screen reader', status: 'pass', detail: 'aria-label supported, disabled state announced' },
  ];

  return (
    <div className="d-surface d-glass">
      <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>
        Accessibility Report: {name}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {checks.map(check => (
          <div key={check.label} className="wb-prop-row" style={{ gap: '0.75rem' }}>
            <span className="d-annotation" data-status="success" style={{ fontSize: '0.625rem', flexShrink: 0 }}>
              {check.status}
            </span>
            <span style={{ flex: 1, fontSize: '0.8125rem' }}>{check.label}</span>
            <span style={{ color: 'var(--d-text-muted)', fontSize: '0.75rem' }}>{check.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResponsiveView({ name }: { name: string }) {
  const breakpoints = [
    { label: 'Mobile', width: '375px', description: 'Full-width, touch targets 44px minimum' },
    { label: 'Tablet', width: '768px', description: 'Standard sizing, inline placement' },
    { label: 'Desktop', width: '1280px', description: 'Compact sizing available, keyboard shortcuts' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {breakpoints.map(bp => (
        <div key={bp.label} className="d-surface d-glass" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ minWidth: 80 }}>
            <span className="d-label">{bp.label}</span>
            <div className="mono-data" style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>{bp.width}</div>
          </div>
          <div style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--d-text-muted)' }}>
            {bp.description}
          </div>
          <Box size={16} style={{ color: 'var(--d-text-muted)', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}
