import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  clearCredentials,
  getApiKeyOrToken,
  getCredentials,
  saveCredentials,
} from '../src/auth.js';

let tempConfigDir: string | null = null;
let previousConfigDir: string | undefined;
let previousApiKey: string | undefined;

function useTempConfigDir() {
  previousConfigDir = process.env.DECANTR_CONFIG_DIR;
  previousApiKey = process.env.DECANTR_API_KEY;
  tempConfigDir = mkdtempSync(join(tmpdir(), 'decantr-cli-auth-'));
  process.env.DECANTR_CONFIG_DIR = tempConfigDir;
  delete process.env.DECANTR_API_KEY;
  return tempConfigDir;
}

afterEach(() => {
  if (previousConfigDir === undefined) {
    delete process.env.DECANTR_CONFIG_DIR;
  } else {
    process.env.DECANTR_CONFIG_DIR = previousConfigDir;
  }

  if (previousApiKey === undefined) {
    delete process.env.DECANTR_API_KEY;
  } else {
    process.env.DECANTR_API_KEY = previousApiKey;
  }

  if (tempConfigDir) {
    rmSync(tempConfigDir, { recursive: true, force: true });
    tempConfigDir = null;
  }
});

describe('CLI auth storage', () => {
  it('stores credentials with private filesystem permissions', () => {
    const configDir = useTempConfigDir();

    saveCredentials({ access_token: 'token-value', api_key: 'api-key-value' });

    const dirMode = statSync(configDir).mode & 0o777;
    const fileMode = statSync(join(configDir, 'auth.json')).mode & 0o777;

    expect(dirMode).toBe(0o700);
    expect(fileMode).toBe(0o600);
    expect(getCredentials()).toMatchObject({
      access_token: 'token-value',
      api_key: 'api-key-value',
    });
  });

  it('prefers DECANTR_API_KEY over stored credentials', () => {
    useTempConfigDir();
    saveCredentials({ access_token: 'stored-token', api_key: 'stored-key' });
    process.env.DECANTR_API_KEY = 'env-key';

    expect(getApiKeyOrToken()).toBe('env-key');
  });

  it('clears stored credentials', () => {
    useTempConfigDir();
    saveCredentials({ access_token: 'token-value' });

    clearCredentials();

    expect(getCredentials()).toBeNull();
  });
});
