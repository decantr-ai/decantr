import { ArrowDown, ArrowUpRight, CircleHelp, Eye, GitBranch, LockKeyhole, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import overview from "./assets/flux-overview.jpg";
import plan from "./assets/flux-plan.jpg";
import questions from "./assets/flux-questions.jpg";

const views = [
  {
    label: "Overview", image: overview, Icon: Eye,
    title: "Know what’s current.",
    caption: "The recorded focus, its stated reason, and the next step. Follow the work without piecing the whole chat back together.",
    alt: "Flux Overview showing the current checkout review, its reason, and recommended next step in an example project.",
  },
  {
    label: "Plan", image: plan, Icon: GitBranch,
    title: "Keep the plan in view.",
    caption: "Inspect saved checkpoints, follow each step’s recorded status, and return to earlier versions with their context intact.",
    alt: "Flux Plan showing saved checkpoints and the recorded steps of an example project’s plan.",
  },
  {
    label: "Questions", image: questions, Icon: CircleHelp,
    title: "Close the open loops.",
    caption: "See what Codex needs from you. Draft your replies and review the exact message before sending it to the selected chat.",
    alt: "Flux showing questions from Codex and answer controls in an example project.",
  },
];

export default function FluxFeature() {
  const [selectedView, setSelectedView] = useState(0);
  const view = views[selectedView];
  useEffect(() => {
    const target = window.location.hash.slice(1);
    if (target !== "flux" && target !== "flux-details") return;
    const frame = window.requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView());
    return () => window.cancelAnimationFrame(frame);
  }, []);
  return (
    <section className="flux-section" id="flux" aria-labelledby="flux-title">
      <div className="flux-product-line">
        <p className="flux-wordmark">Flux <span>by Decantr</span></p>
        <span className="flux-preview-status">Local preview · v0.1</span>
      </div>

      <div className="flux-feature-body">
        <div className="flux-feature-copy">
          <h2 id="flux-title">Keep the thread of your work.</h2>
          <p>A local companion for Codex. Current work, saved plans, and questions that need you, together in one place.</p>
          <div className="flux-actions">
            <a className="flux-github" href="https://github.com/decantr-ai/flux" target="_blank" rel="noreferrer">View on GitHub <ArrowUpRight aria-hidden="true" size={17} /></a>
            <a className="flux-explore" href="#flux-details">See how it works <ArrowDown aria-hidden="true" size={15} /></a>
          </div>
          <p className="flux-sibling-note">A separate product from the team behind Decantr. Connect the exact Codex chat you want to follow.</p>
        </div>

        <figure className="flux-showcase" id="flux-details" aria-labelledby="flux-screen-caption">
          <div className="flux-showcase-header">
            <div className="flux-view-controls" role="group" aria-label="Choose a Flux product screenshot">
              {views.map(({ label, Icon }, index) => (
                <button key={label} type="button" aria-pressed={selectedView === index} aria-controls="flux-product-image" onClick={() => setSelectedView(index)}>
                  <Icon aria-hidden="true" size={15} />{label}
                </button>
              ))}
            </div>
            <span className="flux-example-label">Example project</span>
          </div>
          <div className="flux-screen-viewport" tabIndex={0} role="region" aria-label={`${view.label} screenshot. Scroll horizontally on narrow screens to inspect the full image.`}>
            <img id="flux-product-image" className="flux-product-image" src={view.image} alt={view.alt} width="1280" height="720" loading="lazy" />
          </div>
          <figcaption className="flux-screen-caption" id="flux-screen-caption">
            <div aria-live="polite" aria-atomic="true"><strong>{view.title}</strong><p>{view.caption}</p></div>
            <a href={view.image} target="_blank" rel="noreferrer" aria-label={`Open the full-size ${view.label} screenshot`}><Maximize2 aria-hidden="true" size={14} /><span>Full size</span></a>
          </figcaption>
          <p className="flux-mobile-hint">Swipe the screenshot to inspect the full view.</p>
        </figure>
      </div>

      <div className="flux-availability">
        <p><LockKeyhole aria-hidden="true" size={16} /><span>Runs locally. Records stay on your machine.</span></p>
        <p>Flux 0.1 is available from source. Setup instructions are on GitHub.</p>
      </div>
    </section>
  );
}
