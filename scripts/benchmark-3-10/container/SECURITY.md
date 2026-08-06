# Container Security Arguments

Build every profile through `.github/workflows/benchmark-3-10-runtime-profiles.yml`; it resolves immutable Linux amd64 base images, builds separate evaluator and evaluator-free agent images, executes both offline self-checks, publishes both results to repository-scoped GHCR packages, and pulls their exact registry-manifest references back. The canonical build subject binds both Docker config digests, exact agent CLI versions and npm integrity, isolation and browser smoke results, and the complete clean benchmark source closure before GitHub OIDC signing. The v3 profile attestation retains that subject, its provenance bundle, and canonical offline verification. Matrix locking re-verifies every bundle with a fixed GitHub workflow/commit/ref policy and denies self-hosted runners. A generic local image, mutable tag by itself, or self-digested JSON is not release evidence.

Evaluator qualification is a separate GitHub-hosted container boundary. `.github/workflows/benchmark-3-10-evaluator-qualification.yml` checks out the exact source-artifact run commit, authenticates to GHCR with repository-scoped read permission only, verifies every sealed input file, hydrates exact Git snapshot packs, and refuses a tracked or untracked qualification-controller change. Preparation uses a reviewed registry-only forward proxy; evaluator execution uses Docker `none`, read-only source/evaluator/contract mounts, isolated role workspaces, and host inspection while containers are running. The output is materializable only after GitHub OIDC provenance is retained and independently verified offline. A local host probe, unsigned JSON, self-hosted runner, mutable tag, caller-supplied digest, or missing provenance bundle is diagnostic evidence only.

Private evaluator/oracle material must not be committed to the public repository, mounted into a model container, or placed in a public artifact. The private producer and split-input staging workflow retain private inputs only as one-day fallback artifacts in `decantr-ai/decantr-qualification-private`, verify the source workflow/run/commit, and publish separate agent-safe and evaluator-only artifacts. Maintainer automation must preserve verified local evidence and delete campaign artifacts immediately after consumption. Do not dispatch the sealed path from the public repository or substitute a public artifact.

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

Release-eligible model execution uses `.github/workflows/benchmark-3-10-split-run.yml`: a GitHub-hosted signed agent stage followed by a separately attested hidden-evaluator stage. The minimal immutable agent image contains the coding-agent CLIs, task runtime, and agent controller, but no evaluator code or contracts, expected revisions or patches, qualification controllers, oracle sources, private task manifests, or hidden-review material. Provider keys stay in the run-local proxy container; the agent receives only the audited proxy URL. The evaluator artifact is not downloaded until the agent process exits and its subject, workspace delta, response, receipt, and Sigstore bundle are verified. The evaluator then reconstructs the delta in a fresh prepared workspace with `--network none`, verifies dependency integrity, and signs its run core. The finalizer independently verifies both signatures before emitting a v3 run record. No hosted signed run has yet qualified this implementation, so do not relabel local or host-runner output as release evidence.

Use Docker's default seccomp profile or a stricter organization-owned profile. The registry-only network must not route to the model proxy or general internet destinations beyond the required package registry. The `decantr-benchmark-proxy-only` network must contain only the audited model proxy and must not route general internet traffic. Never mount the host home directory, Docker socket, SSH agent, Git credential store, npm configuration, Codex home, Claude configuration, MCP configuration, or provider API keys. The runner receives no provider secret; the proxy owns provider authentication.
