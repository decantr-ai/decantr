interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className="carbon-toggle"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={disabled ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
    />
  );
}
