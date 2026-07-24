#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { once } from 'node:events';
import net from 'node:net';
import { deflateSync } from 'node:zlib';

function parseArguments(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--workspace') options.workspace = resolve(argv[++index]);
    else if (argument === '--project-path') options.projectPath = argv[++index];
    else if (argument === '--evaluator-runtime') {
      options.evaluatorRuntime = resolve(argv[++index]);
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  if (!options.workspace || !options.projectPath) {
    throw new Error('--workspace and --project-path are required');
  }
  if (!options.evaluatorRuntime) throw new Error('--evaluator-runtime is required');
  options.project = resolve(options.workspace, options.projectPath);
  return options;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function reservePort() {
  const server = net.createServer();
  server.unref();
  await new Promise((resolveListen, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolveListen);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : null;
  await new Promise((resolveClose, reject) => {
    server.close((error) => (error ? reject(error) : resolveClose()));
  });
  if (!port) throw new Error('Unable to reserve evaluator port');
  return port;
}

async function waitForServer(origin, child, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before readiness with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(2_000) });
      if (response.status > 0) return;
    } catch {
      await delay(150);
    }
  }
  throw new Error('Timed out waiting for the Next.js evaluator harness');
}

async function stopProcess(child) {
  if (child.exitCode !== null) return;
  child.kill('SIGTERM');
  await Promise.race([once(child, 'exit'), delay(8_000)]);
  if (child.exitCode === null) {
    child.kill('SIGKILL');
    await once(child, 'exit').catch(() => {});
  }
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function createSeedPng(width = 32, height = 32) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;
  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const row = Buffer.alloc(1 + width * 4);
    row[0] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = 1 + x * 4;
      const band = (Math.floor(x / 4) + Math.floor(y / 4)) % 3;
      row[offset] = band === 0 ? 230 : 35;
      row[offset + 1] = band === 1 ? 190 : 45;
      row[offset + 2] = band === 2 ? 220 : 55;
      row[offset + 3] = 255;
    }
    rows.push(row);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(Buffer.concat(rows))),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

function propertyName(typescript, node) {
  if (!node?.name) return null;
  if (typescript.isIdentifier(node.name) || typescript.isStringLiteral(node.name)) {
    return node.name.text;
  }
  return null;
}

function parseImageConfig(projectRequire, configSource) {
  const typescript = projectRequire('typescript');
  const sourceFile = typescript.createSourceFile(
    'next.config.ts',
    configSource,
    typescript.ScriptTarget.Latest,
    true,
    typescript.ScriptKind.TS,
  );
  const evidence = {
    localPatternsDeclared: false,
    localPathnames: [],
    qualities: [],
  };
  const visit = (node) => {
    if (typescript.isPropertyAssignment(node)) {
      const name = propertyName(typescript, node);
      if (name === 'localPatterns' && typescript.isArrayLiteralExpression(node.initializer)) {
        evidence.localPatternsDeclared = true;
        for (const element of node.initializer.elements) {
          if (!typescript.isObjectLiteralExpression(element)) continue;
          for (const property of element.properties) {
            if (
              typescript.isPropertyAssignment(property) &&
              propertyName(typescript, property) === 'pathname' &&
              typescript.isStringLiteral(property.initializer)
            ) {
              evidence.localPathnames.push(property.initializer.text);
            }
          }
        }
      }
      if (name === 'qualities' && typescript.isArrayLiteralExpression(node.initializer)) {
        evidence.qualities.push(
          ...node.initializer.elements
            .filter((element) => typescript.isNumericLiteral(element))
            .map((element) => Number(element.text)),
        );
      }
    }
    typescript.forEachChild(node, visit);
  };
  visit(sourceFile);
  evidence.localPathnames = [...new Set(evidence.localPathnames)];
  evidence.qualities = [...new Set(evidence.qualities)];
  return evidence;
}

function globMatches(pattern, pathname) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/gu, '\\$&');
  const expression = escaped.replace(/\*\*/gu, '.*').replace(/\*/gu, '[^/]*');
  return new RegExp(`^${expression}$`, 'u').test(pathname);
}

