/**
 * Decantr Form State Management
 * Enterprise-grade reactive form handling built on Decantr signals.
 *
 * @module decantr/form
 *
 * Exports:
 *   createForm(config)        — Create a reactive form instance
 *   validators                — Built-in validator factories
 *   useFormField(form, name)  — Hook for binding custom components
 */
import { createSignal, createEffect, createMemo, batch } from '../state/index.js';

// ─── Public Interfaces ───────────────────────────────────────────

export type ValidatorFn = (value: any, allValues?: Record<string, any>) => string | null;
export type AsyncValidatorFn = (value: any, allValues?: Record<string, any>) => Promise<string | null>;

export interface FieldConfig {
  value?: any;
  validators?: Array<ValidatorFn | AsyncValidatorFn>;
  transform?: (rawValue: any) => any;
}

export interface FieldInstance {
  name: string;
  value: () => any;
  error: () => string | null;
  errors: () => string[];
  touched: () => boolean;
  dirty: () => boolean;
  valid: () => boolean;
  setValue: (v: any) => void;
  setTouched: () => void;
  setError: (msg: string) => void;
  reset: (val?: any) => void;
  validate: () => Promise<boolean>;
  bind: () => { value: () => any; onchange: (v: any) => void; onblur: () => void; error: () => string | null };
}

export interface FieldArrayInstance {
  items: () => any[];
  length: () => number;
  append: (value: any) => void;
  prepend: (value: any) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (a: number, b: number) => void;
  replace: (index: number, value: any) => void;
}

export interface FormConfig {
  fields?: Record<string, FieldConfig>;
  onSubmit?: (values: Record<string, any>, form: FormInstance) => Promise<void>;
  validate?: (values: Record<string, any>) => Record<string, string[]> | null;
  validateOn?: 'onChange' | 'onBlur' | 'onSubmit';
}

export interface FormInstance {
  field: (name: string) => FieldInstance;
  fields: Record<string, FieldInstance>;
  values: () => Record<string, any>;
  errors: () => Record<string, string[]>;
  isValid: () => boolean;
  isDirty: () => boolean;
  isSubmitting: () => boolean;
  isSubmitted: () => boolean;
  submitCount: () => number;
  submit: () => Promise<void>;
  reset: (values?: Record<string, any>) => void;
  setValues: (partial: Record<string, any>) => void;
  setErrors: (errors: Record<string, string | string[]>) => void;
  validate: () => Promise<boolean>;
  fieldArray: (name: string) => FieldArrayInstance;
  watch: (fieldName: string, callback: (value: any, prevValue: any) => void) => () => void;
  watchAll: (callback: (values: Record<string, any>) => void) => () => void;
}

// ─── HELPERS ─────────────────────────────────────────────────────

/** @param {any} v @returns {boolean} */
function _empty(v: any) {
  if (v == null) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'number') return false;
  if (typeof v === 'boolean') return false;
  return false;
}

/** Shallow-clone plain object or return value as-is */
function _clone(v: any) {
  if (v && typeof v === 'object' && !Array.isArray(v)) return { ...v };
  if (Array.isArray(v)) return [...v];
  return v;
}

/** Simple deep-equal for plain values/objects/arrays */
function _eq(a: any, b: any) {
  if (Object.is(a, b)) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) { if (!_eq(a[i], b[i])) return false; }
    return true;
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (const k of ka) { if (!_eq(a[k], b[k])) return false; }
    return true;
  }
  return false;
}

/** Debounce a function by `ms` milliseconds. Returns wrapped fn + cancel. */
function _debounce(fn: any, ms: any) {
  let id: any = null;
  function debounced(...args: any[]) {
    if (id !== null) clearTimeout(id);
    id = setTimeout(() => { id = null; fn(...args); }, ms);
  }
  debounced.cancel = () => { if (id !== null) { clearTimeout(id); id = null; } };
  return debounced;
}

