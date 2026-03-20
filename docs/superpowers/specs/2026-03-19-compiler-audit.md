# Compiler Audit Results

**Generated:** 2026-03-20T01:42:17.993Z

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
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `playground` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `workbench` — **PRE-EXISTING**
  - Error: ebar.js

### Showcase

- [ ] `showcase/cloud-platform` — **PRE-EXISTING**
  - Error: /app.js
- [ ] `showcase/ecommerce-admin` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `showcase/gaming-platform` — **PRE-EXISTING**
  - Error: /app.js
- [ ] `showcase/portfolio` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `showcase/saas-dashboard` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('

### Test Fixtures

- [ ] `test/e2e-scaffold/fixtures/base-projects/content-site` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `test/e2e-scaffold/fixtures/base-projects/docs-explorer` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `test/e2e-scaffold/fixtures/base-projects/ecommerce` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `test/e2e-scaffold/fixtures/base-projects/portfolio` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('
- [ ] `test/e2e-scaffold/fixtures/base-projects/saas-dashboard` — **RUNTIME**
  - Error: /bin/sh: -c: line 0: syntax error near unexpected token `('

---

## Re-running the Audit

```bash
node tools/compiler-audit.js
```

After fixing issues, re-run to update this checklist.
