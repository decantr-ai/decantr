interface ComposeItem {
  archetype: string;
  role?: string;
  description?: string;
}

interface Props {
  compose?: (string | ComposeItem)[];
}

function normalizeCompose(compose: (string | ComposeItem)[]): ComposeItem[] {
  return compose.map((item) => {
    if (typeof item === 'string') {
      return { archetype: item, role: 'primary' };
    }
    return item;
  });
}

export function ComposeCard({ compose }: Props) {
  if (!compose || compose.length === 0) return null;

  const items = normalizeCompose(compose);

  return (
    <div
      className="lum-bento-card col-span-2 flex flex-col gap-3"
      role="region"
      aria-label="Blueprint composition"
    >
      <h3 className="d-label accent-left-border">Composition</h3>
      <div className="flex flex-col divide-y divide-d-border">
        {items.map((item) => (
          <div key={item.archetype} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
            <span
              className="role-badge d-annotation"
              data-role={item.role || 'primary'}
            >
              {item.role || 'primary'}
            </span>
            <span className="font-medium text-sm text-d-text">{item.archetype}</span>
            {item.description && (
              <span className="text-xs text-d-muted truncate flex-1">
                {item.description}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
