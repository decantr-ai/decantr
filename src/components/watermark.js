/**
 * Watermark — Renders a repeating text/image watermark over content.
 * Uses canvas to generate watermark pattern as background image.
 *
 * @module decantr/components/watermark
 */
import { h } from '../core/index.js';
import { injectBase, cx } from './_base.js';

/**
 * @param {Object} [props]
 * @param {string} [props.content] - Watermark text
 * @param {string[]} [props.content] - Multi-line text array
 * @param {string} [props.image] - Image URL (takes precedence over text)
 * @param {number} [props.rotate=-22] - Rotation angle in degrees
 * @param {number} [props.fontSize=14]
 * @param {string} [props.fontColor='rgba(0,0,0,0.1)']
 * @param {number[]} [props.gap=[100,100]] - [horizontal, vertical] gap between marks
 * @param {number[]} [props.offset=[0,0]] - [x, y] offset of first mark
 * @param {number} [props.zIndex=9]
 * @param {string} [props.class]
 * @param {...Node} children - Content to watermark over
 * @returns {HTMLElement}
 */
export function Watermark(props = {}, ...children) {
  injectBase();
  const {
    content, image, rotate = -22, fontSize = 14, fontColor = 'rgba(0,0,0,0.1)',
    gap = [100, 100], offset = [0, 0], zIndex = 9, class: cls
  } = props;

  const container = h('div', { class: cx('d-watermark', cls), style: { position: 'relative' } });
  children.forEach(c => { if (c && c.nodeType) container.appendChild(c); });

  const watermarkLayer = h('div', {
    class: 'd-watermark-layer',
    style: {
      position: 'absolute',
      inset: '0',
      pointerEvents: 'none',
      zIndex: String(zIndex),
      overflow: 'hidden'
    }
  });

  container.appendChild(watermarkLayer);

  function render() {
    if (typeof document === 'undefined') return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const texts = Array.isArray(content) ? content : (content ? [content] : []);
    const lineHeight = fontSize * 1.5;
    const textHeight = texts.length * lineHeight;

    const markWidth = 120 + gap[0];
    const markHeight = Math.max(textHeight, 40) + gap[1];

    canvas.width = markWidth * 2;
    canvas.height = markHeight * 2;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    if (image) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const imgW = Math.min(img.width, markWidth - gap[0]);
        const imgH = (img.height / img.width) * imgW;
        ctx.drawImage(img, offset[0] + (markWidth - imgW) / 2, offset[1] + (markHeight - imgH) / 2, imgW, imgH);
        applyPattern(canvas);
      };
      img.src = image;
    } else if (texts.length) {
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const cx0 = canvas.width / 2 + offset[0];
      const cy0 = canvas.height / 2 + offset[1] - (textHeight / 2) + (lineHeight / 2);

      texts.forEach((line, i) => {
        ctx.fillText(line, cx0, cy0 + i * lineHeight);
      });
      applyPattern(canvas);
    }
  }

  function applyPattern(canvas) {
    const dataURL = canvas.toDataURL();
    watermarkLayer.style.backgroundImage = `url(${dataURL})`;
    watermarkLayer.style.backgroundRepeat = 'repeat';
    watermarkLayer.style.backgroundSize = `${canvas.width / 2}px ${canvas.height / 2}px`;
  }

  // MutationObserver to prevent removal of watermark layer
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const removed of m.removedNodes) {
          if (removed === watermarkLayer) {
            container.appendChild(watermarkLayer);
            render();
            return;
          }
        }
      }
    });
    observer.observe(container, { childList: true });
  }

  // Initial render
  requestAnimationFrame(render);

  return container;
}
