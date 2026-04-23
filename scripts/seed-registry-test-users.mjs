#!/usr/bin/env node

/**
 * Seed deterministic registry test users and commercial org personas.
 *
 * Default mode is a dry run. Use --apply only after confirming that the target
 * Supabase project and password are correct.
 *
 * Required for --apply:
 * - SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - REGISTRY_TEST_USER_PASSWORD
 *
 * Optional:
 * - --env-file <path> or REGISTRY_TEST_ENV_FILE
 * - REGISTRY_TEST_EMAIL_DOMAIN (default: example.com)
 * - REGISTRY_TEST_PREFIX (default: decantr-test)
 * - --verify signs into each persona and checks hosted API identity/billing state
 * - REGISTRY_TEST_ADMIN_KEY or DECANTR_ADMIN_KEY enables admin endpoint smoke
 * - Configure DECANTR_ADMIN_EMAILS with the admin persona email when testing
 *   admin routes. Admin access is environment-driven, not stored on users.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
const VERIFY = argv.includes('--verify');
const JSON_OUTPUT = argv.includes('--json');
const explicitEnvFileIndex = argv.indexOf('--env-file');
const explicitEnvFile = explicitEnvFileIndex !== -1 ? argv[explicitEnvFileIndex + 1] : null;

function loadEnvFile(path) {
  if (!path) return;
  const resolved = resolve(path);
  if (!existsSync(resolved)) {
    throw new Error(`Env file not found: ${resolved}`);
  }

  const content = readFileSync(resolved, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const key = match[1];
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(explicitEnvFile || process.env.REGISTRY_TEST_ENV_FILE || null);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_ROLE_KEY = process.env['SUPABASE_SERVICE_ROLE_KEY'] || '';
const ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const TEST_PASSWORD = process.env.REGISTRY_TEST_USER_PASSWORD || '';
const EMAIL_DOMAIN = process.env.REGISTRY_TEST_EMAIL_DOMAIN || 'example.com';
const EMAIL_PREFIX = process.env.REGISTRY_TEST_PREFIX || 'decantr-test';
const API_URL = process.env.REGISTRY_TEST_API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.decantr.ai/v1';
const ADMIN_KEY = process.env.REGISTRY_TEST_ADMIN_KEY || process.env.DECANTR_ADMIN_KEY || '';

const personas = [
  {
    key: 'free',
    email: `${EMAIL_PREFIX}+free@${EMAIL_DOMAIN}`,
    username: 'decantr-free-test',
    displayName: 'Decantr Free Tester',
    tier: 'free',
    trusted: false,
    reputationScore: 0,
  },
  {
    key: 'pro',
    email: `${EMAIL_PREFIX}+pro@${EMAIL_DOMAIN}`,
    username: 'decantr-pro-test',
    displayName: 'Decantr Pro Tester',
    tier: 'pro',
    trusted: true,
    reputationScore: 25,
  },
  {
    key: 'team-owner',
    email: `${EMAIL_PREFIX}+team-owner@${EMAIL_DOMAIN}`,
    username: 'decantr-team-owner',
    displayName: 'Decantr Team Owner',
    tier: 'team',
    orgSlug: 'decantr-test-team',
    orgRole: 'owner',
    trusted: true,
    reputationScore: 75,
  },
  {
    key: 'team-admin',
    email: `${EMAIL_PREFIX}+team-admin@${EMAIL_DOMAIN}`,
    username: 'decantr-team-admin',
    displayName: 'Decantr Team Admin',
    tier: 'team',
    orgSlug: 'decantr-test-team',
    orgRole: 'admin',
    trusted: true,
    reputationScore: 50,
  },
  {
    key: 'team-member',
    email: `${EMAIL_PREFIX}+team-member@${EMAIL_DOMAIN}`,
    username: 'decantr-team-member',
    displayName: 'Decantr Team Member',
    tier: 'team',
    orgSlug: 'decantr-test-team',
    orgRole: 'member',
    trusted: false,
    reputationScore: 15,
  },
  {
    key: 'enterprise-owner',
    email: `${EMAIL_PREFIX}+enterprise-owner@${EMAIL_DOMAIN}`,
    username: 'decantr-enterprise-owner',
    displayName: 'Decantr Enterprise Owner',
    tier: 'enterprise',
    orgSlug: 'decantr-test-enterprise',
    orgRole: 'owner',
    trusted: true,
    reputationScore: 125,
  },
  {
    key: 'enterprise-admin',
    email: `${EMAIL_PREFIX}+enterprise-admin@${EMAIL_DOMAIN}`,
    username: 'decantr-enterprise-admin',
    displayName: 'Decantr Enterprise Admin',
    tier: 'enterprise',
    orgSlug: 'decantr-test-enterprise',
    orgRole: 'admin',
    trusted: true,
    reputationScore: 90,
  },
  {
    key: 'admin',
    email: `${EMAIL_PREFIX}+admin@${EMAIL_DOMAIN}`,
    username: 'decantr-admin-test',
    displayName: 'Decantr Admin Tester',
    tier: 'enterprise',
    orgSlug: 'decantr-test-enterprise',
    orgRole: 'admin',
    trusted: true,
    reputationScore: 200,
    admin: true,
  },
];

const orgs = [
  {
    key: 'team',
    name: 'Decantr Test Team',
    slug: 'decantr-test-team',
    tier: 'team',
    seatLimit: 3,
    owner: 'team-owner',
    members: [
      ['team-owner', 'owner'],
      ['team-admin', 'admin'],
      ['team-member', 'member'],
    ],
    policy: {
      require_public_content_approval: true,
      allow_member_submissions: true,
      require_private_content_approval: false,
    },
  },
  {
    key: 'enterprise',
    name: 'Decantr Test Enterprise',
    slug: 'decantr-test-enterprise',
    tier: 'enterprise',
    seatLimit: 5,
    owner: 'enterprise-owner',
    members: [
      ['enterprise-owner', 'owner'],
      ['enterprise-admin', 'admin'],
      ['admin', 'admin'],
    ],
    policy: {
      require_public_content_approval: true,
      allow_member_submissions: true,
      require_private_content_approval: true,
    },
  },
];

function requireApplyEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!TEST_PASSWORD) missing.push('REGISTRY_TEST_USER_PASSWORD');
  if (missing.length) {
    throw new Error(`Missing required env for --apply: ${missing.join(', ')}`);
  }
}

function requireVerifyEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL');
  if (!ANON_KEY) missing.push('SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  if (!TEST_PASSWORD) missing.push('REGISTRY_TEST_USER_PASSWORD');
  if (!API_URL) missing.push('REGISTRY_TEST_API_URL or NEXT_PUBLIC_API_URL');
  if (missing.length) {
    throw new Error(`Missing required env for --verify: ${missing.join(', ')}`);
  }
}

function headers(extra = {}) {
  return {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function supabaseFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...headers(),
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${text}`);
  }

  if (response.status === 204) return null;
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function authFetch(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      apikey: ANON_KEY,
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${options.method ?? 'GET'} ${path} failed (${response.status}): ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function apiFetch(path, token) {
  const result = await apiRequest(path, token);
  if (!result.ok) {
    throw new Error(`GET ${path} failed (${result.status}): ${JSON.stringify(result.data)}`);
  }
  return result.data;
}

async function apiRequest(path, token, options = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.adminKey ? { 'X-Admin-Key': options.adminKey } : {}),
    ...(options.headers ?? {}),
  };

  const response = await fetch(`${API_URL.replace(/\/$/, '')}${path}`, {
    method: options.method ?? 'GET',
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      ...headers,
    },
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

function restQuery(table, query = '') {
  return `/rest/v1/${table}${query}`;
}

async function selectSingle(table, filter) {
  const rows = await supabaseFetch(restQuery(table, `?${filter}&limit=1`), {
    headers: { Prefer: 'return=representation' },
  });
  return Array.isArray(rows) ? rows[0] ?? null : null;
}

async function insert(table, body) {
  const rows = await supabaseFetch(restQuery(table), {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  return Array.isArray(rows) ? rows[0] ?? null : rows;
}

async function update(table, filter, body) {
  const rows = await supabaseFetch(restQuery(table, `?${filter}`), {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(body),
  });
  return Array.isArray(rows) ? rows[0] ?? null : rows;
}

async function ensureAuthUser(persona) {
  const existingProfile = await selectSingle('users', `email=eq.${encodeURIComponent(persona.email)}`);
  if (existingProfile?.id) {
    return { id: existingProfile.id, created: false };
  }

  const created = await supabaseFetch('/auth/v1/admin/users', {
    method: 'POST',
    body: JSON.stringify({
      email: persona.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: {
        username: persona.username,
        user_name: persona.username,
        display_name: persona.displayName,
        name: persona.displayName,
      },
    }),
  });

  return { id: created.id, created: true };
}

async function ensureUserProfile(persona, authUserId) {
  const body = {
    id: authUserId,
    email: persona.email,
    username: persona.username,
    display_name: persona.displayName,
    tier: persona.tier,
    trusted: persona.trusted,
    reputation_score: persona.reputationScore,
    updated_at: new Date().toISOString(),
  };

  const existing = await selectSingle('users', `id=eq.${authUserId}`);
  if (!existing) {
    return insert('users', body);
  }
  return update('users', `id=eq.${authUserId}`, body);
}

async function ensureOrganization(org, usersByKey) {
  const owner = usersByKey.get(org.owner);
  if (!owner) throw new Error(`Missing owner persona for org ${org.slug}`);

  const body = {
    name: org.name,
    slug: org.slug,
    owner_id: owner.id,
    tier: org.tier,
    seat_limit: org.seatLimit,
    updated_at: new Date().toISOString(),
  };

  const existing = await selectSingle('organizations', `slug=eq.${encodeURIComponent(org.slug)}`);
  if (!existing) {
    return insert('organizations', body);
  }
  return update('organizations', `id=eq.${existing.id}`, body);
}

async function ensureOrgMember(orgId, userId, role) {
  const existing = await selectSingle('org_members', `org_id=eq.${orgId}&user_id=eq.${userId}`);
  const body = { org_id: orgId, user_id: userId, role };
  if (!existing) {
    return insert('org_members', body);
  }
  return update('org_members', `org_id=eq.${orgId}&user_id=eq.${userId}`, { role });
}

async function ensureOrgPolicy(orgId, policy) {
  const existing = await selectSingle('organization_policies', `org_id=eq.${orgId}`);
  const body = { org_id: orgId, ...policy, updated_at: new Date().toISOString() };
  if (!existing) {
    return insert('organization_policies', body);
  }
  return update('organization_policies', `org_id=eq.${orgId}`, body);
}

async function applySeed() {
  requireApplyEnv();

  const usersByKey = new Map();
  const userResults = [];
  for (const persona of personas) {
    const authUser = await ensureAuthUser(persona);
    const profile = await ensureUserProfile(persona, authUser.id);
    usersByKey.set(persona.key, { ...persona, id: authUser.id });
    userResults.push({
      key: persona.key,
      email: persona.email,
      username: persona.username,
      tier: persona.tier,
      admin: Boolean(persona.admin),
      created: authUser.created,
      id: authUser.id,
      profileUpdated: Boolean(profile),
    });
  }

  const orgResults = [];
  for (const org of orgs) {
    const orgRow = await ensureOrganization(org, usersByKey);
    for (const [memberKey, role] of org.members) {
      const member = usersByKey.get(memberKey);
      if (!member) throw new Error(`Missing member persona ${memberKey}`);
      await ensureOrgMember(orgRow.id, member.id, role);
    }
    await ensureOrgPolicy(orgRow.id, org.policy);
    orgResults.push({
      key: org.key,
      slug: org.slug,
      tier: org.tier,
      id: orgRow.id,
      members: org.members.map(([memberKey, role]) => ({ memberKey, role })),
    });
  }

  return {
    target: `${new URL(SUPABASE_URL).origin}/...`,
    adminEmail: personas.find((persona) => persona.admin)?.email ?? null,
    users: userResults,
    organizations: orgResults,
  };
}

async function signInPersona(persona) {
  const result = await authFetch('/auth/v1/token?grant_type=password', {
    method: 'POST',
    body: JSON.stringify({
      email: persona.email,
      password: TEST_PASSWORD,
    }),
  });

  if (!result?.access_token) {
    throw new Error(`No access token returned for ${persona.email}`);
  }

  return result.access_token;
}

function expectEqual(actual, expected) {
  return Object.is(actual, expected);
}

function expectBoolean(actual, expected) {
  return Boolean(actual) === expected;
}

function checkEndpoint(checks, label, result, expectedStatus = 200, extra = true) {
  checks.push({
    label,
    status: result.status,
    expectedStatus,
    passed: result.status === expectedStatus && Boolean(extra),
  });
}

function checkValue(checks, label, passed) {
  checks.push({
    label,
    status: 'value',
    expectedStatus: 'expected',
    passed: Boolean(passed),
  });
}

async function runPersonaEndpointChecks(persona, token, me, billing) {
  const checks = [];
  const entitlements = me?.entitlements ?? {};

  checkValue(checks, 'me.email', expectEqual(me?.email, persona.email));
  checkValue(checks, 'me.tier', expectEqual(me?.tier, persona.tier));
  checkValue(checks, 'billing.tier', expectEqual(billing?.tier, persona.tier));
  checkValue(checks, 'personal-private-entitlement', expectBoolean(entitlements.personal_private_packages, persona.tier !== 'free'));
  checkValue(checks, 'org-collaboration-entitlement', expectBoolean(entitlements.org_collaboration, persona.tier === 'team' || persona.tier === 'enterprise'));
  checkValue(checks, 'private-registry-entitlement', expectBoolean(entitlements.private_registry_portal, persona.tier === 'enterprise'));

  checkEndpoint(checks, 'GET /my/content', await apiRequest('/my/content?limit=3', token));
  checkEndpoint(checks, 'GET /private/content', await apiRequest('/private/content?limit=3', token));
  checkEndpoint(checks, 'GET /api-keys', await apiRequest('/api-keys', token));

  if (persona.orgSlug) {
    checkEndpoint(checks, 'GET /orgs/:slug', await apiRequest(`/orgs/${persona.orgSlug}`, token));
    checkEndpoint(checks, 'GET /orgs/:slug/members', await apiRequest(`/orgs/${persona.orgSlug}/members`, token));
    checkEndpoint(checks, 'GET /orgs/:slug/usage', await apiRequest(`/orgs/${persona.orgSlug}/usage`, token));
    checkEndpoint(checks, 'GET /orgs/:slug/policy', await apiRequest(`/orgs/${persona.orgSlug}/policy`, token));
    checkEndpoint(checks, 'GET /orgs/:slug/content', await apiRequest(`/orgs/${persona.orgSlug}/content?limit=3`, token));
    checkEndpoint(checks, 'GET /orgs/:slug/audit', await apiRequest(`/orgs/${persona.orgSlug}/audit?limit=3`, token));
    checkEndpoint(
      checks,
      'GET /orgs/:slug/approvals',
      await apiRequest(`/orgs/${persona.orgSlug}/approvals?limit=3`, token),
      persona.orgRole === 'member' ? 403 : 200,
    );
  } else {
    checkEndpoint(
      checks,
      'GET non-member org gate',
      await apiRequest('/orgs/decantr-test-team', token),
      403,
    );
  }

  checkEndpoint(
    checks,
    'GET admin route without admin key',
    await apiRequest('/admin/commercial/summary', token),
    403,
  );

  if (persona.admin && ADMIN_KEY) {
    checkEndpoint(
      checks,
      'GET admin commercial summary',
      await apiRequest('/admin/commercial/summary', token, { adminKey: ADMIN_KEY }),
    );
    checkEndpoint(
      checks,
      'GET admin organizations',
      await apiRequest('/admin/organizations?limit=5', token, { adminKey: ADMIN_KEY }),
    );
    checkEndpoint(
      checks,
      'GET admin organization detail',
      await apiRequest('/admin/organizations/decantr-test-enterprise', token, { adminKey: ADMIN_KEY }),
    );
    checkEndpoint(
      checks,
      'GET admin moderation queue',
      await apiRequest('/admin/moderation/queue?limit=5', token, { adminKey: ADMIN_KEY }),
    );
  } else if (persona.admin) {
    checks.push({
      label: 'admin endpoints',
      status: 'skipped',
      expectedStatus: 'REGISTRY_TEST_ADMIN_KEY',
      passed: true,
      skipped: true,
    });
  }

  return checks;
}

async function verifySeed() {
  requireVerifyEnv();

  const users = [];
  const failedChecks = [];
  let skippedChecks = 0;
  for (const persona of personas) {
    const token = await signInPersona(persona);
    const [me, billing] = await Promise.all([
      apiFetch('/me', token),
      apiFetch('/billing/status', token),
    ]);
    const orgCount = Array.isArray(me?.organizations) ? me.organizations.length : 0;
    const billingOrgCount = Array.isArray(billing?.organizations) ? billing.organizations.length : 0;
    const expectedOrgCount = persona.orgSlug ? 1 : 0;
    const checks = await runPersonaEndpointChecks(persona, token, me, billing);
    checkValue(checks, 'me.organizations', orgCount >= expectedOrgCount);
    checkValue(checks, 'billing.organizations', billingOrgCount >= expectedOrgCount);

    for (const check of checks) {
      if (check.skipped) {
        skippedChecks += 1;
      } else if (!check.passed) {
        failedChecks.push({
          user: persona.key,
          ...check,
        });
      }
    }

    users.push({
      key: persona.key,
      email: persona.email,
      expectedTier: persona.tier,
      meTier: me?.tier ?? 'missing',
      billingTier: billing?.tier ?? 'missing',
      organizations: orgCount,
      billingOrganizations: billingOrgCount,
      checks: checks.length,
      passed: checks.every((check) => check.passed),
    });
  }

  return {
    mode: 'verify',
    target: `${new URL(SUPABASE_URL).origin}/...`,
    api: API_URL,
    failedChecks,
    skippedChecks,
    users,
    organizations: orgs.map(({ key, name, slug, tier, members }) => ({
      key,
      name,
      slug,
      tier,
      members: members.map(([memberKey, role]) => ({ memberKey, role })),
    })),
  };
}

function dryRunPlan() {
  return {
    mode: 'dry-run',
    target: SUPABASE_URL ? `${new URL(SUPABASE_URL).origin}/...` : 'missing SUPABASE_URL',
    emailDomain: EMAIL_DOMAIN,
    testPrefix: EMAIL_PREFIX,
    adminEmail: personas.find((persona) => persona.admin)?.email ?? null,
    users: personas.map(({ key, email, username, displayName, tier, admin }) => ({
      key,
      email,
      username,
      displayName,
      tier,
      admin: Boolean(admin),
    })),
    organizations: orgs.map(({ key, name, slug, tier, seatLimit, members, policy }) => ({
      key,
      name,
      slug,
      tier,
      seatLimit,
      members: members.map(([memberKey, role]) => ({ memberKey, role })),
      policy,
    })),
    applyCommand: 'REGISTRY_TEST_ENV_FILE=apps/api/.env.local REGISTRY_TEST_USER_PASSWORD=... pnpm seed:registry-test-users -- --apply',
  };
}

function printResult(result) {
  if (JSON_OUTPUT) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  const titleMode = VERIFY ? 'Verify' : APPLY ? 'Apply' : 'Dry Run';
  console.log(`# Registry Test User Seed ${titleMode}`);
  console.log('');
  console.log(`- Target: ${result.target ?? 'configured Supabase project'}`);
  console.log(`- Users: ${result.users.length}`);
  console.log(`- Organizations: ${result.organizations.length}`);
  console.log('');

  if (VERIFY) {
    console.log(`- Failed checks: ${result.failedChecks?.length ?? 0}`);
    console.log(`- Skipped checks: ${result.skippedChecks ?? 0}`);
    console.log('');
    console.log('| User | Email | Expected | /me | Billing | Orgs | Checks | Passed |');
    console.log('| --- | --- | --- | --- | --- | ---: | ---: | :---: |');
    for (const user of result.users) {
      console.log(`| ${user.key} | ${user.email} | ${user.expectedTier} | ${user.meTier} | ${user.billingTier} | ${user.organizations} | ${user.checks} | ${user.passed ? 'yes' : 'no'} |`);
    }

    if (result.failedChecks?.length) {
      console.log('');
      console.log('| Failed check | User | Status | Expected |');
      console.log('| --- | --- | --- | --- |');
      for (const check of result.failedChecks) {
        console.log(`| ${check.label} | ${check.user} | ${check.status} | ${check.expectedStatus} |`);
      }
    }
  } else {
    console.log('| User | Email | Tier | Admin |');
    console.log('| --- | --- | --- | :---: |');
    for (const user of result.users) {
      console.log(`| ${user.key} | ${user.email} | ${user.tier} | ${user.admin ? 'yes' : 'no'} |`);
    }
  }

  console.log('');
  console.log('| Organization | Slug | Tier | Members |');
  console.log('| --- | --- | --- | --- |');
  for (const org of result.organizations) {
    console.log(`| ${org.name ?? org.key} | ${org.slug} | ${org.tier} | ${org.members.map((member) => `${member.memberKey}:${member.role}`).join(', ')} |`);
  }

  if (!APPLY && !VERIFY) {
    console.log('');
    console.log('Dry run only. Re-run with `--apply` after confirming the target project and password.');
    if (result.adminEmail) {
      console.log(`To exercise admin routes, include \`${result.adminEmail}\` in DECANTR_ADMIN_EMAILS for the registry app.`);
    }
  }
}

try {
  if (APPLY && VERIFY) {
    throw new Error('Use either --apply or --verify, not both.');
  }

  const result = VERIFY ? await verifySeed() : APPLY ? await applySeed() : dryRunPlan();
  printResult(result);
  if (VERIFY && result.failedChecks?.length) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
