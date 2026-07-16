import { type DiscoveryRouteStrategy, discoverProject } from '@decantr/verifier';

export interface RouteInfo {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface RoutesAnalysis {
  strategy: DiscoveryRouteStrategy;
  routes: RouteInfo[];
}

/**
 * Read the shared verifier discovery result used by scan, analyze, adopt, and task context.
 */
export function scanRoutes(projectRoot: string): RoutesAnalysis {
  const discovery = discoverProject(projectRoot);
  return {
    strategy: discovery.routes.strategy,
    routes: discovery.routes.taskableRoutes.map(({ path, file, hasLayout }) => ({
      path,
      file,
      hasLayout,
    })),
  };
}
