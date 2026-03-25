import type { Density, DensityLevel } from './types.js';

interface RecipeSpatialHints {
  density_bias?: number;
  content_gap_shift?: number;
}

interface DensityRule {
  traits: string[];
  level: DensityLevel;
  gap: number;
}

const RULES: DensityRule[] = [
  { traits: ['tactical', 'dense', 'data-dense', 'utilitarian'], level: 'compact', gap: 3 },
  { traits: ['luxurious', 'premium', 'editorial'], level: 'spacious', gap: 8 },
  { traits: ['playful', 'bouncy', 'expressive'], level: 'comfortable', gap: 5 },
  { traits: ['minimal', 'clean', 'airy'], level: 'spacious', gap: 6 },
  { traits: ['professional', 'modern', 'balanced'], level: 'comfortable', gap: 4 },
];

const MIN_GAP = 2;
const MAX_GAP = 10;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeDensity(
  character: string[],
  recipeSpatial?: RecipeSpatialHints,
): Density {
  const lower = character.map(c => c.toLowerCase());

  let level: DensityLevel = 'comfortable';
  let gap = 4;

  for (const rule of RULES) {
    if (rule.traits.some(t => lower.includes(t))) {
      level = rule.level;
      gap = rule.gap;
      break;
    }
  }

  if (recipeSpatial?.density_bias) {
    gap += recipeSpatial.density_bias;
  }
  if (recipeSpatial?.content_gap_shift) {
    gap += recipeSpatial.content_gap_shift;
  }

  gap = clamp(gap, MIN_GAP, MAX_GAP);

  if (gap <= 3) level = 'compact';
  else if (gap >= 6) level = 'spacious';
  else level = 'comfortable';

  return { level, content_gap: String(gap) };
}
