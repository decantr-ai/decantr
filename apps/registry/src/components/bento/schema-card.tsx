'use client';

import { useState } from 'react';
import { BentoCard } from './bento-card';
import { JsonViewer } from '@/components/json-viewer';

interface SchemaCardProps {
  data: unknown;
  title: string;
}

export function SchemaCard({ data, title }: SchemaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <BentoCard span="full" label="Source schema">
      <div className="flex items-center justify-between mb-2">
        <p className="d-label">Source</p>
        <button
          className="d-interactive text-xs px-3 py-1"
          data-variant="ghost"
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points={expanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'} />
          </svg>
          <span>{expanded ? 'Hide Source' : 'View Source'}</span>
        </button>
      </div>

      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: expanded ? '80vh' : 0 }}
      >
        {expanded && <JsonViewer data={data} title={title} />}
      </div>
    </BentoCard>
  );
}
