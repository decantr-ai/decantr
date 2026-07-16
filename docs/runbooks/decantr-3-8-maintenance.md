# Decantr 3.8 Maintenance Policy

Decantr 3.8 is in maintenance mode. Its shipped product boundary is content-first AI Frontend Governance with the official `@decantr/content` corpus, local contract/context/evidence workflows, the stable eight-tool MCP surface, and compatibility names for former registry workflows.

## Allowed Patch Work

- Correct behavior that contradicts the documented 3.8 contract.
- Fix security, privacy, permission, or dependency vulnerabilities.
- Restore compatibility with supported host frameworks or package managers.
- Correct documentation, package metadata, release automation, or hosted content API drift.
- Improve tests and audits needed to prove a permitted patch without expanding behavior.

## Not Allowed In 3.8.x

- New public packages, schemas, CLI modes, hosted product surfaces, or MCP tools.
- Registry marketplace, community publishing, account, organization, billing, or hosted source-upload features.
- Making `@decantr/css` a default or expanding it beyond legacy optional compatibility.
- Breaking removal of `@decantr/registry`, `decantr registry ...`, or MCP `decantr_registry` compatibility names.
- Broad refactors whose user value depends on unreleased 3.9 behavior.

## Patch Gate

Every patch must:

1. Name the shipped contract or regression it corrects.
2. Add focused automated coverage at the owning layer.
3. Build and pack every affected public package.
4. Run package, docs, permission, and release-surface audits.
5. Run the relevant external adoption lane from `post-publish-adoption-proof.md` against packed artifacts.
6. Repeat public package verification and adoption proof after npm publication.

Discovery or task-context changes must prove that source provenance is correct in scan, graph, and task output. Permission or network changes must update `config/package-permissions.json` and its generated reference.

Publishing, tagging, GitHub Release creation, announcement dispatch, and infrastructure changes still require explicit release authorization. A merged patch is not a completed release until the release closeout audit passes.
