import { mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { css, setStyle, setMode } from 'decantr/css';

const { div, h1, p } = tags;

// Style and mode are set here for initial render.
// After CLARIFY, these should match your essence vintage.
// For sectioned essences, add a router.beforeEach guard to switch per section.
setStyle('auradecantism');
setMode('dark');

const app = div({ class: css('_flex _col _center _minhscreen _bgbg') },
  h1({ class: css('_t24 _bold _fgfg') }, 'Welcome to My App'),
  p({ class: css('_t14 _fgmuted _mt2') }, 'Start building by prompting your AI.')
);

mount(document.getElementById('app'), () => app);

