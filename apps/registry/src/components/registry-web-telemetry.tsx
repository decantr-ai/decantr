'use client';

import {
  createFetchTelemetrySink,
  createTelemetryClient,
  type DecantrTelemetryEvent,
  type DecantrTelemetryEventName,
  type TelemetryActorType,
  type TelemetryEnvironment,
  type TelemetryProperties,
} from '@decantr/telemetry';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  getCampaignAttributionProperties,
  resolveSharedAnonymousId,
  updateCampaignAttribution,
} from '@/lib/campaign-attribution';
import { captureXPixelEvent, initXPixel } from '@/lib/x-pixel';

const ANONYMOUS_ID_KEY = 'decantr:registry-web:anonymous-id';
const DEFAULT_ENDPOINT = 'https://api.decantr.ai/v1/telemetry/events';

interface RegistryWebIdentity {
  actorType?: TelemetryActorType | null;
  orgId?: string | null;
  plan?: string | null;
  userId?: string | null;
}

interface RegistryWebTelemetryValue {
  capture: (name: DecantrTelemetryEventName, properties: TelemetryProperties) => void;
  setIdentity: (identity: RegistryWebIdentity) => void;
}

const RegistryWebTelemetryContext = createContext<RegistryWebTelemetryValue>({
  capture: () => undefined,
  setIdentity: () => undefined,
});

export function RegistryWebTelemetryProvider({ children }: { children: ReactNode }) {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [identity, setIdentityState] = useState<RegistryWebIdentity>({});
  const identityRef = useRef<RegistryWebIdentity>(identity);

  const endpoint = resolveTelemetryEndpoint();
  const enabled = resolveTelemetryEnabled(endpoint);
  const environment = resolveTelemetryEnvironment();

  const client = useMemo(
    () =>
      createTelemetryClient({
        enabled,
        sink: createFetchTelemetrySink({
          endpoint,
          timeoutMs: 2500,
        }),
        onError() {
          // Telemetry must never affect the registry browsing experience.
        },
      }),
    [enabled, endpoint],
  );

  useEffect(() => {
    identityRef.current = identity;
  }, [identity]);

  useEffect(() => {
    updateCampaignAttribution();
    initXPixel();
    setAnonymousId(resolveAnonymousId());
  }, []);

  const capture = useCallback(
    (name: DecantrTelemetryEventName, properties: TelemetryProperties) => {
      if (!anonymousId) return;

      const currentIdentity = identityRef.current;
      const event: DecantrTelemetryEvent = {
        name,
        context: {
          source: 'registry-web',
          actorType: currentIdentity.actorType ?? inferRegistryWebActorType(currentIdentity),
          environment,
          serviceName: 'decantr-registry-web',
          registrySource: 'official',
          anonymousId,
          userId: currentIdentity.userId ?? undefined,
          orgId: currentIdentity.orgId ?? undefined,
        },
        properties: {
          ...getCampaignAttributionProperties(),
          ...properties,
        },
      } as DecantrTelemetryEvent;

      void client.capture(event);
      captureXPixelEvent(name);
    },
    [anonymousId, client, environment],
  );

  const setIdentity = useCallback((nextIdentity: RegistryWebIdentity) => {
    setIdentityState({
      actorType: nextIdentity.actorType ?? null,
      orgId: nextIdentity.orgId ?? null,
      plan: nextIdentity.plan ?? null,
      userId: nextIdentity.userId ?? null,
    });
  }, []);
  const getIdentity = useCallback(() => identityRef.current, []);

  const value = useMemo(
    () => ({
      capture,
      setIdentity,
    }),
    [capture, setIdentity],
  );

  return (
    <RegistryWebTelemetryContext.Provider value={value}>
      <Suspense fallback={null}>
        <RegistryWebRouteTracker getIdentity={getIdentity} />
      </Suspense>
      {children}
    </RegistryWebTelemetryContext.Provider>
  );
}

