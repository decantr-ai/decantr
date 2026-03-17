import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { auditSource, formatIssues } from '../tools/a11y-audit.js';

// ============================================================
// button-label
// ============================================================

describe('button-label rule', () => {
  it('passes when Button has text child', () => {
    const source = `Button({ onclick: handler }, text('Click me'))`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('passes when Button has label prop', () => {
    const source = `Button({ label: 'Submit', onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('passes when Button has aria-label', () => {
    const source = `Button({ 'aria-label': 'Close dialog', onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('passes when Button has aria-labelledby', () => {
    const source = `Button({ 'aria-labelledby': 'heading-1', onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('passes when Button has children prop', () => {
    const source = `Button({ children: iconEl, onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('fails when Button has no label at all', () => {
    const source = `Button({ onclick: handler, class: css('_p2') })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 1);
    assert.equal(buttonIssues[0].severity, 'error');
  });

  it('passes when h("button") has text child', () => {
    const source = `h('button', { onclick: handler }, text('Save'))`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('fails when h("button") has no label', () => {
    const source = `h('button', { onclick: handler, class: css('_p2') })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 1);
    assert.equal(buttonIssues[0].severity, 'error');
  });

  it('passes when h("button") has aria-label', () => {
    const source = `h('button', { 'aria-label': 'Close', onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 0);
  });

  it('reports correct file and line', () => {
    const source = `const x = 1;\nconst y = 2;\nButton({ onclick: fn })`;
    const issues = auditSource(source, 'my-file.js');
    const buttonIssues = issues.filter(i => i.rule === 'button-label');
    assert.equal(buttonIssues.length, 1);
    assert.equal(buttonIssues[0].file, 'my-file.js');
    assert.equal(buttonIssues[0].line, 3);
  });
});

// ============================================================
// input-label
// ============================================================

describe('input-label rule', () => {
  it('passes when Input has label prop', () => {
    const source = `Input({ label: 'Email', placeholder: 'you@example.com' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });

  it('passes when Input has aria-label', () => {
    const source = `Input({ 'aria-label': 'Search', type: 'search' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });

  it('passes when Input has aria-labelledby', () => {
    const source = `Input({ 'aria-labelledby': 'name-label' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });

  it('passes when Input has id for external label', () => {
    const source = `Input({ id: 'email-input', type: 'email' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });

  it('fails when Input has no label mechanism', () => {
    const source = `Input({ type: 'text', placeholder: 'Enter name' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 1);
    assert.equal(inputIssues[0].severity, 'error');
  });

  it('passes when h("input") has aria-label', () => {
    const source = `h('input', { 'aria-label': 'Query', type: 'text' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });

  it('fails when h("input") has no label', () => {
    const source = `h('input', { type: 'text', placeholder: 'search...' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 1);
    assert.equal(inputIssues[0].severity, 'error');
  });

  it('passes when h("input") has id', () => {
    const source = `h('input', { id: 'name-field', type: 'text' })`;
    const issues = auditSource(source, 'test.js');
    const inputIssues = issues.filter(i => i.rule === 'input-label');
    assert.equal(inputIssues.length, 0);
  });
});

// ============================================================
// img-alt
// ============================================================

describe('img-alt rule', () => {
  it('passes when Image has alt attribute', () => {
    const source = `Image({ src: '/photo.jpg', alt: 'A sunset' })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 0);
  });

  it('passes when Image has aria-label', () => {
    const source = `Image({ src: '/logo.svg', 'aria-label': 'Company logo' })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 0);
  });

  it('passes when Image has role="presentation" (decorative)', () => {
    const source = `Image({ src: '/divider.svg', role: 'presentation' })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 0);
  });

  it('passes when Image has role="none" (decorative)', () => {
    const source = `Image({ src: '/bg.png', role: 'none' })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 0);
  });

  it('fails when Image has no alt', () => {
    const source = `Image({ src: '/photo.jpg', class: css('_rfull') })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 1);
    assert.equal(imgIssues[0].severity, 'error');
  });

  it('passes when h("img") has alt', () => {
    const source = `h('img', { src: '/pic.jpg', alt: 'A picture' })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 0);
  });

  it('fails when h("img") has no alt', () => {
    const source = `h('img', { src: '/pic.jpg', width: 300 })`;
    const issues = auditSource(source, 'test.js');
    const imgIssues = issues.filter(i => i.rule === 'img-alt');
    assert.equal(imgIssues.length, 1);
    assert.equal(imgIssues[0].severity, 'error');
  });
});

// ============================================================
// keyboard-handler
// ============================================================

describe('keyboard-handler rule', () => {
  it('passes when button element has onclick (natively accessible)', () => {
    const source = `h('button', { onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('passes when anchor element has onclick (natively accessible)', () => {
    const source = `h('a', { onclick: handler, href: '#' })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('passes when Button component has onclick (natively accessible)', () => {
    const source = `Button({ onclick: handler, label: 'Save' })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('fails when div with onclick has no keyboard handler', () => {
    const source = `h('div', { onclick: handler, class: css('_p4') })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 1);
    assert.equal(kbIssues[0].severity, 'error');
  });

  it('passes when div with onclick also has onkeydown', () => {
    const source = `h('div', { onclick: handler, onkeydown: kbHandler, tabindex: 0 })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('passes when div with onclick also has onkeyup', () => {
    const source = `h('div', { onclick: handler, onkeyup: kbHandler })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('passes when element has role="button" with onclick', () => {
    const source = `h('span', { role: 'button', onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });

  it('passes when input element has onclick (natively accessible)', () => {
    const source = `h('input', { onclick: handler, id: 'check1' })`;
    const issues = auditSource(source, 'test.js');
    const kbIssues = issues.filter(i => i.rule === 'keyboard-handler');
    assert.equal(kbIssues.length, 0);
  });
});

// ============================================================
// role-valid
// ============================================================

describe('role-valid rule', () => {
  it('passes for valid role "button"', () => {
    const source = `h('div', { role: 'button', onclick: fn })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 0);
  });

  it('passes for valid role "dialog"', () => {
    const source = `h('div', { role: 'dialog' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 0);
  });

  it('passes for valid role "navigation"', () => {
    const source = `h('nav', { role: 'navigation' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 0);
  });

  it('passes for valid role "tablist"', () => {
    const source = `h('div', { role: 'tablist' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 0);
  });

  it('passes for valid role "presentation"', () => {
    const source = `h('img', { role: 'presentation', src: '/bg.png' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 0);
  });

  it('fails for invalid role "clickable"', () => {
    const source = `h('div', { role: 'clickable' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 1);
    assert.equal(roleIssues[0].severity, 'error');
    assert.ok(roleIssues[0].message.includes('clickable'));
  });

  it('fails for invalid role "container"', () => {
    const source = `h('div', { role: 'container' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 1);
  });

  it('fails for invalid role "dropdown"', () => {
    const source = `h('div', { role: 'dropdown' })`;
    const issues = auditSource(source, 'test.js');
    const roleIssues = issues.filter(i => i.rule === 'role-valid');
    assert.equal(roleIssues.length, 1);
  });
});

// ============================================================
// heading-order
// ============================================================

describe('heading-order rule', () => {
  it('passes for sequential h1 -> h2 -> h3', () => {
    const source = `
      h('h1', {}, text('Title'));
      h('h2', {}, text('Subtitle'));
      h('h3', {}, text('Section'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 0);
  });

  it('passes for same-level headings', () => {
    const source = `
      h('h2', {}, text('Section A'));
      h('h2', {}, text('Section B'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 0);
  });

  it('passes when going from deeper to shallower (h3 -> h2)', () => {
    const source = `
      h('h1', {}, text('Title'));
      h('h2', {}, text('Sub'));
      h('h3', {}, text('Detail'));
      h('h2', {}, text('Next section'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 0);
  });

  it('fails when h1 -> h3 (skips h2)', () => {
    const source = `
      h('h1', {}, text('Title'));
      h('h3', {}, text('Skipped!'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 1);
    assert.equal(headingIssues[0].severity, 'warning');
    assert.ok(headingIssues[0].message.includes('h1'));
    assert.ok(headingIssues[0].message.includes('h3'));
  });

  it('fails when h2 -> h4 (skips h3)', () => {
    const source = `
      h('h2', {}, text('Section'));
      h('h4', {}, text('Deep'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 1);
    assert.ok(headingIssues[0].message.includes('h2'));
    assert.ok(headingIssues[0].message.includes('h4'));
  });

  it('detects tags.h1 through tags.h6 syntax', () => {
    const source = `
      tags.h1({}, text('Title'));
      tags.h3({}, text('Skipped'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 1);
  });

  it('handles mixed h() and tags syntax', () => {
    const source = `
      h('h1', {}, text('Title'));
      tags.h2({}, text('Sub'));
      h('h3', {}, text('Section'));
    `;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 0);
  });

  it('passes for a single heading', () => {
    const source = `h('h2', {}, text('Just one'));`;
    const issues = auditSource(source, 'test.js');
    const headingIssues = issues.filter(i => i.rule === 'heading-order');
    assert.equal(headingIssues.length, 0);
  });
});

// ============================================================
// focus-visible
// ============================================================

describe('focus-visible rule', () => {
  it('warns when onclick element lacks focus indicator', () => {
    const source = `h('div', { onclick: handler, class: css('_p4 _bgmuted') })`;
    const issues = auditSource(source, 'test.js');
    const focusIssues = issues.filter(i => i.rule === 'focus-visible');
    assert.equal(focusIssues.length, 1);
    assert.equal(focusIssues[0].severity, 'warning');
  });

  it('passes when onclick element has _focusVisible atom', () => {
    const source = `h('div', { onclick: handler, class: css('_p4 _focusVisible') })`;
    const issues = auditSource(source, 'test.js');
    const focusIssues = issues.filter(i => i.rule === 'focus-visible');
    assert.equal(focusIssues.length, 0);
  });

  it('passes when onclick element has _ring atom', () => {
    const source = `h('div', { onclick: handler, class: css('_p4 _ring') })`;
    const issues = auditSource(source, 'test.js');
    const focusIssues = issues.filter(i => i.rule === 'focus-visible');
    assert.equal(focusIssues.length, 0);
  });

  it('skips Button components (they handle focus internally)', () => {
    const source = `Button({ onclick: handler })`;
    const issues = auditSource(source, 'test.js');
    const focusIssues = issues.filter(i => i.rule === 'focus-visible');
    assert.equal(focusIssues.length, 0);
  });

  it('passes when element has outline style', () => {
    const source = `h('div', { onclick: handler, class: css('_p4'), style: 'outline: 2px solid blue' })`;
    const issues = auditSource(source, 'test.js');
    const focusIssues = issues.filter(i => i.rule === 'focus-visible');
    assert.equal(focusIssues.length, 0);
  });
});

// ============================================================
// contrast-ratio
// ============================================================

describe('contrast-ratio rule', () => {
  it('emits info when _fg* and _bg* atoms used together', () => {
    const source = `h('div', { class: css('_fgfg _bgmuted _p4') })`;
    const issues = auditSource(source, 'test.js');
    const contrastIssues = issues.filter(i => i.rule === 'contrast-ratio');
    assert.equal(contrastIssues.length, 1);
    assert.equal(contrastIssues[0].severity, 'info');
  });

  it('does not emit for _fg* only', () => {
    const source = `h('div', { class: css('_fgprimary _p4') })`;
    const issues = auditSource(source, 'test.js');
    const contrastIssues = issues.filter(i => i.rule === 'contrast-ratio');
    assert.equal(contrastIssues.length, 0);
  });

  it('does not emit for _bg* only', () => {
    const source = `h('div', { class: css('_bgbg _p4') })`;
    const issues = auditSource(source, 'test.js');
    const contrastIssues = issues.filter(i => i.rule === 'contrast-ratio');
    assert.equal(contrastIssues.length, 0);
  });

  it('does not emit when no color atoms are present', () => {
    const source = `h('div', { class: css('_p4 _flex _col') })`;
    const issues = auditSource(source, 'test.js');
    const contrastIssues = issues.filter(i => i.rule === 'contrast-ratio');
    assert.equal(contrastIssues.length, 0);
  });
});

// ============================================================
// Combined / integration tests
// ============================================================

describe('combined auditing', () => {
  it('returns multiple issues from different rules', () => {
    const source = `
      Button({ onclick: handler })
      h('img', { src: '/pic.jpg' })
      h('div', { role: 'foobar' })
    `;
    const issues = auditSource(source, 'multi.js');
    const rules = new Set(issues.map(i => i.rule));
    assert.ok(rules.has('button-label'));
    assert.ok(rules.has('img-alt'));
    assert.ok(rules.has('role-valid'));
  });

  it('returns empty array for clean source', () => {
    const source = `
      import { h, text } from 'decantr/core';
      import { Button, Input, Image } from 'decantr/components';

      const name = 'world';
      const count = 42;

      function renderGreeting() {
        return h('div', { class: css('_p4 _flex _col') },
          h('h1', {}, text('Hello')),
          h('h2', {}, text('World')),
        );
      }
    `;
    const issues = auditSource(source, 'clean.js');
    assert.equal(issues.length, 0);
  });

  it('issues include filename in every issue', () => {
    const source = `Button({ onclick: fn })\nh('img', { src: 'x' })`;
    const issues = auditSource(source, 'my-component.js');
    for (const issue of issues) {
      assert.equal(issue.file, 'my-component.js');
    }
  });

  it('uses "unknown" as default filename', () => {
    const source = `Button({ onclick: fn })`;
    const issues = auditSource(source);
    assert.equal(issues[0].file, 'unknown');
  });

  it('handles empty source', () => {
    const issues = auditSource('', 'empty.js');
    assert.equal(issues.length, 0);
  });

  it('handles source with no components at all', () => {
    const source = `
      const x = 1;
      const y = 2;
      function add(a, b) { return a + b; }
    `;
    const issues = auditSource(source, 'plain.js');
    assert.equal(issues.length, 0);
  });
});

// ============================================================
// formatIssues
// ============================================================

describe('formatIssues()', () => {
  it('returns success message for empty array', () => {
    const output = formatIssues([]);
    assert.ok(output.includes('No accessibility issues found'));
  });

  it('formats errors with cross mark', () => {
    const issues = [{
      rule: 'button-label',
      severity: 'error',
      message: 'Missing label',
      file: 'test.js',
      line: 5,
    }];
    const output = formatIssues(issues);
    assert.ok(output.includes('\u2717'));
    assert.ok(output.includes('[button-label]'));
    assert.ok(output.includes('test.js:5'));
    assert.ok(output.includes('Missing label'));
    assert.ok(output.includes('1 error(s)'));
  });

  it('formats warnings with warning mark', () => {
    const issues = [{
      rule: 'heading-order',
      severity: 'warning',
      message: 'Skipped level',
      file: 'page.js',
      line: 10,
    }];
    const output = formatIssues(issues);
    assert.ok(output.includes('\u26A0'));
    assert.ok(output.includes('1 warning(s)'));
  });

  it('formats info with info mark', () => {
    const issues = [{
      rule: 'contrast-ratio',
      severity: 'info',
      message: 'Check contrast',
      file: 'app.js',
      line: 3,
    }];
    const output = formatIssues(issues);
    assert.ok(output.includes('\u2139'));
    assert.ok(output.includes('1 info'));
  });

  it('counts all severity levels correctly', () => {
    const issues = [
      { rule: 'a', severity: 'error', message: 'e1', file: 'f.js' },
      { rule: 'b', severity: 'error', message: 'e2', file: 'f.js' },
      { rule: 'c', severity: 'warning', message: 'w1', file: 'f.js' },
      { rule: 'd', severity: 'info', message: 'i1', file: 'f.js' },
      { rule: 'e', severity: 'info', message: 'i2', file: 'f.js' },
    ];
    const output = formatIssues(issues);
    assert.ok(output.includes('2 error(s)'));
    assert.ok(output.includes('1 warning(s)'));
    assert.ok(output.includes('2 info'));
  });

  it('omits line number when not provided', () => {
    const issues = [{
      rule: 'test',
      severity: 'error',
      message: 'No line',
      file: 'test.js',
    }];
    const output = formatIssues(issues);
    // Should have test.js: but not test.js:undefined
    assert.ok(output.includes('test.js:'));
    assert.ok(!output.includes('undefined'));
  });
});
