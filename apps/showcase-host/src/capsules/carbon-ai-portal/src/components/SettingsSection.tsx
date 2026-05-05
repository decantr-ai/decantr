interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function SettingsSection({ title, description, children }: Props) {
  return (
    <section
      className="carbon-card"
      style={{
        padding: '1.25rem 1.5rem',
        background: 'var(--d-surface)',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, letterSpacing: '-0.005em' }}>{title}</h2>
        {description && (
          <p style={{ fontSize: '0.8125rem', color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

export function FieldRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1rem',
        padding: '0.75rem 0',
        borderTop: '1px solid var(--d-border)',
        alignItems: 'center',
      }}
    >
      <div>
        <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>{label}</div>
        {description && (
          <div style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)', marginTop: '0.125rem' }}>
            {description}
          </div>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}
