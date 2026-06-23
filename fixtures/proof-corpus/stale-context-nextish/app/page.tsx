export default function HomePage() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <main id="main" className="mx-auto grid max-w-4xl gap-4 p-8">
        <h1 className="text-3xl font-semibold">Portal overview</h1>
        <p className="text-slate-700">This fixture behaves like a small Brownfield Next app.</p>
        <a href="/settings" className="text-sky-700 underline">
          Settings
        </a>
      </main>
    </>
  );
}
