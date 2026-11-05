import {
  Activity, ArrowDown, ArrowRight, ArrowUpRight, Bookmark, Bot, Check,
  CircleCheck, Copy, Ellipsis, FileCheck2, FileCode2, Flag, GitBranch,
  History, Link2, MessageSquare, MessagesSquare, PanelsTopLeft, Plus,
  RotateCcw, Route, ScanSearch, Send, SquareTerminal, Undo2,
} from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import FluxBrand from './FluxBrand';

const installUrl = 'https://github.com/decantr-ai/flux/blob/main/docs/INSTALL.md';
const setupPrompt = 'Follow docs/INSTALL.md in my local Flux checkout. Build and install Flux, verify and connect only this project and Codex chat, add the project skill, and give me the dashboard URL. Record our agreed focus and plan with the installed helper, then keep checkpoints current as work changes.';
const moments = ['Working now', 'A detour', 'Check why', 'Back on plan', 'Catch up'];
const captions = [
  '“Thinking” becomes something you can actually follow.',
  'A useful-sounding detour can still leave your request unfinished.',
  'Compare the work with the request before changing direction.',
  'Your reviewed direction brings the work back to measurable criteria.',
  'Come back to the outcome, the detour and the work left for later.',
];
const nextLabels = ['See the detour', 'Check why', 'Review the return', 'Catch me up', 'Replay the story'];
type Client = 'codex' | 'terminal' | 'claude';

function PlanMap({ mode, onSelect }: { mode: 'working' | 'detour' | 'done'; onSelect: (step: number) => void }) {
  const detour = mode === 'detour';
  const done = mode === 'done';
  return <>
    <div className="plan-caption"><Route aria-hidden="true" />Agreed plan{detour && ' · account work is outside this scope'}</div>
    <div className={`plan-map ${detour ? '' : 'straight'}`}>
      <svg className="plan-lines" viewBox={`0 0 400 ${detour ? 122 : 74}`} preserveAspectRatio="none" aria-hidden="true">
        <path d="M56 22 H344" stroke="#554859" />
        {detour ? <path d="M56 22 C113 22 118 91 228 91" stroke="#ffb54c" /> : <path d={`M56 22 H${done ? 344 : 160}`} stroke="#ff8caf" />}
      </svg>
      <button type="button" className="plan-node done" onClick={() => onSelect(0)} aria-label="Show the original save-favorites work">Save a product</button>
      <button type="button" className={`plan-node ${done ? 'done' : ''}`} onClick={() => onSelect(done ? 3 : 0)} aria-label="Show the refresh criterion">Keep on refresh</button>
      <button type="button" className={`plan-node ${done ? 'done' : ''}`} onClick={() => onSelect(3)} aria-label="Show the illustrative verification outcome">Verify</button>
      {detour && <button type="button" className="plan-node branch" onClick={() => onSelect(1)}><GitBranch aria-hidden="true" />Account system · not requested</button>}
    </div>
  </>;
}

function HumanMessage({ children }: { children: ReactNode }) {
  return <div className="message human-message"><span className="message-label">You</span>{children}</div>;
}

function AgentMessage({ client, children, activity }: { client: Client; children: ReactNode; activity?: string }) {
  return <div className="message agent-message">
    <span className="message-label"><Bot aria-hidden="true" />{client === 'claude' ? 'Claude' : client === 'terminal' ? 'Agent in your terminal' : 'Codex'}</span>
    {children}
    {activity && <div className="activity-row"><FileCode2 aria-hidden="true" />{activity}</div>}
  </div>;
}

