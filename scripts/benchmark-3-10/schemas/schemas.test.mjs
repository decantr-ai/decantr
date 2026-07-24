import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));

test('all benchmark schemas are parseable Draft 2020-12 documents with unique identifiers', async () => {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.schema.json')).sort();
  for (const required of [
    'evaluator-qualification-task-receipt.schema.json',
    'prequalification-task.schema.json',
    'prepared-environment.schema.json',
    'review-assignments.schema.json',
    'runtime-matrix.schema.json',
    'runtime-profile-attestation.schema.json',
    'task-manifest.schema.json',
    'qualification-task-index.schema.json',
    'run-plan.schema.json',
    'run-record.schema.json',
  ]) {
    assert.equal(files.includes(required), true, `missing required schema: ${required}`);
  }
  const identifiers = new Set();
  for (const file of files) {
    const schema = JSON.parse(await readFile(join(directory, file), 'utf8'));
    assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.match(schema.$id, /^https:\/\/decantr\.ai\/schemas\/benchmark-3-10\//u);
    assert.equal(identifiers.has(schema.$id), false, `${file} has a duplicate $id`);
    identifiers.add(schema.$id);
    assert.equal(schema.type, 'object');
    assert.equal(schema.additionalProperties, false);
    assert.ok(Array.isArray(schema.required) && schema.required.length > 0);
  }
});

test('external schema references resolve from $id base URIs to valid JSON Pointer targets', async () => {
  const files = (await readdir(directory)).filter((file) => file.endsWith('.schema.json')).sort();
  const schemas = await Promise.all(
    files.map(async (file) => ({
      file,
      schema: JSON.parse(await readFile(join(directory, file), 'utf8')),
    })),
  );
  const schemasById = new Map(schemas.map(({ schema }) => [documentUri(schema.$id), schema]));
  let externalReferences = 0;

  for (const { file, schema } of schemas) {
    for (const { baseUri, reference } of collectSchemaReferences(schema, schema.$id)) {
      const target = new URL(reference, baseUri);
      const fragment = decodeURIComponent(target.hash.slice(1));
      target.hash = '';
      if (target.href === documentUri(baseUri)) continue;
      externalReferences += 1;
      const targetSchema = schemasById.get(target.href);
      assert.ok(targetSchema, `${file} has an unresolved schema document reference: ${reference}`);
      assert.notEqual(
        resolveJsonPointer(targetSchema, fragment),
        undefined,
        `${file} has an unresolved schema fragment: ${reference}`,
      );
    }
  }

  assert.ok(externalReferences >= 1);
  const authoring = schemas.find(({ file }) => file === 'evaluator-authoring-spec.schema.json').schema;
  const contract = schemas.find(({ file }) => file === 'evaluator-contract.schema.json').schema;
  const commandReference = new URL(authoring.properties.commands.items.$ref, authoring.$id);
  assert.equal(documentUri(commandReference.href), documentUri(contract.$id));
  assert.equal(decodeURIComponent(commandReference.hash.slice(1)), '/$defs/command');
});

function collectSchemaReferences(value, inheritedBaseUri, output = []) {
  if (!value || typeof value !== 'object') return output;
  const baseUri = typeof value.$id === 'string' ? new URL(value.$id, inheritedBaseUri).href : inheritedBaseUri;
  if (typeof value.$ref === 'string') output.push({ baseUri, reference: value.$ref });
  for (const child of Array.isArray(value) ? value : Object.values(value)) {
    collectSchemaReferences(child, baseUri, output);
  }
  return output;
}

function resolveJsonPointer(document, fragment) {
  if (fragment === '') return document;
  if (!fragment.startsWith('/')) return undefined;
  let value = document;
  for (const encoded of fragment.slice(1).split('/')) {
    const key = encoded.replaceAll('~1', '/').replaceAll('~0', '~');
    if (!value || typeof value !== 'object' || !Object.hasOwn(value, key)) return undefined;
    value = value[key];
  }
  return value;
}

function documentUri(identifier) {
  const value = new URL(identifier);
  value.hash = '';
  return value.href;
}

test('review and statistics schemas freeze task/model preference aggregation and claim policy', async () => {
  const assignments = JSON.parse(
    await readFile(join(directory, 'review-assignments.schema.json'), 'utf8'),
  );
  const assignmentRequired = assignments.properties.assignments.items.required;
  assert.equal(assignmentRequired.includes('preferenceUnitId'), true);
  assert.equal(assignments.properties.assignments.minItems, 64);
  assert.equal(assignments.properties.assignments.maxItems, 64);

  const statistics = JSON.parse(
    await readFile(join(directory, 'statistics.schema.json'), 'utf8'),
  );
  assert.equal(statistics.$defs.blindPreference.properties.plannedUnits.const, 32);
  assert.equal(statistics.$defs.blindPreference.properties.minimumDecisiveUnits.const, 26);
  assert.equal(statistics.$defs.blindPreference.properties.pointEstimateMinimum.const, 0.6);
  assert.equal(
    statistics.$defs.blindPreference.properties.wilsonLowerBoundMustExceed.const,
    0.5,
  );
  assert.equal(
    statistics.properties.claimAuthorization.properties.mixedValueClaim.const,
    'no-value-claim',
  );
});

test('runtime schemas require retained GitHub-hosted OIDC provenance and full source closures', async () => {
  const attestation = JSON.parse(
    await readFile(join(directory, 'runtime-profile-attestation.schema.json'), 'utf8'),
  );
  const matrix = JSON.parse(
    await readFile(join(directory, 'runtime-matrix.schema.json'), 'utf8'),
  );
  assert.equal(
    attestation.properties.schemaVersion.const,
    'decantr-benchmark-runtime-profile-attestation.v3',
  );
  assert.equal(
    attestation.$defs.executionIdentity.properties.runnerEnvironment.const,
    'github-hosted',
  );
  assert.equal(
    attestation.$defs.provenancePolicy.properties.denySelfHostedRunners.const,
    true,
  );
  assert.deepEqual(
    attestation.properties.provenance.required,
    ['policy', 'subjectFile', 'bundleFile', 'verificationFile', 'verificationSha256'],
  );
  assert.equal(
    attestation.$defs.sourceClosure.properties.policy.const,
    'exact-clean-git-files-v1',
  );
  assert.equal(
    attestation.$defs.benchmarkImage.properties.reference.pattern.includes(
      'ghcr\\.io/decantr-ai/decantr-benchmark-3-10',
    ),
    true,
  );
  assert.equal(
    attestation.$defs.benchmarkImage.properties.reference.pattern.endsWith(
      '@sha256:[a-f0-9]{64}$',
    ),
    true,
  );
  assert.equal(
    matrix.$defs.profile.properties.benchmarkImage.properties.reference.pattern.includes(
      '(?:@sha256:[a-f0-9]{64})?',
    ),
    true,
  );
  assert.equal(
    matrix.$defs.profile.properties.agentImage.properties.reference.pattern.includes(
      'decantr-benchmark-3-10-agent',
    ),
    true,
  );
  assert.equal(matrix.properties.provenance.required.includes('executionPolicy'), true);
  assert.equal(
    matrix.$defs.runtimeAttestation.$ref,
    'runtime-profile-attestation.v3.json',
  );
});
