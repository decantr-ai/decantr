import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/decorators.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
