# Evaluator Authoring

The benchmark materializer refuses to create runnable task manifests until every task has a reviewed, candidate-independent evaluator. Development evaluator sources may live here. Qualification evaluator sources, contracts, and plaintext task manifests stay under `.private/benchmark-3-10/` and are never committed.

Each evaluator root has this layout:

```text
specs/<task-id>.json
sources/<task-id>.mjs
contracts/<task-id>.json       # generated
manifest.json                  # generated
```

The source is one self-contained Node module. It may use Node built-ins and dependencies from the frozen target environment, but it may not import another local evaluator file or read product output. It receives `--workspace` and `--project-path`, exercises behavior independently of either experimental arm, and writes exactly one JSON object to stdout:

```json
{
  "passed": true,
  "metrics": {
    "governanceViolations": 0,
    "accessibilityViolations": 0,
    "visualScore": 100
  }
}
```

The authoring spec binds the source and fixed-argv host commands:

```json
{
  "schemaVersion": "decantr-benchmark-evaluator-authoring-spec.v2",
  "taskId": "repository.task",
  "contractId": "repository.task.v1",
  "review": {
    "status": "draft",
    "reviewedBy": null,
    "reviewedAt": null,
    "notes": "Explain the independent behavioral oracle and known blind spots."
  },
  "oracle": {
    "candidateIndependent": true,
    "decantrOutputAllowed": false,
    "sourcePath": "sources/repository.task.mjs"
  },
  "commands": [
    {
      "id": "behavior",
      "kind": "functional",
      "executable": "node",
      "args": [
        "${EVALUATOR_ROOT}/sources/repository.task.mjs",
        "--workspace",
        "${WORKSPACE}",
        "--project-path",
        "${PROJECT_PATH}"
      ],
      "cwd": "${EVALUATOR_ROOT}",
      "timeoutMs": 120000,
      "required": true,
      "resultFormat": "json-stdout"
    },
    {
      "id": "host-build",
      "kind": "build",
      "executable": "npm",
      "args": ["run", "build"],
      "cwd": "${WORKSPACE}/${PROJECT_PATH}",
      "timeoutMs": 1800000,
      "required": true,
      "resultFormat": "exit-code"
    }
  ],
  "limits": {
    "timeoutMs": 5400000,
    "maxRequests": 40,
    "maxInputTokens": 1000000,
    "maxOutputTokens": 100000
  }
}
```

At least one required functional command must invoke the exact bound source, and at least one host build command must be required. Compound shell strings are not accepted: split them into separate fixed commands and set `cwd` and `environment` explicitly. The materializer checks token maxima against every locked model's per-run dollar cap.

An evaluator is not approved merely because its source parses. Review must verify that it:

- fails on the frozen base commit;
- passes on the expected commit;
- accepts a defensible alternative implementation where practical;
- does not compare against the expected diff or consume any product-generated artifact;
- checks task behavior, scope, accessibility, and styling authority appropriate to the task;
- emits failures rather than skipping when its runtime or fixture is unavailable.

After substantive review, set `review.status` to `approved` and record the reviewer, timestamp, and notes. Approval does not directly open materialization and does not substitute for the two independent blinded outcome reviewers.

## Qualification Evidence

`qualification-task.mjs --mode prepare` creates a content-bound authoring seal and compiled contract. It does not execute the evaluator. `--mode host-probe` is an optional local diagnostic that checks strict base-fails/expected-passes polarity, but it emits a non-materializable probe and can never satisfy the task gate.

Materializable evidence comes only from `.github/workflows/benchmark-3-10-evaluator-qualification.yml`:

1. `qualification-input.mjs --mode build` runs from a clean committed controller checkout and seals the exact candidate, reviewed environment, locked matrix, evaluator source, contract, and base/expected Git snapshot packs.
2. `qualification-input.mjs --mode hydrate` rejects a changed, missing, extra, or symlinked artifact file before hydrating the exact commits and trees.
3. `container-orchestrator.mjs` verifies the runner commit and clean controller tree, prepares both roles in the locked image, inspects containers from the host, and executes the evaluator with no evaluation network or sibling workspace access.
4. GitHub OIDC signs the execution attestation. Public evidence uses GitHub build provenance; private evidence uses the pinned Sigstore path. Both are verified offline against their exact repository, workflow, commit, ref, and hosted execution policy.
5. `qualification-task.mjs --mode finalize-container` retains the result pair, authoring seal, execution attestation, and provenance, then emits a v3 receipt only after independent strict-polarity and binding checks.
6. `materialize.mjs` re-verifies the complete retained chain before writing task manifests and the public opaque qualification index.

The v3 receipt binds the execution-attestation file and self digest, container-controller closure, evaluator-source closure, canonical qualification-input request and manifest, runner repository commit, provenance bundle bytes, and provenance verification digest. Those fields remain mandatory through run planning, execution records, and release audit.

Public development input artifacts may use ordinary short-lived GitHub Actions storage. The data-free private producer controller is shared, while private qualification sources and oracles remain in the private repository and its three-day artifacts. The split-run staging workflow separates the agent-safe tar from the evaluator-only tar and verifies their common content binding before either execution stage. Never commit private evaluator material to the public repository or upload it to a publicly readable artifact.

Hosted qualification grants the fixed container UID 10001 an explicit POSIX ACL over each hydrated workspace while retaining runner access for post-command verification. It then preloads the reviewed Linux amd64 Squid manifest `sha256:8fafd41d6ddceb295d26eea9938321d825ac5351c7e46cf6a8aa5d093b8ed1ce` and verifies that Docker exposes the request-bound config digest before the controller starts the proxy. The manifest-list digest is not interchangeable with the local image config digest.

Current authored-spec state is 24/24 approved for development and 16/16 approved for qualification under explicit sole-maintainer review. These are review metadata counts, not materialized tasks, external evaluator qualification, or human model-outcome review. Zero external container-qualified receipts currently exist.
