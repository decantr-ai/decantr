import { Button } from './components/PrimaryButton';
import { StandaloneAction } from './StandaloneAction';

export function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="mx-auto grid max-w-5xl gap-6 p-8">
      <section className="grid gap-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Operations</p>
        <h1 className="text-3xl font-semibold text-slate-950">Review queue</h1>
        <p className="max-w-2xl text-slate-700">
          This fixture preserves a project-owned button primitive so Decantr can catch raw
          replacement controls in Brownfield edits.
        </p>
      </section>
      <section className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-950">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Approve selected</Button>
          <StandaloneAction />
        </div>
      </section>
      </main>
    </>
  );
}
