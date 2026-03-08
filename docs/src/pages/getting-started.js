import { h } from 'decantr/core';
import { CodeBlock } from '../components/code-block.js';

export function GettingStarted() {
  return h('div', null,
    h('h1', { style: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' } }, 'Getting Started'),
    h('p', { style: { color: 'var(--c4)', marginBottom: '2rem', lineHeight: '1.6' } },
      'Get a decantr project running in under a minute.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, 'Prerequisites'),
    h('p', { style: { marginBottom: '1.5rem', lineHeight: '1.6' } },
      'Node.js 22 or later.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, '1. Create a project'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'The CLI creates a minimal project skeleton with everything your AI needs to start building.'
    ),
    CodeBlock({ code: 'npx decantr init my-app', lang: 'bash' }),

    h('p', { style: { marginTop: '1rem', marginBottom: '1.5rem', lineHeight: '1.6' } },
      'This creates a project with package.json, HTML shell, example app.js, and AGENTS.md \u2014 a translation layer that maps React/Vue/Angular patterns to decantr equivalents.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, '2. Start the dev server'),
    CodeBlock({ code: 'cd my-app\nnpx decantr dev', lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.6' } },
      'Opens a dev server with hot reload on localhost:3000.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, '3. Edit your app'),
    h('p', { style: { marginBottom: '0.75rem', lineHeight: '1.6' } },
      'The entry point is ', h('code', { style: { fontSize: '0.875rem', background: 'var(--c2)', padding: '0.125rem 0.375rem', borderRadius: '4px' } }, 'src/app.js'),
      '. Components are plain functions that return DOM nodes:'
    ),
    CodeBlock({ code: `import { h } from 'decantr/core';
import { Button } from 'decantr/components';

function MyButton() {
  return Button({
    variant: 'primary',
    onclick: () => alert('Clicked!')
  }, 'Click me');
}` }),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' } }, '4. Build for production'),
    CodeBlock({ code: 'npx decantr build', lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.6' } },
      'Outputs bundled, minified, and hashed files to ', h('code', { style: { fontSize: '0.875rem', background: 'var(--c2)', padding: '0.125rem 0.375rem', borderRadius: '4px' } }, 'dist/'), '.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, '5. Run tests'),
    CodeBlock({ code: 'npx decantr test', lang: 'bash' }),
    h('p', { style: { marginTop: '0.75rem', marginBottom: '1.5rem', lineHeight: '1.6' } },
      'Uses Node.js built-in test runner with decantr\'s DOM helpers. See the test module docs for details.'
    ),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem' } }, 'Project structure'),
    CodeBlock({ code: `my-app/
  package.json            # Dependencies and scripts
  decantr.config.json     # Theme, style, router, dev port
  public/
    index.html            # HTML shell with theme CSS variables
  src/
    app.js                # Entry point \u2014 router, layout, mount
    pages/                # Route page components
    components/           # Reusable components
  test/                   # Test files`, lang: 'bash' }),

    h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginTop: '1.5rem', marginBottom: '0.75rem' } }, 'Next steps'),
    h('ul', { style: { lineHeight: '1.8', paddingLeft: '1.5rem', marginBottom: '2rem' } },
      h('li', null, 'Read the ', h('a', { href: '#/core' }, 'Core API'), ' to learn about h(), text(), and mounting'),
      h('li', null, 'Learn about ', h('a', { href: '#/state' }, 'signals and reactivity')),
      h('li', null, 'Explore the ', h('a', { href: '#/components' }, 'component library')),
      h('li', null, 'Customize with ', h('a', { href: '#/css' }, 'themes and styles'))
    )
  );
}
