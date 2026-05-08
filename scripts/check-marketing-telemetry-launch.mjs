#!/usr/bin/env node
import { appendFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = new Set(args);
const sendSmoke = flags.has('--send-smoke');
const marketingUrl = readArgValue('marketing-url') || process.env.DECANTR_MARKETING_URL || 'https://decantr.ai/';
const registryUrl = readArgValue('registry-url') || process.env.DECANTR_REGISTRY_URL || 'https://registry.decantr.ai/';
const apiUrl = (readArgValue('api-url') || process.env.DECANTR_API_URL || 'https://api.decantr.ai/v1').replace(/\/+$/, '');
const checks = [];

let marketingHtml = '';
let analyticsConfig = '';
let analyticsJs = '';

await check('marketing homepage loads', async () => {
  const response = await fetchText(marketingUrl);
  marketingHtml = response.text;
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(marketingHtml.includes('/analytics-config.js'), 'Missing analytics-config.js script tag');
  assert(marketingHtml.includes('/analytics.js'), 'Missing analytics.js script tag');
});

await check('analytics config loads', async () => {
  const url = new URL('/analytics-config.js', marketingUrl).toString();
  const response = await fetchText(url);
  analyticsConfig = response.text;
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(analyticsConfig.includes('DECANTR_ANALYTICS_CONFIG'), 'Missing config global');
  assert(analyticsConfig.includes('telemetryEndpoint'), 'Missing telemetry endpoint config');
});

await check('analytics runtime loads', async () => {
  const url = new URL('/analytics.js', marketingUrl).toString();
  const response = await fetchText(url);
  analyticsJs = response.text;
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  for (const eventName of [
    'marketing_web.page_viewed',
    'marketing_web.cta_clicked',
    'marketing_web.outbound_clicked',
    'marketing_web.command_clicked',
  ]) {
    assert(analyticsJs.includes(eventName), `Missing ${eventName}`);
  }
});

await check('analytics privacy guard keeps raw click ids local', async () => {
  assert(!analyticsJs.includes('searchParams.set(item[0]'), 'Raw ad click ids are forwarded into decorated links');
  assert(!analyticsJs.includes('CLICK_ID_PARAMS.forEach'), 'Click-id params are copied by decorateAnchor');
});

await check('registry homepage loads', async () => {
  const response = await fetchText(registryUrl);
  assert(response.status === 200, `Expected 200, got ${response.status}`);
  assert(response.text.includes('<html') || response.text.includes('<!DOCTYPE html'), 'Registry response does not look like HTML');
});

if (sendSmoke) {
  await check('first-party telemetry ingest accepts marketing-web smoke event', async () => {
    const response = await fetch(`${apiUrl}/telemetry/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schemaVersion: '0.1.0',
        event: {
          name: 'marketing_web.page_viewed',
          timestamp: new Date().toISOString(),
          context: {
            source: 'marketing-web',
            actorType: 'anonymous',
            environment: 'test',
            serviceName: 'decantr-marketing-telemetry-qa',
            anonymousId: `marketing_web:qa:${Date.now()}`,
          },
          properties: {
            attributionClickIdPresent: false,
            attributionLandingPath: '/telemetry-qa',
            routePath: '/telemetry-qa',
            surface: 'telemetry-qa',
          },
        },
      }),
    });
    assert(response.status === 202, `Expected 202, got ${response.status}`);
  });
} else {
  checks.push({
    detail: 'Run with --send-smoke to post a test marketing_web.page_viewed event.',
    name: 'first-party telemetry ingest smoke event',
    status: 'skipped',
  });
}

const failed = checks.filter((result) => result.status === 'failed');
const markdown = renderMarkdown(checks);
console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (failed.length > 0) {
  process.exitCode = 1;
}

async function check(name, fn) {
  try {
    await fn();
    checks.push({ name, status: 'passed' });
  } catch (error) {
    checks.push({
      detail: error instanceof Error ? error.message : String(error),
      name,
      status: 'failed',
    });
  }
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'decantr-marketing-telemetry-qa' },
  });
  return {
    status: response.status,
    text: await response.text(),
  };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readArgValue(name) {
  const prefix = `--${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length).trim();
  const index = args.indexOf(`--${name}`);
  if (index >= 0) return args[index + 1]?.trim();
  return '';
}

function renderMarkdown(results) {
  const lines = [
    '# Decantr Marketing Telemetry Launch QA',
    '',
    `Marketing URL: ${marketingUrl}`,
    `Registry URL: ${registryUrl}`,
    `API URL: ${apiUrl}`,
    '',
    '| Check | Status | Detail |',
    '| --- | --- | --- |',
  ];

  for (const result of results) {
    lines.push(`| ${result.name} | ${result.status} | ${escapeTable(result.detail || '')} |`);
  }

  return lines.join('\n');
}

function escapeTable(value) {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|')
    .replace(/\r?\n/g, ' ');
}
