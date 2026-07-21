#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const TOOL_SOURCE_PATH = 'packages/mcp-server/src/tools.ts';
const DOCS_INDEX_PATH = 'docs/index.html';
const DOCS_ANALYTICS_PATH = 'docs/analytics.js';
const SECURITY_PATH = 'SECURITY.md';
const CODEMETA_PATH = 'codemeta.json';
const CURRENT_PUBLIC_RELEASE = '3.9.2';
const ACTIVE_STORY_PATHS = [
  'README.md',
  'DECANTR.md',
  'CLAUDE.md',
  SECURITY_PATH,
  CODEMETA_PATH,
  'docs/index.html',
  'docs/README.md',
  'docs/llms.txt',
  'docs/css-scaffolding-guide.md',
  'docs/architecture/scaffolding-flow.md',
  'docs/guides/ai-assistant-setup.md',
  'docs/guides/existing-apps.md',
  'docs/reference/command-surface.md',
  'docs/reference/project-health.md',
  'docs/reference/telemetry.md',
  'docs/reference/workflow-model.md',
  'docs/runbooks/decantr-3-prerelease.md',
  'docs/runbooks/enterprise-artifact-release-checklist.md',
  'docs/runbooks/release-stewardship.md',
  'docs/schemas/index.html',
  'apps/showcase-host/DECANTR.md',
  'packages/cli/README.md',
  'packages/cli/src/bundled/blueprints/default.json',
  'packages/cli/src/index.ts',
  'packages/cli/src/prompts.ts',
  'packages/cli/src/scaffold.ts',
  'packages/cli/src/templates/DECANTR.md.template',
  'packages/content/README.md',
  'packages/content/patterns/registry-discovery-cta-grid.json',
  'packages/content/patterns/search-filter-bar.json',
  'packages/content/shells/top-nav-main.json',
  'packages/mcp-server/README.md',
  'packages/registry/README.md',
  'packages/css/README.md',
];

const FORBIDDEN_ACTIVE_STORY_PATTERNS = [
  { pattern: /https?:\/\/registry\.decantr\.ai/i, message: 'public registry portal URL' },
  { pattern: /apps\/registry/i, message: 'registry portal app path' },
  { pattern: /\bis (?:a |the )?public registry marketplace/i, message: 'public registry marketplace positioning' },
  { pattern: /\bhosted community publishing (?:is|via|through|supports|accepts)/i, message: 'hosted community publishing positioning' },
  { pattern: /\bopen registry (?:for|with|that|where)/i, message: 'open registry positioning' },
  { pattern: /3\.5\.x/i, message: 'stale 3.5.x release copy' },
  { pattern: /Decantr CSS is (?:the )?(?:default|core)/i, message: 'Decantr CSS as default/core positioning' },
  { pattern: /Explore more at decantr\.ai\/registry/i, message: 'retired registry exploration CTA' },
  { pattern: /\bSearch registry\b/i, message: 'registry-first search copy' },
  { pattern: /Registry content health report/i, message: 'registry-first content health copy' },
  { pattern: /latest registry content/i, message: 'registry-first update copy' },
  { pattern: /public registry metadata source/i, message: 'registry portal showcase ownership' },
  { pattern: /public registry (?:filter bar|homepage|pages)/i, message: 'registry portal content guidance' },
  { pattern: /hosted registry patterns/i, message: 'hosted registry guidance positioning' },
  { pattern: /Decantr 3\.7 keeps/i, message: 'stale MCP compatibility release copy' },
  { pattern: /https?:\/\/api\.decantr\.ai\/v1\/telemetry\/(?:events|guard)/i, message: 'retired hosted telemetry endpoint' },
  { pattern: /calls the hosted `\/v1\/me\/telemetry-link`/i, message: 'retired hosted identity-link copy' },
  { pattern: /adoptionMode[^\n]*\|\|\s*'decantr-css'/i, message: 'Decantr CSS fallback adoption' },
  { pattern: /All Decantr projects \*\*must\*\* declare CSS/i, message: 'Decantr CSS layers as a universal requirement' },
  { pattern: /If `package\.json` does not already include `@decantr\/css`, add it/i, message: 'automatic Decantr CSS installation guidance' },
  { pattern: /npx decantr docs css/i, message: 'nonexistent Decantr CSS docs command' },
  { pattern: /use this lane for future Decantr 3 prereleases/i, message: 'obsolete reusable prerelease lane' },
];

