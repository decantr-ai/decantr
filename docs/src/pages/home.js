import { h, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link } from 'decantr/router';
import { Button, Card } from 'decantr/components';
import { CodeBlock } from '../components/code-block.js';
import { injectLandingStyles } from '../components/landing-styles.js';

// --- Data ---
const counterCode = `import { h, mount } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Button } from 'decantr/components';

function Counter() {
  const [count, setCount] = createSignal(0);

  return h('div', { style: { textAlign: 'center' } },
    h('p', { style: { fontSize: '3rem', fontWeight: '700' } },
      () => count()
    ),
    h('div', { style: { display: 'flex', gap: '0.5rem', justifyContent: 'center' } },
      Button({ onclick: () => setCount(c => c - 1) }, '\u2212'),
      Button({ variant: 'primary', onclick: () => setCount(c => c + 1) }, '+')
    )
  );
}

mount(document.getElementById('app'), Counter);`;

const features = [
  { title: 'Zero Dependencies', desc: 'Pure JavaScript, CSS, and HTML. Nothing to install beyond the framework itself.', accent: 'var(--c1)' },
  { title: 'Signal Reactivity', desc: 'Fine-grained reactivity with signals, effects, memos, and stores. No virtual DOM overhead.', accent: 'var(--c6)' },
  { title: 'AI-Native Design', desc: 'Designed for AI agents to generate, read, and maintain. Simple patterns, zero magic.', accent: 'var(--c7)' },
  { title: 'Tiny Bundle', desc: 'Under 2KB gzipped for hello world. Real DOM nodes, no runtime diffing overhead.', accent: 'var(--c8)' },
  { title: 'AI Prompt Ready', desc: 'Pre-constructed prompts and machine-readable manifests. Scaffold with 100% accuracy via ChatGPT or Claude.', accent: 'var(--c9)' },
  { title: 'Built-in Tooling', desc: 'Dev server with hot reload, production builder, test runner, and CLI scaffolding.', accent: 'var(--c4)' }
];

const stats = [
  { value: '0', label: 'Dependencies' },
  { value: '<2KB', label: 'Gzipped' },
  { value: '5', label: 'Themes' },
  { value: 'Real', label: 'DOM' }
];

// --- Sections ---

function HeroSection() {
  return h('section', {
    style: {
      position: 'relative', overflow: 'hidden',
      padding: 'calc(64px + 6rem) 2rem 6rem', textAlign: 'center'
    }
  },
    // Decorative glows
    h('div', { class: 'landing-glow landing-glow-1', 'aria-hidden': 'true' }),
    h('div', { class: 'landing-glow landing-glow-2', 'aria-hidden': 'true' }),
    // Grid pattern
    h('div', { class: 'landing-grid', 'aria-hidden': 'true' }),

    // Content
    h('div', { style: { position: 'relative', zIndex: '1', maxWidth: '900px', margin: '0 auto' } },
      h('img', {
        src: './images/logo.jpg',
        alt: '',
        'aria-hidden': 'true',
        class: 'landing-animate',
        style: {
          height: '96px', width: 'auto', margin: '0 auto 1.5rem', display: 'block',
          borderRadius: '12px'
        }
      }),
      h('h1', {
        class: 'landing-animate',
        style: {
          fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: '800',
          letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem',
          color: 'var(--c3)'
        }
      }, 'decantr'),

      h('p', {
        class: 'landing-animate landing-animate-delay-1',
        style: {
          fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)', color: 'var(--c4)',
          lineHeight: '1.6', maxWidth: '720px', margin: '0 auto 2rem'
        }
      },
        h('strong', { style: { color: 'var(--c3)' } }, 'The AI-native UI framework.'),
        ' Zero dependencies. No TypeScript. No React. No Angular. No Tailwind. Just pure JS, CSS, and HTML \u2014 designed for LLMs to read, generate, and ship production web applications.'
      ),

      // Install command
      h('div', {
        class: 'landing-animate landing-animate-delay-2',
        style: { marginBottom: '2.5rem' }
      },
        h('code', {
          style: {
            display: 'inline-block', padding: '0.75rem 1.5rem',
            background: 'var(--c2)', border: '1px solid var(--c5)',
            borderRadius: 'var(--d-radius, 6px)', fontSize: '1rem',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            color: 'var(--c3)', letterSpacing: '0.01em'
          }
        }, '$ npm i decantr')
      ),

      // CTAs
      h('div', {
        class: 'landing-animate landing-animate-delay-3 landing-hero-cta',
        style: {
          display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap'
        }
      },
        link({ href: '/getting-started', style: { textDecoration: 'none' } },
          Button({ variant: 'primary', size: 'lg' }, 'Get Started')
        ),
        link({ href: '/how-it-works', style: { textDecoration: 'none' } },
          Button({ variant: 'outline', size: 'lg' }, 'How It Works')
        ),
        h('a', {
          href: 'https://github.com/decantr-ai/decantr', target: '_blank', rel: 'noopener',
          style: { textDecoration: 'none' }
        },
          Button({ size: 'lg' }, 'GitHub')
        )
      )
    )
  );
}

