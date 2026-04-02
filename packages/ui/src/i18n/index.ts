/**
 * Decantr i18n — Internationalization module
 *
 * Reactive locale management, translations with interpolation,
 * pluralization via Intl.PluralRules, RTL/LTR direction, and
 * runtime message merging.
 *
 * Zero dependencies — uses only Decantr signals + built-in Intl APIs.
 */

import { createSignal, createMemo } from '../state/index.js';

export interface I18nConfig {
  locale: string;
  messages: Record<string, Record<string, any>>;
  fallbackLocale?: string;
}

export interface I18nInstance {
  t: (key: string, params?: Record<string, any>) => string;
  locale: () => string;
  setLocale: (locale: string) => void;
  setDirection: (dir: 'ltr' | 'rtl') => void;
  addMessages: (locale: string, messages: Record<string, any>) => void;
}

/**
 * Resolve a dot-notation key against a nested message object.
 * Example: resolve('nav.home', { nav: { home: 'Home' } }) => 'Home'
 * @param {string} key - Dot-delimited key path
 * @param {Record<string, any>} messages - Nested message object
 * @returns {string|undefined}
 */
function resolve(key: any, messages: any) {
  if (!messages || typeof messages !== 'object') return undefined;
  const parts = key.split('.');
  let current = messages;
  for (let i = 0; i < parts.length; i++) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[parts[i]];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Interpolate {param} placeholders in a template string.
 * @param {string} template
 * @param {Record<string, any>} [params]
 * @returns {string}
 */
function interpolate(template: any, params: any) {
  if (!params || typeof params !== 'object') return template;
  return template.replace(/\{(\w+)\}/g, (match: any, name: any) => {
    return params[name] !== undefined ? String(params[name]) : match;
  });
}

/**
 * Create an i18n instance with reactive locale tracking.
 *
 * @param {Object} config
 * @param {string} config.locale - Initial locale (e.g. 'en')
 * @param {Record<string, Record<string, any>>} config.messages - Messages keyed by locale
 * @param {string} [config.fallbackLocale] - Fallback locale when key not found in current
 * @returns {{
 *   t: (key: string, params?: Record<string, any>) => string,
 *   locale: () => string,
 *   setLocale: (locale: string) => void,
 *   setDirection: (dir: 'ltr' | 'rtl') => void,
 *   addMessages: (locale: string, messages: Record<string, any>) => void
 * }}
 */
export function createI18n(config: I18nConfig): I18nInstance {
  if (!config || typeof config !== 'object') {
    throw new Error('createI18n requires a config object');
  }
  if (typeof config.locale !== 'string' || !config.locale) {
    throw new Error('createI18n requires a non-empty locale string');
  }
  if (!config.messages || typeof config.messages !== 'object') {
    throw new Error('createI18n requires a messages object');
  }

  // Deep-clone messages so mutations to the original don't leak in
  const messageStore = {};
  for (const loc of Object.keys(config.messages)) {
    // @ts-expect-error -- strict-mode fix (auto)
    messageStore[loc] = deepClone(config.messages[loc]);
  }

  const [locale, setLocaleSignal] = createSignal(config.locale);
  const fallbackLocale = config.fallbackLocale || null;

  // Internal version signal — bumped when addMessages is called
  // so that memos/effects depending on t() re-evaluate.
  const [version, setVersion] = createSignal(0);

  /**
   * Translate a key with optional interpolation and pluralization.
   *
   * Pluralization: if params.count is a number, appends a plural suffix
   * (_zero, _one, _two, _few, _many, _other) using Intl.PluralRules.
   * Falls back to the unsuffixed key if the plural form is not found.
   *
   * Fallback chain: current locale -> fallback locale -> raw key.
   *
   * @param {string} key
   * @param {Record<string, any>} [params]
   * @returns {string}
   */
  function t(key: any, params: any) {
    // Read reactive dependencies so effects/memos track locale changes
    const currentLocale = locale();
    // Read version to re-evaluate when messages are added
    version();

    if (typeof key !== 'string') return '';

    // @ts-expect-error -- strict-mode fix (auto)
    const currentMessages = messageStore[currentLocale];
    // @ts-expect-error -- strict-mode fix (auto)
    const fallbackMessages = fallbackLocale ? messageStore[fallbackLocale] : null;

    // Determine if pluralization is needed
    let resolvedKey = key;
    if (params && typeof params.count === 'number') {
      const pluralSuffix = getPluralSuffix(currentLocale, params.count);
      const pluralKey = key + '_' + pluralSuffix;

      // Try plural key first in current locale, then fallback, then try base key
      const pluralResult = resolve(pluralKey, currentMessages);
      if (pluralResult !== undefined) {
        return interpolate(pluralResult, params);
      }
      // Try plural key in fallback locale
      if (fallbackMessages) {
        const fallbackPlural = resolve(pluralKey, fallbackMessages);
        if (fallbackPlural !== undefined) {
          return interpolate(fallbackPlural, params);
        }
      }
      // Fall through to base key resolution
    }

    // Try current locale
    const result = resolve(resolvedKey, currentMessages);
    if (result !== undefined) {
      return interpolate(result, params);
    }

    // Try fallback locale
    if (fallbackMessages) {
      const fallbackResult = resolve(resolvedKey, fallbackMessages);
      if (fallbackResult !== undefined) {
        return interpolate(fallbackResult, params);
      }
    }

    // Return the key itself as last resort
    return key;
  }

  /**
   * Set the active locale.
   * @param {string} loc
   */
  function setLocale(loc: any) {
    if (typeof loc !== 'string' || !loc) return;
    setLocaleSignal(loc);
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.lang = loc;
    }
  }

  /**
   * Set document direction (LTR/RTL).
   * @param {'ltr' | 'rtl'} dir
   */
  function setDirection(dir: any) {
    if (dir !== 'ltr' && dir !== 'rtl') return;
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('dir', dir);
    }
  }

  /**
   * Add or merge messages for a locale at runtime.
   * @param {string} loc - Target locale
   * @param {Record<string, any>} messages - Messages to merge
   */
  function addMessages(loc: any, messages: any) {
    if (typeof loc !== 'string' || !loc) return;
    if (!messages || typeof messages !== 'object') return;

    // @ts-expect-error -- strict-mode fix (auto)
    if (!messageStore[loc]) {
      // @ts-expect-error -- strict-mode fix (auto)
      messageStore[loc] = {};
    }
    // @ts-expect-error -- strict-mode fix (auto)
    deepMerge(messageStore[loc], messages);
    // Bump version so reactive consumers re-evaluate
    setVersion(v => v + 1);
  }

  return {
    t,
    locale,
    setLocale,
    setDirection,
    addMessages
  };
}

