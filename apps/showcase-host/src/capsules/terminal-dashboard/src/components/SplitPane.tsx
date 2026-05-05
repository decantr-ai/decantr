import { useState, useCallback, useRef, useEffect } from 'react';

export function SplitPane({
  left,
  right,
  direction = 'horizontal',
  initialRatio = 0.5,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  initialRatio?: number;
}) {
  const [ratio, setRatio] = useState(initialRatio);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const isH = direction === 'horizontal';
      const pos = isH ? e.clientX - rect.left : e.clientY - rect.top;
      const size = isH ? rect.width : rect.height;
      const newRatio = Math.max(0.15, Math.min(0.85, pos / size));
      setRatio(newRatio);
    },
    [direction],
  );

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  useEffect(() => {
    const handler = () => { dragging.current = false; };
    window.addEventListener('pointerup', handler);
    return () => window.removeEventListener('pointerup', handler);
  }, []);

  const isH = direction === 'horizontal';

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: isH ? 'row' : 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
      }}
    >
      <div
        style={{
          [isH ? 'width' : 'height']: `${ratio * 100}%`,
          overflow: 'auto',
          padding: '0.5rem',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {left}
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          [isH ? 'width' : 'height']: '4px',
          background: 'var(--d-border)',
          cursor: isH ? 'col-resize' : 'row-resize',
          flexShrink: 0,
          touchAction: 'none',
        }}
      />
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '0.5rem',
          minHeight: 0,
          minWidth: 0,
        }}
      >
        {right}
      </div>
    </div>
  );
}
