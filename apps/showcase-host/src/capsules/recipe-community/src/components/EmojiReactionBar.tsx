import { useState } from 'react';
import { reactions as initial } from '../data/mock';

export function EmojiReactionBar() {
  const [rxs, setRxs] = useState(initial.map(r => ({ ...r, active: false })));
  const toggle = (i: number) => {
    setRxs(prev => prev.map((r, idx) =>
      idx === i ? { ...r, active: !r.active, count: r.active ? r.count - 1 : r.count + 1 } : r
    ));
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {rxs.map((r, i) => (
        <button key={r.label} className="reaction-pill" data-active={r.active}
          onClick={() => toggle(i)} aria-label={`React ${r.label}`} type="button">
          <span style={{ fontSize: '1rem' }}>{r.emoji}</span>
          <span style={{ fontFamily: 'system-ui, sans-serif', fontWeight: 500 }}>{r.count}</span>
        </button>
      ))}
    </div>
  );
}
