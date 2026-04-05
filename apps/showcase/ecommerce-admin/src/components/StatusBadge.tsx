export function StatusBadge({ status, children }: { status: string; children?: React.ReactNode }) {
  return (
    <span className="ea-status-badge" data-status={status}>
      {children ?? status.replace(/-/g, ' ')}
    </span>
  );
}
