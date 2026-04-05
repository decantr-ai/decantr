import { Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';

export function AIBadge({ children = 'AI' }: { children?: ReactNode }) {
  return (
    <span className="crm-ai-badge">
      <Sparkles size={9} style={{ marginRight: 2 }} />
      {children}
    </span>
  );
}
