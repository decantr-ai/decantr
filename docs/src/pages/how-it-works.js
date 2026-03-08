import { h } from 'decantr/core';
import { link } from 'decantr/router';
import { Button, Card, Badge } from 'decantr/components';
import { CodeBlock } from '../components/code-block.js';
import { injectLandingStyles } from '../components/landing-styles.js';

// --- Custom CSS for step flow ---
const hiwInjected = { done: false };

function injectHIWStyles() {
  if (hiwInjected.done || typeof document === 'undefined') return;
  hiwInjected.done = true;
  const style = document.createElement('style');
  style.setAttribute('data-decantr-hiw', '');
  style.textContent = `
.hiw-step{transition:transform 0.2s ease}
.hiw-step:hover{transform:translateX(4px)}
@media(max-width:768px){
.hiw-steps{padding-left:3rem!important}
.hiw-number{left:-3rem!important;width:2.5rem!important;height:2.5rem!important;font-size:0.75rem!important}
.hiw-connector{left:1.25rem!important}
.hiw-features-grid{grid-template-columns:1fr!important}
.hiw-prompt-grid{grid-template-columns:1fr!important}
}
`;
  document.head.appendChild(style);
}

// --- Data ---

const steps = [
  {
    number: '01',
    title: 'Install',
    desc: 'One command. Zero configuration. Get the CLI and framework in seconds.',
    code: 'npm i decantr\nnpx decantr init my-app',
    accent: 'var(--c1)'
  },
  {
    number: '02',
    title: 'Start the Dev Server',
    desc: 'Run the dev server with hot reload. Your project includes AGENTS.md \u2014 a translation layer that maps React, Vue, Angular, and other frameworks to decantr equivalents.',
    code: 'cd my-app && npm install\nnpx decantr dev',
    accent: 'var(--c7)'
  },
  {
    number: '03',
    title: 'Prompt Your AI',
    desc: 'Open your AI coding assistant and describe what you want to build. The AGENTS.md file ensures your AI generates correct decantr code \u2014 no hallucinated APIs, no wrong imports.',
    badges: ['Dashboard', 'Landing Page', 'Portfolio', 'Auth Flow', 'Data Tables', 'Admin Panel'],
    accent: 'var(--c8)'
  },
  {
    number: '04',
    title: 'Ship It',
    desc: 'Build for production with a single command. Bundled, minified, and hashed \u2014 ready to deploy anywhere.',
    code: 'npx decantr build',
    accent: 'var(--c9)'
  }
];

const scaffoldFeatures = [
  { title: '23+ Components', desc: 'Buttons, inputs, modals, tabs, tables, tooltips, accordions \u2014 all themed and accessible out of the box.' },
  { title: 'Dashboard Kit', desc: 'Sidebar, stats grid, KPI cards, activity feed, data tables, and chart placeholders.' },
  { title: 'Auth Kit', desc: 'Login, register, and forgot-password forms with layout wrapper and signal-based state.' },
  { title: 'Content Kit', desc: 'Article layout, author cards, table of contents, post lists, and category navigation.' },
  { title: '5 Themes', desc: 'Light, dark, retro, hot-lava, and stormy-ai \u2014 switch with a single function call.' },
  { title: 'Signal Reactivity', desc: 'Fine-grained signals, effects, memos, and stores. No virtual DOM, no diffing overhead.' }
];

const examplePrompt = `Build a dashboard page with:
- Sidebar navigation with 5 links
- Stats grid showing 4 KPI cards
- Activity feed with recent events
- Data table for user management

Use decantr components and the dashboard kit.
Theme: stormy-ai`;

const customPromptExample = `I want to add a contact form to my landing page
that collects name, email, and message. It should use
Input and Textarea components with validation, a Submit
button with loading state, and display a success Toast
notification when submitted.`;

// --- Sections ---

