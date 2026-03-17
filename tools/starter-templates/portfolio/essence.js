/**
 * Starter template essence: Portfolio
 * Terroir: portfolio | Style: glassmorphism | Mode: dark | Shape: rounded
 */
export function essenceJson() {
  return JSON.stringify({
    "version": "1.0.0",
    "terroir": "portfolio",
    "vintage": { "style": "glassmorphism", "mode": "dark", "recipe": null, "shape": "rounded" },
    "character": ["creative", "minimal"],
    "vessel": { "type": "spa", "routing": "hash" },
    "structure": [
      { "id": "home", "skeleton": "full-bleed", "blend": ["hero", { "pattern": "card-grid", "preset": "content", "as": "work-grid" }], "surface": "_flex _col _gap0" },
      { "id": "about", "skeleton": "full-bleed", "blend": [{ "pattern": "detail-header", "preset": "profile", "as": "bio" }], "surface": "_flex _col _gap8 _p8 _overflow[auto] _flex1" }
    ],
    "tannins": [],
    "cork": { "enforce_style": true }
  }, null, 2);
}
