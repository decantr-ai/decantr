import type { CampaignAttributionProperties } from '@decantr/telemetry';

const ATTRIBUTION_FIRST_STORAGE_KEY = 'decantr:attribution:first';
const ATTRIBUTION_LAST_STORAGE_KEY = 'decantr:attribution:last';
const ATTRIBUTION_FIRST_COOKIE = 'decantr_attr_first';
const ATTRIBUTION_LAST_COOKIE = 'decantr_attr_last';
const SHARED_ANONYMOUS_COOKIE = 'decantr_anonymous_id';
const ATTRIBUTION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
] as const;

const CLICK_ID_PARAMS = [
  ['twclid', 'x'],
  ['gclid', 'google'],
  ['gbraid', 'google'],
  ['wbraid', 'google'],
  ['fbclid', 'meta'],
  ['msclkid', 'microsoft'],
  ['ttclid', 'tiktok'],
  ['li_fat_id', 'linkedin'],
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

interface CampaignTouch {
  clickIdPresent?: boolean;
  clickIdProvider?: string | null;
  landingPath?: string | null;
  referrerDomain?: string | null;
  timestamp?: string;
  utm?: Partial<Record<UtmKey, string>>;
}

interface AttributionState {
  first?: CampaignTouch | null;
  last?: CampaignTouch | null;
}

export function updateCampaignAttribution(): AttributionState {
  if (!isBrowser()) return {};

  const existing = readAttributionState();
  const current = buildCurrentTouch();

  if (!current) return existing;

  const next = {
    first: existing.first ?? current,
    last: current,
  };

  writeTouch(ATTRIBUTION_FIRST_STORAGE_KEY, ATTRIBUTION_FIRST_COOKIE, next.first);
  writeTouch(ATTRIBUTION_LAST_STORAGE_KEY, ATTRIBUTION_LAST_COOKIE, next.last);

  return next;
}

export function getCampaignAttributionProperties(): CampaignAttributionProperties {
  if (!isBrowser()) return {};

  const state = readAttributionState();
  const current = state.last ?? state.first;
  if (!current) return {};

  return {
    attributionClickIdProvider: current.clickIdProvider ?? null,
    attributionClickIdPresent: Boolean(current.clickIdPresent),
    attributionFirstLandingPath: state.first?.landingPath ?? null,
    attributionFirstReferrerDomain: state.first?.referrerDomain ?? null,
    attributionFirstUtmCampaign: state.first?.utm?.utm_campaign ?? null,
    attributionFirstUtmContent: state.first?.utm?.utm_content ?? null,
    attributionFirstUtmId: state.first?.utm?.utm_id ?? null,
    attributionFirstUtmMedium: state.first?.utm?.utm_medium ?? null,
    attributionFirstUtmSource: state.first?.utm?.utm_source ?? null,
    attributionFirstUtmTerm: state.first?.utm?.utm_term ?? null,
    attributionLandingPath: current.landingPath ?? null,
    attributionLastLandingPath: state.last?.landingPath ?? null,
    attributionLastReferrerDomain: state.last?.referrerDomain ?? null,
    attributionLastUtmCampaign: state.last?.utm?.utm_campaign ?? null,
    attributionLastUtmContent: state.last?.utm?.utm_content ?? null,
    attributionLastUtmId: state.last?.utm?.utm_id ?? null,
    attributionLastUtmMedium: state.last?.utm?.utm_medium ?? null,
    attributionLastUtmSource: state.last?.utm?.utm_source ?? null,
    attributionLastUtmTerm: state.last?.utm?.utm_term ?? null,
    attributionReferrerDomain: current.referrerDomain ?? null,
    attributionUtmCampaign: current.utm?.utm_campaign ?? null,
    attributionUtmContent: current.utm?.utm_content ?? null,
    attributionUtmId: current.utm?.utm_id ?? null,
    attributionUtmMedium: current.utm?.utm_medium ?? null,
    attributionUtmSource: current.utm?.utm_source ?? null,
    attributionUtmTerm: current.utm?.utm_term ?? null,
  };
}

export function decorateUrlWithCurrentAttribution(input: string): string {
  if (!isBrowser()) return input;

  let url: URL;
  try {
    url = new URL(input, window.location.href);
  } catch {
    return input;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return input;
  if (!isDecantrHostname(url.hostname)) return input;

  const params = new URLSearchParams(window.location.search);
  let decorated = false;

  for (const key of UTM_KEYS) {
    const value = readQueryParam(params, key);
    if (value && !url.searchParams.has(key)) {
      url.searchParams.set(key, value);
      decorated = true;
    }
  }

  return decorated ? url.toString() : input;
}

export function resolveSharedAnonymousId(storageKey: string, prefix: string): string {
  if (!isBrowser()) {
    return `${prefix}:${Math.random().toString(36).slice(2)}`;
  }

  const cookieId = readCookie(SHARED_ANONYMOUS_COOKIE);
  if (cookieId) {
    writeLocalStorage(storageKey, cookieId);
    return cookieId;
  }

  const storedId = readLocalStorage(storageKey);
  if (storedId) {
    writeCookie(SHARED_ANONYMOUS_COOKIE, storedId);
    return storedId;
  }

  const generated = `${prefix}:${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  writeLocalStorage(storageKey, generated);
  writeCookie(SHARED_ANONYMOUS_COOKIE, generated);
  return generated;
}

function readAttributionState(): AttributionState {
  return {
    first: readTouch(ATTRIBUTION_FIRST_STORAGE_KEY, ATTRIBUTION_FIRST_COOKIE),
    last: readTouch(ATTRIBUTION_LAST_STORAGE_KEY, ATTRIBUTION_LAST_COOKIE),
  };
}

function buildCurrentTouch(): CampaignTouch | null {
  const params = new URLSearchParams(window.location.search);
  const utm: Partial<Record<UtmKey, string>> = {};

  for (const key of UTM_KEYS) {
    const value = readQueryParam(params, key);
    if (value) utm[key] = value;
  }

  const clickIdProvider = getClickIdProvider(params);
  const referrerDomain = getExternalReferrerDomain();
  const hasUtm = Object.keys(utm).length > 0;
  const hasClickId = Boolean(clickIdProvider);

  if (!hasUtm && !hasClickId && !referrerDomain) return null;

  return {
    clickIdPresent: hasClickId,
    clickIdProvider,
    landingPath: window.location.pathname || '/',
    referrerDomain,
    timestamp: new Date().toISOString(),
    utm,
  };
}

function getClickIdProvider(params: URLSearchParams): string | null {
  for (const [key, provider] of CLICK_ID_PARAMS) {
    if (readQueryParam(params, key)) return provider;
  }
  return null;
}

function getExternalReferrerDomain(): string | null {
  const referrer = document.referrer;
  if (!referrer) return null;

  try {
    const domain = new URL(referrer).hostname.replace(/^www\./, '');
    const current = window.location.hostname.replace(/^www\./, '');
    return domain && domain !== current ? domain : null;
  } catch {
    return null;
  }
}

function readQueryParam(params: URLSearchParams, key: string): string | null {
  const value = params.get(key)?.trim();
  return value ? value.slice(0, 120) : null;
}

function readTouch(storageKey: string, cookieName: string): CampaignTouch | null {
  return parseTouch(readCookie(cookieName)) ?? parseTouch(readLocalStorage(storageKey));
}

function writeTouch(storageKey: string, cookieName: string, touch: CampaignTouch | null | undefined) {
  if (!touch) return;
  const encoded = JSON.stringify(touch);
  writeLocalStorage(storageKey, encoded);
  writeCookie(cookieName, encoded);
}

function parseTouch(value: string | null): CampaignTouch | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as CampaignTouch;
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Local storage can be unavailable in private browsing or blocked contexts.
  }
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

function writeCookie(name: string, value: string) {
  const pieces = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    `Max-Age=${ATTRIBUTION_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
  ];

  const domain = getCookieDomain();
  if (domain) pieces.push(`Domain=${domain}`);
  if (window.location.protocol === 'https:') pieces.push('Secure');

  document.cookie = pieces.join('; ');
}

function getCookieDomain(): string | null {
  const hostname = window.location.hostname;
  if (isDecantrHostname(hostname)) return '.decantr.ai';
  return null;
}

function isDecantrHostname(hostname: string): boolean {
  return hostname === 'decantr.ai' || hostname.endsWith('.decantr.ai');
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
