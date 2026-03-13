/**
 * Docs site extras — animation keyframes, utility classes, and section styling
 * that supplement the built-in auradecantism style for the marketing landing page.
 * Injected as a standalone style element, independent of the theme system.
 */
export const docsSiteCSS = [
  // ── Keyframe animations ──
  '@keyframes ds-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}',
  '@keyframes ds-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}',
  '@keyframes ds-pulse{0%,100%{opacity:0.3}50%{opacity:0.7}}',
  '@keyframes ds-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}',
  '@keyframes ds-glow{0%,100%{box-shadow:0 0 12px rgba(101,0,198,0.2),0 0 30px rgba(101,0,198,0.06)}50%{box-shadow:0 0 20px rgba(10,243,235,0.25),0 0 40px rgba(10,243,235,0.08)}}',
  '@keyframes ds-rotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
  '@keyframes ds-scale-in{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}',
  '@keyframes ds-flow-down{0%{opacity:0;transform:translateY(-10px)}50%{opacity:1}100%{opacity:0;transform:translateY(10px)}}',
  // ── Animation utility classes ──
  '.ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
  '.ds-hidden{opacity:0;transform:translateY(30px)}',
  '.ds-visible .ds-animate{animation:ds-fade-up 0.7s var(--d-easing-decelerate) both}',
  '.ds-delay-1{animation-delay:100ms}',
  '.ds-delay-2{animation-delay:200ms}',
  '.ds-delay-3{animation-delay:300ms}',
  '.ds-delay-4{animation-delay:400ms}',
  '.ds-delay-5{animation-delay:500ms}',
  '.ds-delay-6{animation-delay:600ms}',
  '.ds-delay-7{animation-delay:700ms}',
  '.ds-delay-8{animation-delay:800ms}',
  '.ds-delay-9{animation-delay:900ms}',
  '.ds-float{animation:ds-float 4s var(--d-easing-standard) infinite}',
  '.ds-glow{animation:ds-glow 3s var(--d-easing-standard) infinite}',
  '.ds-pulse{animation:ds-pulse 3s var(--d-easing-standard) infinite}',
  // ── Docs-specific gradient text (ds- prefixed, uses same tokens as d-gradient-text) ──
  '.ds-gradient-text{background:linear-gradient(135deg,var(--d-primary),var(--d-accent),var(--d-tertiary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
  '.ds-gradient-text-alt{background:linear-gradient(135deg,var(--d-accent),var(--d-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
  // ── Docs-specific mesh (ds- prefixed, same pattern as d-mesh) ──
  '.ds-mesh{background:radial-gradient(ellipse at 20% 50%,rgba(101,0,198,0.15) 0%,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(10,243,235,0.1) 0%,transparent 50%),radial-gradient(ellipse at 60% 80%,rgba(254,68,116,0.08) 0%,transparent 50%),var(--d-bg)}',
  // ── Glass panel (ds- prefixed, same pattern as d-glass) ──
  '.ds-glass{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.1);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-1),inset 0 1px 0 rgba(255,255,255,0.06)}',
  '.ds-glass-strong{background:var(--d-surface-2);backdrop-filter:var(--d-surface-2-filter);-webkit-backdrop-filter:var(--d-surface-2-filter);border:1px solid rgba(255,255,255,0.12);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-2),inset 0 1px 0 rgba(255,255,255,0.08)}',
  '.ds-glass-subtle{background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.05);border-radius:var(--d-radius-lg);box-shadow:var(--d-elevation-0)}',
  // ── Decorative elements ──
  '.ds-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none}',
  '.ds-stat{font-size:3rem;font-weight:800;line-height:1;letter-spacing:-0.04em}',
  '.ds-section{padding:var(--d-sp-16) var(--d-sp-8);position:relative;overflow:hidden}',
  '@media(max-width:768px){.ds-section{padding:var(--d-sp-12) var(--d-sp-4)}.ds-stat{font-size:2rem}}',
  // ── Brand accent colors ──
  '.ds-pink{color:#FE4474}',
  '.ds-cyan{color:#0AF3EB}',
  '.ds-purple{color:#6500C6}',
  // ── Chart text readability on dark glass ──
  '.d-chart-axis text{fill:rgba(255,255,255,0.7)!important;font-size:0.75rem!important}',
  '.d-chart-axis-label{fill:rgba(255,255,255,0.7)!important}',
  '.d-chart text{fill:rgba(255,255,255,0.85);font-family:var(--d-font)}',
  '.d-chart-legend{color:rgba(255,255,255,0.8)}',
  '.d-chart-label{fill:rgba(255,255,255,0.9)!important;font-weight:600!important;font-size:0.7rem!important}',
  '.d-chart{background:transparent!important;border:none!important;box-shadow:none!important}',
  '.d-chart-inner{background:transparent!important}',
  '.d-chart-grid line{stroke:rgba(255,255,255,0.06)!important}',
  '.d-chart-tooltip{background:rgba(12,15,40,0.9)!important;border:1px solid rgba(255,255,255,0.15)!important;color:rgba(255,255,255,0.9)!important;backdrop-filter:blur(12px)}',
  '.d-chart-spark{background:transparent!important}',
  // ── Responsive footer ──
  '@media(max-width:640px){.ds-footer-links{flex-direction:column;gap:0.5rem;align-items:center}}',
  // ── Navigation header ──
  '.ds-nav{transition:background 0.3s,border-color 0.3s,backdrop-filter 0.3s;background:transparent;border-bottom:1px solid transparent}',
  '.ds-nav-scrolled{background:rgba(6,9,24,0.85);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom-color:rgba(255,255,255,0.06)}',
  '.ds-nav-link{color:var(--d-muted-fg);text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.15s;padding:0.25rem 0}',
  '.ds-nav-link:hover{color:var(--d-fg)}',
  '.ds-nav-active{color:var(--d-accent)!important}',
  // ── Pipeline diagram ──
  '.ds-pipeline{gap:0}',
  '.ds-pipeline-dot{width:48px;height:48px;border-radius:50%;background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:1px solid rgba(255,255,255,0.12);color:var(--d-accent);box-shadow:var(--d-elevation-1)}',
  '.ds-pipeline-line{flex:1;min-width:24px;height:2px;background:linear-gradient(90deg,var(--d-primary),var(--d-accent));margin:0 -1px;align-self:center;margin-bottom:1.5rem}',
  '.ds-pipeline-label{color:var(--d-muted-fg);font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase}',
  '@media(max-width:640px){.ds-pipeline{flex-direction:column;gap:0}.ds-pipeline-line{width:2px;height:24px;min-width:unset;min-height:24px;background:linear-gradient(180deg,var(--d-primary),var(--d-accent));margin:0;margin-right:1.5rem;align-self:center}.ds-pipeline-node{flex-direction:row;gap:0.75rem}}',
  // ── Pipeline interactivity (How It Works phase viewer) ──
  '.ds-pipeline-dot{cursor:pointer;transition:background 0.4s,box-shadow 0.4s,transform 0.3s,border-color 0.3s,color 0.3s}',
  '.ds-pipeline-dot:hover:not(.ds-dot-current){transform:scale(1.08)}',
  '.ds-dot-past{background:linear-gradient(135deg,var(--d-primary),var(--d-accent))!important;color:var(--d-bg)!important;border-color:rgba(254,68,116,0.3)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
  '.ds-dot-current{background:linear-gradient(135deg,var(--d-primary),var(--d-accent))!important;color:var(--d-bg)!important;border-color:rgba(254,68,116,0.3)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 0 20px rgba(254,68,116,0.4),0 0 40px rgba(254,68,116,0.15)!important;transform:scale(1.15)}',
  '.ds-pipeline-label{transition:color 0.3s}',
  '.ds-label-current{color:var(--d-accent)!important}',
  '.ds-pipeline-line{transition:opacity 0.4s}',
  '.ds-line-future{opacity:0.15}',
  '.ds-phase-content{transition:opacity 0.4s var(--d-easing-decelerate);min-height:280px}',
  '@media(max-width:640px){.ds-pipeline-phase{flex-direction:row!important;gap:0!important}.ds-pipeline-phase .ds-pipeline-dot{width:32px;height:32px}.ds-pipeline-phase .ds-pipeline-line{min-width:8px!important;height:2px!important;min-height:auto!important;margin:0 -1px!important;margin-bottom:1.25rem!important;align-self:center!important}.ds-pipeline-phase .ds-pipeline-node{flex-direction:column!important;gap:0.25rem!important}.ds-pipeline-phase .ds-pipeline-label{font-size:0.55rem}}',
  // ── Code blocks ──
  '.ds-code{font-family:var(--d-font-mono);white-space:pre-wrap;word-break:break-word}',
  '.ds-code-key{color:var(--d-accent)}',
  '.ds-code-str{color:var(--d-primary)}',
  '.ds-code-brace{color:var(--d-muted)}',
  '.ds-code-num{color:var(--d-tertiary)}',
  // ── Blend diagram rows ──
  '.ds-blend-row{border:1px dashed rgba(255,255,255,0.12);border-radius:var(--d-radius);margin-bottom:-1px}',
  // ── Stage badge ──
  '.ds-stage-num{width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,var(--d-primary),var(--d-accent));color:var(--d-bg);font-weight:800;font-size:0.8rem;flex-shrink:0}',
  // ── Settle layers — progressive offset ──
  '.ds-settle-layer:nth-child(1){margin-left:0}',
  '.ds-settle-layer:nth-child(2){margin-left:20px}',
  '.ds-settle-layer:nth-child(3){margin-left:40px}',
  '.ds-settle-layer:nth-child(4){margin-left:60px}',
  '.ds-settle-layer:nth-child(5){margin-left:80px}',
  '@media(max-width:768px){.ds-settle-layer{margin-left:0!important}}',
  // ── Flow animation ──
  '.ds-flow-line{animation:ds-flow-down 2s ease-in-out infinite}',
].join('');
