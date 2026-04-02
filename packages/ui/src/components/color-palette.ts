/**
 * ColorPalette — Harmonious color palette generator using OKLCH color theory.
 * Large swatches, shade strips, contrast badges, lock/shuffle/drag-reorder.
 * Uses generateHarmony/generateShades/pickSwatchForeground from _primitives.js.
 *
 * @module decantr/components/color-palette
 */
import { onDestroy } from '../runtime/index.js';
import { createSignal, createEffect, batch } from '../state/index.js';
import { tags } from '../tags/index.js';
import { injectBase, cx } from './_base.js';
import { createDrag } from './_behaviors.js';
import { generateHarmony, generateShades, pickSwatchForeground, hexToOklch } from './_primitives.js';
import { icon } from './icon.js';
import { Segmented } from './segmented.js';
import { InputNumber } from './input-number.js';
import { ColorPicker } from './color-picker.js';

import { component } from '../runtime/component.js';
export interface ColorPaletteProps {
  colors?: string[]|Function;
  harmony?: string | (() => string);
  count?: number | (() => number);
  locked?: number[]|Function;
  shades?: boolean | (() => boolean);
  onchange?: (value: unknown) => void;
  size?: string;
  class?: string;
  'aria-label'?: string;
  [key: string]: unknown;
}

const { div, button: buttonTag, span } = tags;

const HARMONY_TYPES = [
  { value: 'monochromatic', label: 'Mono' },
  { value: 'analogous', label: 'Analog' },
  { value: 'complementary', label: 'Comp' },
  { value: 'split-complementary', label: 'Split' },
  { value: 'triadic', label: 'Tri' },
  { value: 'tetradic', label: 'Tetra' },
  { value: 'square', label: 'Square' },
  { value: 'custom', label: 'Custom' },
];

const MIN_COLORS = 2;
const MAX_COLORS = 12;

/**
 * Compute WCAG 2.1 contrast ratio between two hex colors.
 * @param {string} hex - Background color
 * @returns {string} "AAA", "AA", or "Fail"
 */
function contrastBadge(hex: any) {
  const { l } = hexToOklch(hex);
  const fg = l > 0.6 ? '#09090b' : '#ffffff';
  // Approximate relative luminance from OKLCH L
  const bgLum = l * l;
  const fgLum = fg === '#ffffff' ? 1 : 0.004;
  const ratio = (Math.max(bgLum, fgLum) + 0.05) / (Math.min(bgLum, fgLum) + 0.05);
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'Fail';
}

/**
 * @param {Object} [props]
 * @param {string[]|Function} [props.colors] - Initial hex array
 * @param {string|Function} [props.harmony='complementary'] - Harmony type
 * @param {number|Function} [props.count=5] - Color count (2-12)
 * @param {number[]|Function} [props.locked] - Locked indices
 * @param {boolean|Function} [props.shades=true] - Show shade strips
 * @param {Function} [props.onchange] - Callback with hex[]
 * @param {string} [props.size] - 'sm'|'md'|'lg'
 * @param {string} [props.class]
 * @param {string} [props['aria-label']]
 * @returns {HTMLElement}
 */
