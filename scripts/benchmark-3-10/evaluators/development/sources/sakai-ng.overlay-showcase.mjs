#!/usr/bin/env node
import { spawn } from "node:child_process";
import { once } from "node:events";
import { access } from "node:fs/promises";
import { createRequire } from "node:module";
import { createServer } from "node:net";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { inflateSync } from "node:zlib";

const EMPTY_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+Avk9AAAAAElFTkSuQmCC",
  "base64",
);
const POSITIVE_ACTION = /^(accept|confirm|continue|ok|proceed|save|yes)$/iu;
const NEGATIVE_ACTION = /^(back|cancel|dismiss|no|reject)$/iu;

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const option = argv[index];
    const value = argv[++index];
    if (!value) throw new Error(`Missing value for ${option}`);
    if (option === "--workspace") options.workspace = resolve(value);
    else if (option === "--project-path") options.projectPath = value;
    else if (option === "--evaluator-runtime")
      options.evaluatorRuntime = resolve(value);
    else throw new Error(`Unknown option: ${option}`);
  }
  if (
    !options.workspace ||
    options.projectPath === undefined ||
    !options.evaluatorRuntime
  ) {
    throw new Error(
      "Expected --workspace, --project-path, and --evaluator-runtime",
    );
  }
  return options;
}

function resolveProject(workspace, projectPath) {
  const project = resolve(workspace, projectPath);
  const relation = relative(workspace, project);
  if (
    relation === ".." ||
    relation.startsWith(`..${sep}`) ||
    isAbsolute(relation)
  ) {
    throw new Error("Project path escapes the workspace");
  }
  return project;
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Could not reserve an Angular port");
  await new Promise((resolveClose, reject) =>
    server.close((error) => (error ? reject(error) : resolveClose())),
  );
  return address.port;
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `Angular server exited with ${child.exitCode ?? child.signalCode}`,
      );
    }
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) return;
    } catch {
      // Angular is still compiling.
    }
    await delay(250);
  }
  throw new Error("Timed out waiting for Angular");
}

function signalProcessGroup(child, signal) {
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return;
    } catch {
      // Fall back to the direct child when process groups are unavailable.
    }
  }
  if (child.exitCode === null && child.signalCode === null) child.kill(signal);
}

async function stopProcess(child) {
  const running = child.exitCode === null && child.signalCode === null;
  const terminated = running ? once(child, "exit") : Promise.resolve();
  signalProcessGroup(child, "SIGTERM");
  await Promise.race([terminated, delay(5_000)]);
  if (process.platform !== "win32" && child.pid) {
    try {
      process.kill(-child.pid, 0);
      process.kill(-child.pid, "SIGKILL");
    } catch {
      // The complete process group has exited.
    }
  } else if (child.exitCode === null && child.signalCode === null) {
    child.kill("SIGKILL");
  }
}

function cardByTitle(page, title) {
  return page
    .locator(".card", { has: page.getByText(title, { exact: true }) })
    .first();
}

function isSorted(values, direction, compare) {
  if (values.length < 3 || new Set(values).size < 2) return false;
  for (let index = 1; index < values.length; index += 1) {
    const order = compare(values[index - 1], values[index]);
    if (
      (direction === "ascending" && order > 0) ||
      (direction === "descending" && order < 0)
    )
      return false;
  }
  return true;
}

function paeth(left, above, upperLeft) {
  const estimate = left + above - upperLeft;
  const leftDistance = Math.abs(estimate - left);
  const aboveDistance = Math.abs(estimate - above);
  const upperLeftDistance = Math.abs(estimate - upperLeft);
  if (leftDistance <= aboveDistance && leftDistance <= upperLeftDistance)
    return left;
  return aboveDistance <= upperLeftDistance ? above : upperLeft;
}

