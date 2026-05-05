export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="crm-status-badge" data-status={status}>
      {status.replace(/-/g, ' ')}
    </span>
  );
}
