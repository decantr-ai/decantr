import { setStyle, setMode, setShape, getStyleList } from '@decantr/ui/css';
import { Button, Card } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

function buildPanel() {
  const container = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } });

  // Style buttons
  const styleSection = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
  styleSection.appendChild(h('strong', { style: { fontSize: '13px' } }, 'Styles'));
  const styleRow = h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } });
  for (const s of getStyleList()) {
    styleRow.appendChild(
      Button({ variant: 'outline', size: 'sm', onClick: () => setStyle(s.id) }, s.name),
    );
  }
  styleSection.appendChild(styleRow);
  container.appendChild(styleSection);

  // Mode buttons
  const modeSection = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
  modeSection.appendChild(h('strong', { style: { fontSize: '13px' } }, 'Mode'));
  const modeRow = h('div', { style: { display: 'flex', gap: '8px' } });
  for (const mode of ['light', 'dark', 'auto']) {
    modeRow.appendChild(
      Button({ variant: 'outline', size: 'sm', onClick: () => setMode(mode) }, mode),
    );
  }
  modeSection.appendChild(modeRow);
  container.appendChild(modeSection);

  // Shape buttons
  const shapeSection = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
  shapeSection.appendChild(h('strong', { style: { fontSize: '13px' } }, 'Shape'));
  const shapeRow = h('div', { style: { display: 'flex', gap: '8px' } });
  for (const shape of [null, 'sharp', 'rounded', 'pill']) {
    shapeRow.appendChild(
      Button(
        { variant: 'outline', size: 'sm', onClick: () => setShape(shape) },
        shape || 'default',
      ),
    );
  }
  shapeSection.appendChild(shapeRow);
  container.appendChild(shapeSection);

  // Sample components to show the effect
  const preview = h('div', { style: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } });
  preview.appendChild(h('strong', { style: { fontSize: '13px' } }, 'Preview'));
  preview.appendChild(
    Card(
      {},
      h('div', { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } },
        h('p', null, 'This card and button reflect the current theme settings.'),
        h('div', { style: { display: 'flex', gap: '8px' } },
          Button({ variant: 'primary' }, 'Primary'),
          Button({ variant: 'secondary' }, 'Secondary'),
          Button({ variant: 'destructive' }, 'Destructive'),
        ),
      ),
    ),
  );
  container.appendChild(preview);

  return container;
}

export default {
  component: () => buildPanel(),
  title: 'Theme Switcher',
  category: 'css',
  description: 'Interactive panel for switching styles, modes, and shapes. Shows how the theme system works with live preview.',
  variants: [
    { name: 'Default', props: {} },
  ],
  usage: [
    {
      title: 'Switch style',
      code: `import { setStyle, getStyleList } from '@decantr/ui/css';

// List available styles
console.log(getStyleList()); // [{ id: 'auradecantism', name: '...' }, ...]

// Apply a style
setStyle('auradecantism');`,
    },
    {
      title: 'Switch mode and shape',
      code: `import { setMode, setShape } from '@decantr/ui/css';

setMode('dark');    // 'light' | 'dark' | 'auto'
setShape('pill');   // 'sharp' | 'rounded' | 'pill' | null`,
    },
  ],
};
