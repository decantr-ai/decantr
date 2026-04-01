/**
 * Upload — File upload with drag-and-drop, file list, and progress.
 *
 * @module decantr/components/upload
 */
import { h } from '../runtime/index.js';
import { injectBase, cx } from './_base.js';

import { component } from '../runtime/component.js';
export interface UploadProps {
  multiple?: boolean;
  accept?: string;
  drag?: boolean;
  maxSize?: number;
  maxCount?: number;
  onchange?: (value: unknown) => void;
  onRemove?: (...args: unknown[]) => unknown;
  customRequest?: (...args: unknown[]) => unknown;
  disabled?: boolean | (() => boolean);
  class?: string;
  [key: string]: unknown;
}

/**
 * @param {Object} [props]
 * @param {boolean} [props.multiple=false]
 * @param {string} [props.accept] - File type filter (e.g. 'image/*,.pdf')
 * @param {boolean} [props.drag=false] - Enable drag-and-drop zone
 * @param {number} [props.maxSize] - Max file size in bytes
 * @param {number} [props.maxCount] - Max number of files
 * @param {Function} [props.onchange] - Called with FileList
 * @param {Function} [props.onRemove] - Called with file on remove
 * @param {Function} [props.customRequest] - Custom upload handler (file) => void
 * @param {boolean|Function} [props.disabled]
 * @param {string} [props.class]
 * @param {...Node} children - Custom trigger content (for drag mode, shown inside drop zone)
 * @returns {HTMLElement}
 */
export const Upload = component<UploadProps>((props: UploadProps = {} as UploadProps, ...children: (string | Node)[]) => {
  injectBase();
  const { multiple = false, accept, drag = false, maxSize, maxCount, onchange, onRemove, customRequest, disabled, class: cls } = props;

  const files = [];
  const fileInput = h('input', {
    type: 'file',
    class: 'd-upload-input',
    multiple: multiple ? '' : undefined,
    accept
  });

  const fileList = h('div', { class: 'd-upload-list' });
  const container = h('div', { class: cx('d-upload', cls) });

  function addFiles(newFiles) {
    for (const file of newFiles) {
      if (maxSize && file.size > maxSize) continue;
      if (maxCount && files.length >= maxCount) break;
      files.push(file);
      renderFileItem(file);
      if (customRequest) customRequest(file);
    }
    if (onchange) onchange([...files]);
  }

  function removeFile(file) {
    const idx = files.indexOf(file);
    if (idx >= 0) files.splice(idx, 1);
    renderFileList();
    if (onRemove) onRemove(file);
    if (onchange) onchange([...files]);
  }

  function renderFileItem(file) {
    const item = h('div', { class: 'd-upload-item' });
    item.appendChild(h('span', { class: 'd-upload-item-name' }, file.name));
    const removeBtn = h('button', { type: 'button', class: 'd-upload-item-remove', 'aria-label': `Remove ${file.name}` }, '\u00d7');
    removeBtn.addEventListener('click', () => removeFile(file));
    item.appendChild(removeBtn);
    fileList.appendChild(item);
  }

  function renderFileList() {
    fileList.replaceChildren();
    files.forEach(renderFileItem);
  }

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) addFiles(fileInput.files);
    fileInput.value = '';
  });

  if (drag) {
    const dragger = h('div', { class: 'd-upload-dragger' },
      ...children.length ? children : [h('span', null, 'Click or drag files here')]
    );

    dragger.addEventListener('click', () => {
      if (typeof disabled === 'function' ? disabled() : disabled) return;
      fileInput.click();
    });

    dragger.addEventListener('dragover', (e) => {
      e.preventDefault();
      dragger.classList.add('d-upload-dragger-active');
    });
    dragger.addEventListener('dragleave', () => {
      dragger.classList.remove('d-upload-dragger-active');
    });
    dragger.addEventListener('drop', (e) => {
      e.preventDefault();
      dragger.classList.remove('d-upload-dragger-active');
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });

    container.appendChild(fileInput);
    container.appendChild(dragger);
  } else {
    const triggerBtn = children.length
      ? h('div', { class: 'd-upload-trigger' }, ...children)
      : h('button', { type: 'button', class: 'd-btn d-btn-default' }, 'Upload');

    triggerBtn.addEventListener('click', () => {
      if (typeof disabled === 'function' ? disabled() : disabled) return;
      fileInput.click();
    });

    container.appendChild(fileInput);
    container.appendChild(triggerBtn);
  }

  container.appendChild(fileList);
  return container;
})
