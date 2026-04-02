import { css } from '@decantr/css';
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/global.css';
import './styles/neon.css';

// Warm up the css runtime with a no-op call
css('_flex');

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
