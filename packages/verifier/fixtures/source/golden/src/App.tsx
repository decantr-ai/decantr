import { Button as PrimaryButton } from '@/ui/Button';
import { helperCopy } from './copy.js';

const routes = ['/', '/settings'];

export function App() {
  return (
    <main className="d-panel" data-route={routes[1]}>
      <PrimaryButton label="Launch" />
      <span>{helperCopy}</span>
    </main>
  );
}
