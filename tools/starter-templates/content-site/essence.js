/**
 * Starter template essence: Content Site
 * Terroir: content-site | Style: clean | Mode: light | Shape: rounded
 */
export function essenceJson() {
  return JSON.stringify({
    "version": "1.0.0",
    "terroir": "content-site",
    "vintage": { "style": "clean", "mode": "light", "recipe": null, "shape": "rounded" },
    "character": ["editorial", "readable"],
    "vessel": { "type": "spa", "routing": "hash" },
    "structure": [
      { "id": "posts", "skeleton": "top-nav-main", "blend": [{ "pattern": "card-grid", "preset": "content", "as": "post-grid" }], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" },
      { "id": "article", "skeleton": "minimal-header", "blend": [], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" }
    ],
    "tannins": [],
    "cork": { "enforce_style": true }
  }, null, 2);
}
