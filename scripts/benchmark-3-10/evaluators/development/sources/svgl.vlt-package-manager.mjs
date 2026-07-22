#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
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
    relation.startsWith(`..${sep}`) ||
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
    throw new Error("Unable to reserve a Vite port");
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

function captureProcess(child) {
  let output = "";
  const append = (chunk) => {
    output = `${output}${chunk.toString()}`.slice(-16_000);
  };
  child.stdout?.on("data", append);
  child.stderr?.on("data", append);
  return () => output;
}

async function waitForHttp(url, child, getOutput) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null)
      throw new Error(
        `Vite exited before becoming ready: ${getOutput().slice(-1200)}`,
      );
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server socket is not ready yet.
    }
    await delay(250);
  }
  throw new Error(`Vite did not become ready: ${getOutput().slice(-1200)}`);
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
  await Promise.race([once(child, "exit"), delay(5_000)]);
  if (child.exitCode === null) {
    signal("SIGKILL");
    await Promise.race([once(child, "exit"), delay(2_000)]);
  }
}

async function startApplication(project) {
  const viteCli = join(project, "node_modules", "vite", "bin", "vite.js");
  await access(viteCli);
  const port = await reservePort();
  const child = spawn(
    process.execPath,
    [viteCli, "dev", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: project,
      detached: process.platform !== "win32",
      env: { ...process.env, BROWSER: "none", CI: "1", NO_COLOR: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  const getOutput = captureProcess(child);
  const origin = `http://127.0.0.1:${port}`;
  await waitForHttp(`${origin}/?search=vlt`, child, getOutput);
  return { child, getOutput, origin };
}

function percentage(checks) {
  const values = Object.values(checks);
  return values.length === 0
    ? 0
    : Math.round((values.filter(Boolean).length / values.length) * 100);
}

async function inspectVisibleImage(card) {
  const image = card.locator('img[alt="vlt"]:visible').first();
  await image.waitFor({ state: "visible" });
  return image.evaluate((element) => ({
    source: new URL(element.currentSrc || element.src).pathname,
    complete: element.complete,
    naturalWidth: element.naturalWidth,
    naturalHeight: element.naturalHeight,
  }));
}

async function openSettings(page) {
  await page.getByTitle("Settings").click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("heading", { name: "Settings", exact: true })
    .waitFor();
  const packageSection = dialog
    .getByRole("heading", { name: "Package Manager", exact: true })
    .locator("..");
  const trigger = packageSection.locator("button").first();
  await trigger.waitFor();
  return { dialog, trigger };
}

async function run() {
  const { project, evaluatorRuntime } = parseArguments(process.argv.slice(2));
  await access(join(evaluatorRuntime, "package.json"));
  const runtimeRequire = createRequire(join(evaluatorRuntime, "package.json"));
  const { chromium } = runtimeRequire("playwright");
  const AxeBuilder = runtimeRequire("@axe-core/playwright").default;
  const server = await startApplication(project);
  let browser;
  let context;
  try {
    browser = await chromium.launch({ headless: true });
    context = await browser.newContext({
      viewport: { width: 1200, height: 900 },
      colorScheme: "light",
    });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (value) => {
            globalThis.__evaluatorClipboard = String(value);
          },
          readText: async () => globalThis.__evaluatorClipboard ?? "",
        },
      });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const runtimeErrors = [];
    const externalAssetRequests = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });
    await page.route("**/*", async (route) => {
      const requestUrl = new URL(route.request().url());
      if (requestUrl.origin === server.origin) {
        await route.continue();
        return;
      }
      if (
        ["image", "stylesheet", "font"].includes(route.request().resourceType())
      ) {
        externalAssetRequests.push(request.url());
        await route.abort();
        return;
      }
      if (route.request().resourceType() === "script") {
        await route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: "",
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: '{"repo":{"stars":0}}',
      });
    });

    await page.goto(`${server.origin}/?search=vlt`, {
      waitUntil: "networkidle",
      timeout: 120_000,
    });
    const title = page
      .getByText("vlt", { exact: true })
      .filter({ visible: true })
      .first();
    const vltFound = (await title.count()) === 1;
    const checks = {
      vltIsSearchableSoftwareEntry: false,
      allFourThemedAssetsRender: false,
      vltPackageManagerCanBeSelected: false,
      packageManagerSelectionPersists: false,
      copiedCommandUsesRunnableVltSyntax: false,
      vltManagerIconRenders: false,
      focusedCardScreenshotIsNonblank: false,
      noExternalLogoAssetsRequested: false,
      scopedAccessibilityScanPasses: false,
      browserConsoleClean: false,
    };
    const evidenceErrors = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        evidenceErrors.push(
          `${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    if (vltFound) {
      const card = title.locator("../..");
      await card.evaluate((element) =>
        element.setAttribute("data-evaluator-vlt-card", ""),
      );
      await check("vltIsSearchableSoftwareEntry", async () => {
        const category = card.getByRole("link", {
          name: "Software",
          exact: true,
        });
        const website = card.getByTitle("Website");
        return (
          new URL(page.url()).searchParams.get("search") === "vlt" &&
          (await category.count()) === 1 &&
          (await website.getAttribute("href")) === "https://www.vlt.sh"
        );
      });

      await check("allFourThemedAssetsRender", async () => {
        const rendered = [];
        rendered.push(await inspectVisibleImage(card));
        await page.getByTitle("Mode Toggle (Cmd + l)").click();
        await delay(250);
        rendered.push(await inspectVisibleImage(card));
        await card.getByTitle("Show wordmark SVG").click();
        await delay(250);
        rendered.push(await inspectVisibleImage(card));
        await page.getByTitle("Mode Toggle (Cmd + l)").click();
        await delay(250);
        rendered.push(await inspectVisibleImage(card));
        const expectedPaths = new Set([
          "/library/vlt-light.svg",
          "/library/vlt-dark.svg",
          "/library/vlt-wordmark-light.svg",
          "/library/vlt-wordmark-dark.svg",
        ]);
        return (
          rendered.every(
            (image) =>
              image.complete &&
              image.naturalWidth > 0 &&
              image.naturalHeight > 0,
          ) &&
          rendered.every((image) => expectedPaths.has(image.source)) &&
          new Set(rendered.map((image) => image.source)).size === 4
        );
      });

      await check("vltPackageManagerCanBeSelected", async () => {
        const { dialog, trigger } = await openSettings(page);
        await trigger.click();
        let option = page.getByRole("option", { name: "vlt", exact: true });
        if ((await option.count()) === 0)
          option = page
            .getByText("vlt", { exact: true })
            .filter({ visible: true })
            .last();
        await option.waitFor({ state: "visible" });
        const iconBox = await option.locator("svg").first().boundingBox();
        checks.vltManagerIconRenders = Boolean(
          iconBox && iconBox.width > 0 && iconBox.height > 0,
        );
        await option.click();
        const selected = (await trigger.innerText()).trim() === "vlt";
        await dialog.getByRole("button", { name: "Save", exact: true }).click();
        return selected;
      });

      await check("packageManagerSelectionPersists", async () => {
        await page.reload({ waitUntil: "networkidle", timeout: 120_000 });
        const { dialog, trigger } = await openSettings(page);
        const stored = await page.evaluate(() =>
          JSON.parse(localStorage.getItem("svgl_settings") ?? "{}"),
        );
        const persisted =
          (await trigger.innerText()).trim() === "vlt" &&
          stored.packageManager === "vlt";
        await dialog.getByRole("button", { name: "Save", exact: true }).click();
        return persisted;
      });

      await check("copiedCommandUsesRunnableVltSyntax", async () => {
        const currentTitle = page
          .getByText("vlt", { exact: true })
          .filter({ visible: true })
          .first();
        const currentCard = currentTitle.locator("../..");
        await currentCard
          .getByTitle(
            "Copy SVG element as svg file, React TSX code, or React JSX code",
          )
          .click();
        await page.getByTitle("shadcn/ui").click();
        const code = page
          .locator("code")
          .filter({ hasText: "vlx" })
          .filter({ visible: true })
          .first();
        await code.waitFor({ state: "visible" });
        const renderedCommand = (await code.innerText()).trim();
        await code.locator("..").getByTitle("Copy code").click();
        await page.waitForFunction(
          () => typeof globalThis.__evaluatorClipboard === "string",
        );
        const clipboardCommand = await page.evaluate(
          () => globalThis.__evaluatorClipboard,
        );
        return (
          renderedCommand === "vlx shadcn@latest add @svgl/vlt" &&
          clipboardCommand === renderedCommand
        );
      });

      await check("focusedCardScreenshotIsNonblank", async () => {
        const currentTitle = page
          .getByText("vlt", { exact: true })
          .filter({ visible: true })
          .first();
        const screenshot = await currentTitle
          .locator("../..")
          .screenshot({ animations: "disabled" });
        return screenshot.length > 1_000;
      });
      await check("scopedAccessibilityScanPasses", async () => {
        const currentTitle = page
          .getByText("vlt", { exact: true })
          .filter({ visible: true })
          .first();
        const currentCard = currentTitle.locator("../..");
        await currentCard.evaluate((element) =>
          element.setAttribute("data-evaluator-vlt-card", ""),
        );
        const report = await new AxeBuilder({ page })
          .include("[data-evaluator-vlt-card]")
          .withTags(["wcag2a", "wcag2aa"])
          .analyze();
        return report.violations.length === 0;
      });
    }

    checks.noExternalLogoAssetsRequested = externalAssetRequests.length === 0;
    checks.browserConsoleClean = runtimeErrors.length === 0;
    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: checks.scopedAccessibilityScanPasses ? 0 : 1,
        visualScore: percentage(checks),
      },
      checks,
      failures,
      evidence: {
        evidenceErrors,
        externalAssetRequests,
        runtimeErrors: runtimeErrors.slice(0, 8),
        serverOutput: server.getOutput().slice(-2_000),
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
    failures: ["evaluator-runtime"],
    evidence: {
      error:
        error instanceof Error
          ? error.message.slice(0, 1_000)
          : String(error).slice(0, 1_000),
    },
  };
}
console.log(JSON.stringify(result));
if (!result.passed) process.exitCode = 1;
