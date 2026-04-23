#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const REPO_ROOT = process.cwd();
const REGISTRY_ROOT = join(REPO_ROOT, 'apps', 'registry');

const requiredFiles = [
  'src/lib/workspace-state.ts',
  'src/components/workspace-state-provider.tsx',
  'src/lib/admin-workspace.ts',
  'src/app/dashboard/layout.tsx',
  'src/app/admin/layout.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/billing/page.tsx',
  'src/app/dashboard/settings/page.tsx',
  'src/app/dashboard/content/page.tsx',
  'src/app/dashboard/content/new/page.tsx',
  'src/app/dashboard/api-keys/page.tsx',
  'src/app/dashboard/team/page.tsx',
  'src/app/dashboard/governance/page.tsx',
  'src/app/dashboard/private-registry/page.tsx',
  'src/app/admin/moderation/page.tsx',
  'src/app/admin/moderation/[id]/page.tsx',
  'src/app/admin/organizations/page.tsx',
  'src/app/admin/organizations/[slug]/page.tsx',
  'src/app/admin/reports/page.tsx',
];

const sourceChecks = [
  {
    name: 'workspace-state-server-helper',
    file: 'src/lib/workspace-state.ts',
    patterns: [
      'export async function getWorkspaceState',
      'toClientWorkspaceState',
      'canAccessPrivateRegistry',
      'canAccessAdmin',
      'canUseOrganizationFeatures',
    ],
  },
  {
    name: 'dashboard-layout-uses-shared-workspace',
    file: 'src/app/dashboard/layout.tsx',
    patterns: [
      'getWorkspaceState',
      'WorkspaceStateProvider',
      'toClientWorkspaceState',
      '<Sidebar workspace=',
      '<CommandPalette workspace=',
    ],
  },
  {
    name: 'admin-layout-uses-shared-workspace',
    file: 'src/app/admin/layout.tsx',
    patterns: [
      'getWorkspaceState',
      'WorkspaceStateProvider',
      'toClientWorkspaceState',
      '<Sidebar workspace=',
      '<CommandPalette workspace=',
    ],
  },
  {
    name: 'sidebar-uses-capabilities',
    file: 'src/components/sidebar.tsx',
    patterns: [
      'WorkspaceSnapshot',
      'workspace.capabilities.canAccessTeam',
      'workspace.capabilities.canAccessGovernance',
      'workspace.capabilities.canAccessPrivateRegistry',
      'workspace.capabilities.canAccessAdmin',
      'workspace.identity.shortLabel',
      'workspace.identity.tierLabel',
    ],
  },
  {
    name: 'command-palette-uses-capabilities',
    file: 'src/components/command-palette.tsx',
    patterns: [
      'WorkspaceSnapshot',
      'props.workspace.capabilities.canAccessTeam',
      'props.workspace.capabilities.canAccessGovernance',
      'props.workspace.capabilities.canAccessPrivateRegistry',
      'props.workspace.capabilities.canAccessAdmin',
    ],
  },
  {
    name: 'billing-uses-workspace-state',
    file: 'src/app/dashboard/billing/page.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.billing',
      'workspace.tier',
      'workspace.entitlements',
      'workspace.capabilities.canAccessPrivateRegistry',
    ],
  },
  {
    name: 'settings-uses-workspace-identity',
    file: 'src/components/account-settings.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.identity.displayName',
      'workspace.identity.username',
      'workspace.identity.email',
      'workspace.identity.initials',
    ],
  },
  {
    name: 'content-new-gates-org-target',
    file: 'src/app/dashboard/content/new/page.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.capabilities.canUseOrganizationFeatures',
      'workspace.activeOrganization',
    ],
  },
  {
    name: 'api-keys-gates-org-target',
    file: 'src/app/dashboard/api-keys/page.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.capabilities.canUseOrganizationFeatures',
      'workspace.activeOrganization',
    ],
  },
  {
    name: 'team-gates-org-collaboration',
    file: 'src/app/dashboard/team/page.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.capabilities.canAccessTeam',
      'workspace.organizations',
      'workspace.activeOrganization',
    ],
  },
  {
    name: 'governance-gates-org-collaboration',
    file: 'src/components/org-governance-panel.tsx',
    patterns: [
      'useWorkspaceState',
      'workspace.capabilities.canAccessGovernance',
      'workspace.organizations',
      'workspace.activeOrganization',
    ],
  },
  {
    name: 'private-registry-gates-enterprise',
    file: 'src/app/dashboard/private-registry/page.tsx',
    patterns: [
      'getWorkspaceState',
      'workspace?.capabilities.canAccessPrivateRegistry',
      'enterpriseOrgs',
    ],
  },
  {
    name: 'admin-context-helper',
    file: 'src/lib/admin-workspace.ts',
    patterns: [
      'export async function requireAdminRequestContext',
      "redirect('/dashboard')",
      'DECANTR_ADMIN_KEY',
    ],
  },
  {
    name: 'admin-pages-use-context-helper',
    file: 'src/app/admin/organizations/page.tsx',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-detail-uses-context-helper',
    file: 'src/app/admin/organizations/[slug]/page.tsx',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-reports-uses-context-helper',
    file: 'src/app/admin/reports/page.tsx',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-moderation-uses-context-helper',
    file: 'src/app/admin/moderation/page.tsx',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-moderation-detail-uses-context-helper',
    file: 'src/app/admin/moderation/[id]/page.tsx',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-actions-use-context-helper',
    file: 'src/app/admin/moderation/actions.ts',
    patterns: ['requireAdminRequestContext'],
  },
  {
    name: 'admin-shared-classes-exist',
    file: 'src/app/globals.css',
    patterns: [
      '.registry-admin-card-grid',
      '.registry-admin-card',
      '.registry-admin-row',
      '.registry-admin-summary-list',
      '.registry-inline-error',
    ],
  },
];

function readRelative(path) {
  return readFileSync(join(REGISTRY_ROOT, path), 'utf8');
}

const results = [];

for (const file of requiredFiles) {
  const absolutePath = join(REGISTRY_ROOT, file);
  results.push({
    name: `file:${file}`,
    file,
    passed: existsSync(absolutePath),
    details: existsSync(absolutePath) ? 'present' : 'missing',
  });
}

for (const check of sourceChecks) {
  const absolutePath = join(REGISTRY_ROOT, check.file);
  if (!existsSync(absolutePath)) {
    results.push({
      name: check.name,
      file: check.file,
      passed: false,
      details: 'missing source file',
    });
    continue;
  }

  const source = readRelative(check.file);
  const missing = check.patterns.filter((pattern) => !source.includes(pattern));
  results.push({
    name: check.name,
    file: check.file,
    passed: missing.length === 0,
    details: missing.length === 0 ? 'all markers present' : `missing: ${missing.join(', ')}`,
  });
}

const failures = results.filter((result) => !result.passed);

const lines = [
  '# Registry Authenticated Surface Audit',
  '',
  `- Registry root: ${relative(REPO_ROOT, REGISTRY_ROOT)}`,
  `- Passed: ${results.length - failures.length}`,
  `- Failed: ${failures.length}`,
  '',
  '| Check | File | Passed | Details |',
  '| --- | --- | :---: | --- |',
];

for (const result of results) {
  lines.push(`| ${result.name} | ${result.file} | ${result.passed ? 'yes' : 'no'} | ${result.details.replace(/\|/g, '\\|')} |`);
}

console.log(lines.join('\n'));

if (failures.length > 0) {
  process.exitCode = 1;
}
