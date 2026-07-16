export const ADOPTION_TRUTH_V1_SCHEMA_URL = 'https://decantr.ai/schemas/adoption-truth.v1.json';

export type AdoptionObservationState = 'found' | 'not_found' | 'unknown' | 'unsupported';
export type AdoptionGovernanceState =
  | 'governed'
  | 'partial'
  | 'advisory'
  | 'uncovered'
  | 'not_applicable';
export type AdoptionMutationState =
  | 'created'
  | 'updated'
  | 'untouched'
  | 'not_checked'
  | 'not_applicable';
export type AdoptionTruthConfidence = 'low' | 'medium' | 'high';

export interface AdoptionTruthProvenanceV1 {
  kind:
    | 'source'
    | 'contract'
    | 'package_manifest'
    | 'assistant_rule'
    | 'generated_artifact'
    | 'receipt'
    | 'inference';
  path: string | null;
  detail: string;
}

export interface AdoptionObservationAxisV1 {
  state: AdoptionObservationState;
  confidence: AdoptionTruthConfidence;
  provenance: AdoptionTruthProvenanceV1[];
}

export interface AdoptionGovernanceAxisV1 {
  state: AdoptionGovernanceState;
  authority: string | null;
  provenance: AdoptionTruthProvenanceV1[];
}

export interface AdoptionMutationAxisV1 {
  state: AdoptionMutationState;
  receiptIds: string[];
}

export interface AdoptionTruthFactV1 {
  id: string;
  subject: string;
  observation: AdoptionObservationAxisV1;
  governance: AdoptionGovernanceAxisV1;
  mutation: AdoptionMutationAxisV1;
  limitations: string[];
  nextAction: string;
}

export interface AdoptionMutationReceiptV1 {
  id: string;
  operation: string;
  subjects: string[];
  outcome: 'created' | 'updated' | 'untouched';
  complete: boolean;
  createdPaths: string[];
  updatedPaths: string[];
  deletedPaths: string[];
  evidencePaths: string[];
  limitations: string[];
}

export interface AdoptionTruthV1 {
  $schema: typeof ADOPTION_TRUTH_V1_SCHEMA_URL;
  schemaVersion: 1;
  generatedAt: string;
  project: {
    workspaceRoot: string;
    selectedAppRoot: string;
    selectionReason: string;
  };
  facts: AdoptionTruthFactV1[];
  mutationReceipts: AdoptionMutationReceiptV1[];
  limitations: string[];
  nextAction: string;
}

export type AdoptionTruthV1Input = Omit<AdoptionTruthV1, '$schema' | 'schemaVersion'>;

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function byId<T extends { id: string }>(left: T, right: T): number {
  return compareText(left.id, right.id);
}

function normalizeWorkspaceRelativePath(value: string, field: string): string {
  const normalized = value
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/\/{2,}/g, '/');
  const candidate = normalized || '.';
  const isAbsolute = candidate.startsWith('/') || /^[A-Za-z]:\//.test(candidate);
  const escapesWorkspace = candidate.split('/').includes('..');
  if (isAbsolute || escapesWorkspace) {
    throw new Error(`${field} must be workspace-relative: ${value}`);
  }
  return candidate;
}

function normalizePaths(paths: string[], field: string): string[] {
  return [...new Set(paths.map((path) => normalizeWorkspaceRelativePath(path, field)))].sort();
}

function normalizeProvenance(
  provenance: AdoptionTruthProvenanceV1[],
  factId: string,
): AdoptionTruthProvenanceV1[] {
  return provenance
    .map((entry) => ({
      ...entry,
      path:
        entry.path === null
          ? null
          : normalizeWorkspaceRelativePath(entry.path, `Fact ${factId} provenance path`),
    }))
    .sort(
      (left, right) =>
        compareText(left.kind, right.kind) ||
        compareText(left.path ?? '', right.path ?? '') ||
        compareText(left.detail, right.detail),
    );
}

/** Builds normalized adoption truth while preserving the independence of all three axes. */
export function createAdoptionTruthV1(input: AdoptionTruthV1Input): AdoptionTruthV1 {
  const receipts = [...input.mutationReceipts]
    .map((receipt) => ({
      ...receipt,
      subjects: [...new Set(receipt.subjects)].sort(),
      createdPaths: normalizePaths(receipt.createdPaths, `Receipt ${receipt.id} created path`),
      updatedPaths: normalizePaths(receipt.updatedPaths, `Receipt ${receipt.id} updated path`),
      deletedPaths: normalizePaths(receipt.deletedPaths, `Receipt ${receipt.id} deleted path`),
      evidencePaths: normalizePaths(receipt.evidencePaths, `Receipt ${receipt.id} evidence path`),
      limitations: [...new Set(receipt.limitations)].sort(),
    }))
    .sort(byId);
  const receiptById = new Map(receipts.map((receipt) => [receipt.id, receipt]));

  const facts = [...input.facts]
    .map((fact) => {
      const receiptIds = [...new Set(fact.mutation.receiptIds)].sort();
      for (const receiptId of receiptIds) {
        if (!receiptById.has(receiptId)) {
          throw new Error(
            `Adoption truth fact ${fact.id} references unknown receipt ${receiptId}.`,
          );
        }
      }

      if (['created', 'updated', 'untouched'].includes(fact.mutation.state)) {
        const provesMutation = receiptIds.some((receiptId) => {
          const receipt = receiptById.get(receiptId);
          return (
            receipt?.complete === true &&
            receipt.outcome === fact.mutation.state &&
            receipt.subjects.includes(fact.subject)
          );
        });
        if (!provesMutation) {
          throw new Error(
            `Adoption truth fact ${fact.id} cannot claim ${fact.mutation.state} without a complete matching receipt; use not_checked when no receipt exists.`,
          );
        }
      }
      if (fact.mutation.state === 'not_applicable' && receiptIds.length > 0) {
        throw new Error(
          `Adoption truth fact ${fact.id} is not_applicable and cannot reference receipts.`,
        );
      }
      if (fact.observation.confidence === 'low' && fact.limitations.length === 0) {
        throw new Error(`Low-confidence adoption truth fact ${fact.id} must include a limitation.`);
      }

      return {
        ...fact,
        observation: {
          ...fact.observation,
          provenance: normalizeProvenance(fact.observation.provenance, fact.id),
        },
        governance: {
          ...fact.governance,
          provenance: normalizeProvenance(fact.governance.provenance, fact.id),
        },
        mutation: { ...fact.mutation, receiptIds },
        limitations: [...new Set(fact.limitations)].sort(),
      };
    })
    .sort(byId);

  return {
    $schema: ADOPTION_TRUTH_V1_SCHEMA_URL,
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    project: {
      workspaceRoot: normalizeWorkspaceRelativePath(input.project.workspaceRoot, 'workspaceRoot'),
      selectedAppRoot: normalizeWorkspaceRelativePath(
        input.project.selectedAppRoot,
        'selectedAppRoot',
      ),
      selectionReason: input.project.selectionReason,
    },
    facts,
    mutationReceipts: receipts,
    limitations: [...new Set(input.limitations)].sort(),
    nextAction: input.nextAction,
  };
}
