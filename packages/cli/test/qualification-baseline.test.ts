import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  createBehaviorEvidenceBinding,
  outputKey,
  validateExecutableOracleEvidence,
  validateRouteReplayCoverage,
  verifyCandidatePackageBytes,
} from '../../../scripts/audit-3-9-qualification-baseline.mjs';
import {
  adjudicationSignaturePayload,
  reviewerSignaturePayload,
} from '../../../scripts/prepare-3-9-human-review.mjs';
import {
  targetSourceRef,
  validateBrownfieldTargetIdentity,
} from '../../../scripts/run-3-9-machine-qualification.mjs';

const repoRoot = resolve(import.meta.dirname, '..', '..', '..');
const sourceFixtures = join(repoRoot, 'fixtures', 'qualification', '3.9');
const auditScript = join(repoRoot, 'scripts', 'audit-3-9-qualification-baseline.mjs');

const candidatePackageWave = [
  '@decantr/content',
  '@decantr/registry',
  '@decantr/core',
  '@decantr/verifier',
  '@decantr/mcp-server',
  '@decantr/cli',
];

function sha256(value: string | Buffer): string {
  return createHash('sha256').update(value).digest('hex');
}

function runAudit(
  fixturesDir: string,
  lintOnly = false,
  separator = false,
  envOverrides: Record<string, string> = {},
) {
  const result = spawnSync(
    process.execPath,
    [
      auditScript,
      '--repo-root',
      repoRoot,
      '--fixtures-dir',
      fixturesDir,
      ...(separator ? ['--'] : []),
      '--json',
      ...(lintOnly ? ['--lint-only'] : []),
    ],
    { encoding: 'utf8', env: { ...process.env, ...envOverrides } },
  );
  return { ...result, summary: JSON.parse(result.stdout) as Record<string, unknown> };
}

