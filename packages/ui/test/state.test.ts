import { describe, it, expect, vi } from 'vitest';
import {
  createRoot,
  runWithOwner,
  getOwner,
  registerCleanup,
  disposeOwner,
  createChildOwner,
} from '../src/state/scheduler.js';

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