const FORBIDDEN_DOCS_ANALYTICS_PATTERNS = [
  { pattern: /navigator\.sendBeacon/, message: 'first-party beacon delivery' },
  { pattern: /\bfetch\s*\(/, message: 'first-party fetch delivery' },
  { pattern: /localStorage/, message: 'persisted local attribution' },
  { pattern: /document\.cookie/, message: 'persisted attribution cookie' },
  { pattern: /telemetryEndpoint/, message: 'first-party telemetry endpoint configuration' },
  { pattern: /decantr_anonymous_id/, message: 'persisted anonymous identifier' },
];

const EXPECTED_PACKAGE_PATHS = {
  '@decantr/cli': 'packages/cli/package.json',
  '@decantr/mcp-server': 'packages/mcp-server/package.json',
  '@decantr/content': 'packages/content/package.json',
  '@decantr/essence-spec': 'packages/essence-spec/package.json',
  '@decantr/registry': 'packages/registry/package.json',
  '@decantr/core': 'packages/core/package.json',
  '@decantr/css': 'packages/css/package.json',
  '@decantr/telemetry': 'packages/telemetry/package.json',
  '@decantr/verifier': 'packages/verifier/package.json',
};

const EXPECTED_PACKAGES = Object.keys(EXPECTED_PACKAGE_PATHS);
const CURRENT_PUBLIC_PACKAGE_VERSIONS = {
  '@decantr/cli': '3.9.2',
  '@decantr/mcp-server': '3.9.2',
  '@decantr/content': '3.9.2',
  '@decantr/essence-spec': '3.8.1',
  '@decantr/registry': '3.9.2',
  '@decantr/core': '3.9.2',
  '@decantr/css': '3.8.1',
  '@decantr/telemetry': '3.8.1',
  '@decantr/verifier': '3.9.2',
};

function extractToolNames(source) {
  return [
    ...source.matchAll(/name:\s*'([^']+)'/g),
    ...source.matchAll(/consolidatedTool\(\s*'([^']+)'/g),
  ].map((match) => match[1]);
}

function extractDocsToolNames(source) {
  return [...source.matchAll(/decantr_[a-z_]+/g)].map((match) => match[0]);
}

function extractDocsPackageNames(source) {
  return [...source.matchAll(/@decantr\/[a-z-]+/g)].map((match) => match[0]);
}

function extractDocsPackageVersions(source) {
  return [...source.matchAll(/<div class="pkg-name">(@decantr\/[a-z-]+)<\/div>[\s\S]*?<div class="pkg-version">([^<]+)<\/div>/g)]
    .reduce((acc, match) => {
      const versionMatch = match[2].match(/(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)/);
      if (versionMatch) {
        acc[match[1]] = versionMatch[1];
      }
      return acc;
    }, {});
}

function unique(values) {
  return [...new Set(values)];
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((value) => !rightSet.has(value));
}

const missingPublicVersionPolicies = difference(
  EXPECTED_PACKAGES,
  Object.keys(CURRENT_PUBLIC_PACKAGE_VERSIONS),
);

const toolSource = readFileSync(TOOL_SOURCE_PATH, 'utf8');
const docsIndex = readFileSync(DOCS_INDEX_PATH, 'utf8');
const docsAnalytics = readFileSync(DOCS_ANALYTICS_PATH, 'utf8');
const agentBrief = readFileSync('DECANTR.md', 'utf8');
const securityPolicy = readFileSync(SECURITY_PATH, 'utf8');
const codemeta = JSON.parse(readFileSync(CODEMETA_PATH, 'utf8'));
const workspaceManifest = JSON.parse(readFileSync('.decantr/workspace.json', 'utf8'));

const toolNames = unique(extractToolNames(toolSource));
const docsToolNames = unique(extractDocsToolNames(docsIndex));
const agentBriefToolNames = unique(extractDocsToolNames(agentBrief));
const docsPackageNames = unique(extractDocsPackageNames(docsIndex));
const docsPackageVersions = extractDocsPackageVersions(docsIndex);

const toolHeadingMatch = docsIndex.match(/>(\d+)\s+tools for your AI assistant</);
const packageHeadingMatch = docsIndex.match(/>(?:(\w+)\s+|Content-first\s+)packages, one mission/);

const failures = [];