// ─── VALIDATORS ──────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Built-in validator factories. Each returns a validator function:
 * `(value, allValues) => string|null` (sync) or `Promise<string|null>` (async).
 *
 * @namespace
 */
export const validators = {
  /**
   * Value must be truthy (non-empty string, non-null, non-undefined).
   * @param {string} [msg='Required']
   * @returns {(value: any) => string|null}
   */
  required(msg: any) {
    const m = msg || 'Required';
    return (v: any) => _empty(v) ? m : null;
  },

  /**
   * String length must be >= n.
   * @param {number} n
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  minLength(n: any, msg: any) {
    const m = msg || `Must be at least ${n} characters`;
    return (v: any) => (typeof v === 'string' && v.length < n) ? m : null;
  },

  /**
   * String length must be <= n.
   * @param {number} n
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  maxLength(n: any, msg: any) {
    const m = msg || `Must be at most ${n} characters`;
    return (v: any) => (typeof v === 'string' && v.length > n) ? m : null;
  },

  /**
   * Numeric value must be >= n.
   * @param {number} n
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  min(n: any, msg: any) {
    const m = msg || `Must be at least ${n}`;
    return (v: any) => (typeof v === 'number' && v < n) ? m : null;
  },

  /**
   * Numeric value must be <= n.
   * @param {number} n
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  max(n: any, msg: any) {
    const m = msg || `Must be at most ${n}`;
    return (v: any) => (typeof v === 'number' && v > n) ? m : null;
  },

  /**
   * Value must match regex pattern.
   * @param {RegExp} regex
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  pattern(regex: any, msg: any) {
    const m = msg || `Invalid format`;
    return (v: any) => (typeof v === 'string' && !regex.test(v)) ? m : null;
  },

  /**
   * Must be a valid email address.
   * @param {string} [msg]
   * @returns {(value: any) => string|null}
   */
  email(msg: any) {
    const m = msg || 'Invalid email address';
    return (v: any) => (typeof v === 'string' && v.length > 0 && !EMAIL_RE.test(v)) ? m : null;
  },

  /**
   * Value must equal another field's current value.
   * @param {string} fieldName — name of the field to match
   * @param {string} [msg]
   * @returns {(value: any, allValues: Object) => string|null}
   */
  match(fieldName: any, msg: any) {
    const m = msg || `Must match ${fieldName}`;
    return (v: any, all: any) => (!_eq(v, all[fieldName])) ? m : null;
  },

  /**
   * Custom synchronous validator.
   * `fn` should return `true` if valid or an error string if invalid.
   * @param {(value: any, allValues: Object) => true|string} fn
   * @param {string} [msg] — fallback message if fn returns non-string falsy
   * @returns {(value: any, allValues: Object) => string|null}
   */
  custom(fn: any, msg: any) {
    return (v: any, all: any) => {
      const result = fn(v, all);
      if (result === true) return null;
      if (typeof result === 'string') return result;
      return msg || 'Invalid';
    };
  },

  /**
   * Async validator. `fn` should return a Promise resolving to `true` or error string.
   * Automatically debounced (300ms) when used in a form.
   * @param {(value: any, allValues: Object) => Promise<true|string>} fn
   * @param {string} [msg]
   * @returns {(value: any, allValues: Object) => Promise<string|null>}
   */
  async(fn: any, msg: any) {
    const validator = async (v: any, all: any) => {
      const result = await fn(v, all);
      if (result === true) return null;
      if (typeof result === 'string') return result;
      return msg || 'Invalid';
    };
    // @ts-expect-error -- strict-mode fix (auto)
    /** @type {any} */ (validator)._async = true;
    return validator;
  },
};

// ─── FIELD INSTANCE ──────────────────────────────────────────────

/**
 * @typedef {Object} FieldConfig
 * @property {any} [value] — initial value
 * @property {Array<Function>} [validators] — array of validator functions
 * @property {Function} [transform] — (rawValue) => transformedValue, applied on setValue
 */

