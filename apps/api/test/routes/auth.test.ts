import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Mock db client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSingle = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockIs = vi.fn();
const mockUpdate = vi.fn();

vi.mock('../../src/db/client.js', () => ({
  createUserClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          is: mockIs.mockReturnValue({
            single: mockSingle,
          }),
        }),
      }),
      update: mockUpdate.mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    })),
  })),
}));

const { requireAuth, getAuthContext, optionalAuth } = await import('../../src/middleware/auth.js');

function createTestApp() {
  const app = new Hono();

  // Protected route
  app.use('/protected/*', requireAuth());
  app.get('/protected/resource', (c) => {
    const auth = c.get('auth');
    return c.json({ user: auth.user, isAuthenticated: auth.isAuthenticated });
  });

  // Optional auth route
  app.use('/optional/*', optionalAuth());
  app.get('/optional/resource', (c) => {
    const auth = c.get('auth');
    return c.json({ isAuthenticated: auth.isAuthenticated });
  });

  return app;
}

describe('Auth middleware', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
  });

  describe('requireAuth', () => {
    it('should return 401 when no auth headers are provided', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: 'no token' } });

      const res = await app.request('/protected/resource', {
        method: 'GET',
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('should return 401 with invalid JWT', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'invalid token' },
      });

      const res = await app.request('/protected/resource', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer invalid-token-here',
        },
      });

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('should authenticate with valid JWT and return user context', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'test-user',
        display_name: 'Test User',
        tier: 'pro',
        trusted: true,
        reputation_score: 50,
      };

      // Mock Supabase auth.getUser to return a valid user
      const { createUserClient } = await import('../../src/db/client.js');
      (createUserClient as any).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ data: mockUser, error: null }),
        })),
      });

      const res = await app.request('/protected/resource', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer valid-jwt-token',
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isAuthenticated).toBe(true);
      expect(json.user.id).toBe('user-123');
      expect(json.user.tier).toBe('pro');
    });

    it('should authenticate with valid API key', async () => {
      const mockUser = {
        id: 'user-456',
        email: 'apiuser@example.com',
        username: 'api-user',
        display_name: 'API User',
        tier: 'team',
        trusted: false,
        reputation_score: 10,
      };

      // getUser should fail (no JWT)
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'no token' },
      });

      // API key lookup should succeed
      mockSingle.mockResolvedValue({
        data: {
          id: 'key-1',
          key_hash: 'abc',
          users: mockUser,
        },
        error: null,
      });

      const res = await app.request('/protected/resource', {
        method: 'GET',
        headers: {
          'X-API-Key': 'dk_test_some_api_key_value',
        },
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isAuthenticated).toBe(true);
      expect(json.user.id).toBe('user-456');
      expect(json.user.tier).toBe('team');
    });
  });

  describe('optionalAuth', () => {
    it('should proceed without auth and set isAuthenticated to false', async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'no token' },
      });
      mockSingle.mockResolvedValue({ data: null, error: null });

      const res = await app.request('/optional/resource', {
        method: 'GET',
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.isAuthenticated).toBe(false);
    });
  });
});
