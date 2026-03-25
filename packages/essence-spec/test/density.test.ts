import { describe, it, expect } from 'vitest';
import { computeDensity } from '../src/density.js';

describe('computeDensity', () => {
  it('returns compact for tactical character', () => {
    const result = computeDensity(['tactical', 'professional']);
    expect(result).toEqual({ level: 'compact', content_gap: '3' });
  });

  it('returns compact for data-dense character', () => {
    const result = computeDensity(['data-dense']);
    expect(result).toEqual({ level: 'compact', content_gap: '3' });
  });

  it('returns spacious for editorial/luxurious character', () => {
    const result = computeDensity(['luxurious', 'premium']);
    expect(result).toEqual({ level: 'spacious', content_gap: '8' });
  });

  it('returns comfortable-expressive for playful character', () => {
    const result = computeDensity(['playful', 'bouncy']);
    expect(result).toEqual({ level: 'comfortable', content_gap: '5' });
  });

  it('returns spacious for minimal character', () => {
    const result = computeDensity(['minimal', 'clean']);
    expect(result).toEqual({ level: 'spacious', content_gap: '6' });
  });

  it('returns comfortable for professional character (balanced)', () => {
    const result = computeDensity(['professional', 'modern']);
    expect(result).toEqual({ level: 'comfortable', content_gap: '4' });
  });

  it('applies recipe density_bias shift', () => {
    const result = computeDensity(['professional'], { density_bias: -1 });
    expect(result).toEqual({ level: 'compact', content_gap: '3' });
  });

  it('clamps gap to minimum of 2', () => {
    const result = computeDensity(['tactical'], { density_bias: -5 });
    expect(result).toEqual({ level: 'compact', content_gap: '2' });
  });

  it('clamps gap to maximum of 10', () => {
    const result = computeDensity(['luxurious'], { density_bias: 5 });
    expect(result).toEqual({ level: 'spacious', content_gap: '10' });
  });

  it('defaults to comfortable for unknown traits', () => {
    const result = computeDensity(['quirky', 'unknown']);
    expect(result).toEqual({ level: 'comfortable', content_gap: '4' });
  });
});