function StatsSection() {
  return h('section', {
    style: {
      background: 'var(--c2)',
      borderTop: '1px solid var(--c5)', borderBottom: '1px solid var(--c5)',
      padding: '3rem 2rem'
    }
  },
    h('div', {
      class: 'landing-stats-grid',
      style: {
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '2rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center'
      }
    },
      ...stats.map(s =>
        h('div', { class: 'landing-stat' },
          h('div', {
            style: {
              fontSize: '2rem', fontWeight: '800', color: 'var(--c1)',
              lineHeight: '1.2', marginBottom: '0.375rem'
            }
          }, s.value),
          h('div', {
            style: {
              fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--c4)'
            }
          }, s.label)
        )
      )
    )
  );
}

function CodeShowcaseSection() {
  const [count, setCount] = createSignal(0);

  return h('section', { style: { padding: '6rem 2rem' } },
    h('div', { style: { maxWidth: '1100px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '2rem', fontWeight: '700', textAlign: 'center',
          marginBottom: '0.75rem', color: 'var(--c3)'
        }
      }, 'Code that speaks for itself'),
      h('p', {
        style: {
          textAlign: 'center', color: 'var(--c4)', marginBottom: '3rem',
          fontSize: '1.125rem'
        }
      }, 'Simple, readable components with real DOM output.'),

      h('div', {
        class: 'landing-code-grid',
        style: {
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '2rem', alignItems: 'stretch'
        }
      },
        // Left: code
        h('div', null, CodeBlock({ code: counterCode })),

        // Right: live demo
        h('div', {
          style: {
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'center', padding: '3rem 2rem',
            border: '1px solid var(--c5)', borderRadius: 'var(--d-radius-lg, 8px)',
            background: 'var(--c2)'
          }
        },
          h('p', {
            style: {
              fontSize: '0.6875rem', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--c4)', marginBottom: '1.5rem'
            }
          }, 'Live Demo'),
          h('p', {
            style: { fontSize: '3.5rem', fontWeight: '700', color: 'var(--c3)', marginBottom: '1.5rem', lineHeight: '1' }
          }, text(() => count())),
          h('div', { style: { display: 'flex', gap: '0.75rem' } },
            Button({ onclick: () => setCount(c => c - 1) }, '\u2212'),
            Button({ variant: 'primary', onclick: () => setCount(c => c + 1) }, '+')
          )
        )
      )
    )
  );
}

function FeaturesSection() {
  return h('section', { style: { padding: '6rem 2rem', background: 'var(--c2)' } },
    h('div', { style: { maxWidth: '1100px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '2rem', fontWeight: '700', textAlign: 'center',
          marginBottom: '0.75rem', color: 'var(--c3)'
        }
      }, 'Everything you need'),
      h('p', {
        style: {
          textAlign: 'center', color: 'var(--c4)', marginBottom: '3rem',
          fontSize: '1.125rem'
        }
      }, 'A complete framework in a tiny package.'),

      h('div', {
        class: 'landing-features-grid',
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem'
        }
      },
        ...features.map(f =>
          Card({ hoverable: true },
            h('div', {
              'aria-hidden': 'true',
              style: {
                width: '100%', height: '4px', borderRadius: '2px',
                background: f.accent, marginBottom: '1rem'
              }
            }),
            h('h3', {
              style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--c3)' }
            }, f.title),
            h('p', {
              style: { color: 'var(--c4)', fontSize: '0.875rem', lineHeight: '1.6' }
            }, f.desc)
          )
        )
      )
    )
  );
}

function CTASection() {
  return h('section', {
    style: {
      padding: '6rem 2rem', background: 'var(--c2)',
      borderTop: '1px solid var(--c5)', textAlign: 'center'
    }
  },
    h('div', { style: { maxWidth: '600px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '2rem', fontWeight: '700', marginBottom: '1rem',
          color: 'var(--c3)'
        }
      }, 'Start building with decantr'),
      h('p', {
        style: {
          color: 'var(--c4)', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.6'
        }
      }, 'Get up and running in seconds.'),

      h('div', { style: { maxWidth: '400px', margin: '0 auto 2rem', textAlign: 'left' } },
        CodeBlock({ code: 'npm i decantr\nnpx decantr init my-app\ncd my-app && npx decantr dev', lang: 'bash' })
      ),

      link({ href: '/getting-started', style: { textDecoration: 'none' } },
        Button({ variant: 'primary', size: 'lg' }, 'Read the Docs')
      )
    )
  );
}

// --- Export ---

export function Home() {
  injectLandingStyles();

  return h('div', null,
    HeroSection(),
    StatsSection(),
    CodeShowcaseSection(),
    FeaturesSection(),
    CTASection()
  );
}
