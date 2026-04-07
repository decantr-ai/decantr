interface Props {
  type: string;
  namespace: string;
  name: string;
  version: string;
  description?: string;
  publishedAt?: string;
  ownerName?: string;
}

export function IdentityCard({
  type,
  namespace,
  name,
  version,
  description,
  publishedAt,
  ownerName,
}: Props) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <div
      className="lum-bento-card col-span-2 flex flex-col gap-3"
      role="region"
      aria-label="Content identity"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="type-badge-filled d-annotation" data-type={type}>
          {type}
        </span>
        <span className="d-annotation">{namespace}</span>
      </div>

      <h1 className="text-2xl font-bold text-d-text">{name}</h1>

      <span className="font-mono text-sm text-d-muted">{version}</span>

      {description && (
        <p className="text-d-muted max-w-[70ch] leading-relaxed">
          {description}
        </p>
      )}

      {(formattedDate || ownerName) && (
        <div className="flex items-center gap-3 text-xs text-d-muted">
          {ownerName && <span>{ownerName}</span>}
          {ownerName && formattedDate && (
            <span className="opacity-40">&#183;</span>
          )}
          {formattedDate && <span>{formattedDate}</span>}
        </div>
      )}
    </div>
  );
}
