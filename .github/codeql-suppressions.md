# CodeQL Suppression Log

Documents every intentional CodeQL alert suppression with rationale.
Each entry links to the commit that dismissed the alert.

## Suppressions

<!-- Add entries as alerts are triaged. Format:

## js/rule-id — file/path.js

**Dismissed:** YYYY-MM-DD
**Reason:** [why this alert is intentional / false positive]
**Commit:** [commit hash]

-->

## js/insecure-temporary-file — tools/compiler/index.js

**Dismissed:** 2026-03-25
**Reason:** False positive. This file does not use temp files. It writes build outputs directly to the final `outDir` using `join(outDir, output.file)`. The flagged `join` + fixed-string path construction produces the permanent build artifact path (`dist/main.[hash].js`), not a temporary file. No `os.tmpdir()`, `mkdtemp`, or `/tmp/` usage exists in this file.

---

## js/insecure-temporary-file — tools/compile-age.js

**Dismissed:** 2026-03-25
**Reason:** False positive. This file does not use temp files. It writes the migration profile to `join(cwd, 'llm', 'task-age.md')` — a deterministic, permanent project output file tracked in source control. The `join` call produces a well-defined project path, not a temp path. No `os.tmpdir()`, `mkdtemp`, or `/tmp/` usage exists in this file.

---

## js/insecure-temporary-file — tools/registry-manifest.js

**Dismissed:** 2026-03-25
**Reason:** False positive. This file does not use temp files. It reads/writes `decantr.registry.json` at `join(cwd, MANIFEST_FILE)` — the project's registry manifest, a permanent tracked file. The `join` call produces a fixed project-root path. No `os.tmpdir()`, `mkdtemp`, or `/tmp/` usage exists in this file.

---

## js/file-access-to-http — test/e2e-scaffold/runner.js:316

**Dismissed:** 2026-03-25
**Reason:** Test-only code. `runDirectAPI()` reads the project directory via `buildSystemPrompt(projectDir)` and sends that content as the `system` field of an HTTP POST to the Anthropic API (`https://api.anthropic.com/v1/messages`). This is the intentional behavior of the e2e scaffold's fallback API runner — constructing the LLM system prompt from local files and sending it to the AI API. The URL is hardcoded to the Anthropic endpoint (HTTPS), not user-controlled. This code path only executes in the test environment.

---

## js/http-to-file-access — src/registry/content-registry.js:77

**Dismissed:** 2026-03-25
**Reason:** Intentional HTTP response cache. `writeCache()` writes the parsed JSON body of a registry API response to `node_modules/.decantr-cache/registry/<hash>.json`. This is the registry client's disk cache and is the designed behavior. The registry URL is validated by `validateRegistryUrl()` to require HTTPS (or localhost), preventing HTTP downgrade attacks. The cache file path is constructed from a fixed base directory (`node_modules/.decantr-cache/registry/`) and a SHA-256 hash of the URL — no user-controlled path component.

---

## js/http-to-file-access — cli/commands/registry.js:116

**Dismissed:** 2026-03-25
**Reason:** False positive on data-flow origin. Line 116 writes `decantr.config.json` with locally constructed JSON (the updated plugins array). The content written is not the HTTP response body — it is a serialized JavaScript object built entirely from the existing config file and a fixed string literal (`./plugins/${name}.js`). CodeQL may be tracking `name` as tainted from a registry API call upstream, but the config value written here is a local path string, not remote content.

---

## js/http-to-file-access — cli/commands/registry.js:168

**Dismissed:** 2026-03-25
**Reason:** False positive on data-flow origin. Line 168 writes a locally constructed index JSON object to `src/registry-content/<type>/index.json`. The content is built from `type`, `id`, `version`, and a fixed `source: 'registry'` string — not the raw HTTP response body. This is a bookkeeping update that records what was installed, not a file dump of the HTTP artifact. CodeQL traces `version` through the registry API response, but the written content is locally assembled metadata.

---

## js/http-to-file-access — cli/commands/registry.js:370

