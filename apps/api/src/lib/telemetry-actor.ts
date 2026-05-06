import {
  resolveTelemetryActorType,
  type TelemetryActorResolutionOptions,
  type TelemetryActorType,
  type TelemetryContext,
} from '@decantr/telemetry';
import { createAdminClient } from '../db/client.js';
import { logger } from './logger.js';

const CACHE_TTL_MS = 60_000;

type TelemetryIdentityType = 'anonymous' | 'install' | 'project';
type CachedActor = TelemetryActorType | null;

interface CacheEntry {
  expiresAt: number;
  value: CachedActor;
}

const actorCache = new Map<string, CacheEntry>();

export function clearTelemetryActorCache(): void {
  actorCache.clear();
}

export async function resolveApiTelemetryActorType(
  context: TelemetryContext,
  options: TelemetryActorResolutionOptions = {},
): Promise<TelemetryActorType> {
  const serverContext = { ...context, actorType: undefined };
  const envResolved = resolveTelemetryActorType(serverContext, options);

  if (envResolved === 'official_pipeline' || envResolved === 'internal') {
    return envResolved;
  }

  const dbResolved = await resolveDatabaseActorType(context);
  if (dbResolved) {
    return dbResolved;
  }

  return envResolved;
}

async function resolveDatabaseActorType(context: TelemetryContext): Promise<CachedActor> {
  try {
    if (context.userId) {
      const userActor = await getFlaggedActor('user', context.userId);
      if (userActor) return userActor;
    }

    if (context.orgId) {
      const orgActor = await getFlaggedActor('org', context.orgId);
      if (orgActor) return orgActor;
    }

    const aliases: Array<{ identityType: TelemetryIdentityType; identityId: string | undefined }> = [
      { identityType: 'project', identityId: context.projectId },
      { identityType: 'install', identityId: context.installId },
      { identityType: 'anonymous', identityId: context.anonymousId },
    ];

    for (const alias of aliases) {
      if (!alias.identityId) continue;
      const aliasActor = await getAliasActor(alias.identityType, alias.identityId);
      if (aliasActor) return aliasActor;
    }

    return null;
  } catch (error) {
    logger.debug({ err: error }, 'Telemetry actor database resolution skipped');
    return null;
  }
}

async function getFlaggedActor(scope: 'org' | 'user', id: string): Promise<CachedActor> {
  const cacheKey = `${scope}:${id}`;
  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;

  const client = createAdminClient();
  const table = scope === 'user' ? 'users' : 'organizations';
  const { data, error } = await client
    .from(table)
    .select('is_internal, is_test')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as { is_internal?: boolean | null; is_test?: boolean | null } | null;
  const actor = row?.is_internal || row?.is_test ? 'internal' : null;
  writeCache(cacheKey, actor);
  return actor;
}

async function getAliasActor(
  identityType: TelemetryIdentityType,
  identityId: string,
): Promise<CachedActor> {
  const cacheKey = `alias:${identityType}:${identityId}`;
  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;

  const client = createAdminClient();
  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .select('actor_type')
    .eq('identity_type', identityType)
    .eq('identity_id', identityId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const actor = (data?.actor_type ?? null) as CachedActor;
  writeCache(cacheKey, actor);
  return actor;
}

function readCache(key: string): CachedActor | undefined {
  const entry = actorCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    actorCache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeCache(key: string, value: CachedActor): void {
  actorCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  });
}
