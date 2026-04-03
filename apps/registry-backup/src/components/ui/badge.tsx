type Variant = 'default' | 'official' | 'community' | 'org' | 'success' | 'warning' | 'error';

const variantStyles: Record<Variant, string> = {
  default: 'bg-[var(--bg-elevated)] text-[var(--fg-muted)]',
  official: 'bg-[var(--primary)]/20 text-[var(--primary-light)]',
  community: 'bg-[var(--secondary)]/20 text-[var(--secondary)]',
  org: 'bg-[var(--accent)]/20 text-[var(--accent)]',
  success: 'bg-[var(--success)]/20 text-[var(--success)]',
  warning: 'bg-[var(--warning)]/20 text-[var(--warning)]',
  error: 'bg-[var(--error)]/20 text-[var(--error)]',
};

export function Badge({ variant = 'default', children }: { variant?: Variant; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-medium ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}
