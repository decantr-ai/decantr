import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] mt-24 py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-[var(--fg)] mb-3">Decantr</h3>
            <p className="text-[var(--fg-muted)] text-sm">Design Intelligence for AI-Generated UI</p>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--fg)] mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
              <li><Link href="/registry" className="hover:text-[var(--fg)]">Registry</Link></li>
              <li><Link href="/#pricing" className="hover:text-[var(--fg)]">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--fg)] mb-3 text-sm">Developers</h4>
            <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
              <li><a href="https://github.com/decantr/decantr-monorepo" className="hover:text-[var(--fg)]">GitHub</a></li>
              <li><a href="https://npmjs.com/org/decantr" className="hover:text-[var(--fg)]">npm</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-[var(--fg)] mb-3 text-sm">Legal</h4>
            <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
              <li><Link href="/privacy" className="hover:text-[var(--fg)]">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--fg)]">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-sm text-[var(--fg-dim)]">
          &copy; {new Date().getFullYear()} Decantr. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
