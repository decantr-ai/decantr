import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

// Mock the db client before importing routes
vi.mock('../../src/db/client.js', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  })),
  createUserClient: vi.fn(),
}));

// Import after mocks are set up
const { contentRoutes } = await import('../../src/routes/content.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', contentRoutes);
  return app;
}

describe('POST /v1/validate', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    app = createTestApp();
  });

  it('should return error for invalid JSON body', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not-json{',
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid JSON body');
  });

  it('should validate a minimal v2 essence document and report errors', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        // Missing required fields
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.errors.length).toBeGreaterThan(0);
    expect(json.schemaVersion).toBe('v2');
    expect(json.version).toBe('2.0.0');
  });

  it('should validate a valid v2 SimpleEssence document', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        archetype: 'dashboard',
        theme: {
          style: 'clean',
          mode: 'light',
          recipe: 'minimal',
        },
        personality: ['professional'],
        platform: {
          type: 'spa',
          routing: 'history',
        },
        structure: [
          {
            id: 'home',
            shell: 'sidebar',
            layout: ['hero'],
          },
        ],
        features: ['auth'],
        density: {
          level: 'comfortable',
          content_gap: '1.5rem',
        },
        guard: {
          mode: 'guided',
        },
        target: 'next',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(true);
    expect(json.errors).toEqual([]);
    expect(json.schemaVersion).toBe('v2');
  });

  it('should detect v3 documents by version field', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '3.0.0',
        // Incomplete v3 doc -- should fail validation
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    // An incomplete v3 doc should fail validation
    expect(json.valid).toBe(false);
    expect(json.version).toBe('3.0.0');
  });

  it('should return schemaVersion v2 for non-v3 documents', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        version: '2.0.0',
        platform: { type: 'spa' },
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.schemaVersion).toBe('v2');
  });

  it('should handle empty object', async () => {
    const res = await app.request('/v1/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.valid).toBe(false);
    expect(json.errors.length).toBeGreaterThan(0);
    expect(json.version).toBeNull();
  });
});
