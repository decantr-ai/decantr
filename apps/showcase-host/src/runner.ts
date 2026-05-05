import { getCapsule, loadCapsule } from './capsules';

function parseSlugFromPathname(pathname: string): string | null {
  const parts = pathname
    .replace(/^\/showcase\/?/, '')
    .split('/')
    .filter(Boolean);
  return parts[0] ?? null;
}

export async function runCapsule(): Promise<void> {
  const slug = parseSlugFromPathname(window.location.pathname);
  const capsule = getCapsule(slug);
  if (!capsule) {
    throw new Error(`Unknown showcase capsule "${slug ?? ''}".`);
  }

  document.documentElement.dataset.showcaseCapsule = capsule.slug;
  document.title = `${capsule.title} | Decantr Showcase`;
  await loadCapsule(capsule.slug);
}
