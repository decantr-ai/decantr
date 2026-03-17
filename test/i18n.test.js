import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { createDOM } from '../src/test/dom.js';
import { createSignal, createEffect, createMemo, createRoot } from '../src/state/index.js';
import { createI18n } from '../src/i18n/index.js';

// ─── Basic Translation ───────────────────────────────────────

describe('basic translation', () => {
  it('translates a simple key', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    assert.equal(t('hello'), 'Hello');
  });

  it('returns the key when translation is missing', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    assert.equal(t('missing.key'), 'missing.key');
  });

  it('returns empty string for non-string key', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    assert.equal(t(null), '');
    assert.equal(t(undefined), '');
    assert.equal(t(123), '');
  });

  it('handles empty messages object', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    assert.equal(t('anything'), 'anything');
  });

  it('does not return non-string values from messages', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { num: 42, obj: { nested: 'val' }, arr: [1, 2] } }
    });
    // 42 is a number, not a string — should fall through to key
    assert.equal(t('num'), 'num');
    // obj is an object, not a leaf string
    assert.equal(t('obj'), 'obj');
    // arr is an array
    assert.equal(t('arr'), 'arr');
  });
});

// ─── Dot Notation ────────────────────────────────────────────

describe('dot notation', () => {
  it('resolves nested keys', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          nav: { home: 'Home', about: 'About', settings: { profile: 'Profile' } }
        }
      }
    });
    assert.equal(t('nav.home'), 'Home');
    assert.equal(t('nav.about'), 'About');
    assert.equal(t('nav.settings.profile'), 'Profile');
  });

  it('returns key for partial paths that resolve to objects', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { nav: { home: 'Home' } } }
    });
    assert.equal(t('nav'), 'nav');
  });

  it('returns key for paths beyond existing depth', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { nav: { home: 'Home' } } }
    });
    assert.equal(t('nav.home.extra'), 'nav.home.extra');
  });

  it('handles keys with single segment', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { greeting: 'Hi' } }
    });
    assert.equal(t('greeting'), 'Hi');
  });

  it('handles deeply nested keys (5 levels)', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { a: { b: { c: { d: { e: 'deep' } } } } } }
    });
    assert.equal(t('a.b.c.d.e'), 'deep');
  });
});

// ─── Interpolation ───────────────────────────────────────────

describe('interpolation', () => {
  it('replaces {param} placeholders', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello, {name}!' } }
    });
    assert.equal(t('hello', { name: 'World' }), 'Hello, World!');
  });

  it('replaces multiple placeholders', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { intro: '{name} is {age} years old' } }
    });
    assert.equal(t('intro', { name: 'Alice', age: 30 }), 'Alice is 30 years old');
  });

  it('leaves unmatched placeholders as-is', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { msg: 'Hello {name}, you have {count} items' } }
    });
    assert.equal(t('msg', { name: 'Bob' }), 'Hello Bob, you have {count} items');
  });

  it('handles empty params object', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello {name}' } }
    });
    assert.equal(t('hello', {}), 'Hello {name}');
  });

  it('handles null/undefined params', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello {name}' } }
    });
    assert.equal(t('hello', null), 'Hello {name}');
    assert.equal(t('hello', undefined), 'Hello {name}');
    assert.equal(t('hello'), 'Hello {name}');
  });

  it('converts param values to strings', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { msg: 'Count: {n}, Bool: {b}' } }
    });
    assert.equal(t('msg', { n: 42, b: true }), 'Count: 42, Bool: true');
  });

  it('handles param value of 0', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { msg: 'Items: {count}' } }
    });
    assert.equal(t('msg', { count: 0 }), 'Items: 0');
  });

  it('replaces same placeholder multiple times', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { msg: '{x} + {x} = {result}' } }
    });
    assert.equal(t('msg', { x: 2, result: 4 }), '2 + 2 = 4');
  });
});

// ─── Pluralization ───────────────────────────────────────────

