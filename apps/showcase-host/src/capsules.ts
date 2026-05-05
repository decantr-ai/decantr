import { showcaseCapsules, type ShowcaseCapsule } from 'virtual:showcase-capsules';

const capsuleModules = import.meta.glob('./capsules/*/src/main.tsx');

export type { ShowcaseCapsule };

export const capsules = showcaseCapsules;

export const capsulesBySlug = new Map(capsules.map((capsule) => [capsule.slug, capsule]));

export function getCapsule(slug: string | null | undefined): ShowcaseCapsule | null {
  if (!slug) return null;
  return capsulesBySlug.get(slug) ?? null;
}

export async function loadCapsule(slug: string): Promise<void> {
  const importer = capsuleModules[`./capsules/${slug}/src/main.tsx`];
  if (!importer) {
    throw new Error(`Unknown showcase capsule: ${slug}`);
  }
  await importer();
}
