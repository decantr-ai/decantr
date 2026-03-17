import { mount } from 'decantr/core';
import { setMode, setStyle } from 'decantr/css';
import { createRouter } from 'decantr/router';
import { registerIcons } from 'decantr/components';

registerIcons({
  'github': '<path d="M15 22v-4a4.8 4.8 0 00-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 004 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>',
  'twitter': '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>',
  'refresh-cw': '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>',
  'discord': '<path d="M18.9 5.2a15.8 15.8 0 00-4-1.2c-.2.3-.4.7-.5 1a14.7 14.7 0 00-4.4 0c-.2-.4-.4-.7-.5-1a15.8 15.8 0 00-4 1.2A16.3 16.3 0 003 17.6a16 16 0 004.9 2.5c.4-.5.7-1.1 1-1.7a10 10 0 01-1.6-.8l.4-.3a11.3 11.3 0 009.6 0l.4.3c-.5.3-1 .6-1.6.8.3.6.6 1.1 1 1.7a16 16 0 004.9-2.5A16.3 16.3 0 0018.9 5.2zM8.7 14.8c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.9 2.1-1.9 2.1zm6.6 0c-1 0-1.9-1-1.9-2.1s.8-2.1 1.9-2.1 1.9 1 1.9 2.1-.9 2.1-1.9 2.1z"/>',
});

setStyle('auradecantism');
setMode('dark');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js').then(m => m.default) }
  ]
});

function App() {
  return router.outlet();
}

mount(document.getElementById('app'), App);
