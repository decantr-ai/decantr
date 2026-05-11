import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const docsDir = join(repoRoot, 'docs');
const publicDir = join(repoRoot, 'public');

if (!existsSync(join(docsDir, 'index.html'))) {
  throw new Error('Expected docs/index.html before preparing the Vercel static output.');
}

execFileSync(process.execPath, [join(repoRoot, 'scripts/generate-docs-sitemap.mjs')], {
  cwd: repoRoot,
  stdio: 'inherit',
});

rmSync(publicDir, { recursive: true, force: true });
cpSync(docsDir, publicDir, { recursive: true });
writeAnalyticsConfig(join(publicDir, 'analytics-config.js'));

console.log(`Prepared Vercel static output: ${publicDir}`);

function writeAnalyticsConfig(path) {
  const xEvents = {
    'marketing_web.command_clicked': process.env.X_EVENT_MARKETING_COMMAND_CLICKED_ID || '',
    'marketing_web.cta_clicked': process.env.X_EVENT_MARKETING_CTA_CLICKED_ID || '',
    'marketing_web.outbound_clicked': process.env.X_EVENT_MARKETING_OUTBOUND_CLICKED_ID || '',
    'marketing_web.page_viewed': process.env.X_EVENT_MARKETING_PAGE_VIEWED_ID || '',
  };

  const config = {
    disabled: process.env.DECANTR_ANALYTICS_DISABLED === 'true',
    environment: process.env.VERCEL_ENV === 'preview' ? 'preview' : 'production',
    telemetryEndpoint:
      process.env.DECANTR_TELEMETRY_ENDPOINT || 'https://api.decantr.ai/v1/telemetry/events',
    xEvents: Object.fromEntries(Object.entries(xEvents).filter(([, value]) => value)),
    xPixelId: process.env.X_PIXEL_ID || '',
  };

  writeFileSync(
    path,
    `window.DECANTR_ANALYTICS_CONFIG = ${JSON.stringify(config, null, 2)};\n`,
  );
}
