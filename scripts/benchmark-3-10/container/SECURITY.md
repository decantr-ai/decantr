# Container Security Arguments

Build every profile through `.github/workflows/benchmark-3-10-runtime-profiles.yml`; it resolves immutable Linux amd64 base images, supplies the exact task runtime and package-manager arguments, executes the offline self-check, publishes the result to the repository-scoped `ghcr.io/decantr-ai/decantr-benchmark-3-10` package, pulls the exact registry-manifest reference back, binds the complete clean benchmark source closure, and signs the canonical build subject with GitHub OIDC. The manifest-pinned GHCR reference is the retrieval identity; the separately retained Docker config digest is the runtime identity checked on every container. The v2 profile attestation retains bindings for that subject, its provenance bundle, and its canonical offline verification. Matrix locking re-verifies every bundle with a fixed GitHub workflow/commit/ref policy and denies self-hosted runners. A generic local image, mutable tag by itself, or self-digested JSON is not release evidence.

Evaluator qualification is a separate GitHub-hosted container boundary. `.github/workflows/benchmark-3-10-evaluator-qualification.yml` checks out the exact source-artifact run commit, authenticates to GHCR with repository-scoped read permission only, verifies every sealed input file, hydrates exact Git snapshot packs, and refuses a tracked or untracked qualification-controller change. Preparation uses a reviewed registry-only forward proxy; evaluator execution uses Docker `none`, read-only source/evaluator/contract mounts, isolated role workspaces, and host inspection while containers are running. The output is materializable only after GitHub OIDC provenance is retained and independently verified offline. A local host probe, unsigned JSON, self-hosted runner, mutable tag, caller-supplied digest, or missing provenance bundle is diagnostic evidence only.

Private evaluator/oracle material must not be committed, mounted into a model container, or placed in a public artifact. A secret-preserving private input transfer mechanism is still unresolved; do not run the sealed qualification workflow until that path is reviewed.

Preparation and model execution are separate network phases. Prepare a fresh checkout with the profile image on a network that can route only to the dependency registry. Do not expose model credentials, provider credentials, a model proxy, or personal agent configuration during this phase:

```sh
docker run --rm \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  --read-only \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=2g \
  --tmpfs /home/benchmark-empty:rw,noexec,nosuid,nodev,size=128m,mode=0700,uid=10001,gid=10001 \
  --mount type=bind,src="$FRESH_CHECKOUT",dst=/work,rw \
  --mount type=bind,src="$EVIDENCE_ROOT",dst=/evidence,rw \
  --mount type=bind,src="$TASK_ENVIRONMENT_SPEC",dst=/inputs/environment.json,ro \
  --mount type=bind,src="$LOCKED_RUNTIME_MATRIX",dst=/inputs/runtime-matrix.json,ro \
  --network=decantr-benchmark-registry-only \
  "$PROFILE_IMAGE" \
  /usr/local/bin/node /opt/decantr-benchmark/environments/prepare-workspace.mjs \
    --environment-spec /inputs/environment.json \
    --runtime-matrix /inputs/runtime-matrix.json \
    --workspace /work \
    --network-policy dependency-registry \
    --out "/evidence/prepared/$TASK_ID.json"
```

After preparation succeeds, remove the registry network. The following host-runner container is for deterministic harness diagnostics only. It deliberately keeps adapter and evaluator orchestration in one process and every record it emits is `test-only-host`, so this path can never become release evidence:

```sh
docker run --rm \
  --cap-drop=ALL \
  --security-opt=no-new-privileges:true \
  --read-only \
  --pids-limit=512 \
  --memory=12g \
  --cpus=8 \
  --tmpfs /tmp:rw,noexec,nosuid,nodev,size=2g \
  --tmpfs /home/benchmark-empty:rw,noexec,nosuid,nodev,size=128m,mode=0700,uid=10001,gid=10001 \
  --mount type=bind,src="$FRESH_CHECKOUT",dst=/work,rw \
  --mount type=bind,src="$EVIDENCE_ROOT",dst=/evidence,rw \
  --mount type=bind,src="$CANDIDATE_ROOT",dst=/candidate,ro \
  --mount type=bind,src="$TASK_ENVIRONMENT_SPEC",dst=/inputs/environment.json,ro \
  --mount type=bind,src="$LOCKED_RUNTIME_MATRIX",dst=/inputs/runtime-matrix.json,ro \
  --network=decantr-benchmark-proxy-only \
  "$PROFILE_IMAGE" \
  /usr/local/bin/node /opt/decantr-benchmark/runner/run-one.mjs \
    --candidate-manifest /candidate/candidate.json \
    --candidate-runtime-root /candidate/runtime \
    --runtime-matrix /inputs/runtime-matrix.json \
    --environment-spec /inputs/environment.json \
    --prepared-environment "/evidence/prepared/$TASK_ID.json" \
    --evaluator-runtime-root /opt/decantr-benchmark/evaluator-runtime \
    ...
```

Release-eligible model execution requires a separate GitHub-hosted, signed agent stage followed by a separately attested hidden-evaluator stage. The agent stage must use its own minimal immutable image: it may contain the agent CLI, task runtime, approved arm-delivery controller, and candidate runtime, but it must not contain evaluator code, evaluator contracts, expected revisions or patches, qualification controllers, oracle sources, private task manifests, or hidden-review material anywhere in the image, mounts, artifact inputs, environment, or cache. The evaluator image and sealed inputs are introduced only after the agent process has exited and its output workspace and trajectory have been content-addressed. Both image closures and the stage handoff must be independently attested. That split-stage workflow and dedicated agent image are not implemented. Do not relabel host-runner output or mount hidden qualification material into the diagnostic agent container to bypass this boundary.

Use Docker's default seccomp profile or a stricter organization-owned profile. The registry-only network must not route to the model proxy or general internet destinations beyond the required package registry. The `decantr-benchmark-proxy-only` network must contain only the audited model proxy and must not route general internet traffic. Never mount the host home directory, Docker socket, SSH agent, Git credential store, npm configuration, Codex home, Claude configuration, MCP configuration, or provider API keys. The runner receives no provider secret; the proxy owns provider authentication.
