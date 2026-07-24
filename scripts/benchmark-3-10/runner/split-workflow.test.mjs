import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);

test('split workflow keeps evaluator bytes and provider credentials in disjoint jobs', async () => {
  const workflow = await readFile(
    resolve(
      repositoryRoot,
      '.github/workflows/benchmark-3-10-split-run.yml',
    ),
    'utf8',
  );
  const evaluatorMarker = '\n  evaluator:\n';
  const evaluatorIndex = workflow.indexOf(evaluatorMarker);
  assert.notEqual(evaluatorIndex, -1);
  const agent = workflow.slice(0, evaluatorIndex);
  const evaluator = workflow.slice(evaluatorIndex);
  assert.doesNotMatch(agent, /inputs\.evaluator_input_artifact/u);
  assert.doesNotMatch(agent, /\/sealed\/|--evaluator-contract|--task-manifest/u);
  assert.match(agent, /secrets\.OPENAI_API_KEY/u);
  assert.match(agent, /secrets\.ANTHROPIC_API_KEY/u);
  assert.doesNotMatch(agent, /inputs\.paid|approval_id|approval-id/u);
  assert.match(
    agent,
    /PAID="\$\(jq -r \.paid "\$INPUT_ROOT\/authorization\.json"\)"/u,
  );
  assert.match(agent, /test "\$GITHUB_RUN_ATTEMPT" = "1"/u);
  assert.match(
    agent,
    /benchmark-3-10-paid-run-\$RUN_ID/u,
  );
  assert.match(
    workflow,
    /group: benchmark-3-10-split-run-\$\{\{ github\.repository_id \}\}-\$\{\{ inputs\.run_id \}\}/u,
  );
  assert.match(agent, /test "\$RUN_ID" = "\$EXPECTED_RUN_ID"/u);
  assert.match(
    agent,
    /Reserve this paid run before credentials are exposed/u,
  );
  assert.ok(
    agent.indexOf(
      'Reserve this paid run before credentials are exposed',
    ) < agent.indexOf('Execute the isolated agent stage'),
  );
  assert.doesNotMatch(
    agent,
    /--mount "[^"]*authorization\.json[^"]*dst=\/input/u,
  );
  assert.match(
    agent,
    /src=\$PROXY_CONFIG_ROOT,dst=\/config,ro/u,
  );
  assert.match(
    agent,
    /src=\$RECEIPT_ROOT,dst=\/receipt,rw/u,
  );
  assert.match(
    agent,
    /src=\$RECEIPT_ROOT,dst=\/provider,ro/u,
  );
  assert.doesNotMatch(
    agent,
    /src=\$OUTPUT_ROOT,dst=\/provider/u,
  );
  assert.match(agent, /docker network create --internal/u);
  assert.match(agent, /agent-stage-attestation\.json/u);
  assert.doesNotMatch(evaluator, /secrets\.(?:OPENAI|ANTHROPIC)_API_KEY/u);
  assert.match(evaluator, /Verify agent provenance before evaluator material exists/u);
  assert.match(evaluator, /Download sealed evaluator input after agent verification/u);
  assert.ok(
    evaluator.indexOf('Verify agent provenance before evaluator material exists') <
      evaluator.indexOf('Download sealed evaluator input after agent verification'),
  );
  assert.match(evaluator, /docker run --rm --network none/u);
  assert.match(evaluator, /--authorization \/sealed\/authorization\.json/u);
  assert.match(evaluator, /--budget-approval/u);
  assert.match(evaluator, /--power-pilot/u);
  assert.match(evaluator, /--protocol-maximum-usd/u);
  assert.match(evaluator, /--development-task-count/u);
  assert.match(
    evaluator,
    /if: needs\.agent\.outputs\.paid == 'true'/u,
  );
  assert.match(evaluator, /--agent-exited-before-mount/u);
  assert.equal((workflow.match(/cosign sign-blob/gu) ?? []).length, 2);
});

