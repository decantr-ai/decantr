import type { Density, DensityLevel, SpatialTokens, SpatialTokenHints } from './types.js';

interface SpatialHints {
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
  spatialHints?: SpatialHints,
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

  if (spatialHints?.density_bias) {
    gap += spatialHints.density_bias;
  }
  if (spatialHints?.content_gap_shift) {
    gap += spatialHints.content_gap_shift;
  }

  gap = clamp(gap, MIN_GAP, MAX_GAP);

  if (gap <= 3) level = 'compact';
  else if (gap >= 6) level = 'spacious';
  else level = 'comfortable';

  return { level, content_gap: String(gap) };
}

// --- Spatial Tokens ---

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
  '--d-label-mb': 0.75,
  '--d-label-px': 0.75,
  '--d-section-gap': 1.5,
  '--d-annotation-mt': 0.5,
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
  spatialHints?: SpatialTokenHints,
): SpatialTokens {
  const scale = DENSITY_SCALES[density];
  const biasMultiplier = 1 + (spatialHints?.density_bias ?? 0) / 10;

  const result = {} as SpatialTokens;

  for (const [key, base] of Object.entries(BASE_TOKENS)) {
    const tokenKey = key as keyof SpatialTokens;

    // --d-label-px is a visual anchor — never density-scaled
    if (tokenKey === '--d-label-px') {
      result[tokenKey] = toRemString(base);
      continue;
    }

    if (tokenKey === '--d-section-py' && spatialHints?.section_padding) {
      const pxMatch = spatialHints.section_padding.match(/^(\d+(?:\.\d+)?)px$/);
      if (pxMatch) {
        const remValue = parseFloat(pxMatch[1]) / 16;
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
      const remMatch = spatialHints.section_padding.match(/^(\d+(?:\.\d+)?)rem$/);
      if (remMatch) {
        const remValue = parseFloat(remMatch[1]);
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
    }

    // --d-label-mb can be overridden by theme's label_content_gap
    if (tokenKey === '--d-label-mb' && spatialHints?.label_content_gap) {
      const remMatch = spatialHints.label_content_gap.match(/^(\d+(?:\.\d+)?)rem$/);
      if (remMatch) {
        const remValue = parseFloat(remMatch[1]);
        result[tokenKey] = toRemString(remValue * scale * biasMultiplier);
        continue;
      }
    }

    let computed = base * scale * biasMultiplier;

    if (tokenKey === '--d-content-gap' && spatialHints?.content_gap_shift) {
      computed += spatialHints.content_gap_shift * 0.25;
    }

    result[tokenKey] = toRemString(computed);
  }

  return result;
}
