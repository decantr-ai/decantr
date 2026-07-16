import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';

export const THREE_NINE_QUALIFICATION_PACKET_PATH =
  'fixtures/qualification/3.9/qualification-packet.json';
export const THREE_NINE_MISSING_EVIDENCE_PATH =
  'fixtures/qualification/3.9/missing-evidence.json';
export const THREE_NINE_RELEASE_WAIVER_PATH =
  'fixtures/qualification/3.9/release-waiver.json';
export const THREE_NINE_SOLE_MAINTAINER_MODE = 'sole-maintainer-unqualified';
export const THREE_NINE_QUALIFIED_MODE = 'human-qualified';

export const THREE_NINE_WAIVED_REQUIREMENTS = [
  'HUMAN_REVIEW_IDENTITIES',
  'HUMAN_ADJUDICATED_FINDING_CORPUS',
  'PUBLIC_383_FINDING_REPLAY',
  'CANDIDATE_390_FINDING_REPLAY',
];

export const THREE_NINE_MACHINE_PACKAGES = [
  '@decantr/content',
  '@decantr/registry',
  '@decantr/core',
  '@decantr/verifier',
  '@decantr/mcp-server',
  '@decantr/cli',
];

function isRecord(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function equalArrays(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validateTarballs(packet, errors) {
  const tarballs = packet?.machineReplay?.artifact?.environment?.exactPackageTarballs;
  if (!isRecord(tarballs)) {
    errors.push('The 3.9 packet does not retain exact machine-package tarball identities.');
    return {};
  }

  const observedNames = Object.keys(tarballs).sort();
  const expectedNames = [...THREE_NINE_MACHINE_PACKAGES].sort();
  if (!equalArrays(observedNames, expectedNames)) {
    errors.push('The 3.9 machine tarball set is not the exact six-package release wave.');
  }

  for (const [name, artifact] of Object.entries(tarballs)) {
    if (
      !isRecord(artifact)
      || typeof artifact.file !== 'string'
      || artifact.file !== basename(artifact.file)
      || !artifact.file.endsWith('.tgz')
      || !/^[a-f0-9]{64}$/u.test(artifact.sha256 ?? '')
    ) {
      errors.push(`Release-evidence tarball identity for ${name} is malformed.`);
    }
  }
  return tarballs;
}

export function evaluateThreeNineReleasePolicy({ packet, missingEvidence, waiver }) {
  const errors = [];
  const exactPackageTarballs = validateTarballs(packet, errors);

  for (const field of ['routeCorpus', 'routeReplay', 'adoptionBoundaryReplay', 'machineReplay']) {
    if (packet?.[field]?.status !== 'complete') {
      errors.push(`The 3.9 packet requires complete ${field} evidence.`);
    }
  }

  if (packet?.packetStatus === 'complete' && packet?.qualificationClaim === true) {
    const declaredMissing = (missingEvidence?.items ?? []).map((item) => item.id);
    if (declaredMissing.length > 0) {
      errors.push('A human-qualified packet cannot retain declared missing evidence.');
    }
    return {
      errors,
      mode: THREE_NINE_QUALIFIED_MODE,
      qualificationClaim: true,
      packageEvidenceStatus: 'qualified',
      waiverPath: null,
      exactPackageTarballs,
    };
  }

  if (packet?.packetStatus !== 'incomplete' || packet?.qualificationClaim !== false) {
    errors.push('An unqualified 3.9 release must retain an incomplete, non-claiming packet.');
  }

  const declaredMissing = (missingEvidence?.items ?? []).map((item) => item.id);
  if (!equalArrays(declaredMissing, THREE_NINE_WAIVED_REQUIREMENTS)) {
    errors.push('The sole-maintainer waiver may cover only the four frozen human finding requirements.');
  }
  if ((missingEvidence?.items ?? []).some((item) => item.state !== 'missing')) {
    errors.push('Every waived qualification requirement must remain explicitly marked missing.');
  }

  if (!isRecord(waiver)) {
    errors.push('The 3.9 sole-maintainer release waiver is missing.');
  } else {
    if (waiver.schemaVersion !== 'decantr-3.9-release-waiver.v1') {
      errors.push('The 3.9 release waiver schema version is invalid.');
    }
    if (waiver.releaseVersion !== '3.9.0' || waiver.status !== 'authorized') {
      errors.push('The release waiver must authorize only stable 3.9.0.');
    }
    if (waiver.mode !== THREE_NINE_SOLE_MAINTAINER_MODE) {
      errors.push('The release waiver mode must be sole-maintainer-unqualified.');
    }
    if (
      waiver.authorizedBy?.name !== 'David Aimi'
      || waiver.authorizedBy?.github !== 'david-aimi'
      || waiver.authorizedBy?.role !== 'sole-maintainer'
    ) {
      errors.push('The release waiver must identify the Decantr sole maintainer.');
    }
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/u.test(waiver.authorizedAt ?? '')) {
      errors.push('The release waiver requires a canonical UTC authorization timestamp.');
    }
    if (!equalArrays(waiver.acceptedMissingEvidence, THREE_NINE_WAIVED_REQUIREMENTS)) {
      errors.push('The release waiver accepted-missing list is not the exact frozen set.');
    }
    const claims = waiver.claims ?? {};
    if (
      claims.releaseQualification !== false
      || claims.humanFindingPrecision !== false
      || claims.humanFindingRecall !== false
      || claims.adoptionProven !== false
    ) {
      errors.push('The sole-maintainer waiver must explicitly prohibit qualification and adoption-proof claims.');
    }
    if (typeof waiver.rationale !== 'string' || waiver.rationale.trim().length < 40) {
      errors.push('The release waiver requires a substantive rationale.');
    }
  }

  return {
    errors,
    mode: THREE_NINE_SOLE_MAINTAINER_MODE,
    qualificationClaim: false,
    packageEvidenceStatus: 'machine-qualified-human-waived',
    waiverPath: THREE_NINE_RELEASE_WAIVER_PATH,
    exactPackageTarballs,
  };
}

function readOptionalJson(root, relativePath) {
  try {
    return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
  } catch {
    return null;
  }
}

export function readThreeNineReleasePolicy(root) {
  const packet = readOptionalJson(root, THREE_NINE_QUALIFICATION_PACKET_PATH);
  if (!packet) {
    return {
      errors: ['The 3.9 qualification packet is missing or invalid JSON.'],
      mode: null,
      qualificationClaim: false,
      packageEvidenceStatus: null,
      waiverPath: null,
      exactPackageTarballs: {},
    };
  }
  return evaluateThreeNineReleasePolicy({
    packet,
    missingEvidence: readOptionalJson(root, THREE_NINE_MISSING_EVIDENCE_PATH),
    waiver: readOptionalJson(root, THREE_NINE_RELEASE_WAIVER_PATH),
  });
}