function RegistryWebRouteTracker({
  getIdentity,
}: {
  getIdentity: () => RegistryWebIdentity;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams.toString();
  const { capture } = useRegistryWebTelemetry();

  useEffect(() => {
    if (!pathname) return;

    updateCampaignAttribution();

    const currentIdentity = getIdentity();
    const route = classifyRoute(pathname);
    const surface = classifySurface(pathname);

    capture('registry_web.page_viewed', {
      authenticated: Boolean(currentIdentity.userId),
      orgScoped: Boolean(currentIdentity.orgId),
      plan: currentIdentity.plan ?? null,
      queryPresent: searchString.length > 0,
      route,
      routePath: pathname,
      surface,
    });

    const searchQuery = searchParams.get('q')?.trim() ?? '';
    if (pathname.startsWith('/browse') && searchQuery.length > 0) {
      capture('registry_web.search_performed', {
        contentType: getBrowseContentType(pathname, searchParams.get('type')),
        queryLength: searchQuery.length,
        sort: searchParams.get('sort') ?? null,
        sourceFilter: searchParams.get('source') ?? null,
        surface: 'registry_browser',
      });
    }

    const contentDetail = parseContentDetail(pathname);
    if (contentDetail) {
      capture('registry_web.content_opened', {
        contentSource: contentDetail.namespace === '@official' ? 'official' : 'community',
        contentType: contentDetail.contentType,
        namespace: contentDetail.namespace,
        slug: contentDetail.slug,
        surface: 'content_detail',
      });
    }
  }, [capture, getIdentity, pathname, searchParams, searchString]);

  return null;
}

export function RegistryWebTelemetryIdentity({
  actorType,
  orgId,
  plan,
  userId,
}: RegistryWebIdentity) {
  const { capture, setIdentity } = useRegistryWebTelemetry();
  const identityKey = `${actorType ?? 'auto'}:${userId ?? 'anonymous'}:${orgId ?? 'no-org'}:${plan ?? 'unknown'}`;
  const lastLinkedIdentity = useRef<string | null>(null);

  useEffect(() => {
    setIdentity({ actorType, orgId, plan, userId });
  }, [actorType, orgId, plan, setIdentity, userId]);

  useEffect(() => {
    if (!userId || lastLinkedIdentity.current === identityKey) return;
    lastLinkedIdentity.current = identityKey;

    capture('registry_web.identity_linked', {
      orgScoped: Boolean(orgId),
      plan: plan ?? null,
      surface: 'auth',
    });
  }, [capture, identityKey, orgId, plan, userId]);

  return null;
}

export function RegistryContentOpenedTracker({
  contentSource,
  contentType,
  namespace,
  slug,
  surface = 'content_detail',
}: {
  contentSource?: string | null;
  contentType: string;
  namespace?: string | null;
  slug?: string | null;
  surface?: string;
}) {
  const { capture } = useRegistryWebTelemetry();
  const eventKey = `${contentType}:${namespace ?? ''}:${slug ?? ''}:${surface}`;
  const sentKey = useRef<string | null>(null);

  useEffect(() => {
    if (sentKey.current === eventKey) return;
    sentKey.current = eventKey;

    capture('registry_web.content_opened', {
      contentSource: contentSource ?? null,
      contentType,
      namespace: namespace ?? null,
      slug: slug ?? null,
      surface,
    });
  }, [capture, contentSource, contentType, eventKey, namespace, slug, surface]);

  return null;
}

export function RegistryWebEventTracker({
  eventKey,
  name,
  properties,
}: {
  eventKey?: string;
  name: DecantrTelemetryEventName;
  properties: TelemetryProperties;
}) {
  const { capture } = useRegistryWebTelemetry();
  const stableEventKey = eventKey ?? `${name}:${JSON.stringify(properties)}`;
  const sentKey = useRef<string | null>(null);

  useEffect(() => {
    if (sentKey.current === stableEventKey) return;
    sentKey.current = stableEventKey;
    capture(name, properties);
  }, [capture, name, properties, stableEventKey]);

  return null;
}

export function useRegistryWebTelemetry() {
  return useContext(RegistryWebTelemetryContext);
}

function resolveTelemetryEndpoint(): string {
  const configuredEndpoint = process.env.NEXT_PUBLIC_DECANTR_TELEMETRY_ENDPOINT;
  if (configuredEndpoint) return configuredEndpoint;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return DEFAULT_ENDPOINT;

  return `${apiUrl.replace(/\/+$/, '')}/telemetry/events`;
}

function resolveTelemetryEnabled(endpoint: string): boolean {
  if (!endpoint) return false;
  if (process.env.NEXT_PUBLIC_DECANTR_TELEMETRY_DISABLED === 'true') return false;
  return true;
}

function resolveTelemetryEnvironment(): TelemetryEnvironment {
  const value = process.env.NEXT_PUBLIC_DECANTR_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (value === 'development' || value === 'preview' || value === 'production' || value === 'test') {
    return value;
  }
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
}

function inferRegistryWebActorType(identity: RegistryWebIdentity): TelemetryActorType {
  if (identity.userId || identity.orgId) return 'customer';
  return 'anonymous';
}

function resolveAnonymousId(): string {
  return resolveSharedAnonymousId(ANONYMOUS_ID_KEY, 'registry_web');
}

function classifySurface(pathname: string): string {
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname === '/login') return 'auth';
  if (pathname.startsWith('/browse')) return 'registry_browser';
  if (/^\/[^/]+\/[^/]+\/[^/]+/.test(pathname)) return 'content_detail';
  return 'public';
}

function classifyRoute(pathname: string): string {
  if (pathname === '/') return 'home';
  if (pathname === '/login') return 'login';
  if (pathname === '/browse') return 'browse';
  if (pathname.startsWith('/browse/')) return 'browse_type';
  if (pathname === '/dashboard/api-keys') return 'api_keys';
  if (pathname === '/dashboard/billing') return 'billing';
  if (pathname === '/dashboard/team') return 'team';
  if (pathname === '/dashboard/private-registry') return 'private_registry';
  if (pathname === '/dashboard/governance') return 'governance';
  if (pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/admin/organizations')) return 'admin_organizations';
  if (pathname.startsWith('/admin/telemetry')) return 'admin_telemetry';
  if (pathname.startsWith('/admin')) return 'admin';
  if (/^\/[^/]+\/[^/]+\/[^/]+/.test(pathname)) return 'content_detail';
  return 'other';
}

function getBrowseContentType(pathname: string, queryType: string | null): string {
  if (queryType) return queryType;

  const [, browse, type] = pathname.split('/');
  return browse === 'browse' && type ? type : 'all';
}

function parseContentDetail(pathname: string):
  | {
      contentType: string;
      namespace: string;
      slug: string;
    }
  | null {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length !== 3) return null;
  if (segments[0] === 'browse' || segments[0] === 'dashboard' || segments[0] === 'admin') {
    return null;
  }

  return {
    contentType: singularType(segments[0]),
    namespace: decodeURIComponent(segments[1]),
    slug: segments[2],
  };
}

function singularType(type: string): string {
  return type.endsWith('s') ? type.slice(0, -1) : type;
}