function HeroSection() {
  return h('section', {
    style: {
      position: 'relative', overflow: 'hidden',
      padding: 'calc(64px + 4rem) 2rem 4rem', textAlign: 'center'
    }
  },
    h('div', { class: 'landing-glow landing-glow-1', 'aria-hidden': 'true' }),
    h('div', { class: 'landing-grid', 'aria-hidden': 'true' }),
    h('div', { style: { position: 'relative', zIndex: '1', maxWidth: '800px', margin: '0 auto' } },
      h('h1', {
        class: 'landing-animate',
        style: {
          fontSize: 'clamp(2rem, 6vw, 3.5rem)', fontWeight: '800',
          letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem',
          color: 'var(--c3)'
        }
      }, 'How decantr Works'),
      h('p', {
        class: 'landing-animate landing-animate-delay-1',
        style: {
          fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--c4)',
          lineHeight: '1.6', maxWidth: '600px', margin: '0 auto'
        }
      }, 'From idea to production in minutes. Prompt your AI, and it builds with decantr.')
    )
  );
}

function StepsSection() {
  return h('section', { style: { padding: '4rem 2rem' } },
    h('div', { style: { maxWidth: '800px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '1.75rem', fontWeight: '700', textAlign: 'center',
          marginBottom: '3rem', color: 'var(--c3)'
        }
      }, 'Four steps to production'),

      // Steps container with vertical connector line
      h('div', {
        class: 'hiw-steps',
        style: { position: 'relative', paddingLeft: '4rem' }
      },
        // Vertical connector line
        h('div', {
          class: 'hiw-connector',
          'aria-hidden': 'true',
          style: {
            position: 'absolute', left: '1.5rem', top: '0', bottom: '0',
            width: '2px', background: 'var(--c5)'
          }
        }),

        ...steps.map((step, i) =>
          h('div', {
            class: 'hiw-step',
            style: {
              position: 'relative', marginBottom: i < steps.length - 1 ? '2.5rem' : '0'
            }
          },
            // Step number circle
            h('div', {
              class: 'hiw-number',
              style: {
                position: 'absolute', left: '-4rem', top: '0.5rem',
                width: '3rem', height: '3rem', borderRadius: '50%',
                background: step.accent, color: 'var(--c0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '800', fontSize: '0.875rem', zIndex: '1',
                boxShadow: `0 0 0 4px var(--c0), 0 0 0 6px ${step.accent}`
              }
            }, step.number),

            // Step card
            Card({ hoverable: true },
              h('h3', {
                style: { fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--c3)' }
              }, step.title),
              h('p', {
                style: { color: 'var(--c4)', lineHeight: '1.6', marginBottom: step.code || step.badges ? '1rem' : '0' }
              }, step.desc),
              step.code ? CodeBlock({ code: step.code, lang: 'bash' }) : null,
              step.badges ? h('div', { style: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' } },
                ...step.badges.map(b => Badge({}, b))
              ) : null
            )
          )
        )
      )
    )
  );
}

