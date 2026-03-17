import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createQuery, createMutation, queryClient, createInfiniteQuery } from '../src/data/query.js';
import { createSignal } from '../src/state/index.js';

describe('createQuery', () => {
  it('fetches data and sets signals', async () => {
    const result = createQuery('test-1', () => Promise.resolve('hello'));
    assert.equal(result.isLoading(), true);
    assert.equal(result.status(), 'loading');
    await new Promise(r => setTimeout(r, 20));
    assert.equal(result.data(), 'hello');
    assert.equal(result.isLoading(), false);
    assert.equal(result.status(), 'success');
    assert.equal(result.error(), null);
    queryClient.clear();
  });

  it('handles errors', async () => {
    const result = createQuery('test-err', () => Promise.reject(new Error('boom')), { retry: 0 });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(result.status(), 'error');
    assert.ok(result.error() instanceof Error);
    assert.equal(result.error().message, 'boom');
    queryClient.clear();
  });

  it('refetch re-runs the fetcher', async () => {
    let count = 0;
    const result = createQuery('test-refetch', () => Promise.resolve(++count), { staleTime: 0 });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(result.data(), 1);
    await result.refetch();
    assert.equal(result.data(), 2);
    queryClient.clear();
  });

  it('setData updates data without refetching', async () => {
    let fetchCount = 0;
    const result = createQuery('test-setdata', () => { fetchCount++; return Promise.resolve('original'); });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(result.data(), 'original');
    assert.equal(fetchCount, 1);
    result.setData('overridden');
    assert.equal(result.data(), 'overridden');
    assert.equal(fetchCount, 1);
    queryClient.clear();
  });

  it('enabled: false prevents fetching', async () => {
    let fetched = false;
    const [enabled, setEnabled] = createSignal(false);
    const result = createQuery('test-enabled', () => { fetched = true; return Promise.resolve('data'); }, { enabled });
    await new Promise(r => setTimeout(r, 20));
    assert.equal(fetched, false);
    assert.equal(result.status(), 'idle');
    queryClient.clear();
  });

  it('select transforms data', async () => {
    const result = createQuery('test-select', () => Promise.resolve({ items: [1, 2, 3] }), {
      select: d => d.items
    });
    await new Promise(r => setTimeout(r, 20));
    assert.deepEqual(result.data(), [1, 2, 3]);
    queryClient.clear();
  });

  it('initialData is used before fetch completes', () => {
    const result = createQuery('test-init', () => new Promise(r => setTimeout(() => r('fetched'), 100)), {
      initialData: 'initial'
    });
    assert.equal(result.data(), 'initial');
    queryClient.clear();
  });
});

describe('createMutation', () => {
  it('mutates and sets signals', async () => {
    const mutation = createMutation((val) => Promise.resolve(val * 2));
    assert.equal(mutation.isLoading(), false);
    mutation.mutate(5);
    assert.equal(mutation.isLoading(), true);
    await new Promise(r => setTimeout(r, 20));
    assert.equal(mutation.data(), 10);
    assert.equal(mutation.isLoading(), false);
  });

  it('calls onSuccess callback', async () => {
    let successData = null;
    const mutation = createMutation(
      (val) => Promise.resolve(val),
      { onSuccess: (data) => { successData = data; } }
    );
    await mutation.mutateAsync('hello');
    assert.equal(successData, 'hello');
  });

  it('calls onError callback', async () => {
    let errorMsg = null;
    const mutation = createMutation(
      () => Promise.reject(new Error('fail')),
      { onError: (err) => { errorMsg = err.message; } }
    );
    mutation.mutate('test');
    await new Promise(r => setTimeout(r, 20));
    assert.equal(errorMsg, 'fail');
  });

  it('reset clears state', async () => {
    const mutation = createMutation((val) => Promise.resolve(val));
    await mutation.mutateAsync('data');
    assert.equal(mutation.data(), 'data');
    mutation.reset();
    assert.equal(mutation.data(), undefined);
    assert.equal(mutation.error(), null);
  });
});

describe('queryClient', () => {
  it('setCache / getCache', () => {
    queryClient.setCache('manual-key', { items: [1, 2] });
    assert.deepEqual(queryClient.getCache('manual-key'), { items: [1, 2] });
    queryClient.clear();
  });

  it('clear removes all cache', () => {
    queryClient.setCache('a', 1);
    queryClient.setCache('b', 2);
    queryClient.clear();
    assert.equal(queryClient.getCache('a'), undefined);
    assert.equal(queryClient.getCache('b'), undefined);
  });
});