const missingAgentBriefTools = difference(toolNames, agentBriefToolNames);
const extraAgentBriefTools = difference(agentBriefToolNames, toolNames);
if (missingAgentBriefTools.length > 0 || extraAgentBriefTools.length > 0) {
  failures.push(
    `DECANTR.md MCP inventory differs from the exact eight-tool surface (missing: ${missingAgentBriefTools.join(', ') || 'none'}; extra: ${extraAgentBriefTools.join(', ') || 'none'}).`,
  );
}
if ((workspaceManifest.projects ?? []).some((project) => project.path === 'apps/registry')) {
  failures.push('.decantr/workspace.json still declares the retired apps/registry project.');
}

if (missingPublicVersionPolicies.length > 0) {
  failures.push(
    `Current public package versions are missing policy entries: ${missingPublicVersionPolicies.join(', ')}`,
  );
}

if (!new RegExp(`Current stable\\s*·\\s*v${CURRENT_PUBLIC_RELEASE.replaceAll('.', '\\.')}`, 'i').test(docsIndex)) {
  failures.push(`Docs homepage must identify v${CURRENT_PUBLIC_RELEASE} as the current stable release.`);
}

if (/Development preview\s*·\s*v3\.9\b/i.test(docsIndex)) {
  failures.push('Docs homepage still labels the current 3.9 line as a development preview.');
}

if (/3\.9[^\n]{0,240}\b(?:remains )?unreleased\b/i.test(docsIndex)) {
  failures.push('Docs homepage still describes the current 3.9 line as unreleased.');
}

if (!/<span[^>]*class="badge"[^>]*>\s*3\.9\s*<\/span>/i.test(docsIndex)) {
  failures.push('Docs homepage must badge the task-capsule surface as 3.9.');
}

const securityRequirements = [
  { pattern: /\blocal-first\b/i, message: 'local-first governance posture' },
  { pattern: /content\/reference API/i, message: 'optional content/reference API posture' },
  { pattern: /\bMCP\b/, message: 'MCP security posture' },
  { pattern: /does not accept project source code/i, message: 'no source-upload posture' },
];

for (const requirement of securityRequirements) {
  if (!requirement.pattern.test(securityPolicy)) {
    failures.push(`${SECURITY_PATH} is missing ${requirement.message}.`);
  }
}

const forbiddenSecurityPatterns = [
  { pattern: /registry\.decantr\.ai/i, message: 'retired registry portal URL' },
  { pattern: /\bregistry portal\b/i, message: 'retired registry portal surface' },
  { pattern: /allow_hosted_upload/i, message: 'retired hosted-upload compatibility flag' },
  { pattern: /hosted[^\n]{0,80}source upload fallback/i, message: 'retired hosted source-upload fallback' },
];

for (const check of forbiddenSecurityPatterns) {
  if (check.pattern.test(securityPolicy)) {
    failures.push(`${SECURITY_PATH} still contains ${check.message}.`);
  }
}

const codemetaDescription = codemeta.description ?? '';
if (!new RegExp(`${CURRENT_PUBLIC_RELEASE.replaceAll('.', '\\.')} is current`, 'i').test(codemetaDescription)) {
  failures.push(`${CODEMETA_PATH} must identify ${CURRENT_PUBLIC_RELEASE} as current.`);
}
if (/3\.9[^.]{0,120}\bunreleased\b/i.test(codemetaDescription)) {
  failures.push(`${CODEMETA_PATH} still identifies 3.9 as unreleased.`);
}
if (!/\blocal-first\b/i.test(codemetaDescription) || !/content\/reference API/i.test(codemetaDescription) || !/\bMCP\b/.test(codemetaDescription)) {
  failures.push(`${CODEMETA_PATH} must describe the local-first package, content/API, and MCP posture.`);
}
if ((codemeta.relatedLink ?? []).some((link) => /registry\.decantr\.ai/i.test(link))) {
  failures.push(`${CODEMETA_PATH} still links to the retired registry portal.`);
}

for (const file of ACTIVE_STORY_PATHS) {
  const text = readFileSync(file, 'utf8');
  for (const check of FORBIDDEN_ACTIVE_STORY_PATTERNS) {
    if (check.pattern.test(text)) {
      failures.push(`${file} still contains retired story copy: ${check.message}.`);
    }
  }
}

for (const check of FORBIDDEN_DOCS_ANALYTICS_PATTERNS) {
  if (check.pattern.test(docsAnalytics)) {
    failures.push(`${DOCS_ANALYTICS_PATH} still contains retired analytics behavior: ${check.message}.`);
  }
}

