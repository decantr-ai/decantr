import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

export function canonicalJson(value) {
  return JSON.stringify(normalize(value));
}

export function prettyCanonicalJson(value) {
  return `${JSON.stringify(normalize(value), null, 2)}\n`;
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function sha256Canonical(value) {
  return sha256(canonicalJson(value));
}

export async function readJsonFile(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function fileBinding(path, logicalName) {
  const bytes = await readFile(path);
  return { logicalName, sha256: sha256(bytes), bytes: bytes.byteLength };
}

export async function writeCanonicalFile(path, value) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, prettyCanonicalJson(value), { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, path);
}

export async function writeContentAddressed(root, category, value) {
  const bytes = canonicalJson(value);
  const digest = sha256(bytes);
  const path = join(root, category, 'sha256', `${digest}.json`);
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, bytes, { encoding: 'utf8', mode: 0o600 });
  await rename(temporary, path);
  return { digest, path };
}

function normalize(value, path = '$') {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`Non-finite number at ${path}`);
    return Object.is(value, -0) ? 0 : value;
  }
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`));
  if (typeof value !== 'object') throw new TypeError(`Unsupported canonical JSON value at ${path}`);
  const output = {};
  for (const key of Object.keys(value).sort()) {
    if (value[key] === undefined) throw new TypeError(`Undefined value at ${path}.${key}`);
    output[key] = normalize(value[key], `${path}.${key}`);
  }
  return output;
}