function FluxWalkthrough() {
  const [step, setStep] = useState(() => new URLSearchParams(location.search).get('moment') === 'detour' ? 1 : 0);
  const [client, setClient] = useState<Client>('codex');
  const [review, setReview] = useState(false);
  const [userChange, setUserChange] = useState(false);
  const focusNext = useRef(false);
  const companionHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusNext.current) {
      companionHeading.current?.focus({ preventScroll: true });
      focusNext.current = false;
    }
  }, [step, review, userChange]);

  function selectStep(next: number, focus = false) {
    focusNext.current = focus;
    setStep(next);
    setReview(false);
    setUserChange(false);
  }
  function openReview() {
    focusNext.current = true;
    setReview(true);
    setUserChange(false);
  }
  function changeBranch(next: boolean) {
    focusNext.current = true;
    setUserChange(next);
    setReview(false);
  }

  const original = <HumanMessage>Add saved favorites. Keep them after a refresh. <strong>No account required.</strong></HumanMessage>;
  let chat: ReactNode;
  let companion: ReactNode;
  let heading: string;
  let status: string;
  let stateLabel: ReactNode;
  let tone = '';

  if (step === 0) {
    chat = <>{original}<AgentMessage client={client} activity="Editing favorites.ts">I’m adding the save button and browser storage. Then I’ll check that favorites survive a refresh.</AgentMessage></>;
    stateLabel = <><Activity aria-hidden="true" />Working now</>;
    heading = 'Adding saved favorites.';
    companion = <><dl className="reason-next"><dt>Why</dt><dd>Let visitors keep products without signing in.</dd><dt>Next</dt><dd>Verify favorites survive a page refresh.</dd></dl><PlanMap mode="working" onSelect={selectStep} /><div className="receipt"><Link2 aria-hidden="true" />Your request + the agent’s latest checkpoint</div></>;
    status = 'Working on saved favorites';
  } else if (step === 1) {
    chat = <>{original}<AgentMessage client={client} activity="Editing auth-provider.ts">To make this more robust, I’m adding <em>account sign-in and cross-device sync</em> before finishing favorites.</AgentMessage></>;
    stateLabel = <><GitBranch aria-hidden="true" />Plan and current work differ</>;
    tone = 'orange';
    heading = 'Why an account system?';
    companion = <><dl className="reason-next"><dt>Now</dt><dd>Building sign-in and account sync.</dd><dt>Open</dt><dd>Favorites still need the refresh check.</dd></dl><PlanMap mode="detour" onSelect={selectStep} /><button type="button" className="rose-button" onClick={() => selectStep(2, true)}><ScanSearch aria-hidden="true" />Check this detour</button><p className="action-context">Proposed scope comparison · read-only illustration</p></>;
    status = 'Hardening account infrastructure';
  } else if (step === 2 && userChange) {
    chat = <><HumanMessage>Actually, add accounts so favorites sync across devices.</HumanMessage><AgentMessage client={client}>That changes the original scope. I’ll update the plan and keep the unfinished refresh check visible.</AgentMessage></>;
    stateLabel = <><MessageSquare aria-hidden="true" />Direction changed by you</>;
    heading = 'A new plan. An explicit reason.';
    companion = <><div className="evidence-pair"><div><span>Original request</span>Favorites with no account.</div><div><span>Your later instruction</span>Add accounts for cross-device sync.</div></div><p className="review-note">The later instruction takes precedence. Flux should preserve the change and unfinished work, not pull the agent back to an obsolete plan.</p><button type="button" className="rose-button" onClick={() => changeBranch(false)}>Return to the unrequested detour</button></>;
    status = 'Updating the plan to reflect your request';
  } else if (step === 2) {
    chat = <>{original}<HumanMessage>Why are we building accounts? Where are we against the original plan?</HumanMessage><AgentMessage client={client}>Accounts aren’t needed for the agreed browser-only favorites. I found no later instruction approving that expansion. The refresh check remains unfinished.</AgentMessage></>;
    stateLabel = review ? <><Send aria-hidden="true" />Review direction · example</> : <><ScanSearch aria-hidden="true" />Read-only scope check</>;
    tone = review ? '' : 'orange';
    heading = review ? 'Bring the work back.' : 'The detour isn’t required.';
    companion = review ? <>
      <div className="review-note"><strong>Example message to {client === 'claude' ? 'Claude' : 'your agent'}</strong>Pause the account work. Finish browser-only favorites without sign-in, then verify save, refresh and removal against the original plan.</div>
      <dl className="reason-next"><dt>Keep</dt><dd>The original request and completion criteria.</dd><dt>Later</dt><dd>Account sync remains an idea.</dd></dl>
      <button type="button" className="rose-button spaced-action" onClick={() => selectStep(3, true)}><Send aria-hidden="true" />Simulate sending this direction</button>
      <p className="action-context">Changes this example only. Nothing is sent.</p>
      <button type="button" className="quiet-button" onClick={() => { focusNext.current = true; setReview(false); }}>Back to the comparison</button>
    </> : <>
      <div className="evidence-pair"><div><span>Your original request</span>Save favorites. Keep after refresh. No account.</div><div><span>Agent checkpoint</span>Introduce sign-in and cross-device sync.</div></div>
      <dl className="reason-next"><dt>Gap</dt><dd>No later approval found in the selected records.</dd><dt>Next</dt><dd>Review a return to browser-only favorites.</dd></dl>
      <button type="button" className="rose-button spaced-action" onClick={openReview}><Undo2 aria-hidden="true" />Review a return to the plan</button>
      <button type="button" className="quiet-button" onClick={() => changeBranch(true)}>What if I asked for accounts?</button>
    </>;
    status = review ? 'Waiting for your reviewed direction' : 'Explaining the detour';
  } else if (step === 3) {
    chat = <><HumanMessage>Pause account work. Finish favorites without sign-in and verify the original criteria.</HumanMessage><AgentMessage client={client} activity="Illustrative checks: 3 passed">I’ve returned to browser-only favorites. Save, persistence after refresh, and removal now pass the checks. Account sync is left for later.</AgentMessage></>;
    stateLabel = <><CircleCheck aria-hidden="true" />Original criteria checked · example</>;
    tone = 'green';
    heading = 'Back to what you asked for.';
    companion = <><PlanMap mode="done" onSelect={selectStep} /><ul className="criteria"><li><Check aria-hidden="true" />Save a favorite without signing in</li><li><Check aria-hidden="true" />Keep it after a refresh</li><li><Check aria-hidden="true" />Remove it from saved favorites</li></ul><div className="receipt"><FileCheck2 aria-hidden="true" />Example check results · linked to the original request</div><button type="button" className="quiet-button" onClick={() => selectStep(4, true)}><History aria-hidden="true" />See what you’d return to tomorrow</button></>;
    status = 'Finished the agreed work in this example';
  } else {
    chat = <><HumanMessage>Catch me up. What changed while I was away?</HumanMessage><AgentMessage client={client}>Favorites are complete against the original criteria. I briefly expanded into accounts; you redirected me. Account sync is parked, not part of the completed work.</AgentMessage></>;
    stateLabel = <><History aria-hidden="true" />Since your last checkpoint</>;
    heading = 'The useful version of the story.';
    companion = <><div className="catchup-list"><div><CircleCheck aria-hidden="true" /><p><strong>Done</strong><span>Save, refresh and remove favorites. No account.</span></p></div><div><GitBranch aria-hidden="true" /><p><strong>Changed course</strong><span>Account work paused after your direction.</span></p></div><div><Bookmark aria-hidden="true" /><p><strong>Still for later</strong><span>Cross-device sync. Suggested, not approved.</span></p></div><div><Flag aria-hidden="true" /><p><strong>Next</strong><span>Try the favorites flow and decide whether to accept it.</span></p></div></div><div className="receipt"><Link2 aria-hidden="true" />Request → checkpoint → decision → checks</div></>;
    status = 'Ready for your review';
  }

  return <section className="walkthrough" id="walkthrough" aria-labelledby="story-title">
    <div className="story-heading"><div><span className="small-label">Interactive illustration · proposed scope-check experience</span><h2 id="story-title">Add saved favorites to a shop.</h2></div><span className="story-length">Five moments. One original plan.</span></div>
    <div className="chapters" role="group" aria-label="Story moment">{moments.map((moment, index) => <button key={moment} type="button" aria-pressed={step === index} aria-controls="flux-example" onClick={() => selectStep(index)}><span>{index + 1}</span>{moment}</button>)}</div>
    <div className="workspace" id="flux-example">
      <div className="workspace-bar"><div className="workspace-caption"><PanelsTopLeft aria-hidden="true" /><span>Your work, side by side</span></div><label className="client-picker">View as<select aria-label="Illustrative client" value={client} onChange={(e) => setClient(e.target.value as Client)}><option value="codex">Codex</option><option value="terminal">Terminal</option><option value="claude">Claude · proposed</option></select></label></div>
      <div className="work-columns">
        <section className={`chat-pane ${client === 'terminal' ? 'terminal-pane' : ''}`} aria-label="Illustrative agent conversation"><div className="pane-heading"><span className="client-name"><SquareTerminal aria-hidden="true" /><strong>{client === 'claude' ? 'Claude' : client === 'terminal' ? 'Terminal' : 'Codex'}</strong></span><span>Shop project</span></div><div className="chat-content">{chat}</div><div className="chat-bottom"><span>{status}</span><Ellipsis aria-hidden="true" /></div></section>
        <section className="flux-pane" aria-label="Illustrative Flux companion"><div className="pane-heading"><FluxBrand compact /><span className="sample-status"><span />Example record</span></div><div className="companion-content" aria-live="polite" aria-atomic="true"><span className={`work-state ${tone}`}>{stateLabel}</span><h3 ref={companionHeading} tabIndex={-1}>{heading}</h3>{companion}</div></section>
      </div>
      <div className="workspace-foot"><span>Scripted example · no live chat is connected or changed</span><span>{client === 'claude' ? 'Claude connection · proposed' : client === 'terminal' ? 'Browser beside your terminal' : 'Shown beside Codex'}</span></div>
    </div>
    <div className="story-footer"><div><span className="moment-count">0{step + 1} / 05</span><p>{captions[step]}</p></div><button type="button" className="primary" onClick={() => step === 2 && !review ? openReview() : selectStep((step + 1) % 5)}>{step === 2 && review ? 'See the reviewed result' : nextLabels[step]}{step === 4 ? <RotateCcw aria-hidden="true" /> : <ArrowRight aria-hidden="true" />}</button></div>
  </section>;
}

