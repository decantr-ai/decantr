(function () {
  'use strict';

  var config = window.DECANTR_ANALYTICS_CONFIG || {};
  var disabled = config.disabled === true || config.disabled === 'true';
  var hostname = window.location.hostname.toLowerCase();
  var enabledHost = config.forceEnabled === true || isDecantrDeployHostname(hostname);

  if (disabled || !enabledHost) return;

  onReady(function () {
    initXPixel();
    captureXPixelEvent('marketing_web.page_viewed');
  });

  document.addEventListener(
    'click',
    function (event) {
      var installTab = closestElement(event.target, '.install-tab-btn');
      if (installTab) {
        captureXPixelEvent('marketing_web.command_clicked');
        return;
      }

      var command = closestElement(event.target, '.showcase-code, .qs-code-block, .command, .try-command, .closing-command');
      if (command) {
        captureXPixelEvent('marketing_web.command_clicked');
        return;
      }

      var anchor = closestElement(event.target, 'a[href]');
      if (!anchor) return;

      var destination = classifyDestination(anchor);
      if (isCta(anchor)) {
        captureXPixelEvent('marketing_web.cta_clicked');
      } else if (isOutbound(destination)) {
        captureXPixelEvent('marketing_web.outbound_clicked');
      }
    },
    true,
  );

  window.DecantrAnalytics = {
    capture: captureXPixelEvent,
  };

  function classifyDestination(anchor) {
    var href = anchor.getAttribute('href') || '';
    if (href.indexOf('#') === 0) return 'internal';

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
    if (host === window.location.hostname.replace(/^www\./, '')) return 'internal';
    if (isDecantrHostname(host)) return 'decantr';
    return 'external';
  }

  function isCta(anchor) {
    var className = anchor.className || '';
    return typeof className === 'string' && /btn-|stat-card|path-tile/.test(className);
  }

  function isOutbound(destination) {
    return ['github', 'npm', 'discord', 'external', 'content_api'].indexOf(destination) !== -1;
  }

  function hostnameLabels(value) {
    return (value || '').toLowerCase().split('.').filter(Boolean);
  }

  function hostnameHasLabel(value, label) {
    return hostnameLabels(value).indexOf(label) !== -1;
  }

  function hostnameMatchesDomain(value, domain) {
    var labels = hostnameLabels(value);
    var domainLabels = hostnameLabels(domain);
    if (labels.length < domainLabels.length) return false;

    for (var index = 1; index <= domainLabels.length; index += 1) {
      if (labels[labels.length - index] !== domainLabels[domainLabels.length - index]) return false;
    }
    return true;
  }

  function isDecantrHostname(value) {
    return hostnameMatchesDomain(value, 'decantr.ai');
  }

  function isDecantrDeployHostname(value) {
    return (
      isDecantrHostname(value) ||
      value === 'decantr-ai.github.io' ||
      hostnameMatchesDomain(value, 'vercel.app')
    );
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
