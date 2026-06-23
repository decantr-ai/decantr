import type { ReactNode } from 'react';

export function Button({ children }: { children: ReactNode }) {
  const label = typeof children === 'string' ? children : 'Project action';

  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500"
    >
      {children}
    </button>
  );
}
