import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import './styles/global.css';
import './styles/tokens.css';
import './styles/decorators.css';
import './styles/app.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>
);
