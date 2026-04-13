import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Hono } from 'hono';
import type { Env } from '../../src/types.js';

const {
  mockCreateAdminClient,
  mockAuthState,
  mockStripe,
  mockGetStripe,
  mockGetStripeWebhookSecret,
  mockHandleStripeWebhook,
  mockLoggerError,
  mockLoggerInfo,
} = vi.hoisted(() => ({
  mockCreateAdminClient: vi.fn(),
  mockAuthState: {
    current: {
      user: {
        id: 'user-1',
        email: 'billing@example.com',
        username: 'billing-user',
        display_name: 'Billing User',
        tier: 'free',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
    },
  },
  mockStripe: {
    customers: {
      create: vi.fn(),
    },
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: vi.fn(),
      },
    },
    subscriptions: {
      list: vi.fn(),
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
  mockGetStripe: vi.fn(),
  mockGetStripeWebhookSecret: vi.fn(),
  mockHandleStripeWebhook: vi.fn(),
  mockLoggerError: vi.fn(),
  mockLoggerInfo: vi.fn(),
}));

vi.mock('../../src/db/client.js', () => ({
  createAdminClient: mockCreateAdminClient,
  createUserClient: vi.fn(),
}));

vi.mock('../../src/middleware/auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    const auth = mockAuthState.current;
    if (!auth?.isAuthenticated || !auth.user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    c.set('auth', auth);
    await next();
  },
}));

vi.mock('../../src/stripe/index.js', () => ({
  getStripe: mockGetStripe,
  getStripeWebhookSecret: mockGetStripeWebhookSecret,
  STRIPE_PRO_PRICE_ID: 'price_pro',
  STRIPE_TEAM_PRICE_ID: 'price_team',
}));

vi.mock('../../src/stripe/webhooks.js', () => ({
  handleStripeWebhook: mockHandleStripeWebhook,
}));

vi.mock('../../src/lib/logger.js', () => ({
  logger: {
    error: mockLoggerError,
    info: mockLoggerInfo,
  },
}));

type BillingAdminClientOptions = {
  userRow?: any;
  memberships?: any[];
  memberCount?: number;
  personalContentCount?: number;
  personalPrivateCount?: number;
  orgContentCount?: number;
  stripeEventInsertError?: any;
};

function createBillingAdminClient(options: BillingAdminClientOptions = {}) {
  return {
    from: vi.fn((table: string) => {
      const state: {
        filters: Record<string, unknown>;
        updatePayload: Record<string, unknown> | null;
        insertPayload: Record<string, unknown> | null;
        selectArgs: unknown[];
      } = {
        filters: {},
        updatePayload: null,
        insertPayload: null,
        selectArgs: [],
      };

      const resolveChainResult = async () => {
        const headCount = Boolean((state.selectArgs[1] as { head?: boolean } | undefined)?.head);
        if (headCount) {
          if (table === 'org_members') {
            return { count: options.memberCount ?? 0, error: null };
          }
          if (table === 'content') {
            if ('org_id' in state.filters && state.filters.org_id != null) {
              return { count: options.orgContentCount ?? 0, error: null };
            }
            if (state.filters.visibility === 'private') {
              return { count: options.personalPrivateCount ?? 0, error: null };
            }
            return { count: options.personalContentCount ?? 0, error: null };
          }
        }

        if (table === 'org_members' && state.selectArgs[0] === 'org_id, role, organizations(id, name, slug, tier, stripe_subscription_id, seat_limit)') {
          return { data: options.memberships ?? [], error: null };
        }

        return { data: [], error: null };
      };

      const chain: any = {
        select: vi.fn((...args: unknown[]) => {
          state.selectArgs = args;
          return chain;
        }),
        eq: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        is: vi.fn((field: string, value: unknown) => {
          state.filters[field] = value;
          return chain;
        }),
        order: vi.fn(() => chain),
        single: vi.fn(async () => {
          if (table === 'users') {
            return { data: options.userRow ?? null, error: null };
          }
          return { data: null, error: null };
        }),
        update: vi.fn((payload: Record<string, unknown>) => {
          state.updatePayload = payload;
          return {
            eq: vi.fn(async () => ({ data: null, error: null })),
          };
        }),
        insert: vi.fn((payload: Record<string, unknown>) => {
          state.insertPayload = payload;
          if (table === 'stripe_events') {
            return Promise.resolve({ error: options.stripeEventInsertError ?? null });
          }
          return {
            select: vi.fn(() => ({
              single: vi.fn(async () => ({
                data: payload,
                error: null,
              })),
            })),
          };
        }),
        then: (resolve: (value: unknown) => unknown, reject?: (reason?: unknown) => unknown) =>
          resolveChainResult().then(resolve, reject),
      };

      return chain;
    }),
  };
}

const { billingRoutes } = await import('../../src/routes/billing.js');

function createTestApp() {
  const app = new Hono<Env>();
  app.route('/v1', billingRoutes);
  return app;
}

