class EventTarget_ {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
  }
  addEventListener(type, fn) {
    let set = this._listeners.get(type);
    if (!set) { set = new Set(); this._listeners.set(type, set); }
    set.add(fn);
  }
  removeEventListener(type, fn) {
    const set = this._listeners.get(type);
    if (set) set.delete(fn);
  }
  dispatchEvent(event) {
    try { event.target = this; } catch (e) { /* target may be read-only */ }
    const set = this._listeners.get(event.type);
    if (set) for (const fn of set) fn(event);
    return true;
  }
}

class Node_ extends EventTarget_ {
  constructor(nodeType) {
    super();
    this.nodeType = nodeType;
    this.parentNode = null;
    this.childNodes = [];
    this.nodeValue = null;
  }
  get textContent() {
    if (this.nodeType === 3) return this.nodeValue;
    if (this.nodeType === 8) return this.nodeValue;
    return this.childNodes.map(c => c.textContent).join('');
  }
  set textContent(v) {
    if (this.nodeType === 3 || this.nodeType === 8) { this.nodeValue = v; return; }
    this.childNodes.forEach(c => { c.parentNode = null; });
    this.childNodes = [];
    if (v) this.appendChild(new Text_(v));
  }
  appendChild(child) {
    if (child.parentNode) child.parentNode.removeChild(child);
    child.parentNode = this;
    this.childNodes.push(child);
    return child;
  }
  removeChild(child) {
    const i = this.childNodes.indexOf(child);
    if (i !== -1) { this.childNodes.splice(i, 1); child.parentNode = null; }
    return child;
  }
  insertBefore(newChild, ref) {
    if (newChild.parentNode) newChild.parentNode.removeChild(newChild);
    const i = ref ? this.childNodes.indexOf(ref) : this.childNodes.length;
    newChild.parentNode = this;
    this.childNodes.splice(i === -1 ? this.childNodes.length : i, 0, newChild);
    return newChild;
  }
  replaceChildren(...nodes) {
    this.childNodes.forEach(c => { c.parentNode = null; });
    this.childNodes = [];
    for (const n of nodes) this.appendChild(n);
  }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get nextSibling() {
    if (!this.parentNode) return null;
    const i = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[i + 1] || null;
  }
  get previousSibling() {
    if (!this.parentNode) return null;
    const i = this.parentNode.childNodes.indexOf(this);
    return this.parentNode.childNodes[i - 1] || null;
  }
  contains(other) {
    if (this === other) return true;
    return this.childNodes.some(c => c.contains(other));
  }
  cloneNode(deep) {
    const clone = new this.constructor(this.nodeType);
    clone.nodeValue = this.nodeValue;
    if (deep) {
      for (const c of this.childNodes) clone.appendChild(c.cloneNode(true));
    }
    return clone;
  }
}

class Text_ extends Node_ {
  constructor(data) {
    super(3);
    this.nodeValue = String(data);
  }
  get data() { return this.nodeValue; }
  set data(v) { this.nodeValue = v; }
}

class Comment_ extends Node_ {
  constructor(data) {
    super(8);
    this.nodeValue = data || '';
  }
}

