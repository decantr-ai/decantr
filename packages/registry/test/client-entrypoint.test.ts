import { describe, expect, it } from 'vitest';
import {
  API_CONTENT_TYPES,
  RegistryAPIClient,
  isApiContentType,
} from '../src/client.js';

describe('@decantr/registry/client', () => {
  it('exports the web-safe api client surface', () => {
    expect(API_CONTENT_TYPES).toContain('patterns');
    expect(isApiContentType('themes')).toBe(true);
    expect(typeof RegistryAPIClient).toBe('function');
  });
});