describe('Billing routes', () => {
  let app: ReturnType<typeof createTestApp>;

  beforeEach(() => {
    vi.clearAllMocks();
    app = createTestApp();
    mockAuthState.current = {
      user: {
        id: 'user-1',
        email: 'billing@example.com',
        username: 'billing-user',
        display_name: 'Billing User',
        tier: 'free',
        trusted: false,
        reputation_score: 0,
      },
      isAuthenticated: true,
      isAdmin: false,
    };
    mockGetStripe.mockReturnValue(mockStripe);
    mockGetStripeWebhookSecret.mockReturnValue('stripe-webhook-secret-test');
    mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' });
    mockStripe.checkout.sessions.create.mockResolvedValue({ id: 'cs_123', url: 'https://checkout.example.com' });
    mockStripe.billingPortal.sessions.create.mockResolvedValue({ url: 'https://portal.example.com' });
    mockStripe.subscriptions.list.mockResolvedValue({ data: [] });
    mockStripe.webhooks.constructEvent.mockReturnValue({ id: 'evt_1', type: 'checkout.session.completed' });
    mockHandleStripeWebhook.mockResolvedValue(undefined);
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient());
  });

  it('rejects invalid checkout plans', async () => {
    const res = await app.request('/v1/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'enterprise',
        success_url: 'https://app.example.com/success',
        cancel_url: 'https://app.example.com/cancel',
      }),
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Invalid plan. Must be "pro" or "team".');
  });

  it('creates checkout sessions for new customers', async () => {
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient({
      userRow: { stripe_customer_id: null },
    }));

    const res = await app.request('/v1/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan: 'team',
        quantity: 3,
        success_url: 'https://app.example.com/success',
        cancel_url: 'https://app.example.com/cancel',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      checkout_url: 'https://checkout.example.com',
      session_id: 'cs_123',
    });
    expect(mockStripe.customers.create).toHaveBeenCalledWith({
      email: 'billing@example.com',
      metadata: { supabase_user_id: 'user-1' },
    });
    expect(mockStripe.checkout.sessions.create).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_new',
      line_items: [{ price: 'price_team', quantity: 3 }],
      metadata: {
        supabase_user_id: 'user-1',
        plan: 'team',
        quantity: '3',
      },
    }));
  });

  it('uses existing billing customers for portal sessions', async () => {
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient({
      userRow: { stripe_customer_id: 'cus_existing' },
    }));

    const res = await app.request('/v1/billing/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        return_url: 'https://app.example.com/dashboard',
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ portal_url: 'https://portal.example.com' });
    expect(mockStripe.billingPortal.sessions.create).toHaveBeenCalledWith({
      customer: 'cus_existing',
      return_url: 'https://app.example.com/dashboard',
    });
  });

  it('returns billing status without a subscription when no Stripe customer exists', async () => {
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient({
      userRow: { tier: 'free', stripe_customer_id: null },
    }));

    const res = await app.request('/v1/billing/status');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tier).toBe('free');
    expect(json.subscription).toBeNull();
    expect(json.entitlements.personal_private_packages).toBe(false);
    expect(json.limits.personal_private_packages).toBe(0);
  });

  it('returns active billing status when a subscription exists', async () => {
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient({
      userRow: { id: 'user-1', tier: 'team', stripe_customer_id: 'cus_existing' },
      memberships: [
        {
          org_id: 'org-1',
          role: 'owner',
          organizations: {
            id: 'org-1',
            name: 'Acme',
            slug: 'acme',
            tier: 'team',
            stripe_subscription_id: 'sub_123',
            seat_limit: 4,
          },
        },
      ],
      memberCount: 3,
      orgContentCount: 12,
    }));
    mockStripe.subscriptions.list.mockResolvedValue({
      data: [
        {
          id: 'sub_123',
          status: 'active',
          cancel_at_period_end: false,
          items: {
            data: [
              {
                price: { id: 'price_team' },
                quantity: 4,
                current_period_start: 100,
                current_period_end: 200,
              },
            ],
          },
        },
      ],
    });

    const res = await app.request('/v1/billing/status');

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tier).toBe('team');
    expect(json.entitlements.org_collaboration).toBe(true);
    expect(json.usage.org_content_items).toBe(12);
    expect(json.usage.seats_used).toBe(3);
    expect(json.usage.seats_limit).toBe(4);
    expect(json.organizations[0].slug).toBe('acme');
    expect(json.subscription).toEqual({
      id: 'sub_123',
      status: 'active',
      price_id: 'price_team',
      quantity: 4,
      current_period_start: 100,
      current_period_end: 200,
      cancel_at_period_end: false,
    });
  });

  it('rejects webhook requests without a signature', async () => {
    const res = await app.request('/v1/billing/webhooks', {
      method: 'POST',
      body: '{}',
    });

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Missing stripe-signature header.');
  });

  it('deduplicates already-processed webhook events', async () => {
    mockCreateAdminClient.mockReturnValue(createBillingAdminClient({
      stripeEventInsertError: {
        code: '23505',
        message: 'duplicate key value violates unique constraint',
      },
    }));

    const res = await app.request('/v1/billing/webhooks', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hello: 'world' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({
      received: true,
      deduplicated: true,
    });
    expect(mockHandleStripeWebhook).not.toHaveBeenCalled();
  });

  it('returns 500 when webhook handling fails after signature verification', async () => {
    mockHandleStripeWebhook.mockRejectedValue(new Error('boom'));

    const res = await app.request('/v1/billing/webhooks', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hello: 'world' }),
    });

    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe('Webhook handler failed.');
  });

  it('accepts valid webhook events', async () => {
    const res = await app.request('/v1/billing/webhooks', {
      method: 'POST',
      headers: {
        'stripe-signature': 'sig_test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hello: 'world' }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toEqual({ received: true });
    expect(mockHandleStripeWebhook).toHaveBeenCalledWith({
      id: 'evt_1',
      type: 'checkout.session.completed',
    });
  });
});
