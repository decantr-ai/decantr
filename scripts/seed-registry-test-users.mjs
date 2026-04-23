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
 * - Configure DECANTR_ADMIN_EMAILS with the admin persona email when testing
 *   admin routes. Admin access is environment-driven, not stored on users.
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const argv = process.argv.slice(2);
const APPLY = argv.includes('--apply');
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
const TEST_PASSWORD = process.env.REGISTRY_TEST_USER_PASSWORD || '';
const EMAIL_DOMAIN = process.env.REGISTRY_TEST_EMAIL_DOMAIN || 'example.com';
const EMAIL_PREFIX = process.env.REGISTRY_TEST_PREFIX || 'decantr-test';

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
    trusted: true,
    reputationScore: 75,
  },
  {
    key: 'team-admin',
    email: `${EMAIL_PREFIX}+team-admin@${EMAIL_DOMAIN}`,
    username: 'decantr-team-admin',
    displayName: 'Decantr Team Admin',
    tier: 'team',
    trusted: true,
    reputationScore: 50,
  },
  {
    key: 'team-member',
    email: `${EMAIL_PREFIX}+team-member@${EMAIL_DOMAIN}`,
    username: 'decantr-team-member',
    displayName: 'Decantr Team Member',
    tier: 'team',
    trusted: false,
    reputationScore: 15,
  },
  {
    key: 'enterprise-owner',
    email: `${EMAIL_PREFIX}+enterprise-owner@${EMAIL_DOMAIN}`,
    username: 'decantr-enterprise-owner',
    displayName: 'Decantr Enterprise Owner',
    tier: 'enterprise',
    trusted: true,
    reputationScore: 125,
  },
  {
    key: 'enterprise-admin',
    email: `${EMAIL_PREFIX}+enterprise-admin@${EMAIL_DOMAIN}`,
    username: 'decantr-enterprise-admin',
    displayName: 'Decantr Enterprise Admin',
    tier: 'enterprise',
    trusted: true,
    reputationScore: 90,
  },
  {
    key: 'admin',
    email: `${EMAIL_PREFIX}+admin@${EMAIL_DOMAIN}`,
    username: 'decantr-admin-test',
    displayName: 'Decantr Admin Tester',
    tier: 'enterprise',
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

  console.log(`# Registry Test User Seed ${APPLY ? 'Apply' : 'Dry Run'}`);
  console.log('');
  console.log(`- Target: ${result.target ?? 'configured Supabase project'}`);
  console.log(`- Users: ${result.users.length}`);
  console.log(`- Organizations: ${result.organizations.length}`);
  console.log('');

  console.log('| User | Email | Tier | Admin |');
  console.log('| --- | --- | --- | :---: |');
  for (const user of result.users) {
    console.log(`| ${user.key} | ${user.email} | ${user.tier} | ${user.admin ? 'yes' : 'no'} |`);
  }

  console.log('');
  console.log('| Organization | Slug | Tier | Members |');
  console.log('| --- | --- | --- | --- |');
  for (const org of result.organizations) {
    console.log(`| ${org.name ?? org.key} | ${org.slug} | ${org.tier} | ${org.members.map((member) => `${member.memberKey}:${member.role}`).join(', ')} |`);
  }

  if (!APPLY) {
    console.log('');
    console.log('Dry run only. Re-run with `--apply` after confirming the target project and password.');
    if (result.adminEmail) {
      console.log(`To exercise admin routes, include \`${result.adminEmail}\` in DECANTR_ADMIN_EMAILS for the registry app.`);
    }
  }
}

try {
  const result = APPLY ? await applySeed() : dryRunPlan();
  printResult(result);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
