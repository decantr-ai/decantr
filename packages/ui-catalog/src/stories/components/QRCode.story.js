import { QRCode } from '@decantr/ui/components';

export default {
  component: (props) => QRCode({ value: props._value || 'https://decantr.dev', ...props }),
  title: 'QRCode',
  category: 'components/data-display',
  description: 'QR code generator with canvas/SVG rendering, customizable colors, error correction levels, center logo, and status overlays.',
  variants: [
    { name: 'Default', props: { _value: 'https://decantr.dev' } },
    { name: 'Large', props: { _value: 'https://decantr.dev', size: 240 } },
    { name: 'Small', props: { _value: 'https://decantr.dev', size: 100 } },
    { name: 'SVG Render', props: { _value: 'https://decantr.dev', type: 'svg' } },
    { name: 'Custom Colors', props: { _value: 'https://decantr.dev', color: '#7c3aed', bgColor: '#faf5ff' } },
    { name: 'High Error Correction', props: { _value: 'https://decantr.dev', level: 'H' } },
    { name: 'No Border', props: { _value: 'https://decantr.dev', bordered: false } },
    { name: 'Loading Status', props: { _value: 'https://decantr.dev', status: 'loading' } },
    { name: 'Expired Status', props: { _value: 'https://decantr.dev', status: 'expired' } },
    { name: 'Scanned Status', props: { _value: 'https://decantr.dev', status: 'scanned' } },
  ],
  playground: {
    defaults: { _value: 'https://decantr.dev', size: 160 },
    controls: [
      { name: '_value', type: 'text' },
      { name: 'size', type: 'number' },
      { name: 'type', type: 'select', options: ['canvas', 'svg'] },
      { name: 'level', type: 'select', options: ['L', 'M', 'Q', 'H'] },
      { name: 'color', type: 'color' },
      { name: 'bgColor', type: 'color' },
      { name: 'bordered', type: 'boolean' },
      { name: 'padding', type: 'number' },
      { name: 'status', type: 'select', options: ['active', 'loading', 'expired', 'scanned'] },
    ],
  },
  usage: [
    {
      title: 'Basic QR code',
      code: `import { QRCode } from '@decantr/ui/components';

const qr = QRCode({ value: 'https://example.com' });
document.body.appendChild(qr);`,
    },
    {
      title: 'SVG with custom colors',
      code: `import { QRCode } from '@decantr/ui/components';

const qr = QRCode({
  value: 'https://example.com',
  type: 'svg',
  color: '#1e40af',
  bgColor: '#eff6ff',
  size: 200,
});`,
    },
    {
      title: 'With status overlay',
      code: `import { QRCode } from '@decantr/ui/components';
import { createSignal } from '@decantr/ui';

const [status, setStatus] = createSignal('active');
const qr = QRCode({
  value: 'https://example.com',
  status,
  onRefresh: () => setStatus('active'),
});`,
    },
  ],
};
