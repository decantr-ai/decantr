import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

export function Hero() {
  return (
    <section
      className={css('_flex _col _aic _rel') + ' d-section'}
      style={{ padding: 'var(--d-section-py) 1.5rem' }}
      role="banner"
    >
      <div
        className={css('_flex _col _aic _textc _gap6')}
        style={{ maxWidth: 720 }}
      >
        {/* Overline badge */}
        <span
          className="d-annotation stagger-fade-up"
          style={{
            background: 'color-mix(in srgb, var(--d-accent) 15%, transparent)',
            color: 'var(--d-accent)',
            border: '1px solid color-mix(in srgb, var(--d-accent) 30%, transparent)',
            animationDelay: '0ms',
          }}
        >
          AGENT ORCHESTRATION PLATFORM
        </span>

        {/* Headline */}
        <h1
          className={css('_heading1 _fontbold') + ' neon-text-glow stagger-fade-up'}
          style={{ animationDelay: '0ms' }}
        >
          Orchestrate AI Agents at Scale
        </h1>

        {/* Subtext */}
        <p
          className={css('_textlg _fgmuted') + ' stagger-fade-up'}
          style={{
            lineHeight: 1.7,
            maxWidth: 600,
            animationDelay: '150ms',
          }}
        >
          Deploy, monitor, and orchestrate autonomous agent swarms with
          real-time observability and confidence analytics.
        </p>

        {/* CTAs */}
        <div
          className={css('_flex _row _gap3 _aic _wrap _jcc') + ' stagger-fade-up'}
          style={{ animationDelay: '300ms' }}
        >
          <Link
            to="/register"
            className={css('_px6 _py3 _textsm') + ' d-interactive'}
            data-variant="primary"
          >
            Deploy Now
          </Link>
          <Link
            to="/marketplace"
            className={css('_px6 _py3 _textsm') + ' d-interactive'}
            data-variant="ghost"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Ambient glow */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 400,
            height: 200,
            borderRadius: '50%',
            background:
              'radial-gradient(ellipse, var(--d-accent-glow) 0%, transparent 70%)',
            filter: 'blur(60px)',
            opacity: 0.4,
            pointerEvents: 'none',
          }}
        />
      </div>
    </section>
  );
}