function runGit(root: string, args: string[]): string {
  const result = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(' ')} failed: ${result.stderr || result.stdout}`);
  }
  return result.stdout.trim();
}

function updateFixture<T>(fixturesDir: string, name: string, update: (value: T) => void): void {
  const path = join(fixturesDir, name);
  const value = JSON.parse(readFileSync(path, 'utf8')) as T;
  update(value);
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

describe('Decantr 3.9 qualification audit', () => {
  let fixturesDir = '';
  let scratchDirs: string[] = [];

  beforeEach(() => {
    scratchDirs = [];
    fixturesDir = mkdtempSync(join(tmpdir(), 'decantr-qualification-'));
    cpSync(sourceFixtures, fixturesDir, { recursive: true });
  });

  afterEach(() => {
    rmSync(fixturesDir, { recursive: true, force: true });
    for (const path of scratchDirs) rmSync(path, { recursive: true, force: true });
  });

  function scratch(prefix: string): string {
    const path = mkdtempSync(join(tmpdir(), prefix));
    scratchDirs.push(path);
    return path;
  }

  it('lints the quarantined packet without granting qualification', () => {
    const result = runAudit(fixturesDir, true);
    expect(result.status, result.stderr).toBe(0);
    expect(result.summary).toMatchObject({
      status: 'incomplete',
      mode: 'lint-only',
      qualificationClaim: false,
      sourceVerification: 'structural',
      legacyCounts: {
        routeLabels: 84,
        forbiddenAssertions: 24,
        findingRows: 200,
        countTowardQualification: false,
      },
      compatibility: { v2Schemas: 10, mcpTools: 8 },
    });
    expect(result.summary.missingEvidence).toEqual([
      'HUMAN_REVIEW_IDENTITIES',
      'HUMAN_ADJUDICATED_FINDING_CORPUS',
      'PUBLIC_383_FINDING_REPLAY',
      'CANDIDATE_390_FINDING_REPLAY',
    ]);
  });

  it('accepts pnpm-style argument separators', () => {
    const result = runAudit(fixturesDir, true, true);
    expect(result.status, result.stderr).toBe(0);
    expect(result.summary).toMatchObject({ status: 'incomplete', mode: 'lint-only' });
  });

  it('keeps structural lint independent of pnpm and fresh package packing', () => {
    const result = runAudit(fixturesDir, true, false, { PATH: '' });
    expect(result.status, result.stderr).toBe(0);
    expect(result.summary).toMatchObject({
      status: 'incomplete',
      sourceVerification: 'structural',
      candidatePackageVerification: 'structural',
    });
  });

  it('fails the release gate while replay and human evidence are missing', () => {
    const result = runAudit(fixturesDir);
    expect(result.status).toBe(1);
    expect(result.summary).toMatchObject({
      status: 'incomplete',
      mode: 'release-gate',
      qualificationClaim: false,
      sourceVerification: 'structural',
    });
  });

  it('fails lint when the exact MCP action inventory is tampered with', () => {
    updateFixture<{ mcp: { tools: Array<{ actions: string[] }> } }>(
      fixturesDir,
      'compatibility-manifest.json',
      (manifest) => manifest.mcp.tools[0]?.actions.push('invented_action'),
    );
    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      'exact MCP tool/action inventory changed',
    );
  });

  it('fails lint if rejected rows are relabeled as qualification evidence', () => {
    updateFixture<{ countsTowardQualification: boolean }>(
      fixturesDir,
      'finding-labels.json',
      (findings) => {
        findings.countsTowardQualification = true;
      },
    );
    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain('must remain quarantined');
  });

  it('fails lint when declared blockers omit independently derived missing evidence', () => {
    updateFixture<{ items: unknown[] }>(fixturesDir, 'missing-evidence.json', (missing) => {
      missing.items.pop();
    });
    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      'declared IDs do not match derived blockers',
    );
  });

  it('rejects complete replay claims whose retained artifact does not exist', () => {
    updateFixture<{
      adoptionBoundaryReplay: {
        status: string;
        artifact: unknown;
        targets: unknown[];
      };
    }>(fixturesDir, 'qualification-packet.json', (packet) => {
      const digest = '0'.repeat(64);
      packet.adoptionBoundaryReplay = {
        status: 'complete',
        artifact: {
          path: 'fixtures/qualification/3.9/artifacts/missing-adoption-replay.json',
          sha256: digest,
          mediaType: 'application/json',
          generatedAt: '2026-07-16T12:00:00.000Z',
          command: ['node', 'scripts/run-realworld-corpus.mjs'],
          exitCode: 0,
          environment: {
            os: 'test',
            cpu: 'test',
            nodeVersion: '25.8.2',
            packageManagerVersion: '10.0.0',
            exactSourceRef: 'candidate-test',
            exactPackageVersions: {
              '@decantr/content': '3.9.2',
              '@decantr/registry': '3.9.2',
              '@decantr/core': '3.9.2',
              '@decantr/verifier': '3.9.2',
              '@decantr/mcp-server': '3.9.2',
              '@decantr/cli': '3.9.2',
            },
          },
        },
        targets: [
          'tanstack-start-dashboard',
          'bulletproof-react-vite',
          'tanstack-start-greenfield',
        ].map((targetId) => ({
          targetId,
          exhaustive: true,
          beforeTreeSha256: digest,
          afterTreeSha256: digest,
          changedPaths: [],
          unclassifiedPaths: [],
          authoredApplicationSourceChanges: [],
          studioWrites: [],
        })),
      };
    });

    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      'evidence file does not exist',
    );
  });

  it('rejects fabricated reviewer commit identities even when their field shapes are valid', () => {
    updateFixture<{
      reviewers: unknown[];
    }>(fixturesDir, 'qualification-packet.json', (packet) => {
      packet.reviewers = [0, 1].map((index) => ({
        reviewerId: `reviewer-${index + 1}`,
        kind: 'human',
        name: `Human Reviewer ${index + 1}`,
        stableIdentity: `reviewer-${index + 1}@example.com`,
        attestation:
          'I attest that I am a human reviewer, performed this review independently, and did not represent an agent or automated evidence pass as a person.',
        attestedAt: '2026-07-16T12:00:00.000Z',
        signedReviewEvidence: {
          kind: 'git-commit',
          commit: String(index).repeat(40),
          path: `fixtures/qualification/3.9/reviewers/reviewer-${index + 1}.json`,
          sha256: String(index).repeat(64),
          signer: `Reviewer ${index + 1}`,
          keyFingerprint: `0000000${index + 1}`,
        },
      }));
    });

    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      'human claims require a complete signed review kit',
    );
    expect(result.summary.missingEvidence).toContain('HUMAN_REVIEW_IDENTITIES');
  });

  it('requires replay identities to include the code kind used by audit matching', () => {
    expect(outputKey({ source: 'scan', codeKind: 'finding-id', code: 'route-source' })).toBe(
      'scan|finding-id|route-source',
    );
    expect(outputKey({ source: 'scan', codeKind: 'diagnostic-code', code: 'route-source' })).toBe(
      'scan|diagnostic-code|route-source',
    );
    expect(outputKey({ source: 'scan', code: 'route-source' })).toBeNull();

    updateFixture<{
      findingReplays: { candidate390: { cases: unknown[] } };
    }>(fixturesDir, 'qualification-packet.json', (packet) => {
      packet.findingReplays.candidate390.cases = [
        {
          caseId: 'case-a',
          clusterId: 'cluster-a',
          exhaustive: true,
          emitted: [{ source: 'scan', code: 'route-source' }],
          notEmitted: [],
          unexpectedOutputs: [],
        },
      ];
    });

    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      "must have required property 'codeKind'",
    );
  });

  it('fails closed when freshly packed candidate bytes differ from retained hashes', () => {
    const retainedTarballs = Object.fromEntries(
      candidatePackageWave.map((name) => {
        const file = `${name.replace('@decantr/', 'decantr-')}-3.9.2.tgz`;
        return [name, { file, sha256: sha256(`qualified:${name}`) }];
      }),
    );
    const pack = (mutatedPackage?: string) => (name: string, workDir: string) => {
      const path = join(workDir, retainedTarballs[name].file);
      const prefix = name === mutatedPackage ? 'current' : 'qualified';
      writeFileSync(path, `${prefix}:${name}`);
      return path;
    };

    expect(
      verifyCandidatePackageBytes({ repoRoot, retainedTarballs, packPackage: pack() }),
    ).toMatchObject({ valid: true, errors: [] });

    const result = verifyCandidatePackageBytes({
      repoRoot,
      retainedTarballs,
      packPackage: pack('@decantr/cli'),
    });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      '@decantr/cli freshly packed bytes do not match retained qualification bytes',
    );
  });

  it('binds reviewer and adjudication signatures to every gate decision and rationale', () => {
    const reviewer = {
      reviewerId: 'reviewer-a',
      kind: 'human',
      name: 'Reviewer A',
      stableIdentity: 'reviewer-a@example.test',
      attestation:
        'I attest that I am a human reviewer, performed this review independently, and did not represent an agent or automated evidence pass as a person.',
      attestedAt: '2026-07-16T12:00:00.000Z',
      signedReviewEvidence: null,
    };
    const workbook = {
      schemaVersion: 'decantr-3.9-human-reviewer-workbook.v2',
      reviewerSlot: 1,
      status: 'complete',
      qualificationClaim: false,
      corpusSha256: 'a'.repeat(64),
      reviewer,
      reviewedAt: '2026-07-16T12:30:00.000Z',
      caseRationales: [{ caseId: 'case-a', rationale: 'review rationale' }],
      decisions: [
        {
          judgmentId: 'judgment-001',
          decision: 'emit',
          severity: 'error',
          actionable: true,
          rationale: 'decision rationale',
        },
      ],
    };
    const reviewDigest = sha256(JSON.stringify(reviewerSignaturePayload(workbook)));
    workbook.decisions[0].rationale = 'mutated rationale';
    expect(sha256(JSON.stringify(reviewerSignaturePayload(workbook)))).not.toBe(reviewDigest);

    const adjudication = {
      schemaVersion: 'decantr-3.9-human-adjudication-workbook.v2',
      status: 'complete',
      qualificationClaim: false,
      corpusSha256: 'a'.repeat(64),
      reviewerWorksheetSha256: { 'reviewer-1': 'b'.repeat(64), 'reviewer-2': 'c'.repeat(64) },
      adjudicatorReviewerId: reviewer.reviewerId,
      adjudicatedAt: '2026-07-16T13:00:00.000Z',
      signedAdjudicationEvidence: null,
      caseResolutions: [
        { caseId: 'case-a', disagreementJudgmentIds: ['judgment-001'], resolution: 'final' },
      ],
      decisions: workbook.decisions,
    };
    const adjudicationDigest = sha256(
      JSON.stringify(adjudicationSignaturePayload(adjudication, reviewer)),
    );
    adjudication.reviewerWorksheetSha256['reviewer-1'] = 'd'.repeat(64);
    expect(sha256(JSON.stringify(adjudicationSignaturePayload(adjudication, reviewer)))).not.toBe(
      adjudicationDigest,
    );
  });

  it('rejects duplicate route replay IDs and reports the omitted frozen case', () => {
    const packet = JSON.parse(
      readFileSync(join(sourceFixtures, 'qualification-packet.json'), 'utf8'),
    ) as {
      routeCorpus: { cases: Array<{ id: string }> };
      routeReplay: { cases: Array<Record<string, unknown>> };
    };
    const duplicate = structuredClone(packet.routeReplay);
    duplicate.cases[duplicate.cases.length - 1] = structuredClone(duplicate.cases[0]);
    const coverage = validateRouteReplayCoverage(packet.routeCorpus, duplicate);
    expect(coverage.valid).toBe(false);
    expect(coverage.errors).toContain('route replay case IDs must be unique');
    expect(coverage.errors.join('\n')).toContain(
      `route replay omitted corpus IDs: ${packet.routeCorpus.cases.at(-1)?.id}`,
    );
  });

  it('rejects stale behavior when only the tarball table and outer artifact hash are replaced', () => {
    const packetPath = join(fixturesDir, 'qualification-packet.json');
    const packet = JSON.parse(readFileSync(packetPath, 'utf8')) as {
      machineReplay: {
        artifact: {
          path: string;
          sha256: string;
          environment: { exactPackageTarballs: Record<string, { file: string; sha256: string }> };
        };
      };
    };
    const fixturePrefix = 'fixtures/qualification/3.9/';
    const originalArtifactPath = join(
      fixturesDir,
      packet.machineReplay.artifact.path.slice(fixturePrefix.length),
    );
    const payload = JSON.parse(readFileSync(originalArtifactPath, 'utf8')) as {
      schemaVersion: string;
      environment: { exactPackageTarballs: Record<string, { file: string; sha256: string }> };
    };
    payload.environment.exactPackageTarballs['@decantr/cli'].sha256 = 'f'.repeat(64);
    const contents = `${JSON.stringify(payload, null, 2)}\n`;
    const digest = sha256(contents);
    const relativeArtifactPath = `evidence/${payload.schemaVersion}.${digest}.json`;
    writeFileSync(join(fixturesDir, relativeArtifactPath), contents);
    packet.machineReplay.artifact.path = `${fixturePrefix}${relativeArtifactPath}`;
    packet.machineReplay.artifact.sha256 = digest;
    packet.machineReplay.artifact.environment = payload.environment;
    writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`);

    const result = runAudit(fixturesDir, true);
    expect(result.status).toBe(1);
    expect((result.summary.errors as string[]).join('\n')).toContain(
      'package hashes and behavioral results are not cryptographically bound',
    );
  });

  it('changes the behavior binding when either results or tarball bytes change', () => {
    const tarballs = Object.fromEntries(
      candidatePackageWave.map((name) => [
        name,
        { file: `${name.replace('@decantr/', 'decantr-')}-3.9.2.tgz`, sha256: sha256(name) },
      ]),
    );
    const behavior = { cases: [{ caseId: 'case-a', emitted: true }] };
    const original = createBehaviorEvidenceBinding(tarballs, behavior);
    expect(
      createBehaviorEvidenceBinding(tarballs, {
        cases: [{ caseId: 'case-a', emitted: false }],
      }),
    ).not.toEqual(original);
    const changedTarballs = structuredClone(tarballs);
    changedTarballs['@decantr/cli'].sha256 = '0'.repeat(64);
    expect(createBehaviorEvidenceBinding(changedTarballs, behavior)).not.toEqual(original);
  });

  it('executes validated oracles only when requested and compares exit/output exactly', () => {
    const root = scratch('decantr-oracle-');
    const oracleDir = join(root, 'oracle');
    const oraclePath = join(oracleDir, 'run.mjs');
    const capturePath = join(oracleDir, 'captured.bin');
    const markerPath = join(root, 'executed.txt');
    const output = Buffer.from([0x6f, 0x72, 0x61, 0x63, 0x6c, 0x65, 0x00, 0x0a]);
    mkdirSync(oracleDir, { recursive: true });
    writeFileSync(
      oraclePath,
      `import { writeFileSync } from 'node:fs';\nwriteFileSync(${JSON.stringify(markerPath)}, 'yes');\nprocess.stdout.write(Buffer.from(${JSON.stringify([...output])}));\nprocess.exitCode = 7;\n`,
    );
    writeFileSync(capturePath, output);
    const sourceEvidence = {
      kind: 'executable-oracle',
      workingDirectory: 'oracle',
      command: ['node', 'run.mjs'],
      expectedExitCode: 7,
      oraclePath: 'oracle/run.mjs',
      oracleSha256: sha256(readFileSync(oraclePath)),
      capturedOutputPath: 'oracle/captured.bin',
      capturedOutputSha256: sha256(readFileSync(capturePath)),
    };

    expect(
      validateExecutableOracleEvidence({ repoRoot: root, sourceEvidence, execute: false }),
    ).toMatchObject({ valid: true, executed: false, errors: [] });
    expect(existsSync(markerPath)).toBe(false);

    const badArgv = validateExecutableOracleEvidence({
      repoRoot: root,
      sourceEvidence: { ...sourceEvidence, command: ['node', 'run.mjs', '--extra'] },
      execute: false,
    });
    expect(badArgv.valid).toBe(false);
    expect(existsSync(markerPath)).toBe(false);

    expect(
      validateExecutableOracleEvidence({ repoRoot: root, sourceEvidence, execute: true }),
    ).toMatchObject({ valid: true, executed: true, errors: [] });
    expect(readFileSync(markerPath, 'utf8')).toBe('yes');

    const wrongExit = validateExecutableOracleEvidence({
      repoRoot: root,
      sourceEvidence: { ...sourceEvidence, expectedExitCode: 0 },
      execute: true,
    });
    expect(wrongExit.valid).toBe(false);
    expect(wrongExit.errors.join('\n')).toContain('did not match expected 0');

    writeFileSync(capturePath, Buffer.from('different'));
    const wrongOutput = validateExecutableOracleEvidence({
      repoRoot: root,
      sourceEvidence: {
        ...sourceEvidence,
        capturedOutputSha256: sha256(readFileSync(capturePath)),
      },
      execute: true,
    });
    expect(wrongOutput.valid).toBe(false);
    expect(wrongOutput.errors).toContain('stdout does not byte-for-byte match captured output');
  });

  it('rejects reused brownfield targets with wrong identity or dirty state', () => {
    const root = scratch('decantr-reused-target-');
    const repository = 'https://example.test/pinned-target.git';
    writeFileSync(join(root, 'README.md'), 'qualified\n');
    runGit(root, ['init', '--quiet']);
    runGit(root, ['add', 'README.md']);
    runGit(root, [
      '-c',
      'user.name=Qualification Test',
      '-c',
      'user.email=qualification@example.test',
      'commit',
      '--quiet',
      '-m',
      'fixture',
    ]);
    runGit(root, ['remote', 'add', 'origin', repository]);
    const ref = runGit(root, ['rev-parse', 'HEAD']);
    const target = { id: 'fixture', kind: 'brownfield', repository, ref, projectPath: '.' };

    expect(validateBrownfieldTargetIdentity(target, root)).toEqual({
      repository,
      commit: ref,
    });

    runGit(root, ['remote', 'set-url', 'origin', 'https://example.test/wrong.git']);
    expect(() => validateBrownfieldTargetIdentity(target, root)).toThrow('origin mismatch');
    runGit(root, ['remote', 'set-url', 'origin', repository]);

    expect(() =>
      validateBrownfieldTargetIdentity({ ...target, ref: '0'.repeat(40) }, root),
    ).toThrow('HEAD mismatch');

    writeFileSync(join(root, 'README.md'), 'modified\n');
    expect(() => validateBrownfieldTargetIdentity(target, root)).toThrow('not clean');
    writeFileSync(join(root, 'README.md'), 'qualified\n');

    writeFileSync(join(root, 'untracked.txt'), 'untracked\n');
    expect(() => validateBrownfieldTargetIdentity(target, root)).toThrow('not clean');
  });

  it('recomputes generated target identity from current tree bytes', () => {
    const root = scratch('decantr-generated-target-');
    const target = {
      id: 'generated',
      kind: 'greenfield-generator',
      package: '@tanstack/cli',
      version: '0.69.6',
      projectPath: '.',
    };
    writeFileSync(join(root, 'app.tsx'), 'export const value = 1;\n');
    const first = targetSourceRef(target, root);
    writeFileSync(join(root, 'app.tsx'), 'export const value = 2;\n');
    const second = targetSourceRef(target, root);

    expect(first).toMatch(/^npm:@tanstack\/cli@0\.69\.6:tree-sha256:[a-f0-9]{64}$/u);
    expect(second).toMatch(/^npm:@tanstack\/cli@0\.69\.6:tree-sha256:[a-f0-9]{64}$/u);
    expect(second).not.toBe(first);
  });
});
