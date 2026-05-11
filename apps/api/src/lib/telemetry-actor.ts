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
interface TelemetryContextResolution {
  actorType: TelemetryActorType | null;
  userId?: string | null;
  orgId?: string | null;
}
type CachedResolution = TelemetryContextResolution | null;

interface CacheEntry {
  expiresAt: number;
  value: CachedResolution;
}

const actorCache = new Map<string, CacheEntry>();

export function clearTelemetryActorCache(): void {
  actorCache.clear();
}

export async function resolveApiTelemetryActorType(
  context: TelemetryContext,
  options: TelemetryActorResolutionOptions = {},
): Promise<TelemetryActorType> {
  return (await resolveApiTelemetryContext(context, options)).actorType ?? 'service';
}

export async function resolveApiTelemetryContext(
  context: TelemetryContext,
  options: TelemetryActorResolutionOptions = {},
): Promise<TelemetryContext> {
  if (context.source === 'api' && context.actorType === 'service') {
    return context;
  }

  const serverContext = { ...context, actorType: undefined };
  const envResolved = resolveTelemetryActorType(serverContext, options);

  if (envResolved === 'official_pipeline' || envResolved === 'internal') {
    return { ...context, actorType: envResolved };
  }

  const dbResolved = await resolveDatabaseContext(context);
  const enrichedContext: TelemetryContext = {
    ...context,
    userId: context.userId ?? dbResolved?.userId ?? undefined,
    orgId: context.orgId ?? dbResolved?.orgId ?? undefined,
  };

  if (dbResolved?.actorType) {
    return { ...enrichedContext, actorType: dbResolved.actorType };
  }

  return {
    ...enrichedContext,
    actorType: resolveTelemetryActorType({ ...enrichedContext, actorType: undefined }, options),
  };
}

async function resolveDatabaseContext(context: TelemetryContext): Promise<CachedResolution> {
  try {
    if (context.userId) {
      const userResolution = await getFlaggedActor('user', context.userId);
      if (userResolution?.actorType) return userResolution;
    }

    if (context.orgId) {
      const orgResolution = await getFlaggedActor('org', context.orgId);
      if (orgResolution?.actorType) return orgResolution;
    }

    const aliases: Array<{ identityType: TelemetryIdentityType; identityId: string | undefined }> = [
      { identityType: 'project', identityId: context.projectId },
      { identityType: 'install', identityId: context.installId },
      { identityType: 'anonymous', identityId: context.anonymousId },
    ];

    for (const alias of aliases) {
      if (!alias.identityId) continue;
      const aliasResolution = await getAliasResolution(alias.identityType, alias.identityId);
      if (aliasResolution?.actorType) return aliasResolution;
    }

    return null;
  } catch (error) {
    logger.debug({ err: error }, 'Telemetry actor database resolution skipped');
    return null;
  }
}

async function getFlaggedActor(scope: 'org' | 'user', id: string): Promise<CachedResolution> {
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
  const resolution = row?.is_internal || row?.is_test ? { actorType: 'internal' as const } : null;
  writeCache(cacheKey, resolution);
  return resolution;
}

async function getAliasResolution(
  identityType: TelemetryIdentityType,
  identityId: string,
): Promise<CachedResolution> {
  const cacheKey = `alias:${identityType}:${identityId}`;
  const cached = readCache(cacheKey);
  if (cached !== undefined) return cached;

  const client = createAdminClient();
  const { data, error } = await client
    .from('telemetry_identity_aliases')
    .select('actor_type, user_id, org_id')
    .eq('identity_type', identityType)
    .eq('identity_id', identityId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const row = data as {
    actor_type?: TelemetryActorType | null;
    org_id?: string | null;
    user_id?: string | null;
  } | null;
  const resolution = row?.actor_type
    ? {
        actorType: row.actor_type,
        orgId: row.org_id ?? null,
        userId: row.user_id ?? null,
      }
    : null;
  writeCache(cacheKey, resolution);
  return resolution;
}

function readCache(key: string): CachedResolution | undefined {
  const entry = actorCache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt < Date.now()) {
    actorCache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeCache(key: string, value: CachedResolution): void {
  actorCache.set(key, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    value,
  });
}
