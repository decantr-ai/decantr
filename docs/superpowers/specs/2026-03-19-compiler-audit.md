# Compiler Audit Results

**Generated:** 2026-03-20T01:43:24.680Z

## Summary

| Metric | Count |
|--------|-------|
| Total Projects | 13 |
| Passing | 0 |
| Failing | 13 |

### Failure Breakdown

| Type | Count | Description |
|------|-------|-------------|
| Pre-existing | 3 | Fails on old builder too |
| Compiler | 0 | New compiler regression |
| Syntax | 0 | Output has syntax errors |
| Runtime | 10 | Import fails at runtime |

---

## Checklist

### Apps

- [ ] `docs` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/docs/dist/main.614de5a8.js:3
- [ ] `playground` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/playground/dist/main.f558df10.js:3
- [ ] `workbench` — **PRE-EXISTING**
  - Error: ebar.js

### Showcase

- [ ] `showcase/cloud-platform` — **PRE-EXISTING**
  - Error: /app.js
- [ ] `showcase/ecommerce-admin` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/showcase/ecommerce-admin/dist/main.cee671da.js:3
- [ ] `showcase/gaming-platform` — **PRE-EXISTING**
  - Error: /app.js
- [ ] `showcase/portfolio` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/showcase/portfolio/dist/main.0d81d467.js:3
- [ ] `showcase/saas-dashboard` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/showcase/saas-dashboard/dist/main.40706676.js:3

### Test Fixtures

- [ ] `test/e2e-scaffold/fixtures/base-projects/content-site` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/test/e2e-scaffold/fixtures/base-projects/content-site/dist/
- [ ] `test/e2e-scaffold/fixtures/base-projects/docs-explorer` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/test/e2e-scaffold/fixtures/base-projects/docs-explorer/dist
- [ ] `test/e2e-scaffold/fixtures/base-projects/ecommerce` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/test/e2e-scaffold/fixtures/base-projects/ecommerce/dist/mai
- [ ] `test/e2e-scaffold/fixtures/base-projects/portfolio` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/test/e2e-scaffold/fixtures/base-projects/portfolio/dist/mai
- [ ] `test/e2e-scaffold/fixtures/base-projects/saas-dashboard` — **RUNTIME**
  - Error: file:///Users/davidaimi/projects/decantr/test/e2e-scaffold/fixtures/base-projects/saas-dashboard/dis

---

## Re-running the Audit

```bash
node tools/compiler-audit.js
```

After fixing issues, re-run to update this checklist.
