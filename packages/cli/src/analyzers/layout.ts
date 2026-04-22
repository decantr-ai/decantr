import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export interface LayoutAnalysis {
  hasSidebar: boolean;
  hasTopNav: boolean;
  hasFooter: boolean;
  shellPattern: string;
}

const SIDEBAR_PATTERNS = ['sidebar', 'side-bar', 'sidenav', 'side-nav', 'drawer', 'aside'];
const NAV_PATTERNS = ['nav', 'navbar', 'header', 'top-bar', 'topbar', 'app-bar', 'appbar'];
const FOOTER_PATTERNS = ['footer', 'bottom-bar', 'bottombar'];

/**
 * Check if a string contains any of the given patterns (case-insensitive).
 */
function containsPattern(text: string, patterns: string[]): boolean {
  const lower = text.toLowerCase();
  return patterns.some(p => lower.includes(p));
}

/**
 * Check component directories for files matching layout patterns.
 */
function checkComponentDirs(projectRoot: string): { sidebar: boolean; nav: boolean; footer: boolean } {
  const result = { sidebar: false, nav: false, footer: false };

  const componentDirs = [
    join(projectRoot, 'src', 'components'),
    join(projectRoot, 'components'),
    join(projectRoot, 'src', 'ui'),
  ];

  for (const dir of componentDirs) {
    if (!existsSync(dir)) continue;

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }

    for (const entry of entries) {
      const lower = entry.toLowerCase();
      if (SIDEBAR_PATTERNS.some(p => lower.includes(p))) result.sidebar = true;
      if (NAV_PATTERNS.some(p => lower.includes(p))) result.nav = true;
      if (FOOTER_PATTERNS.some(p => lower.includes(p))) result.footer = true;
    }
  }

  return result;
}

/**
 * Read root layout files and check for sidebar/nav/footer references.
 */
function checkLayoutFiles(projectRoot: string): { sidebar: boolean; nav: boolean; footer: boolean } {
  const result = { sidebar: false, nav: false, footer: false };

  const layoutPaths = [
    join(projectRoot, 'src', 'app', 'layout.tsx'),
    join(projectRoot, 'src', 'app', 'layout.jsx'),
    join(projectRoot, 'app', 'layout.tsx'),
    join(projectRoot, 'app', 'layout.jsx'),
  ];

  for (const layoutPath of layoutPaths) {
    if (!existsSync(layoutPath)) continue;

    let content: string;
    try {
      content = readFileSync(layoutPath, 'utf-8');
    } catch {
      continue;
    }

    if (containsPattern(content, SIDEBAR_PATTERNS)) result.sidebar = true;
    if (containsPattern(content, NAV_PATTERNS)) result.nav = true;
    if (containsPattern(content, FOOTER_PATTERNS)) result.footer = true;
  }

  // Also check sub-layouts (e.g., dashboard/layout.tsx)
  const subLayoutDirs = ['dashboard', 'admin', 'app'];
  for (const sub of subLayoutDirs) {
    const paths = [
      join(projectRoot, 'src', 'app', sub, 'layout.tsx'),
      join(projectRoot, 'src', 'app', sub, 'layout.jsx'),
      join(projectRoot, 'app', sub, 'layout.tsx'),
      join(projectRoot, 'app', sub, 'layout.jsx'),
    ];

    for (const layoutPath of paths) {
      if (!existsSync(layoutPath)) continue;

      let content: string;
      try {
        content = readFileSync(layoutPath, 'utf-8');
      } catch {
        continue;
      }

      if (containsPattern(content, SIDEBAR_PATTERNS)) result.sidebar = true;
      if (containsPattern(content, NAV_PATTERNS)) result.nav = true;
      if (containsPattern(content, FOOTER_PATTERNS)) result.footer = true;
    }
  }

  return result;
}

/**
 * Infer the shell pattern from layout components.
 */
function inferShellPattern(hasSidebar: boolean, hasTopNav: boolean, hasFooter: boolean): string {
  if (hasSidebar && hasTopNav && hasFooter) return 'sidebar-topnav-main-footer';
  if (hasSidebar && hasTopNav) return 'sidebar-topnav-main';
  if (hasSidebar && hasFooter) return 'sidebar-main-footer';
  if (hasSidebar) return 'sidebar-main';
  if (hasTopNav && hasFooter) return 'topnav-main-footer';
  if (hasTopNav) return 'topnav-main';
  if (hasFooter) return 'main-footer';
  return 'main-only';
}

function inferShellPatternFromDecantrContract(projectRoot: string): string | null {
  const essencePath = join(projectRoot, 'decantr.essence.json');
  if (!existsSync(essencePath)) return null;

  try {
    const essence = JSON.parse(readFileSync(essencePath, 'utf-8')) as {
      blueprint?: {
        shell?: string;
        sections?: Array<{ id?: string; role?: string; shell?: string }>;
      };
    };

    const sectionShells = essence.blueprint?.sections
      ?.map((section) => section.shell)
      .filter((shell): shell is string => typeof shell === 'string' && shell.length > 0) ?? [];

    if (sectionShells.length === 0 && essence.blueprint?.shell) {
      return `${essence.blueprint.shell} (contract)`;
    }

    const uniqueShells = [...new Set(sectionShells)];
    if (uniqueShells.length === 0) return null;
    if (uniqueShells.length === 1) return `${uniqueShells[0]} (contract)`;

    const primarySection = essence.blueprint?.sections?.find((section) => section.role === 'primary' && section.shell);
    if (primarySection?.shell) {
      return `${primarySection.shell} (primary contract)`;
    }

    return `${uniqueShells[0]} (+${uniqueShells.length - 1} shells, contract)`;
  } catch {
    return null;
  }
}

/**
 * Scan for layout patterns (sidebar, top nav, footer) in the project.
 */
export function scanLayout(projectRoot: string): LayoutAnalysis {
  const fromComponents = checkComponentDirs(projectRoot);
  const fromLayouts = checkLayoutFiles(projectRoot);

  const hasSidebar = fromComponents.sidebar || fromLayouts.sidebar;
  const hasTopNav = fromComponents.nav || fromLayouts.nav;
  const hasFooter = fromComponents.footer || fromLayouts.footer;

  const runtimeShellPattern = inferShellPattern(hasSidebar, hasTopNav, hasFooter);
  const contractShellPattern = inferShellPatternFromDecantrContract(projectRoot);

  return {
    hasSidebar,
    hasTopNav,
    hasFooter,
    shellPattern: runtimeShellPattern === 'main-only' && contractShellPattern
      ? contractShellPattern
      : runtimeShellPattern,
  };
}
