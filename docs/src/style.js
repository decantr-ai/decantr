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
  '@keyframes ds-drift-1{0%{transform:translate(0,0) scale(1);opacity:0.35}25%{transform:translate(120px,80px) scale(1.15);opacity:0.6}50%{transform:translate(-60px,150px) scale(0.9);opacity:0.4}75%{transform:translate(80px,-40px) scale(1.1);opacity:0.55}100%{transform:translate(0,0) scale(1);opacity:0.35}}',
  '@keyframes ds-drift-2{0%{transform:translate(0,0) scale(1);opacity:0.3}33%{transform:translate(-100px,-80px) scale(1.12);opacity:0.5}66%{transform:translate(80px,120px) scale(0.88);opacity:0.35}100%{transform:translate(0,0) scale(1);opacity:0.3}}',
  '@keyframes ds-drift-3{0%{transform:translate(0,0) scale(1);opacity:0.25}20%{transform:translate(60px,-100px) scale(1.18);opacity:0.45}50%{transform:translate(-120px,60px) scale(0.85);opacity:0.3}80%{transform:translate(40px,100px) scale(1.1);opacity:0.5}100%{transform:translate(0,0) scale(1);opacity:0.25}}',
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
  '.ds-drift-1{animation:ds-drift-1 4s ease-in-out infinite}',
  '.ds-drift-2{animation:ds-drift-2 6s ease-in-out infinite}',
  '.ds-drift-3{animation:ds-drift-3 8s ease-in-out infinite}',
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
  '.ds-stat{font-size:var(--d-text-4xl);font-weight:800;line-height:1;letter-spacing:-0.04em}',
  '.ds-section{padding:var(--d-sp-16) var(--d-sp-8);position:relative;overflow:hidden}',
  '@media(max-width:768px){.ds-section{padding:var(--d-sp-12) var(--d-sp-4)}.ds-stat{font-size:var(--d-text-3xl)}}',
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
  // ── NavigationMenu overrides inside Shell header ──
  '.d-shell-header .d-navmenu-item{color:var(--d-muted-fg);font-size:0.875rem}',
  '.d-shell-header .d-navmenu-item:hover{color:var(--d-fg)}',
  // ── Pipeline diagram ──
  '.ds-pipeline{gap:0}',
  '.ds-pipeline-dot{width:var(--d-sp-12);height:var(--d-sp-12);border-radius:50%;background:var(--d-surface-1);backdrop-filter:var(--d-surface-1-filter);-webkit-backdrop-filter:var(--d-surface-1-filter);border:var(--d-border-width) solid rgba(255,255,255,0.12);color:var(--d-accent);box-shadow:var(--d-elevation-1)}',
  '.ds-pipeline-line{flex:1;min-width:var(--d-sp-6);height:var(--d-border-width);background:linear-gradient(90deg,var(--d-primary),var(--d-accent));margin:0 -1px;align-self:center;margin-bottom:var(--d-sp-6)}',
  '.ds-pipeline-label{color:var(--d-muted-fg);font-size:0.7rem;letter-spacing:0.08em;text-transform:uppercase}',
  '@media(max-width:640px){.ds-pipeline{flex-direction:column;gap:0}.ds-pipeline-line{width:2px;height:24px;min-width:unset;min-height:24px;background:linear-gradient(180deg,var(--d-primary),var(--d-accent));margin:0;margin-right:1.5rem;align-self:center}.ds-pipeline-node{flex-direction:row;gap:0.75rem}}',
  // ── Pipeline interactivity (How It Works phase viewer) ──
  '.ds-pipeline-dot{cursor:pointer;transition:background 0.4s,box-shadow 0.4s,transform 0.3s,border-color 0.3s,color 0.3s}',
  '.ds-pipeline-dot:hover:not(.ds-dot-current){transform:scale(1.08)}',
  '.ds-dot-past{background:linear-gradient(135deg,var(--d-primary),var(--d-accent))!important;color:var(--d-bg)!important;border-color:rgba(254,68,116,0.3)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
  '.ds-dot-current{background:linear-gradient(135deg,var(--d-primary),var(--d-accent))!important;color:var(--d-bg)!important;border-color:rgba(254,68,116,0.3)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 0 20px rgba(254,68,116,0.4),0 0 40px rgba(254,68,116,0.15)!important;transform:scale(1.15)}',
  '.ds-pipeline-label{transition:color 0.3s}',
  '.ds-label-current{color:var(--d-accent)!important}',
  '.ds-pipeline-line{transition:opacity 0.4s var(--d-easing-standard)}',
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
  '.ds-stage-num{width:var(--d-sp-7);height:var(--d-sp-7);border-radius:50%;background:linear-gradient(135deg,var(--d-primary),var(--d-accent));color:var(--d-bg);font-weight:800;font-size:var(--d-text-sm);flex-shrink:0}',
  // ── Settle layers — progressive offset ──
  '.ds-settle-layer:nth-child(1){margin-left:0}',
  '.ds-settle-layer:nth-child(2){margin-left:20px}',
  '.ds-settle-layer:nth-child(3){margin-left:40px}',
  '.ds-settle-layer:nth-child(4){margin-left:60px}',
  '.ds-settle-layer:nth-child(5){margin-left:80px}',
  '@media(max-width:768px){.ds-settle-layer{margin-left:0!important}}',
  // ── Flow animation ──
  '.ds-flow-line{animation:ds-flow-down 2s ease-in-out infinite}',
  // ── Responsive heading sizes ──
  '.ds-heading-hero{font-size:clamp(3rem,7vw,5.5rem)}',
  '.ds-heading-page{font-size:clamp(2.5rem,6vw,4.5rem)}',
  '.ds-heading{font-size:clamp(2rem,5vw,3.5rem)}',
  '.ds-heading-stage{font-size:clamp(1.75rem,4vw,2.75rem)}',
  '.ds-heading-lg{font-size:clamp(1.5rem,4vw,2.5rem)}',
  '.ds-heading-md{font-size:clamp(1.25rem,3vw,1.75rem)}',
  '.ds-heading-sm{font-size:clamp(1.4rem,3vw,2rem)}',
  '.ds-heading-quote{font-size:clamp(1.05rem,2.2vw,1.3rem)}',
  // ── Accent backgrounds ──
  '.ds-accent-bg{background:rgba(10,243,235,0.1)}',
  '.ds-accent-pill{background:rgba(10,243,235,0.08);border:1px solid rgba(10,243,235,0.15)}',
  // ── Orb color variants ──
  '.ds-orb-purple-15{background:rgba(101,0,198,0.15)}',
  '.ds-orb-purple-12{background:rgba(101,0,198,0.12)}',
  '.ds-orb-purple-10{background:rgba(101,0,198,0.1)}',
  '.ds-orb-purple-08{background:rgba(101,0,198,0.08)}',
  '.ds-orb-purple-06{background:rgba(101,0,198,0.06)}',
  '.ds-orb-cyan-08{background:rgba(10,243,235,0.08)}',
  '.ds-orb-cyan-06{background:rgba(10,243,235,0.06)}',
  '.ds-orb-cyan-04{background:rgba(10,243,235,0.04)}',
  '.ds-orb-pink-06{background:rgba(254,68,116,0.06)}',
  '.ds-orb-purple-35{background:rgba(101,0,198,0.35)}',
  '.ds-orb-cyan-25{background:rgba(10,243,235,0.25)}',
  '.ds-orb-pink-20{background:rgba(254,68,116,0.2)}',
  '.ds-orb-gold-06{background:rgba(253,163,3,0.06)}',
  // ── Decorative gradients & dividers ──
  '.ds-divider-v{background:linear-gradient(to bottom,transparent,rgba(255,255,255,0.1),transparent);align-self:stretch}',
  '.ds-brand-line{background:var(--d-gradient-brand)}',
  '.ds-scroll-line{background:linear-gradient(to bottom,transparent,var(--d-muted));animation:ds-pulse 2s infinite}',
  '.ds-flow-gradient{background:linear-gradient(to bottom,var(--d-primary),transparent)}',
  '.ds-gradient-divider{background:linear-gradient(90deg,transparent,var(--d-primary),var(--d-accent),transparent)}',
  // ── Transform utilities ──
  '.ds-center-x{transform:translateX(-50%)}',
  // ── Logo effects ──
  '.ds-logo-glow{filter:drop-shadow(0 0 40px rgba(101,0,198,0.3))}',
  '.ds-logo-glow-sm{filter:drop-shadow(0 0 20px rgba(101,0,198,0.4))}',
  // ── Quote styling ──
  '.ds-quote-mark{background:linear-gradient(135deg,var(--d-primary),var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;pointer-events:none}',
  '.ds-quote-text{color:rgba(255,255,255,0.92);background:linear-gradient(135deg,rgba(255,255,255,0.95) 60%,var(--d-accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}',
  // ── Glow/blur backgrounds ──
  '.ds-glow-purple{background:rgba(101,0,198,0.2);filter:blur(60px)}',
  '.ds-glow-cyan{background:rgba(10,243,235,0.15);filter:blur(50px)}',
  // ── AI widget ──
  '.ds-ai-icon-bg{background:linear-gradient(135deg,rgba(254,68,116,0.15),rgba(10,243,235,0.15))}',
  // ── Mock dashboard elements ──
  '.ds-mock-sidebar{background:rgba(101,0,198,0.15);border-right:1px solid rgba(255,255,255,0.06)}',
  '.ds-mock-bar{background:rgba(255,255,255,0.04)}',
  '.ds-mock-kpi-1{background:rgba(254,68,116,0.12)}',
  '.ds-mock-kpi-2{background:rgba(10,243,235,0.12)}',
  '.ds-mock-kpi-3{background:rgba(101,0,198,0.15)}',
  '.ds-mock-table{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)}',
  // ── Extended animation delays ──
  '.ds-delay-1500{animation-delay:1.5s}',
  '.ds-delay-3000{animation-delay:3s}',
  // ── Layout utilities ──
  '.ds-logo-col{flex-basis:240px}',
  '.ds-no-bullets{list-style:none}',
  // ── Markdown renderer ──
  '.ds-code-block{background:var(--d-surface-0);border:1px solid var(--d-border);overflow-x:auto}',
  '.ds-code-block code{font-family:var(--d-font-mono);font-size:0.85rem;line-height:1.6;color:var(--d-fg)}',
  '.ds-inline-code{background:var(--d-surface-1);border:1px solid var(--d-border);font-family:var(--d-font-mono);color:var(--d-accent)}',
  '.ds-blockquote{border-left:var(--d-border-width-thick, 3px) solid var(--d-primary)}',
  '.ds-hl-keyword{color:var(--d-primary)}',
  '.ds-hl-string{color:var(--d-success)}',
  '.ds-hl-comment{color:var(--d-muted-fg);font-style:italic}',
  '.ds-hl-number{color:var(--d-tertiary)}',
  // ── Docs sidebar (Shell-managed) ──

  // ══════════════════════════════════════════════════════════════
  // ── Workbench shell styles (de-* namespace) ──────────────────
  // Ported from workbench/public/index.html for /workbench route
  // ══════════════════════════════════════════════════════════════

  // ── Workbench tokens ──
  ':root{--de-header-h:52px;--de-sidebar-w:220px;--de-hud-w:280px;--de-search-w:520px;--de-search-max-h:360px;--de-content-max-w:1080px;--de-toggle-size:var(--d-field-h-sm);--de-accent-pink:#FE4474;--de-scrollbar-w:4px;--de-active-indicator-w:2px;--de-vp-tablet:768px;--de-vp-mobile:375px;--de-active-indicator-h:60%;--de-slide-offset-sm:6px;--de-search-modal-top:15vh;--de-slide-offset-lg:12px;--de-search-blur:4px}',

  // ── Utilities ──
  '.de-hidden{display:none!important}',

  // ── Shell layout ──
  '.de-shell{display:flex;flex-direction:column;height:100vh}',
  '.de-header{display:flex;align-items:center;justify-content:space-between;padding:0 var(--d-sp-4);height:var(--de-header-h);min-height:var(--de-header-h);background:var(--d-chrome-bg);color:var(--d-chrome-fg);box-shadow:var(--d-elevation-1);z-index:var(--d-z-sticky);gap:var(--d-sp-2);--d-fg:var(--d-chrome-fg);--d-muted-fg:var(--d-chrome-muted);--d-muted:var(--d-chrome-muted);--d-border:var(--d-chrome-border);--d-surface-0:var(--d-chrome-hover);--d-surface-1:var(--d-chrome-active);--d-surface-2:var(--d-chrome-active);--d-field-bg:var(--d-chrome-hover);--d-field-border:var(--d-chrome-border);--d-field-placeholder:var(--d-chrome-muted)}',
  '.de-header-left{display:flex;align-items:center;gap:var(--d-sp-2);flex:1;min-width:0}',
  '.de-header-right{display:flex;align-items:center;gap:var(--d-sp-2);flex-shrink:0}',
  '.de-logo{display:flex;align-items:center;gap:var(--d-sp-2);font-size:var(--d-text-base);font-weight:var(--d-fw-heading);letter-spacing:var(--d-ls-heading);color:var(--d-chrome-fg);white-space:nowrap;margin-right:var(--d-sp-4);cursor:pointer}',
  '.de-pink{color:var(--de-accent-pink)}',
  '.de-body{display:flex;flex:1;overflow:hidden}',

  // ── Sidebar ──
  '.de-sidebar{display:flex;flex-direction:column;width:var(--de-sidebar-w);min-width:var(--de-sidebar-w);height:100%;background:var(--d-chrome-bg);color:var(--d-chrome-fg);border-right:1px solid var(--d-chrome-border);overflow-y:auto;overflow-x:hidden;--d-fg:var(--d-chrome-fg);--d-muted-fg:var(--d-chrome-muted);--d-muted:var(--d-chrome-muted);--d-border:var(--d-chrome-border);--d-surface-0:var(--d-chrome-hover);--d-surface-1:var(--d-chrome-active);--d-surface-2:var(--d-chrome-active);--d-field-bg:var(--d-chrome-hover);--d-field-border:var(--d-chrome-border);--d-field-placeholder:var(--d-chrome-muted)}',
  '.de-sidebar::-webkit-scrollbar{width:var(--de-scrollbar-w)}',
  '.de-sidebar::-webkit-scrollbar-thumb{background:var(--d-chrome-border);border-radius:var(--d-radius-sm)}',
  '.de-sidebar-search{padding:var(--d-sp-2);border-bottom:1px solid var(--d-chrome-border)}',
  '.de-sidebar-items{flex:1;overflow-y:auto;padding:var(--d-sp-1) 0}',
  '.de-sidebar-items::-webkit-scrollbar{width:var(--de-scrollbar-w)}',
  '.de-sidebar-items::-webkit-scrollbar-thumb{background:var(--d-chrome-border);border-radius:var(--d-radius-sm)}',

  // ── Nav items ──
  '.de-nav-header{display:flex;align-items:center;justify-content:space-between;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-3);border:none;background:none;width:100%;text-align:left;cursor:pointer;font-size:var(--d-text-xs);font-weight:var(--d-fw-title);text-transform:uppercase;letter-spacing:var(--d-ls-caps);color:var(--d-chrome-muted);font-family:inherit;transition:color var(--d-duration-fast) ease}',
  '.de-nav-header:hover{color:var(--d-chrome-fg)}',
  '.de-nav-header.de-active{color:var(--d-primary)}',
  '.de-nav-count{font-size:var(--d-text-xs);font-weight:var(--d-fw-medium);color:var(--d-chrome-muted);background:var(--d-chrome-active);padding:var(--d-sp-0-5) var(--d-sp-1-5);border-radius:var(--d-radius-full);line-height:var(--d-lh-none);flex-shrink:0}',
  '.de-nav-group-label{padding:var(--d-sp-1-5) var(--d-sp-3) var(--d-sp-1-5) var(--d-sp-4);font-size:var(--d-text-xs);font-weight:var(--d-fw-title);color:var(--d-chrome-muted);text-transform:uppercase;letter-spacing:var(--d-ls-caps)}',
  '.de-nav-child{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-1-5) var(--d-sp-3) var(--d-sp-1-5) var(--d-sp-6);border:none;background:none;width:100%;text-align:left;cursor:pointer;font-size:var(--d-text-sm);color:var(--d-chrome-muted);font-family:inherit;text-decoration:none;position:relative;transition:color var(--d-duration-fast) ease,background var(--d-duration-fast) ease}',
  '.de-nav-child:hover{background:var(--d-chrome-hover);color:var(--d-chrome-fg)}',
  '.de-nav-child.de-active{color:var(--d-primary);font-weight:var(--d-fw-title)}',
  '.de-nav-child.de-active::before{content:\'\';position:absolute;left:0;top:50%;transform:translateY(-50%);width:var(--de-active-indicator-w);height:var(--de-active-indicator-h);background:var(--d-primary);border-radius:var(--d-radius-sm)}',

  // ── Main content ──
  '.de-main{flex:1;overflow-y:auto}',
  '.de-content{max-width:var(--de-content-max-w);width:100%;margin:0 auto;padding:var(--d-sp-6) var(--d-sp-8) var(--d-sp-16)}',
  '.de-content-enter{opacity:0;transform:translateY(var(--de-slide-offset-sm))}',
  '.de-content>*{transition:opacity var(--d-duration-normal) ease-out,transform var(--d-duration-normal) ease-out}',

  // ── Viewport simulation ──
  '.de-viewport-frame{border:1px dashed var(--d-border-strong);border-radius:var(--d-radius-panel);overflow:auto;background:var(--d-bg);position:relative;max-height:calc(100vh - var(--de-header-h));margin:var(--d-sp-6) auto}',
  '.de-viewport-label{position:absolute;top:calc(-1 * var(--d-sp-6));left:50%;transform:translateX(-50%);font-size:var(--d-text-sm);color:var(--d-muted);white-space:nowrap}',

  // ── Search modal ──
  '.de-search-trigger{display:flex;align-items:center;gap:var(--d-sp-1-5);border:1px solid var(--d-chrome-border);border-radius:var(--d-radius);background:var(--d-chrome-hover);cursor:pointer;padding:var(--d-sp-1) var(--d-sp-2-5);font-size:var(--d-text-sm);color:var(--d-chrome-muted);font-family:inherit;transition:border-color var(--d-duration-fast) ease}',
  '.de-search-trigger:hover{border-color:var(--d-chrome-fg)}',
  '.de-search-kbd{font-size:var(--d-text-xs);padding:var(--d-sp-0-5) var(--d-sp-1-5);background:var(--d-chrome-active);border-radius:var(--d-radius);color:var(--d-chrome-muted)}',
  '.de-search-modal{position:fixed;inset:0;z-index:var(--d-z-modal);display:flex;align-items:flex-start;justify-content:center;padding-top:var(--de-search-modal-top);background:var(--d-overlay);backdrop-filter:blur(var(--de-search-blur));-webkit-backdrop-filter:blur(var(--de-search-blur));transition:opacity var(--d-duration-normal) ease}',
  '.de-search-entering{opacity:0}',
  '.de-search-box{width:var(--de-search-w);max-width:90vw;background:var(--d-surface-1);border:1px solid var(--d-border);border-radius:var(--d-radius-panel);box-shadow:var(--d-elevation-3);overflow:hidden;animation:de-slide-down var(--d-duration-normal) ease-out}',
  '@keyframes de-slide-down{from{opacity:0;transform:translateY(calc(-1 * var(--de-slide-offset-lg)))}to{opacity:1;transform:translateY(0)}}',
  '.de-search-input{width:100%;padding:var(--d-sp-3) var(--d-sp-4);border:none;border-bottom:1px solid var(--d-border);background:transparent;color:var(--d-fg);font-size:var(--d-text-base);font-family:inherit;outline:none}',
  '.de-search-input::placeholder{color:var(--d-muted)}',
  '.de-search-results{max-height:var(--de-search-max-h);overflow-y:auto;padding:var(--d-sp-1)}',
  '.de-search-item{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) var(--d-sp-3);border-radius:var(--d-radius);cursor:pointer;font-size:var(--d-text-base);color:var(--d-fg);transition:background var(--d-duration-instant) ease}',
  '.de-search-item:hover,.de-search-item.de-active{background:var(--d-primary-subtle);color:var(--d-primary)}',
  '.de-search-item-layer{font-size:var(--d-text-sm);color:var(--d-muted);margin-left:auto}',
  '.de-search-empty{padding:var(--d-sp-6);text-align:center;color:var(--d-muted);font-size:var(--d-text-base)}',

  // ── HUD controls ──
  '.de-hud-row{display:flex;align-items:center;gap:var(--d-sp-2);padding:var(--d-sp-2) 0}',
  '.de-hud-label{font-size:var(--d-text-sm);color:var(--d-muted);min-width:3rem;flex-shrink:0}',
  '.de-hud-row .d-select-wrap{flex:1;min-width:0}',
  '.de-hud-viewports{display:flex;gap:var(--d-sp-1);flex:1}',
  '.de-hud-vp-btn{border:1px solid var(--d-border);border-radius:var(--d-radius);background:var(--d-surface-0);cursor:pointer;padding:var(--d-sp-1) var(--d-sp-2);font-size:var(--d-text-xs);color:var(--d-muted);font-family:inherit;transition:all var(--d-duration-fast) ease;flex:1;text-align:center}',
  '.de-hud-vp-btn:hover{border-color:var(--d-primary);color:var(--d-primary)}',
  '.de-hud-vp-btn.de-active{border-color:var(--d-primary);background:var(--d-primary-subtle);color:var(--d-primary)}',
  '.de-hud-toggle{display:flex;align-items:center;justify-content:center;width:var(--de-toggle-size);height:var(--de-toggle-size);border:1px solid var(--d-chrome-border);border-radius:var(--d-radius);background:var(--d-chrome-hover);cursor:pointer;color:var(--d-chrome-muted);transition:color var(--d-duration-fast) ease,border-color var(--d-duration-fast) ease}',
  '.de-hud-toggle:hover{color:var(--d-chrome-fg);border-color:var(--d-chrome-fg)}',

  // ── Reduced motion ──
  '@media(prefers-reduced-motion:reduce){.de-content-enter,.de-search-entering{opacity:1!important;transform:none!important}.de-search-box{animation:none!important}.de-search-item{transition:none!important}}',
].join('');
