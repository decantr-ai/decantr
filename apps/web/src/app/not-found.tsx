import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--fg-dim)' }}>404</h1>
        <p className="text-xl mb-8" style={{ color: 'var(--fg-muted)' }}>Page not found</p>
        <div className="flex gap-4 justify-center">
          <Link href="/"><Button>Home</Button></Link>
          <Link href="/registry"><Button variant="secondary">Registry</Button></Link>
        </div>
      </div>
    </div>
  );
}
