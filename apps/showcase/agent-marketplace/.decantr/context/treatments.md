# Visual Treatments: carbon-neon

## Base Treatments

d-interactive, d-surface, d-data, d-control, d-section, d-annotation — see DECANTR.md for usage.

## Theme Decorators (carbon-neon-specific)

| Class | Use for |
|-------|---------|
| carbon-card | Surface background, subtle border, 8px radius, hover shadow transition |
| carbon-code | Monospace font, surface-raised background, subtle 3px left border accent in primary color |
| carbon-glass | Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border |
| carbon-input | Soft border with gentle focus ring using primary blue |
| carbon-canvas | Background color using theme background token |
| carbon-divider | Hairline separator using border-color token |
| carbon-skeleton | Loading placeholder with subtle pulse animation for skeleton states |
| carbon-bubble-ai | Left-aligned message bubble with surface background for AI responses |
| carbon-fade-slide | Entrance animation: opacity 0 to 1, translateY 12px to 0, 200ms ease-out |
| carbon-bubble-user | Right-aligned message bubble with primary-tinted background for user messages |

## Composition

Atoms + treatment + theme decorator:
```tsx
css('_flex _col _gap4') + ' d-surface'
```

Atoms use `css()` function. Treatments and theme decorators are plain class strings.