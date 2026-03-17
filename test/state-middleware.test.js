import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  withMiddleware, loggerMiddleware, validationMiddleware, undoMiddleware
} from '../src/state/middleware.js';
import { createSignal, createEffect } from '../src/state/index.js';

describe('withMiddleware', () => {
  it('wraps a signal with middleware', () => {
    const [count, setCount] = withMiddleware(
      createSignal(0),
      []
    );
    assert.equal(count(), 0);
    setCount(5);
    assert.equal(count(), 5);
  });

  it('onSet can transform value', () => {
    const clampMiddleware = () => ({
      onSet(value) { return Math.max(0, Math.min(100, value)); }
    });
    const [count, setCount] = withMiddleware(
      createSignal(50),
      [clampMiddleware]
    );
    setCount(150);
    assert.equal(count(), 100);
    setCount(-10);
    assert.equal(count(), 0);
  });

  it('onGet can transform read value', () => {
    const roundMiddleware = () => ({
      onGet(value) { return Math.round(value); }
    });
    const [count, setCount] = withMiddleware(
      createSignal(3.7),
      [roundMiddleware]
    );
    assert.equal(count(), 4);
  });
});

describe('validationMiddleware', () => {
  it('rejects invalid values', () => {
    let lastError = null;
    const [val, setVal] = withMiddleware(
      createSignal(5),
      [validationMiddleware(v => v > 0 ? true : 'Must be positive', { onError: (e) => { lastError = e; } })]
    );
    setVal(-1);
    assert.equal(val(), 5); // Should be rejected
    assert.equal(lastError, 'Must be positive');
  });

  it('accepts valid values', () => {
    const [val, setVal] = withMiddleware(
      createSignal(5),
      [validationMiddleware(v => v > 0 ? true : 'Nope')]
    );
    setVal(10);
    assert.equal(val(), 10);
  });
});

describe('undoMiddleware', () => {
  it('supports undo/redo', () => {
    const undo = undoMiddleware();
    const [text, setText] = withMiddleware(
      createSignal(''),
      [undo.middleware]
    );
    setText('hello');
    setText('world');
    assert.equal(text(), 'world');
    assert.equal(undo.canUndo(), true);
    undo.undo();
    assert.equal(text(), 'hello');
    assert.equal(undo.canRedo(), true);
    undo.redo();
    assert.equal(text(), 'world');
  });
});
