import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { css } from '@decantr/css';
import './styles/tokens.css';
import './styles/decorators.css';
import App from './App';

/* inject a minimal global reset */
css('_m0 _p0');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
