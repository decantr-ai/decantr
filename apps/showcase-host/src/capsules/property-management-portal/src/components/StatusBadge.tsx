export function StatusBadge({ status, children }: { status: string; children?: React.ReactNode }) {
  return (
    <span className="pm-status-badge" data-status={status}>
      {children ?? status.replace(/-/g, ' ')}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  return <span className="pm-priority" data-priority={priority}>{priority}</span>;
}
