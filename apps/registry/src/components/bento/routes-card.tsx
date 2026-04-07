import { BentoCard } from './bento-card';

interface RoutesCardProps {
  routes?: Record<string, unknown>;
  sections?: Array<{ id: string; pages?: Array<{ path?: string }> }>;
}

export function RoutesCard({ routes, sections }: RoutesCardProps) {
  /* Try to group routes by section from the compose/sections data */
  if (sections && sections.length > 0) {
    return (
      <BentoCard span={1} label="Routes">
        <p className="d-label mb-3">Routes</p>
        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <div key={section.id}>
              <p className="d-label accent-left-border mb-1">
                {section.id}
                <span className="d-annotation ml-2 text-[0.625rem]">
                  {section.pages?.length || 0}
                </span>
              </p>
              {section.pages?.map((page, i) => (
                <p key={i} className="text-xs font-mono text-d-muted pl-3">
                  {page.path || '/'}
                </p>
              ))}
            </div>
          ))}
        </div>
      </BentoCard>
    );
  }

  /* Fallback: render raw route keys */
  if (!routes || Object.keys(routes).length === 0) return null;

  return (
    <BentoCard span={1} label="Routes">
      <p className="d-label mb-3">Routes</p>
      <div className="flex flex-col gap-1">
        {Object.keys(routes).map((route) => (
          <p key={route} className="text-xs font-mono text-d-muted">
            {route}
          </p>
        ))}
      </div>
    </BentoCard>
  );
}
