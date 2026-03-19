-- Decantr Registry — Full DDL

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  github_id     TEXT    NOT NULL UNIQUE,
  login         TEXT    NOT NULL,
  email         TEXT,
  avatar_url    TEXT,
  role          TEXT    NOT NULL DEFAULT 'publisher'
                        CHECK (role IN ('publisher', 'admin', 'banned')),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- ── Auth Tokens ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS auth_tokens (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT    NOT NULL UNIQUE,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  revoked_at    TEXT
);

CREATE INDEX IF NOT EXISTS idx_auth_tokens_hash ON auth_tokens(token_hash);

-- ── Content ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  type            TEXT    NOT NULL CHECK (type IN ('style', 'recipe', 'pattern', 'archetype', 'plugin', 'template')),
  content_id      TEXT    NOT NULL,
  name            TEXT    NOT NULL,
  description     TEXT    NOT NULL DEFAULT '',
  tags            TEXT    NOT NULL DEFAULT '[]',
  ai_summary      TEXT    NOT NULL DEFAULT '',
  latest_version  TEXT    NOT NULL,
  author_id       INTEGER NOT NULL REFERENCES users(id),
  downloads       INTEGER NOT NULL DEFAULT 0,
  status          TEXT    NOT NULL DEFAULT 'active'
                          CHECK (status IN ('active', 'removed', 'pending_review')),
  metadata        TEXT    NOT NULL DEFAULT '{}',
  created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(type, content_id)
);

CREATE INDEX IF NOT EXISTS idx_content_type ON content(type);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);

-- ── Content Versions ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_versions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id    INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  version       TEXT    NOT NULL,
  artifact      TEXT    NOT NULL,
  checksum      TEXT    NOT NULL,
  size          INTEGER NOT NULL,
  published_by  INTEGER NOT NULL REFERENCES users(id),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(content_id, version)
);

-- ── FTS5 Search Index ──────────────────────────────────────────
CREATE VIRTUAL TABLE IF NOT EXISTS content_fts USING fts5(
  content_id,
  name,
  description,
  tags,
  ai_summary,
  content='content',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS content_ai AFTER INSERT ON content BEGIN
  INSERT INTO content_fts(rowid, content_id, name, description, tags, ai_summary)
  VALUES (new.id, new.content_id, new.name, new.description, new.tags, new.ai_summary);
END;

CREATE TRIGGER IF NOT EXISTS content_au AFTER UPDATE ON content BEGIN
  INSERT INTO content_fts(content_fts, rowid, content_id, name, description, tags, ai_summary)
  VALUES ('delete', old.id, old.content_id, old.name, old.description, old.tags, old.ai_summary);
  INSERT INTO content_fts(rowid, content_id, name, description, tags, ai_summary)
  VALUES (new.id, new.content_id, new.name, new.description, new.tags, new.ai_summary);
END;

CREATE TRIGGER IF NOT EXISTS content_ad AFTER DELETE ON content BEGIN
  INSERT INTO content_fts(content_fts, rowid, content_id, name, description, tags, ai_summary)
  VALUES ('delete', old.id, old.content_id, old.name, old.description, old.tags, old.ai_summary);
END;

-- ── Download Log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS download_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id    INTEGER NOT NULL REFERENCES content(id),
  ip            TEXT,
  user_agent    TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_download_log_content ON download_log(content_id);

-- ── Review Queue ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS review_queue (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  content_id    INTEGER NOT NULL REFERENCES content(id),
  version       TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by   INTEGER REFERENCES users(id),
  notes         TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  reviewed_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
