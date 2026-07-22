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
  return {
    workspace,
    project,
    evaluatorRuntime: resolve(values["--evaluator-runtime"]),
  };
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
  return { child, getOutput, origin };
}

function percentage(checks) {
  const values = Object.values(checks);
  return values.length === 0
    ? 0
    : Math.round((values.filter(Boolean).length / values.length) * 100);
}

async function installInlineFixture(description) {
  await description.evaluate((element) => {
    const prefix = document.createTextNode("Review the updated policy ");
    const link = document.createElement("a");
    link.href = "#policy-details";
    link.textContent = "in the details";
    const suffix = document.createTextNode(" before continuing.");
    element.replaceChildren(prefix, link, suffix);
    element.style.width = "420px";
    element.style.maxWidth = "calc(100vw - 96px)";
    element
      .closest('[data-slot="alert"]')
      ?.setAttribute("data-evaluator-alert", "");
  });
}

async function measureInline(description) {
  return description.evaluate((element) => {
    const rectsFor = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const range = document.createRange();
        range.selectNodeContents(node);
        return [...range.getClientRects()].filter(
          (box) => box.width > 0 && box.height > 0,
        );
      }
      return node instanceof Element ? [node.getBoundingClientRect()] : [];
    };
    const childRects = [...element.childNodes].map(rectsFor);
    const allRects = childRects.flat();
    const tops = allRects.map((box) => Math.round(box.top));
    const style = getComputedStyle(element);
    const root = element.closest('[data-slot="alert"]');
    const rootRect = root?.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    return {
      display: style.display,
      fontSize: Number.parseFloat(style.fontSize),
      color: style.color,
      fragmentCount: childRects.length,
      everyFragmentHasLayout: childRects.every((boxes) => boxes.length > 0),
      lineCount: new Set(tops).size,
      fragmentsShareLine:
        tops.length > 0 && Math.max(...tops) - Math.min(...tops) <= 1,
      withinAlert:
        Boolean(rootRect) &&
        elementRect.left >= rootRect.left - 1 &&
        elementRect.right <= rootRect.right + 1 &&
        root.scrollWidth <= root.clientWidth + 1,
      roleIsAlert: root?.getAttribute("role") === "alert",
      documentHasNoHorizontalOverflow:
        document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });
}

async function installParagraphFixture(description) {
  await description.evaluate((element) => {
    const first = document.createElement("p");
    first.textContent = "First block-level paragraph remains on its own line.";
    const second = document.createElement("p");
    second.textContent = "Second block-level paragraph follows below it.";
    element.replaceChildren(first, second);
  });
}

async function measureParagraphs(description) {
  return description.evaluate((element) => {
    const paragraphs = [...element.querySelectorAll(":scope > p")];
    const boxes = paragraphs.map((paragraph) =>
      paragraph.getBoundingClientRect(),
    );
    const styles = paragraphs.map((paragraph) => getComputedStyle(paragraph));
    return {
      paragraphCount: paragraphs.length,
      everyParagraphIsBlock: styles.every((style) => style.display === "block"),
      paragraphsStack:
        boxes.length === 2 &&
        boxes[1].top >= boxes[0].bottom - 1 &&
        Math.abs(boxes[0].left - boxes[1].left) <= 1,
      relaxedLeading: styles.every(
        (style) =>
          Number.parseFloat(style.lineHeight) >
          Number.parseFloat(style.fontSize),
      ),
      withinDescription: element.scrollWidth <= element.clientWidth + 1,
    };
  });
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
      viewport: { width: 900, height: 900 },
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    await page.goto(`${server.origin}/docs/components/alert`, {
      waitUntil: "domcontentloaded",
      timeout: 180000,
    });
    const description = page.locator('[data-slot="alert-description"]').first();
    await description.waitFor({ timeout: 180000 });

    const states = [];
    let accessibilityViolations = 0;
    let screenshotsCaptured = true;
    let linkFocusLands = true;
    for (const theme of ["light", "dark"]) {
      await page.evaluate((mode) => {
        document.documentElement.classList.toggle("dark", mode === "dark");
        document.documentElement.style.colorScheme = mode;
      }, theme);
      await installInlineFixture(description);
      const inline = await measureInline(description);
      const link = description.locator("a");
      await link.focus();
      linkFocusLands =
        linkFocusLands &&
        (await link.evaluate((element) => document.activeElement === element));
      const screenshot = await page
        .locator("[data-evaluator-alert]")
        .screenshot({ animations: "disabled" });
      screenshotsCaptured = screenshotsCaptured && screenshot.length > 1000;
      const axe = await new AxeBuilder({ page })
        .include("[data-evaluator-alert]")
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      accessibilityViolations += axe.violations.length;
      await installParagraphFixture(description);
      const paragraphs = await measureParagraphs(description);
      states.push({
        theme,
        inline,
        paragraphs,
        accessibilityRuleIds: axe.violations.map((violation) => violation.id),
      });
    }

    const checks = {
      authenticAlertDescriptionRendered: states.every(
        (state) => state.inline.fragmentCount === 3,
      ),
      inlineFragmentsUseOneNormalFlowLine: states.every(
        (state) =>
          !["flex", "grid", "inline-flex", "inline-grid", "table"].includes(
            state.inline.display,
          ) &&
          state.inline.everyFragmentHasLayout &&
          state.inline.lineCount === 1 &&
          state.inline.fragmentsShareLine,
      ),
      blockParagraphsRemainStacked: states.every(
        (state) =>
          state.paragraphs.paragraphCount === 2 &&
          state.paragraphs.everyParagraphIsBlock &&
          state.paragraphs.paragraphsStack,
      ),
      typographyAndRelaxedParagraphLeadingRemain: states.every(
        (state) =>
          state.inline.fontSize > 0 &&
          state.inline.color !== "rgba(0, 0, 0, 0)" &&
          state.paragraphs.relaxedLeading,
      ),
      lightAndDarkColorsRender:
        states.length === 2 &&
        states[0].inline.color !== states[1].inline.color,
      contentDoesNotOverflowAlertOrViewport: states.every(
        (state) =>
          state.inline.withinAlert &&
          state.inline.documentHasNoHorizontalOverflow &&
          state.paragraphs.withinDescription,
      ),
      alertSemanticsPreserved: states.every(
        (state) => state.inline.roleIsAlert,
      ),
      inlineLinkIsKeyboardFocusable: linkFocusLands,
      fixedScreenshotsCaptured: screenshotsCaptured,
      noRuntimeErrors: runtimeErrors.length === 0,
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
        states,
        runtimeErrorCount: runtimeErrors.length,
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
