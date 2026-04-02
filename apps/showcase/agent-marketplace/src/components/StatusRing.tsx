import type { Agent } from '../data';

interface StatusRingProps {
  status: Agent['status'];
  size?: number;
  children?: React.ReactNode;
}

/** Status ring with pulse animation for active agents. Uses personality CSS. */
export function StatusRing({ status, size = 48, children }: StatusRingProps) {
  return (
    <div
      className="status-ring"
      data-status={status}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
