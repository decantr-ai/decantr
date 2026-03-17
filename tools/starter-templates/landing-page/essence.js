/**
 * Starter template essence: Landing Page
 * Terroir: portfolio (landing variant) | Style: auradecantism | Mode: dark | Shape: rounded
 */
export function essenceJson() {
  return JSON.stringify({
    "version": "1.0.0",
    "terroir": "portfolio",
    "vintage": { "style": "auradecantism", "mode": "dark", "recipe": null, "shape": "rounded" },
    "character": ["bold", "energetic"],
    "vessel": { "type": "spa", "routing": "hash" },
    "structure": [
      { "id": "home", "skeleton": "full-bleed", "blend": ["hero", { "pattern": "card-grid", "preset": "icon", "as": "features" }, { "pattern": "form-sections", "preset": "creation", "as": "signup-form" }], "surface": "_flex _col _gap0" }
    ],
    "tannins": [],
    "cork": { "enforce_style": true }
  }, null, 2);
}
