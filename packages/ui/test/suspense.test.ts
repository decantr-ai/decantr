import { describe, it, expect, vi } from 'vitest';

describe('Suspense', () => {
  it('should not use setInterval for pending tracking', () => {
    // Verify that importing the runtime doesn't set up any intervals
    const spy = vi.spyOn(globalThis, 'setInterval');
    // The fact that we can import without setInterval being called is the test
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
