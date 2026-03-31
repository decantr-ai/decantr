import { Routes, Route } from 'react-router-dom';
import { ShowcaseChrome } from './showcase-chrome';

function Placeholder({ name }: { name: string }) {
  return (
    <div style={{ padding: '48px', textAlign: 'center', color: 'var(--d-text-muted, #999)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '8px' }}>{name}</h2>
      <p>Page coming soon</p>
    </div>
  );
}

export function App() {
  return (
    <ShowcaseChrome>
      <Routes>
        <Route path="/" element={<Placeholder name="Landing" />} />
        <Route path="/chat" element={<Placeholder name="Chat" />} />
        <Route path="/chat/new" element={<Placeholder name="New Chat" />} />
        <Route path="/dashboard" element={<Placeholder name="Dashboard" />} />
        <Route path="/settings" element={<Placeholder name="Settings" />} />
        <Route path="/settings/:section" element={<Placeholder name="Settings" />} />
        <Route path="/login" element={<Placeholder name="Login" />} />
        <Route path="/register" element={<Placeholder name="Register" />} />
        <Route path="/about" element={<Placeholder name="About" />} />
        <Route path="/contact" element={<Placeholder name="Contact" />} />
        <Route path="/privacy" element={<Placeholder name="Privacy" />} />
        <Route path="/terms" element={<Placeholder name="Terms" />} />
        <Route path="/cookies" element={<Placeholder name="Cookies" />} />
        <Route path="*" element={<Placeholder name="Not Found" />} />
      </Routes>
    </ShowcaseChrome>
  );
}
