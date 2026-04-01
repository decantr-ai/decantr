/** Router types — placeholder until router is migrated to TypeScript */

export declare function createRouter(config: Record<string, unknown>): unknown;
export declare function navigate(path: string, options?: Record<string, unknown>): void;
export declare function useRoute(): { path: () => string; params: () => Record<string, string>; query: () => Record<string, string> };
