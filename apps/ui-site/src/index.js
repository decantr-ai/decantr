import { mount } from '@decantr/ui/runtime';
import { EssenceProvider } from '@decantr/ui/essence';
import { App } from './app.js';
import essence from '../essence.json' assert { type: 'json' };

const root = document.getElementById('app');
mount(root, () => EssenceProvider({ essence }, App()));
