# Decantr MCP 3.11.4: Dependency Security Maintenance

This scoped patch updates the bundled MCP SDK, Zod, and fast-uri in
`@decantr/mcp-server`. It corrects bundled third-party notices and keeps the
existing stdio transport, server identity, eight tools, and report contracts.
The CLI and verifier remain at 3.11.3; CSS and foundation packages are unchanged.

The published 3.11.3 MCP package bundles these components rather than installing
them as separate runtime dependencies. Updating a consumer's dependency lockfile
cannot replace that bundled code; consumers must install the new MCP package.
The audit found no demonstrated remotely exploitable path through Decantr's
stdio-only transport. The update does not establish that all resource-exhaustion
scenarios are eliminated.

The companion repository change updates vulnerable workspace dependencies,
preserves failed release-audit reports, and enforces the API's request-body size
limit for streams. The API change requires its own deployment.

Validation includes the package's clean-consumer initialization and eight-tool
check, workspace security audit, and deterministic regression suites. Release
completion also requires protected tag-bound publication and closeout checks.
No broad adoption, finding precision, or comparative model-improvement claim
follows from this patch.
