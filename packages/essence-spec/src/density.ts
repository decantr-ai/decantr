import type { Density, DensityLevel, SpatialTokens } from './types.js';

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
  personality: string[],
  recipeSpatial?: RecipeSpatialHints,
): Density {
  const lower = personality.map(c => c.toLowerCase());

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

// --- Spatial Tokens ---

interface SpatialRecipeHints {
  section_padding?: string | null;
  density_bias?: number;
  content_gap_shift?: number;
}

const DENSITY_SCALES: Record<DensityLevel, number> = {
  compact: 0.65,
  comfortable: 1.0,
  spacious: 1.4,
};

const BASE_TOKENS = {
  '--d-section-py': 5,
  '--d-interactive-py': 0.5,
  '--d-interactive-px': 1,
  '--d-surface-p': 1.25,
  '--d-data-py': 0.625,
  '--d-control-py': 0.5,
  '--d-content-gap': 1,
} as const;

function roundTo3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function toRemString(value: number): string {
  const rounded = roundTo3(value);
  return `${rounded}rem`;
}

export function computeSpatialTokens(
  density: DensityLevel,
  recipeHints?: SpatialRecipeHints,
): SpatialTokens {
  const scale = DENSITY_SCALES[density];
  const biasMultiplier = 1 + (recipeHints?.density_bias ?? 0) / 10;

  const result = {} as SpatialTokens;

  for (const [key, base] of Object.entries(BASE_TOKENS)) {
    const tokenKey = key as keyof SpatialTokens;

    if (tokenKey === '--d-section-py' && recipeHints?.section_padding) {
      const pxMatch = recipeHints.section_padding.match(/^(\d+(?:\.\d+)?)px$/);
      if (pxMatch) {
        const remValue = parseFloat(pxMatch[1]) / 16;
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
    }

    let computed = base * scale * biasMultiplier;

    if (tokenKey === '--d-content-gap' && recipeHints?.content_gap_shift) {
      computed += recipeHints.content_gap_shift * 0.25;
    }

    result[tokenKey] = toRemString(computed);
  }

  return result;
}