function SetupSteps() {
  const [copyStatus, setCopyStatus] = useState('');
  async function copyPrompt() {
    try { await navigator.clipboard.writeText(setupPrompt); setCopyStatus('Prompt copied.'); }
    catch { setCopyStatus('Select the prompt text to copy it.'); }
  }
  return <section className="setup-section" id="setup" aria-labelledby="setup-title">
    <div className="setup-heading"><h2 id="setup-title">Add a companion.<br />Keep your workflow.</h2><p>A project skill and a browser view.<br />Your agent still does the work.</p></div>
    <ol className="setup-steps">
      <li><div className="setup-art" aria-hidden="true"><div className="skill-tile"><img src="/flux-logo.png" width="24" height="24" alt="" /><span>Flux skill</span><Plus /></div><span className="art-sub">Your project</span></div><div className="setup-title"><span aria-hidden="true">1</span><h3>Add Flux</h3></div><p>Build the local preview and install its project skill.</p></li>
      <li><div className="setup-art" aria-hidden="true"><div className="connect-mini"><MessagesSquare /><span className="connector" /><strong>Flux</strong></div><span className="art-sub">One selected chat</span></div><div className="setup-title"><span aria-hidden="true">2</span><h3>Connect your chat</h3></div><p>Choose the exact chat you want to follow.</p></li>
      <li><div className="setup-art" aria-hidden="true"><div className="split-mini"><div><SquareTerminal /><span /><span /></div><div><strong>Flux</strong><span /><span /></div></div><span className="art-sub">Chat + companion</span></div><div className="setup-title"><span aria-hidden="true">3</span><h3>Work side by side</h3></div><p>Open the local URL in split view or beside your terminal.</p></li>
    </ol>
    <div className="setup-bottom"><a className="primary" href={installUrl} target="_blank" rel="noreferrer">Install the local preview <ArrowUpRight aria-hidden="true" /></a><p>Source installation today · macOS tested · Node.js 22+<br />One-step installation and Claude support are proposed.</p></div>
    <details className="setup-details"><summary>Ask Codex to set it up <Plus aria-hidden="true" /></summary><p>After cloning the Flux repository, paste this into the Codex chat you want to follow:</p><blockquote>{setupPrompt}</blockquote><button type="button" className="outline-button" onClick={copyPrompt}><Copy aria-hidden="true" />Copy setup prompt</button><p role="status">{copyStatus}</p><p>The agent verifies the project, chat ID and matching transcript. <code>flux open</code> opens the system browser; paste its URL into a Codex desktop tab and choose <strong>Enter split view</strong>, or place a browser beside your CLI. Capture records activity; the agent uses the skill to keep plans current.</p></details>
  </section>;
}

