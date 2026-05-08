import type { DecantrTelemetryEventName } from '@decantr/telemetry';

type TwqFunction = {
  (...args: unknown[]): void;
  exe?: (...args: unknown[]) => void;
  queue?: unknown[];
  version?: string;
};

declare global {
  interface Window {
    twq?: TwqFunction;
  }
}

const configuredPixels = new Set<string>();

const eventIds: Partial<Record<DecantrTelemetryEventName, string | undefined>> = {
  'marketing_web.command_clicked': process.env.NEXT_PUBLIC_X_EVENT_MARKETING_COMMAND_CLICKED_ID,
  'marketing_web.cta_clicked': process.env.NEXT_PUBLIC_X_EVENT_MARKETING_CTA_CLICKED_ID,
  'marketing_web.outbound_clicked': process.env.NEXT_PUBLIC_X_EVENT_MARKETING_OUTBOUND_CLICKED_ID,
  'marketing_web.page_viewed': process.env.NEXT_PUBLIC_X_EVENT_MARKETING_PAGE_VIEWED_ID,
  'registry_web.api_key_page_viewed': process.env.NEXT_PUBLIC_X_EVENT_API_KEY_PAGE_VIEWED_ID,
  'registry_web.billing_viewed': process.env.NEXT_PUBLIC_X_EVENT_BILLING_VIEWED_ID,
  'registry_web.content_opened': process.env.NEXT_PUBLIC_X_EVENT_CONTENT_OPENED_ID,
  'registry_web.page_viewed': process.env.NEXT_PUBLIC_X_EVENT_PAGE_VIEWED_ID,
  'registry_web.search_performed': process.env.NEXT_PUBLIC_X_EVENT_SEARCH_PERFORMED_ID,
  'registry_web.signup_clicked': process.env.NEXT_PUBLIC_X_EVENT_SIGNUP_CLICKED_ID,
};

export function initXPixel(): void {
  if (!isBrowser()) return;

  const pixelId = getPixelId();
  if (!pixelId) return;

  ensureTwq();

  if (!configuredPixels.has(pixelId)) {
    window.twq?.('config', pixelId);
    configuredPixels.add(pixelId);
  }
}

export function captureXPixelEvent(name: DecantrTelemetryEventName): void {
  if (!isBrowser()) return;

  const eventId = eventIds[name]?.trim();
  if (!eventId) return;

  initXPixel();
  window.twq?.('event', eventId);
}

function ensureTwq(): void {
  if (window.twq) return;

  const queueingTwq = function (...args: unknown[]) {
    if (queueingTwq.exe) {
      queueingTwq.exe(...args);
      return;
    }
    queueingTwq.queue?.push(args);
  } as TwqFunction;

  queueingTwq.version = '1.1';
  queueingTwq.queue = [];
  window.twq = queueingTwq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://static.ads-twitter.com/uwt.js';

  const firstScript = document.getElementsByTagName('script')[0];
  firstScript?.parentNode?.insertBefore(script, firstScript);
}

function getPixelId(): string {
  return process.env.NEXT_PUBLIC_X_PIXEL_ID?.trim() ?? '';
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}