function inspectPng(buffer) {
  if (
    !buffer
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  ) {
    throw new Error("Screenshot is not a PNG");
  }
  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const compressed = [];
  while (offset + 12 <= buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      compressed.push(data);
    }
    offset += length + 12;
    if (type === "IEND") break;
  }

  const channelsByType = new Map([
    [0, 1],
    [2, 3],
    [4, 2],
    [6, 4],
  ]);
  const channels = channelsByType.get(colorType);
  if (!width || !height || bitDepth !== 8 || interlace !== 0 || !channels) {
    throw new Error(
      `Unsupported PNG format: ${width}x${height}, depth ${bitDepth}, type ${colorType}`,
    );
  }
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(compressed));
  const pixels = Buffer.alloc(stride * height);
  let inputOffset = 0;
  for (let row = 0; row < height; row += 1) {
    const filter = raw[inputOffset++];
    const rowOffset = row * stride;
    for (let column = 0; column < stride; column += 1) {
      const source = raw[inputOffset++];
      const left =
        column >= channels ? pixels[rowOffset + column - channels] : 0;
      const above = row > 0 ? pixels[rowOffset - stride + column] : 0;
      const upperLeft =
        row > 0 && column >= channels
          ? pixels[rowOffset - stride + column - channels]
          : 0;
      let value;
      if (filter === 0) value = source;
      else if (filter === 1) value = source + left;
      else if (filter === 2) value = source + above;
      else if (filter === 3) value = source + Math.floor((left + above) / 2);
      else if (filter === 4) value = source + paeth(left, above, upperLeft);
      else throw new Error(`Unsupported PNG filter ${filter}`);
      pixels[rowOffset + column] = value & 0xff;
    }
  }

  const colors = new Set();
  let sampled = 0;
  let nonWhite = 0;
  const pixelCount = width * height;
  const sampleStep = Math.max(1, Math.floor(pixelCount / 100_000));
  for (let pixel = 0; pixel < pixelCount; pixel += sampleStep) {
    const index = pixel * channels;
    const red = pixels[index];
    const green = colorType === 0 || colorType === 4 ? red : pixels[index + 1];
    const blue = colorType === 0 || colorType === 4 ? red : pixels[index + 2];
    colors.add(`${red >> 4}:${green >> 4}:${blue >> 4}`);
    if (red < 245 || green < 245 || blue < 245) nonWhite += 1;
    sampled += 1;
  }
  return {
    width,
    height,
    byteLength: buffer.length,
    sampledColors: colors.size,
    nonWhiteRatio: sampled ? nonWhite / sampled : 0,
  };
}

