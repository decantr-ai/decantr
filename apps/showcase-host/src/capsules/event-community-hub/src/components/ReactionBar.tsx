import { useState } from 'react';
import { css } from '@decantr/css';

export function ReactionBar({ reactions }: { reactions: { emoji: string; count: number }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const [counts, setCounts] = useState(reactions);

  const toggle = (emoji: string) => {
    if (active === emoji) {
      setActive(null);
      setCounts((c) => c.map((r) => r.emoji === emoji ? { ...r, count: r.count - 1 } : r));
    } else {
      setCounts((c) =>
        active
          ? c.map((r) => r.emoji === active ? { ...r, count: r.count - 1 } : r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
          : c.map((r) => r.emoji === emoji ? { ...r, count: r.count + 1 } : r)
      );
      setActive(emoji);
    }
  };

  return (
    <div className={css('_flex _aic _gap2')} style={{ flexWrap: 'wrap' }}>
      {counts.map((r) => (
        <button
          key={r.emoji}
          type="button"
          className="reaction-pill"
          data-active={active === r.emoji ? 'true' : undefined}
          onClick={() => toggle(r.emoji)}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </button>
      ))}
    </div>
  );
}
