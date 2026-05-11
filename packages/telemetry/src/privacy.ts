import type { DecantrTelemetryEvent, TelemetryPropertyValue } from './events.js';

export const REDACTED_VALUE = '[redacted]';

const DEFAULT_MAX_STRING_LENGTH = 240;
const DEFAULT_MAX_ARRAY_LENGTH = 25;
const DEFAULT_MAX_OBJECT_KEYS = 80;
const DEFAULT_MAX_DEPTH = 4;

const SENSITIVE_KEY_PATTERNS = [
  /^api[_-]?key$/i,
  /^authorization$/i,
  /^code$/i,
  /^content$/i,
  /^contents$/i,
  /^cookie$/i,
  /^cwd$/i,
  /^email$/i,
  /^env$/i,
  /^file[_-]?contents$/i,
  /^file[_-]?path$/i,
  /^home$/i,
  /^ip[_-]?address$/i,
  /^package[_-]?slug$/i,
  /^password$/i,
  /^path$/i,
  /^prompt$/i,
  /^private[_-]?package[_-]?slug$/i,
  /^repo$/i,
  /^repository$/i,
  /^repository[_-]?name$/i,
  /^route[_-]?name$/i,
  /^route[_-]?names$/i,
  /^raw[_-]?prompt$/i,
  /^secret$/i,
  /^source$/i,
  /^source[_-]?code$/i,
  /^token$/i,
  /^url$/i,
  /^user[_-]?agent$/i,
];

export interface TelemetryRedactionOptions {
  maxArrayLength?: number;
  maxDepth?: number;
  maxObjectKeys?: number;
  maxStringLength?: number;
  redactedValue?: string;
  sensitiveKeyPatterns?: RegExp[];
}

export function isSensitiveTelemetryKey(key: string, patterns = SENSITIVE_KEY_PATTERNS): boolean {
  return patterns.some((pattern) => pattern.test(key));
}

export function sanitizeTelemetryValue(
  value: TelemetryPropertyValue,
  options: TelemetryRedactionOptions = {},
  depth = 0,
): TelemetryPropertyValue {
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  if (depth > maxDepth) {
    return options.redactedValue ?? REDACTED_VALUE;
  }

  if (typeof value === 'string') {
    const maxStringLength = options.maxStringLength ?? DEFAULT_MAX_STRING_LENGTH;
    return value.length > maxStringLength ? `${value.slice(0, maxStringLength)}...` : value;
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return value;
  }

  if (value === undefined) {
    return null;
  }

  if (Array.isArray(value)) {
    const maxArrayLength = options.maxArrayLength ?? DEFAULT_MAX_ARRAY_LENGTH;
    return value
      .slice(0, maxArrayLength)
      .map((entry) => sanitizeTelemetryValue(entry, options, depth + 1));
  }

  const redactedValue = options.redactedValue ?? REDACTED_VALUE;
  const sensitiveKeyPatterns = options.sensitiveKeyPatterns ?? SENSITIVE_KEY_PATTERNS;
  const maxObjectKeys = options.maxObjectKeys ?? DEFAULT_MAX_OBJECT_KEYS;
  const entries = Object.entries(value).slice(0, maxObjectKeys);
  const sanitized: Record<string, TelemetryPropertyValue> = {};

  for (const [key, entryValue] of entries) {
    sanitized[key] = isSensitiveTelemetryKey(key, sensitiveKeyPatterns)
      ? redactedValue
      : sanitizeTelemetryValue(entryValue, options, depth + 1);
  }

  return sanitized;
}

export function sanitizeTelemetryEvent(
  event: DecantrTelemetryEvent,
  options: TelemetryRedactionOptions = {},
): DecantrTelemetryEvent {
  return {
    ...event,
    properties: sanitizeTelemetryValue(
      event.properties,
      options,
    ) as DecantrTelemetryEvent['properties'],
  } as DecantrTelemetryEvent;
}
