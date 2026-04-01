import { EssenceProvider, useEssence, useDensity, useGuardMode } from '@decantr/ui/essence';
import { Button, Card } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

const sampleEssence = {
  dna: { style: 'auradecantism', mode: 'light', density: 'comfortable' },
  guard: { mode: 'guided' },
};

const denseEssence = {
  dna: { style: 'auradecantism', mode: 'light', density: 'compact' },
  guard: { mode: 'strict' },
};

function BasicDemo() {
  return EssenceProvider({ essence: sampleEssence },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
      Card({ title: 'Themed Card' },
        h('p', null, 'This card inherits theme tokens from EssenceProvider.'),
      ),
      h('div', { style: { display: 'flex', gap: '8px' } },
        Button({ variant: 'primary' }, 'Primary'),
        Button({ variant: 'secondary' }, 'Secondary'),
      ),
    ),
  );
}

function NestedDemo() {
  return EssenceProvider({ essence: sampleEssence },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
      h('div', null,
        h('strong', { style: { fontSize: '13px' } }, 'Outer: comfortable density'),
        h('div', { style: { display: 'flex', gap: '8px', marginTop: '8px' } },
          Button({ variant: 'primary' }, 'Comfortable'),
          Button({ variant: 'outline' }, 'Comfortable'),
        ),
      ),
      EssenceProvider({ essence: denseEssence },
        h('div', null,
          h('strong', { style: { fontSize: '13px' } }, 'Inner: compact density override'),
          h('div', { style: { display: 'flex', gap: '4px', marginTop: '8px' } },
            Button({ variant: 'primary', size: 'sm' }, 'Compact'),
            Button({ variant: 'outline', size: 'sm' }, 'Compact'),
          ),
        ),
      ),
    ),
  );
}

function GuardDemo() {
  const strictEssence = {
    dna: { style: 'auradecantism', mode: 'dark', density: 'comfortable' },
    guard: { mode: 'strict' },
  };
  return EssenceProvider({ essence: strictEssence },
    h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
      h('strong', { style: { fontSize: '13px' } }, 'Strict guard mode — drift is enforced'),
      Card({ title: 'Guarded Component' },
        h('p', null, 'Components inside this provider are validated against the Essence spec.'),
      ),
    ),
  );
}

export default {
  component: (props) => {
    if (props._variant === 'nested') return NestedDemo();
    if (props._variant === 'guard') return GuardDemo();
    return BasicDemo();
  },
  title: 'EssenceProvider',
  category: 'css',
  description: 'Shows how EssenceProvider wraps an app and auto-applies theme tokens. Nested providers can override density, and guard mode enforces drift rules.',
  variants: [
    { name: 'Basic', props: {} },
    { name: 'Nested Density Override', props: { _variant: 'nested' } },
    { name: 'Guard Mode Enforcement', props: { _variant: 'guard' } },
  ],
  usage: [
    {
      title: 'Basic usage',
      code: `import { mount } from '@decantr/ui/runtime'
import { EssenceProvider } from '@decantr/ui/essence'
import { Button } from '@decantr/ui/components'
import essence from './essence.json'

mount(root, () =>
  EssenceProvider({ essence },
    Button({ variant: 'primary' }, 'Themed Button')
  )
)`,
    },
    {
      title: 'Nested providers with density override',
      code: `import { EssenceProvider } from '@decantr/ui/essence'
import { Card } from '@decantr/ui/components'

EssenceProvider({ essence: outerEssence },
  Card({ title: 'Comfortable' }, 'Default density'),
  EssenceProvider({ essence: { ...outerEssence, dna: { ...outerEssence.dna, density: 'compact' } } },
    Card({ title: 'Compact' }, 'Overridden density'),
  ),
)`,
    },
    {
      title: 'Guard mode enforcement',
      code: `import { EssenceProvider, useGuardMode } from '@decantr/ui/essence'

const essence = {
  dna: { style: 'auradecantism', mode: 'dark', density: 'comfortable' },
  guard: { mode: 'strict' },
}

EssenceProvider({ essence },
  // All children are validated against guard rules
  MyApp()
)`,
    },
  ],
};
