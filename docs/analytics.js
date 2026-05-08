(function () {
  'use strict';

  var config = window.DECANTR_ANALYTICS_CONFIG || {};
  var endpoint = config.telemetryEndpoint || 'https://api.decantr.ai/v1/telemetry/events';
  var environment = config.environment || 'production';
  var disabled = config.disabled === true || config.disabled === 'true';
  var hostname = window.location.hostname.toLowerCase();
  var enabledHost = config.forceEnabled === true || isDecantrDeployHostname(hostname);

  var SCHEMA_VERSION = '0.1.0';
  var SERVICE_NAME = 'decantr-marketing-web';
  var ATTRIBUTION_FIRST_STORAGE_KEY = 'decantr:attribution:first';
  var ATTRIBUTION_LAST_STORAGE_KEY = 'decantr:attribution:last';
  var ATTRIBUTION_FIRST_COOKIE = 'decantr_attr_first';
  var ATTRIBUTION_LAST_COOKIE = 'decantr_attr_last';
  var ANONYMOUS_STORAGE_KEY = 'decantr:marketing-web:anonymous-id';
  var ANONYMOUS_COOKIE = 'decantr_anonymous_id';
  var MAX_AGE_SECONDS = 90 * 24 * 60 * 60;
  var UTM_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'utm_id',
  ];
  var CLICK_ID_PARAMS = [
    ['twclid', 'x'],
    ['gclid', 'google'],
    ['gbraid', 'google'],
    ['wbraid', 'google'],
    ['fbclid', 'meta'],
    ['msclkid', 'microsoft'],
    ['ttclid', 'tiktok'],
    ['li_fat_id', 'linkedin'],
  ];

  if (disabled || !endpoint || !enabledHost) return;

  onReady(function () {
    updateAttribution();
    initXPixel();
    capture('marketing_web.page_viewed', {
      routePath: window.location.pathname || '/',
      surface: classifyPageSurface(),
    });
  });

  document.addEventListener(
    'click',
    function (event) {
      var installTab = closestElement(event.target, '.install-tab-btn');
      if (installTab) {
        capture('marketing_web.command_clicked', {
          commandKind: 'mcp',
          commandLabel: normalizeLabel(
            installTab.getAttribute('data-install') || installTab.textContent || '',
          ),
          surface: surfaceForElement(installTab),
        });
        return;
      }

      var command = closestElement(event.target, '.showcase-code, .qs-code-block');
      if (command) {
        capture('marketing_web.command_clicked', {
          commandKind: classifyCommand(command.textContent || ''),
          commandLabel: normalizeLabel(command.textContent || ''),
          surface: surfaceForElement(command),
        });
        return;
      }

      var anchor = closestElement(event.target, 'a[href]');
      if (!anchor) return;

      decorateAnchor(anchor);

      var destination = classifyDestination(anchor);
      var properties = {
        destination: destination,
        label: normalizeLabel(anchor.textContent || anchor.getAttribute('aria-label') || ''),
        surface: surfaceForElement(anchor),
      };

      if (isCta(anchor, destination)) {
        capture('marketing_web.cta_clicked', properties);
        return;
      }

      if (isOutbound(destination)) {
        capture('marketing_web.outbound_clicked', properties);
      }
    },
    true,
  );

  window.DecantrAnalytics = {
    capture: capture,
  };

  function capture(name, properties) {
    updateAttribution();
    captureXPixelEvent(name);

    var event = {
      schemaVersion: SCHEMA_VERSION,
      event: {
        name: name,
        context: {
          source: 'marketing-web',
          actorType: 'anonymous',
          environment: environment,
          serviceName: SERVICE_NAME,
          anonymousId: getAnonymousId(),
        },
        properties: Object.assign(getAttributionProperties(), properties || {}),
      },
    };

    postEvent(event);
  }

  function postEvent(payload) {
    var body = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        var sent = navigator.sendBeacon(endpoint, new Blob([body], { type: 'application/json' }));
        if (sent) return;
      }
    } catch (error) {
      // Marketing telemetry should never block navigation.
    }

    try {
      fetch(endpoint, {
        body: body,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        method: 'POST',
      }).catch(function () {});
    } catch (error) {
      // Marketing telemetry should never affect the page.
    }
  }

  function updateAttribution() {
    var existing = readAttributionState();
    var current = buildCurrentTouch();
    if (!current) return existing;

    var next = {
      first: existing.first || current,
      last: current,
    };

    writeTouch(ATTRIBUTION_FIRST_STORAGE_KEY, ATTRIBUTION_FIRST_COOKIE, next.first);
    writeTouch(ATTRIBUTION_LAST_STORAGE_KEY, ATTRIBUTION_LAST_COOKIE, next.last);

    return next;
  }

  function getAttributionProperties() {
    var state = readAttributionState();
    var current = state.last || state.first;
    if (!current) return {};

    return {
      attributionClickIdProvider: current.clickIdProvider || null,
      attributionClickIdPresent: Boolean(current.clickIdPresent),
      attributionFirstLandingPath: state.first && state.first.landingPath ? state.first.landingPath : null,
      attributionFirstReferrerDomain:
        state.first && state.first.referrerDomain ? state.first.referrerDomain : null,
      attributionFirstUtmCampaign:
        state.first && state.first.utm && state.first.utm.utm_campaign ? state.first.utm.utm_campaign : null,
      attributionFirstUtmContent:
        state.first && state.first.utm && state.first.utm.utm_content ? state.first.utm.utm_content : null,
      attributionFirstUtmId:
        state.first && state.first.utm && state.first.utm.utm_id ? state.first.utm.utm_id : null,
      attributionFirstUtmMedium:
        state.first && state.first.utm && state.first.utm.utm_medium ? state.first.utm.utm_medium : null,
      attributionFirstUtmSource:
        state.first && state.first.utm && state.first.utm.utm_source ? state.first.utm.utm_source : null,
      attributionFirstUtmTerm:
        state.first && state.first.utm && state.first.utm.utm_term ? state.first.utm.utm_term : null,
      attributionLandingPath: current.landingPath || null,
      attributionLastLandingPath: state.last && state.last.landingPath ? state.last.landingPath : null,
      attributionLastReferrerDomain:
        state.last && state.last.referrerDomain ? state.last.referrerDomain : null,
      attributionLastUtmCampaign:
        state.last && state.last.utm && state.last.utm.utm_campaign ? state.last.utm.utm_campaign : null,
      attributionLastUtmContent:
        state.last && state.last.utm && state.last.utm.utm_content ? state.last.utm.utm_content : null,
      attributionLastUtmId:
        state.last && state.last.utm && state.last.utm.utm_id ? state.last.utm.utm_id : null,
      attributionLastUtmMedium:
        state.last && state.last.utm && state.last.utm.utm_medium ? state.last.utm.utm_medium : null,
      attributionLastUtmSource:
        state.last && state.last.utm && state.last.utm.utm_source ? state.last.utm.utm_source : null,
      attributionLastUtmTerm:
        state.last && state.last.utm && state.last.utm.utm_term ? state.last.utm.utm_term : null,
      attributionReferrerDomain: current.referrerDomain || null,
      attributionUtmCampaign: current.utm && current.utm.utm_campaign ? current.utm.utm_campaign : null,
      attributionUtmContent: current.utm && current.utm.utm_content ? current.utm.utm_content : null,
      attributionUtmId: current.utm && current.utm.utm_id ? current.utm.utm_id : null,
      attributionUtmMedium: current.utm && current.utm.utm_medium ? current.utm.utm_medium : null,
      attributionUtmSource: current.utm && current.utm.utm_source ? current.utm.utm_source : null,
      attributionUtmTerm: current.utm && current.utm.utm_term ? current.utm.utm_term : null,
    };
  }

  function readAttributionState() {
    return {
      first: readTouch(ATTRIBUTION_FIRST_STORAGE_KEY, ATTRIBUTION_FIRST_COOKIE),
      last: readTouch(ATTRIBUTION_LAST_STORAGE_KEY, ATTRIBUTION_LAST_COOKIE),
    };
  }

  function buildCurrentTouch() {
    var params = new URLSearchParams(window.location.search);
    var utm = {};

    UTM_KEYS.forEach(function (key) {
      var value = readQueryParam(params, key);
      if (value) utm[key] = value;
    });

    var clickIdProvider = getClickIdProvider(params);
    var referrerDomain = getExternalReferrerDomain();
    var hasUtm = Object.keys(utm).length > 0;
    var hasClickId = Boolean(clickIdProvider);

    if (!hasUtm && !hasClickId && !referrerDomain) return null;

    return {
      clickIdPresent: hasClickId,
      clickIdProvider: clickIdProvider,
      landingPath: window.location.pathname || '/',
      referrerDomain: referrerDomain,
      timestamp: new Date().toISOString(),
      utm: utm,
    };
  }

  function getClickIdProvider(params) {
    for (var index = 0; index < CLICK_ID_PARAMS.length; index += 1) {
      var item = CLICK_ID_PARAMS[index];
      if (readQueryParam(params, item[0])) return item[1];
    }
    return null;
  }

  function getExternalReferrerDomain() {
    if (!document.referrer) return null;

    try {
      var domain = new URL(document.referrer).hostname.replace(/^www\./, '');
      var current = window.location.hostname.replace(/^www\./, '');
      return domain && domain !== current ? domain : null;
    } catch (error) {
      return null;
    }
  }

  function decorateAnchor(anchor) {
    var href = anchor.getAttribute('href');
    if (!href) return;

    var url;
    try {
      url = new URL(href, window.location.href);
    } catch (error) {
      return;
    }

    if (!isDecantrHostname(url.hostname)) return;

    var params = new URLSearchParams(window.location.search);
    var changed = false;

    UTM_KEYS.forEach(function (key) {
      var value = readQueryParam(params, key);
      if (value && !url.searchParams.has(key)) {
        url.searchParams.set(key, value);
        changed = true;
      }
    });

    if (changed) anchor.setAttribute('href', url.toString());
  }

  function readQueryParam(params, key) {
    var value = params.get(key);
    return value && value.trim() ? value.trim().slice(0, 120) : null;
  }

  function readTouch(storageKey, cookieName) {
    return parseTouch(readCookie(cookieName)) || parseTouch(readLocalStorage(storageKey));
  }

  function writeTouch(storageKey, cookieName, touch) {
    if (!touch) return;
    var value = JSON.stringify(touch);
    writeLocalStorage(storageKey, value);
    writeCookie(cookieName, value);
  }

  function parseTouch(value) {
    if (!value) return null;

    try {
      var parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (error) {
      return null;
    }
  }

  function getAnonymousId() {
    var cookieId = readCookie(ANONYMOUS_COOKIE);
    if (cookieId) {
      writeLocalStorage(ANONYMOUS_STORAGE_KEY, cookieId);
      return cookieId;
    }

    var storedId = readLocalStorage(ANONYMOUS_STORAGE_KEY);
    if (storedId) {
      writeCookie(ANONYMOUS_COOKIE, storedId);
      return storedId;
    }

    var generated = 'marketing_web:' + generateId();
    writeLocalStorage(ANONYMOUS_STORAGE_KEY, generated);
    writeCookie(ANONYMOUS_COOKIE, generated);
    return generated;
  }

  function generateId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function readLocalStorage(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeLocalStorage(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (error) {
      // Local storage can be unavailable in private browsing or blocked contexts.
    }
  }

  function readCookie(name) {
    var prefix = name + '=';
    var parts = document.cookie.split(';');

    for (var index = 0; index < parts.length; index += 1) {
      var part = parts[index].trim();
      if (part.indexOf(prefix) === 0) return decodeURIComponent(part.slice(prefix.length));
    }

    return null;
  }

  function writeCookie(name, value) {
    var pieces = [
      name + '=' + encodeURIComponent(value),
      'Path=/',
      'Max-Age=' + MAX_AGE_SECONDS,
      'SameSite=Lax',
    ];
    var domain = getCookieDomain();

    if (domain) pieces.push('Domain=' + domain);
    if (window.location.protocol === 'https:') pieces.push('Secure');

    document.cookie = pieces.join('; ');
  }

  function getCookieDomain() {
    return isDecantrHostname(window.location.hostname) ? '.decantr.ai' : null;
  }

  function isDecantrHostname(hostname) {
    return hostname === 'decantr.ai' || /\.decantr\.ai$/.test(hostname);
  }

  function isDecantrDeployHostname(hostname) {
    return isDecantrHostname(hostname) ||
      hostname === 'decantr-ai.github.io' ||
      /\.vercel\.app$/.test(hostname);
  }

  function classifyPageSurface() {
    if (window.location.pathname.indexOf('/reference/') === 0) return 'reference';
    if (window.location.pathname.indexOf('/showcase/') === 0) return 'showcase';
    return 'marketing_home';
  }

  function surfaceForElement(element) {
    var section = element.closest('section[id]');
    if (section && section.id) return section.id.slice(0, 80);
    if (element.closest('.bottom-cta')) return 'bottom_cta';
    if (element.closest('footer')) return 'footer';
    if (element.closest('header')) return 'header';
    return classifyPageSurface();
  }

  function classifyDestination(anchor) {
    var href = anchor.getAttribute('href') || '';
    if (href.indexOf('#') === 0) return href.slice(1) || 'hash';

    var url;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch (error) {
      return 'unknown';
    }

    var host = url.hostname.replace(/^www\./, '');
    if (host === 'registry.decantr.ai') return 'registry';
    if (host === 'github.com') return 'github';
    if (host === 'npmjs.com') return 'npm';
    if (host.indexOf('discord') !== -1) return 'discord';
    if (host === window.location.hostname.replace(/^www\./, '')) {
      if (url.pathname.indexOf('/reference/') === 0) return 'reference';
      return 'internal';
    }
    if (isDecantrHostname(host)) return 'decantr';
    return 'external';
  }

  function isCta(anchor, destination) {
    var className = anchor.className || '';
    if (typeof className === 'string' && /btn-|stat-card|path-tile/.test(className)) return true;
    return destination === 'registry' || destination === 'quickstart' || destination === 'reference';
  }

  function isOutbound(destination) {
    return ['github', 'npm', 'discord', 'external'].indexOf(destination) !== -1;
  }

  function classifyCommand(text) {
    var normalized = text.toLowerCase();
    if (normalized.indexOf('@decantr/mcp-server') !== -1 || normalized.indexOf('decantr-mcp') !== -1) {
      return 'mcp';
    }
    if (normalized.indexOf('@decantr/cli') !== -1 || normalized.indexOf('decantr ') !== -1) {
      return 'cli';
    }
    return 'other';
  }

  function normalizeLabel(value) {
    return value.replace(/\s+/g, ' ').trim().slice(0, 120) || null;
  }

  function closestElement(target, selector) {
    if (!target) return null;
    var element = target.nodeType === 1 ? target : target.parentElement;
    return element && element.closest ? element.closest(selector) : null;
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
      return;
    }
    callback();
  }

  function initXPixel() {
    var pixelId = config.xPixelId;
    if (!pixelId) return;

    ensureTwq();
    if (!window.__decantrConfiguredXPixel) {
      window.twq('config', pixelId);
      window.__decantrConfiguredXPixel = pixelId;
    }
  }

  function captureXPixelEvent(name) {
    var events = config.xEvents || {};
    var eventId = events[name];
    if (!eventId) return;

    initXPixel();
    if (window.twq) window.twq('event', eventId);
  }

  function ensureTwq() {
    if (window.twq) return;

    var twq = function () {
      if (twq.exe) {
        twq.exe.apply(twq, arguments);
        return;
      }
      twq.queue.push(arguments);
    };

    twq.version = '1.1';
    twq.queue = [];
    window.twq = twq;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://static.ads-twitter.com/uwt.js';

    var firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  }
})();
