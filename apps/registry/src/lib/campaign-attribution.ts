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
  channel?: string | null;
  clickIdPresent?: boolean;
  clickIdProvider?: string | null;
  landingPath?: string | null;
  landingIntent?: string | null;
  landingPageKind?: string | null;
  referrerDomain?: string | null;
  source?: string | null;
  sourceCategory?: string | null;
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
  const first = enrichTouch(state.first);
  const last = enrichTouch(state.last);
  const current = last ?? first ?? buildDirectTouch();

  return {
    attributionChannel: current.channel ?? null,
    attributionClickIdProvider: current.clickIdProvider ?? null,
    attributionClickIdPresent: Boolean(current.clickIdPresent),
    attributionFirstChannel: first?.channel ?? null,
    attributionFirstLandingPath: first?.landingPath ?? null,
    attributionFirstLandingIntent: first?.landingIntent ?? null,
    attributionFirstLandingPageKind: first?.landingPageKind ?? null,
    attributionFirstReferrerDomain: first?.referrerDomain ?? null,
    attributionFirstSource: first?.source ?? null,
    attributionFirstSourceCategory: first?.sourceCategory ?? null,
    attributionFirstUtmCampaign: first?.utm?.utm_campaign ?? null,
    attributionFirstUtmContent: first?.utm?.utm_content ?? null,
    attributionFirstUtmId: first?.utm?.utm_id ?? null,
    attributionFirstUtmMedium: first?.utm?.utm_medium ?? null,
    attributionFirstUtmSource: first?.utm?.utm_source ?? null,
    attributionFirstUtmTerm: first?.utm?.utm_term ?? null,
    attributionLandingPath: current.landingPath ?? null,
    attributionLandingIntent: current.landingIntent ?? null,
    attributionLandingPageKind: current.landingPageKind ?? null,
    attributionLastChannel: last?.channel ?? null,
    attributionLastLandingPath: last?.landingPath ?? null,
    attributionLastLandingIntent: last?.landingIntent ?? null,
    attributionLastLandingPageKind: last?.landingPageKind ?? null,
    attributionLastReferrerDomain: last?.referrerDomain ?? null,
    attributionLastSource: last?.source ?? null,
    attributionLastSourceCategory: last?.sourceCategory ?? null,
    attributionLastUtmCampaign: last?.utm?.utm_campaign ?? null,
    attributionLastUtmContent: last?.utm?.utm_content ?? null,
    attributionLastUtmId: last?.utm?.utm_id ?? null,
    attributionLastUtmMedium: last?.utm?.utm_medium ?? null,
    attributionLastUtmSource: last?.utm?.utm_source ?? null,
    attributionLastUtmTerm: last?.utm?.utm_term ?? null,
    attributionReferrerDomain: current.referrerDomain ?? null,
    attributionSource: current.source ?? null,
    attributionSourceCategory: current.sourceCategory ?? null,
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

  return enrichTouch({
    clickIdPresent: hasClickId,
    clickIdProvider,
    landingPath: window.location.pathname || '/',
    referrerDomain,
    timestamp: new Date().toISOString(),
    utm,
  });
}

function buildDirectTouch(): CampaignTouch {
  const touch: CampaignTouch = {
    clickIdPresent: false,
    clickIdProvider: null,
    landingPath: window.location.pathname || '/',
    referrerDomain: null,
    timestamp: new Date().toISOString(),
    utm: {},
  };

  return enrichTouch(touch) ?? touch;
}

function enrichTouch(touch: CampaignTouch | null | undefined): CampaignTouch | null {
  if (!touch) return null;

  const landingPath = touch.landingPath ?? (isBrowser() ? window.location.pathname || '/' : '/');
  const utm = touch.utm ?? {};
  const source = touch.source ?? classifySource(utm, touch.clickIdProvider ?? null, touch.referrerDomain ?? null);
  const channel =
    touch.channel ?? classifyChannel(utm, touch.clickIdProvider ?? null, touch.referrerDomain ?? null);

  return {
    ...touch,
    channel,
    landingPath,
    landingIntent: touch.landingIntent ?? classifyLandingIntent(landingPath, utm),
    landingPageKind: touch.landingPageKind ?? classifyLandingPageKind(landingPath),
    source,
    sourceCategory: touch.sourceCategory ?? classifySourceCategory(source, channel),
  };
}

