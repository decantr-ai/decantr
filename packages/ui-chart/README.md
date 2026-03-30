# @decantr/ui-chart

Decantr Chart Library - SVG, Canvas, and WebGPU chart renderers.

## Chart Types

- **Bar** - Vertical and horizontal bar charts, stacked and grouped variants
- **Line** - Line charts with area fill options, multi-series support
- **Pie** - Pie and donut charts with label positioning
- **Scatter** - Scatter plots with bubble size variants
- **Sankey** - Flow diagrams showing relationships between nodes
- **Treemap** - Hierarchical data visualization with nested rectangles
- **Heatmap** - Color-coded matrix visualization
- **Radar** - Multi-axis radial charts for comparing dimensions

## Renderers

The library supports three rendering backends:

- **SVG** - Default renderer. Best for accessibility, interactivity, and smaller datasets. Outputs semantic markup with ARIA attributes.
- **Canvas** - High-performance 2D rendering. Ideal for large datasets (10k+ points) and smooth animations.
- **WebGPU** - GPU-accelerated rendering. Best for massive datasets (100k+ points) and real-time streaming data.

## Installation

```bash
pnpm add @decantr/ui-chart
```

## Peer Dependencies

- `@decantr/ui` - Required. Provides the rendering runtime.
- `@decantr/css` - Required. Provides theming and layout utilities.

## Basic Usage

```js
import { VERSION } from '@decantr/ui-chart';

console.log(`@decantr/ui-chart v${VERSION}`);
```

## License

MIT