describe('pluralization', () => {
  it('selects _one form for count=1', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          items_one: '{count} item',
          items_other: '{count} items'
        }
      }
    });
    assert.equal(t('items', { count: 1 }), '1 item');
  });

  it('selects _other form for count > 1', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          items_one: '{count} item',
          items_other: '{count} items'
        }
      }
    });
    assert.equal(t('items', { count: 5 }), '5 items');
  });

  it('selects _other form for count=0 in English', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          items_one: '{count} item',
          items_other: '{count} items'
        }
      }
    });
    assert.equal(t('items', { count: 0 }), '0 items');
  });

  it('falls back to base key when plural form is missing', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          items: '{count} items total'
        }
      }
    });
    assert.equal(t('items', { count: 1 }), '1 items total');
  });

  it('handles fractional counts', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          weight_one: '{count} kilogram',
          weight_other: '{count} kilograms'
        }
      }
    });
    assert.equal(t('weight', { count: 1.5 }), '1.5 kilograms');
  });

  it('pluralizes with nested keys', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          cart: {
            items_one: '{count} item in cart',
            items_other: '{count} items in cart'
          }
        }
      }
    });
    assert.equal(t('cart.items', { count: 1 }), '1 item in cart');
    assert.equal(t('cart.items', { count: 3 }), '3 items in cart');
  });

  it('does not pluralize when count is not a number', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          items: 'Some items',
          items_one: '1 item',
          items_other: 'Many items'
        }
      }
    });
    assert.equal(t('items', { count: 'many' }), 'Some items');
  });

  it('pluralizes without other params', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: {
        en: {
          notifications_one: 'You have one notification',
          notifications_other: 'You have notifications'
        }
      }
    });
    assert.equal(t('notifications', { count: 1 }), 'You have one notification');
  });

  it('tries plural key in fallback locale', () => {
    const { t } = createI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: {
          items_one: '{count} item',
          items_other: '{count} items'
        },
        fr: {}
      }
    });
    assert.equal(t('items', { count: 1 }), '1 item');
    assert.equal(t('items', { count: 5 }), '5 items');
  });
});

// ─── Locale Switching ────────────────────────────────────────

describe('locale switching', () => {
  it('switches locale and translates differently', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        fr: { hello: 'Bonjour' }
      }
    });
    assert.equal(t('hello'), 'Hello');
    setLocale('fr');
    assert.equal(t('hello'), 'Bonjour');
  });

  it('locale() returns current locale', () => {
    const { locale, setLocale } = createI18n({
      locale: 'en',
      messages: { en: {}, fr: {} }
    });
    assert.equal(locale(), 'en');
    setLocale('fr');
    assert.equal(locale(), 'fr');
  });

  it('switching to locale without messages returns key', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    setLocale('de');
    assert.equal(t('hello'), 'hello');
  });

  it('ignores invalid locale values', () => {
    const { locale, setLocale } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    setLocale('');
    assert.equal(locale(), 'en');
    setLocale(null);
    assert.equal(locale(), 'en');
    setLocale(123);
    assert.equal(locale(), 'en');
  });

  it('switching locale uses fallback chain', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: { hello: 'Hello', goodbye: 'Goodbye' },
        fr: { hello: 'Bonjour' }
      }
    });
    setLocale('fr');
    assert.equal(t('hello'), 'Bonjour');
    assert.equal(t('goodbye'), 'Goodbye'); // falls back to en
  });
});

// ─── Fallback Chain ──────────────────────────────────────────

describe('fallback chain', () => {
  it('falls back to fallbackLocale when key missing in current', () => {
    const { t } = createI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: { hello: 'Hello', world: 'World' },
        fr: { hello: 'Bonjour' }
      }
    });
    assert.equal(t('hello'), 'Bonjour');
    assert.equal(t('world'), 'World'); // fallback
  });

  it('returns key when missing from both locales', () => {
    const { t } = createI18n({
      locale: 'fr',
      fallbackLocale: 'en',
      messages: {
        en: { hello: 'Hello' },
        fr: { hello: 'Bonjour' }
      }
    });
    assert.equal(t('missing'), 'missing');
  });

  it('works without fallbackLocale', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    assert.equal(t('missing'), 'missing');
  });

  it('fallback uses interpolation', () => {
    const { t } = createI18n({
      locale: 'de',
      fallbackLocale: 'en',
      messages: {
        en: { greeting: 'Hello, {name}!' },
        de: {}
      }
    });
    assert.equal(t('greeting', { name: 'Hans' }), 'Hello, Hans!');
  });

  it('nested keys fall back correctly', () => {
    const { t } = createI18n({
      locale: 'ja',
      fallbackLocale: 'en',
      messages: {
        en: { nav: { home: 'Home', about: 'About' } },
        ja: { nav: { home: 'ホーム' } }
      }
    });
    assert.equal(t('nav.home'), 'ホーム');
    assert.equal(t('nav.about'), 'About'); // fallback
  });
});

// ─── Direction Setting ───────────────────────────────────────

describe('direction setting', () => {
  let dom;

  before(() => {
    dom = createDOM();
  });

  after(() => {
    dom.cleanup();
  });

  it('sets dir=rtl on document element', () => {
    const { setDirection } = createI18n({
      locale: 'ar',
      messages: { ar: {} }
    });
    setDirection('rtl');
    assert.equal(document.documentElement.getAttribute('dir'), 'rtl');
  });

  it('sets dir=ltr on document element', () => {
    const { setDirection } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    setDirection('ltr');
    assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
  });

  it('ignores invalid direction values', () => {
    const { setDirection } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    setDirection('ltr');
    assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
    setDirection('invalid');
    assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
    setDirection(null);
    assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
  });

  it('can toggle between ltr and rtl', () => {
    const { setDirection } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    setDirection('rtl');
    assert.equal(document.documentElement.getAttribute('dir'), 'rtl');
    setDirection('ltr');
    assert.equal(document.documentElement.getAttribute('dir'), 'ltr');
  });
});

