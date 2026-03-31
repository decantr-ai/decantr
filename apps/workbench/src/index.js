import { mount } from '@decantr/ui/runtime';
import { setStyle, setMode, setShape } from '@decantr/ui/css';
import { App } from './app.js';

// Initialize theme from essence DNA
setStyle('auradecantism');
setMode('dark');
setShape('rounded');

// Mount the workbench
const root = document.getElementById('app');
mount(root, App);
