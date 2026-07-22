import { type DiscoveryRouteStrategy, discoverProject } from '@decantr/verifier';

export interface RouteInfo {
  path: string;
  file: string;
  hasLayout: boolean;
}

export interface RoutesAnalysis {
  strategy: DiscoveryRouteStrategy;
  routes: RouteInfo[];
  candidateRoutes: RouteInfo[];
  authority: 'proven' | 'inferred' | 'unresolved';
  completeness: 'complete' | 'partial' | 'unknown';
  limitations: string[];
}

/**
 * Read the shared verifier discovery result used by scan, analyze, adopt, and task context.
 */
export function scanRoutes(projectRoot: string): RoutesAnalysis {
  const discovery = discoverProject(projectRoot);
  const candidateRoutes = discovery.routes.taskableRoutes.map(({ path, file, hasLayout }) => ({
    path,
    file,
    hasLayout,
  }));
  return {
    strategy: discovery.routes.strategy,
    routes: discovery.routes.authority === 'proven' ? candidateRoutes : [],
    candidateRoutes,
    authority: discovery.routes.authority,
    completeness: discovery.routes.completeness,
    limitations: discovery.routes.limitations,
  };
}
