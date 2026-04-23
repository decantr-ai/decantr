// Auth-seeded multi-viewport smoke against a running dev server.
//
// Launches puppeteer-core against the local Chrome binary, iterates all
// (route × viewport) combos, seeds localStorage.<AUTH_STORAGE_KEY>=true
// at the origin before each navigation, and screenshots the viewport.

import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import {
  AUTH_STORAGE_KEY,
  CHROME_BINARY,
  DEFAULT_ROUTES,
  DEFAULT_VIEWPORTS,
} from './config.mjs';

export async function runMobileSmoke({
  baseUrl,
  outputDir,
  routes = DEFAULT_ROUTES,
  viewports = DEFAULT_VIEWPORTS,
}) {
  mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: CHROME_BINARY,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const results = [];
  try {
    for (const v of viewports) {
      for (const r of routes) {
        const page = await browser.newPage();
        try {
          await page.setViewport({
            width: v.width,
            height: v.height,
            deviceScaleFactor: v.dpr,
            isMobile: !!v.mobile,
            hasTouch: true,
          });

          // Seed auth at origin.
          await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
          await page.evaluate((key) => {
            try {
              localStorage.setItem(key, 'true');
            } catch {
              /* ignore */
            }
          }, AUTH_STORAGE_KEY);

          // Navigate to target with hash support.
          await page
            .goto(`${baseUrl}${r.path}`, { waitUntil: 'networkidle2', timeout: 15000 })
            .catch(() => {});

          // Let entrance animations settle.
          await new Promise((res) => setTimeout(res, 800));

          const file = `${outputDir}/${r.name}-${v.name}.png`;
          await page.screenshot({ path: file, fullPage: false });
          results.push({ route: r.name, viewport: v.name, file, ok: true });
          console.log(`  ${r.name} @ ${v.name} → ${file}`);
        } catch (err) {
          results.push({ route: r.name, viewport: v.name, ok: false, error: String(err) });
          console.warn(`  ${r.name} @ ${v.name}: FAILED — ${err.message}`);
        } finally {
          await page.close().catch(() => {});
        }
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }

  return results;
}