export default function FluxPage() {
  useEffect(() => {
    const target = location.hash.slice(1);
    if (target === 'walkthrough' || target === 'setup') {
      const frame = requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView());
      return () => cancelAnimationFrame(frame);
    }
  }, []);
  return <div className="flux-product flux-landing"><div className="product-page">
    <a className="flux-skip" href="#flux-content">Skip to Flux</a>
    <header className="site-nav"><a className="decantr-word" href="/" aria-label="Decantr home">decantr<span>.</span></a><span className="nav-product"><FluxBrand compact /></span><nav aria-label="Flux navigation"><a href="#walkthrough">See it work</a><a href="https://github.com/decantr-ai/flux" target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" /></a><a className="nav-setup" href="#setup">Set up Flux <Plus aria-hidden="true" /></a></nav></header>
    <main id="flux-content">
      <section className="hero" aria-labelledby="flux-title"><div><FluxBrand /><h1 id="flux-title">Follow the work.<br />Keep the plot.</h1></div><div className="hero-intro"><p>A companion beside your AI chat.<br /> See what’s happening, understand the detours, and bring the work back to your plan.</p><a className="text-button" href="#walkthrough">Try the story below <ArrowDown aria-hidden="true" /></a></div></section>
      <FluxWalkthrough />
      <section className="availability" aria-label="Available and proposed capabilities"><div><span className="availability-label"><Check aria-hidden="true" />In the Codex local preview</span><p>Activity capture, agent-recorded plans and checkpoints, and reviewed questions.</p></div><div><span className="availability-label proposed"><GitBranch aria-hidden="true" />Proposed</span><p>The visual scope-check workflow above, Claude integration and simpler installation.</p></div><p className="availability-note">Flux helps you inspect and redirect work. It does not autonomously enforce a plan or read hidden reasoning.</p></section>
      <SetupSteps />
    </main>
    <footer className="page-foot"><a href="/">Flux by Decantr</a><p>A separate local companion. The walkthrough is a fictional example, not a recorded run or evidence of automatic drift detection.</p><a href="https://github.com/decantr-ai/flux" target="_blank" rel="noreferrer">Source <ArrowUpRight aria-hidden="true" /></a></footer>
  </div></div>;
}
