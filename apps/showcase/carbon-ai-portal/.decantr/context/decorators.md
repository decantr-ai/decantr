# Recipe Decorators: carbon

## Available Classes

| Decorator | Description |
|-----------|-------------|
| carbon-card | Surface background, subtle border, 8px radius, hover shadow transition. |
| carbon-code | Monospace font, surface-raised background, subtle 3px left border accent in primary color. |
| carbon-glass | Subtle surface elevation with 1px border, no blur. Uses surface background. |
| carbon-input | Soft border with gentle focus ring using primary blue. Border transitions on focus. |
| carbon-canvas | Background color using theme background token. Clean, minimal foundation. |
| carbon-divider | Hairline separator using border-color token. |
| carbon-skeleton | Loading placeholder with subtle pulse animation for skeleton states. |
| carbon-bubble-ai | Left-aligned message bubble with surface background for AI responses. |
| carbon-fade-slide | Entrance animation: opacity 0 to 1, translateY 12px to 0, 200ms ease-out. |
| carbon-bubble-user | Right-aligned message bubble with primary-tinted background for user messages. |

## Usage

Decorators are plain CSS class names from `src/styles/decorators.css`. Combine with atoms:

```tsx
<div className={css('_flex _col _gap4') + ' carbon-card'}>
  <pre className={css('_p3') + ' carbon-code'}>{code}</pre>
</div>
```

Atoms use `css()` function. Decorators are plain class strings. Combined via string concatenation.
