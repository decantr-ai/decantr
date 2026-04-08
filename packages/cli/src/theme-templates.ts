export function getThemeSkeleton(id: string, name: string): object {
  return {
    $schema: 'https://decantr.ai/schemas/style-metadata.v1.json',
    id,
    name,
    description: '',
    tags: [],
    seed: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      accent: '#EC4899',
      background: '#0F172A'
    },
    palette: {},
    modes: ['dark'],
    shapes: ['rounded'],
    decantr_compat: '>=1.0.0',
    source: 'custom'
  };
}

export function getHowToThemeDoc(): string {
  return `# Custom Themes

Create custom themes for your Decantr project.

## Quick Start

\`\`\`bash
decantr theme create mytheme
\`\`\`

## Theme Structure

| Field | Required | Description |
|-------|----------|-------------|
| id | Yes | Unique identifier (matches filename) |
| name | Yes | Display name |
| description | No | Brief description |
| tags | No | Searchable tags |
| seed | Yes | Core colors: primary, secondary, accent, background |
| palette | No | Extended color palette |
| modes | Yes | Supported modes: ["light"], ["dark"], or both |
| shapes | Yes | Supported shapes: sharp, rounded, pill |
| decantr_compat | Yes | Version compatibility (e.g., ">=1.0.0") |
| source | Yes | Must be "custom" |

## Using Your Theme

In \`decantr.essence.json\`:

\`\`\`json
{
  "theme": {
    "id": "custom:mytheme",
    "mode": "dark"
  }
}
\`\`\`

## Validation

\`\`\`bash
decantr theme validate mytheme
\`\`\`

## Reference

See registry themes for examples:

\`\`\`bash
decantr get theme auradecantism
\`\`\`
`;
}
