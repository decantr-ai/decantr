import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface FeaturesAnalysis {
  detected: string[];
  evidence: Record<string, string[]>;
}

/**
 * Feature detection patterns.
 * Each feature maps to route/file name fragments that indicate its presence.
 */
const FEATURE_PATTERNS: Record<string, string[]> = {
  auth: [
    'login',
    'signin',
    'sign-in',
    'signup',
    'sign-up',
    'register',
    'auth',
    'callback',
    'signout',
    'sign-out',
    'logout',
    'forgot-password',
    'reset-password',
    'verify-email',
  ],
  dashboard: ['dashboard', 'overview', 'analytics', 'metrics', 'stats'],
  settings: ['settings', 'preferences', 'configuration', 'config', 'account'],
  profile: ['profile', 'user', 'me', 'avatar'],
  billing: [
    'billing',
    'subscription',
    'pricing',
    'plans',
    'checkout',
    'payment',
    'stripe',
    'invoice',
  ],
  admin: ['admin', 'moderation', 'moderate', 'manage-users'],
  chat: ['chat', 'messaging', 'messages', 'conversations', 'inbox'],
  search: ['search', 'explore', 'browse', 'discover'],
  notifications: ['notifications', 'alerts', 'announcements'],
  'file-upload': ['upload', 'files', 'media', 'gallery', 'images'],
  'api-keys': ['api-keys', 'api-key', 'tokens', 'keys', 'developer'],
  team: ['team', 'organization', 'org', 'workspace', 'members', 'invite'],
  content: ['content', 'posts', 'articles', 'blog', 'cms', 'editor'],
  registry: ['registry', 'marketplace', 'store', 'catalog', 'library'],
};

/**
 * Recursively collect all directory and file names under the given path.
 * Returns paths relative to the base directory.
 */
function collectPaths(dir: string, baseDir: string, depth: number = 0): string[] {
  if (depth > 5) return [];

  const paths: string[] = [];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return paths;
  }

  for (const entry of entries) {
    if (
      entry.startsWith('.') ||
      entry.startsWith('_') ||
      entry === 'node_modules' ||
      entry === 'api'
    )
      continue;
    const fullPath = join(dir, entry);

    // Store relative path
    const relPath = fullPath.slice(baseDir.length + 1);
    paths.push(relPath);

    try {
      if (statSync(fullPath).isDirectory()) {
        paths.push(...collectPaths(fullPath, baseDir, depth + 1));
      }
    } catch {}
  }

  return paths;
}

/**
 * Scan for features by matching route/file names against known patterns.
 */
export function scanFeatures(projectRoot: string): FeaturesAnalysis {
  const detected: string[] = [];
  const evidence: Record<string, string[]> = {};

  // Collect paths from app directories and component directories
  const scanDirs = [
    join(projectRoot, 'src', 'app'),
    join(projectRoot, 'app'),
    join(projectRoot, 'src', 'pages'),
    join(projectRoot, 'pages'),
    join(projectRoot, 'src', 'components'),
    join(projectRoot, 'components'),
  ];

  const allPaths: string[] = [];
  for (const dir of scanDirs) {
    if (existsSync(dir)) {
      allPaths.push(...collectPaths(dir, projectRoot));
    }
  }

  // Match paths against feature patterns
  for (const [feature, patterns] of Object.entries(FEATURE_PATTERNS)) {
    const matches: string[] = [];

    for (const filePath of allPaths) {
      const segments = filePath.toLowerCase().split(/[\\/]/);
      for (const pattern of patterns) {
        if (segments.some((seg) => seg === pattern || seg.includes(pattern))) {
          matches.push(filePath);
          break;
        }
      }
    }

    if (matches.length > 0) {
      detected.push(feature);
      // Deduplicate and limit evidence
      evidence[feature] = [...new Set(matches)].slice(0, 5);
    }
  }

  return { detected, evidence };
}
