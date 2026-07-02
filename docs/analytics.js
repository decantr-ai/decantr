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
    var first = enrichTouch(state.first);
    var last = enrichTouch(state.last);
    var current = last || first || buildDirectTouch();

    return {
      attributionChannel: current.channel || null,
      attributionClickIdProvider: current.clickIdProvider || null,
      attributionClickIdPresent: Boolean(current.clickIdPresent),
      attributionFirstChannel: first && first.channel ? first.channel : null,
      attributionFirstLandingPath: first && first.landingPath ? first.landingPath : null,
      attributionFirstLandingIntent: first && first.landingIntent ? first.landingIntent : null,
      attributionFirstLandingPageKind: first && first.landingPageKind ? first.landingPageKind : null,
      attributionFirstReferrerDomain:
        first && first.referrerDomain ? first.referrerDomain : null,
      attributionFirstSource: first && first.source ? first.source : null,
      attributionFirstSourceCategory: first && first.sourceCategory ? first.sourceCategory : null,
      attributionFirstUtmCampaign:
        first && first.utm && first.utm.utm_campaign ? first.utm.utm_campaign : null,
      attributionFirstUtmContent:
        first && first.utm && first.utm.utm_content ? first.utm.utm_content : null,
      attributionFirstUtmId:
        first && first.utm && first.utm.utm_id ? first.utm.utm_id : null,
      attributionFirstUtmMedium:
        first && first.utm && first.utm.utm_medium ? first.utm.utm_medium : null,
      attributionFirstUtmSource:
        first && first.utm && first.utm.utm_source ? first.utm.utm_source : null,
      attributionFirstUtmTerm:
        first && first.utm && first.utm.utm_term ? first.utm.utm_term : null,
      attributionLandingPath: current.landingPath || null,
      attributionLandingIntent: current.landingIntent || null,
      attributionLandingPageKind: current.landingPageKind || null,
      attributionLastChannel: last && last.channel ? last.channel : null,
      attributionLastLandingPath: last && last.landingPath ? last.landingPath : null,
      attributionLastLandingIntent: last && last.landingIntent ? last.landingIntent : null,
      attributionLastLandingPageKind: last && last.landingPageKind ? last.landingPageKind : null,
      attributionLastReferrerDomain:
        last && last.referrerDomain ? last.referrerDomain : null,
      attributionLastSource: last && last.source ? last.source : null,
      attributionLastSourceCategory: last && last.sourceCategory ? last.sourceCategory : null,
      attributionLastUtmCampaign:
        last && last.utm && last.utm.utm_campaign ? last.utm.utm_campaign : null,
      attributionLastUtmContent:
        last && last.utm && last.utm.utm_content ? last.utm.utm_content : null,
      attributionLastUtmId:
        last && last.utm && last.utm.utm_id ? last.utm.utm_id : null,
      attributionLastUtmMedium:
        last && last.utm && last.utm.utm_medium ? last.utm.utm_medium : null,
      attributionLastUtmSource:
        last && last.utm && last.utm.utm_source ? last.utm.utm_source : null,
      attributionLastUtmTerm:
        last && last.utm && last.utm.utm_term ? last.utm.utm_term : null,
      attributionReferrerDomain: current.referrerDomain || null,
      attributionSource: current.source || null,
      attributionSourceCategory: current.sourceCategory || null,
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

    return enrichTouch({
      clickIdPresent: hasClickId,
      clickIdProvider: clickIdProvider,
      landingPath: window.location.pathname || '/',
      referrerDomain: referrerDomain,
      timestamp: new Date().toISOString(),
      utm: utm,
    });
  }

  function buildDirectTouch() {
    return enrichTouch({
      clickIdPresent: false,
      clickIdProvider: null,
      landingPath: window.location.pathname || '/',
      referrerDomain: null,
      timestamp: new Date().toISOString(),
      utm: {},
    });
  }

  function enrichTouch(touch) {
    if (!touch) return null;

    var landingPath = touch.landingPath || window.location.pathname || '/';
    var utm = touch.utm || {};
    var source = touch.source || classifySource(utm, touch.clickIdProvider || null, touch.referrerDomain || null);
    var channel = touch.channel || classifyChannel(utm, touch.clickIdProvider || null, touch.referrerDomain || null);

    touch.channel = channel;
    touch.landingPath = landingPath;
    touch.landingIntent = touch.landingIntent || classifyLandingIntent(landingPath, utm);
    touch.landingPageKind = touch.landingPageKind || classifyLandingPageKind(landingPath);
    touch.source = source;
    touch.sourceCategory = touch.sourceCategory || classifySourceCategory(source, channel);
    return touch;
  }

  function classifySource(utm, clickIdProvider, referrerDomain) {
    var utmSource = normalizeValue(utm.utm_source);
    if (utmSource) return utmSource;
    if (clickIdProvider) return normalizeValue(clickIdProvider) || 'paid';
    if (referrerDomain) return normalizeReferrerSource(referrerDomain);
    return 'direct';
  }

  function classifyChannel(utm, clickIdProvider, referrerDomain) {
    var medium = normalizeValue(utm.utm_medium);
    var source = normalizeValue(utm.utm_source);

    if (clickIdProvider === 'google' || clickIdProvider === 'microsoft') return 'paid_search';
    if (clickIdProvider) return 'paid_social';

    if (medium && medium.indexOf('paid') !== -1 && medium.indexOf('search') !== -1) return 'paid_search';
    if (medium && (medium.indexOf('cpc') !== -1 || medium.indexOf('ppc') !== -1 || medium.indexOf('sem') !== -1)) {
      return 'paid_search';
    }
    if (medium && medium.indexOf('paid') !== -1 && medium.indexOf('social') !== -1) return 'paid_social';
    if (medium === 'organic-social' || medium === 'social') return 'organic_social';
    if (medium === 'package-registry') return 'package_registry';
    if (medium === 'community') return 'community';
    if (medium === 'docs') return 'docs';
    if (medium === 'email' || medium === 'newsletter') return 'email';
    if (medium === 'launch') return 'launch';
    if (medium === 'referral' || medium === 'partner') return 'referral';

    if (source && (source === 'github' || source === 'npm' || source === 'jsr')) {
      return source === 'npm' || source === 'jsr' ? 'package_registry' : 'developer_referral';
    }
    if (source && ['x', 'twitter', 'linkedin', 'meta', 'facebook', 'threads', 'tiktok'].indexOf(source) !== -1) {
      return 'organic_social';
    }
    if (source && ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot'].indexOf(source) !== -1) return 'ai_referral';

    if (!referrerDomain) return 'direct';

    var referrer = normalizeReferrerSource(referrerDomain);
    if (isSearchSource(referrer)) return 'organic_search';
    if (isAiSource(referrer)) return 'ai_referral';
    if (['github', 'stackoverflow', 'hackernews', 'news.ycombinator'].indexOf(referrer) !== -1) {
      return 'developer_referral';
    }
    if (['npm', 'jsr'].indexOf(referrer) !== -1) return 'package_registry';
    if (['x', 'twitter', 'linkedin', 'reddit', 'youtube', 'facebook', 'threads', 'tiktok'].indexOf(referrer) !== -1) {
      return 'organic_social';
    }

    return 'referral';
  }

  function classifySourceCategory(source, channel) {
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

  function classifyLandingIntent(landingPath, utm) {
    var text = [
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

    if (text.indexOf('mcp') !== -1) return 'mcp';
    if (
      text.indexOf('project-health') !== -1 ||
      text.indexOf('health-ci') !== -1 ||
      text.indexOf('project health') !== -1
    ) {
      return 'project_health_ci';
    }
    if (text.indexOf('existing-app') !== -1 || text.indexOf('brownfield') !== -1) return 'existing_app_adoption';
    if (
      text.indexOf('ai-assistant') !== -1 ||
      text.indexOf('cursor') !== -1 ||
      text.indexOf('claude') !== -1 ||
      text.indexOf('codex') !== -1
    ) {
      return 'ai_assistant_setup';
    }
    if (
      text.indexOf('design-contract') !== -1 ||
      text.indexOf('guardrail') !== -1 ||
      text.indexOf('design-token') !== -1
    ) {
      return 'design_guardrails';
    }
    if (
      text.indexOf('registry') !== -1 ||
      text.indexOf('pattern') !== -1 ||
      text.indexOf('theme') !== -1 ||
      text.indexOf('blueprint') !== -1
    ) {
      return 'registry_content';
    }
    if (text.indexOf('cli') !== -1 || text.indexOf('install') !== -1 || text.indexOf('quickstart') !== -1) {
      return 'cli_install';
    }
    if (landingPath.indexOf('/guides/') === 0 || landingPath.indexOf('/reference/') === 0) return 'docs_reference';
    if (landingPath === '/' || text.indexOf('decantr-ai') !== -1 || text.indexOf('brand') !== -1) return 'brand';
    return 'unknown';
  }

  function classifyLandingPageKind(landingPath) {
    if (landingPath === '/') return 'homepage';
    if (landingPath.indexOf('/guides/') === 0) return 'guide';
    if (landingPath.indexOf('/reference/') === 0) return 'reference';
    if (landingPath.indexOf('/showcase/') === 0) return 'showcase';
    if (landingPath.indexOf('/browse') === 0) return 'registry_browse';
    if (landingPath.indexOf('/dashboard') === 0) return 'dashboard';
    if (landingPath.indexOf('/admin') === 0) return 'admin';
    if (landingPath === '/login') return 'auth';
    if (/^\/[^/]+\/[^/]+\/[^/]+/.test(landingPath)) return 'registry_detail';
    return 'other';
  }

  function normalizeValue(value) {
    var normalized = value && value.trim ? value.trim().toLowerCase().replace(/^www\./, '') : null;
    return normalized ? normalized.slice(0, 80) : null;
  }

  function hostnameLabels(hostname) {
    return (hostname || '').toLowerCase().split('.').filter(Boolean);
  }

  function hostnameHasLabel(hostname, label) {
    return hostnameLabels(hostname).indexOf(label) !== -1;
  }

  function hostnameMatchesDomain(hostname, domain) {
    var labels = hostnameLabels(hostname);
    var domainLabels = hostnameLabels(domain);
    if (labels.length < domainLabels.length) return false;
    for (var index = 1; index <= domainLabels.length; index += 1) {
      if (labels[labels.length - index] !== domainLabels[domainLabels.length - index]) return false;
    }
    return true;
  }

  function normalizeReferrerSource(domain) {
    var normalized = normalizeValue(domain) || 'referral';
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

  function isSearchSource(source) {
    return ['google', 'bing', 'duckduckgo', 'yahoo', 'yandex', 'baidu', 'kagi'].indexOf(source) !== -1;
  }

  function isAiSource(source) {
    return ['chatgpt', 'perplexity', 'claude', 'gemini', 'copilot'].indexOf(source) !== -1;
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
    return hostnameMatchesDomain(hostname, 'decantr.ai');
  }

  function isDecantrDeployHostname(hostname) {
    return isDecantrHostname(hostname) ||
      hostname === 'decantr-ai.github.io' ||
      hostnameMatchesDomain(hostname, 'vercel.app');
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
    if (host === 'api.decantr.ai') return 'content_api';
    if (host === 'github.com') return 'github';
    if (host === 'npmjs.com') return 'npm';
    if (hostnameHasLabel(host, 'discord')) return 'discord';
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
    return destination === 'quickstart' || destination === 'reference';
  }

  function isOutbound(destination) {
    return ['github', 'npm', 'discord', 'external', 'content_api'].indexOf(destination) !== -1;
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