function classifySource(
  utm: Partial<Record<UtmKey, string>>,
  clickIdProvider: string | null,
  referrerDomain: string | null,
): string {
  const utmSource = normalizeValue(utm.utm_source);
  if (utmSource) return utmSource;
  if (clickIdProvider) return normalizeValue(clickIdProvider) ?? 'paid';
  if (referrerDomain) return normalizeReferrerSource(referrerDomain);
  return 'direct';
}

function classifyChannel(
  utm: Partial<Record<UtmKey, string>>,
  clickIdProvider: string | null,
  referrerDomain: string | null,
): string {
  const medium = normalizeValue(utm.utm_medium);
  const source = normalizeValue(utm.utm_source);

  if (clickIdProvider === 'google' || clickIdProvider === 'microsoft') return 'paid_search';
  if (clickIdProvider) return 'paid_social';

  if (medium?.includes('paid') && medium.includes('search')) return 'paid_search';
  if (medium?.includes('cpc') || medium?.includes('ppc') || medium?.includes('sem')) return 'paid_search';
  if (medium?.includes('paid') && medium.includes('social')) return 'paid_social';
  if (medium === 'organic-social' || medium === 'social') return 'organic_social';
  if (medium === 'package-registry') return 'package_registry';
  if (medium === 'community') return 'community';
  if (medium === 'docs') return 'docs';
  if (medium === 'email' || medium === 'newsletter') return 'email';
  if (medium === 'launch') return 'launch';
  if (medium === 'referral' || medium === 'partner') return 'referral';

  if (source && ['github', 'npm', 'jsr'].includes(source)) return source === 'npm' || source === 'jsr' ? 'package_registry' : 'developer_referral';
  if (source && ['x', 'twitter', 'linkedin', 'meta', 'facebook', 'threads', 'tiktok'].includes(source)) {
    return 'organic_social';
  }
  if (source && ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot'].includes(source)) return 'ai_referral';

  if (!referrerDomain) return 'direct';

  const referrer = normalizeReferrerSource(referrerDomain);
  if (isSearchSource(referrer)) return 'organic_search';
  if (isAiSource(referrer)) return 'ai_referral';
  if (['github', 'stackoverflow', 'hackernews', 'news.ycombinator'].includes(referrer)) return 'developer_referral';
  if (['npm', 'jsr'].includes(referrer)) return 'package_registry';
  if (['x', 'twitter', 'linkedin', 'reddit', 'youtube', 'facebook', 'threads', 'tiktok'].includes(referrer)) {
    return 'organic_social';
  }

  return 'referral';
}

function classifySourceCategory(source: string | null | undefined, channel: string | null | undefined): string {
  if (channel === 'organic_search' || channel === 'paid_search') return 'search';
  if (channel === 'ai_referral') return 'ai';
  if (channel === 'developer_referral' || channel === 'package_registry' || channel === 'docs') return 'developer';
  if (channel === 'paid_social' || channel === 'organic_social' || channel === 'community') return 'social';
  if (channel === 'email') return 'email';
  if (channel === 'direct') return 'direct';
  if (source && isSearchSource(source)) return 'search';
  if (source && isAiSource(source)) return 'ai';
  return 'referral';
}

function classifyLandingIntent(
  landingPath: string,
  utm: Partial<Record<UtmKey, string>>,
): string {
  const text = [
    landingPath,
    utm.utm_campaign,
    utm.utm_content,
    utm.utm_term,
    utm.utm_source,
    utm.utm_medium,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (text.includes('mcp')) return 'mcp';
  if (text.includes('project-health') || text.includes('health-ci') || text.includes('project health')) {
    return 'project_health_ci';
  }
  if (text.includes('existing-app') || text.includes('brownfield')) return 'existing_app_adoption';
  if (text.includes('ai-assistant') || text.includes('cursor') || text.includes('claude') || text.includes('codex')) {
    return 'ai_assistant_setup';
  }
  if (text.includes('design-contract') || text.includes('guardrail') || text.includes('design-token')) {
    return 'design_guardrails';
  }
  if (text.includes('registry') || text.includes('pattern') || text.includes('theme') || text.includes('blueprint')) {
    return 'registry_content';
  }
  if (text.includes('cli') || text.includes('install') || text.includes('quickstart')) return 'cli_install';
  if (landingPath.startsWith('/guides/') || landingPath.startsWith('/reference/')) return 'docs_reference';
  if (landingPath === '/' || text.includes('decantr-ai') || text.includes('brand')) return 'brand';
  return 'unknown';
}

function classifyLandingPageKind(landingPath: string): string {
  if (landingPath === '/') return 'homepage';
  if (landingPath.startsWith('/guides/')) return 'guide';
  if (landingPath.startsWith('/reference/')) return 'reference';
  if (landingPath.startsWith('/showcase/')) return 'showcase';
  if (landingPath.startsWith('/browse')) return 'registry_browse';
  if (landingPath.startsWith('/dashboard')) return 'dashboard';
  if (landingPath.startsWith('/admin')) return 'admin';
  if (landingPath === '/login') return 'auth';
  if (/^\/[^/]+\/[^/]+\/[^/]+/.test(landingPath)) return 'registry_detail';
  return 'other';
}

function normalizeValue(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase().replace(/^www\./, '');
  return normalized ? normalized.slice(0, 80) : null;
}

function hostnameLabels(hostname: string): string[] {
  return hostname.toLowerCase().split('.').filter(Boolean);
}

function hostnameHasLabel(hostname: string, label: string): boolean {
  return hostnameLabels(hostname).includes(label);
}

function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  const labels = hostnameLabels(hostname);
  const domainLabels = hostnameLabels(domain);
  if (labels.length < domainLabels.length) return false;
  return domainLabels.every((label, index) => labels[labels.length - domainLabels.length + index] === label);
}

function normalizeReferrerSource(domain: string): string {
  const normalized = normalizeValue(domain) ?? 'referral';
  if (hostnameHasLabel(normalized, 'google')) return 'google';
  if (hostnameHasLabel(normalized, 'bing')) return 'bing';
  if (hostnameHasLabel(normalized, 'duckduckgo')) return 'duckduckgo';
  if (hostnameHasLabel(normalized, 'yahoo')) return 'yahoo';
  if (hostnameHasLabel(normalized, 'chatgpt') || hostnameHasLabel(normalized, 'openai')) return 'chatgpt';
  if (hostnameHasLabel(normalized, 'perplexity')) return 'perplexity';
  if (hostnameHasLabel(normalized, 'claude') || hostnameHasLabel(normalized, 'anthropic')) return 'claude';
  if (hostnameHasLabel(normalized, 'gemini') || hostnameMatchesDomain(normalized, 'bard.google.com')) return 'gemini';
  if (hostnameHasLabel(normalized, 'github')) return 'github';
  if (hostnameHasLabel(normalized, 'npmjs')) return 'npm';
  if (hostnameHasLabel(normalized, 'jsr')) return 'jsr';
  if (hostnameMatchesDomain(normalized, 'x.com') || hostnameHasLabel(normalized, 'twitter')) return 'x';
  if (hostnameHasLabel(normalized, 'linkedin')) return 'linkedin';
  if (hostnameHasLabel(normalized, 'reddit')) return 'reddit';
  if (hostnameMatchesDomain(normalized, 'news.ycombinator.com')) return 'news.ycombinator';
  if (hostnameHasLabel(normalized, 'stackoverflow')) return 'stackoverflow';
  if (hostnameHasLabel(normalized, 'discord')) return 'discord';
  if (hostnameHasLabel(normalized, 'youtube')) return 'youtube';
  return normalized.slice(0, 80);
}

function isSearchSource(source: string): boolean {
  return ['google', 'bing', 'duckduckgo', 'yahoo', 'yandex', 'baidu', 'kagi'].includes(source);
}

function isAiSource(source: string): boolean {
  return ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot'].includes(source);
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
  return hostnameMatchesDomain(hostname, 'decantr.ai');
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
