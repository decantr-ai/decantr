import { describe, expect, it } from 'vitest';
import {
  INTERACTION_SIGNALS,
  listKnownInteractions,
  verifyInteractionsInSource,
} from '../src/index.js';

describe('verifyInteractionsInSource', () => {
  it('returns empty when no interactions are declared', () => {
    const sources = new Map([['App.tsx', 'export default function App() { return <div />; }']]);
    expect(verifyInteractionsInSource([], sources)).toEqual([]);
  });

  it('returns empty when no sources provided', () => {
    expect(verifyInteractionsInSource(['status-pulse'], new Map())).toEqual([]);
  });

  it('detects status-pulse via d-pulse class', () => {
    const sources = new Map([
      ['Status.tsx', '<span className="d-pulse" data-status="active" />'],
    ]);
    expect(verifyInteractionsInSource(['status-pulse'], sources)).toEqual([]);
  });

  it('detects status-pulse via d-pulse-ring class', () => {
    const sources = new Map([['Status.tsx', '<span className="d-pulse-ring" />']]);
    expect(verifyInteractionsInSource(['status-pulse'], sources)).toEqual([]);
  });

  it('flags missing status-pulse', () => {
    const sources = new Map([['App.tsx', 'export default function App() { return <div />; }']]);
    const missing = verifyInteractionsInSource(['status-pulse'], sources);
    expect(missing).toHaveLength(1);
    expect(missing[0]?.interaction).toBe('status-pulse');
    expect(missing[0]?.suggestion).toContain('d-pulse');
  });

  it('detects animate-on-mount via any of the three entrance treatments', () => {
    const sources1 = new Map([['Card.tsx', 'className="d-enter-fade"']]);
    expect(verifyInteractionsInSource(['animate-on-mount'], sources1)).toEqual([]);

    const sources2 = new Map([['Hero.tsx', 'className="d-enter-slide-up"']]);
    expect(verifyInteractionsInSource(['animate-on-mount'], sources2)).toEqual([]);

    const sources3 = new Map([['Modal.tsx', 'className="d-enter-scale"']]);
    expect(verifyInteractionsInSource(['animate-on-mount'], sources3)).toEqual([]);
  });

  it('detects stagger-children when both class and CSS var present', () => {
    const sources = new Map([
      [
        'List.tsx',
        '<ul className="d-stagger-children">{items.map((it, i) => <li style={{ "--d-stagger-index": i }} />)}</ul>',
      ],
    ]);
    expect(verifyInteractionsInSource(['stagger-children'], sources)).toEqual([]);
  });

  it('detects drag-nodes via pointer event handlers', () => {
    const sources = new Map([
      [
        'Canvas.tsx',
        'function Node() { return <div onPointerDown={start} onPointerMove={move} />; }',
      ],
    ]);
    expect(verifyInteractionsInSource(['drag-nodes'], sources)).toEqual([]);
  });

  it('detects pan-background via pointer + transform', () => {
    const sources = new Map([
      [
        'Canvas.tsx',
        'const onPointerDown = ...; const onPointerMove = ...; transform: translate(...)',
      ],
    ]);
    expect(verifyInteractionsInSource(['pan-background'], sources)).toEqual([]);
  });

  it('detects zoom-scroll via onWheel + scale', () => {
    const sources = new Map([
      [
        'Canvas.tsx',
        '<div onWheel={(e) => setScale(s * (e.deltaY > 0 ? 0.9 : 1.1))} style={{ transform: `scale(${scale})` }} />',
      ],
    ]);
    expect(verifyInteractionsInSource(['zoom-scroll'], sources)).toEqual([]);
  });

  it('flags multiple missing interactions in one call', () => {
    const sources = new Map([['App.tsx', 'export default function() { return null; }']]);
    const missing = verifyInteractionsInSource(['status-pulse', 'glow-hover', 'drag-nodes'], sources);
    expect(missing.map((m) => m.interaction).sort()).toEqual([
      'drag-nodes',
      'glow-hover',
      'status-pulse',
    ]);
  });

  it('deduplicates interactions before checking', () => {
    const sources = new Map([['Status.tsx', '<span className="d-pulse" />']]);
    const missing = verifyInteractionsInSource(
      ['status-pulse', 'status-pulse', 'status-pulse'],
      sources,
    );
    expect(missing).toEqual([]);
  });

  it('skips unknown interactions silently (forward-compatible)', () => {
    const sources = new Map([['App.tsx', 'export default function() { return null; }']]);
    const missing = verifyInteractionsInSource(
      ['some-future-interaction-not-yet-defined'],
      sources,
    );
    expect(missing).toEqual([]);
  });

  it('scans across multiple source files', () => {
    const sources = new Map([
      ['Status.tsx', '<span className="d-pulse" />'],
      ['Card.tsx', '<div className="d-glow-hover" />'],
      ['Canvas.tsx', '<svg onPointerDown={drag} onPointerMove={drag} />'],
    ]);
    const missing = verifyInteractionsInSource(
      ['status-pulse', 'glow-hover', 'drag-nodes'],
      sources,
    );
    expect(missing).toEqual([]);
  });
});

describe('INTERACTION_SIGNALS', () => {
  it('has signals for all canonical pattern.v2.json enum values', () => {
    // The pattern.v2.json enum values that this scanner must support.
    // Keep this in sync with docs/schemas/pattern.v2.json.
    const enumValues = [
      'animate-on-mount',
      'stagger-children',
      'status-pulse',
      'shimmer-skeleton',
      'float-idle',
      'glow-hover',
      'lift-hover',
      'scale-hover',
      'ripple-click',
      'drag-nodes',
      'drag-reorder',
      'pan-background',
      'zoom-scroll',
      'zoom-pinch',
      'click-select',
      'click-connect',
      'inline-edit',
      'hover-tooltip',
      'hover-reveal',
      'live-simulation',
      'real-time-updates',
      'scroll-reveal',
      'keyboard-navigation',
      'focus-trap',
    ];
    for (const v of enumValues) {
      expect(INTERACTION_SIGNALS[v], `Missing signal definition for "${v}"`).toBeDefined();
      expect(INTERACTION_SIGNALS[v]?.signals.length).toBeGreaterThan(0);
      expect(INTERACTION_SIGNALS[v]?.suggestion).toBeTruthy();
    }
  });

  it('listKnownInteractions returns alphabetized canonical list', () => {
    const list = listKnownInteractions();
    expect(list.length).toBeGreaterThanOrEqual(20);
    expect([...list]).toEqual([...list].sort());
  });
});
