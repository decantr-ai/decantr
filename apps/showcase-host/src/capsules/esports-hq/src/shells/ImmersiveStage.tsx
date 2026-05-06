import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Gamepad2, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export function ImmersiveStage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="esx-stage-shell">
      <header className="esx-stage-nav" aria-label="Primary">
        <Link to="/" className="esx-stage-brand">
          <span className="esx-brand-mark" aria-hidden="true">
            <Gamepad2 size={18} />
          </span>
          <span>Esports HQ</span>
        </Link>

        <nav className="esx-stage-links" aria-label="Showcase">
          <a href="#war-room">War Room</a>
          <a href="#roster">Roster</a>
          <a href="#access">Access</a>
        </nav>

        <button
          className="esx-nav-cta"
          type="button"
          onClick={() => navigate(isAuthenticated ? '/team' : '/login')}
        >
          <LogIn size={16} />
          <span>{isAuthenticated ? 'Open HQ' : 'Sign In'}</span>
        </button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
