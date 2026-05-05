interface MoneyProps {
  value: number;
  showSign?: boolean;
  colored?: boolean;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function formatMoney(value: number, compact = false): string {
  const abs = Math.abs(value);
  if (compact && abs >= 1_000_000) {
    return `${value < 0 ? '-' : ''}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (compact && abs >= 10_000) {
    return `${value < 0 ? '-' : ''}$${(abs / 1000).toFixed(1)}K`;
  }
  return `${value < 0 ? '-' : ''}$${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPct(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export function Money({ value, showSign = false, colored = false, compact = false, className, style }: MoneyProps) {
  const formatted = formatMoney(value, compact);
  const sign = showSign && value > 0 ? '+' : '';
  const color = colored ? (value >= 0 ? 'var(--d-success)' : 'var(--d-error)') : undefined;
  return (
    <span className={`fd-mono ${className ?? ''}`} style={{ color, ...style }}>
      {sign}
      {formatted}
    </span>
  );
}
