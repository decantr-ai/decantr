#!/usr/bin/env node

/**
 * Admin CLI — review queue, user management, stats.
 *
 * Usage:
 *   node scripts/admin.js review list
 *   node scripts/admin.js review approve <id>
 *   node scripts/admin.js review reject <id> [--notes "reason"]
 *   node scripts/admin.js user ban <login>
 *   node scripts/admin.js user unban <login>
 *   node scripts/admin.js user list
 *   node scripts/admin.js content remove <type>/<id>
 *   node scripts/admin.js stats
 */

import { initDb, getDb, closeDb } from '../src/db/index.js';

initDb();
const db = getDb();

const [,, command, subcommand, ...args] = process.argv;

function die(msg) {
  console.error(`Error: ${msg}`);
  process.exit(1);
}

// ── Review commands ──────────────────────────────────────────────

function reviewList() {
  const rows = db.prepare(`
    SELECT rq.id, c.type, c.content_id, rq.version, rq.status, rq.created_at,
           u.login as author
    FROM review_queue rq
    JOIN content c ON c.id = rq.content_id
    JOIN users u ON u.id = c.author_id
    WHERE rq.status = 'pending'
    ORDER BY rq.created_at ASC
  `).all();

  if (rows.length === 0) {
    console.log('No pending reviews.');
    return;
  }

  console.log(`\n  Pending Reviews (${rows.length}):\n`);
  for (const r of rows) {
    console.log(`  [${r.id}] ${r.type}/${r.content_id}@${r.version} by ${r.author} (${r.created_at})`);
  }
  console.log();
}

function reviewApprove(id) {
  if (!id) die('Usage: review approve <id>');
  const result = db.prepare(`
    UPDATE review_queue SET status = 'approved', reviewed_at = datetime('now')
    WHERE id = ? AND status = 'pending'
  `).run(id);
  if (result.changes === 0) die(`Review ${id} not found or already processed`);
  console.log(`Approved review ${id}`);
}

function reviewReject(id) {
  if (!id) die('Usage: review reject <id>');
  const notesIdx = args.indexOf('--notes');
  const notes = notesIdx >= 0 ? args[notesIdx + 1] : '';
  const result = db.prepare(`
    UPDATE review_queue SET status = 'rejected', reviewed_at = datetime('now'), notes = ?
    WHERE id = ? AND status = 'pending'
  `).run(notes, id);
  if (result.changes === 0) die(`Review ${id} not found or already processed`);
  console.log(`Rejected review ${id}`);
}

// ── User commands ────────────────────────────────────────────────

function userBan(login) {
  if (!login) die('Usage: user ban <login>');
  const result = db.prepare("UPDATE users SET role = 'banned', updated_at = datetime('now') WHERE login = ?").run(login);
  if (result.changes === 0) die(`User ${login} not found`);
  // Revoke all tokens
  db.prepare(`
    UPDATE auth_tokens SET revoked_at = datetime('now')
    WHERE user_id = (SELECT id FROM users WHERE login = ?) AND revoked_at IS NULL
  `).run(login);
  console.log(`Banned user ${login} and revoked all tokens`);
}

function userUnban(login) {
  if (!login) die('Usage: user unban <login>');
  const result = db.prepare("UPDATE users SET role = 'publisher', updated_at = datetime('now') WHERE login = ? AND role = 'banned'").run(login);
  if (result.changes === 0) die(`User ${login} not found or not banned`);
  console.log(`Unbanned user ${login}`);
}

function userList() {
  const rows = db.prepare('SELECT login, role, github_id, created_at FROM users ORDER BY created_at DESC').all();
  console.log(`\n  Users (${rows.length}):\n`);
  for (const u of rows) {
    console.log(`  ${u.login} [${u.role}] (GitHub #${u.github_id}, joined ${u.created_at})`);
  }
  console.log();
}

// ── Content commands ─────────────────────────────────────────────

function contentRemove(spec) {
  if (!spec || !spec.includes('/')) die('Usage: content remove <type>/<id>');
  const [type, id] = spec.split('/');
  const result = db.prepare(`
    UPDATE content SET status = 'removed', updated_at = datetime('now')
    WHERE type = ? AND content_id = ?
  `).run(type, id);
  if (result.changes === 0) die(`Content ${spec} not found`);
  console.log(`Removed ${spec}`);
}

// ── Stats ────────────────────────────────────────────────────────

function stats() {
  const contentCount = db.prepare('SELECT COUNT(*) as n FROM content WHERE status = ?').get('active').n;
  const userCount = db.prepare('SELECT COUNT(*) as n FROM users').get().n;
  const downloadCount = db.prepare('SELECT COUNT(*) as n FROM download_log').get().n;
  const pendingReviews = db.prepare("SELECT COUNT(*) as n FROM review_queue WHERE status = 'pending'").get().n;

  const byType = db.prepare(`
    SELECT type, COUNT(*) as n FROM content WHERE status = 'active' GROUP BY type ORDER BY n DESC
  `).all();

  const topDownloads = db.prepare(`
    SELECT type, content_id, downloads FROM content WHERE status = 'active' ORDER BY downloads DESC LIMIT 10
  `).all();

  console.log(`\n  Registry Stats\n`);
  console.log(`  Content:   ${contentCount} active packages`);
  console.log(`  Users:     ${userCount}`);
  console.log(`  Downloads: ${downloadCount} total`);
  console.log(`  Reviews:   ${pendingReviews} pending\n`);

  if (byType.length) {
    console.log('  By Type:');
    for (const t of byType) console.log(`    ${t.type}: ${t.n}`);
    console.log();
  }

  if (topDownloads.length) {
    console.log('  Top Downloads:');
    for (const t of topDownloads) console.log(`    ${t.type}/${t.content_id}: ${t.downloads}`);
    console.log();
  }
}

// ── Dispatch ─────────────────────────────────────────────────────

switch (command) {
  case 'review':
    switch (subcommand) {
      case 'list': reviewList(); break;
      case 'approve': reviewApprove(args[0]); break;
      case 'reject': reviewReject(args[0]); break;
      default: die('Usage: review <list|approve|reject>');
    }
    break;
  case 'user':
    switch (subcommand) {
      case 'ban': userBan(args[0]); break;
      case 'unban': userUnban(args[0]); break;
      case 'list': userList(); break;
      default: die('Usage: user <ban|unban|list>');
    }
    break;
  case 'content':
    switch (subcommand) {
      case 'remove': contentRemove(args[0]); break;
      default: die('Usage: content <remove>');
    }
    break;
  case 'stats':
    stats();
    break;
  default:
    console.log(`
  Decantr Registry Admin CLI

  Commands:
    review list                  List pending reviews
    review approve <id>          Approve a review
    review reject <id>           Reject a review
    user ban <login>             Ban a user
    user unban <login>           Unban a user
    user list                    List all users
    content remove <type>/<id>   Remove content
    stats                        Show registry statistics
`);
}

closeDb();
