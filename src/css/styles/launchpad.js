/**
 * Launchpad — Modern startup/product design style.
 * Clean with subtle accents, balanced glows, product-focused.
 * For SaaS, product pages, and startup applications.
 */
export const launchpad = {
  id: 'launchpad',
  name: 'Launchpad',
  seed: {
    primary: '#6366f1',
    accent: '#06b6d4',
    tertiary: '#ec4899',
    neutral: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    bg: '#ffffff',
    bgDark: '#0f172a',
  },
  personality: {
    radius: 'rounded',
    elevation: 'subtle-glow',
    motion: 'smooth',
    borders: 'thin',
    density: 'comfortable',
    gradient: 'subtle',
  },
  typography: {
    '--d-fw-heading': '700',
    '--d-fw-title': '600',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {
      '--d-glow-radius': '20px',
      '--d-glow-intensity': '0.15',
      '--d-gradient-hint-opacity': '0.05',
    },
    dark: {
      '--d-glow-radius': '25px',
      '--d-glow-intensity': '0.25',
      '--d-gradient-hint-opacity': '0.08',
    },
  },
  components: [
    // Visual effects decorators (balanced for launchpad style)
    '.d-glow-primary{box-shadow:0 0 var(--d-glow-radius,25px) rgba(99,102,241,var(--d-glow-intensity,0.25)),inset 0 1px 0 rgba(255,255,255,0.06);border:1px solid rgba(99,102,241,0.3)}',
    '.d-glow-primary:hover{box-shadow:0 0 calc(var(--d-glow-radius,25px)*1.3) rgba(99,102,241,calc(var(--d-glow-intensity,0.25)*1.3))}',
    '.d-glow-accent{box-shadow:0 0 var(--d-glow-radius,25px) rgba(6,182,212,var(--d-glow-intensity,0.25));border:1px solid rgba(6,182,212,0.3)}',
    '.d-stat-glow{text-shadow:0 0 20px rgba(99,102,241,0.3)}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(99,102,241,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(6,182,212,var(--d-gradient-hint-opacity,0.08)) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:linear-gradient(145deg,#1e1e2e 0%,#0f172a 100%);border-radius:var(--d-radius-panel);border:1px solid rgba(99,102,241,0.2);box-shadow:0 0 30px rgba(6,182,212,0.08);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05)}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:rgba(255,255,255,0.4);font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8}',
    '.d-icon-glow{background:linear-gradient(135deg,rgba(99,102,241,0.12) 0%,rgba(99,102,241,0.04) 100%);box-shadow:0 0 15px rgba(99,102,241,0.08);border-radius:var(--d-radius-md);display:flex;align-items:center;justify-content:center}',
  ].join(''),
};
