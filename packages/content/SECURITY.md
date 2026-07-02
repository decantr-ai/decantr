# Security Policy

## Reporting a vulnerability

If you discover a security issue in this repository, the publishing pipeline, or the content it serves, please report it privately to:

**security@decantr.ai**

Please do not open a public GitHub issue for security reports.

## What to include

When you can, include:

- A description of the issue and its impact
- Steps to reproduce, or a proof of concept
- The affected files, scripts, workflows, or registry endpoints
- Any suggested mitigations

## What to expect

- We aim to acknowledge new reports within 3 business days.
- We will investigate, confirm, and work with you on a fix and a disclosure timeline.
- We will credit you in the fix release notes if you would like.

## Scope

In scope:

- Content in this repository (`patterns/`, `themes/`, `blueprints/`, `archetypes/`, `shells/`, `schemas/`)
- Scripts in `scripts/` and the validator (`validate.js`)
- GitHub Actions workflows in `.github/workflows/`
- Issues that allow unauthorized writes to the live `@official` registry

Out of scope:

- Vulnerabilities in third-party dependencies that are already publicly disclosed (please report those upstream)
- Issues in the `decantr-monorepo` API or runtime — please report those to the same address but reference the relevant repo
- Spam, denial-of-service, or social engineering reports without a concrete technical issue