async function evaluate() {
  const options = parseArgs(process.argv.slice(2));
  const project = resolveProject(options.workspace, options.projectPath);
  await access(join(project, "node_modules", ".bin", "ng"));
  await access(join(options.evaluatorRuntime, "package.json"));
  const runtimeRequire = createRequire(
    join(options.evaluatorRuntime, "package.json"),
  );
  const { chromium } = runtimeRequire("playwright");
  const port = await reservePort();
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn(
    "npm",
    ["start", "--", "--host", "127.0.0.1", "--port", String(port)],
    {
      cwd: project,
      detached: process.platform !== "win32",
      env: { ...process.env, CI: "true", NO_COLOR: "1" },
      stdio: ["ignore", "ignore", "ignore"],
    },
  );

  let browser;
  try {
    await waitForServer(origin, server);
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const externalProductRequests = [];
    const externalApiRequests = [];
    const localProductResponses = [];
    const runtimeErrors = [];

    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin) {
        await route.continue();
        return;
      }
      if (/\/images\/demo\/product\//iu.test(url.pathname))
        externalProductRequests.push(request.url());
      if (
        request.resourceType() === "xhr" ||
        request.resourceType() === "fetch"
      ) {
        externalApiRequests.push(request.url());
      }
      if (request.resourceType() === "stylesheet") {
        await route.fulfill({ status: 200, contentType: "text/css", body: "" });
      } else if (request.resourceType() === "image") {
        await route.fulfill({
          status: 200,
          contentType: "image/png",
          body: EMPTY_PNG,
        });
      } else {
        await route.fulfill({ status: 204, body: "" });
      }
    });

    const page = await context.newPage();
    page.setDefaultTimeout(7_000);
    page.on("response", (response) => {
      const url = new URL(response.url());
      if (
        url.origin === origin &&
        url.pathname.startsWith("/demo/images/product/")
      ) {
        localProductResponses.push({
          path: url.pathname,
          status: response.status(),
          contentType: response.headers()["content-type"] ?? "",
        });
      }
    });
    page.on("pageerror", (error) =>
      runtimeErrors.push(`page: ${error.message}`),
    );
    page.on("console", (message) => {
      if (message.type() === "error")
        runtimeErrors.push(`console: ${message.text()}`);
    });

    const checks = {};
    const evidenceErrors = [];
    const check = async (id, operation) => {
      try {
        checks[id] = Boolean(await operation());
      } catch (error) {
        checks[id] = false;
        evidenceErrors.push(
          `${id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    };

    await page.goto(`${origin}/uikit/overlay`, {
      waitUntil: "domcontentloaded",
    });
    const popoverCard = cardByTitle(page, "Popover");
    await popoverCard.waitFor({ state: "visible", timeout: 20_000 });
    await check("overlay-route-renders-real-components", async () => {
      const cards = await page.locator(".card").count();
      const box = await popoverCard.boundingBox();
      return (
        new URL(page.url()).pathname === "/uikit/overlay" &&
        cards >= 6 &&
        Boolean(box && box.width > 250 && box.height > 80)
      );
    });

    const popover = page.locator(".p-popover:visible").first();
    await check("popover-opens-with-runtime-product-table", async () => {
      await popoverCard.getByRole("button", { name: /show/iu }).click();
      await popover.waitFor({ state: "visible" });
      await popover.locator("tbody tr").first().waitFor({ state: "visible" });
      return (
        (await popover.locator("tbody tr").count()) >= 3 &&
        (await popover.getByRole("columnheader").count()) >= 3
      );
    });

    let imageRows = [];
    await check("product-images-are-local-decodable-and-labelled", async () => {
      await page.waitForFunction(() => {
        const visible = [...document.querySelectorAll(".p-popover img")].filter(
          (image) => image.getClientRects().length > 0,
        );
        return visible.length >= 3 && visible.every((image) => image.complete);
      });
      imageRows = await popover.locator("tbody tr").evaluateAll((rows) =>
        rows.map((row) => {
          const image = row.querySelector("img");
          const cells = row.querySelectorAll("td");
          return {
            name: cells[0]?.textContent?.trim() ?? "",
            source: image?.src ?? "",
            alt: image?.getAttribute("alt")?.trim() ?? "",
            complete: image?.complete ?? false,
            naturalWidth: image?.naturalWidth ?? 0,
            naturalHeight: image?.naturalHeight ?? 0,
          };
        }),
      );
      const localResponsesByPath = new Map(
        localProductResponses.map((response) => [response.path, response]),
      );
      return (
        imageRows.length >= 3 &&
        imageRows.every((row) => {
          const url = new URL(row.source);
          const response = localResponsesByPath.get(url.pathname);
          return (
            url.origin === origin &&
            url.pathname.startsWith("/demo/images/product/") &&
            row.alt === row.name &&
            row.complete &&
            row.naturalWidth > 1 &&
            row.naturalHeight > 1 &&
            response?.status === 200 &&
            /^image\//iu.test(response.contentType)
          );
        })
      );
    });

    const table = popover.locator("table").first();
    const nameHeader = table.getByRole("columnheader", { name: /name/iu });
    const priceHeader = table.getByRole("columnheader", { name: /price/iu });
    const columnValues = async (column, convert) =>
      table
        .locator("tbody tr")
        .evaluateAll(
          (rows, index) =>
            rows.map(
              (row) =>
                row.querySelectorAll("td")[index]?.textContent?.trim() ?? "",
            ),
          column,
        )
        .then((values) => values.map(convert));

    await check("name-column-sorts-live-rows-in-both-directions", async () => {
      await nameHeader.click();
      await delay(200);
      const ascending = await columnValues(0, (value) => value);
      await nameHeader.click();
      await delay(200);
      const descending = await columnValues(0, (value) => value);
      const compare = (left, right) =>
        left.localeCompare(right, "en", { sensitivity: "base" });
      return (
        isSorted(ascending, "ascending", compare) &&
        isSorted(descending, "descending", compare)
      );
    });
    await check("price-column-sorts-live-rows-in-both-directions", async () => {
      await priceHeader.click();
      await delay(200);
      const ascending = await columnValues(2, (value) =>
        Number(value.replace(/[^0-9.-]/gu, "")),
      );
      await priceHeader.click();
      await delay(200);
      const descending = await columnValues(2, (value) =>
        Number(value.replace(/[^0-9.-]/gu, "")),
      );
      const compare = (left, right) => left - right;
      return (
        ascending.every(Number.isFinite) &&
        descending.every(Number.isFinite) &&
        isSorted(ascending, "ascending", compare) &&
        isSorted(descending, "descending", compare)
      );
    });

    const confirmCard = cardByTitle(page, "ConfirmPopup");
    const confirmTrigger = confirmCard.getByRole("button", {
      name: /confirm/iu,
    });
    const confirmation = page
      .locator('.p-confirmpopup:visible, [role="alertdialog"]:visible')
      .first();
    let positiveName;
    let negativeName;
    await check("confirmation-opens-with-clear-opposing-actions", async () => {
      await confirmTrigger.click();
      await confirmation.waitFor({ state: "visible" });
      const names = await confirmation.getByRole("button").allInnerTexts();
      positiveName = names
        .map((name) => name.trim())
        .find((name) => POSITIVE_ACTION.test(name));
      negativeName = names
        .map((name) => name.trim())
        .find((name) => NEGATIVE_ACTION.test(name));
      return Boolean(
        positiveName &&
        negativeName &&
        positiveName !== negativeName &&
        (await confirmation.getAttribute("role")) === "alertdialog",
      );
    });

    await check("accept-action-produces-user-visible-feedback", async () => {
      if (!positiveName || !(await confirmation.isVisible()))
        throw new Error("No visible positive confirmation action");
      await confirmation
        .getByRole("button", { name: positiveName, exact: true })
        .click();
      const feedback = page
        .locator(".p-toast-message:visible")
        .filter({ hasText: /accept|confirm|proceed|saved|success/iu })
        .first();
      await feedback.waitFor({ state: "visible" });
      return true;
    });
    await check("reject-action-produces-user-visible-feedback", async () => {
      await confirmTrigger.click();
      await confirmation.waitFor({ state: "visible" });
      const names = await confirmation.getByRole("button").allInnerTexts();
      const rejectName = names
        .map((name) => name.trim())
        .find((name) => NEGATIVE_ACTION.test(name));
      if (!rejectName)
        throw new Error("No visible negative confirmation action");
      await confirmation
        .getByRole("button", { name: rejectName, exact: true })
        .click();
      const feedback = page
        .locator(".p-toast-message:visible")
        .filter({ hasText: /reject|cancel|declin|dismiss|not proceed/iu })
        .first();
      await feedback.waitFor({ state: "visible" });
      return true;
    });

    await check("neighboring-dialog-still-opens-and-closes", async () => {
      const dialogCard = cardByTitle(page, "Dialog");
      await dialogCard.getByRole("button", { name: /show/iu }).click();
      const dialog = page.locator(".p-dialog:visible").first();
      await dialog.waitFor({ state: "visible" });
      const hasContent = /lorem ipsum/iu.test(await dialog.innerText());
      await page.keyboard.press("Escape");
      await dialog.waitFor({ state: "hidden" });
      return hasContent;
    });

    let screenshotEvidence = null;
    await check(
      "focused-popover-screenshot-has-real-pixel-content",
      async () => {
        if (!(await popover.isVisible())) {
          await popoverCard.getByRole("button", { name: /show/iu }).click();
          await popover.waitFor({ state: "visible" });
        }
        const screenshot = await popover.screenshot({ animations: "disabled" });
        screenshotEvidence = inspectPng(screenshot);
        return (
          screenshotEvidence.width > 250 &&
          screenshotEvidence.height > 150 &&
          screenshotEvidence.byteLength > 5_000 &&
          screenshotEvidence.sampledColors >= 10 &&
          screenshotEvidence.nonWhiteRatio > 0.02
        );
      },
    );

    checks.productImagesNeverRequestExternalCdn =
      externalProductRequests.length === 0;
    checks.noExternalApiRequests = externalApiRequests.length === 0;
    const sortableHeadersAccessible =
      (await nameHeader.getAttribute("tabindex")) === "0" &&
      (await priceHeader.getAttribute("tabindex")) === "0" &&
      Boolean((await nameHeader.innerText()).trim()) &&
      Boolean((await priceHeader.innerText()).trim());
    checks.overlayControlsRemainAccessible =
      sortableHeadersAccessible &&
      imageRows.length >= 3 &&
      imageRows.every((row) => row.alt === row.name && row.alt.length > 0) &&
      Boolean(positiveName && negativeName) &&
      Boolean(
        (
          await popoverCard.getByRole("button", { name: /show/iu }).innerText()
        ).trim(),
      );
    await delay(300);
    checks.browserConsoleClean = runtimeErrors.length === 0;

    const failures = Object.entries(checks)
      .filter(([, passed]) => !passed)
      .map(([id]) => id);
    return {
      passed: failures.length === 0,
      metrics: {
        governanceViolations: 0,
        accessibilityViolations: checks.overlayControlsRemainAccessible ? 0 : 1,
        behaviorChecksPassed: Object.keys(checks).length - failures.length,
        behaviorChecksTotal: Object.keys(checks).length,
      },
      checks: Object.entries(checks).map(([id, passed]) => ({ id, passed })),
      failures,
      evidenceErrors,
      runtimeErrors,
      evidence: {
        externalProductRequests,
        externalApiRequests,
        localProductResponses,
        screenshot: screenshotEvidence,
      },
    };
  } finally {
    await browser?.close().catch(() => {});
    await stopProcess(server);
  }
}

try {
  const result = await evaluate();
  console.log(JSON.stringify(result));
  if (!result.passed) process.exitCode = 1;
} catch (error) {
  console.log(
    JSON.stringify({
      passed: false,
      metrics: { governanceViolations: 0, accessibilityViolations: 1 },
      checks: [{ id: "evaluator-runtime", passed: false }],
      failures: [error instanceof Error ? error.message : String(error)],
    }),
  );
  process.exitCode = 1;
}