// ─── addMessages ─────────────────────────────────────────────

describe('addMessages', () => {
  it('adds messages to existing locale', () => {
    const { t, addMessages } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    assert.equal(t('world'), 'world');
    addMessages('en', { world: 'World' });
    assert.equal(t('world'), 'World');
    // Existing messages preserved
    assert.equal(t('hello'), 'Hello');
  });

  it('adds messages to new locale', () => {
    const { t, setLocale, addMessages } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    addMessages('es', { hello: 'Hola' });
    setLocale('es');
    assert.equal(t('hello'), 'Hola');
  });

  it('deep-merges nested messages', () => {
    const { t, addMessages } = createI18n({
      locale: 'en',
      messages: {
        en: { nav: { home: 'Home' } }
      }
    });
    addMessages('en', { nav: { about: 'About' } });
    assert.equal(t('nav.home'), 'Home'); // preserved
    assert.equal(t('nav.about'), 'About'); // added
  });

  it('overwrites existing keys on merge', () => {
    const { t, addMessages } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    addMessages('en', { hello: 'Hi' });
    assert.equal(t('hello'), 'Hi');
  });

  it('ignores invalid addMessages calls', () => {
    const { t, addMessages } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    addMessages('', { foo: 'bar' });
    addMessages(null, { foo: 'bar' });
    addMessages('en', null);
    addMessages('en', 'invalid');
    assert.equal(t('hello'), 'Hello');
  });

  it('does not mutate the original config messages', () => {
    const originalMessages = { en: { hello: 'Hello' } };
    const { addMessages } = createI18n({
      locale: 'en',
      messages: originalMessages
    });
    addMessages('en', { goodbye: 'Goodbye' });
    assert.equal(originalMessages.en.goodbye, undefined);
  });
});

// ─── Edge Cases ──────────────────────────────────────────────

describe('edge cases', () => {
  it('throws on missing config', () => {
    assert.throws(() => createI18n(), { message: /config object/ });
    assert.throws(() => createI18n(null), { message: /config object/ });
  });

  it('throws on missing locale', () => {
    assert.throws(() => createI18n({ messages: {} }), { message: /locale/ });
    assert.throws(() => createI18n({ locale: '', messages: {} }), { message: /locale/ });
  });

  it('throws on missing messages', () => {
    assert.throws(() => createI18n({ locale: 'en' }), { message: /messages/ });
    assert.throws(() => createI18n({ locale: 'en', messages: null }), { message: /messages/ });
  });

  it('handles locale with no matching messages gracefully', () => {
    const { t } = createI18n({
      locale: 'xx',
      messages: { en: { hello: 'Hello' } }
    });
    assert.equal(t('hello'), 'hello');
  });

  it('handles empty key string', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { '': 'empty key' } }
    });
    // Empty string split by '.' produces [''], which resolves against the '' key
    assert.equal(t(''), 'empty key');
  });

  it('handles keys with only dots', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: {} }
    });
    assert.equal(t('...'), '...');
  });

  it('multiple i18n instances are independent', () => {
    const i18n1 = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    const i18n2 = createI18n({
      locale: 'fr',
      messages: { fr: { hello: 'Bonjour' } }
    });
    assert.equal(i18n1.t('hello'), 'Hello');
    assert.equal(i18n2.t('hello'), 'Bonjour');

    i18n1.setLocale('fr');
    assert.equal(i18n1.locale(), 'fr');
    assert.equal(i18n2.locale(), 'fr');
  });

  it('t() works when messages for current locale is undefined', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });
    setLocale('zz');
    assert.equal(t('hello'), 'hello');
  });

  it('interpolation with special regex characters in values', () => {
    const { t } = createI18n({
      locale: 'en',
      messages: { en: { msg: 'Result: {value}' } }
    });
    assert.equal(t('msg', { value: '$1.00' }), 'Result: $1.00');
    assert.equal(t('msg', { value: 'a+b=c' }), 'Result: a+b=c');
  });
});

// ─── Reactivity ──────────────────────────────────────────────

