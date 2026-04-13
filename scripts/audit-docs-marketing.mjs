#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const TOOL_SOURCE_PATH = 'packages/mcp-server/src/tools.ts';
const DOCS_INDEX_PATH = 'docs/index.html';

const EXPECTED_PACKAGE_PATHS = {
  '@decantr/cli': 'packages/cli/package.json',
  '@decantr/mcp-server': 'packages/mcp-server/package.json',
  '@decantr/essence-spec': 'packages/essence-spec/package.json',
  '@decantr/registry': 'packages/registry/package.json',
  '@decantr/core': 'packages/core/package.json',
  '@decantr/css': 'packages/css/package.json',
  '@decantr/verifier': 'packages/verifier/package.json',
};

const EXPECTED_PACKAGES = Object.keys(EXPECTED_PACKAGE_PATHS);

function extractToolNames(source) {
  return [...source.matchAll(/name:\s*'([^']+)'/g)].map((match) => match[1]);
}

function extractDocsToolNames(source) {
  return [...source.matchAll(/decantr_[a-z_]+/g)].map((match) => match[0]);
}

function extractDocsPackageNames(source) {
  return [...source.matchAll(/@decantr\/[a-z-]+/g)].map((match) => match[0]);
}

function extractDocsPackageVersions(source) {
  return [...source.matchAll(/<div class="pkg-name">(@decantr\/[a-z-]+)<\/div>[\s\S]*?<div class="pkg-version">v([^<]+)<\/div>/g)]
    .reduce((acc, match) => {
      acc[match[1]] = match[2];
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

const toolSource = readFileSync(TOOL_SOURCE_PATH, 'utf8');
const docsIndex = readFileSync(DOCS_INDEX_PATH, 'utf8');

const toolNames = unique(extractToolNames(toolSource));
const docsToolNames = unique(extractDocsToolNames(docsIndex));
const docsPackageNames = unique(extractDocsPackageNames(docsIndex));
const docsPackageVersions = extractDocsPackageVersions(docsIndex);

const toolHeadingMatch = docsIndex.match(/>(\d+)\s+tools for your AI assistant</);
const packageHeadingMatch = docsIndex.match(/>(\w+)\s+packages, one mission/);

const failures = [];

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
  failures.push('docs/index.html is missing the package count heading.');
} else {
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
  const packageVersion = JSON.parse(readFileSync(packageJsonPath, 'utf8')).version;
  const docsVersion = docsPackageVersions[pkg];
  if (!docsVersion) {
    failures.push(`Docs homepage is missing a displayed version for ${pkg}.`);
    continue;
  }
  if (docsVersion !== packageVersion) {
    failures.push(`Docs homepage shows ${pkg} as v${docsVersion}, but package.json is v${packageVersion}.`);
  }
}

if (failures.length > 0) {
  console.error('Docs marketing audit failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Docs marketing audit passed: ${toolNames.length} MCP tools and ${EXPECTED_PACKAGES.length} core packages are aligned, including displayed versions.`);
