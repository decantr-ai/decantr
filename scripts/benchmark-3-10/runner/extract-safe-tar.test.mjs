import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { create } from 'tar';

import { extractSafeTar } from './extract-safe-tar.mjs';

test('safe tar extraction preserves files and contained symlinks', async () => {
  const root = await mkdtemp(join(tmpdir(), 'decantr-safe-tar-'));
  const source = join(root, 'source');
  const output = join(root, 'output');
  const tarPath = join(root, 'fixture.tar');
  await mkdir(join(source, 'nested'), { recursive: true });
  await writeFile(join(source, 'nested', 'value.txt'), 'fixture\n');
  await symlink('nested/value.txt', join(source, 'value-link'));
  await create({ cwd: source, file: tarPath }, ['.']);
  const result = await extractSafeTar({
    tarPath,
    outputRoot: output,
  });
  assert.match(result.tarFileSha256, /^[a-f0-9]{64}$/u);
  assert.equal(
    await readFile(join(output, 'value-link'), 'utf8'),
    'fixture\n',
  );
});