/**
 * Creates a single reactive field instance.
 * @param {string} name
 * @param {FieldConfig} config
 * @param {Function} getFormValues — () => all form values (for cross-field validators)
 * @param {'onChange'|'onBlur'|'onSubmit'} validateOn
 * @returns {FieldInstance}
 */
function _createField(name: any, config: any, getFormValues: any, validateOn: any) {
  const initial = config.value !== undefined ? config.value : '';
  const fieldValidators = config.validators || [];
  const transform = config.transform || null;

  const [value, _setValue] = createSignal(_clone(initial));
  const [errors, setErrors] = createSignal(/** @type {string[]} */ ([]));
  const [touched, setTouched] = createSignal(false);

  /** @type {Function|null} */
  let _asyncDebounced: any = null;

  // Separate sync and async validators
  const syncValidators = fieldValidators.filter((v: any) => !/** @type {any} */ (v)._async);
  const asyncValidators = fieldValidators.filter((v: any) => /** @type {any} */ (v)._async);

  /** Run sync validators, return error strings */
  function _runSync(val: any, allValues: any) {
    /** @type {string[]} */
    const errs = [];
    for (let i = 0; i < syncValidators.length; i++) {
      const msg = syncValidators[i](val, allValues);
      if (msg) errs.push(msg);
    }
    return errs;
  }

  /** Run all validators (sync + async), return error strings */
  async function _runAll(val: any, allValues: any) {
    const errs = _runSync(val, allValues);
    // Only run async validators if sync passes (short-circuit)
    if (errs.length === 0 && asyncValidators.length > 0) {
      const results = await Promise.all(asyncValidators.map((v: any) => v(val, allValues)));
      for (const msg of results) {
        if (msg) errs.push(msg);
      }
    }
    return errs;
  }

  /** Trigger validation based on mode; called internally */
  function _triggerValidation(mode: any) {
    if (validateOn === 'onSubmit' && mode !== 'submit') return;
    if (validateOn === 'onBlur' && mode === 'change') return;

    const val = value();
    const allValues = getFormValues();

    // Sync validators run immediately
    const syncErrs = _runSync(val, allValues);

    if (asyncValidators.length > 0 && syncErrs.length === 0) {
      // Debounce async validators
      if (!_asyncDebounced) {
        _asyncDebounced = _debounce(async () => {
          const allErrs = await _runAll(value(), getFormValues());
          // @ts-expect-error -- strict-mode fix (auto)
          setErrors(allErrs);
        }, 300);
      }
      // Set sync errors first (empty), then kick off async
      // @ts-expect-error -- strict-mode fix (auto)
      setErrors(syncErrs);
      _asyncDebounced();
    } else {
      // Cancel any pending async validation
      if (_asyncDebounced) _asyncDebounced.cancel();
      // @ts-expect-error -- strict-mode fix (auto)
      setErrors(syncErrs);
    }
  }

  function setValue(v: any) {
    const raw = typeof v === 'function' ? v(value()) : v;
    const transformed = transform ? transform(raw) : raw;
    _setValue(transformed);
    _triggerValidation('change');
  }

  function setTouchedFn() {
    if (!touched()) setTouched(true);
    _triggerValidation('blur');
  }

  function setError(msg: any) {
    // @ts-expect-error -- strict-mode fix (auto)
    setErrors(msg ? [msg] : []);
  }

  function reset(val: any) {
    const resetVal = val !== undefined ? val : _clone(initial);
    batch(() => {
      _setValue(resetVal);
      setErrors([]);
      setTouched(false);
    });
    if (_asyncDebounced) _asyncDebounced.cancel();
  }

  /** Validate field imperatively. Returns true if valid. */
  async function validate() {
    const allErrs = await _runAll(value(), getFormValues());
    // @ts-expect-error -- strict-mode fix (auto)
    setErrors(allErrs);
    return allErrs.length === 0;
  }

  // Derived signals
  const error = createMemo(() => { const e = errors(); return e.length > 0 ? e[0] : null; });
  const valid = createMemo(() => errors().length === 0);
  const dirty = createMemo(() => !_eq(value(), initial));

  /** @type {FieldInstance} */
  const field = {
    name,
    value,
    error,
    errors,
    touched,
    dirty,
    valid,
    setValue,
    setTouched: setTouchedFn,
    setError,
    reset,
    validate,
    /**
     * Returns a props object for binding to Decantr form components.
     * Compatible with Input, Select, Textarea, Checkbox, Switch, etc.
     * @returns {{ value: Function, onchange: Function, onblur: Function, error: Function }}
     */
    bind() {
      return {
        value,
        onchange: (v: any) => setValue(typeof v === 'object' && v !== null && v.target ? v.target.value : v),
        onblur: () => setTouchedFn(),
        error,
      };
    },
  };

  return field;
}

