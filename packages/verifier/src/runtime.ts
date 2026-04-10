import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const CONTENT_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
} as const;

export interface RuntimeAudit {
  distPresent: boolean;
  indexPresent: boolean;
  checked: boolean;
  passed: boolean | null;
  rootDocumentOk: boolean;
  titleOk: boolean;
  langOk: boolean;
  viewportOk: boolean;
  charsetOk: boolean;
  cspSignalOk: boolean;
  inlineScriptCount: number;
  inlineEventHandlerCount: number;
  externalScriptsWithoutIntegrityCount: number;
  externalScriptsWithIntegrityMissingCrossoriginCount: number;
  externalStylesheetsWithoutIntegrityCount: number;
  externalStylesheetsWithIntegrityMissingCrossoriginCount: number;
  externalScriptsWithInsecureTransportCount: number;
  externalStylesheetsWithInsecureTransportCount: number;
  externalMediaSourcesWithInsecureTransportCount: number;
  externalBlankLinksWithoutRelCount: number;
  externalIframesWithoutSandboxCount: number;
  externalIframesWithInsecureTransportCount: number;
  jsEvalSignalCount: number;
  jsHtmlInjectionSignalCount: number;
  jsInsecureTransportSignalCount: number;
  jsSecretSignalCount: number;
  assetCount: number;
  assetsPassed: number;
  routeHintsChecked: string[];
  routeHintsMatched: number;
  routeHintsCoverageOk: boolean;
  routeDocumentsChecked: number;
  routeDocumentsPassed: number;
  routeDocumentsHardenedCount: number;
  routeDocumentsCoverageOk: boolean;
  routeDocumentsHardeningOk: boolean;
  fullRouteCoverageOk: boolean;
  totalAssetBytes: number;
  jsAssetBytes: number;
  cssAssetBytes: number;
  largestAssetPath: string | null;
  largestAssetBytes: number;
  failures: string[];
}

export interface BuiltDistAuditOptions {
  distDir?: string;
  routeHints?: string[];
}

export function emptyRuntimeAudit(failures: string[] = []): RuntimeAudit {
  return {
    distPresent: false,
    indexPresent: false,
    checked: false,
    passed: null,
    rootDocumentOk: false,
    titleOk: false,
    langOk: false,
    viewportOk: false,
    charsetOk: false,
    cspSignalOk: false,
    inlineScriptCount: 0,
    inlineEventHandlerCount: 0,
    externalScriptsWithoutIntegrityCount: 0,
    externalScriptsWithIntegrityMissingCrossoriginCount: 0,
    externalStylesheetsWithoutIntegrityCount: 0,
    externalStylesheetsWithIntegrityMissingCrossoriginCount: 0,
    externalScriptsWithInsecureTransportCount: 0,
    externalStylesheetsWithInsecureTransportCount: 0,
    externalMediaSourcesWithInsecureTransportCount: 0,
    externalBlankLinksWithoutRelCount: 0,
    externalIframesWithoutSandboxCount: 0,
    externalIframesWithInsecureTransportCount: 0,
    jsEvalSignalCount: 0,
    jsHtmlInjectionSignalCount: 0,
    jsInsecureTransportSignalCount: 0,
    jsSecretSignalCount: 0,
    assetCount: 0,
    assetsPassed: 0,
    routeHintsChecked: [],
    routeHintsMatched: 0,
    routeHintsCoverageOk: false,
    routeDocumentsChecked: 0,
    routeDocumentsPassed: 0,
    routeDocumentsHardenedCount: 0,
    routeDocumentsCoverageOk: false,
    routeDocumentsHardeningOk: false,
    fullRouteCoverageOk: false,
    totalAssetBytes: 0,
    jsAssetBytes: 0,
    cssAssetBytes: 0,
    largestAssetPath: null,
    largestAssetBytes: 0,
    failures,
  };
}

function getContentType(pathname: string): string {
  return CONTENT_TYPES[extname(pathname) as keyof typeof CONTENT_TYPES] ?? 'application/octet-stream';
}

function extractAssetPaths(indexHtml: string): string[] {
  const assetPaths = new Set<string>();

  for (const match of indexHtml.matchAll(/<(?:script|link)[^>]+(?:src|href)="([^"]+)"/g)) {
    const assetPath = match[1];
    const assetsIndex = assetPath.indexOf('/assets/');
    if (assetsIndex === -1) continue;
    assetPaths.add(assetPath.slice(assetsIndex));
  }

  return [...assetPaths];
}

