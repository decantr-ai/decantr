import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

const templates = {
  packageJson: (name) => JSON.stringify({
    name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'decantr dev',
      build: 'decantr build',
      test: 'decantr test'
    },
    dependencies: {
      decantr: '^0.1.0'
    }
  }, null, 2),

  config: (name, routerMode, port) => JSON.stringify({
    $schema: 'https://decantr.ai/schemas/config.v1.json',
    name,
    router: routerMode,
    dev: { port },
    build: { outDir: 'dist', inline: false, sourcemap: false }
  }, null, 2),

  indexHtml: (name) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${name}</title>
  <style>:root{--c0:#111;--c1:#2563eb;--c2:#f8fafc;--c3:#e2e8f0;--c4:#94a3b8;--c5:#475569;--c6:#1e293b;--c7:#f59e0b;--c8:#10b981;--c9:#ef4444}*{margin:0;box-sizing:border-box}body{font-family:system-ui,-apple-system,sans-serif;color:var(--c0);background:var(--c2)}</style>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/app.js"></script>
</body>
</html>`,

  appJs: (routerMode, includeCounter) => `import { h, mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { Home } from './pages/home.js';
import { About } from './pages/about.js';

const router = createRouter({
  mode: '${routerMode}',
  routes: [
    { path: '/', component: Home },
    { path: '/about', component: About }
  ]
});

function App() {
  return h('div', null,
    h('nav', { class: 'flex gap4 p4 bg1' },
      link({ href: '/', class: 'fg2 nounder' }, 'Home'),
      link({ href: '/about', class: 'fg2 nounder' }, 'About')
    ),
    router.outlet()
  );
}

mount(document.getElementById('app'), App);
`,

  homeJs: (includeCounter) => `import { h } from 'decantr/core';
${includeCounter ? "import { Counter } from '../components/counter.js';\n" : ''}
/** @returns {HTMLElement} */
export function Home() {
  return h('main', { class: 'p8' },
    h('h1', { class: 't32 bold' }, 'Welcome to Decantr'),
    h('p', { class: 'py4 fg5' }, 'AI-first web framework. Zero dependencies.')${includeCounter ? ',\n    h(\'div\', { class: \'py4\' }, Counter({ initial: 0 }))' : ''}
  );
}
`,

  aboutJs: () => `import { h } from 'decantr/core';

/** @returns {HTMLElement} */
export function About() {
  return h('main', { class: 'p8' },
    h('h1', { class: 't32 bold' }, 'About'),
    h('p', { class: 'py4 fg5' }, 'Built with Decantr — the AI-first framework.')
  );
}
`,

  counterJs: () => `import { h, text } from 'decantr/core';
import { createSignal } from 'decantr/state';

/**
 * @param {{ initial?: number }} props
 * @returns {HTMLElement}
 */
export function Counter({ initial = 0 } = {}) {
  const [count, setCount] = createSignal(initial);

  return h('div', { class: 'flex gap2 p4 aic' },
    h('button', { onclick: () => setCount(c => c - 1), class: 'p2 px4 r2 bg1 fg2 pointer b0 t16' }, '-'),
    h('span', { class: 'p2 t20 bold' }, text(() => String(count()))),
    h('button', { onclick: () => setCount(c => c + 1), class: 'p2 px4 r2 bg1 fg2 pointer b0 t16' }, '+')
  );
}
`,

  counterTestJs: () => `import { describe, it, assert, render, fire, flush } from 'decantr/test';
import { Counter } from '../src/components/counter.js';

describe('Counter', () => {
  it('renders with initial value', () => {
    const { container } = render(() => Counter({ initial: 5 }));
    assert.ok(container.textContent.includes('5'));
  });

  it('increments on + click', async () => {
    const { container, getByText } = render(() => Counter({ initial: 0 }));
    fire(getByText('+'), 'click');
    await flush();
    assert.ok(container.textContent.includes('1'));
  });

  it('decrements on - click', async () => {
    const { container, getByText } = render(() => Counter({ initial: 5 }));
    fire(getByText('-'), 'click');
    await flush();
    assert.ok(container.textContent.includes('4'));
  });
});
`,

  manifest: (name, routerMode) => JSON.stringify({
    $schema: 'https://decantr.ai/schemas/manifest.v1.json',
    version: '0.1.0',
    name,
    router: routerMode,
    entrypoint: 'src/app.js',
    shell: 'public/index.html',
    mountTarget: '#app',
    components: '.decantr/components.json',
    routes: '.decantr/routes.json',
    state: '.decantr/state.json'
  }, null, 2),

  components: (includeCounter) => JSON.stringify({
    $schema: 'https://decantr.ai/schemas/components.v1.json',
    components: includeCounter ? [{
      id: 'counter',
      file: 'src/components/counter.js',
      exportName: 'Counter',
      description: 'Increment/decrement counter with display',
      props: [{ name: 'initial', type: 'number', default: 0, required: false }],
      signals: ['count'],
      effects: [],
      children: false
    }] : []
  }, null, 2),

  routes: (routerMode) => JSON.stringify({
    $schema: 'https://decantr.ai/schemas/routes.v1.json',
    mode: routerMode,
    routes: [
      { path: '/', component: 'home', file: 'src/pages/home.js', exportName: 'Home', title: 'Home' },
      { path: '/about', component: 'about', file: 'src/pages/about.js', exportName: 'About', title: 'About' }
    ]
  }, null, 2),

  state: (includeCounter) => JSON.stringify({
    $schema: 'https://decantr.ai/schemas/state.v1.json',
    signals: includeCounter ? [{
      id: 'count',
      file: 'src/components/counter.js',
      type: 'number',
      initial: 0,
      usedBy: ['Counter']
    }] : [],
    effects: [],
    memos: []
  }, null, 2)
};

async function ask(rl, question, defaultVal) {
  const answer = await rl.question(`${question} (${defaultVal}): `);
  return answer.trim() || defaultVal;
}

async function askChoice(rl, question, options, defaultVal) {
  console.log(`\n${question}`);
  options.forEach((opt, i) => console.log(`  ${i + 1}) ${opt}`));
  const answer = await rl.question(`Choose [${defaultVal}]: `);
  const idx = parseInt(answer.trim()) - 1;
  return (idx >= 0 && idx < options.length) ? options[idx] : defaultVal;
}

export async function run() {
  const rl = createInterface({ input: stdin, output: stdout });
  const cwd = process.cwd();

  console.log('\n  decantr init — Create a new project\n');

  try {
    const name = await ask(rl, 'Project name?', basename(cwd));
    const routerMode = await askChoice(rl, 'Router mode?', ['history', 'hash'], 'history');
    const includeCounterAnswer = await askChoice(rl, 'Include example counter component?', ['yes', 'no'], 'yes');
    const includeCounter = includeCounterAnswer === 'yes';
    const port = parseInt(await ask(rl, 'Dev server port?', '3000'));

    // Create directories
    const dirs = ['src/pages', 'src/components', 'public', '.decantr', 'test'];
    for (const dir of dirs) {
      await mkdir(join(cwd, dir), { recursive: true });
    }

    // Write files
    const files = [
      ['package.json', templates.packageJson(name)],
      ['decantr.config.json', templates.config(name, routerMode, port)],
      ['public/index.html', templates.indexHtml(name)],
      ['src/app.js', templates.appJs(routerMode, includeCounter)],
      ['src/pages/home.js', templates.homeJs(includeCounter)],
      ['src/pages/about.js', templates.aboutJs()],
      ['.decantr/manifest.json', templates.manifest(name, routerMode)],
      ['.decantr/components.json', templates.components(includeCounter)],
      ['.decantr/routes.json', templates.routes(routerMode)],
      ['.decantr/state.json', templates.state(includeCounter)]
    ];

    if (includeCounter) {
      files.push(['src/components/counter.js', templates.counterJs()]);
      files.push(['test/counter.test.js', templates.counterTestJs()]);
    }

    for (const [path, content] of files) {
      await writeFile(join(cwd, path), content + '\n');
    }

    console.log(`\n  Project "${name}" created successfully!\n`);
    console.log('  Next steps:');
    console.log('    npm install');
    console.log('    npx decantr dev\n');

  } finally {
    rl.close();
  }
}
