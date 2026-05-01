import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const CONFIG_DIR_MODE = 0o700;
const AUTH_FILE_MODE = 0o600;

export interface AuthCredentials {
  access_token: string;
  refresh_token?: string;
  api_key?: string;
  email?: string;
  user_id?: string;
  expires_at?: string;
}

function getConfigDir(): string {
  return process.env.DECANTR_CONFIG_DIR || join(homedir(), '.config', 'decantr');
}

function getAuthFile(): string {
  return join(getConfigDir(), 'auth.json');
}

function chmodIfNeeded(path: string, mode: number): void {
  try {
    if ((statSync(path).mode & 0o777) !== mode) {
      chmodSync(path, mode);
    }
  } catch {
    // Permission hardening should not make credentials unreadable on unusual filesystems.
  }
}

function ensureConfigDir(): void {
  const configDir = getConfigDir();
  mkdirSync(configDir, { recursive: true, mode: CONFIG_DIR_MODE });
  chmodIfNeeded(configDir, CONFIG_DIR_MODE);
}

export function getCredentials(): AuthCredentials | null {
  const authFile = getAuthFile();
  if (!existsSync(authFile)) return null;
  try {
    chmodIfNeeded(authFile, AUTH_FILE_MODE);
    return JSON.parse(readFileSync(authFile, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveCredentials(creds: AuthCredentials): void {
  ensureConfigDir();
  const authFile = getAuthFile();
  writeFileSync(authFile, JSON.stringify(creds, null, 2), { mode: AUTH_FILE_MODE });
  chmodIfNeeded(authFile, AUTH_FILE_MODE);
}

export function clearCredentials(): void {
  const authFile = getAuthFile();
  if (existsSync(authFile)) {
    rmSync(authFile);
  }
}

export function getApiKeyOrToken(): string | null {
  const envKey = process.env.DECANTR_API_KEY?.trim();
  if (envKey) return envKey;

  const creds = getCredentials();
  if (!creds) return null;
  return creds.api_key || creds.access_token || null;
}
