/**
 * Starter template essence: SaaS Dashboard
 * Terroir: saas-dashboard | Style: command-center | Mode: dark | Shape: sharp
 */
export function essenceJson() {
  return JSON.stringify({
    "version": "1.0.0",
    "terroir": "saas-dashboard",
    "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
    "character": ["tactical", "data-dense"],
    "vessel": { "type": "spa", "routing": "hash" },
    "structure": [
      { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" },
      { "id": "settings", "skeleton": "sidebar-main", "blend": [{ "pattern": "form-sections", "preset": "settings", "as": "settings-form" }], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" }
    ],
    "tannins": ["auth"],
    "cork": { "enforce_style": true, "enforce_recipe": true }
  }, null, 2);
}
