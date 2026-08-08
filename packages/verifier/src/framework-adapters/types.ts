export type FrameworkRouteAuthority = 'proven' | 'inferred' | 'unresolved';
export type FrameworkRouteCompleteness = 'complete' | 'partial' | 'unknown';

export interface FrameworkRouteSignalInput {
  file: string;
  declarationFile?: string;
  corroborationFile?: string;
  evidence?: string;
  kind: string;
  taskable: boolean;
}

export interface FrameworkRouteAuthorityInput {
  projectRoot: string;
  framework: string;
  strategy: string;
  dependencies: Record<string, string>;
  signals: FrameworkRouteSignalInput[];
  angular?: {
    authority: FrameworkRouteAuthority;
    completeness: FrameworkRouteCompleteness;
    authorityFiles: string[];
    evidence: string[];
    limitations: string[];
  } | null;
}

export interface FrameworkRouteAuthorityResult {
  adapter: string;
  authority: FrameworkRouteAuthority;
  completeness: FrameworkRouteCompleteness;
  authorityFiles: string[];
  evidence: string[];
  limitations: string[];
}
