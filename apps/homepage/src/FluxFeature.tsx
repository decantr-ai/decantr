import { ArrowRight, ArrowUpRight, Bot, GitBranch, PanelRight } from 'lucide-react';
import { useEffect } from 'react';
import FluxBrand from './FluxBrand';
import './flux.css';

export default function FluxFeature() {
  useEffect(() => {
    // Preserve links from the earlier homepage setup and screenshot section.
    if (location.hash === '#flux-start') location.replace('/flux/#setup');
    else if (location.hash === '#flux-details') location.replace('/flux/#walkthrough');
    else if (location.hash === '#flux') {
      const frame = requestAnimationFrame(() => document.getElementById('flux')?.scrollIntoView());
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  return (
    <section id="flux" className="flux-product flux-home-teaser" aria-labelledby="flux-teaser-title">
      <div className="teaser">
        <div className="teaser-copy">
          <FluxBrand />
          <h2 id="flux-teaser-title">Your agent is busy.<br />On what, exactly?</h2>
          <p>Keep the work, the plan and the reason in view.</p>
          <a className="primary" href="/flux/">Meet Flux <ArrowUpRight aria-hidden="true" /></a>
          <span className="teaser-availability">Separate product · Codex local preview</span>
        </div>
        <div className="teaser-visual">
          <div className="busy-line"><Bot aria-hidden="true" /><span>Thinking…</span><span className="busy-rule" /></div>
          <div className="teaser-reveal">
            <span className="small-label">A proposed Flux workflow</span>
            <h3>Building an account system.</h3>
            <div className="mini-branch"><span>Save favorites</span><GitBranch aria-hidden="true" /><strong>Accounts?</strong></div>
            <p>The agreed plan doesn’t require an account.</p>
            <a className="rose-button" href="/flux/?moment=detour#walkthrough">See the detour <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className="teaser-caption"><PanelRight aria-hidden="true" />Your chat keeps working. You keep the plot.</div>
        </div>
      </div>
    </section>
  );
}
