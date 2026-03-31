import { setStyle, getStyleList } from '@decantr/ui/css';
import { Button, Card } from '@decantr/ui/components';
import { h } from '@decantr/ui/runtime';

function renderStylePreview(styleId, styleName) {
  return () => {
    setStyle(styleId);

    const container = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } });

    container.appendChild(
      h('div', { style: { fontSize: '13px', color: 'var(--d-muted-fg, #999)' } },
        `Style: ${styleName} (${styleId})`,
      ),
    );

    container.appendChild(
      Card(
        {},
        h('div', { style: { padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' } },
          h('p', null, `Showing components with the "${styleName}" style applied.`),
          h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
            Button({ variant: 'primary' }, 'Primary'),
            Button({ variant: 'secondary' }, 'Secondary'),
            Button({ variant: 'outline' }, 'Outline'),
            Button({ variant: 'ghost' }, 'Ghost'),
          ),
        ),
      ),
    );

    return container;
  };
}

const styleList = getStyleList();

const variants = styleList.map((s) => ({
  name: s.name,
  props: { _styleId: s.id, _styleName: s.name },
}));

// Fallback if no styles are registered yet
if (variants.length === 0) {
  variants.push({ name: 'No Styles', props: { _styleId: '', _styleName: 'None' } });
}

export default {
  component: (props) => {
    const id = props._styleId;
    const name = props._styleName || id;
    if (!id) {
      return h('div', { style: { color: 'var(--d-muted-fg, #999)' } }, 'No styles registered.');
    }
    return renderStylePreview(id, name)();
  },
  title: 'Styles',
  category: 'css',
  description: 'Shows all registered styles from getStyleList(). Each variant applies a different style and shows sample components.',
  variants,
  playground: {
    defaults: variants[0]?.props || {},
    controls: [
      { name: '_styleId', type: 'select', options: styleList.map((s) => s.id) },
    ],
  },
  usage: [
    {
      title: 'List and apply styles',
      code: `import { getStyleList, setStyle } from '@decantr/ui/css';

const styles = getStyleList();
console.log(styles); // [{ id: 'auradecantism', name: '...' }, ...]

setStyle(styles[0].id);`,
    },
  ],
};
