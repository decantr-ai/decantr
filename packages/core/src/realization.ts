import type { BlueprintPage, EssenceV4, LayoutItem } from '@decantr/essence-spec';
import { isV4 } from '@decantr/essence-spec';
import { resolvePackAdapter } from './packs.js';

export type RealizationAdapter = 'react-vite' | 'next-app' | 'generic-web' | string;

export interface RealizationRoute {
  path: string;
  sectionId: string;
  sectionRole: string;
  pageId: string;
  shell: string;
  patterns: string[];
  states: Array<'empty' | 'loading' | 'error'>;
}

export interface RealizationMockDataSeed {
  id: string;
  source: 'feature' | 'route';
  shape: Record<string, unknown>;
}

export interface RealizationInteractionPlaceholder {
  id: string;
  kind: 'command-palette' | 'hotkey' | 'auth-mock' | 'route-action';
  route?: string;
  label: string;
}

export interface RealizationPlan {
  version: '1.0.0';
  sourceEssenceVersion: '4.0.0';
  adapter: RealizationAdapter;
  canRealizeFrameworkCode: boolean;
  routes: RealizationRoute[];
  shell: {
    id: string;
    theme: string;
    mode: string;
  };
  mockData: RealizationMockDataSeed[];
  interactions: RealizationInteractionPlaceholder[];
  unsupportedReason?: string;
}

const CERTIFIED_REALIZATION_ADAPTERS = new Set(['react-vite', 'next-app']);

function routePath(page: BlueprintPage, fallbackIndex: number): string {
  if (page.route) return page.route;
  if (page.id === 'home' || fallbackIndex === 0) return '/';
  return `/${page.id}`;
}

function patternIds(layout: LayoutItem[]): string[] {
  const ids = new Set<string>();
  for (const item of layout) {
    if (typeof item === 'string') {
      ids.add(item);
    } else if ('pattern' in item) {
      ids.add(item.pattern);
    } else if ('cols' in item) {
      for (const col of item.cols) {
        ids.add(typeof col === 'string' ? col : col.pattern);
      }
    }
  }
  return [...ids];
}

export function compileRealizationPlan(essence: EssenceV4): RealizationPlan {
  if (!isV4(essence)) {
    throw new Error(
      'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.',
    );
  }

  const packAdapter = resolvePackAdapter(essence.meta.target, essence.meta.platform.type);
  const adapter = essence.meta.target === 'nextjs' ? 'next-app' : packAdapter;
  const canRealizeFrameworkCode = CERTIFIED_REALIZATION_ADAPTERS.has(adapter);
  const routes: RealizationRoute[] = [];

  for (const section of essence.blueprint.sections) {
    section.pages.forEach((page, pageIndex) => {
      routes.push({
        path: routePath(page, routes.length + pageIndex),
        sectionId: section.id,
        sectionRole: section.role,
        pageId: page.id,
        shell: (page.shell_override ?? section.shell) as string,
        patterns: patternIds(page.layout),
        states: ['empty', 'loading', 'error'],
      });
    });
  }

  const mockData: RealizationMockDataSeed[] = [
    ...essence.blueprint.features.map((feature) => ({
      id: feature,
      source: 'feature' as const,
      shape: { enabled: true, status: 'mocked' },
    })),
    ...routes.map((route) => ({
      id: route.pageId,
      source: 'route' as const,
      shape: { title: route.pageId, items: [] },
    })),
  ];

  const navigation = essence.meta.navigation;
  const interactions: RealizationInteractionPlaceholder[] = [
    {
      id: 'auth-mock',
      kind: 'auth-mock',
      label: 'Authenticated user/session placeholder',
    },
  ];

  if (navigation?.command_palette) {
    interactions.push({
      id: 'command-palette',
      kind: 'command-palette',
      label: 'Command palette placeholder',
    });
  }

  for (const hotkey of navigation?.hotkeys ?? []) {
    interactions.push({
      id: `hotkey-${hotkey.key}`,
      kind: 'hotkey',
      route: hotkey.route,
      label: hotkey.label,
    });
  }

  return {
    version: '1.0.0',
    sourceEssenceVersion: '4.0.0',
    adapter,
    canRealizeFrameworkCode,
    routes,
    shell: {
      id: (essence.blueprint.shell ??
        essence.blueprint.sections[0]?.shell ??
        'sidebar-main') as string,
      theme: essence.dna.theme.id,
      mode: essence.dna.theme.mode,
    },
    mockData,
    interactions,
    ...(canRealizeFrameworkCode
      ? {}
      : {
          unsupportedReason:
            'No certified realization adapter is available for this target yet. Use the V4 contract, execution packs, prompts, and Project Health without generated framework code.',
        }),
  };
}
