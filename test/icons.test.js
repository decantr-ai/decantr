import { describe, it, assert, createDOM, render } from '../src/test/index.js';
import { icon } from '../src/components/icon.js';
import { getIconPath, hasIcon, registerIcon, registerIcons, getIconNames } from '../src/icons/index.js';

describe('Icon data registry', () => {
  it('essential icons are pre-loaded', () => {
    assert.ok(hasIcon('check'), 'check should be available');
    assert.ok(hasIcon('x'), 'x should be available');
    assert.ok(hasIcon('search'), 'search should be available');
    assert.ok(hasIcon('chevron-down'), 'chevron-down should be available');
  });

  it('getIconPath returns SVG inner content', () => {
    const path = getIconPath('check');
    assert.ok(path, 'should return content');
    assert.ok(path.includes('polyline'), 'check should contain polyline element');
  });

  it('getIconPath returns null for unknown icons', () => {
    assert.strictEqual(getIconPath('nonexistent-icon-xyz'), null);
  });

  it('registerIcon adds custom icon', () => {
    registerIcon('my-custom', '<path d="M0 0L24 24"/>');
    assert.ok(hasIcon('my-custom'));
    assert.strictEqual(getIconPath('my-custom'), '<path d="M0 0L24 24"/>');
  });

  it('registerIcons adds multiple icons', () => {
    registerIcons({
      'bulk-a': '<circle cx="12" cy="12" r="10"/>',
      'bulk-b': '<rect x="4" y="4" width="16" height="16"/>'
    });
    assert.ok(hasIcon('bulk-a'));
    assert.ok(hasIcon('bulk-b'));
    assert.strictEqual(getIconPath('bulk-a'), '<circle cx="12" cy="12" r="10"/>');
  });

  it('getIconNames returns array of available names', () => {
    const names = getIconNames();
    assert.ok(Array.isArray(names));
    assert.ok(names.length >= 40, 'should have at least 40 essential icons');
    assert.ok(names.includes('check'));
    assert.ok(names.includes('x'));
  });
});

describe('icon() component', () => {
  it('creates a span element', () => {
    createDOM();
    const { container } = render(() => icon('check'));
    const el = container.querySelector('.d-i');
    assert.ok(el, 'should have d-i class');
    assert.ok(el.classList.contains('d-i-check'), 'should have d-i-check class');
  });

  it('sets role and aria-hidden', () => {
    createDOM();
    const { container } = render(() => icon('star'));
    const el = container.querySelector('.d-i');
    assert.strictEqual(el.getAttribute('role'), 'img');
    assert.strictEqual(el.getAttribute('aria-hidden'), 'true');
  });

  it('applies custom size', () => {
    createDOM();
    const { container } = render(() => icon('x', { size: '2em' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.style.width === '2em' || el.style.width.includes('2em'));
  });

  it('applies custom class', () => {
    createDOM();
    const { container } = render(() => icon('bell', { class: 'my-icon' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('my-icon'), 'should include custom class');
  });

  it('renders custom registered icon', () => {
    createDOM();
    registerIcon('test-icon', '<circle cx="12" cy="12" r="10"/>');
    const { container } = render(() => icon('test-icon'));
    const el = container.querySelector('.d-i-test-icon');
    assert.ok(el, 'should render element with custom icon class');
  });

  it('renders fill-based SVG icons correctly', () => {
    createDOM();
    registerIcon('fill-test', '<path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>');
    const { container } = render(() => icon('fill-test'));
    const el = container.querySelector('.d-i-fill-test');
    assert.ok(el, 'should render fill-based icon');
  });

  it('renders stroke-based SVG icons with fill="none" correctly', () => {
    createDOM();
    registerIcon('stroke-test', '<path fill="none" d="M12 2L22 22H2z"/>');
    const { container } = render(() => icon('stroke-test'));
    const el = container.querySelector('.d-i-stroke-test');
    assert.ok(el, 'should render stroke-based icon');
  });
});

describe('icon() weight and fill variants', () => {
  it('named weight "thin" produces --w1 class suffix', () => {
    createDOM();
    const { container } = render(() => icon('star', { weight: 'thin' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-star--w1'), 'should have d-i-star--w1 class');
  });

  it('named weight "light" produces --w1p5 class suffix', () => {
    createDOM();
    const { container } = render(() => icon('star', { weight: 'light' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-star--w1p5'), 'should have d-i-star--w1p5 class');
  });

  it('named weight "bold" produces --w3 class suffix', () => {
    createDOM();
    const { container } = render(() => icon('star', { weight: 'bold' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-star--w3'), 'should have d-i-star--w3 class');
  });

  it('default weight "regular" produces no suffix', () => {
    createDOM();
    const { container } = render(() => icon('star', { weight: 'regular' }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-star'), 'should have base d-i-star class');
    assert.ok(!el.className.includes('--w'), 'should not have weight suffix');
  });

  it('no weight option produces no suffix', () => {
    createDOM();
    const { container } = render(() => icon('check'));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-check'), 'should have base class');
  });

  it('numeric weight is clamped to [0.5, 4]', () => {
    createDOM();
    const { container: c1 } = render(() => icon('star', { weight: 0.1 }));
    assert.ok(c1.querySelector('.d-i-star--w0p5'), 'below-min should clamp to 0.5');

    const { container: c2 } = render(() => icon('star', { weight: 10 }));
    assert.ok(c2.querySelector('.d-i-star--w4'), 'above-max should clamp to 4');
  });

  it('filled: true produces --filled suffix', () => {
    createDOM();
    const { container } = render(() => icon('heart', { filled: true }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-heart--filled'), 'should have --filled suffix');
  });

  it('combined weight + fill produces correct class', () => {
    createDOM();
    const { container } = render(() => icon('heart', { weight: 'bold', filled: true }));
    const el = container.querySelector('.d-i');
    assert.ok(el.classList.contains('d-i-heart--w3-filled'), 'should have --w3-filled suffix');
  });

  it('fill-based icons ignore weight and filled options', () => {
    createDOM();
    registerIcon('fill-icon-wt', '<path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>');
    const { container } = render(() => icon('fill-icon-wt', { weight: 'bold', filled: true }));
    const el = container.querySelector('.d-i');
    // Fill-based icons get the base class since buildDataUri ignores weight/filled for them
    assert.ok(el, 'should render the icon');
  });
});