const telemetrySource = readFileSync('packages/cli/src/telemetry.ts', 'utf8');
const telemetryCommandSource = readFileSync('packages/cli/src/commands/telemetry.ts', 'utf8');
if (/DECANTR_TELEMETRY_ENDPOINT\s*\|\|/.test(telemetrySource)) {
  failures.push('CLI telemetry still falls back from DECANTR_TELEMETRY_ENDPOINT to a default sink.');
}
if (/DECANTR_API_URL/.test(telemetryCommandSource)) {
  failures.push('Telemetry identity linking still reuses DECANTR_API_URL instead of an explicit private endpoint.');
}

const registryPlatform = JSON.parse(readFileSync('packages/content/blueprints/registry-platform.json', 'utf8'));
const showcaseManifest = JSON.parse(readFileSync('apps/showcase/manifest.json', 'utf8'));
const registryShowcase = showcaseManifest.apps.find((entry) => entry.slug === 'registry-platform');
if (registryPlatform.blueprint_portfolio?.visibility !== 'hidden') {
  failures.push('registry-platform must remain hidden from current blueprint discovery.');
}
if (registryPlatform.blueprint_portfolio?.maturity !== 'legacy-hidden') {
  failures.push('registry-platform must remain legacy-hidden rather than a current flagship.');
}
if (registryShowcase?.goldenCandidate) {
  failures.push('registry-platform must not remain a golden showcase candidate.');
}

if (!toolHeadingMatch) {
  failures.push('docs/index.html is missing the MCP tool count heading.');
} else {
  const declaredToolCount = Number(toolHeadingMatch[1]);
  if (declaredToolCount !== toolNames.length) {
    failures.push(`Docs homepage declares ${declaredToolCount} MCP tools, but tools.ts defines ${toolNames.length}.`);
  }
}

const missingTools = difference(toolNames, docsToolNames);
const extraTools = difference(docsToolNames, toolNames);

if (missingTools.length > 0) {
  failures.push(`Docs homepage is missing MCP tools: ${missingTools.join(', ')}`);
}

if (extraTools.length > 0) {
  failures.push(`Docs homepage lists unknown MCP tools: ${extraTools.join(', ')}`);
}

const missingPackages = difference(EXPECTED_PACKAGES, docsPackageNames);
const extraPackages = difference(docsPackageNames, EXPECTED_PACKAGES);

if (!packageHeadingMatch) {
  failures.push('docs/index.html is missing the package heading.');
} else if (packageHeadingMatch[1]) {
  const numberWords = new Map([
    ['one', 1],
    ['two', 2],
    ['three', 3],
    ['four', 4],
    ['five', 5],
    ['six', 6],
    ['seven', 7],
    ['eight', 8],
    ['nine', 9],
    ['ten', 10],
  ]);
  const declaredPackageCount = numberWords.get(packageHeadingMatch[1].toLowerCase());
  if (declaredPackageCount !== EXPECTED_PACKAGES.length) {
    failures.push(`Docs homepage declares ${packageHeadingMatch[1]} packages, but the expected core set contains ${EXPECTED_PACKAGES.length}.`);
  }
}

if (missingPackages.length > 0) {
  failures.push(`Docs homepage is missing core packages: ${missingPackages.join(', ')}`);
}

if (extraPackages.length > 0) {
  failures.push(`Docs homepage lists unexpected package names: ${extraPackages.join(', ')}`);
}

for (const [pkg, packageJsonPath] of Object.entries(EXPECTED_PACKAGE_PATHS)) {
  const developmentVersion = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
  const currentPublicVersion = CURRENT_PUBLIC_PACKAGE_VERSIONS[pkg];
  const docsVersion = docsPackageVersions[pkg];
  if (!docsVersion) {
    failures.push(`Docs homepage is missing a displayed version for ${pkg}.`);
    continue;
  }
  if (docsVersion !== currentPublicVersion) {
    const source = docsVersion === developmentVersion
      ? `the unreleased development manifest version v${developmentVersion}`
      : `v${docsVersion}`;
    failures.push(`Docs homepage shows ${pkg} as ${source}, but the current public version is v${currentPublicVersion}.`);
  }
}

if (failures.length > 0) {
  console.error('Docs marketing audit failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Docs marketing audit passed: v${CURRENT_PUBLIC_RELEASE} is current, security/codemeta posture is aligned, and ${toolNames.length} MCP tools plus ${EXPECTED_PACKAGES.length} public package versions match.`);
