# Decantr 3.5.4 Brownfield Route Normalization

Decantr 3.5.4 is a scoped CLI/verifier patch from the external Brownfield dogfood corpus. It improves route observation for mature React apps and removes one contract-only refresh false positive.

## Changes

- `decantr scan`, `decantr analyze`, and verifier project scan now recognize custom React Router wrapper components with literal `path` props, including JSX expressions such as `path={"/route"}`.
- Optional route groups such as `/(public|contacts|personal)?` expand into taskable routes, and trailing wildcard route literals such as `/bankaccounts*` normalize to their stable route path.
- Catch-all React Router fallbacks such as `/*` are filtered from route inventories instead of becoming task targets.
- Next Pages Router internals such as `_app`, `_document`, and `_error` are no longer exposed as user routes.
- Contract-only Brownfield projects no longer treat existing project-owned `src/styles/global.css` files as stale generated Decantr context during `refresh --check`.

## Dogfood Evidence

The 3.5.3 external corpus pass covered Open SaaS, SaaS Boilerplate, Jira clone, Cypress RealWorld App, and daedalOS. Open SaaS confirmed the 3.5.3 route-spec fix. Cypress RealWorld App exposed the React Router wrapper, optional path group, and wildcard normalization gaps fixed here. daedalOS exposed Next Pages internal route noise. SaaS Boilerplate exposed the contract-only style refresh false positive fixed here.

One honest remaining finding is locale route aliasing: apps that expose taskable routes as `/:locale/dashboard` still do not automatically map a human `decantr task /dashboard ...` request to the locale-prefixed route. That is deliberately left for a later semantic route-alias pass.

## Compatibility

- No Essence schema changes.
- No MCP surface changes.
- No report schema changes.
- No package permission changes.
- No new runtime dependencies.
