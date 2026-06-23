const routes = ['/', '/reports'];

export function App() {
  const path = typeof window === 'undefined' ? '/' : window.location.pathname;
  const route = routes.includes(path) ? path : '/';

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="mx-auto grid max-w-4xl gap-5 p-8">
        <h1 className="text-3xl font-semibold">Route review</h1>
        <p className="text-slate-700">Current route: {route}</p>
        <a href="/reports" className="text-sky-700 underline">
          Open reports
        </a>
      </main>
    </>
  );
}
