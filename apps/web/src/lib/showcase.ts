const AVAILABLE_SHOWCASES = new Set([
  'carbon-ai-portal',
  'terminal-dashboard',
]);

export function hasShowcase(blueprintSlug: string): boolean {
  return AVAILABLE_SHOWCASES.has(blueprintSlug);
}

export function getShowcaseUrl(blueprintSlug: string): string {
  return `/showcase/${blueprintSlug}/`;
}