function countInlineScriptTags(html: string): number {
  return html.match(/<script\b(?:(?!\bsrc=)[^>])*>/gi)?.length ?? 0;
}

function countInlineEventHandlerAttributes(html: string): number {
  return html.match(/\son[a-z][a-z0-9_-]*\s*=/gi)?.length ?? 0;
}

function countExternalScriptsWithoutIntegrity(html: string): number {
  return [...html.matchAll(/<script\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      return {
        src: match[3],
        hasIntegrity: /\bintegrity\s*=/i.test(attrs),
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.src) && !entry.hasIntegrity)
    .length;
}

function countExternalScriptsWithIntegrityMissingCrossorigin(html: string): number {
  return [...html.matchAll(/<script\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      return {
        src: match[3],
        hasIntegrity: /\bintegrity\s*=/i.test(attrs),
        hasCrossorigin: /\bcrossorigin\s*=/i.test(attrs),
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.src) && entry.hasIntegrity && !entry.hasCrossorigin)
    .length;
}

function countExternalScriptsWithInsecureTransport(html: string): number {
  return [...html.matchAll(/<script\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => match[3])
    .filter((src) => /^http:\/\//i.test(src))
    .length;
}

function countExternalStylesheetsWithoutIntegrity(html: string): number {
  return [...html.matchAll(/<link\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      const relMatch = attrs.match(/\brel=(["'])([^"']+)\1/i);
      const relValue = relMatch?.[2]?.toLowerCase() ?? '';
      return {
        href: match[3],
        relValue,
        hasIntegrity: /\bintegrity\s*=/i.test(attrs),
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.href) && /\bstylesheet\b/i.test(entry.relValue) && !entry.hasIntegrity)
    .length;
}

function countExternalStylesheetsWithIntegrityMissingCrossorigin(html: string): number {
  return [...html.matchAll(/<link\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      const relMatch = attrs.match(/\brel=(["'])([^"']+)\1/i);
      const relValue = relMatch?.[2]?.toLowerCase() ?? '';
      return {
        href: match[3],
        relValue,
        hasIntegrity: /\bintegrity\s*=/i.test(attrs),
        hasCrossorigin: /\bcrossorigin\s*=/i.test(attrs),
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.href) && /\bstylesheet\b/i.test(entry.relValue) && entry.hasIntegrity && !entry.hasCrossorigin)
    .length;
}

function countExternalStylesheetsWithInsecureTransport(html: string): number {
  return [...html.matchAll(/<link\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      const relMatch = attrs.match(/\brel=(["'])([^"']+)\1/i);
      const relValue = relMatch?.[2]?.toLowerCase() ?? '';
      return {
        href: match[3],
        relValue,
      };
    })
    .filter((entry) => /^http:\/\//i.test(entry.href) && /\bstylesheet\b/i.test(entry.relValue))
    .length;
}

function extractHtmlAttributeValues(attrs: string, attributeNames: string[]): string[] {
  const values: string[] = [];
  for (const attributeName of attributeNames) {
    const pattern = new RegExp(`\\b${attributeName}\\s*=\\s*([\"'])([^\"']+)\\1`, 'gi');
    for (const match of attrs.matchAll(pattern)) {
      values.push(match[2]);
    }
  }
  return values;
}

function valueContainsInsecureRemoteAsset(value: string | null | undefined): boolean {
  if (!value) return false;
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0] ?? '')
    .some((candidate) => /^http:\/\//i.test(candidate));
}

function countExternalMediaSourcesWithInsecureTransport(html: string): number {
  let count = 0;

  for (const match of html.matchAll(/<(img|source|video|audio)\b([^>]*)>/gi)) {
    const tagName = match[1]?.toLowerCase();
    const attrs = match[2] ?? '';
    const attributeNames = tagName === 'video'
      ? ['src', 'poster']
      : tagName === 'audio'
        ? ['src']
        : ['src', 'srcset'];
    const hasInsecureTransport = extractHtmlAttributeValues(attrs, attributeNames)
      .some((value) => valueContainsInsecureRemoteAsset(value));
    if (hasInsecureTransport) {
      count += 1;
    }
  }

  return count;
}

function countExternalBlankLinksWithoutRel(html: string): number {
  return [...html.matchAll(/<a\b([^>]*?)\bhref=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      const targetMatch = attrs.match(/\btarget=(["'])([^"']+)\1/i);
      const relMatch = attrs.match(/\brel=(["'])([^"']+)\1/i);
      return {
        href: match[3],
        target: targetMatch?.[2]?.toLowerCase() ?? '',
        rel: relMatch?.[2] ?? '',
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.href) && entry.target === '_blank')
    .filter((entry) => !/\bnoopener\b/i.test(entry.rel) || !/\bnoreferrer\b/i.test(entry.rel))
    .length;
}

function countExternalIframesWithoutSandbox(html: string): number {
  return [...html.matchAll(/<iframe\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => {
      const attrs = `${match[1] ?? ''} ${match[4] ?? ''}`;
      return {
        src: match[3],
        hasSandbox: /\bsandbox(?:\s*=|\b)/i.test(attrs),
      };
    })
    .filter((entry) => /^https?:\/\//i.test(entry.src) && !entry.hasSandbox)
    .length;
}

function countExternalIframesWithInsecureTransport(html: string): number {
  return [...html.matchAll(/<iframe\b([^>]*?)\bsrc=(["'])([^"']+)\2([^>]*)>/gi)]
    .map((match) => match[3])
    .filter((src) => /^http:\/\//i.test(src))
    .length;
}

function countDynamicCodeSignals(js: string): number {
  return js.match(/\beval\s*\(|\bnew Function\s*\(/g)?.length ?? 0;
}

function countHtmlInjectionSignals(js: string): number {
  return js.match(/\bdangerouslySetInnerHTML\b|\b(?:innerHTML|outerHTML)\s*=|\binsertAdjacentHTML\s*\(|\bdocument\.write\s*\(/g)?.length ?? 0;
}

function countInsecureTransportSignals(js: string): number {
  return js.match(/\b(?:http|ws):\/\/[^\s'"`]+|\b(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?(?:\/[^\s'"`]*)?/g)?.length ?? 0;
}

function countSecretLeakSignals(js: string): number {
  const patterns = [
    /\b(?:SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE|SERVICE_ROLE_KEY)\b/g,
    /\bsk_live_[0-9A-Za-z]+\b/g,
    /-----BEGIN [A-Z ]*PRIVATE KEY-----/g,
  ];

  return patterns.reduce((count, pattern) => count + (js.match(pattern)?.length ?? 0), 0);
}

function normalizeRouteHint(route: string | null | undefined): string {
  if (!route || route === '/') return '/';
  const dynamicIndex = route.indexOf('/:');
  if (dynamicIndex !== -1) {
    return route.slice(0, dynamicIndex + 1);
  }
  return route;
}

async function startStaticServer(rootDir: string): Promise<{ baseUrl: string; close: () => Promise<void> }> {
  const server = createServer((req, res) => {
    const requestedUrl = new URL(req.url ?? '/', 'http://127.0.0.1');
    const pathname = requestedUrl.pathname === '/' ? '/index.html' : requestedUrl.pathname;
    const relativePath = normalize(pathname)
      .replace(/^[/\\]+/, '')
      .replace(/^(\.\.[/\\])+/, '');
    const filePath = join(rootDir, relativePath);
    const fallbackPath = join(rootDir, 'index.html');

    try {
      if (existsSync(filePath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', getContentType(filePath));
        res.end(readFileSync(filePath));
        return;
      }

      if (existsSync(fallbackPath)) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(readFileSync(fallbackPath));
        return;
      }

      res.statusCode = 404;
      res.end('Not found');
    } catch {
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolvePromise());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Failed to bind runtime audit server.');
  }

  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise<void>((resolvePromise, reject) => server.close(error => error ? reject(error) : resolvePromise()));
    },
  };
}

export async function auditBuiltDist(projectRoot: string, options: BuiltDistAuditOptions = {}): Promise<RuntimeAudit> {
  const distDir = options.distDir ?? join(projectRoot, 'dist');
  if (!existsSync(distDir)) {
    return emptyRuntimeAudit(['dist-missing']);
  }

  const indexPath = join(distDir, 'index.html');
  if (!existsSync(indexPath)) {
    return {
      ...emptyRuntimeAudit(['index-missing']),
      distPresent: true,
    };
  }

  const routeHints = Array.isArray(options.routeHints) && options.routeHints.length > 0
    ? options.routeHints.map(route => normalizeRouteHint(route)).filter(Boolean).slice(0, 8)
    : ['/'];
  const indexHtml = readFileSync(indexPath, 'utf-8');
  const assetPaths = extractAssetPaths(indexHtml);
  const server = await startStaticServer(distDir);

  try {
    const rootResponse = await fetch(`${server.baseUrl}/`);
    const rootHtml = await rootResponse.text();
    const failures: string[] = [];
    const rootDocumentOk = rootResponse.ok && /id="root"/.test(rootHtml);
    const titleOk = /<title>[^<]+<\/title>/i.test(rootHtml);
    const langOk = /<html[^>]*\slang=(["'])[^"']+\1/i.test(rootHtml);
    const viewportOk = /<meta[^>]+name=(["'])viewport\1[^>]*>/i.test(rootHtml);
    const charsetOk = /<meta[^>]+charset=/i.test(rootHtml);
    const cspSignalOk = /<meta[^>]+http-equiv=(["'])Content-Security-Policy\1/i.test(rootHtml);
    const inlineScriptCount = countInlineScriptTags(rootHtml);
    const inlineEventHandlerCount = countInlineEventHandlerAttributes(rootHtml);
    const externalScriptsWithoutIntegrityCount = countExternalScriptsWithoutIntegrity(rootHtml);
    const externalScriptsWithIntegrityMissingCrossoriginCount = countExternalScriptsWithIntegrityMissingCrossorigin(rootHtml);
    const externalStylesheetsWithoutIntegrityCount = countExternalStylesheetsWithoutIntegrity(rootHtml);
    const externalStylesheetsWithIntegrityMissingCrossoriginCount = countExternalStylesheetsWithIntegrityMissingCrossorigin(rootHtml);
    const externalScriptsWithInsecureTransportCount = countExternalScriptsWithInsecureTransport(rootHtml);
    const externalStylesheetsWithInsecureTransportCount = countExternalStylesheetsWithInsecureTransport(rootHtml);
    const externalMediaSourcesWithInsecureTransportCount = countExternalMediaSourcesWithInsecureTransport(rootHtml);
    const externalBlankLinksWithoutRelCount = countExternalBlankLinksWithoutRel(rootHtml);
    const externalIframesWithoutSandboxCount = countExternalIframesWithoutSandbox(rootHtml);
    const externalIframesWithInsecureTransportCount = countExternalIframesWithInsecureTransport(rootHtml);

    if (!rootDocumentOk) {
      failures.push('root-document-invalid');
    }
    if (!titleOk) {
      failures.push('root-title-missing');
    }
    if (!langOk) {
      failures.push('root-lang-missing');
    }
    if (!viewportOk) {
      failures.push('root-viewport-missing');
    }
    if (assetPaths.length === 0) {
      failures.push('assets-missing');
    }

    let assetsPassed = 0;
    let combinedJs = '';
    let totalAssetBytes = 0;
    let jsAssetBytes = 0;
    let cssAssetBytes = 0;
    let largestAssetPath: string | null = null;
    let largestAssetBytes = 0;

    for (const assetPath of assetPaths) {
      const response = await fetch(`${server.baseUrl}${assetPath}`);
      const body = await response.text();
      const byteLength = Buffer.byteLength(body, 'utf-8');

      if (response.ok && body.length > 0) {
        assetsPassed += 1;
        totalAssetBytes += byteLength;
        if (assetPath.endsWith('.js')) {
          jsAssetBytes += byteLength;
        }
        if (assetPath.endsWith('.css')) {
          cssAssetBytes += byteLength;
        }
        if (byteLength > largestAssetBytes) {
          largestAssetBytes = byteLength;
          largestAssetPath = assetPath;
        }
      } else {
        failures.push(`asset-fetch-failed:${assetPath}`);
      }

      if (assetPath.endsWith('.js')) {
        combinedJs += body;
      }
    }

    const routeHintsMatched = routeHints.filter(routeHint => combinedJs.includes(routeHint)).length;
    const routeHintsCoverageOk = routeHints.length === 0 || routeHintsMatched === routeHints.length;
    const jsEvalSignalCount = countDynamicCodeSignals(combinedJs);
    const jsHtmlInjectionSignalCount = countHtmlInjectionSignals(combinedJs);
    const jsInsecureTransportSignalCount = countInsecureTransportSignals(combinedJs);
    const jsSecretSignalCount = countSecretLeakSignals(combinedJs);
    if (routeHints.length > 0 && routeHintsMatched < Math.min(2, routeHints.length)) {
      failures.push('route-hints-missing');
    }

    let routeDocumentsPassed = 0;
    let routeDocumentsHardenedCount = 0;
    for (const routeHint of routeHints) {
      const routeResponse = await fetch(`${server.baseUrl}${routeHint}`);
      const routeHtml = await routeResponse.text();
      const routeRootDocumentOk = routeResponse.ok && /id="root"/.test(routeHtml);
      const routeTitleOk = /<title>[^<]+<\/title>/i.test(routeHtml);
      const routeLangOk = /<html[^>]*\slang=(["'])[^"']+\1/i.test(routeHtml);
      const routeViewportOk = /<meta[^>]+name=(["'])viewport\1[^>]*>/i.test(routeHtml);
      const routeCharsetOk = /<meta[^>]+charset=/i.test(routeHtml);
      if (routeRootDocumentOk) {
        routeDocumentsPassed += 1;
        if (routeTitleOk && routeLangOk && routeViewportOk && routeCharsetOk) {
          routeDocumentsHardenedCount += 1;
        } else {
          failures.push(`route-document-hardening-failed:${routeHint}`);
        }
      } else {
        failures.push(`route-document-failed:${routeHint}`);
      }
    }

    const routeDocumentsChecked = routeHints.length;
    const routeDocumentsCoverageOk = routeDocumentsChecked === 0 || routeDocumentsPassed === routeDocumentsChecked;
    const routeDocumentsHardeningOk = routeDocumentsChecked === 0 || routeDocumentsHardenedCount === routeDocumentsChecked;
    const fullRouteCoverageOk = routeHintsCoverageOk && routeDocumentsCoverageOk;
    if (routeDocumentsChecked > 0 && routeDocumentsPassed < Math.min(2, routeDocumentsChecked)) {
      failures.push('route-documents-missing');
    }
    if (routeDocumentsChecked > 0 && routeDocumentsHardenedCount < Math.min(2, routeDocumentsChecked)) {
      failures.push('route-documents-hardening-missing');
    }

    const passed = rootDocumentOk
      && titleOk
      && assetPaths.length > 0
      && assetsPassed === assetPaths.length
      && (routeDocumentsChecked === 0 || routeDocumentsPassed >= Math.min(2, routeDocumentsChecked))
      && (routeHints.length === 0 || routeHintsMatched >= Math.min(2, routeHints.length));

    return {
      distPresent: true,
      indexPresent: true,
      checked: true,
      passed,
      rootDocumentOk,
      titleOk,
      langOk,
      viewportOk,
      charsetOk,
      cspSignalOk,
      inlineScriptCount,
      inlineEventHandlerCount,
      externalScriptsWithoutIntegrityCount,
      externalScriptsWithIntegrityMissingCrossoriginCount,
      externalStylesheetsWithoutIntegrityCount,
      externalStylesheetsWithIntegrityMissingCrossoriginCount,
      externalScriptsWithInsecureTransportCount,
      externalStylesheetsWithInsecureTransportCount,
      externalMediaSourcesWithInsecureTransportCount,
      externalBlankLinksWithoutRelCount,
      externalIframesWithoutSandboxCount,
      externalIframesWithInsecureTransportCount,
      jsEvalSignalCount,
      jsHtmlInjectionSignalCount,
      jsInsecureTransportSignalCount,
      jsSecretSignalCount,
      assetCount: assetPaths.length,
      assetsPassed,
      routeHintsChecked: routeHints,
      routeHintsMatched,
      routeHintsCoverageOk,
      routeDocumentsChecked,
      routeDocumentsPassed,
      routeDocumentsHardenedCount,
      routeDocumentsCoverageOk,
      routeDocumentsHardeningOk,
      fullRouteCoverageOk,
      totalAssetBytes,
      jsAssetBytes,
      cssAssetBytes,
      largestAssetPath,
      largestAssetBytes,
      failures,
    };
  } finally {
    await server.close();
  }
}
