/**
 * Decantr Accessibility Audit
 *
 * Static analysis for common WCAG violations.
 * Parses JS source strings for component patterns and validates
 * accessibility attributes. Zero third-party dependencies.
 *
 * Rules:
 *   button-label     — Buttons must have text content, aria-label, or aria-labelledby
 *   input-label      — Inputs must have associated label or aria-label
 *   img-alt          — Images must have alt attribute
 *   focus-visible    — Interactive elements need focus indicator
 *   keyboard-handler — Elements with onclick should also have onkeydown/onkeyup
 *   role-valid       — Check role values against WAI-ARIA spec
 *   heading-order    — No skipped heading levels
 *   contrast-ratio   — Reminder about contrast when using color atoms
 */

import { readFile } from 'node:fs/promises';

// ─── Valid WAI-ARIA Roles ────────────────────────────────────────

const VALID_ARIA_ROLES = new Set([
  // Widget roles
  'alert', 'alertdialog', 'application', 'button', 'cell', 'checkbox',
  'columnheader', 'combobox', 'command', 'comment', 'complementary',
  'composite', 'definition', 'dialog', 'directory', 'document',
  'feed', 'figure', 'form', 'generic', 'grid', 'gridcell', 'group',
  'heading', 'img', 'input', 'insertion', 'landmark', 'link', 'list',
  'listbox', 'listitem', 'log', 'main', 'mark', 'marquee', 'math',
  'menu', 'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'meter', 'navigation', 'none', 'note', 'option', 'paragraph',
  'presentation', 'progressbar', 'radio', 'radiogroup', 'range',
  'region', 'roletype', 'row', 'rowgroup', 'rowheader', 'scrollbar',
  'search', 'searchbox', 'section', 'sectionhead', 'select',
  'separator', 'slider', 'spinbutton', 'status', 'structure',
  'suggestion', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
  'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree',
  'treegrid', 'treeitem', 'widget', 'window',
  // Landmark roles
  'banner', 'contentinfo',
]);

// ─── Inherently keyboard-accessible elements ────────────────────

const KEYBOARD_ACCESSIBLE_ELEMENTS = new Set([
  'button', 'a', 'input', 'select', 'textarea', 'summary', 'details',
]);

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Find the line number for a character index in source.
 * @param {string} source
 * @param {number} index
 * @returns {number}
 */
function findLineNumber(source, index) {
  return source.substring(0, index).split('\n').length;
}

/**
 * Extract a context window around a match index.
 * Returns the surrounding source from the current statement/call.
 * @param {string} source
 * @param {number} index
 * @param {number} [before=200]
 * @param {number} [after=300]
 * @returns {string}
 */
function getContext(source, index, before = 200, after = 300) {
  const start = Math.max(0, index - before);
  const end = Math.min(source.length, index + after);
  return source.substring(start, end);
}

// ─── Rules ───────────────────────────────────────────────────────

/**
 * Rule: button-label
 * Buttons must have text content, aria-label, or aria-labelledby.
 */
