# Decantr Roadmap

## Phase 1: Compiler Foundation (Current)

Build a rock-solid compiler with IR-based architecture. See [compiler redesign spec](docs/superpowers/specs/2026-03-19-compiler-redesign.md).

- [ ] Home-grown JavaScript tokenizer
- [ ] Module-aware parser (imports/exports/scope)
- [ ] Module Graph IR
- [ ] Transform pipeline (tree-shake, dead code, chunks)
- [ ] Optimizer (mangle, constant fold)
- [ ] Emitter with async IIFE support
- [ ] Validator (syntax check before write)
- [ ] Error reporter with source locations
- [ ] Dev server integration

## Phase 2: Pipeline Commands

CLI commands for automation and registry integration.

- [ ] `decantr pull pattern:<name>` — Pull patterns from registry
- [ ] `decantr pull recipe:<name>` — Pull recipes from registry
- [ ] `decantr scaffold <archetype>` — Scaffold from archetype template
- [ ] `decantr deploy <target>` — Deploy to cloud providers (AWS, Vercel, Netlify, GitHub Pages)
- [ ] `decantr registry publish` — Publish to registry
- [ ] `decantr registry sync` — Sync with remote registry

## Phase 3: Self-Hosted Registries

Organizations can run private Decantr ecosystems.

- [ ] Registry server package
- [ ] Access control and authentication
- [ ] Sync with central registry
- [ ] Private patterns, recipes, archetypes
- [ ] Enterprise licensing

## Phase 4: cloud.decantr.ai

Hosted platform with paid features.

- [ ] API access (metered billing)
- [ ] Premium enterprise registries
- [ ] Premium configs and styles
- [ ] Hosted builds and deployments
- [ ] Team collaboration features
- [ ] Analytics dashboard

---

## AI Platform Monetization

Future investment opportunities building on the Decantation Process:

### Hosted Decantation API
POST an `essence.json`, get back a zip of generated code. Charge per generation.
- Wraps the existing `decantr generate` engine as a hosted service
- Metered billing per project generation
- API key management and rate limiting

### Essence Marketplace
Pre-built essences for common SaaS verticals (CRM, ERP, HRIS, LMS).
- Community-contributed, Decantr-curated
- Version-pinned to framework releases
- Searchable by archetype, style, tannins

### Context Optimization Service
LLM-optimized context serving via MCP.
- Charge per API call for task-specific profiles
- Custom profile generation for enterprise archetypes
- Token usage analytics and optimization recommendations

### Enterprise Decantr Cloud
Managed build pipeline, CDN deployment, analytics, team collaboration.
- Git-integrated deployment pipeline
- Shared essence editing with role-based access
- Real-time preview environments
- Built-in analytics dashboard (using Decantr's own components)

### AI Audit Service
Automated code quality, accessibility, and performance auditing of generated code.
- Extends `decantr audit` and `decantr a11y` as a hosted service
- Continuous monitoring with webhook notifications
- Compliance reporting (WCAG AA, GDPR, SOC 2)

**Why:** These represent the day-2 vision of monetizing the Decantation Process. The framework is the moat; these services are the business model.


