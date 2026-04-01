/**
 * Icon data registry — internal API for icon path lookup.
 * Essential icons (~50) are always available.
 * Additional icons added via registerIcon() or bulk-imported via tools/icons.js.
 */
import { ESSENTIAL } from './essential.js';

const icons = new Map<string, string>(Object.entries(ESSENTIAL));

export function getIconPath(name: string): string | null {
  return icons.get(name) || null;
}

export function registerIcon(name: string, pathData: string): void {
  icons.set(name, pathData);
}

export function registerIcons(iconMap: Record<string, string>): void {
  for (const [k, v] of Object.entries(iconMap)) {
    icons.set(k, v);
  }
}

export function hasIcon(name: string): boolean {
  return icons.has(name);
}

export function getIconNames(): string[] {
  return [...icons.keys()];
}