// ─── FIELD ARRAY ─────────────────────────────────────────────────

/**
 * Creates a reactive field array for repeatable form sections.
 * Each item in the array is a plain value (or object). The array itself
 * is stored as a signal so consumers can react to structural changes.
 *
 * @param {string} name
 * @param {any[]} initial
 * @returns {FieldArrayInstance}
 */
function _createFieldArray(name: any, initial: any) {
  const [items, setItems] = createSignal(initial ? [...initial] : []);

  return {
    /** Signal getter for the array of items. */
    items,

    /** @returns {number} Current array length. */
    length: createMemo(() => items().length),

    /** Append a value to the end. @param {any} value */
    append(value: any) { setItems(prev => [...prev, _clone(value)]); },

    /** Prepend a value to the beginning. @param {any} value */
    prepend(value: any) { setItems(prev => [_clone(value), ...prev]); },

    /** Remove item at index. @param {number} index */
    remove(index: any) {
      setItems(prev => {
        const next = [...prev];
        next.splice(index, 1);
        return next;
      });
    },

    /** Move item from one index to another. @param {number} from @param {number} to */
    move(from: any, to: any) {
      setItems(prev => {
        const next = [...prev];
        const [item] = next.splice(from, 1);
        next.splice(to, 0, item);
        return next;
      });
    },

    /** Swap two items by index. @param {number} a @param {number} b */
    swap(a: any, b: any) {
      setItems(prev => {
        const next = [...prev];
        const tmp = next[a];
        next[a] = next[b];
        next[b] = tmp;
        return next;
      });
    },

    /** Replace item at index with a new value. @param {number} index @param {any} value */
    replace(index: any, value: any) {
      setItems(prev => {
        const next = [...prev];
        next[index] = _clone(value);
        return next;
      });
    },
  };
}

// ─── CREATE FORM ─────────────────────────────────────────────────

/**
 * Create a reactive form instance.
 *
 * @param {Object} config
 * @param {Object} config.fields — `{ fieldName: { value?, validators?, transform? } }`
 * @param {Function} [config.onSubmit] — `async (values, form) => void`
 * @param {Function} [config.validate] — `(values) => errors` — cross-field validation returning `{ fieldName: string[] }`
 * @param {'onChange'|'onBlur'|'onSubmit'} [config.validateOn='onBlur']
 * @returns {FormInstance}
 *
 * @example
 * const form = createForm({
 *   fields: {
 *     email: { value: '', validators: [validators.required(), validators.email()] },
 *     password: { value: '', validators: [validators.required(), validators.minLength(8)] },
 *   },
 *   validateOn: 'onBlur',
 *   async onSubmit(values) { await api.login(values); },
 * });
 *
 * // Bind to Decantr components
 * Input({ type: 'email', ...form.field('email').bind() })
 * Input({ type: 'password', ...form.field('password').bind() })
 * Button({ onclick: () => form.submit() }, 'Login')
 */
