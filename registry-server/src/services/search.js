/**
 * FTS5 search query builder — translates user queries into
 * SQLite FTS5 MATCH expressions with filtering and sorting.
 */

/**
 * Build and execute a search query.
 * @param {Database.Database} db
 * @param {Object} params
 * @param {string} params.q - Search query
 * @param {string} [params.type] - Filter by type
 * @param {string} [params.character] - Filter by character trait
 * @param {string} [params.terroir] - Filter by terroir affinity
 * @param {string} [params.style] - Filter by style
 * @param {string} [params.sort] - Sort: relevance|downloads|newest
 * @param {number} [params.page] - Page number (1-based)
 * @param {number} [params.limit] - Results per page
 * @returns {{results: Object[], total: number, page: number}}
 */
export function searchContent(db, params) {
  const {
    q = '',
    type,
    character,
    terroir,
    style,
    sort = 'relevance',
    page = 1,
    limit = 20,
  } = params;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const whereClauses = ['c.status = ?'];
  const bindParams = ['active'];

  // FTS match
  let usesFts = false;
  if (q && q.trim()) {
    // Sanitize: strip special FTS5 chars, add prefix matching
    const sanitized = q.trim().replace(/['"*^~(){}[\]]/g, '');
    if (sanitized) {
      whereClauses.push('c.id IN (SELECT rowid FROM content_fts WHERE content_fts MATCH ?)');
      // Add prefix matching with *
      bindParams.push(sanitized.split(/\s+/).map(w => `${w}*`).join(' '));
      usesFts = true;
    }
  }

  if (type) {
    whereClauses.push('c.type = ?');
    bindParams.push(type);
  }

  if (character) {
    whereClauses.push("JSON_EXTRACT(c.metadata, '$.character') LIKE ?");
    bindParams.push(`%${character}%`);
  }

  if (terroir) {
    whereClauses.push("JSON_EXTRACT(c.metadata, '$.terroir_affinity') LIKE ?");
    bindParams.push(`%${terroir}%`);
  }

  if (style) {
    whereClauses.push("JSON_EXTRACT(c.metadata, '$.style') LIKE ?");
    bindParams.push(`%${style}%`);
  }

  const where = whereClauses.join(' AND ');

  // Sort
  let orderBy;
  switch (sort) {
    case 'downloads': orderBy = 'c.downloads DESC'; break;
    case 'newest': orderBy = 'c.created_at DESC'; break;
    case 'relevance':
    default:
      orderBy = usesFts
        ? 'rank'  // FTS5 built-in ranking
        : 'c.downloads DESC';
      break;
  }

  // Count total
  const countSql = `SELECT COUNT(*) as total FROM content c WHERE ${where}`;
  const { total } = db.prepare(countSql).get(...bindParams);

  // Fetch results
  let selectSql;
  if (usesFts) {
    selectSql = `
      SELECT c.type, c.content_id as id, c.name, c.latest_version as version,
             c.description, c.tags, c.ai_summary, c.downloads, c.metadata,
             c.created_at
      FROM content c
      LEFT JOIN content_fts fts ON fts.rowid = c.id
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
  } else {
    selectSql = `
      SELECT c.type, c.content_id as id, c.name, c.latest_version as version,
             c.description, c.tags, c.ai_summary, c.downloads, c.metadata,
             c.created_at
      FROM content c
      WHERE ${where}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
  }

  const rows = db.prepare(selectSql).all(...bindParams, limitNum, offset);

  const results = rows.map(row => ({
    type: row.type,
    id: row.id,
    name: row.name,
    version: row.version,
    description: row.description,
    tags: JSON.parse(row.tags || '[]'),
    ai_summary: row.ai_summary,
    downloads: row.downloads,
    metadata: JSON.parse(row.metadata || '{}'),
  }));

  return { results, total, page: pageNum };
}
