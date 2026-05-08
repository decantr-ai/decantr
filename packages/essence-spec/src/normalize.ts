import type { EssenceFile } from './types.js';
import { isV4 } from './types.js';

const V4_REQUIRED_MESSAGE =
  'Active Decantr V2 workflows require Essence v4.0.0. Run `decantr migrate --to v4` for older essence files.';

export function normalizeEssence(input: Record<string, unknown>): EssenceFile {
  if (isV4(input)) {
    return input;
  }

  throw new Error(V4_REQUIRED_MESSAGE);
}