function FeaturesListSection() {
  return h('section', { style: { padding: '4rem 2rem', background: 'var(--c2)' } },
    h('div', { style: { maxWidth: '1100px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '1.75rem', fontWeight: '700', textAlign: 'center',
          marginBottom: '0.75rem', color: 'var(--c3)'
        }
      }, 'What you get'),
      h('p', {
        style: {
          textAlign: 'center', color: 'var(--c4)', marginBottom: '3rem',
          fontSize: '1.125rem'
        }
      }, 'A complete framework designed for AI to generate production-ready code.'),

      h('div', {
        class: 'hiw-features-grid',
        style: {
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem'
        }
      },
        ...scaffoldFeatures.map(f =>
          Card({ hoverable: true },
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

function PromptShowcaseSection() {
  return h('section', { style: { padding: '4rem 2rem' } },
    h('div', { style: { maxWidth: '900px', margin: '0 auto' } },
      h('h2', {
        style: {
          fontSize: '1.75rem', fontWeight: '700', textAlign: 'center',
          marginBottom: '0.75rem', color: 'var(--c3)'
        }
      }, 'AI prompts that just work'),
      h('p', {
        style: {
          textAlign: 'center', color: 'var(--c4)', marginBottom: '3rem',
          fontSize: '1.125rem', lineHeight: '1.6'
        }
      }, 'AGENTS.md maps every React/Vue/Angular pattern to decantr equivalents. Your AI generates correct code on the first try.'),

      h('div', {
        class: 'hiw-prompt-grid',
        style: {
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '2rem', alignItems: 'start'
        }
      },
        // Left: generated prompt
        h('div', null,
          h('p', {
            style: {
              fontSize: '0.6875rem', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--c4)', marginBottom: '0.75rem'
            }
          }, 'Generated Prompt'),
          h('div', {
            style: {
              border: '1px solid var(--c5)', borderRadius: 'var(--d-radius-lg, 8px)',
              overflow: 'hidden'
            }
          },
            h('div', {
              style: {
                padding: '0.625rem 1rem', background: 'var(--c2)',
                borderBottom: '1px solid var(--c5)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }
            },
              Badge({ status: 'success' }, 'AI Prompt'),
              h('span', {
                style: { fontSize: '0.75rem', color: 'var(--c4)' }
              }, 'describe what you want')
            ),
            CodeBlock({ code: examplePrompt })
          )
        ),

        // Right: what you can ask
        h('div', null,
          h('p', {
            style: {
              fontSize: '0.6875rem', fontWeight: '600', textTransform: 'uppercase',
              letterSpacing: '0.08em', color: 'var(--c4)', marginBottom: '0.75rem'
            }
          }, 'Or just ask naturally'),
          h('div', {
            style: {
              border: '1px solid var(--c5)', borderRadius: 'var(--d-radius-lg, 8px)',
              overflow: 'hidden'
            }
          },
            h('div', {
              style: {
                padding: '0.625rem 1rem', background: 'var(--c2)',
                borderBottom: '1px solid var(--c5)',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }
            },
              Badge({ status: 'processing' }, 'User Prompt'),
              h('span', {
                style: { fontSize: '0.75rem', color: 'var(--c4)' }
              }, 'paste into ChatGPT or Claude')
            ),
            CodeBlock({ code: customPromptExample })
          ),
          h('p', {
            style: {
              marginTop: '1rem', color: 'var(--c4)', fontSize: '0.875rem', lineHeight: '1.6'
            }
          },
            'Because decantr uses simple, predictable patterns \u2014 no JSX, no build magic, no framework abstractions \u2014 LLMs generate correct code on the first try.'
          )
        )
      )
    )
  );
}

function CTASection() {
  return h('section', {
    style: {
      padding: '4rem 2rem', background: 'var(--c2)',
      borderTop: '1px solid var(--c5)', textAlign: 'center'
    }
  },
    h('div', { style: { maxWidth: '600px', margin: '0 auto' } },
      h('h2', {
        style: { fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--c3)' }
      }, 'Ready to build?'),
      h('p', {
        style: { color: 'var(--c4)', marginBottom: '2rem', fontSize: '1.125rem', lineHeight: '1.6' }
      }, 'Install decantr, prompt your AI, and ship your first app in minutes.'),
      h('div', { style: { display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' } },
        link({ href: '/getting-started', style: { textDecoration: 'none' } },
          Button({ variant: 'primary', size: 'lg' }, 'Get Started')
        ),
        link({ href: '/cli', style: { textDecoration: 'none' } },
          Button({ size: 'lg' }, 'CLI Reference')
        )
      )
    )
  );
}

// --- Export ---

export function HowItWorks() {
  injectLandingStyles();
  injectHIWStyles();

  return h('div', null,
    HeroSection(),
    StepsSection(),
    FeaturesListSection(),
    PromptShowcaseSection(),
    CTASection()
  );
}
