interface ComposeItem {
  archetype: string;
  role?: string;
}

interface Props {
  routes?: Record<string, unknown>;
  sections?: (string | ComposeItem)[];
}

function groupRoutes(
  routes: Record<string, unknown>,
  sections?: (string | ComposeItem)[]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};

  for (const [path, value] of Object.entries(routes)) {
    const section =
      typeof value === 'object' && value !== null && 'section' in value
        ? (value as { section: string }).section
        : 'other';

    if (!grouped[section]) grouped[section] = [];
    grouped[section].push(path);
  }

  // If sections are provided, include any sections without routes
  if (sections) {
    for (const s of sections) {
      const name = typeof s === 'string' ? s : s.archetype;
      if (!grouped[name]) grouped[name] = [];
    }
  }

  return grouped;
}

export function RoutesCard({ routes, sections }: Props) {
  if (!routes || Object.keys(routes).length === 0) return null;

  const grouped = groupRoutes(routes, sections);

  return (
    <div
      className="lum-bento-card flex flex-col gap-3"
      role="region"
      aria-label="Routes"
    >
      <h3 className="d-label accent-left-border">
        Routes
        <span className="d-annotation ml-2">{Object.keys(routes).length}</span>
      </h3>
      <div className="flex flex-col gap-3">
        {Object.entries(grouped).map(([section, paths]) => (
          <div key={section} className="flex flex-col gap-1">
            <span className="d-label accent-left-border flex items-center gap-2">
              {section}
              <span className="d-annotation">{paths.length}</span>
            </span>
            {paths.map((path) => (
              <span
                key={path}
                className="text-xs font-mono text-d-muted pl-3"
              >
                {path}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