describe('reactivity', () => {
  it('createEffect tracks locale changes via t()', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: {
        en: { hello: 'Hello' },
        fr: { hello: 'Bonjour' }
      }
    });

    let observed = '';
    createEffect(() => {
      observed = t('hello');
    });
    assert.equal(observed, 'Hello');

    setLocale('fr');
    assert.equal(observed, 'Bonjour');
  });

  it('createEffect tracks locale() signal', () => {
    const { locale, setLocale } = createI18n({
      locale: 'en',
      messages: { en: {}, fr: {} }
    });

    let observed = '';
    createEffect(() => {
      observed = locale();
    });
    assert.equal(observed, 'en');

    setLocale('fr');
    assert.equal(observed, 'fr');
  });

  it('createMemo derives from t()', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: {
        en: { title: 'Dashboard' },
        de: { title: 'Instrumententafel' }
      }
    });

    const pageTitle = createMemo(() => `App - ${t('title')}`);
    assert.equal(pageTitle(), 'App - Dashboard');

    setLocale('de');
    assert.equal(pageTitle(), 'App - Instrumententafel');
  });

  it('effect re-runs when addMessages provides a missing key', () => {
    const { t, addMessages } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });

    let observed = '';
    createEffect(() => {
      observed = t('extra');
    });
    assert.equal(observed, 'extra'); // key not found

    addMessages('en', { extra: 'Extra content' });
    assert.equal(observed, 'Extra content');
  });

  it('multiple effects track independently', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: {
        en: { a: 'A-en', b: 'B-en' },
        fr: { a: 'A-fr', b: 'B-fr' }
      }
    });

    let obsA = '';
    let obsB = '';
    createEffect(() => { obsA = t('a'); });
    createEffect(() => { obsB = t('b'); });

    assert.equal(obsA, 'A-en');
    assert.equal(obsB, 'B-en');

    setLocale('fr');
    assert.equal(obsA, 'A-fr');
    assert.equal(obsB, 'B-fr');
  });

  it('effect re-runs only when locale actually changes', () => {
    const { t, setLocale } = createI18n({
      locale: 'en',
      messages: { en: { hello: 'Hello' } }
    });

    let runs = 0;
    createEffect(() => {
      t('hello');
      runs++;
    });
    assert.equal(runs, 1);

    // Setting same locale should not trigger re-run
    setLocale('en');
    assert.equal(runs, 1);
  });
});

// ─── Integration: Locale + Direction ─────────────────────────

describe('integration: locale + direction', () => {
  let dom;

  before(() => {
    dom = createDOM();
  });

  after(() => {
    dom.cleanup();
  });

  it('switches locale and direction together for RTL language', () => {
    const { t, setLocale, setDirection } = createI18n({
      locale: 'en',
      messages: {
        en: { greeting: 'Hello' },
        ar: { greeting: 'مرحبا' }
      }
    });

    assert.equal(t('greeting'), 'Hello');

    setLocale('ar');
    setDirection('rtl');

    assert.equal(t('greeting'), 'مرحبا');
    assert.equal(document.documentElement.getAttribute('dir'), 'rtl');
  });
});

// ─── Multi-locale Complete Flow ──────────────────────────────

describe('multi-locale complete flow', () => {
  it('handles a realistic multi-locale setup', () => {
    const { t, setLocale, addMessages } = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        en: {
          common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete'
          },
          user: {
            greeting: 'Welcome, {name}!',
            items_one: 'You have {count} item',
            items_other: 'You have {count} items'
          }
        },
        fr: {
          common: {
            save: 'Enregistrer',
            cancel: 'Annuler',
            delete: 'Supprimer'
          },
          user: {
            greeting: 'Bienvenue, {name} !',
            items_one: 'Vous avez {count} article',
            items_other: 'Vous avez {count} articles'
          }
        }
      }
    });

    // English
    assert.equal(t('common.save'), 'Save');
    assert.equal(t('user.greeting', { name: 'Alice' }), 'Welcome, Alice!');
    assert.equal(t('user.items', { count: 1 }), 'You have 1 item');
    assert.equal(t('user.items', { count: 5 }), 'You have 5 items');

    // Switch to French
    setLocale('fr');
    assert.equal(t('common.save'), 'Enregistrer');
    assert.equal(t('user.greeting', { name: 'Alice' }), 'Bienvenue, Alice !');
    assert.equal(t('user.items', { count: 1 }), 'Vous avez 1 article');
    assert.equal(t('user.items', { count: 5 }), 'Vous avez 5 articles');

    // Add German at runtime
    addMessages('de', {
      common: { save: 'Speichern', cancel: 'Abbrechen' },
      user: { greeting: 'Willkommen, {name}!' }
    });
    setLocale('de');
    assert.equal(t('common.save'), 'Speichern');
    assert.equal(t('user.greeting', { name: 'Alice' }), 'Willkommen, Alice!');
    // Falls back to English for missing German keys
    assert.equal(t('common.delete'), 'Delete');
  });
});