class Element_ extends Node_ {
  constructor(tagName) {
    super(1);
    this.tagName = tagName.toUpperCase();
    this.localName = tagName.toLowerCase();
    /** @type {Map<string, string>} */
    this._attrs = new Map();
    this.style = {};
  }
  getAttribute(name) { return this._attrs.get(name) ?? null; }
  setAttribute(name, value) { this._attrs.set(name, String(value)); }
  removeAttribute(name) { this._attrs.delete(name); }
  hasAttribute(name) { return this._attrs.has(name); }
  get className() { return this._attrs.get('class') || ''; }
  set className(v) { this._attrs.set('class', v); }
  get id() { return this._attrs.get('id') || ''; }
  set id(v) { this._attrs.set('id', v); }
  get innerHTML() {
    return this.childNodes.map(c => {
      if (c.nodeType === 3) return c.nodeValue;
      if (c.nodeType === 8) return `<!--${c.nodeValue}-->`;
      if (c.nodeType === 1) return c.outerHTML;
      return '';
    }).join('');
  }
  set innerHTML(v) {
    this.replaceChildren();
    if (v) this.appendChild(new Text_(v));
  }
  get outerHTML() {
    const tag = this.localName;
    let attrs = '';
    for (const [k, v] of this._attrs) attrs += ` ${k}="${v}"`;
    return `<${tag}${attrs}>${this.innerHTML}</${tag}>`;
  }
  append(...nodes) {
    for (const n of nodes) {
      this.appendChild(typeof n === 'string' ? new Text_(n) : n);
    }
  }
  prepend(...nodes) {
    const first = this.firstChild;
    for (const n of nodes) {
      this.insertBefore(typeof n === 'string' ? new Text_(n) : n, first);
    }
  }
  remove() {
    if (this.parentNode) this.parentNode.removeChild(this);
  }
  querySelector(selector) {
    return queryOne(this, selector);
  }
  querySelectorAll(selector) {
    const results = [];
    queryAll(this, selector, results);
    return results;
  }
  get children() {
    return this.childNodes.filter(c => c.nodeType === 1);
  }
  closest(selector) {
    let node = this;
    while (node) {
      if (node.nodeType === 1 && matchesSelector(node, selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
  matches(selector) {
    return matchesSelector(this, selector);
  }
}

function matchesSelector(el, selector) {
  if (selector.startsWith('#')) return el.id === selector.slice(1);
  if (selector.startsWith('.')) return el.className.split(/\s+/).includes(selector.slice(1));
  return el.localName === selector.toLowerCase();
}

function queryOne(el, selector) {
  for (const child of el.childNodes) {
    if (child.nodeType === 1) {
      if (matchesSelector(child, selector)) return child;
      const found = queryOne(child, selector);
      if (found) return found;
    }
  }
  return null;
}

function queryAll(el, selector, results) {
  for (const child of el.childNodes) {
    if (child.nodeType === 1) {
      if (matchesSelector(child, selector)) results.push(child);
      queryAll(child, selector, results);
    }
  }
}

class Document_ extends Node_ {
  constructor() {
    super(9);
    this.body = this.createElement('body');
    this.head = this.createElement('head');
    this.documentElement = this.createElement('html');
    this.documentElement.appendChild(this.head);
    this.documentElement.appendChild(this.body);
    this.appendChild(this.documentElement);
  }
  createElement(tag) { return new Element_(tag); }
  createTextNode(data) { return new Text_(data); }
  createComment(data) { return new Comment_(data); }
  getElementById(id) { return queryOne(this.documentElement, `#${id}`); }
  querySelector(sel) { return queryOne(this.documentElement, sel); }
  querySelectorAll(sel) {
    const results = [];
    queryAll(this.documentElement, sel, results);
    return results;
  }
}

class Event_ {
  constructor(type, opts = {}) {
    this.type = type;
    this.bubbles = opts.bubbles || false;
    this.cancelable = opts.cancelable || false;
    this.target = null;
    this.defaultPrevented = false;
  }
  preventDefault() { this.defaultPrevented = true; }
  stopPropagation() {}
}

/**
 * @returns {{ document: Document_, window: Object, cleanup: Function }}
 */
export function createDOM() {
  const doc = new Document_();
  const win = {
    document: doc,
    Event: Event_,
    location: { hash: '', pathname: '/', search: '', href: 'http://localhost/' },
    history: {
      _stack: [{ state: null, url: '/' }],
      pushState(state, title, url) { this._stack.push({ state, url }); win.location.pathname = url; },
      replaceState(state, title, url) { this._stack[this._stack.length - 1] = { state, url }; win.location.pathname = url; },
      back() { if (this._stack.length > 1) this._stack.pop(); }
    },
    addEventListener: doc.addEventListener.bind(doc),
    removeEventListener: doc.removeEventListener.bind(doc),
    dispatchEvent: doc.dispatchEvent.bind(doc)
  };
  const prevDoc = globalThis.document;
  const prevWin = globalThis.window;
  globalThis.document = doc;
  globalThis.window = win;
  return {
    document: doc,
    window: win,
    cleanup() {
      if (prevDoc) globalThis.document = prevDoc;
      else delete globalThis.document;
      if (prevWin) globalThis.window = prevWin;
      else delete globalThis.window;
    }
  };
}

export { Element_, Text_, Comment_, Document_, Event_ };
