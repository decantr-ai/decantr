# Decantr 3.11.1: MCP Metadata Compatibility

Decantr 3.11.1 is a metadata-only patch for `@decantr/mcp-server`. It includes the corrected MCP directory descriptor in the immutable npm tarball and closes the only known packaging drift from 3.11.0.

## Fixed

- Shortened the `server.json` description to the official MCP Registry limit of 100 characters.
- Added a regression assertion for that external metadata constraint.
- Kept `server.json`, the stdio runtime version, Smithery configuration, and npm package version aligned at 3.11.1.
- Isolated release-tooling fixtures from tag-workflow environment variables so protected patch releases remain deterministic.

## Compatibility

The MCP server identity remains `io.github.decantr-ai/mcp-server`, transport remains stdio, and the public surface remains exactly eight tools. There are no runtime, tool-envelope, schema, permission, or application-data changes.

`@decantr/cli` and `@decantr/verifier` remain at 3.11.0. All foundation and compatibility package versions are unchanged.

## Upgrade

```bash
npx @decantr/mcp-server@3.11.1
```
