import { describe, it, expect, vi } from 'vitest';
import {
  createRoot,
  runWithOwner,
  getOwner,
  registerCleanup,
  disposeOwner,
  createChildOwner,
} from '../src/state/scheduler.js';
import {
  createSignal,
  createEffect,
  createMemo,
  createContext,
} from '../src/state/index.js';

// ─── scheduler.ts ────────────────────────────────────────────

describe('createRoot', () => {
  it('establishes an owner inside the callback', () => {
    let capturedOwner: unknown = null;
    createRoot(() => {
      capturedOwner = getOwner();
    });
    expect(capturedOwner).not.toBeNull();
    expect(capturedOwner).toHaveProperty('children');
    expect(capturedOwner).toHaveProperty('cleanups');
  });

  it('restores the previous owner after the callback', () => {
    const before = getOwner();
    createRoot(() => {
      // inside root, owner is set
    });
    expect(getOwner()).toBe(before);
  });

  it('sets _parent on the new owner to the outer owner', () => {
    let innerOwner: any = null;
    let outerOwner: any = null;
    createRoot(() => {
      outerOwner = getOwner();
      createRoot(() => {
        innerOwner = getOwner();
      });
    });
    expect(innerOwner._parent).toBe(outerOwner);
  });

  it('sets _parent to null when there is no outer owner', () => {
    let owner: any = null;
    createRoot(() => {
      owner = getOwner();
    });
    expect(owner._parent).toBeNull();
  });
});

describe('runWithOwner', () => {
  it('temporarily sets the owner for the duration of fn', () => {
    const fakeOwner = { children: new Set(), cleanups: [], _parent: null } as any;
    let captured: unknown = null;
    runWithOwner(fakeOwner, () => {
      captured = getOwner();
    });
    expect(captured).toBe(fakeOwner);
  });

  it('restores the previous owner after fn completes', () => {
    const before = getOwner();
    const fakeOwner = { children: new Set(), cleanups: [], _parent: null } as any;
    runWithOwner(fakeOwner, () => {});
    expect(getOwner()).toBe(before);
  });

  it('restores the previous owner even if fn throws', () => {
    const before = getOwner();
    const fakeOwner = { children: new Set(), cleanups: [], _parent: null } as any;
    try {
      runWithOwner(fakeOwner, () => {
        throw new Error('boom');
      });
    } catch {}
    expect(getOwner()).toBe(before);
  });
});

describe('registerCleanup', () => {
  it('adds cleanup to current owner', () => {
    const cleanup = vi.fn();
    createRoot(() => {
      registerCleanup(cleanup);
      const owner = getOwner()!;
      expect(owner.cleanups).toContain(cleanup);
    });
  });

  it('cleanup runs on dispose', () => {
    const cleanup = vi.fn();
    createRoot((dispose) => {
      registerCleanup(cleanup);
      dispose();
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });
});

describe('disposeOwner', () => {
  it('runs cleanups in reverse order', () => {
    const order: number[] = [];
    createRoot((dispose) => {
      registerCleanup(() => order.push(1));
      registerCleanup(() => order.push(2));
      registerCleanup(() => order.push(3));
      dispose();
    });
    expect(order).toEqual([3, 2, 1]);
  });

  it('disposes children depth-first before parent cleanups', () => {
    const order: string[] = [];
    createRoot((dispose) => {
      registerCleanup(() => order.push('parent'));
      const child = createChildOwner();
      child.cleanups.push(() => order.push('child'));
      dispose();
    });
    expect(order).toEqual(['child', 'parent']);
  });

  it('clears children and cleanups after dispose', () => {
    let capturedOwner: any = null;
    createRoot((dispose) => {
      registerCleanup(() => {});
      createChildOwner();
      capturedOwner = getOwner();
      dispose();
    });
    expect(capturedOwner.children.size).toBe(0);
    expect(capturedOwner.cleanups.length).toBe(0);
  });
});

// ─── state/index.ts ──────────────────────────────────────────

describe('createSignal', () => {
  it('reads and writes a value', () => {
    const [get, set] = createSignal(10);
    expect(get()).toBe(10);
    set(20);
    expect(get()).toBe(20);
  });

  it('accepts an updater function', () => {
    const [get, set] = createSignal(5);
    set((prev) => prev + 3);
    expect(get()).toBe(8);
  });

  it('does not notify on same value (Object.is)', () => {
    let runs = 0;
    const [get, set] = createSignal(1);
    createRoot(() => {
      createEffect(() => {
        get();
        runs++;
      });
    });
    expect(runs).toBe(1);
    set(1); // same value
    expect(runs).toBe(1);
  });
});

describe('createEffect', () => {
  it('runs immediately', () => {
    let ran = false;
    createRoot(() => {
      createEffect(() => {
        ran = true;
      });
    });
    expect(ran).toBe(true);
  });

  it('re-runs when a tracked signal changes', () => {
    let value = 0;
    createRoot(() => {
      const [get, set] = createSignal(1);
      createEffect(() => {
        value = get();
      });
      expect(value).toBe(1);
      set(2);
      expect(value).toBe(2);
    });
  });

  it('cleans up via returned function', () => {
    const cleanup = vi.fn();
    createRoot(() => {
      const [, set] = createSignal(0);
      const [get2, set2] = createSignal('a');
      createEffect(() => {
        get2(); // track
        return cleanup;
      });
      expect(cleanup).not.toHaveBeenCalled();
      set2('b'); // triggers re-run, which calls cleanup first
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });
});

describe('createMemo', () => {
  it('derives value from signals', () => {
    createRoot(() => {
      const [a, setA] = createSignal(2);
      const [b, setB] = createSignal(3);
      const sum = createMemo(() => a() + b());
      expect(sum()).toBe(5);
      setA(10);
      expect(sum()).toBe(13);
      setB(7);
      expect(sum()).toBe(17);
    });
  });

  it('caches value when dependencies have not changed', () => {
    let computeCount = 0;
    createRoot(() => {
      const [get] = createSignal(42);
      const memo = createMemo(() => {
        computeCount++;
        return get() * 2;
      });
      expect(memo()).toBe(84);
      expect(memo()).toBe(84);
      // Should only have computed once (initial) + reads reuse cache
      expect(computeCount).toBe(1);
    });
  });
});

describe('createContext', () => {
  it('provides and consumes a value (global behavior)', () => {
    const ctx = createContext('default');
    expect(ctx.consume()).toBe('default');

    const restore = ctx.Provider('hello');
    expect(ctx.consume()).toBe('hello');

    restore();
    expect(ctx.consume()).toBe('default');
  });
});
