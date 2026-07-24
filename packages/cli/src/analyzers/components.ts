import { discoverProject, type ProjectDiscovery } from '@decantr/verifier';

export interface ComponentsAnalysis {
  pageCount: number;
  componentCount: number;
  directories: string[];
}

/**
 * Reuse the verifier inventory so scan, analyze, and adopt report one component truth.
 */
export function scanComponents(
  projectRoot: string,
  discovery: ProjectDiscovery = discoverProject(projectRoot),
): ComponentsAnalysis {
  return {
    pageCount: discovery.components.pageCount,
    componentCount: discovery.components.componentCount,
    directories: discovery.components.directories,
  };
}
