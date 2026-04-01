import { CodeBlock } from '@decantr/ui/components';

const sampleJS = `function greet(name) {
  return 'Hello, ' + name + '!';
}

console.log(greet('World'));`;

const sampleHTML = `<div class="container">
  <h1>Hello</h1>
  <p>Welcome to the app.</p>
</div>`;

const longCode = Array.from({ length: 30 }, (_, i) => `// Line ${i + 1}: some code here`).join('\n');

export default {
  component: (props) => CodeBlock(props, props._code || sampleJS),
  title: 'CodeBlock',
  category: 'components/media',
  description: 'Structured code display with line numbers, copy button, and language label.',
  variants: [
    { name: 'Default', props: { _code: sampleJS } },
    { name: 'With Language', props: { language: 'javascript', _code: sampleJS } },
    { name: 'Line Numbers', props: { language: 'javascript', lineNumbers: true, _code: sampleJS } },
    { name: 'No Copy Button', props: { language: 'javascript', copyable: false, _code: sampleJS } },
    { name: 'HTML', props: { language: 'html', lineNumbers: true, _code: sampleHTML } },
    { name: 'Max Height', props: { language: 'javascript', lineNumbers: true, maxHeight: 150, _code: longCode } },
    { name: 'Plain Text', props: { _code: 'Just some plain text output.' } },
  ],
  playground: {
    defaults: { language: 'javascript', lineNumbers: false, copyable: true, _code: sampleJS },
    controls: [
      { name: 'language', type: 'text' },
      { name: 'lineNumbers', type: 'boolean' },
      { name: 'copyable', type: 'boolean' },
      { name: 'maxHeight', type: 'number' },
    ],
  },
  usage: [
    {
      title: 'Basic code display',
      code: `import { CodeBlock } from '@decantr/ui/components';

const block = CodeBlock(
  { language: 'javascript', lineNumbers: true },
  'const x = 42;\\nconsole.log(x);'
);
document.body.appendChild(block);`,
    },
    {
      title: 'With external highlighter',
      code: `import { CodeBlock } from '@decantr/ui/components';
import { createHighlighter } from '@decantr/ui/components';

const block = CodeBlock(
  { language: 'js', highlight: createHighlighter },
  'const fn = () => "hello";'
);`,
    },
  ],
};
