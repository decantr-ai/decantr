'use client';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--fg-dim)' }}>500</h1>
        <p className="text-xl mb-2" style={{ color: 'var(--fg-muted)' }}>Something went wrong</p>
        <p className="text-sm mb-8" style={{ color: 'var(--fg-dim)' }}>{error.message}</p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
