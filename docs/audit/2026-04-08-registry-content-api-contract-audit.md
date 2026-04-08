# Registry / Content / API Contract Audit

Date: 2026-04-08
Status: Draft
Scope: `decantr-content`, `apps/api`, registry contract expectations, and related package implications

## 1. Objective

This audit focuses on the contract connecting:

- curated source content in `decantr-content`
- hosted registry ingestion in `apps/api`
- public and private registry behavior
- downstream consumption by CLI, MCP, portal, and future compiler surfaces

The goal is to define what already works, what is drifting, and what must be normalized before the vNext compiler and verification programs begin.

## 2. Current Contract Flow

### 2.1 Official content path

1. Content lives in `decantr-content`
2. GitHub Actions validates JSON on push to `main`
3. `scripts/sync-to-registry.js` POSTs content to `/v1/admin/sync`
4. `apps/api` upserts official content into the hosted registry
5. portal, API clients, CLI, and MCP consume the hosted or bundled registry surface

### 2.2 Community content path

1. authenticated users publish through `apps/api`
2. content lands in the same backing content system with moderation and visibility controls
3. trusted users publish immediately; other users enter moderation flow
4. version history is stored for published content updates

## 3. What Already Works Well

### 3.1 Official content source separation

The official curated content is already separated into its own repository. This is a healthy boundary and should be preserved.

### 3.2 Official sync and community publish are distinct workflows

The API already distinguishes between:

- admin-key-only sync for official content
- authenticated community publishing and moderation

That is the correct product shape.

### 3.3 The API is already thinking in platform terms

The API is not just a static content host. It already includes:

- moderation queue
- user reputation and trust
- content visibility
- content version history
- org-facing and billing-adjacent foundations

This is a solid base for commercial registry behavior.

## 4. Contract Gaps and Drift

### 4.1 Taxonomy drift: `recipe`

Current mismatch:

- `decantr-content` README still documents `recipes/`
- API runtime `ContentType` only accepts `pattern`, `theme`, `blueprint`, `archetype`, and `shell`
- the content table migration still allows `recipe`

Impact:
- source-of-truth ambiguity
- migration and sync confusion
- unclear future home for visual-treatment metadata

Decision required:
- either restore `recipe` as a first-class type with a clear purpose
- or formally retire it and fold its surviving semantics into themes / treatments / pattern metadata

### 4.2 No single canonical machine-readable contract document

The contract is currently spread across:

- content repo README and conventions
- API runtime types
- database migration constraints
- route handlers
- package assumptions

Impact:
- hard to change safely
- hard to verify cross-surface consistency
- difficult to support compiler-grade guarantees

Required vNext action:
- define one canonical content contract spec that every surface derives from

### 4.3 Content envelope is under-specified for vNext needs

Current content objects already carry useful fields such as `id`, `version`, `decantr_compat`, and type-specific payloads. However, the vNext platform will need a richer envelope for:

- provenance
- verification status
- compatibility matrix
- target coverage
- quality scoring
- benchmark confidence
- golden-reference eligibility

These are not yet first-class parts of the contract.

### 4.4 Official sync and community publish share storage shape without an explicit contract split

This is good from an operational simplicity standpoint, but it risks muddying expectations unless the system explicitly models:

- source provenance
- trust level
- review state
- official versus community quality guarantees

vNext should keep the shared platform, but formalize the distinction.

### 4.5 Compiler-oriented data requirements are not yet clearly modeled

The future contract compiler will need consistent data for:

- target-aware code examples
- anti-patterns
- import/setup requirements
- preset-aware examples
- shell and route execution guidance
- success checks and token budgets

Some of this exists informally in content payloads today, but not yet as a locked, versioned contract.

## 5. vNext Contract Decisions

### 5.1 Create one canonical content contract

Introduce a versioned contract spec that defines:

- supported content types
- shared envelope fields
- type-specific payload extensions
- provenance and visibility semantics
- compatibility and quality metadata
- official sync expectations
- community publish expectations

### 5.2 Split contract layers clearly

The platform should explicitly distinguish:

- source contract: content repo and authoring rules
- ingestion contract: API sync and validation rules
- storage contract: database representation and moderation fields
- consumption contract: what CLI, MCP, portal, and compiler can rely on

### 5.3 Resolve `recipe` decisively

Do not carry the current ambiguity forward.

Options:

1. Reinstate `recipe` as a strict first-class type with a modern semantic definition.
2. Retire `recipe`, migrate data and docs, and collapse the concept into themes / treatments / pattern guidance.

The decision should be made during Phase 1 of the reset.

### 5.4 Add quality and confidence metadata

The registry should eventually know, per content item:

- verification status
- target support
- showcase / golden usage
- benchmark quality score
- confidence level
- last verified date

This is essential if Decantr is going to be more than a content bucket.

## 6. Recommended vNext Deliverables

### 6.1 Contract spec

Create a dedicated spec for the registry content contract covering:

- envelope
- taxonomy
- provenance
- sync and publish invariants
- required metadata for compiler and verification systems

### 6.2 Contract test suite

Add tests that fail if the following drift apart:

- `decantr-content` conventions
- API runtime `ContentType`
- database constraints
- portal assumptions
- CLI / MCP package assumptions

### 6.3 Migration and cleanup pass

After the taxonomy decision:

- update `decantr-content` docs
- update API types
- update DB constraints and migrations
- update portal filters and package expectations
- remove legacy terms from public docs

## 7. Exit Criteria

This audit is considered resolved when:

- content taxonomy is unambiguous
- a canonical contract spec exists
- official and community provenance are explicit
- quality and compatibility metadata have an agreed shape
- all consuming surfaces derive from the same contract assumptions
