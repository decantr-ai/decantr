#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { isAbsolute, join, relative, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

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
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Unable to reserve a Nuxt port");
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

function captureProcess(child) {
  let output = "";
  const append = (chunk) => {
    output = `${output}${chunk.toString()}`.slice(-16000);
  };
  child.stdout?.on("data", append);
  child.stderr?.on("data", append);
  return () => output;
}

async function waitForHttp(url, child, getOutput, timeoutMs = 180000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(
        `Nuxt exited before becoming ready: ${getOutput().slice(-1200)}`,
      );
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server socket is not ready yet.
    }
    await delay(250);
  }
  throw new Error(`Nuxt did not become ready: ${getOutput().slice(-1200)}`);
}

async function stopProcess(child) {
  if (child.exitCode !== null || child.pid === undefined) return;
  const signal = (name) => {
    try {
      process.kill(process.platform === "win32" ? child.pid : -child.pid, name);
    } catch {
      // The process may have exited between checks.
    }
  };
  signal("SIGTERM");
  await Promise.race([once(child, "exit"), delay(5000)]);
  if (child.exitCode === null) {
    signal("SIGKILL");
    await Promise.race([once(child, "exit"), delay(2000)]);
  }
}

async function startNuxt(project) {
  const port = await reservePort();
  const child = spawn(
    "pnpm",
    ["run", "dev", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: project,
      detached: process.platform !== "win32",
      env: {
        ...process.env,
        BROWSER: "none",
        CI: "1",
        NUXT_TELEMETRY_DISABLED: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const getOutput = captureProcess(child);
  const origin = `http://127.0.0.1:${port}`;
  await waitForHttp(origin, child, getOutput);
  return { child, origin };
}

function percentage(checks) {
  const values = Object.values(checks);
  return values.length === 0
    ? 0
    : Math.round((values.filter(Boolean).length / values.length) * 100);
}

async function analyzeAxe(page, AxeBuilder, selector, prepare) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      return await new AxeBuilder({ page })
        .include(selector)
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
    } catch (error) {
      const transientReload =
        error instanceof Error &&
        (error.message.includes("Execution context was destroyed") ||
          error.message.includes(
            "Target page, context or browser has been closed",
          ));
      if (!transientReload || attempt === 7) throw error;
      await delay(1000);
      await prepare();
    }
  }
  throw new Error("Axe scan did not complete");
}

function opaque(color) {
  return (
    color !== "transparent" &&
    color !== "rgba(0, 0, 0, 0)" &&
    !color.endsWith("/ 0)")
  );
}

async function computedState(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      backgroundColor: style.backgroundColor,
      color: style.color,
      opacity: Number.parseFloat(style.opacity),
      textDecorationLine: style.textDecorationLine,
      boxShadow: style.boxShadow,
      outlineStyle: style.outlineStyle,
    };
  });
}

async function inspectSelected(page, locator) {
  await locator.evaluate((element) => {
    element.style.transition = "none";
  });
  await page.mouse.move(1, 1);
  await locator.evaluate((element) => element.blur());
  const normal = await computedState(locator);
  await locator.hover();
  const hover = await computedState(locator);
  await page.mouse.move(1, 1);
  await locator.focus();
  const focus = await computedState(locator);
  return {
    normal,
    hover,
    focus,
    hoverRetainsSelection:
      opaque(normal.backgroundColor) &&
      hover.backgroundColor === normal.backgroundColor &&
      hover.color === normal.color,
    focusRetainsSelection:
      focus.backgroundColor === normal.backgroundColor &&
      focus.color === normal.color,
    keyboardFocusable: await locator.evaluate(
      (element) => document.activeElement === element,
    ),
  };
}