test('split workflows use commit-pinned actions and fixed GitHub-hosted images', async () => {
  for (const filename of [
    'benchmark-3-10-candidate.yml',
    'benchmark-3-10-run-materialization.yml',
    'benchmark-3-10-split-input.yml',
    'benchmark-3-10-split-run.yml',
  ]) {
    const workflow = await readFile(
      resolve(repositoryRoot, '.github/workflows', filename),
      'utf8',
    );
    assert.doesNotMatch(workflow, /runs-on:\s*ubuntu-latest/u);
    for (const match of workflow.matchAll(/uses:\s*([^\s#]+)/gu)) {
      assert.match(
        match[1],
        /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[a-f0-9]{40}$/u,
        `${filename}: ${match[1]}`,
      );
    }
  }
});

test('candidate workflow builds once from a clean public commit and attests the manifest', async () => {
  const workflow = await readFile(
    resolve(
      repositoryRoot,
      '.github/workflows/benchmark-3-10-candidate.yml',
    ),
    'utf8',
  );
  assert.match(
    workflow,
    /github\.repository == 'decantr-ai\/decantr'/u,
  );
  assert.match(workflow, /candidate\/build\.mjs/u);
  assert.match(workflow, /--built-at "\$BUILT_AT"/u);
  assert.match(workflow, /candidate\.source\.commit/u);
  assert.match(workflow, /candidate\.source\.clean/u);
  assert.match(workflow, /attest-build-provenance/u);
  assert.doesNotMatch(workflow, /--allow-dirty/u);
});

test('split-input staging produces paired roots instead of trusting caller-supplied tar files', async () => {
  const workflow = await readFile(
    resolve(
      repositoryRoot,
      '.github/workflows/benchmark-3-10-split-input.yml',
    ),
    'utf8',
  );
  assert.match(
    workflow,
    /SOURCE_PATH" = "\.github\/workflows\/benchmark-3-10-run-materialization\.yml"/u,
  );
  assert.match(
    workflow,
    /runner\/prepare-split-run-input\.mjs/u,
  );
  assert.match(
    workflow,
    /runner\/extract-safe-tar\.mjs/u,
  );
  assert.match(
    workflow,
    /runner\/run-materialization-packet\.mjs/u,
  );
  assert.match(
    workflow,
    /provenance\/sigstore-keyless\.mjs/u,
  );
  assert.doesNotMatch(
    workflow,
    /benchmark-3-10-(?:private-)?qualification-input\.yml/u,
  );
  const producer = workflow.indexOf(
    'runner/prepare-split-run-input.mjs',
  );
  const agentTar = workflow.indexOf(
    'artifacts/agent-input.tar',
  );
  const evaluatorTar = workflow.indexOf(
    'artifacts/evaluator-input.tar',
  );
  assert.ok(producer >= 0 && agentTar > producer);
  assert.ok(evaluatorTar > producer);
});

test('run materialization uses frozen identities and short-lived transport without provider credentials', async () => {
  const workflow = await readFile(
    resolve(
      repositoryRoot,
      '.github/workflows/benchmark-3-10-run-materialization.yml',
    ),
    'utf8',
  );
  assert.match(
    workflow,
    /decantr-ai\/decantr-qualification-private/u,
  );
  assert.match(
    workflow,
    /prepared-workspace-sources\.json/u,
  );
  assert.match(workflow, /candidate-source\.json/u);
  assert.match(
    workflow,
    /--mode build/u,
  );
  assert.match(
    workflow,
    /--mode verify/u,
  );
  assert.match(
    workflow,
    /run-materialization-packet\.tar/u,
  );
  assert.match(
    workflow,
    /--deny-self-hosted-runners/u,
  );
  assert.doesNotMatch(
    workflow,
    /secrets\.(?:OPENAI|ANTHROPIC)_API_KEY/u,
  );
  assert.doesNotMatch(workflow, /--paid/u);
});
