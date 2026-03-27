export function Card({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