function ruleButtonLabel(source, filename) {
  const issues = [];

  // Detect Button({...}) component calls
  const buttonCompRe = /\bButton\s*\(\s*\{/g;
  let match;
  while ((match = buttonCompRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasAriaLabelledBy = /['"]aria-labelledby['"]/.test(ctx) || /aria-labelledby\s*:/.test(ctx);
    // Check for text content: text('...') or children with text, or label prop
    const hasTextChild = /\btext\s*\(/.test(ctx);
    const hasLabel = /\blabel\s*:/.test(ctx);
    const hasChildren = /\bchildren\s*:/.test(ctx);

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextChild && !hasLabel && !hasChildren) {
      issues.push({
        rule: 'button-label',
        severity: 'error',
        message: 'Button component missing accessible label (text content, label prop, aria-label, or aria-labelledby)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  // Detect h('button', {...}) calls
  const hButtonRe = /\bh\s*\(\s*['"]button['"]\s*,/g;
  while ((match = hButtonRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasAriaLabelledBy = /['"]aria-labelledby['"]/.test(ctx) || /aria-labelledby\s*:/.test(ctx);
    const hasTextChild = /\btext\s*\(/.test(ctx);

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasTextChild) {
      issues.push({
        rule: 'button-label',
        severity: 'error',
        message: 'h(\'button\') missing accessible label (text child, aria-label, or aria-labelledby)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: input-label
 * Inputs must have associated label or aria-label.
 */
function ruleInputLabel(source, filename) {
  const issues = [];

  // Detect Input({...}) component calls
  const inputCompRe = /\bInput\s*\(\s*\{/g;
  let match;
  while ((match = inputCompRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasAriaLabelledBy = /['"]aria-labelledby['"]/.test(ctx) || /aria-labelledby\s*:/.test(ctx);
    const hasLabel = /\blabel\s*:/.test(ctx);
    const hasId = /\bid\s*:/.test(ctx);
    const hasPlaceholder = /\bplaceholder\s*:/.test(ctx);

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasLabel && !hasId) {
      issues.push({
        rule: 'input-label',
        severity: 'error',
        message: 'Input component missing accessible label (label prop, aria-label, aria-labelledby, or id for external label)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  // Detect h('input', {...}) calls
  const hInputRe = /\bh\s*\(\s*['"]input['"]\s*,/g;
  while ((match = hInputRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasAriaLabelledBy = /['"]aria-labelledby['"]/.test(ctx) || /aria-labelledby\s*:/.test(ctx);
    const hasId = /\bid\s*:/.test(ctx);

    if (!hasAriaLabel && !hasAriaLabelledBy && !hasId) {
      issues.push({
        rule: 'input-label',
        severity: 'error',
        message: 'h(\'input\') missing accessible label (aria-label, aria-labelledby, or id for external label)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: img-alt
 * Images must have alt attribute.
 */
function ruleImgAlt(source, filename) {
  const issues = [];

  // Detect Image({...}) component calls
  const imageCompRe = /\bImage\s*\(\s*\{/g;
  let match;
  while ((match = imageCompRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAlt = /\balt\s*:/.test(ctx);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasRole = /role\s*:\s*['"]presentation['"]/.test(ctx) || /role\s*:\s*['"]none['"]/.test(ctx);

    if (!hasAlt && !hasAriaLabel && !hasRole) {
      issues.push({
        rule: 'img-alt',
        severity: 'error',
        message: 'Image component missing alt attribute (provide alt, aria-label, or role="presentation" for decorative images)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  // Detect h('img', {...}) calls
  const hImgRe = /\bh\s*\(\s*['"]img['"]\s*,/g;
  while ((match = hImgRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 50, 400);
    const hasAlt = /\balt\s*:/.test(ctx);
    const hasAriaLabel = /['"]aria-label['"]/.test(ctx) || /aria-label\s*:/.test(ctx);
    const hasRole = /role\s*:\s*['"]presentation['"]/.test(ctx) || /role\s*:\s*['"]none['"]/.test(ctx);

    if (!hasAlt && !hasAriaLabel && !hasRole) {
      issues.push({
        rule: 'img-alt',
        severity: 'error',
        message: 'h(\'img\') missing alt attribute (provide alt, aria-label, or role="presentation")',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: focus-visible
 * Interactive elements with onclick should have focus indicator classes.
 */
function ruleFocusVisible(source, filename) {
  const issues = [];

  // Find elements with onclick handlers
  const onclickRe = /\bonclick\s*:/g;
  let match;
  while ((match = onclickRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 300, 300);
    const hasFocusVisible = /_focusVisible/.test(ctx) || /_ring/.test(ctx) || /_focusRing/.test(ctx);
    const hasOutline = /outline/.test(ctx);
    const hasFocusClass = /focus/.test(ctx) && /class/.test(ctx);
    // Skip if this is inside a Button/Input/etc. component (they handle focus internally)
    const isComponentProp = /\b(Button|Input|Select|Checkbox|Switch|Radio)\s*\(\s*\{/.test(ctx);

    if (!hasFocusVisible && !hasOutline && !hasFocusClass && !isComponentProp) {
      issues.push({
        rule: 'focus-visible',
        severity: 'warning',
        message: 'Element with onclick handler may need focus indicator (_focusVisible or _ring atom)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: keyboard-handler
 * Non-button/link elements with onclick should also have onkeydown/onkeyup.
 */
function ruleKeyboardHandler(source, filename) {
  const issues = [];

  // Find onclick handlers and check context for element type and keyboard handler
  const onclickRe = /\bonclick\s*:/g;
  let match;
  while ((match = onclickRe.exec(source)) !== null) {
    const ctx = getContext(source, match.index, 300, 300);

    // Check if this is inside a natively keyboard-accessible element
    let isNativelyAccessible = false;
    for (const el of KEYBOARD_ACCESSIBLE_ELEMENTS) {
      // Check for h('button', or h('a', or Button( etc.
      const hPattern = new RegExp(`\\bh\\s*\\(\\s*['"]${el}['"]`);
      if (hPattern.test(ctx)) {
        isNativelyAccessible = true;
        break;
      }
    }
    // Check for component calls like Button(, Select(, etc.
    if (/\b(Button|Input|Select|Checkbox|Switch|Radio|Combobox|Textarea)\s*\(\s*\{/.test(ctx)) {
      isNativelyAccessible = true;
    }
    // Check for role="button" which implies keyboard handling
    if (/role\s*:\s*['"]button['"]/.test(ctx)) {
      isNativelyAccessible = true;
    }

    if (isNativelyAccessible) continue;

    const hasKeyboard = /\bonkeydown\s*:/.test(ctx) || /\bonkeyup\s*:/.test(ctx) || /\bonkeypress\s*:/.test(ctx);
    const hasTabindex = /\btabindex\s*:/.test(ctx) || /\btabIndex\s*:/.test(ctx);

    if (!hasKeyboard) {
      issues.push({
        rule: 'keyboard-handler',
        severity: 'error',
        message: 'Non-interactive element with onclick missing keyboard handler (add onkeydown/onkeyup for keyboard accessibility)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: role-valid
 * Check that role values are valid WAI-ARIA roles.
 */
function ruleRoleValid(source, filename) {
  const issues = [];

  // Match role: 'value' or role: "value" or 'role': 'value'
  const roleRe = /(?:['"]?role['"]?\s*:\s*)['"]([a-zA-Z]+)['"]/g;
  let match;
  while ((match = roleRe.exec(source)) !== null) {
    const role = match[1].toLowerCase();
    if (!VALID_ARIA_ROLES.has(role)) {
      issues.push({
        rule: 'role-valid',
        severity: 'error',
        message: `Invalid ARIA role "${match[1]}" — must be a valid WAI-ARIA role`,
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

/**
 * Rule: heading-order
 * Heading levels should not be skipped (e.g. h1 -> h3 without h2).
 */
function ruleHeadingOrder(source, filename) {
  const issues = [];

  // Collect all heading references in order of appearance
  const headings = [];

  // Match h('h1') through h('h6')
  const hCallRe = /\bh\s*\(\s*['"]h([1-6])['"]/g;
  let match;
  while ((match = hCallRe.exec(source)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      index: match.index,
    });
  }

  // Match tags.h1 through tags.h6
  const tagsRe = /\btags\.h([1-6])\b/g;
  while ((match = tagsRe.exec(source)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      index: match.index,
    });
  }

  // Sort by position in source
  headings.sort((a, b) => a.index - b.index);

  // Check for skipped levels
  for (let i = 1; i < headings.length; i++) {
    const prev = headings[i - 1].level;
    const curr = headings[i].level;
    // Only flag when going deeper and skipping a level (e.g. h1 -> h3)
    if (curr > prev && curr - prev > 1) {
      issues.push({
        rule: 'heading-order',
        severity: 'warning',
        message: `Heading level skipped: h${prev} to h${curr} (missing h${prev + 1})`,
        file: filename,
        line: findLineNumber(source, headings[i].index),
      });
    }
  }

  return issues;
}

/**
 * Rule: contrast-ratio
 * Info-level reminder when foreground and background color atoms are used together.
 * Full contrast checking requires runtime; this is a static reminder.
 */
function ruleContrastRatio(source, filename) {
  const issues = [];

  // Look for css() calls with both _fg* and _bg* atoms
  const cssCallRe = /\bcss\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  let match;
  while ((match = cssCallRe.exec(source)) !== null) {
    const atomStr = match[1];
    const hasFg = /_fg[a-zA-Z]/.test(atomStr);
    const hasBg = /_bg[a-zA-Z]/.test(atomStr);
    if (hasFg && hasBg) {
      issues.push({
        rule: 'contrast-ratio',
        severity: 'info',
        message: 'Foreground and background color atoms used together — verify WCAG AA contrast ratio (4.5:1 for text, 3:1 for large text)',
        file: filename,
        line: findLineNumber(source, match.index),
      });
    }
  }

  return issues;
}

// ─── Rule Registry ───────────────────────────────────────────────

const RULES = [
  ruleButtonLabel,
  ruleInputLabel,
  ruleImgAlt,
  ruleFocusVisible,
  ruleKeyboardHandler,
  ruleRoleValid,
  ruleHeadingOrder,
  ruleContrastRatio,
];

// ─── Public API ──────────────────────────────────────────────────

/**
 * Audit a single source string for accessibility issues.
 * @param {string} source - JavaScript source code
 * @param {string} [filename='unknown'] - Filename for issue reporting
 * @returns {{rule: string, severity: 'error'|'warning'|'info', message: string, file: string, line?: number}[]}
 */
export function auditSource(source, filename = 'unknown') {
  const issues = [];
  for (const rule of RULES) {
    issues.push(...rule(source, filename));
  }
  return issues;
}

/**
 * Audit multiple files from disk.
 * @param {string[]} files - Array of absolute file paths
 * @returns {Promise<{rule: string, severity: 'error'|'warning'|'info', message: string, file: string, line?: number}[]>}
 */
export async function auditFiles(files) {
  const allIssues = [];
  for (const file of files) {
    try {
      const source = await readFile(file, 'utf-8');
      allIssues.push(...auditSource(source, file));
    } catch {
      // Skip unreadable files
    }
  }
  return allIssues;
}

/**
 * Format audit issues into a human-readable report string.
 * @param {{rule: string, severity: 'error'|'warning'|'info', message: string, file: string, line?: number}[]} issues
 * @returns {string}
 */
export function formatIssues(issues) {
  if (issues.length === 0) return '  No accessibility issues found.\n';

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');
  const info = issues.filter(i => i.severity === 'info');

  let output = '\n';
  for (const issue of issues) {
    const loc = issue.line ? `:${issue.line}` : '';
    const icon = issue.severity === 'error' ? '\u2717' : issue.severity === 'warning' ? '\u26A0' : '\u2139';
    output += `  ${icon} [${issue.rule}] ${issue.file}${loc}: ${issue.message}\n`;
  }
  output += `\n  ${errors.length} error(s), ${warnings.length} warning(s), ${info.length} info\n`;
  return output;
}