async function inspectUnselectedStates(page, locator) {
  await locator.evaluate((element) => {
    element.style.transition = "none";
    for (const name of [
      "data-disabled",
      "data-unavailable",
      "data-outside-view",
      "data-today",
    ])
      element.removeAttribute(name);
  });
  await page.mouse.move(1, 1);
  await locator.evaluate((element) => element.blur());
  const normal = await computedState(locator);
  await locator.hover();
  const hover = await computedState(locator);
  await page.mouse.move(1, 1);
  await locator.focus();
  const focus = await computedState(locator);
  const probes = await locator.evaluate((element) => {
    const inspect = (attribute) => {
      const clone = element.cloneNode(true);
      for (const name of [
        "data-selected",
        "data-selection-start",
        "data-selection-end",
        "data-disabled",
        "data-unavailable",
        "data-outside-view",
        "data-today",
      ]) {
        clone.removeAttribute(name);
      }
      clone.setAttribute(attribute, "true");
      clone.style.transition = "none";
      clone.style.position = "absolute";
      clone.style.left = "-10000px";
      element.parentElement?.append(clone);
      const style = getComputedStyle(clone);
      const state = {
        backgroundColor: style.backgroundColor,
        color: style.color,
        opacity: Number.parseFloat(style.opacity),
        textDecorationLine: style.textDecorationLine,
      };
      clone.remove();
      return state;
    };
    return {
      disabled: inspect("data-disabled"),
      unavailable: inspect("data-unavailable"),
      outside: inspect("data-outside-view"),
      today: inspect("data-today"),
    };
  });
  return {
    normal,
    hover,
    focus,
    ...probes,
    unselectedHoverRemainsDistinct:
      hover.backgroundColor !== normal.backgroundColor &&
      hover.backgroundColor !== "rgba(0, 0, 0, 0)",
    unselectedFocusDoesNotBecomeSelected:
      focus.backgroundColor === normal.backgroundColor,
    disabledTreatmentPreserved: probes.disabled.opacity <= 0.5,
    unavailableTreatmentPreserved:
      probes.unavailable.textDecorationLine.includes("line-through"),
    outsideTreatmentPreserved: probes.outside.color !== normal.color,
    todayTreatmentPreserved:
      opaque(probes.today.backgroundColor) &&
      probes.today.backgroundColor !== normal.backgroundColor,
  };
}

async function rootGeometry(locator, rootSlot) {
  return locator.evaluate((element, slot) => {
    const root = element.closest(`[data-slot="${slot}"]`);
    if (!root) return { found: false, noOverflow: false };
    for (const tagged of document.querySelectorAll(`[data-evaluator-${slot}]`))
      tagged.removeAttribute(`data-evaluator-${slot}`);
    for (const tagged of document.querySelectorAll(
      `[data-evaluator-${slot}-cell]`,
    )) {
      tagged.removeAttribute(`data-evaluator-${slot}-cell`);
    }
    root.setAttribute(`data-evaluator-${slot}`, "");
    element.setAttribute(`data-evaluator-${slot}-cell`, "");
    const rootRect = root.getBoundingClientRect();
    const cellRect = element.getBoundingClientRect();
    return {
      found: true,
      noOverflow:
        root.scrollWidth <= root.clientWidth + 1 &&
        cellRect.left >= rootRect.left - 1 &&
        cellRect.right <= rootRect.right + 1 &&
        document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  }, rootSlot);
}

async function screenshotRoot(page, locator, rootSlot) {
  let lastError;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await locator.waitFor({ state: "visible", timeout: 180000 });
      await rootGeometry(locator, rootSlot);
      return await page
        .locator(`[data-evaluator-${rootSlot}]`)
        .screenshot({ animations: "disabled" });
    } catch (error) {
      lastError = error;
      const transient =
        error instanceof Error &&
        (error.message.includes("Cannot find context with specified id") ||
          error.message.includes("Execution context was destroyed") ||
          error.message.includes("Element is not attached"));
      if (!transient || attempt === 4) throw error;
      await delay(1000);
    }
  }
  throw lastError;
}

async function setComponentTheme(locator, rootSlot, theme) {
  await locator.evaluate(
    (element, { slot, mode }) => {
      const root = element.closest(`[data-slot="${slot}"]`);
      root?.classList.toggle("dark", mode === "dark");
      root?.classList.toggle("light", mode === "light");
    },
    { slot: rootSlot, mode: theme },
  );
}