export function createForm(config: FormConfig): FormInstance {
  const { fields: fieldConfigs = {}, onSubmit, validate: crossValidate, validateOn = 'onBlur' } = config;

  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [isSubmitted, setIsSubmitted] = createSignal(false);
  const [submitCount, setSubmitCount] = createSignal(0);

  /** @type {Map<string, FieldInstance>} */
  const _fields = new Map();

  /** @type {Map<string, FieldArrayInstance>} */
  const _fieldArrays = new Map();

  /** @type {Array<{name: string|null, cb: Function, dispose: Function|null}>} */
  const _watchers: any[] = [];

  // ── Values getter (reads all field signals) ──

  function getValues() {
    /** @type {Record<string, any>} */
    const vals = {};
    for (const [name, f] of _fields) {
      // @ts-expect-error -- strict-mode fix (auto)
      vals[name] = f.value();
    }
    // Include field array values
    for (const [name, fa] of _fieldArrays) {
      // @ts-expect-error -- strict-mode fix (auto)
      vals[name] = fa.items();
    }
    return vals;
  }

  // ── Field creation / access ──

  /**
   * Get or create a FieldInstance by name.
   * @param {string} name
   * @returns {FieldInstance}
   */
  function field(name: any) {
    let f = _fields.get(name);
    if (!f) {
      const cfg = fieldConfigs[name] || {};
      f = _createField(name, cfg, getValues, validateOn);
      _fields.set(name, f);
    }
    return f;
  }

  // Initialize all configured fields eagerly
  for (const name of Object.keys(fieldConfigs)) {
    field(name);
  }

  // ── Fields proxy ──
  // Allows `form.fields.email.value()` syntax

  const fields = new Proxy(/** @type {any} */ ({}), {
    get(_, prop) {
      if (typeof prop === 'string') return field(prop);
      return undefined;
    },
  });

  // ── Derived form-level signals ──

  const errors = createMemo(() => {
    /** @type {Record<string, string[]>} */
    const errs = {};
    for (const [name, f] of _fields) {
      const fieldErrs = f.errors();
      // @ts-expect-error -- strict-mode fix (auto)
      if (fieldErrs.length > 0) errs[name] = fieldErrs;
    }
    return errs;
  });

  const isValid = createMemo(() => {
    for (const [, f] of _fields) {
      if (!f.valid()) return false;
    }
    return true;
  });

  const isDirty = createMemo(() => {
    for (const [, f] of _fields) {
      if (f.dirty()) return true;
    }
    return false;
  });

  const values = createMemo(() => getValues());

  // ── Actions ──

  /**
   * Run all field validators + cross-field validation.
   * @returns {Promise<boolean>} true if form is valid
   */
  async function validate() {
    const results = await Promise.all(
      [..._fields.values()].map(f => f.validate())
    );
    const allValid = results.every(Boolean);

    // Cross-field validation
    if (crossValidate) {
      const crossErrors = crossValidate(getValues());
      if (crossErrors && typeof crossErrors === 'object') {
        for (const [name, errs] of Object.entries(crossErrors)) {
          const f = _fields.get(name);
          if (f) {
            const fieldErrs = Array.isArray(errs) ? errs : [errs];
            if (fieldErrs.length > 0) {
              // Merge with existing errors
              f.setError(fieldErrs[0]);
              return false;
            }
          }
        }
      }
    }

    return allValid;
  }

  /**
   * Submit the form. Runs all validators, sets isSubmitting, calls onSubmit if valid.
   * @returns {Promise<void>}
   */
  async function submit() {
    setSubmitCount(c => c + 1);

    // Touch all fields on submit
    batch(() => {
      for (const [, f] of _fields) f.setTouched();
    });

    const valid = await validate();
    if (!valid) return;

    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(getValues(), form);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  /**
   * Reset all fields. Optionally provide new initial values.
   * @param {Object} [newValues] — partial or full values to reset to
   */
  function reset(newValues: any) {
    batch(() => {
      for (const [name, f] of _fields) {
        f.reset(newValues ? newValues[name] : undefined);
      }
      setIsSubmitted(false);
      setSubmitCount(0);
    });
  }

  /**
   * Set multiple field values at once.
   * @param {Object} partial — `{ fieldName: value }`
   */
  function setValues(partial: any) {
    batch(() => {
      for (const [name, val] of Object.entries(partial)) {
        field(name).setValue(val);
      }
    });
  }

  /**
   * Set errors on multiple fields at once.
   * @param {Object} errs — `{ fieldName: string|string[] }`
   */
  function setErrors(errs: any) {
    batch(() => {
      for (const [name, msg] of Object.entries(errs)) {
        const f = _fields.get(name);
        if (f) f.setError(Array.isArray(msg) ? msg[0] : msg);
      }
    });
  }

  /**
   * Get or create a FieldArrayInstance by name.
   * @param {string} name
   * @returns {FieldArrayInstance}
   */
  function fieldArray(name: any) {
    let fa = _fieldArrays.get(name);
    if (!fa) {
      const cfg = fieldConfigs[name];
      const initial = cfg && Array.isArray(cfg.value) ? cfg.value : [];
      fa = _createFieldArray(name, initial);
      _fieldArrays.set(name, fa);
    }
    return fa;
  }

  /**
   * Watch a specific field for value changes.
   * @param {string} fieldName
   * @param {(value: any, prevValue: any) => void} callback
   * @returns {Function} unsubscribe
   */
  function watch(fieldName: any, callback: any) {
    const f = field(fieldName);
    let prev = f.value();
    const dispose = createEffect(() => {
      const next = f.value();
      if (!_eq(next, prev)) {
        const old = prev;
        prev = next;
        callback(next, old);
      }
    });
    const entry = { name: fieldName, cb: callback, dispose };
    _watchers.push(entry);
    return () => {
      const idx = _watchers.indexOf(entry);
      if (idx >= 0) _watchers.splice(idx, 1);
      if (dispose) dispose();
    };
  }

  /**
   * Watch all fields for any value change.
   * @param {(values: Object) => void} callback
   * @returns {Function} unsubscribe
   */
  function watchAll(callback: any) {
    const dispose = createEffect(() => {
      const v = values();
      callback(v);
    });
    const entry = { name: null, cb: callback, dispose };
    _watchers.push(entry);
    return () => {
      const idx = _watchers.indexOf(entry);
      if (idx >= 0) _watchers.splice(idx, 1);
      if (dispose) dispose();
    };
  }

  /** @type {FormInstance} */
  const form = {
    field,
    fields,
    values,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    isSubmitted,
    submitCount,
    submit,
    reset,
    setValues,
    setErrors,
    validate,
    fieldArray,
    watch,
    watchAll,
  };

  return form;
}

// ─── USE FORM FIELD ──────────────────────────────────────────────

/**
 * Hook for binding a form field to a custom component.
 * Returns reactive getters and handlers for value, error, touched, and blur.
 *
 * @param {FormInstance} form
 * @param {string} fieldName
 * @returns {{ value: Function, setValue: Function, error: Function, touched: Function, onBlur: Function }}
 *
 * @example
 * function MyCustomInput(form, name) {
 *   const { value, setValue, error, onBlur } = useFormField(form, name);
 *   const input = h('input', { value: value(), onblur: onBlur });
 *   createEffect(() => { input.value = value(); });
 *   input.addEventListener('input', (e) => setValue(e.target.value));
 *   return input;
 * }
 */
export function useFormField(form: FormInstance, fieldName: string): { value: () => any; setValue: (v: any) => void; error: () => string | null; errors: () => string[]; touched: () => boolean; dirty: () => boolean; valid: () => boolean; onBlur: () => void; bind: FieldInstance['bind'] } {
  const f = form.field(fieldName);
  return {
    value: f.value,
    setValue: f.setValue,
    error: f.error,
    errors: f.errors,
    touched: f.touched,
    dirty: f.dirty,
    valid: f.valid,
    onBlur: f.setTouched,
    bind: f.bind,
  };
}

// Type definitions are now TypeScript interfaces at the top of this file.
