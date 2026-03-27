import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.config', 'decantr');
const AUTH_FILE = join(CONFIG_DIR, 'auth.json');

export interface AuthCredentials {
  access_token: string;
  refresh_token?: string;
  api_key?: string;
  email?: string;
  user_id?: string;
  expires_at?: string;
}

export function getCredentials(): AuthCredentials | null {
  if (!existsSync(AUTH_FILE)) return null;
  try {
    return JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
  } catch {
    return null;
  }
}

export function saveCredentials(creds: AuthCredentials): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(AUTH_FILE, JSON.stringify(creds, null, 2));
}

export function clearCredentials(): void {
  if (existsSync(AUTH_FILE)) {
    rmSync(AUTH_FILE);
  }
}

export function getApiKeyOrToken(): string | null {
  const creds = getCredentials();
  if (!creds) return null;
  return creds.api_key || creds.access_token || null;
}
