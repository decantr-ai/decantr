import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { prettyCanonicalJson } from '../runner/canonical.mjs';
import { auditQualificationPrivacy } from './audit-qualification-privacy.mjs';

const SYNTHETIC_TASK_ID = 'fixture.sealed-task-alpha';
const SYNTHETIC_PUBLIC_OPAQUE_ID = 'q-fixture-public-binding';
const SYNTHETIC_SENSITIVE_TOKEN = 'fixture-private-token-alpha';
const auditScriptPath = fileURLToPath(new URL('./audit-qualification-privacy.mjs', import.meta.url));

test('privacy audit scans tracked and unignored public content without treating public opaque IDs as private', async () => {
  const fixture = await createFixture();
  try {
    const passing = await auditQualificationPrivacy({
      repositoryRoot: fixture.root,
      privateInputPath: fixture.candidatePath,
    });
    assert.equal(passing.ok, true);
    assert.equal(passing.sensitiveValueCount, 1);
    assert.deepEqual(
      await auditQualificationPrivacy({
        repositoryRoot: fixture.root,
        privateInputPath: fixture.candidatePath,
      }),
      passing,
    );

    await writeFile(
      join(fixture.root, 'untracked-public-leak.txt'),
      `accidental identity: ${SYNTHETIC_TASK_ID}\n`,
    );
    const failing = await auditQualificationPrivacy({
      repositoryRoot: fixture.root,
      privateInputPath: fixture.candidatePath,
    });
    assert.equal(failing.ok, false);
    assert.equal(
      failing.findings.some(
        (finding) =>
          finding.file === 'untracked-public-leak.txt' && finding.location === 'content',
      ),
      true,
    );
    assert.equal(JSON.stringify(failing).includes(SYNTHETIC_TASK_ID), false);
    const cli = spawnSync(
      process.execPath,
      [
        auditScriptPath,
        '--repository-root',
        fixture.root,
        '--private-input',
        fixture.candidatePath,
      ],
      { encoding: 'utf8' },
    );
    assert.equal(cli.status, 1);
    assert.match(cli.stderr, /Qualification privacy audit failed/u);
    assert.equal(`${cli.stdout}${cli.stderr}`.includes(SYNTHETIC_TASK_ID), false);

    await writeFile(join(fixture.root, 'untracked-public-leak.txt'), 'clean fixture\n');
    await writeFile(join(fixture.root, 'README.md'), `tracked leak: ${SYNTHETIC_TASK_ID}\n`);
    const trackedFailure = await auditQualificationPrivacy({
      repositoryRoot: fixture.root,
      privateInputPath: fixture.candidatePath,
    });
    assert.equal(
      trackedFailure.findings.some(
        (finding) => finding.file === 'README.md' && finding.location === 'content',
      ),
      true,
    );
    assert.equal(JSON.stringify(trackedFailure).includes(SYNTHETIC_TASK_ID), false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

test('privacy audit accepts a private root, detects sensitive filenames, and redacts findings', async () => {
  const fixture = await createFixture();
  try {
    await writeFile(
      join(fixture.privateRoot, 'generator-config.json'),
      prettyCanonicalJson({
        schemaVersion: 'decantr-benchmark-qualification-private-generator-config.v1',
        privacyAudit: { sensitiveTokens: [SYNTHETIC_SENSITIVE_TOKEN] },
      }),
    );
    await writeFile(join(fixture.root, `${SYNTHETIC_SENSITIVE_TOKEN}.txt`), 'public fixture\n');

    const result = await auditQualificationPrivacy({
      repositoryRoot: fixture.root,
      privateInputPath: fixture.privateRoot,
    });
    assert.equal(result.ok, false);
    assert.equal(result.sensitiveValueCount, 2);
    assert.equal(
      result.findings.some(
        (finding) => finding.file === '<redacted>.txt' && finding.location === 'path',
      ),
      true,
    );
    assert.equal(JSON.stringify(result).includes(SYNTHETIC_SENSITIVE_TOKEN), false);
    assert.equal(JSON.stringify(result).includes(SYNTHETIC_TASK_ID), false);
  } finally {
    await rm(fixture.root, { recursive: true, force: true });
  }
});

async function createFixture() {
  const root = await mkdtemp(join(tmpdir(), 'qualification-privacy-audit-test-'));
  const privateRoot = join(root, '.private', 'qualification');
  const candidatePath = join(privateRoot, 'candidates.json');
  await mkdir(privateRoot, { recursive: true });
  await Promise.all([
    writeFile(join(root, '.gitignore'), '.private/\n'),
    writeFile(join(root, 'README.md'), 'Synthetic public fixture.\n'),
    writeFile(
      join(root, 'qualification-index.json'),
      prettyCanonicalJson({ tasks: [{ opaqueId: SYNTHETIC_PUBLIC_OPAQUE_ID }] }),
    ),
    writeFile(
      candidatePath,
      prettyCanonicalJson({
        schemaVersion: 'fixture-private-qualification-candidates.v1',
        count: 1,
        records: [
          {
            taskId: SYNTHETIC_TASK_ID,
            opaqueId: SYNTHETIC_PUBLIC_OPAQUE_ID,
            partition: 'qualification',
          },
        ],
      }),
    ),
  ]);
  execFileSync('git', ['init', '--quiet'], { cwd: root, stdio: 'ignore' });
  execFileSync('git', ['add', '--all'], { cwd: root, stdio: 'ignore' });
  return { root, privateRoot, candidatePath };
}