async function createHarness(options, imageConfig, port) {
  const projectRequire = createRequire(join(options.project, 'package.json'));
  const nextPackagePath = projectRequire.resolve('next/package.json');
  const nextPackage = JSON.parse(await readFile(nextPackagePath, 'utf8'));
  const nextCli = resolve(dirname(nextPackagePath), nextPackage.bin.next);
  const utilityPath = join(options.project, 'src', 'utilities', 'getMediaUrl.ts');
  await Promise.all([access(utilityPath), access(join(options.project, 'node_modules'))]);

  const root = await realpath(await mkdtemp(join(tmpdir(), 'payload-next-image-evaluator-')));
  await Promise.all([
    mkdir(join(root, 'app', 'api', 'media', 'file', '[...slug]'), { recursive: true }),
    mkdir(join(root, 'app', 'site'), { recursive: true }),
    mkdir(join(root, 'app', 'live-preview'), { recursive: true }),
    mkdir(join(root, 'candidate'), { recursive: true }),
    mkdir(join(root, 'components'), { recursive: true }),
    mkdir(join(root, 'utilities'), { recursive: true }),
    mkdir(join(root, 'public'), { recursive: true }),
  ]);
  await symlink(join(options.project, 'node_modules'), join(root, 'node_modules'), 'dir');
  await symlink(utilityPath, join(root, 'candidate', 'getMediaUrl.ts'), 'file');

  const localPatternsProperty = imageConfig.localPatternsDeclared
    ? `localPatterns: ${JSON.stringify(
        imageConfig.localPathnames.map((pathname) => ({ pathname })),
      )},`
    : '';
  const qualities = imageConfig.qualities.length > 0 ? imageConfig.qualities : [100];
  await writeFile(
    join(root, 'next.config.mjs'),
    `export default {
  images: {
    ${localPatternsProperty}
    qualities: ${JSON.stringify(qualities)},
    remotePatterns: [{ protocol: 'http', hostname: '127.0.0.1', port: ${JSON.stringify(
      String(port),
    )} }],
  },
  reactStrictMode: true,
  turbopack: { root: ${JSON.stringify(root)} },
};
`,
  );
  await writeFile(
    join(root, 'package.json'),
    `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`,
  );
  await writeFile(
    join(root, 'tsconfig.json'),
    `${JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'react-jsx',
          incremental: true,
          paths: { '@/*': ['./*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    join(root, 'utilities', 'getURL.ts'),
    `export const getClientSideURL = () =>
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://127.0.0.1:${port}';
`,
  );
  await writeFile(
    join(root, 'app', 'layout.tsx'),
    `import './styles.css';
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
`,
  );
  await writeFile(
    join(root, 'app', 'styles.css'),
    `html, body { margin: 0; min-height: 100%; font-family: Arial, sans-serif; background: #f5f7fa; color: #172033; }
main { max-width: 760px; margin: 0 auto; padding: 48px 24px; }
.probe { background: white; border: 1px solid #cbd5e1; padding: 24px; }
.media-frame { width: 256px; height: 256px; display: grid; place-items: center; background: #e2e8f0; }
.media-frame img { width: 224px; height: 224px; image-rendering: pixelated; }
code { display: block; margin-top: 18px; overflow-wrap: anywhere; }
`,
  );
  await writeFile(
    join(root, 'components', 'MediaProbe.tsx'),
    `import Image from 'next/image';
import { getMediaUrl } from '@/candidate/getMediaUrl';

export function MediaProbe({ context }: { context: 'site' | 'live-preview' }) {
  const localSource = getMediaUrl('/api/media/file/seed.png', 'seed tag');
  const externalSource = getMediaUrl('https://cdn.example.test/seed.png', 'v 3');
  return (
    <main>
      <h1>{context === 'site' ? 'Site media' : 'Live preview media'}</h1>
      <section
        className="probe"
        data-context={context}
        data-local-source={localSource}
        data-external-source={externalSource}
      >
        <div className="media-frame">
          <Image
            id={\`\${context}-image\`}
            src={localSource}
            alt={\`\${context} seeded media\`}
            width={32}
            height={32}
            quality={100}
            priority
          />
        </div>
        <code>{localSource}</code>
      </section>
    </main>
  );
}
`,
  );
  await writeFile(
    join(root, 'app', 'site', 'page.tsx'),
    `import { MediaProbe } from '@/components/MediaProbe';
export default function SitePage() { return <MediaProbe context="site" />; }
`,
  );
  await writeFile(
    join(root, 'app', 'live-preview', 'page.tsx'),
    `import { MediaProbe } from '@/components/MediaProbe';
export default function LivePreviewPage() { return <MediaProbe context="live-preview" />; }
`,
  );
  await writeFile(
    join(root, 'app', 'api', 'media', 'file', '[...slug]', 'route.ts'),
    `import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function GET() {
  const image = await readFile(join(process.cwd(), 'public', 'seed.png'));
  return new Response(image, {
    status: 200,
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
`,
  );
  await writeFile(join(root, 'public', 'seed.png'), createSeedPng());
  return { root, nextCli, nextVersion: nextPackage.version };
}

async function inspectPage(browser, origin, routeName) {
  const context = await browser.newContext({ viewport: { width: 1080, height: 820 } });
  const page = await context.newPage();
  page.setDefaultTimeout(25_000);
  const runtimeErrors = [];
  const optimizerResponses = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => runtimeErrors.push(`page: ${error.message}`));
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.pathname === '/_next/image') {
      optimizerResponses.push({
        status: response.status(),
        url: response.url(),
        contentType: response.headers()['content-type'] ?? null,
      });
    }
  });
  const response = await page.goto(`${origin}/${routeName}`, { waitUntil: 'networkidle' });
  const image = page.locator(`#${routeName}-image`);
  await image.waitFor({ state: 'attached' });
  await page.waitForFunction(
    (id) => {
      const element = document.getElementById(id);
      return element instanceof HTMLImageElement && element.complete;
    },
    `${routeName}-image`,
  );
  const probe = await page.locator('[data-context]').evaluate((element) => ({
    localSource: element.getAttribute('data-local-source'),
    externalSource: element.getAttribute('data-external-source'),
  }));
  const decoded = await image.evaluate((element) => {
    const imageElement = element;
    if (!(imageElement instanceof HTMLImageElement) || imageElement.naturalWidth === 0) {
      return {
        complete: imageElement instanceof HTMLImageElement ? imageElement.complete : false,
        naturalWidth: imageElement instanceof HTMLImageElement ? imageElement.naturalWidth : 0,
        naturalHeight: imageElement instanceof HTMLImageElement ? imageElement.naturalHeight : 0,
        coloredPixels: 0,
        uniqueColors: 0,
      };
    }
    const canvas = document.createElement('canvas');
    canvas.width = imageElement.naturalWidth;
    canvas.height = imageElement.naturalHeight;
    const drawing = canvas.getContext('2d', { willReadFrequently: true });
    drawing.drawImage(imageElement, 0, 0);
    const pixels = drawing.getImageData(0, 0, canvas.width, canvas.height).data;
    let coloredPixels = 0;
    const colors = new Set();
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      if (alpha > 0 && (red < 245 || green < 245 || blue < 245)) coloredPixels += 1;
      colors.add(`${red},${green},${blue},${alpha}`);
    }
    return {
      complete: imageElement.complete,
      naturalWidth: imageElement.naturalWidth,
      naturalHeight: imageElement.naturalHeight,
      coloredPixels,
      uniqueColors: colors.size,
    };
  });
  const imageUrl = await image.getAttribute('src');
  const screenshot = await page.screenshot({ fullPage: false });
  const result = {
    documentStatus: response?.status() ?? null,
    probe,
    imageUrl,
    optimizerSource: imageUrl
      ? new URL(imageUrl, origin).searchParams.get('url')
      : null,
    optimizerResponses,
    decoded,
    screenshot: { bytes: screenshot.length, sha256: sha256(screenshot) },
    runtimeErrors,
  };
  await context.close();
  return result;
}

async function evaluate() {
  const options = parseArguments(process.argv.slice(2));
  const projectRequire = createRequire(join(options.project, 'package.json'));
  const configSource = await readFile(join(options.project, 'next.config.ts'), 'utf8');
  const imageConfig = parseImageConfig(projectRequire, configSource);
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const harness = await createHarness(options, imageConfig, port);
  const server = spawn(
    process.execPath,
    [
      harness.nextCli,
      'dev',
      '--webpack',
      '--hostname',
      '127.0.0.1',
      '--port',
      String(port),
    ],
    {
      cwd: harness.root,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_PUBLIC_SERVER_URL: origin,
        __NEXT_PRIVATE_ORIGIN: origin,
        NO_COLOR: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  const serverOutput = [];
  for (const stream of [server.stdout, server.stderr]) {
    stream.on('data', (chunk) => {
      if (serverOutput.join('').length < 20_000) serverOutput.push(chunk.toString());
    });
  }

  let browser;
  try {
    try {
      await waitForServer(origin, server);
    } catch (error) {
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}: ${serverOutput
          .join('')
          .slice(-20_000)}`,
      );
    }
    const runtimeRequire = createRequire(join(options.evaluatorRuntime, 'package.json'));
    const { chromium } = runtimeRequire('playwright');
    browser = await chromium.launch({ headless: true });
    const site = await inspectPage(browser, origin, 'site');
    const livePreview = await inspectPage(browser, origin, 'live-preview');
    const checks = {
      exactNext16RuntimeIsExercised: /^16\./u.test(harness.nextVersion),
      localMediaUtilityRemainsRelativeAndCacheTagged:
        site.probe.localSource === '/api/media/file/seed.png?seed%20tag' &&
        livePreview.probe.localSource === '/api/media/file/seed.png?seed%20tag',
      externalMediaRemainsAbsoluteAndCacheTagged:
        site.probe.externalSource === 'https://cdn.example.test/seed.png?v%203' &&
        livePreview.probe.externalSource === 'https://cdn.example.test/seed.png?v%203',
      localImagePolicyAllowsOnlyMediaEndpoint:
        imageConfig.localPatternsDeclared &&
        imageConfig.localPathnames.some((pattern) =>
          globMatches(pattern, '/api/media/file/seed.png'),
        ) &&
        !imageConfig.localPathnames.some((pattern) =>
          globMatches(pattern, '/api/admin/users'),
        ),
      siteOptimizerReturnsSuccessfulImage:
        site.optimizerResponses.some(
          (response) =>
            response.status === 200 && response.contentType?.startsWith('image/'),
        ) &&
        site.optimizerSource === '/api/media/file/seed.png?seed%20tag',
      livePreviewOptimizerReturnsSuccessfulImage:
        livePreview.optimizerResponses.some(
          (response) =>
            response.status === 200 && response.contentType?.startsWith('image/'),
        ) &&
        livePreview.optimizerSource === '/api/media/file/seed.png?seed%20tag',
      siteImageDecodesToNonblankPixels:
        site.decoded.naturalWidth >= 32 &&
        site.decoded.naturalHeight >= 32 &&
        site.decoded.coloredPixels > 200 &&
        site.decoded.uniqueColors >= 3,
      livePreviewImageDecodesToNonblankPixels:
        livePreview.decoded.naturalWidth >= 32 &&
        livePreview.decoded.naturalHeight >= 32 &&
        livePreview.decoded.coloredPixels > 200 &&
        livePreview.decoded.uniqueColors >= 3,
      fixedScreenshotsAreNonblank:
        site.screenshot.bytes > 10_000 && livePreview.screenshot.bytes > 10_000,
      browserConsoleIsClean:
        site.runtimeErrors.length === 0 && livePreview.runtimeErrors.length === 0,
    };
    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations:
          checks.localMediaUtilityRemainsRelativeAndCacheTagged &&
          checks.externalMediaRemainsAbsoluteAndCacheTagged &&
          checks.localImagePolicyAllowsOnlyMediaEndpoint
            ? 0
            : 1,
        accessibilityViolations: 0,
        visualScore: Math.round(
          ([
            checks.siteImageDecodesToNonblankPixels,
            checks.livePreviewImageDecodesToNonblankPixels,
            checks.fixedScreenshotsAreNonblank,
          ].filter(Boolean).length /
            3) *
            100,
        ),
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidence: {
        nextVersion: harness.nextVersion,
        imageConfig,
        site,
        livePreview,
      },
      serverOutput,
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
    await rm(harness.root, { recursive: true, force: true });
  }
}

try {
  const result = await evaluate();
  process.stdout.write(`${JSON.stringify(result)}\n`);
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  process.stdout.write(
    `${JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 1, accessibilityViolations: 1, visualScore: 0 },
      checks: [{ id: 'evaluator-runtime', passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    })}\n`,
  );
  process.exitCode = 1;
}
