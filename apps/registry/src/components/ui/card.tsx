interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className = '', hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={`bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-md)] p-6 ${hover ? 'transition-colors hover:border-[var(--border-hover)]' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
