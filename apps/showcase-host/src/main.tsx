import { createRoot } from 'react-dom/client';
import { HostApp } from './host/HostApp';
import { runCapsule } from './runner';
import './styles/host.css';

function isRunnerRequest(): boolean {
  return new URL(window.location.href).searchParams.get('runner') === '1';
}

if (isRunnerRequest()) {
  runCapsule().catch((error: unknown) => {
    const root = document.getElementById('root');
    if (root) {
      const errorPanel = document.createElement('main');
      const message = document.createElement('p');
      const details = document.createElement('pre');
      errorPanel.className = 'showcase-host-error';
      message.textContent = 'Unable to load showcase.';
      details.textContent = String(error);
      errorPanel.append(message, details);
      root.replaceChildren(errorPanel);
    }
  });
} else {
  const root = document.getElementById('root');
  if (root) {
    createRoot(root).render(<HostApp />);
  }
}
