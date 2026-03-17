/**
 * Starter template essence: E-commerce
 * Terroir: ecommerce | Style: clean | Mode: light | Shape: rounded
 */
export function essenceJson() {
  return JSON.stringify({
    "version": "1.0.0",
    "terroir": "ecommerce",
    "vintage": { "style": "clean", "mode": "light", "recipe": null, "shape": "rounded" },
    "character": ["commercial", "inviting"],
    "vessel": { "type": "spa", "routing": "hash" },
    "structure": [
      { "id": "catalog", "skeleton": "top-nav-main", "blend": [{ "pattern": "card-grid", "preset": "product", "as": "product-grid" }], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" },
      { "id": "cart", "skeleton": "top-nav-main", "blend": [], "surface": "_flex _col _gap6 _p6 _overflow[auto] _flex1" }
    ],
    "tannins": ["auth", "payments"],
    "cork": { "enforce_style": true }
  }, null, 2);
}
