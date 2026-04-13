import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const mockCreateAdminClient = vi.fn();

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
}));

const { adminRoutes } = await import('../../src/routes/admin.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', adminRoutes);
  return app;
}

function createDeleteClient(existing: { id: string } | null, deleteError: { message: string } | null = null) {
  const selectChain = {
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: existing,
      error: existing ? null : { message: 'not found' },
    }),
  };

  const deleteChain = {
    eq: vi.fn().mockResolvedValue({ error: deleteError }),
  };

  return {
    from: vi.fn(() => ({
      select: vi.fn(() => selectChain),
      delete: vi.fn(() => deleteChain),
    })),
  };
}

describe('DELETE /v1/admin/content/:type/:namespace/:slug', () => {
  const originalAdminKey = process.env.DECANTR_ADMIN_KEY;

  beforeEach(() => {
    process.env.DECANTR_ADMIN_KEY = 'test-admin-key';
    mockCreateAdminClient.mockReset();
  });

  afterEach(() => {
    process.env.DECANTR_ADMIN_KEY = originalAdminKey;
  });

  it('requires the admin key', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/content/pattern/@official/test-pattern', {
      method: 'DELETE',
    });

    expect(res.status).toBe(401);
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it('rejects prune attempts outside the official namespace', async () => {
    const app = createTestApp();

    const res = await app.request('/v1/admin/content/pattern/@community/test-pattern', {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(403);
    expect(mockCreateAdminClient).not.toHaveBeenCalled();
  });

  it('deletes official content by type, namespace, and slug', async () => {
    mockCreateAdminClient.mockReturnValue(createDeleteClient({ id: 'content-1' }));
    const app = createTestApp();

    const res = await app.request('/v1/admin/content/pattern/@official/test-pattern', {
      method: 'DELETE',
      headers: {
        'X-Admin-Key': 'test-admin-key',
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      message: 'Deleted',
      id: 'content-1',
      slug: 'test-pattern',
    });
    expect(mockCreateAdminClient).toHaveBeenCalledTimes(1);
  });
});
