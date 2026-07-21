const RETAINED_PUBLIC_IDENTITY = 'retained-public-identity';
const REGISTRY_INTEGRITY = 'registry-integrity';

export function resolveArtifactVerificationMode({
  packageVersion,
  publishStatus,
  releaseVersion,
}) {
  if (publishStatus === 'published' || packageVersion === releaseVersion) {
    if (publishStatus !== 'published' && publishStatus !== 'already-published') {
      throw new Error(`Unsupported release publish status: ${publishStatus ?? 'missing'}.`);
    }
    return RETAINED_PUBLIC_IDENTITY;
  }
  if (publishStatus === 'already-published') return REGISTRY_INTEGRITY;
  throw new Error(`Unsupported release publish status: ${publishStatus ?? 'missing'}.`);
}

export const artifactVerificationModes = Object.freeze({
  registryIntegrity: REGISTRY_INTEGRITY,
  retainedPublicIdentity: RETAINED_PUBLIC_IDENTITY,
});
