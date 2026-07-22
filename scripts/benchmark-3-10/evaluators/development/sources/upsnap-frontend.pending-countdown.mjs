#!/usr/bin/env node
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer as createNetServer } from "node:net";
import { isAbsolute, join, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

function parseArguments(argv) {
  if (argv.length !== 6 || argv.length % 2 !== 0) {
    throw new Error(
      "Expected --workspace, --project-path, and --evaluator-runtime arguments",
    );
  }
  const values = Object.fromEntries(
    Array.from({ length: argv.length / 2 }, (_, index) => [
      argv[index * 2],
      argv[index * 2 + 1],
    ]),
  );
  if (
    !values["--workspace"] ||
    values["--project-path"] === undefined ||
    !values["--evaluator-runtime"]
  ) {
    throw new Error("Missing evaluator argument");
  }
  const workspace = resolve(values["--workspace"]);
  const project = resolve(workspace, values["--project-path"]);
  const relation = relative(workspace, project);
  if (
    relation === ".." ||
    relation.startsWith(`..${process.platform === "win32" ? "\\" : "/"}`) ||
    isAbsolute(relation)
  ) {
    throw new Error("Project path escapes the workspace");
  }
  return { project, evaluatorRuntime: resolve(values["--evaluator-runtime"]) };
}

async function reservePort() {
  const server = createNetServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Unable to reserve a Vite port");
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

function packageEntry(projectRequire, name) {
  return pathToFileURL(projectRequire.resolve(name)).href;
}

async function createHarness(project) {
  const projectRequire = createRequire(join(project, "package.json"));
  const [{ createServer }, { svelte }, tailwindModule] = await Promise.all([
    import(packageEntry(projectRequire, "vite")),
    import(packageEntry(projectRequire, "@sveltejs/vite-plugin-svelte")),
    import(packageEntry(projectRequire, "@tailwindcss/vite")),
  ]);
  const tailwindcss = tailwindModule.default;
  const directory = await mkdtemp(
    join(tmpdir(), "upsnap-countdown-evaluator-"),
  );
  await symlink(
    join(project, "node_modules"),
    join(directory, "node_modules"),
    "dir",
  );
  const messagesPath = join(directory, "messages.js");
  const pocketbasePath = join(directory, "pocketbase.js");
  await writeFile(
    messagesPath,
    `export const m = new Proxy({}, { get: () => () => 'Pending device' });\n`,
    "utf8",
  );
  await writeFile(
    pocketbasePath,
    `import { writable } from 'svelte/store';
export const backendUrl = '';
export const permission = writable({ power: [] });
export const pocketbase = writable({ authStore: { isSuperuser: true, token: '' } });
`,
    "utf8",
  );
  const componentPath = join(
    project,
    "src/lib/components/DeviceCardNic.svelte",
  );
  const cssPath = join(project, "src/app.css");
  await readFile(componentPath, "utf8");
  const appCss = await readFile(cssPath, "utf8");
  await writeFile(
    join(directory, "app.css"),
    `${appCss}\n@source ${JSON.stringify(componentPath)};\n`,
    "utf8",
  );
  await writeFile(
    join(directory, "index.html"),
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head><body><main id="app" data-evaluator-root></main><script type="module" src="/main.js"></script></body></html>\n',
    "utf8",
  );
  await writeFile(
    join(directory, "main.js"),
    `import './app.css';
import { mount } from 'svelte';
import DeviceCardNic from ${JSON.stringify(componentPath)};

const device = {
  id: 'evaluator-device',
  name: 'Evaluator device',
  ip: '192.0.2.10',
  mac: '00:11:22:33:44:55',
  status: 'pending',
  updated: new Date().toISOString(),
  wake_timeout: 65,
  shutdown_timeout: 65,
  wake_confirm: false,
  shutdown_confirm: false,
  shutdown_cmd: '',
  link: '',
  link_open: '',
  expand: { ports: [], groups: [] },
};

mount(DeviceCardNic, { target: document.querySelector('#app'), props: { device } });
`,
    "utf8",
  );
  const port = await reservePort();
  const server = await createServer({
    root: directory,
    configFile: false,
    envFile: false,
    logLevel: "silent",
    plugins: [tailwindcss(), svelte({ configFile: false })],
    resolve: {
      alias: [
        { find: "$lib/paraglide/messages", replacement: messagesPath },
        { find: "$lib/stores/pocketbase", replacement: pocketbasePath },
        { find: "$lib", replacement: join(project, "src/lib") },
      ],
      dedupe: ["svelte"],
    },
    server: {
      host: "127.0.0.1",
      port,
      strictPort: true,
      fs: { allow: [directory, project] },
    },
  });
  await server.listen();
  return {
    directory,
    origin: `http://127.0.0.1:${port}`,
    close: async () => {
      await server.close();
      await rm(directory, { recursive: true, force: true });
    },
  };
}

function percentage(checks) {
  const values = Object.values(checks);
  return values.length === 0
    ? 0
    : Math.round((values.filter(Boolean).length / values.length) * 100);
}

async function snapshot(page, button, countdown, label) {
  const geometry = await countdown.evaluate((element) => {
    const button = element.closest("button");
    const root = element.closest("[data-evaluator-root]");
    const spans = [...element.querySelectorAll(":scope > span")];
    const elementStyle = getComputedStyle(element);
    const spanStyles = spans.map((span) => getComputedStyle(span));
    const pseudoStyles = spans.map((span) =>
      getComputedStyle(span, "::before"),
    );
    const box = (node) => {
      const rect = node.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height,
      };
    };
    const buttonBox = button ? box(button) : null;
    const countdownBox = box(element);
    const spanBoxes = spans.map(box);
    return {
      buttonWidth: buttonBox?.width ?? 0,
      countdownWidth: countdownBox.width,
      spanWidths: spanBoxes.map((rect) => rect.width),
      spanDigits: spanStyles.map((style) =>
        style.getPropertyValue("--digits").trim(),
      ),
      values: spanStyles.map((style) =>
        style.getPropertyValue("--value").trim(),
      ),
      display: elementStyle.display,
      fontFamily: elementStyle.fontFamily,
      fontVariantNumeric: elementStyle.fontVariantNumeric,
      buttonBackground: button ? getComputedStyle(button).backgroundColor : "",
      animated: [...spanStyles, ...pseudoStyles].some(
        (style) =>
          style.animationName !== "none" ||
          style.transitionDuration
            .split(",")
            .some((duration) => Number.parseFloat(duration) > 0),
      ),
      noInternalOverflow:
        Boolean(button && root && buttonBox) &&
        element.scrollWidth <= element.clientWidth + 1 &&
        button.scrollWidth <= button.clientWidth + 1 &&
        root.scrollWidth <= root.clientWidth + 1 &&
        countdownBox.left >= buttonBox.left - 1 &&
        countdownBox.right <= buttonBox.right + 1,
    };
  });
  const innerText = (await countdown.innerText()).replace(/\s+/gu, " ").trim();
  const ariaSnapshot = await button.ariaSnapshot();
  const screenshot = await button.screenshot({ animations: "disabled" });
  return {
    label,
    geometry,
    innerText,
    ariaSnapshot,
    screenshotBytes: screenshot.length,
  };
}

function renderedText(state) {
  const direct = /\b\d{2}:\d{2}\b/u.exec(
    `${state.innerText}\n${state.ariaSnapshot}`,
  )?.[0];
  if (direct) return direct;
  const values = state.geometry.values.map(Number);
  const browserReportsTwoDigitColumns =
    values.length === 2 &&
    values.every(Number.isFinite) &&
    state.geometry.spanDigits.length === 2 &&
    state.geometry.spanDigits.every((digits) => digits === "2") &&
    state.geometry.spanWidths.every((width) => width > 0);
  return browserReportsTwoDigitColumns
    ? `${String(values[0]).padStart(2, "0")}:${String(values[1]).padStart(2, "0")}`
    : "";
}

async function countdownSeconds(countdown) {
  const values = await countdown.evaluate((element) =>
    [...element.querySelectorAll(":scope > span")].map((span) =>
      Number(getComputedStyle(span).getPropertyValue("--value")),
    ),
  );
  return values.length === 2 && values.every(Number.isFinite)
    ? values[0] * 60 + values[1]
    : Number.NaN;
}

async function advanceTo(page, countdown, target) {
  for (let tick = 0; tick < 70; tick += 1) {
    const current = await countdownSeconds(countdown);
    if (current === target) return;
    if (!Number.isFinite(current) || current < target)
      throw new Error(`Countdown skipped ${target} seconds`);
    await page.clock.fastForward(1000);
  }
  throw new Error(`Countdown did not reach ${target} seconds`);
}

async function run() {
  const { project, evaluatorRuntime } = parseArguments(process.argv.slice(2));
  const runtimeRequire = createRequire(join(evaluatorRuntime, "package.json"));
  const { chromium } = runtimeRequire("playwright");
  const AxeBuilder = runtimeRequire("@axe-core/playwright").default;
  const harness = await createHarness(project);
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 720, height: 420 },
    });
    const page = await context.newPage();
    await page.clock.install({ time: new Date("2026-07-22T12:00:00.000Z") });
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    await page.goto(harness.origin, {
      waitUntil: "networkidle",
      timeout: 120000,
    });
    const button = page
      .locator("[data-evaluator-root] button.btn-warning")
      .first();
    const countdown = button.locator(".countdown");
    await countdown.waitFor({ timeout: 120000 });
    await page.waitForFunction(
      () =>
        document.querySelector(".countdown")?.querySelectorAll(":scope > span")
          .length === 2,
    );

    const at65 = await snapshot(page, button, countdown, "65");
    await advanceTo(page, countdown, 9);
    const at9 = await snapshot(page, button, countdown, "9");
    await advanceTo(page, countdown, 0);
    const at0 = await snapshot(page, button, countdown, "0");
    await page.clock.fastForward(5000);
    const afterZero = await snapshot(page, button, countdown, "after-zero");

    await button.focus();
    const focusLands = await button.evaluate(
      (element) => document.activeElement === element,
    );
    const axe = await new AxeBuilder({ page })
      .include("[data-evaluator-root] button.btn-warning")
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const states = [at65, at9, at0, afterZero];
    const widths = states.map((state) => state.geometry.buttonWidth);
    const checks = {
      authenticPendingComponentMounted: states.every(
        (state) =>
          state.geometry.display !== "none" &&
          state.geometry.spanWidths.length === 2,
      ),
      rendersSixtyFiveSecondsAsTwoDigitMinutesAndSeconds:
        renderedText(at65) === "01:05",
      rendersNineSecondsAsTwoDigitMinutesAndSeconds:
        renderedText(at9) === "00:09",
      rendersZeroAsValidTwoDigitTime: renderedText(at0) === "00:00",
      stopsAtValidZero: renderedText(afterZero) === "00:00",
      countdownButtonWidthRemainsStable:
        Math.max(...widths) - Math.min(...widths) <= 1,
      bothDigitColumnsRemainFixedWidth: states.every(
        (state) =>
          state.geometry.spanWidths.length === 2 &&
          state.geometry.spanWidths.every((width) => width > 0) &&
          Math.abs(
            state.geometry.spanWidths[0] - state.geometry.spanWidths[1],
          ) <= 1,
      ),
      animatedCountdownTreatmentRemains: states.every(
        (state) => state.geometry.animated,
      ),
      warningStatusStylingRemains: states.every(
        (state) =>
          state.geometry.buttonBackground &&
          state.geometry.buttonBackground !== "rgba(0, 0, 0, 0)",
      ),
      noCountdownOrButtonOverflow: states.every(
        (state) => state.geometry.noInternalOverflow,
      ),
      pendingButtonIsKeyboardFocusable: focusLands,
      fixedScreenshotsCaptured: states.every(
        (state) => state.screenshotBytes > 500,
      ),
      noRuntimeErrors: runtimeErrors.length === 0,
      accessibilityScanPasses: axe.violations.length === 0,
    };
    return {
      passed: Object.values(checks).every(Boolean),
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: axe.violations.length,
        visualScore: percentage(checks),
      },
      checks,
      evidence: {
        states: states.map(({ screenshotBytes, ...state }) => ({
          ...state,
          renderedText: renderedText(state),
          screenshotBytes,
        })),
        runtimeErrorCount: runtimeErrors.length,
        runtimeErrors: runtimeErrors.slice(0, 5),
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
      },
    };
  } finally {
    await context?.close();
    await browser?.close();
    await harness.close();
  }
}

const stdoutWrite = process.stdout.write;
process.stdout.write = () => true;
let result;
try {
  result = await run();
} catch (error) {
  result = {
    passed: false,
    metrics: {
      governanceViolations: 0,
      accessibilityViolations: 1,
      visualScore: 0,
    },
    checks: { runtimeAvailable: false },
    evidence: {
      error:
        error instanceof Error
          ? error.message.slice(0, 500)
          : String(error).slice(0, 500),
    },
  };
} finally {
  process.stdout.write = stdoutWrite;
}
console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
