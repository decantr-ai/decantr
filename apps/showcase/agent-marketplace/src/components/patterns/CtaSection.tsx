import { css } from '@decantr/css';
import { Link } from 'react-router-dom';

export function CtaSection() {
  return (
    <section
      className={css('_flex _col _aic _textc _px6') + ' d-section carbon-glass'}
      role="complementary"
      aria-label="Call to action section"
    >
      <div
        className={css('_flex _col _aic _gap6')}
        style={{ maxWidth: 640 }}
      >
        <h2 className={css('_heading2')}>
          Ready to Deploy Your Agent Fleet?
        </h2>

        <p className={css('_fgmuted')} style={{ lineHeight: 1.7 }}>
          Start orchestrating AI agents in minutes. No credit card required for
          the free tier. Scale when you are ready.
        </p>

        <div className={css('_flex _row _gap3 _aic _wrap _jcc')}>
          <Link
            to="/register"
            className={css('_px6 _py3 _textsm') + ' d-interactive'}
            data-variant="primary"
          >
            Get Started Free
          </Link>
          <Link
            to="/register"
            className={css('_px6 _py3 _textsm') + ' d-interactive'}
            data-variant="ghost"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}
