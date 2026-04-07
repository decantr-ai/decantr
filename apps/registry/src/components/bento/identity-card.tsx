import { BentoCard } from './bento-card';

interface IdentityCardProps {
  type: string;
  namespace: string;
  name: string;
  version: string;
  description?: string | null;
  publishedAt?: string | null;
  ownerName?: string | null;
}

export function IdentityCard({
  type,
  namespace,
  name,
  version,
  description,
  publishedAt,
  ownerName,
}: IdentityCardProps) {
  return (
    <BentoCard span={2} label="Content identity">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="d-annotation font-semibold type-badge-filled"
          data-type={type}
        >
          {type}
        </span>
        <span className="d-annotation">{namespace}</span>
      </div>

      <h1 className="text-2xl font-bold mb-1 text-d-text">{name}</h1>

      <p className="text-xs font-mono text-d-muted mb-3">v{version}</p>

      {description && (
        <p className="text-sm text-d-muted mb-3 max-w-prose">
          {description}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap text-xs text-d-muted">
        {ownerName && <span>{ownerName}</span>}
        {publishedAt && (
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
        )}
      </div>
    </BentoCard>
  );
}
