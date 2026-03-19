/**
 * Recommendation scoring engine — scores registry content
 * by affinity to a project's terroir, character, and style.
 */

/**
 * Get scored recommendations.
 * @param {Database.Database} db
 * @param {Object} params
 * @param {string} [params.terroir] - Domain archetype
 * @param {string} [params.character] - Comma-separated character traits
 * @param {string} [params.style] - Current style
 * @param {string} [params.existing] - Comma-separated installed content IDs
 * @returns {{recommendations: Object[]}}
 */
export function getRecommendations(db, params) {
  const { terroir, character, style, existing } = params;

  const characterTraits = character
    ? character.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const existingIds = existing
    ? existing.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  // Get all active content
  const rows = db.prepare(`
    SELECT type, content_id as id, name, latest_version as version,
           description, tags, ai_summary, downloads, metadata
    FROM content
    WHERE status = 'active'
  `).all();

  const scored = [];

  for (const row of rows) {
    // Skip already-installed
    if (existingIds.includes(row.id)) continue;

    const meta = JSON.parse(row.metadata || '{}');
    let score = 0;
    const reasons = [];

    // +30: terroir affinity match
    if (terroir && meta.terroir_affinity) {
      const affinities = Array.isArray(meta.terroir_affinity)
        ? meta.terroir_affinity
        : [meta.terroir_affinity];
      if (affinities.includes(terroir)) {
        score += 30;
        reasons.push(`Matches ${terroir} domain`);
      }
    }

    // +20 per character trait match (up to 3)
    if (characterTraits.length && meta.character) {
      const contentChars = Array.isArray(meta.character)
        ? meta.character
        : [meta.character];
      let matches = 0;
      for (const trait of characterTraits) {
        if (contentChars.includes(trait) && matches < 3) {
          score += 20;
          matches++;
          reasons.push(`Matches "${trait}" character`);
        }
      }
    }

    // +25: style compatibility
    if (style && meta.style) {
      const styles = Array.isArray(meta.style) ? meta.style : [meta.style];
      if (styles.includes(style)) {
        score += 25;
        reasons.push(`Compatible with ${style} style`);
      }
    }

    // +15 max: download popularity (log2 scale)
    if (row.downloads > 0) {
      const popScore = Math.min(15, Math.floor(Math.log2(row.downloads + 1) * 3));
      score += popScore;
      if (popScore > 5) reasons.push('Popular in community');
    }

    if (score > 0) {
      scored.push({
        type: row.type,
        id: row.id,
        name: row.name,
        version: row.version,
        description: row.description,
        score,
        reason: reasons.join('; '),
      });
    }
  }

  // Sort by score descending, return top 20
  scored.sort((a, b) => b.score - a.score);

  return { recommendations: scored.slice(0, 20) };
}