// ─── Internal Helpers ─────────────────────────────────────────

/**
 * Get the plural category suffix for a given locale and count.
 * Uses Intl.PluralRules when available, falls back to basic logic.
 * @param {string} locale
 * @param {number} count
 * @returns {string} - 'zero' | 'one' | 'two' | 'few' | 'many' | 'other'
 */
function getPluralSuffix(locale: any, count: any) {
  if (typeof Intl !== 'undefined' && Intl.PluralRules) {
    try {
      const rules = new Intl.PluralRules(locale);
      return rules.select(count);
    } catch (e) {
      // Invalid locale — fall through to basic logic
    }
  }
  // Basic fallback: English-like pluralization
  if (count === 0) return 'zero';
  if (count === 1) return 'one';
  return 'other';
}

/**
 * Deep-clone a plain object/value.
 * @param {any} obj
 * @returns {any}
 */
// @ts-expect-error -- strict-mode fix (auto)
function deepClone(obj: any) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepClone);
  const result = {};
  for (const key of Object.keys(obj)) {
    // @ts-expect-error -- strict-mode fix (auto)
    result[key] = deepClone(obj[key]);
  }
  return result;
}

/**
 * Deep-merge source into target, mutating target in place.
 * @param {Record<string, any>} target
 * @param {Record<string, any>} source
 */
function deepMerge(target: any, source: any) {
  for (const key of Object.keys(source)) {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = deepClone(source[key]);
    }
  }
}
