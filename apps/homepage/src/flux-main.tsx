import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import FluxPage from './FluxPage';
import './flux.css';

createRoot(document.getElementById('root')!).render(<StrictMode><FluxPage /></StrictMode>);
