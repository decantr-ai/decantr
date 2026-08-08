"use client";

import { ArrowRight, ArrowUpRight, BadgeCheck, Bot, Braces, Check, ChevronLeft, ChevronRight, Code2, Component, Copy, Eye, FileCheck2, FolderLock, GitBranch, GitCompareArrows, GitFork, Layers3, LockKeyhole, MousePointerClick, OctagonAlert, Palette, Pause, Play, ScanSearch, ShoppingBag, Star, Terminal, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";

const command = "npx @decantr/cli verify";

function XMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817-5.966 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" /></svg>;
}

function DiscordMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.34A16.7 16.7 0 0 0 15.44 4l-.5 1.02a15.4 15.4 0 0 0-5.86 0L8.56 4a16.5 16.5 0 0 0-4.1 1.34C1.87 9.16 1.17 12.9 1.52 16.6a16.8 16.8 0 0 0 5.03 2.53l1.23-1.67a10.8 10.8 0 0 1-1.93-.93l.47-.36c3.72 1.72 7.75 1.72 11.43 0l.48.36c-.62.37-1.27.68-1.94.93l1.23 1.67a16.7 16.7 0 0 0 5.02-2.53c.42-4.3-.72-8-3-11.26ZM8.52 14.35c-1.12 0-2.04-1.03-2.04-2.3 0-1.26.9-2.3 2.04-2.3 1.14 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Zm6.96 0c-1.12 0-2.04-1.03-2.04-2.3 0-1.26.9-2.3 2.04-2.3 1.14 0 2.06 1.04 2.04 2.3 0 1.27-.9 2.3-2.04 2.3Z" /></svg>;
}

function GitHubMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .7A11.3 11.3 0 0 0 8.43 22.72c.57.1.78-.25.78-.55v-2.18c-3.18.69-3.85-1.35-3.85-1.35-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.09 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.54-.29-5.21-1.27-5.21-5.65 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.02 0 0 .96-.31 3.12 1.17A10.9 10.9 0 0 1 12 6.01c.96 0 1.93.13 2.83.38 2.16-1.48 3.12-1.17 3.12-1.17.62 1.57.23 2.73.11 3.02.73.8 1.18 1.82 1.18 3.07 0 4.39-2.68 5.36-5.23 5.64.41.36.78 1.06.78 2.14v3.08c0 .3.21.66.79.55A11.3 11.3 0 0 0 12 .7Z" /></svg>;
}

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [stars, setStars] = useState('6');
  const [storyStep, setStoryStep] = useState(0);
  const [driftStep, setDriftStep] = useState(0);
  const [scopeStep, setScopeStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoverPaused, setHoverPaused] = useState(false);

  useEffect(() => {
    fetch('/stats.json')
      .then((response) => response.ok ? response.json() : null)
      .then((stats) => {
        if (typeof stats?.stars === 'number') setStars(String(stats.stars));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAutoPlay(false);
      return;
    }
    if (!autoPlay || hoverPaused) return;

    const timer = window.setTimeout(() => {
      setStoryStep((current) => (current + 1) % 3);
    }, storyStep === 2 ? 7600 : 5400);

    return () => window.clearTimeout(timer);
  }, [autoPlay, hoverPaused, storyStep]);

  async function copyCommand() {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const scopeItems = [
    { title: "Reuse", label: "The change skipped your shared Button.", body: "It built a new button from scratch instead.", source: "components/Button.tsx", Icon: Component },
    { title: "Styling", label: "The change invented new styling.", body: "It used a raw color and radius instead of the values your app already shares.", source: "styles/tokens.css", Icon: Palette },
    { title: "Behavior", label: "The change skipped shared checkout behavior.", body: "It wired a local click handler instead of the interaction your checkout already uses.", source: "hooks/useCheckout.ts", Icon: MousePointerClick },
    { title: "Boundaries", label: "The route started owning a shared decision.", body: "Button authority belongs in shared component source—not inside one checkout route.", source: "components/Button.tsx", Icon: FolderLock },
  ];
  const activeScope = scopeItems[scopeStep];
  const ActiveScopeIcon = activeScope.Icon;

  return (
    <>
    <main>
      <a className="skip-link" href="#hero-copy">Skip to the main message</a>

      <header className="site-header" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Decantr home">
          <span>decantr<span>.</span>ai</span>
        </a>

        <nav className="primary-links" aria-label="Page sections">
          <a href="#drift"><span>01</span>Why Decantr</a>
          <a href="#try"><span>02</span>Try it</a>
          <a href="#scope"><span>03</span>What it checks</a>
        </nav>

        <nav className="header-utilities" aria-label="Decantr links">
          <a className="source-link" href="https://github.com/decantr-ai/decantr" target="_blank" rel="noreferrer" aria-label="Star Decantr on GitHub">
            <GitHubMark />
            <span>GitHub</span>
            <span className="star-count"><Star className="star-mark" aria-hidden="true" size={13} /><span data-stat="stars">{stars}</span></span>
          </a>
          <a className="social-link" href="https://x.com/decantrai" target="_blank" rel="noreferrer" aria-label="Decantr on X" title="Decantr on X"><XMark /></a>
          <a className="social-link" href="https://discord.gg/NPbXFyqY6" target="_blank" rel="noreferrer" aria-label="Join Decantr on Discord" title="Join Decantr on Discord"><DiscordMark /></a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <img className="hero-watermark" src="/logo.svg" alt="" aria-hidden="true" />
        <div className="hero-copy" id="hero-copy">
          <h1 id="hero-title">
            Your AI is building
            <span>a second design system.</span>
          </h1>

          <div className="resolution">
            <div className="resolution-line" aria-hidden="true" />
            <p>
              <strong>Decantr helps AI build within the system you already have.</strong> It
              points coding agents to your existing components, styles, interaction
              patterns, and source boundaries—then checks the result.
            </p>
          </div>

          <div className="actions">
            <button className="command" onClick={copyCommand} type="button">
              <Terminal aria-hidden="true" size={18} />
              <code>{command}</code>
              <span className="copy-state" aria-live="polite">
                {copied ? <Check aria-hidden="true" size={18} /> : <Copy aria-hidden="true" size={18} />}
                {copied ? "Copied" : "Copy"}
              </span>
            </button>

            <a className="watch" href="#change">
              <Play aria-hidden="true" size={15} fill="currentColor" />
              Watch the change resolve
            </a>
          </div>

        </div>

        <div
          className={`authority-field story-step-${storyStep} ${autoPlay && !hoverPaused ? "is-playing" : "is-paused"}`}
          id="change"
          aria-label="Interactive illustration of a UI change resolving to project authority"
          onMouseEnter={() => setHoverPaused(true)}
          onMouseLeave={() => setHoverPaused(false)}
        >
          <div className="field-label field-label-top">
            <span>Changed file</span>
            <span>src/routes/Checkout.tsx</span>
          </div>

          <button
            className="auto-toggle"
            type="button"
            onClick={() => setAutoPlay((playing) => !playing)}
            aria-label={autoPlay ? "Pause change story" : "Play change story"}
          >
            {autoPlay ? <Pause aria-hidden="true" size={13} /> : <Play aria-hidden="true" size={13} fill="currentColor" />}
            {autoPlay ? "Pause" : "Play"}
          </button>

          <button
            className="story-arrow story-arrow-prev"
            type="button"
            aria-label="Previous change step"
            onClick={() => { setAutoPlay(false); setStoryStep((storyStep + 2) % 3); }}
          >
            <ChevronLeft aria-hidden="true" size={21} />
          </button>

          <button
            className="story-arrow story-arrow-next"
            type="button"
            aria-label="Next change step"
            onClick={() => { setAutoPlay(false); setStoryStep((storyStep + 1) % 3); }}
          >
            <ChevronRight aria-hidden="true" size={21} />
          </button>

          <div className={`change-story step-${storyStep}`} aria-live="polite">
            <div className="story-heading">
              <span className="story-number">0{storyStep + 1}</span>
              <div>
                <small className="story-state">
                  {storyStep === 0 ? "Drift introduced" : storyStep === 1 ? "Authority found" : "Recheck passed"}
                </small>
                {storyStep === 0 && (
                  <h3>The AI adds a new button.<span>Your app <em>already has one.</em></span></h3>
                )}
                {storyStep === 1 && (
                  <h3>Decantr checks the changed file.<span>It finds the component the AI should have reused.</span></h3>
                )}
                {storyStep === 2 && (
                  <h3>The agent applies the repair.<span>Decantr confirms the button drift is resolved.</span></h3>
                )}
              </div>
            </div>

            <div className="visual-preview">
              <div className="preview-heading">
                <span className="preview-icon"><ShoppingBag aria-hidden="true" size={17} /></span>
                <span><strong>Review order</strong><small>2 items · $128.00</small></span>
              </div>

              <div className="preview-actions">
                {storyStep === 0 && (
                  <div className="pattern-comparison">
                    <div>
                      <small>Existing app button</small>
                      <button className="canonical-button" type="button" tabIndex={-1}>Continue</button>
                    </div>
                    <div>
                      <small className="warning-label"><TriangleAlert aria-hidden="true" size={12} />Button the AI added</small>
                      <button className="invented-button" type="button" tabIndex={-1}>Confirm order</button>
                    </div>
                  </div>
                )}
                {storyStep === 1 && (
                  <div className="authority-comparison">
                    <div>
                      <small>Button the AI added</small>
                      <button className="invented-button" type="button" tabIndex={-1}>Confirm order</button>
                    </div>
                    <span className="comparison-arrow" aria-hidden="true"><ArrowRight size={18} /></span>
                    <div>
                      <small>Button already in your app</small>
                      <button className="canonical-button" type="button" tabIndex={-1}>Confirm order</button>
                    </div>
                  </div>
                )}
                {storyStep === 2 && (
                  <div className="successful-preview">
                    <button className="canonical-button" type="button" tabIndex={-1}>
                      <Check aria-hidden="true" size={16} /> Confirm order
                    </button>
                    <div className="success-outcome">
                      <BadgeCheck aria-hidden="true" size={27} />
                      <span><small>Decantr recheck</small><strong>Button drift resolved</strong></span>
                      <b>Passed</b>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {storyStep === 0 && (
              <div className="story-code" aria-label="AI-added source excerpt">
                <span className="line-number">42</span>
                <code>&lt;<mark>button</mark> className=&quot;rounded-[13px] bg-[#f04c81]&quot;&gt;</code>
              </div>
            )}

            {storyStep === 1 && (
              <div className="code-compare" aria-label="Comparison between the changed code and existing project component">
                <div>
                  <small>Changed file</small>
                  <code>&lt;<mark>button</mark> className=&quot;...&quot;&gt;</code>
                </div>
                <span className="code-connector" aria-hidden="true">→</span>
                <div>
                  <small>Existing component</small>
                  <code>import &#123; <mark>Button</mark> &#125; from &quot;@/ui/Button&quot;</code>
                </div>
              </div>
            )}

            {storyStep === 2 && (
              <div className="repair-diff" aria-label="Repaired source diff">
                <code><span>− &lt;button className=&quot;...&quot;&gt;</span><span>+ &lt;Button variant=&quot;primary&quot;&gt;</span></code>
              </div>
            )}

            <div className="source-note">
              <GitBranch aria-hidden="true" size={14} />
              {storyStep === 0 ? "New styling, raw color, native element" : storyStep === 1 ? "Matched to packages/ui/src/Button.tsx" : "Only the changed line is repaired"}
            </div>
          </div>

          <div className="story-controls" aria-label="Change story steps">
            {["Drift introduced", "Authority found", "Recheck passed"].map((label, index) => (
              <button
                className={storyStep === index ? "active" : ""}
                key={label}
                onClick={() => { setAutoPlay(false); setStoryStep(index); }}
                type="button"
                aria-pressed={storyStep === index}
              >
                <span>0{index + 1}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

      </section>

      <section className="drift-section" id="drift" aria-labelledby="drift-title">
        <div className="drift-copy">
          <h2 id="drift-title">Drift rarely arrives looking broken.</h2>
          <p className="drift-lede">
            It arrives as a reasonable one-off. Then the next agent copies it, and your app
            starts treating an accident like a standard.
          </p>

          <div className="drift-steps" aria-label="How frontend drift compounds">
            {[
              ["One-off", "A local button ships beside the component your app already uses."],
              ["Reused", "The next AI edit treats that new button as precedent."],
              ["Compounded", "One inconsistency becomes several decisions the team must reconcile."],
            ].map(([title, body], index) => (
              <button
                className={driftStep === index ? "active" : ""}
                type="button"
                key={title}
                aria-pressed={driftStep === index}
                onClick={() => setDriftStep(index)}
              >
                <span className="drift-step-marker">
                  0{index + 1}
                  {index === 0 ? <TriangleAlert aria-hidden="true" size={13} /> : index === 1 ? <Copy aria-hidden="true" size={13} /> : <GitFork aria-hidden="true" size={13} />}
                </span>
                <span><strong>{title}</strong><small>{body}</small></span>
              </button>
            ))}
          </div>
        </div>

        <div className={`drift-stage drift-stage-${driftStep}`} aria-live="polite">
          <div className="stage-meta">
            <span>Illustrative product surface</span>
            <span>{driftStep === 0 ? "1 local deviation" : driftStep === 1 ? "3 surfaces now reference it" : "5 conflicting decisions"}</span>
          </div>

          <div className="product-shell">
            <aside aria-label="Example application navigation">
              <span className="shell-brand">NORTH/</span>
              <span className="nav-line active" />
              <span className="nav-line" />
              <span className="nav-line short" />
            </aside>

            <div className="product-main">
              {driftStep === 2 && (
                <div className="drift-journey">
                  <div className="journey-start">
                    <small>Where you started</small>
                    <strong>One shared decision</strong>
                    <button className="system-action" type="button" tabIndex={-1}>Continue</button>
                    <code>Button.tsx</code>
                  </div>
                  <div className="journey-diverge" aria-hidden="true">
                    <ArrowRight size={18} />
                    <GitFork size={22} />
                  </div>
                  <div className="journey-now">
                    <small>Where you are now</small>
                    <strong>Five different answers</strong>
                    <div className="compounded-row">
                      <button data-variant="01" className="system-action" type="button" tabIndex={-1}>Open</button>
                      <button data-variant="02" className="rogue-action" type="button" tabIndex={-1}>Create</button>
                      <button data-variant="03" type="button" tabIndex={-1}>Save</button>
                      <button data-variant="04" type="button" tabIndex={-1}>Publish</button>
                      <button data-variant="05" type="button" tabIndex={-1}>Continue</button>
                    </div>
                    <span>Same purpose. Different component, color, shape, and behavior.</span>
                  </div>
                </div>
              )}

              {driftStep < 2 && (
                <>
                  <div className="product-heading">
                    <span><strong>Workspace</strong><small>Manage your active projects</small></span>
                    <button className="system-action" type="button" tabIndex={-1}>New project</button>
                  </div>

                  <div className="product-lines" aria-hidden="true">
                    <span /><span /><span />
                  </div>

                  <div className="surface-actions">
                    <div>
                      <small>Project row</small>
                      <button className="system-action" type="button" tabIndex={-1}>Open</button>
                    </div>
                    <div className="deviated">
                      <small>Quick action</small>
                      <button className="rogue-action" type="button" tabIndex={-1}>Create</button>
                    </div>
                    {driftStep >= 1 && (
                      <div className="copied-action">
                        <small>Empty state</small>
                        <button className="rogue-action" type="button" tabIndex={-1}>Add first</button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {driftStep < 2 && (
              <div className={`cascade-flow ${driftStep === 0 ? "two-stage" : "three-stage"}`}>
                <div className="cascade-node original-node">
                  <BadgeCheck aria-hidden="true" size={20} />
                  <span><small>Original</small><strong>Your app uses one shared Button.</strong><code>Button.tsx</code></span>
                </div>
                <ArrowRight className="cascade-arrow" aria-hidden="true" size={18} />
                <div className="cascade-node warning-node">
                  <TriangleAlert aria-hidden="true" size={20} />
                  <span><small>First drift</small><strong>AI creates a different button.</strong><code>QuickCreate.tsx</code></span>
                </div>
                {driftStep === 1 && (
                  <>
                    <ArrowRight className="cascade-arrow danger-arrow" aria-hidden="true" size={18} />
                    <div className="cascade-node danger-node">
                      <OctagonAlert aria-hidden="true" size={20} />
                      <span><small>Second drift</small><strong>The next AI copies the wrong one.</strong><code>EmptyProjects.tsx</code></span>
                    </div>
                  </>
                )}
              </div>
            )}

            {driftStep === 2 && (
              <div className="drift-evidence impact">
                <OctagonAlert aria-hidden="true" size={19} />
                <span><strong>STOP.</strong> One action is now <em>5 UI variants.</em></span>
              </div>
            )}
          </div>

          {driftStep === 2 && (
            <div className="drift-reckoning">
              <span aria-hidden="true">↳</span>
              <p>Your design system may already be drifting<br />without looking broken.</p>
              <small>Each change looked reasonable on its own. Together, they created five answers to the same product decision.</small>
            </div>
          )}
        </div>
      </section>

      <section className="try-section" id="try" aria-labelledby="try-title">
        <div className="try-intro">
          <h2 id="try-title">Run it on the change you already made.</h2>
          <p>
            No migration ceremony. Decantr reads the current Git change, checks the UI files it can prove are in scope, and returns a small set of source-linked findings.
          </p>

          <button className="try-command" type="button" onClick={copyCommand} aria-label={`${command}. Copy command`}>
            <Terminal aria-hidden="true" size={17} />
            <code>{command}</code>
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>

        <div className="verify-proof" aria-label="Illustrative Decantr verification result">
          <div className="proof-topline">
            <span><Terminal aria-hidden="true" size={14} /> decantr verify</span>
            <span>current change</span>
          </div>

          <div className="proof-scope">
            <span className="scope-check"><Check aria-hidden="true" size={15} /></span>
            <span><small>UI app selected</small><strong>apps/web</strong></span>
            <span><small>Changed surface</small><strong>Checkout</strong></span>
          </div>

          <div className="proof-finding">
            <span className="finding-index">01</span>
            <div>
              <span className="finding-label"><TriangleAlert aria-hidden="true" size={14} /> Reuse existing authority</span>
              <strong>This change creates a new button beside the project&apos;s shared Button component.</strong>
              <code>src/routes/Checkout.tsx:42</code>
            </div>
          </div>

          <div className="proof-authority">
            <ArrowRight aria-hidden="true" size={15} />
            <span><small>Project authority found</small><code>src/components/Button.tsx</code></span>
          </div>

          <div className="proof-footer">
            <span>1 consequential finding</span>
            <span>0 files written</span>
          </div>
        </div>

        <div className="try-assurances" aria-label="What happens when Decantr verifies a change">
          <div><Eye aria-hidden="true" size={20} /><span><strong>Reads the current change</strong><small>Staged, unstaged, untracked, renamed, and deleted files.</small></span></div>
          <div><LockKeyhole aria-hidden="true" size={20} /><span><strong>Writes nothing by default</strong><small>Your source and project configuration stay untouched.</small></span></div>
          <div><FileCheck2 aria-hidden="true" size={20} /><span><strong>Returns bounded evidence</strong><small>At most three consequential, source-anchored findings.</small></span></div>
        </div>
      </section>

      <section className="fit-section" id="fit" aria-labelledby="fit-title">
        <div className="fit-heading">
          <span className="section-kicker">Designed to fit, not replace</span>
          <h2 id="fit-title">Keep your stack.<br /><em>Keep your agent.</em></h2>
          <p>Decantr sits beside the workflow you already use. Your agent writes the code. Your project remains the authority. Decantr helps connect the two—and checks the resulting change.</p>
        </div>

        <div className="workflow-field" aria-label="How Decantr fits into an existing engineering workflow">
          <div className="workflow-line" aria-hidden="true" />

          <div className="workflow-stop agent-stop">
            <span className="stop-index">01</span>
            <Bot aria-hidden="true" size={30} />
            <span><small>Already yours</small><strong>Your coding agent</strong><em>Plans and edits the task.</em></span>
          </div>

          <div className="workflow-connector connector-agent" aria-hidden="true"><span /><ArrowRight size={22} /></div>

          <div className="workflow-stop project-stop">
            <span className="stop-index">02</span>
            <Code2 aria-hidden="true" size={30} />
            <span><small>Still the authority</small><strong>Your existing codebase</strong><em>Components, styles, and source boundaries.</em></span>
          </div>

          <div className="workflow-connector connector-verify" aria-hidden="true"><span /><ArrowRight size={22} /></div>

          <div className="workflow-stop decantr-stop">
            <span className="stop-index">03</span>
            <ScanSearch aria-hidden="true" size={30} />
            <span><small>Decantr&apos;s role</small><strong>Verify the Git change</strong><em>Bounded, source-linked evidence.</em></span>
          </div>
        </div>

        <div className="fit-context" aria-label="Existing project inputs Decantr works alongside">
          <span><Braces aria-hidden="true" size={17} /> Framework structure</span>
          <span><Layers3 aria-hidden="true" size={17} /> Components + styles</span>
          <span><GitCompareArrows aria-hidden="true" size={17} /> Current Git workflow</span>
        </div>

        <p className="fit-boundary"><strong>Not another framework.</strong> Not a component library. Not a code generator.</p>
      </section>

      <section className="scope-section" id="scope" aria-labelledby="scope-title">
        <div className="scope-heading">
          <span className="section-kicker">Beyond the visible symptom</span>
          <h2 id="scope-title">The button was only <em>one symptom.</em></h2>
          <p>Decantr evaluates changed UI against the authority your project can actually prove. Findings stay specific, source-linked, and bounded to the change.</p>
        </div>

        <div className="scope-visual">
          <div className="scope-controls" aria-label="Project authority checks">
            {scopeItems.map((item, index) => (
              <button key={item.title} type="button" className={scopeStep === index ? "active" : ""} aria-pressed={scopeStep === index} onClick={() => setScopeStep(index)}>
                <span>0{index + 1}</span>{item.title}
              </button>
            ))}
          </div>

          <div className="changed-file" aria-label="Illustrative changed UI source file">
            <div className="file-tab"><span>Checkout.tsx</span><small>Changed UI</small></div>
            <div className="code-line muted"><span>38</span><code>export function CheckoutActions() {'{'}</code></div>
            <div className={`code-line marked ${scopeStep === 0 ? "active" : ""}`}><span>39</span><code>+ &lt;<b>button</b></code></div>
            <div className={`code-line marked ${scopeStep === 1 ? "active" : ""}`}><span>40</span><code>+ &nbsp;className=&quot;<b>rounded-[13px] bg-[#f04c81]</b>&quot;</code></div>
            <div className={`code-line marked ${scopeStep === 2 ? "active" : ""}`}><span>41</span><code>+ &nbsp;<b>onClick={'{'}submitOrder{'}'}</b></code></div>
            <div className={`code-line marked ${scopeStep === 3 ? "active" : ""}`}><span>42</span><code>+ &nbsp;data-source=&quot;<b>checkout-local</b>&quot;&gt;</code></div>
            <div className="code-line muted"><span>43</span><code>+ &nbsp;Confirm order</code></div>
            <div className="code-line muted"><span>44</span><code>+ &lt;/button&gt;</code></div>
            <div className="code-line muted"><span>45</span><code>{'}'}</code></div>
          </div>

          <div className="scope-transfer" aria-hidden="true"><ArrowRight size={26} /></div>

          <div className="scope-result" aria-live="polite">
            <span className="result-kicker">What Decantr sees · 0{scopeStep + 1}</span>
            <ActiveScopeIcon aria-hidden="true" size={30} />
            <strong>{activeScope.label}</strong>
            <p>{activeScope.body}</p>
            <div className={`scope-example example-${scopeStep}`} aria-label="Visual comparison of the local change and project authority">
              {scopeStep === 0 && <><span><small>Already in your app</small><button className="approved-button" type="button" tabIndex={-1}>Confirm order</button></span><span className="bypass-arrow"><small>Skipped</small><ArrowRight aria-hidden="true" size={18} /></span><span><small>Added locally instead</small><button className="added-button" type="button" tabIndex={-1}>Confirm order</button></span></>}
              {scopeStep === 1 && <><span><small>Added locally</small><code className="rejected-value">#f04c81 · 13px</code></span><ArrowRight aria-hidden="true" size={18} /><span><small>Already in your app</small><code className="approved-value">accent · radius-md</code></span></>}
              {scopeStep === 2 && <><span><small>Added locally</small><code className="rejected-value">submitOrder()</code></span><ArrowRight aria-hidden="true" size={18} /><span><small>Already in your app</small><code className="approved-value">useCheckout()</code></span></>}
              {scopeStep === 3 && <><span><small>Owned by this route</small><code className="rejected-value">Checkout.tsx</code></span><ArrowRight aria-hidden="true" size={18} /><span><small>Shared authority</small><code className="approved-value">Button.tsx</code></span></>}
            </div>
            <div className="authority-source"><small>Project authority</small><code>{activeScope.source}</code></div>
          </div>

          <div className="scope-conclusion">
            <strong>One small change.</strong>
            <span>Four different ways to drift from the product you already built.</span>
          </div>
        </div>

        <p className="scope-note"><LockKeyhole aria-hidden="true" size={15} /> Decantr reports only what available project evidence supports.</p>
      </section>

      <section className="closing-section" id="start" aria-labelledby="closing-title">
        <div className="closing-copy">
          <span className="section-kicker">Your next UI change</span>
          <h2 id="closing-title">Check the change<br />before it becomes<br /><em>the system.</em></h2>
        </div>

        <div className="closing-action">
          <p>Run Decantr against the UI change already in your working tree. Get a bounded, source-linked result without changing your project.</p>
          <button type="button" className="closing-command" onClick={copyCommand} aria-label={`${command}. Copy command`}>
            <span><Terminal aria-hidden="true" size={18} /><code>{command}</code></span>
            <span>{copied ? <Check aria-hidden="true" size={19} /> : <Copy aria-hidden="true" size={19} />}{copied ? "Copied" : "Copy"}</span>
          </button>
          <a className="source-action" href="https://github.com/decantr-ai/decantr">
            <GitBranch aria-hidden="true" size={19} /> View the source <ArrowUpRight aria-hidden="true" size={16} />
          </a>
        </div>
      </section>
    </main>

    <footer className="site-footer">
      <a className="footer-brand" href="#top" aria-label="Back to Decantr home">
        <span>decantr<span>.</span>ai</span>
      </a>
      <p>AI frontend governance for the codebase you already own.</p>
      <nav aria-label="Footer navigation">
        <a href="#drift">Why Decantr</a>
        <a href="#try">Try it</a>
        <a href="#scope">What it checks</a>
        <a href="https://github.com/decantr-ai/decantr">GitHub <ArrowUpRight aria-hidden="true" size={13} /></a>
      </nav>
    </footer>
    </>
  );
}
