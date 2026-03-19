/**
 * Clean — Professional, understated design style.
 * Subtle shadows, rounded corners, thin borders, smooth motion.
 * No gradients, no glass, no glow. Closest to shadcn/Tailwind aesthetic.
 */
export const clean = {
  id: 'clean',
  name: 'Clean',
  seed: {
    primary: '#3b82f6',
    accent: '#10b981',
    tertiary: '#8b5cf6',
    neutral: '#6b7280',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    bg: '#ffffff',
    bgDark: '#111827',
  },
  personality: {
    radius: 'rounded',
    elevation: 'shadow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'none',
  },
  typography: {
    '--d-fw-heading': '600',
    '--d-fw-title': '500',
    '--d-ls-heading': '-0.01em',
  },
  overrides: {
    light: {
      '--d-glow-radius': '8px',
      '--d-glow-intensity': '0.08',
      '--d-gradient-hint-opacity': '0.03',
    },
    dark: {
      '--d-glow-radius': '12px',
      '--d-glow-intensity': '0.12',
      '--d-gradient-hint-opacity': '0.05',
    },
  },
  components: [
    // Visual effects decorators (subtle for clean style)
    '.d-glow-primary{box-shadow:0 2px 8px rgba(0,0,0,0.08);border:1px solid rgba(0,0,0,0.1)}',
    '.d-glow-primary:hover{box-shadow:0 4px 12px rgba(0,0,0,0.12)}',
    '.d-glow-accent{box-shadow:0 2px 8px rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2)}',
    '.d-stat-glow{font-weight:700}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(59,130,246,0.03) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(16,185,129,0.03) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:#fafafa;border-radius:8px;border:1px solid #e5e5e5;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid #e5e5e5;background:#f5f5f5}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:#6b7280;font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8;background:#fafafa}',
    '.d-icon-glow{background:rgba(59,130,246,0.08);border-radius:8px;display:flex;align-items:center;justify-content:center}',
  ].join(''),
};
