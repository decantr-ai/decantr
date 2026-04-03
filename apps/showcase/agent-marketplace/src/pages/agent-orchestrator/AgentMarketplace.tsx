import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { GenerativeCardGrid } from '../../components/patterns/GenerativeCardGrid';

export function AgentMarketplace() {
  return (
    <div className={css('_flex _col _gap6')}>
      {/* Marketplace hero - inline since it's different from the marketing hero */}
      <section className={css('_flex _col _aic _textc _gap4') + ' d-section'} style={{ padding: '2rem 0' }}>
        <span
          className="d-annotation"
          style={{
            background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)',
            color: 'var(--d-accent)',
            border: '1px solid color-mix(in srgb, var(--d-accent) 30%, transparent)',
          }}
        >
          AGENT MARKETPLACE
        </span>
        <h2 className={css('_text2xl _fontbold') + ' neon-text-glow'}>
          Browse & Deploy Pre-Built Agents
        </h2>
        <p className={css('_textsm _fgmuted')} style={{ maxWidth: 500, lineHeight: 1.7 }}>
          Discover production-ready agents built by the community. Deploy in one click, customize to your needs.
        </p>
        <div className={css('_flex _gap3')}>
          <Link to="/register" className={css('_px4 _py2 _textsm') + ' d-interactive'} data-variant="primary">
            Deploy Agent
          </Link>
          <Link to="/agents/config" className={css('_px4 _py2 _textsm') + ' d-interactive'} data-variant="ghost">
            Submit Your Agent
          </Link>
        </div>
      </section>

      <GenerativeCardGrid />
    </div>
  );
}
