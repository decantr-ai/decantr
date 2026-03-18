/**
 * Showcase floating navigation overlay.
 *
 * Framework-independent vanilla JS — include in any showcase via:
 *   <script src="/showcase/shared/showcase-nav.js" data-showcase-id="saas-dashboard" defer></script>
 *
 * Renders a fixed-position bar with:
 *   - "← decantr.ai" back link
 *   - Current showcase name
 *   - Dropdown switcher to jump between showcases
 *   - Dismiss button (persisted in sessionStorage)
 *
 * Uses dcn- prefixed CSS classes for complete style isolation.
 * Loads manifest from /showcase/manifest.json to populate the switcher.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'dcn-nav-dismissed';
  var MANIFEST_PATH = '/showcase/manifest.json';

  // Retrieve the current showcase ID from the script tag's data attribute
  var scriptEl = document.currentScript || document.querySelector('script[data-showcase-id]');
  var currentId = scriptEl && scriptEl.getAttribute('data-showcase-id');

  if (!currentId) return;
  if (sessionStorage.getItem(STORAGE_KEY) === '1') return;

  // ── Styles (scoped via dcn- prefix) ────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.dcn-bar{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:99999;',
    'display:flex;align-items:center;gap:8px;padding:8px 16px;',
    'background:rgba(10,10,20,0.92);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(255,255,255,0.1);border-radius:12px;',
    'font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;',
    'font-size:13px;color:#e0e0e0;box-shadow:0 8px 32px rgba(0,0,0,0.4);',
    'transition:opacity 0.2s ease,transform 0.2s ease}',

    '.dcn-bar.dcn-hidden{opacity:0;transform:translateX(-50%) translateY(8px);pointer-events:none}',

    '.dcn-back{color:#a78bfa;text-decoration:none;font-weight:600;white-space:nowrap;',
    'transition:color 0.15s ease}',
    '.dcn-back:hover{color:#c4b5fd}',

    '.dcn-sep{width:1px;height:16px;background:rgba(255,255,255,0.12);flex-shrink:0}',

    '.dcn-name{color:#fafafa;font-weight:500;white-space:nowrap}',

    '.dcn-switcher{position:relative}',

    '.dcn-switch-btn{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.1);',
    'color:#e0e0e0;padding:4px 10px;border-radius:6px;font-size:12px;cursor:pointer;',
    'transition:background 0.15s ease;font-family:inherit}',
    '.dcn-switch-btn:hover{background:rgba(255,255,255,0.14)}',

    '.dcn-dropdown{position:absolute;bottom:calc(100% + 8px);right:0;min-width:200px;',
    'background:rgba(10,10,20,0.96);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);',
    'border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:4px;',
    'box-shadow:0 8px 32px rgba(0,0,0,0.5);display:none}',
    '.dcn-dropdown.dcn-open{display:block}',

    '.dcn-dropdown a{display:block;padding:8px 12px;color:#d0d0d0;text-decoration:none;',
    'border-radius:6px;font-size:13px;transition:background 0.12s ease}',
    '.dcn-dropdown a:hover{background:rgba(255,255,255,0.08);color:#fafafa}',
    '.dcn-dropdown a.dcn-current{color:#a78bfa;font-weight:600}',

    '.dcn-dismiss{background:none;border:none;color:#888;cursor:pointer;padding:2px 4px;',
    'font-size:16px;line-height:1;transition:color 0.15s ease}',
    '.dcn-dismiss:hover{color:#fafafa}',
  ].join('\n');
  document.head.appendChild(style);

  // ── DOM ────────────────────────────────────────────────────────────
  var bar = document.createElement('div');
  bar.className = 'dcn-bar dcn-hidden';

  // Back link
  var back = document.createElement('a');
  back.href = '/';
  back.className = 'dcn-back';
  back.textContent = '\u2190 decantr.ai';
  bar.appendChild(back);

  // Separator
  var sep1 = document.createElement('span');
  sep1.className = 'dcn-sep';
  bar.appendChild(sep1);

  // Name placeholder (filled after manifest loads)
  var nameEl = document.createElement('span');
  nameEl.className = 'dcn-name';
  nameEl.textContent = currentId;
  bar.appendChild(nameEl);

  // Separator
  var sep2 = document.createElement('span');
  sep2.className = 'dcn-sep';
  bar.appendChild(sep2);

  // Switcher
  var switcher = document.createElement('div');
  switcher.className = 'dcn-switcher';

  var switchBtn = document.createElement('button');
  switchBtn.className = 'dcn-switch-btn';
  switchBtn.textContent = 'Switch \u25BE';
  switcher.appendChild(switchBtn);

  var dropdown = document.createElement('div');
  dropdown.className = 'dcn-dropdown';
  switcher.appendChild(dropdown);

  bar.appendChild(switcher);

  // Separator
  var sep3 = document.createElement('span');
  sep3.className = 'dcn-sep';
  bar.appendChild(sep3);

  // Dismiss
  var dismiss = document.createElement('button');
  dismiss.className = 'dcn-dismiss';
  dismiss.setAttribute('aria-label', 'Dismiss navigation bar');
  dismiss.textContent = '\u2715';
  dismiss.addEventListener('click', function () {
    bar.classList.add('dcn-hidden');
    sessionStorage.setItem(STORAGE_KEY, '1');
    setTimeout(function () { bar.remove(); }, 200);
  });
  bar.appendChild(dismiss);

  document.body.appendChild(bar);

  // Animate in
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      bar.classList.remove('dcn-hidden');
    });
  });

  // Toggle dropdown
  switchBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    dropdown.classList.toggle('dcn-open');
  });

  document.addEventListener('click', function () {
    dropdown.classList.remove('dcn-open');
  });

  // ── Load manifest ──────────────────────────────────────────────────
  fetch(MANIFEST_PATH)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var showcases = data.showcases || [];

      // Update current name
      var current = showcases.find(function (s) { return s.id === currentId; });
      if (current) nameEl.textContent = current.title;

      // Populate dropdown
      showcases.forEach(function (s) {
        var a = document.createElement('a');
        a.href = '/showcase/' + s.id + '/';
        a.textContent = s.title;
        if (s.id === currentId) a.className = 'dcn-current';
        dropdown.appendChild(a);
      });
    })
    .catch(function () {
      // Manifest unavailable — hide switcher, keep back link functional
      switcher.style.display = 'none';
      sep2.style.display = 'none';
    });
})();
