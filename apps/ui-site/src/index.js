import { mount } from '@decantr/ui/runtime';
import { setStyle, setMode, setShape } from '@decantr/ui/css';
import { App } from './app.js';

setStyle('auradecantism');
setMode('dark');
setShape('rounded');

const root = document.getElementById('app');
mount(root, App);