export const ColorPalette = component<ColorPaletteProps>((props: ColorPaletteProps = {} as ColorPaletteProps) => {
  injectBase();
  const {
    colors: initColors,
    harmony: initHarmony = 'complementary',
    count: initCount = 5,
    locked: initLocked,
    shades: showShades = true,
    onchange,
    size,
    class: cls,
    'aria-label': ariaLabel = 'Color palette',
  } = props;

  // --- Signals ---
  const resolveVal = (v: any) => typeof v === 'function' ? v() : v;
  const startColors = resolveVal(initColors) || generateHarmony('#1366D9', resolveVal(initHarmony), resolveVal(initCount));
  const [colors, setColors] = createSignal(startColors);
  const [harmonyType, setHarmonyType] = createSignal(resolveVal(initHarmony));
  const [colorCount, setColorCount] = createSignal(resolveVal(initCount));
  const [lockedSet, setLockedSet] = createSignal(new Set(resolveVal(initLocked) || []));
  const [editingIdx, setEditingIdx] = createSignal(-1);
  const [dragIdx, setDragIdx] = createSignal(-1);

  const dragDestroys: any[] = [];

  function fireChange(cols: any) {
    if (onchange) onchange(cols);
  }

  function regenerate() {
    const type = harmonyType();
    if (type === 'custom') return;
    const current = colors();
    const locked = lockedSet();
    const cnt = colorCount();
    // Use first unlocked color as base, or first color
    const baseIdx = [...Array(current.length).keys()].find(i => !locked.has(i)) ?? 0;
    const base = current[baseIdx] || '#1366D9';
    const generated = generateHarmony(base, type, cnt);
    // Preserve locked colors at their indices
    const result = generated.map((c, i) => locked.has(i) && i < current.length ? current[i] : c);
    setColors(result);
    fireChange(result);
  }

  function shuffle() {
    // Randomize base hue and regenerate
    const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    const type = harmonyType();
    if (type === 'custom') return;
    const locked = lockedSet();
    const cnt = colorCount();
    const current = colors();
    const generated = generateHarmony(randomHex, type, cnt);
    const result = generated.map((c, i) => locked.has(i) && i < current.length ? current[i] : c);
    setColors(result);
    fireChange(result);
  }

  function copyAll() {
    const text = colors().join(', ');
    if (navigator.clipboard) navigator.clipboard.writeText(text);
  }

  function toggleLock(idx: any) {
    const s = new Set(lockedSet());
    if (s.has(idx)) s.delete(idx);
    else s.add(idx);
    setLockedSet(s);
  }

  function copySingle(hex: any) {
    if (navigator.clipboard) navigator.clipboard.writeText(hex);
  }

  function removeColor(idx: any) {
    const current = colors();
    if (current.length <= MIN_COLORS) return;
    const next = current.filter((_: any, i: number) => i !== idx);
    // Adjust locked indices
    const locked = lockedSet();
    const newLocked = new Set();
    for (const li of locked) {
      // @ts-expect-error -- strict-mode fix (auto)
      if (li < idx) newLocked.add(li);
      // @ts-expect-error -- strict-mode fix (auto)
      else if (li > idx) newLocked.add(li - 1);
    }
    batch(() => {
      setLockedSet(newLocked);
      setColors(next);
      setColorCount(next.length);
    });
    fireChange(next);
  }

  function addColor() {
    const current = colors();
    if (current.length >= MAX_COLORS) return;
    // Generate one more
    const type = harmonyType();
    const base = current[0] || '#1366D9';
    const newCount = current.length + 1;
    if (type === 'custom') {
      const next = [...current, base];
      batch(() => { setColors(next); setColorCount(newCount); });
      fireChange(next);
    } else {
      batch(() => { setColorCount(newCount); });
      regenerate();
    }
  }

  function updateSingleColor(idx: any, hex: any) {
    const current = [...colors()];
    current[idx] = hex;
    setColors(current);
    fireChange(current);
  }

  // --- DOM ---
  const sizeClass = size === 'sm' ? ' d-colorpalette-sm' : size === 'lg' ? ' d-colorpalette-lg' : '';

  // Toolbar
  const harmonySegmented = Segmented({
    value: harmonyType,
    options: HARMONY_TYPES,
    size: 'sm',
    onchange: (v) => { setHarmonyType(v); regenerate(); }
  });

  const shuffleBtn = buttonTag({
    type: 'button',
    class: 'd-btn d-btn-sm',
    'aria-label': 'Shuffle colors',
    onclick: shuffle
  // @ts-expect-error -- strict-mode fix (auto)
  }, icon('refresh', { size: '1rem' }));

  const copyAllBtn = buttonTag({
    type: 'button',
    class: 'd-btn d-btn-sm',
    'aria-label': 'Copy all colors',
    onclick: copyAll
  // @ts-expect-error -- strict-mode fix (auto)
  }, icon('copy', { size: '1rem' }));

  const countInput = InputNumber({
    value: colorCount,
    min: MIN_COLORS,
    max: MAX_COLORS,
    step: 1,
    size: 'sm',
    'aria-label': 'Color count',
    onchange: (v) => {
      // @ts-expect-error -- strict-mode fix (auto)
      const n = Math.max(MIN_COLORS, Math.min(MAX_COLORS, v));
      setColorCount(n);
      const current = colors();
      if (n > current.length) {
        regenerate();
      } else if (n < current.length) {
        // Remove unlocked colors from the end
        const locked = lockedSet();
        let trimmed = [...current];
        while (trimmed.length > n) {
          const lastUnlocked = [...Array(trimmed.length).keys()].reverse().find(i => !locked.has(i));
          if (lastUnlocked !== undefined) trimmed.splice(lastUnlocked, 1);
          else trimmed.pop();
        }
        setColors(trimmed);
        fireChange(trimmed);
      }
    }
  });

  const toolbar = div({ class: 'd-colorpalette-toolbar' },
    harmonySegmented, shuffleBtn, copyAllBtn, countInput
  );

  const addBtn = buttonTag({
    type: 'button',
    class: 'd-colorpalette-add',
    'aria-label': 'Add color',
    onclick: addColor
  // @ts-expect-error -- strict-mode fix (auto)
  }, icon('plus', { size: '1.25rem' }));

  // Swatches container
  const swatchesEl = div({
    class: 'd-colorpalette-swatches',
    role: 'listbox',
    'aria-label': ariaLabel
  });

  const root = div({ class: cx('d-colorpalette' + sizeClass, cls) }, toolbar, swatchesEl, addBtn);

  // --- Render swatches reactively ---
  function renderSwatches() {
    // Clean up old drag handles
    dragDestroys.forEach(d => d.destroy());
    dragDestroys.length = 0;

    swatchesEl.replaceChildren();
    const cols = colors();
    const locked = lockedSet();
    const shadesEnabled = typeof showShades === 'function' ? showShades() : showShades;
    const editing = editingIdx();

    cols.forEach((hex: any, idx: number) => {
      const fg = pickSwatchForeground(hex);
      const badge = contrastBadge(hex);

      // Lock button
      const isLocked = locked.has(idx);
      const lockBtn = buttonTag({
        type: 'button',
        class: 'd-colorpalette-lock',
        'aria-label': isLocked ? 'Unlock color' : 'Lock color',
        'aria-pressed': String(isLocked),
        onclick: (e: MouseEvent) => { e.stopPropagation(); toggleLock(idx); }
      // @ts-expect-error -- strict-mode fix (auto)
      }, icon(isLocked ? 'lock' : 'unlock', { size: '0.75rem' }));
      lockBtn.style.color = fg;

      // Contrast badge
      const contrastEl = span({ class: 'd-colorpalette-contrast' }, badge);
      contrastEl.style.color = fg;

      // Swatch color block
      const colorBlock = div({ class: 'd-colorpalette-swatch-color' }, lockBtn, contrastEl);
      colorBlock.style.background = hex;

      // Info row
      const hexLabel = span({ class: 'd-colorpalette-hex' }, hex);
      const copyBtn = buttonTag({
        type: 'button',
        class: 'd-colorpalette-copy',
        'aria-label': 'Copy hex',
        onclick: (e: MouseEvent) => { e.stopPropagation(); copySingle(hex); }
      // @ts-expect-error -- strict-mode fix (auto)
      }, icon('copy', { size: '0.75rem' }));
      const editBtn = buttonTag({
        type: 'button',
        class: 'd-colorpalette-edit',
        'aria-label': 'Edit color',
        onclick: (e: MouseEvent) => { e.stopPropagation(); setEditingIdx(editing === idx ? -1 : idx); }
      // @ts-expect-error -- strict-mode fix (auto)
      }, icon('edit', { size: '0.75rem' }));
      const removeBtn = buttonTag({
        type: 'button',
        class: 'd-colorpalette-remove',
        'aria-label': 'Remove color',
        disabled: cols.length <= MIN_COLORS,
        onclick: (e: MouseEvent) => { e.stopPropagation(); removeColor(idx); }
      // @ts-expect-error -- strict-mode fix (auto)
      }, icon('x', { size: '0.75rem' }));

      const infoRow = div({ class: 'd-colorpalette-swatch-info' }, hexLabel, copyBtn, editBtn, removeBtn);

      // Shade strip
      const swatchChildren = [colorBlock, infoRow];
      if (shadesEnabled) {
        const shadeColors = generateShades(hex, 5);
        const shadesRow = div({ class: 'd-colorpalette-shades' },
          ...shadeColors.map(sh => {
            const shade = span({ class: 'd-colorpalette-shade' });
            shade.style.background = sh;
            shade.setAttribute('title', sh);
            return shade;
          })
        );
        swatchChildren.push(shadesRow);
      }

      // Inline color picker when editing
      if (editing === idx) {
        const picker = ColorPicker({
          value: hex,
          onchange: (v) => updateSingleColor(idx, v)
        });
        swatchChildren.push(picker);
      }

      const swatch = div({
        class: 'd-colorpalette-swatch',
        role: 'option',
        tabindex: '0',
        'aria-label': hex,
        'aria-selected': 'false'
      }, ...swatchChildren);

      // Keyboard
      swatch.addEventListener('keydown', (e) => {
        if (e.key === 'l' || e.key === 'L') { toggleLock(idx); e.preventDefault(); }
        else if (e.key === 'c' && !e.metaKey && !e.ctrlKey) { copySingle(hex); e.preventDefault(); }
        else if (e.key === 'Delete' || e.key === 'Backspace') { removeColor(idx); e.preventDefault(); }
        else if (e.key === 'Enter') { setEditingIdx(editing === idx ? -1 : idx); e.preventDefault(); }
        else if (e.key === 'ArrowRight') {
          const next = swatch.nextElementSibling;
          // @ts-expect-error -- strict-mode fix (auto)
          if (next && next.getAttribute('role') === 'option') next.focus();
          e.preventDefault();
        } else if (e.key === 'ArrowLeft') {
          const prev = swatch.previousElementSibling;
          // @ts-expect-error -- strict-mode fix (auto)
          if (prev && prev.getAttribute('role') === 'option') prev.focus();
          e.preventDefault();
        }
      });

      // Drag reorder
      const drag = createDrag(swatch, {
        onStart() {
          setDragIdx(idx);
          swatch.classList.add('d-colorpalette-swatch-dragging');
        },
        onMove(x) {
          // Visual feedback only — reorder on end
        },
        // @ts-expect-error -- strict-mode fix (auto)
        onEnd(x: any) {
          swatch.classList.remove('d-colorpalette-swatch-dragging');
          const swatches = [...swatchesEl.querySelectorAll('.d-colorpalette-swatch')];
          const rects = swatches.map(s => s.getBoundingClientRect());
          // Find closest swatch by x position
          let targetIdx = idx;
          let minDist = Infinity;
          rects.forEach((r, i) => {
            const dist = Math.abs(x - (r.left + r.width / 2));
            if (dist < minDist) { minDist = dist; targetIdx = i; }
          });
          if (targetIdx !== idx) {
            const current = [...colors()];
            const [moved] = current.splice(idx, 1);
            current.splice(targetIdx, 0, moved);
            // Adjust locked set
            const locked = lockedSet();
            const newLocked = new Set();
            for (const li of locked) {
              if (li === idx) newLocked.add(targetIdx);
              // @ts-expect-error -- strict-mode fix (auto)
              else if (idx < targetIdx && li > idx && li <= targetIdx) newLocked.add(li - 1);
              // @ts-expect-error -- strict-mode fix (auto)
              else if (idx > targetIdx && li >= targetIdx && li < idx) newLocked.add(li + 1);
              else newLocked.add(li);
            }
            batch(() => {
              setLockedSet(newLocked);
              setColors(current);
            });
            fireChange(current);
          }
          setDragIdx(-1);
        }
      });
      dragDestroys.push(drag);

      swatchesEl.appendChild(swatch);
    });

    // Update add button state
    // @ts-expect-error -- strict-mode fix (auto)
    addBtn.disabled = cols.length >= MAX_COLORS;
  }

  createEffect(renderSwatches);

  // Track reactive props
  if (typeof initColors === 'function') {
    createEffect(() => {
      const v = initColors();
      if (v) { setColors(v); setColorCount(v.length); }
    });
  }
  if (typeof initHarmony === 'function') {
    createEffect(() => { setHarmonyType(initHarmony()); });
  }
  if (typeof initLocked === 'function') {
    createEffect(() => { setLockedSet(new Set(initLocked() || [])); });
  }

  onDestroy(() => {
    dragDestroys.forEach(d => d.destroy());
    dragDestroys.length = 0;
  });

  return root;
})
