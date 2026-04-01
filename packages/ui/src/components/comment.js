/**
 * Comment — Threaded discussion component with nested replies.
 *
 * @module decantr/components/comment
 */
import { h } from '../runtime/index.js';
import { createSignal, createEffect } from '../state/index.js';
import { injectBase, cx } from './_base.js';
import { Avatar } from './avatar.js';
import { icon } from './icon.js';

/**
 * @param {Object} [props]
 * @param {string} [props.author] - Display name
 * @param {string|Node} [props.avatar] - URL, initials (1-2 chars → Avatar fallback), or Node
 * @param {string|Node} [props.content] - Comment body
 * @param {string} [props.datetime] - Timestamp string
 * @param {{ label: string, icon?: string, onclick?: Function, count?: number|Function, active?: boolean|Function }[]} [props.actions] - Action buttons
 * @param {Function} [props.onReply] - (text) => void — enables reply editor
 * @param {'default'|'minimal'|'bordered'} [props.variant='default']
 * @param {string} [props.class]
 * @returns {HTMLElement}
 */
export function Comment(props = {}, ...children) {
  injectBase();
  const {
    author, avatar, content, datetime, actions = [],
    onReply, variant = 'default', class: cls
  } = props;

  const root = h('div', {
    class: cx('d-comment',
      variant === 'bordered' && 'd-comment-bordered',
      variant === 'minimal' && 'd-comment-minimal',
      cls
    )
  });

  const inner = h('div', { class: 'd-comment-inner' });

  // Avatar
  if (avatar != null) {
    const avatarWrap = h('div', { class: 'd-comment-avatar' });
    if (avatar && avatar.nodeType) {
      avatarWrap.appendChild(avatar);
    } else if (typeof avatar === 'string') {
      if (avatar.length <= 2) {
        avatarWrap.appendChild(Avatar({ fallback: avatar, size: 'sm' }));
      } else if (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('data:')) {
        avatarWrap.appendChild(Avatar({ src: avatar, size: 'sm' }));
      } else {
        avatarWrap.appendChild(Avatar({ fallback: avatar, size: 'sm' }));
      }
    }
    inner.appendChild(avatarWrap);
  }

  // Body
  const body = h('div', { class: 'd-comment-body' });

  // Header (author + datetime)
  if (author || datetime) {
    const header = h('div', { class: 'd-comment-header' });
    if (author) header.appendChild(h('span', { class: 'd-comment-author' }, author));
    if (datetime) header.appendChild(h('span', { class: 'd-comment-time' }, datetime));
    body.appendChild(header);
  }

  // Content
  if (content != null) {
    const contentEl = h('div', { class: 'd-comment-content' });
    if (typeof content === 'string') {
      contentEl.textContent = content;
    } else if (content.nodeType) {
      contentEl.appendChild(content);
    }
    body.appendChild(contentEl);
  }

  // Actions
  if (actions.length > 0 || onReply) {
    const actionsEl = h('div', { class: 'd-comment-actions' });

    actions.forEach(action => {
      const btn = h('button', {
        class: 'd-comment-action',
        type: 'button',
        'aria-label': action.label
      });

      // Icon
      if (action.icon) {
        try {
          btn.appendChild(icon(action.icon, { size: 14 }));
        } catch {
          // icon not registered, skip
        }
      }

      // Count (reactive or static)
      const countSpan = h('span');
      if (action.count != null) {
        if (typeof action.count === 'function') {
          createEffect(() => {
            const val = action.count();
            countSpan.textContent = val > 0 ? String(val) : '';
          });
        } else {
          countSpan.textContent = action.count > 0 ? String(action.count) : '';
        }
        btn.appendChild(countSpan);
      } else {
        btn.appendChild(h('span', null, action.label));
      }

      // Active state (reactive or static)
      if (action.active != null) {
        if (typeof action.active === 'function') {
          createEffect(() => {
            btn.classList.toggle('d-comment-action-active', !!action.active());
          });
        } else if (action.active) {
          btn.classList.add('d-comment-action-active');
        }
      }

      if (action.onclick) {
        btn.addEventListener('click', action.onclick);
      }

      actionsEl.appendChild(btn);
    });

    // Reply action
    if (onReply) {
      const replyBtn = h('button', {
        class: 'd-comment-action',
        type: 'button',
        'aria-label': 'Reply'
      });
      try { replyBtn.appendChild(icon('message-circle', { size: 14 })); } catch {}
      replyBtn.appendChild(h('span', null, 'Reply'));

      const [showEditor, setShowEditor] = createSignal(false);
      replyBtn.addEventListener('click', () => setShowEditor(!showEditor()));

      actionsEl.appendChild(replyBtn);

      // Editor
      const editor = h('div', { class: 'd-comment-editor' });
      const textarea = h('textarea', {
        rows: '3',
        placeholder: 'Write a reply...',
        class: 'd-field'
      });
      const editorActions = h('div', { class: 'd-comment-editor-actions' });
      const submitBtn = h('button', {
        class: 'd-btn d-btn-primary d-btn-sm',
        type: 'button'
      }, 'Submit');
      const cancelBtn = h('button', {
        class: 'd-btn d-btn-sm',
        type: 'button'
      }, 'Cancel');
      submitBtn.addEventListener('click', () => {
        const text = textarea.value.trim();
        if (text) {
          onReply(text);
          textarea.value = '';
          setShowEditor(false);
        }
      });
      cancelBtn.addEventListener('click', () => {
        textarea.value = '';
        setShowEditor(false);
      });
      editorActions.appendChild(submitBtn);
      editorActions.appendChild(cancelBtn);
      editor.appendChild(textarea);
      editor.appendChild(editorActions);

      createEffect(() => {
        editor.style.display = showEditor() ? '' : 'none';
      });

      body.appendChild(actionsEl);
      body.appendChild(editor);
    } else {
      body.appendChild(actionsEl);
    }
  }

  inner.appendChild(body);
  root.appendChild(inner);

  // Nested replies (rest args)
  if (children.length > 0) {
    const nested = h('div', { class: 'd-comment-nested' });
    children.forEach(child => {
      if (child?.nodeType) nested.appendChild(child);
    });
    root.appendChild(nested);
  }

  return root;
}
