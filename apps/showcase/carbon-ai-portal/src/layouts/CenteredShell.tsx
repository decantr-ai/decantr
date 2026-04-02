import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={css('_flex _aic _jcc _hscreen _p4') + ' carbon-canvas'}
    >
      <div className={css('_flex _col _gap6') + ' carbon-card'} style={{ width: '100%', maxWidth: '420px', padding: 'var(--d-gap-8)' }}>
        <div className={css('_flex _col _aic _gap3')}>
          <Link to="/" className={css('_flex _aic _gap2 _fgtext')}>
            <div className={css('_flex _aic _jcc _roundedfull _bgprimary')} style={{ width: '36px', height: '36px' }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <span className={css('_fontsemi _textlg')}>Carbon AI</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
