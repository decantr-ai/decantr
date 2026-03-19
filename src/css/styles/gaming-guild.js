/**
 * Gaming Guild — Bold, high-energy design style.
 * Intense neon glows, dark backgrounds, sharp contrasts.
 * For gaming, esports, and high-energy applications.
 */
export const gamingGuild = {
  id: 'gaming-guild',
  name: 'Gaming Guild',
  seed: {
    primary: '#8b5cf6',
    accent: '#22d3ee',
    tertiary: '#f43f5e',
    neutral: '#71717a',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#22d3ee',
    bg: '#f8fafc',
    bgDark: '#0f0f1a',
  },
  personality: {
    radius: 'rounded',
    elevation: 'glow',
    motion: 'bouncy',
    borders: 'medium',
    density: 'comfortable',
    gradient: 'vivid',
  },
  typography: {
    '--d-fw-heading': '800',
    '--d-fw-title': '700',
    '--d-ls-heading': '-0.02em',
  },
  overrides: {
    light: {},
    dark: {
      '--d-glow-radius': '40px',
      '--d-glow-intensity': '0.4',
      '--d-gradient-hint-opacity': '0.1',
    },
  },
  components: [
    // Visual effects decorators (intense for gaming style)
    '.d-glow-primary{box-shadow:0 0 var(--d-glow-radius,40px) rgba(139,92,246,var(--d-glow-intensity,0.4)),0 0 calc(var(--d-glow-radius,40px)*2) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)/2));border:1px solid rgba(139,92,246,0.6)}',
    '.d-glow-primary:hover{box-shadow:0 0 calc(var(--d-glow-radius,40px)*1.5) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)*1.5)),0 0 calc(var(--d-glow-radius,40px)*3) rgba(139,92,246,calc(var(--d-glow-intensity,0.4)/1.5))}',
    '.d-glow-accent{box-shadow:0 0 var(--d-glow-radius,40px) rgba(34,211,238,var(--d-glow-intensity,0.4));border:1px solid rgba(34,211,238,0.6)}',
    '.d-stat-glow{text-shadow:0 0 30px rgba(139,92,246,0.6)}',
    '.d-gradient-hint-primary{background:linear-gradient(135deg,rgba(139,92,246,var(--d-gradient-hint-opacity,0.1)) 0%,transparent 50%)}',
    '.d-gradient-hint-accent{background:linear-gradient(135deg,rgba(34,211,238,var(--d-gradient-hint-opacity,0.1)) 0%,transparent 50%)}',
    '.d-terminal-chrome{background:linear-gradient(145deg,#1a1a2e 0%,#0f0f1a 100%);border-radius:var(--d-radius-panel);border:1px solid rgba(139,92,246,0.3);box-shadow:0 0 30px rgba(139,92,246,0.15);overflow:hidden}',
    '.d-terminal-chrome-header{display:flex;align-items:center;gap:6px;padding:10px 14px;border-bottom:1px solid rgba(139,92,246,0.2)}',
    '.d-terminal-chrome-dot{width:12px;height:12px;border-radius:50%}',
    '.d-terminal-chrome-dot-red{background:#ff5f57}',
    '.d-terminal-chrome-dot-yellow{background:#febc2e}',
    '.d-terminal-chrome-dot-green{background:#28c840}',
    '.d-terminal-chrome-title{margin-left:auto;font-size:11px;color:rgba(139,92,246,0.6);font-family:var(--d-font-mono)}',
    '.d-terminal-chrome-body{padding:16px;font-family:var(--d-font-mono);font-size:12px;line-height:1.8}',
    '.d-icon-glow{background:linear-gradient(135deg,rgba(139,92,246,0.2) 0%,rgba(139,92,246,0.05) 100%);box-shadow:0 0 20px rgba(139,92,246,0.15);border-radius:var(--d-radius-md);display:flex;align-items:center;justify-content:center}',
  ].join(''),
};
