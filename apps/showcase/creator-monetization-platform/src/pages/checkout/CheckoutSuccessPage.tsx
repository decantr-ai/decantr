import { Link } from 'react-router-dom';
import { css } from '@decantr/css';
import { Check } from 'lucide-react';

export function CheckoutSuccessPage() {
  return (
    <div className={css('_flex _col _aic _gap4')} style={{ textAlign: 'center', padding: '2rem 0', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #BBF7D0, #86EFAC)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Check size={32} style={{ color: '#065F46' }} strokeWidth={3} />
      </div>
      <div>
        <h1 className="serif-display" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome aboard</h1>
        <p style={{ color: 'var(--d-text-muted)', fontSize: '0.9375rem', maxWidth: 420 }}>
          You're subscribed. A receipt is on its way to your inbox. Your creator will be delighted.
        </p>
      </div>
      <div className={css('_flex _gap2')}>
        <Link to="/library" className="d-interactive studio-glow" data-variant="primary"
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>Open your library</Link>
        <Link to="/creator/mayaink" className="d-interactive" data-variant="ghost"
          style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', textDecoration: 'none' }}>Back to creator</Link>
      </div>
    </div>
  );
}
