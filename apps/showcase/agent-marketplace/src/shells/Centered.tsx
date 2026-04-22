import { Outlet } from 'react-router-dom';

export function Centered() {
  return (
    <div className="shell-centered" data-theme="carbon-neon">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <main id="main-content" className="shell-centered__frame d-surface carbon-glass">
        <Outlet />
      </main>
    </div>
  );
}
