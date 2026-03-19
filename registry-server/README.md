# Decantr Registry Server

Backend for the Decantr community content registry. Serves search, content delivery, recommendations, and publishing for community styles, patterns, recipes, archetypes, plugins, and templates.

**Production**: https://decantr-registry.fly.dev

## Stack

- **Runtime**: Node.js 22 (ESM)
- **Framework**: [Hono](https://hono.dev) (~14KB)
- **Database**: SQLite via `better-sqlite3` (FTS5 for search)
- **Auth**: GitHub OAuth
- **Hosting**: [Fly.io](https://fly.io)
- **Dependencies**: 3 total (`hono`, `@hono/node-server`, `better-sqlite3`)

## Local Development

### First-time setup

```bash
cd registry-server
npm install
node scripts/dev-setup.js --save-token
```

This creates the local SQLite database (`./data/registry.db`), seeds 37 built-in content entries (styles, patterns, archetypes, recipes), creates a dev user with admin privileges, saves an auth token to `~/.decantr/auth.json` for CLI usage, and generates a `.env` file from `.env.example` with sensible defaults.

### Environment variables

The server loads `.env` automatically on startup (via Node's native `process.loadEnvFile()`). To customize:

```bash
cp .env.example .env   # dev-setup.js does this automatically
# Edit .env as needed
```

GitHub OAuth credentials are **optional** for local development — you only need them if you want to test the real OAuth publish flow.

### Start the server

```bash
npm run dev    # Starts on http://localhost:3000 with --watch
```

### Point the CLI at your local server

In your Decantr project root, add to `.env`:

```bash
echo 'DECANTR_REGISTRY_URL=http://localhost:3000/v1' >> .env
```

Or set `decantr.registry.json` (project-committed alternative):

```json
{
  "version": "1.0.0",
  "registry": "http://localhost:3000/v1",
  "installed": {}
}
```

Now all `decantr registry` commands hit your local server:

```bash
decantr registry search glass
decantr registry info style/glassmorphism
decantr registry publish --type=style --file=my-style.js
```

### Test with curl

```bash
# Search
curl 'http://localhost:3000/v1/search?q=glass'

# Get content
curl http://localhost:3000/v1/content/style/glassmorphism

# Recommendations
curl 'http://localhost:3000/v1/recommend?terroir=saas-dashboard'

# Publish (use the token from dev-setup.js)
curl -X POST http://localhost:3000/v1/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-dev-token>" \
  -d '{"type":"style","id":"my-test","version":"1.0.0","artifact":{"content":"export const myTest = { id: \"my-test\", name: \"My Test\", seed: { hue: 200 } };","checksum":"sha256:..."}}'

# Health
curl http://localhost:3000/health
```

### Reset local database

Delete `./data/registry.db` and re-run `node scripts/dev-setup.js --save-token`.

## Testing

```bash
npm test    # Runs all tests (node --test)
```

Tests use in-memory SQLite (`:memory:`) — no file database needed. 46 tests across 14 suites covering all routes and services.

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | No | Health check |
| `GET` | `/v1/search?q=&type=&character=&terroir=&style=&sort=&page=&limit=` | No | Full-text search |
| `GET` | `/v1/content/:type/:id` | No | Get latest version |
| `GET` | `/v1/content/:type/:id/version/:version` | No | Get specific version |
| `GET` | `/v1/recommend?terroir=&character=&style=&existing=` | No | Content recommendations |
| `POST` | `/v1/publish` | Yes | Publish an artifact |
| `GET` | `/auth/github?callback=...` | No | Start GitHub OAuth |
| `GET` | `/auth/github/callback` | No | OAuth callback |
| `GET` | `/schemas/manifest.v1.json` | No | JSON Schema |

### Rate Limits

| Endpoint Group | Limit |
|---------------|-------|
| Search | 100/min |
| Recommend | 60/min |
| Content | 200/min |
| Publish | 10/hour |

## Admin CLI

```bash
node scripts/admin.js stats                    # Registry statistics
node scripts/admin.js review list              # Pending reviews
node scripts/admin.js review approve <id>      # Approve
node scripts/admin.js review reject <id>       # Reject
node scripts/admin.js user list                # All users
node scripts/admin.js user ban <login>         # Ban user
node scripts/admin.js user unban <login>       # Unban user
node scripts/admin.js content remove type/id   # Remove content
```

## Deployment

### Fly.io

The server is deployed on Fly.io with a persistent volume for SQLite.

```bash
flyctl deploy --app decantr-registry
```

### Environment Variables

| Variable | Purpose |
|----------|---------|
| `GITHUB_CLIENT_ID` | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret |
| `STATE_SECRET` | HMAC key for OAuth state signing |
| `BASE_URL` | Public URL (e.g. `https://decantr-registry.fly.dev`) |
| `DB_PATH` | SQLite path (`/data/registry.db` on Fly) |
| `ADMIN_GITHUB_IDS` | Comma-separated GitHub user IDs for auto-admin |
| `PORT` | Server port (default: 3000 local, 8080 on Fly) |

### Backups

Manual:
```bash
node scripts/backup.js [output-dir]
```

Automated: `.github/workflows/backup.yml` runs daily, uploads SQLite snapshot as GitHub Actions artifact (30-day retention).

## Project Structure

```
src/
  index.js              # Hono app + middleware wiring
  config.js             # Environment configuration
  db/
    schema.sql          # Full DDL (7 tables + FTS5 + triggers)
    index.js            # Connection + migration runner
    migrations/         # Incremental SQL migrations
  routes/
    health.js           # GET /health
    search.js           # GET /v1/search
    content.js          # GET /v1/content/:type/:id
    publish.js          # POST /v1/publish
    recommend.js        # GET /v1/recommend
    auth.js             # GitHub OAuth flow
    schemas.js          # GET /schemas/manifest.v1.json
  middleware/
    auth.js             # Bearer token → user lookup
    rate-limit.js       # IP-based sliding window
    cors.js             # CORS headers
    error-handler.js    # Global 500 handler
  services/
    validator.js        # Artifact validation (ported from framework)
    checksum.js         # SHA-256 computation
    search.js           # FTS5 query builder
    recommend.js        # Scoring algorithm
    github-oauth.js     # Token exchange + user fetch
scripts/
  dev-setup.js          # Local dev: seed data + create auth token
  import-builtins.js    # Production seed script
  admin.js              # Admin CLI
  backup.js             # Manual backup
test/
  helpers.js            # Test app factory with in-memory SQLite
  routes/*.test.js      # Integration tests
  services/*.test.js    # Unit tests
schemas/
  manifest.v1.json      # JSON Schema for decantr.registry.json
```
