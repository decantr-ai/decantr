'use client';

import { useState } from 'react';
import { JsonViewer } from '@/components/json-viewer';

interface Props {
  data: Record<string, unknown>;
  title: string;
}

export function SchemaCard({ data, title }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="lum-bento-card col-span-full flex flex-col gap-3"
      role="region"
      aria-label="Content schema"
    >
      <button
        className="d-interactive w-full justify-center"
        data-variant="ghost"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
        {expanded ? 'Hide Source' : 'View Source'}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div
        className="schema-expand-wrapper overflow-hidden"
        data-expanded={expanded ? 'true' : 'false'}
      >
        {expanded && <JsonViewer data={data} title={title} />}
      </div>
    </div>
  );
}