**Dismissed:** 2026-03-25
**Reason:** Intentional registry install operation. `cmdAdd()` fetches content from the community registry API via `client.getContent()` (HTTPS-only, validated) and writes it to the project's `src/registry-content/` directory. This is the core function of `decantr registry add`. Mitigations in place: (1) the `name` field is constrained by `parseSpec()` regex to `[a-z0-9@-]+`, preventing path traversal; (2) `getInstallPath()` only permits fixed relative paths within the project tree; (3) `validateArtifact()` validates content structure before writing; (4) checksum is computed and stored in the manifest for integrity tracking.

---

## js/http-to-file-access — cli/commands/registry.js:473

**Dismissed:** 2026-03-25
**Reason:** Intentional registry restore operation. `cmdInstall()` (lockfile-based restore) fetches pinned content from the registry and writes it to the project. Same mitigations as the `cmdAdd()` suppression at line 370 apply. Additionally, this path verifies content integrity against the lockfile checksum (`entry.integrity`) before writing, providing an extra layer of tamper detection beyond the manifest checksum.

---

## js/http-to-file-access — cli/commands/registry.js:628

**Dismissed:** 2026-03-25
**Reason:** Intentional registry update operation. `cmdUpdate()` fetches updated content from the registry and writes it to replace an existing installed file. Same mitigations as line 370 apply. Additionally, this path checks for local modifications via `verifyChecksum()` against the stored manifest checksum before overwriting, and skips files with local changes unless `--force` is passed.

---

## js/http-to-file-access — cli/commands/mcp.js:870

**Dismissed:** 2026-03-25
**Reason:** Intentional MCP server registry install. The `install_from_registry` tool handler in the MCP server fetches content via `client.getContent()` (HTTPS-only) and writes it to the project. Mitigations: (1) `validateStringArg()` checks `type` and `name` for non-empty string and length bounds; (2) the install path is looked up from a hardcoded `pathMap` keyed on `args.type` — no path components are derived from the HTTP response; (3) `validateArtifact()` validates content structure before writing; (4) an integrity checksum is stored in the manifest post-install.

---

## js/incomplete-sanitization — src/css/runtime.js (36 alerts, lines ~119, ~133, ~149, ~174, ~195, ~217, ~234)

**Dismissed:** 2026-03-25
**Reason:** By design — CSS class name escaping, not injection sanitization. Each `replace()` call escapes a specific CSS selector metacharacter (`:`, `/`, `[`, `]`, `#`, `%`, `(`, `)`, `,`, `+`) with a backslash prefix, making the class name safe for use in CSS selectors. CodeQL flags these because each individual `replace()` only handles one character, but the calls are chained to collectively cover all CSS selector special characters. The inputs are atom class names validated upstream by regex patterns in `src/css/index.js` (`BP_RE`, `CQ_RE`, `GP_RE`, `PSEUDO_RE`, `ARB_RE`), not arbitrary user strings. The escaping converts e.g. `_sm:gc3` to `_sm\:gc3` for the CSS selector `.\_sm\:gc3 { ... }`. This is standard CSS selector escaping behavior, not a sanitization bypass.

Functions affected:
- `injectResponsive()` line 133 — escapes `:` in responsive atom class names
- `injectMediaQuery()` line 149 — escapes `:` in motion-query atom class names
- `injectContainer()` line 174 — escapes `:` in container-query atom class names
- `injectGroupPeer()` line 195 — escapes `:` and `/` in group/peer atom class names
- `injectPseudo()` line 217 — full escape chain for pseudo-class atom class names
- `injectResponsivePseudo()` line 234 — full escape chain for responsive+pseudo atom class names

---

## js/incomplete-sanitization — src/css/index.js (10 alerts, lines ~113, ~132-134)

**Dismissed:** 2026-03-25 (partially fixed, remainder suppressed)
**Fixed:** `sanitizeArbValue()` added to strip `{`, `}`, `<`, `>`, `;` and `url()` from arbitrary CSS values before injection (line 113). This prevents CSS rule breakout, property injection, and data exfiltration via `url()` in atoms like `_bg[user_input]`.
**Suppressed (lines 132-134):** The `escapeClass()` function performs the same CSS selector escaping as the runtime.js functions. It chains multiple `replace()` calls to escape all CSS selector metacharacters. CodeQL flags each individual `replace()` as incomplete, but the full chain covers all needed characters. The input is a validated atom class name, not arbitrary user content.
