/**
 * QRCode — QR code generator with canvas/SVG rendering and status overlays.
 *
 * @module decantr/components/qrcode
 */
import { h } from '../runtime/index.js';
import { createEffect } from '../state/index.js';
import { onMount, onDestroy } from '../runtime/index.js';
import { injectBase, cx, resolve } from './_base.js';
import { encodeQR } from './_qr-encoder.js';
import { Spinner } from './spinner.js';
import { icon } from './icon.js';

import { component } from '../runtime/component.js';
export interface QRCodeProps {
  value?: string | (() => string);
  size?: number;
  color?: string;
  bgColor?: string;
  type?: 'canvas'|'svg';
  level?: 'L'|'M'|'Q'|'H';
  icon?: string;
  iconSize?: number;
  bordered?: boolean;
  status?: string | (() => string);
  onRefresh?: (...args: unknown[]) => unknown;
  padding?: number;
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {string|Function} [props.value=''] - Text to encode (reactive)
 * @param {number} [props.size=160] - Pixel dimensions
 * @param {string} [props.color] - Module color (default: resolved --d-fg)
 * @param {string} [props.bgColor] - Background color (default: resolved --d-bg)
 * @param {'canvas'|'svg'} [props.type='canvas'] - Render mode
 * @param {'L'|'M'|'Q'|'H'} [props.level='M'] - Error correction level
 * @param {string} [props.icon] - Center logo URL
 * @param {number} [props.iconSize=40] - Logo size
 * @param {boolean} [props.bordered=true] - Card border
 * @param {string|Function} [props.status] - 'active'|'loading'|'expired'|'scanned' (reactive)
 * @param {Function} [props.onRefresh] - Expired refresh callback
 * @param {number} [props.padding=12] - Quiet zone padding
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export const QRCode = component<QRCodeProps>((props: QRCodeProps = {} as QRCodeProps) => {
  injectBase();
  const {
    value = '', size = 160, color, bgColor,
    type = 'canvas', level = 'M',
    icon: iconUrl, iconSize = 40, bordered = true,
    status, onRefresh, padding = 12,
    class: cls
  } = props;

  const container = h('div', {
    class: cx('d-qrcode',
      bordered && 'd-qrcode-bordered',
      cls
    )
  });

  let renderEl = null;
  let statusOverlay = null;
  let resolvedFg = null;
  let resolvedBg = null;

  function resolveColors() {
    if (color && bgColor) {
      resolvedFg = color;
      resolvedBg = bgColor;
      return;
    }
    const computed = typeof getComputedStyle === 'function' ? getComputedStyle(container) : null;
    resolvedFg = color || (computed ? computed.getPropertyValue('--d-fg').trim() : '#000') || '#000';
    resolvedBg = bgColor || (computed ? computed.getPropertyValue('--d-bg').trim() : '#fff') || '#fff';
  }

  function render(data) {
    if (!data) return;

    let qr;
    try {
      qr = encodeQR(data, level);
    } catch {
      return;
    }

    // Remove old render element
    if (renderEl && renderEl.parentNode) renderEl.remove();

    if (type === 'svg') {
      renderEl = renderSVG(qr, size, resolvedFg, resolvedBg, padding);
    } else {
      renderEl = renderCanvas(qr, size, resolvedFg, resolvedBg, padding);
    }

    // Insert before status overlay or at end
    if (statusOverlay && statusOverlay.parentNode) {
      container.insertBefore(renderEl, statusOverlay);
    } else {
      container.appendChild(renderEl);
    }

    // Icon overlay
    if (iconUrl) {
      let iconEl = container.querySelector('.d-qrcode-icon');
      if (!iconEl) {
        iconEl = h('img', {
          class: 'd-qrcode-icon',
          src: iconUrl,
          width: String(iconSize),
          height: String(iconSize),
          alt: ''
        });
        container.appendChild(iconEl);
      }
    }
  }

  // Status overlay
  function updateStatus(s) {
    // Remove existing status classes
    container.classList.remove('d-qrcode-expired', 'd-qrcode-loading', 'd-qrcode-scanned');
    if (statusOverlay) { statusOverlay.remove(); statusOverlay = null; }

    if (!s || s === 'active') return;

    container.classList.add(`d-qrcode-${s}`);
    statusOverlay = h('div', { class: 'd-qrcode-status' });

    if (s === 'loading') {
      statusOverlay.appendChild(Spinner({ size: 'lg' }));
    } else if (s === 'expired') {
      const refreshBtn = h('button', {
        class: 'd-btn d-btn-sm d-btn-primary',
        type: 'button'
      });
      try { refreshBtn.appendChild(icon('refresh-cw', { size: '16' })); } catch {}
      refreshBtn.appendChild(document.createTextNode(' Refresh'));
      if (onRefresh) refreshBtn.addEventListener('click', onRefresh);
      statusOverlay.appendChild(refreshBtn);
    } else if (s === 'scanned') {
      try {
        statusOverlay.appendChild(icon('check', { size: '48', class: 'd-qrcode-check' }));
      } catch {
        statusOverlay.appendChild(h('span', null, '✓'));
      }
    }

    container.appendChild(statusOverlay);
  }

  // Use requestAnimationFrame to resolve CSS custom properties after mount
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => {
      resolveColors();
      const val = typeof value === 'function' ? value() : value;
      if (val) render(val);
      const st = typeof status === 'function' ? status() : status;
      if (st) updateStatus(st);
    });
  } else {
    // Test/SSR env — resolve immediately
    resolveColors();
    const val = typeof value === 'function' ? value() : value;
    if (val) render(val);
    const st = typeof status === 'function' ? status() : status;
    if (st) updateStatus(st);
  }

  // Reactive value
  if (typeof value === 'function') {
    createEffect(() => {
      const val = value();
      resolveColors();
      render(val);
    });
  }

  // Reactive status
  if (typeof status === 'function') {
    createEffect(() => updateStatus(status()));
  }

  return container;
})

/**
 * Render QR code to a canvas element.
 */
function renderCanvas(qr, size, fg, bg, padding) {
  const canvas = h('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const moduleCount = qr.size;
  const drawSize = size - padding * 2;
  const cellSize = drawSize / moduleCount;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = fg;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules[r][c]) {
        ctx.fillRect(
          padding + c * cellSize,
          padding + r * cellSize,
          cellSize + 0.5,
          cellSize + 0.5
        );
      }
    }
  }

  return canvas;
}

/**
 * Render QR code as SVG element.
 */
function renderSVG(qr, size, fg, bg, padding) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('xmlns', ns);

  // Background
  const bgRect = document.createElementNS(ns, 'rect');
  bgRect.setAttribute('width', String(size));
  bgRect.setAttribute('height', String(size));
  bgRect.setAttribute('fill', bg);
  svg.appendChild(bgRect);

  const moduleCount = qr.size;
  const drawSize = size - padding * 2;
  const cellSize = drawSize / moduleCount;

  // Build a single path for all modules (much more efficient than individual rects)
  let d = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (qr.modules[r][c]) {
        const x = padding + c * cellSize;
        const y = padding + r * cellSize;
        d += `M${x},${y}h${cellSize}v${cellSize}h${-cellSize}z`;
      }
    }
  }

  if (d) {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', fg);
    svg.appendChild(path);
  }

  return svg;
}
