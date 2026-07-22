# Candidate Runtime

`build.mjs` packs the unreleased CLI and its internal workspace dependencies, installs those exact tarballs into an isolated runtime, and binds the package-lock bytes plus the installed `@decantr/*` tree in `candidate.json`.

Release evidence requires a clean Git source. `--allow-dirty` exists only for local, no-cost treatment smoke tests; the release gate rejects a dirty source attestation.

```sh
node scripts/benchmark-3-10/candidate/build.mjs \
  --out .private/benchmark-3-10/candidate \
  --version-label 3.10.0-development
```

Treatment runs pass both the manifest and its runtime root:

```sh
node scripts/benchmark-3-10/runner/run-one.mjs \
  --candidate-manifest .private/benchmark-3-10/candidate/candidate.json \
  --candidate-runtime-root .private/benchmark-3-10/candidate/runtime \
  ...
```

The runner verifies the runtime tree before executing `decantr task`. Context generation is read-only, happens before any paid budget reservation, and fails closed on blocked targets, malformed output, path escapes, unbounded reads, or workspace writes.
