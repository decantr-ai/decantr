import { h } from 'decantr/core';
import { CodeBlock } from '../components/code-block.js';
import { ApiTable } from '../components/api-table.js';

export function CLIPage() {
  return h('div', null,
    h('h1', { style: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' } }, 'CLI'),
    h('p', { style: { color: 'var(--c4)', marginBottom: '2rem', lineHeight: '1.6' } },
      'Command-line tools for scaffolding, development, building, and testing.'
    ),

    // init
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' } }, 'decantr init'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Creates a minimal project skeleton with package.json, HTML shell, example app.js, AGENTS.md, and CLAUDE.md. Then prompt your AI to build your app.'
    ),
    CodeBlock({ code: `npx decantr init my-app`, lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '0.5rem', lineHeight: '1.6' } },
      'Generated files:'
    ),
    h('ul', { style: { lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.5rem' } },
      h('li', null, h('strong', null, 'src/app.js'), ' \u2014 example Hello World entry point'),
      h('li', null, h('strong', null, 'AGENTS.md'), ' \u2014 AI translation layer (React/Vue/Angular \u2192 decantr)'),
      h('li', null, h('strong', null, 'CLAUDE.md'), ' \u2014 project-level framework reference')
    ),

    // dev
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' } }, 'decantr dev'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Start a development server with file watching and hot reload.'
    ),
    CodeBlock({ code: `npx decantr dev`, lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '0.5rem', lineHeight: '1.6' } },
      'Options:'
    ),
    h('ul', { style: { lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.5rem' } },
      h('li', null, 'Default port: 3000 (configurable via ', h('code', { style: { fontSize: '0.875rem' } }, 'decantr.config.json'), ')'),
      h('li', null, 'Watches src/ and public/ for changes'),
      h('li', null, 'Resolves decantr/ imports from the installed package'),
      h('li', null, 'Serves public/ directory as static files')
    ),

    // build
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' } }, 'decantr build'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Production build: bundle, tree-shake, minify, and output to dist/.'
    ),
    CodeBlock({ code: `npx decantr build`, lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '0.5rem', lineHeight: '1.6' } },
      'The builder:'
    ),
    h('ul', { style: { lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '1.5rem' } },
      h('li', null, 'Resolves all imports starting from src/app.js'),
      h('li', null, 'Bundles into a single JS file with content-hashed filename'),
      h('li', null, 'Extracts and deduplicates atomic CSS'),
      h('li', null, 'Minifies JS, CSS, and HTML'),
      h('li', null, 'Copies public/ assets (except index.html) to dist/'),
      h('li', null, 'Reports file sizes and gzip sizes')
    ),
    CodeBlock({ code: `# Build output structure
dist/
  index.html              # Transformed HTML shell
  assets/
    app.a1b2c3d4.js       # Bundled + minified JS
    app.e5f6g7h8.css      # Extracted + minified CSS
  favicon.svg             # Copied from public/
  CNAME                   # Copied from public/`, lang: 'bash' }),

    // test
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginTop: '1rem', marginBottom: '0.75rem' } }, 'decantr test'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Run tests using Node.js built-in test runner with decantr\'s DOM helpers.'
    ),
    CodeBlock({ code: `npx decantr test
npx decantr test --watch`, lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Test file pattern: ', h('code', { style: { fontSize: '0.875rem' } }, 'test/**/*.test.js')
    ),
    CodeBlock({ code: `import { describe, it, assert, render, flush } from 'decantr/test';

describe('MyComponent', () => {
  it('renders correctly', () => {
    const { container } = render(() => MyComponent());
    assert.ok(container.textContent.includes('Hello'));
  });
});` }),

    // Config file
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' } }, 'decantr.config.json'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'Project configuration file in the root of your project.'
    ),
    CodeBlock({ code: `{
  "name": "my-app",
  "theme": "light",
  "dev": { "port": 4200 }
}` }),

    // API summary
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginTop: '2rem', marginBottom: '0.75rem' } }, 'Command Summary'),
    ApiTable({ rows: [
      { name: 'init', signature: 'decantr init [name]', description: 'Create minimal project skeleton.' },
      { name: 'dev', signature: 'decantr dev', description: 'Dev server with hot reload.' },
      { name: 'build', signature: 'decantr build', description: 'Production build to dist/.' },
      { name: 'test', signature: 'decantr test [--watch]', description: 'Run tests with Node.js test runner.' }
    ]})
  );
}