async function run() {
  const { project, evaluatorRuntime } = parseArguments(process.argv.slice(2));
  const runtimeRequire = createRequire(join(evaluatorRuntime, "package.json"));
  const { chromium } = runtimeRequire("playwright");
  const AxeBuilder = runtimeRequire("@axe-core/playwright").default;
  const server = await startNuxt(project);
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1100, height: 900 },
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    const bootRuntimeErrors = [];
    const interactionRuntimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      if (message.text() === "Hydration completed but contains mismatches.") {
        bootRuntimeErrors.push(message.text());
        return;
      }
      runtimeErrors.push(message.text());
    });

    await page.goto(`${server.origin}/docs/components/calendar`, {
      waitUntil: "domcontentloaded",
      timeout: 180000,
    });
    const calendarSelected = page
      .locator('[data-slot="calendar-cell-trigger"][data-selected]')
      .first();
    await calendarSelected.waitFor({ timeout: 180000 });
    await delay(15000);
    await calendarSelected.waitFor({ timeout: 180000 });
    bootRuntimeErrors.push(...runtimeErrors);
    runtimeErrors.length = 0;
    const calendarUnselected = page
      .locator(
        '[data-slot="calendar-cell-trigger"]:not([data-selected]):not([data-disabled]):not([data-unavailable]):not([data-outside-view]):not([data-today])',
      )
      .first();
    await calendarUnselected.waitFor({ timeout: 180000 });

    const calendarStates = [];
    let accessibilityViolations = 0;
    let screenshotsCaptured = true;
    for (const theme of ["light", "dark"]) {
      await setComponentTheme(calendarSelected, "calendar", theme);
      const selected = await inspectSelected(page, calendarSelected);
      const unselected = await inspectUnselectedStates(
        page,
        calendarUnselected,
      );
      const geometry = await rootGeometry(calendarSelected, "calendar");
      const screenshot = await screenshotRoot(
        page,
        calendarSelected,
        "calendar",
      );
      screenshotsCaptured = screenshotsCaptured && screenshot.length > 1000;
      const axe = await analyzeAxe(
        page,
        AxeBuilder,
        "[data-evaluator-calendar-cell]",
        async () => {
          await calendarSelected.waitFor({ timeout: 180000 });
          await rootGeometry(calendarSelected, "calendar");
        },
      );
      accessibilityViolations += axe.violations.length;
      calendarStates.push({
        theme,
        selected,
        unselected,
        geometry,
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
      });
    }
    interactionRuntimeErrors.push(...runtimeErrors);
    runtimeErrors.length = 0;

    await page.goto(`${server.origin}/docs/components/range-calendar`, {
      waitUntil: "domcontentloaded",
      timeout: 180000,
    });
    const rangeStart = page
      .locator('[data-slot="range-calendar-trigger"][data-selection-start]')
      .first();
    const rangeEnd = page
      .locator('[data-slot="range-calendar-trigger"][data-selection-end]')
      .first();
    await rangeStart.waitFor({ timeout: 180000 });
    await rangeEnd.waitFor({ timeout: 180000 });
    await delay(15000);
    await rangeStart.waitFor({ timeout: 180000 });
    await rangeEnd.waitFor({ timeout: 180000 });
    bootRuntimeErrors.push(...runtimeErrors);
    runtimeErrors.length = 0;
    const rangeStates = [];
    for (const theme of ["light", "dark"]) {
      await setComponentTheme(rangeStart, "range-calendar", theme);
      const start = await inspectSelected(page, rangeStart);
      const end = await inspectSelected(page, rangeEnd);
      const geometry = await rootGeometry(rangeStart, "range-calendar");
      await rangeEnd.evaluate((element) =>
        element.setAttribute("data-evaluator-range-calendar-cell", ""),
      );
      const screenshot = await screenshotRoot(
        page,
        rangeStart,
        "range-calendar",
      );
      screenshotsCaptured = screenshotsCaptured && screenshot.length > 1000;
      const axe = await analyzeAxe(
        page,
        AxeBuilder,
        "[data-evaluator-range-calendar-cell]",
        async () => {
          await rangeStart.waitFor({ timeout: 180000 });
          await rootGeometry(rangeStart, "range-calendar");
          await rangeEnd.evaluate((element) =>
            element.setAttribute("data-evaluator-range-calendar-cell", ""),
          );
        },
      );
      accessibilityViolations += axe.violations.length;
      rangeStates.push({
        theme,
        start,
        end,
        geometry,
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
      });
    }
    interactionRuntimeErrors.push(...runtimeErrors);

    const checks = {
      authenticCalendarAndRangeCalendarRender:
        calendarStates.every((state) => state.geometry.found) &&
        rangeStates.every((state) => state.geometry.found),
      selectedCalendarHoverRetainsPrimaryColors: calendarStates.every(
        (state) => state.selected.hoverRetainsSelection,
      ),
      selectedCalendarFocusRetainsPrimaryColors: calendarStates.every(
        (state) => state.selected.focusRetainsSelection,
      ),
      selectedRangeStartHoverRetainsPrimaryColors: rangeStates.every(
        (state) => state.start.hoverRetainsSelection,
      ),
      selectedRangeEndHoverRetainsPrimaryColors: rangeStates.every(
        (state) => state.end.hoverRetainsSelection,
      ),
      rangeEndpointFocusRetainsPrimaryColors: rangeStates.every(
        (state) =>
          state.start.focusRetainsSelection && state.end.focusRetainsSelection,
      ),
      selectedCellsRemainKeyboardFocusable:
        calendarStates.every((state) => state.selected.keyboardFocusable) &&
        rangeStates.every(
          (state) =>
            state.start.keyboardFocusable && state.end.keyboardFocusable,
        ),
      keyboardFocusTreatmentIsVisible:
        calendarStates.every(
          (state) =>
            state.selected.focus.boxShadow !== state.selected.normal.boxShadow,
        ) &&
        rangeStates.every(
          (state) =>
            state.start.focus.boxShadow !== state.start.normal.boxShadow &&
            state.end.focus.boxShadow !== state.end.normal.boxShadow,
        ),
      unselectedHoverAndFocusRemainDistinct: calendarStates.every(
        (state) =>
          state.unselected.unselectedHoverRemainsDistinct &&
          state.unselected.unselectedFocusDoesNotBecomeSelected,
      ),
      disabledUnavailableTodayAndOutsideStatesRemain: calendarStates.every(
        (state) =>
          state.unselected.disabledTreatmentPreserved &&
          state.unselected.unavailableTreatmentPreserved &&
          state.unselected.todayTreatmentPreserved &&
          state.unselected.outsideTreatmentPreserved,
      ),
      lightAndDarkSelectedColorsRender:
        calendarStates.length === 2 &&
        calendarStates[0].selected.normal.backgroundColor !==
          calendarStates[1].selected.normal.backgroundColor,
      calendarsDoNotOverflow: [...calendarStates, ...rangeStates].every(
        (state) => state.geometry.noOverflow,
      ),
      fixedScreenshotsCaptured: screenshotsCaptured,
      noRuntimeErrors: interactionRuntimeErrors.length === 0,
      accessibilityScansPass: accessibilityViolations === 0,
    };
    return {
      passed: Object.values(checks).every(Boolean),
      metrics: {
        governanceViolations: 0,
        accessibilityViolations,
        visualScore: percentage(checks),
      },
      checks,
      evidence: {
        calendarStates,
        rangeStates,
        runtimeErrorCount: interactionRuntimeErrors.length,
        runtimeErrors: interactionRuntimeErrors.slice(0, 5),
        bootRuntimeErrors: bootRuntimeErrors.slice(0, 5),
      },
    };
  } finally {
    await context?.close();
    await browser?.close();
    await stopProcess(server.child);
  }
}

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
}
console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
