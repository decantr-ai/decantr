import { describe, expect, it } from 'vitest';
import { computeDensity, computeSpatialTokens } from '../src/density.js';

describe('computeDensity', () => {
  it('returns compact for tactical personality', () => {
    const result = computeDensity(['tactical', 'professional']);
    expect(result).toEqual({ level: 'compact', content_gap: '3' });
  });

  it('returns compact for data-dense personality', () => {
    const result = computeDensity(['data-dense']);
    expect(result).toEqual({ level: 'compact', content_gap: '3' });
  });

  it('returns spacious for editorial/luxurious personality', () => {
    const result = computeDensity(['luxurious', 'premium']);
    expect(result).toEqual({ level: 'spacious', content_gap: '8' });
  });

  it('returns comfortable-expressive for playful personality', () => {
    const result = computeDensity(['playful', 'bouncy']);
    expect(result).toEqual({ level: 'comfortable', content_gap: '5' });
  });

  it('returns spacious for minimal personality', () => {
    const result = computeDensity(['minimal', 'clean']);
    expect(result).toEqual({ level: 'spacious', content_gap: '6' });
  });

  it('returns comfortable for professional personality (balanced)', () => {
    const result = computeDensity(['professional', 'modern']);
    expect(result).toEqual({ level: 'comfortable', content_gap: '4' });
  });

  it('applies density_bias shift', () => {
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

describe('computeSpatialTokens', () => {
  it('returns base values for comfortable density with no spatial hints', () => {
    const tokens = computeSpatialTokens('comfortable');
    expect(tokens).toEqual({
      '--d-section-py': '5rem',
      '--d-interactive-py': '0.5rem',
      '--d-interactive-px': '1rem',
      '--d-surface-p': '1.25rem',
      '--d-data-py': '0.625rem',
      '--d-control-py': '0.5rem',
      '--d-content-gap': '1rem',
      '--d-label-mb': '0.75rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '1.5rem',
      '--d-annotation-mt': '0.5rem',
    });
  });

  it('scales values by 0.65 for compact density', () => {
    const tokens = computeSpatialTokens('compact');
    expect(tokens).toEqual({
      '--d-section-py': '3.25rem',
      '--d-interactive-py': '0.325rem',
      '--d-interactive-px': '0.65rem',
      '--d-surface-p': '0.813rem',
      '--d-data-py': '0.406rem',
      '--d-control-py': '0.325rem',
      '--d-content-gap': '0.65rem',
      '--d-label-mb': '0.488rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '0.975rem',
      '--d-annotation-mt': '0.325rem',
    });
  });

  it('scales values by 1.4 for spacious density', () => {
    const tokens = computeSpatialTokens('spacious');
    expect(tokens).toEqual({
      '--d-section-py': '7rem',
      '--d-interactive-py': '0.7rem',
      '--d-interactive-px': '1.4rem',
      '--d-surface-p': '1.75rem',
      '--d-data-py': '0.875rem',
      '--d-control-py': '0.7rem',
      '--d-content-gap': '1.4rem',
      '--d-label-mb': '1.05rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '2.1rem',
      '--d-annotation-mt': '0.7rem',
    });
  });

  it('uses section_padding override converted from px to rem', () => {
    const tokens = computeSpatialTokens('comfortable', { section_padding: '80px' });
    // 80px / 16 = 5rem, × 1.0 density × (1 + 0/10) bias = 5rem
    expect(tokens['--d-section-py']).toBe('5rem');
  });

  it('applies density_bias multiplier', () => {
    const tokens = computeSpatialTokens('comfortable', { density_bias: 2 });
    // base × 1.0 × (1 + 2/10) = base × 1.2
    expect(tokens).toEqual({
      '--d-section-py': '6rem',
      '--d-interactive-py': '0.6rem',
      '--d-interactive-px': '1.2rem',
      '--d-surface-p': '1.5rem',
      '--d-data-py': '0.75rem',
      '--d-control-py': '0.6rem',
      '--d-content-gap': '1.2rem',
      '--d-label-mb': '0.9rem',
      '--d-label-px': '0.75rem',
      '--d-section-gap': '1.8rem',
      '--d-annotation-mt': '0.6rem',
    });
  });

  it('applies content_gap_shift to content gap', () => {
    const tokens = computeSpatialTokens('comfortable', { content_gap_shift: 2 });
    // content_gap = 1.0 (base × scale) + 2 × 0.25 = 1.5
    expect(tokens['--d-content-gap']).toBe('1.5rem');
    // other tokens unaffected
    expect(tokens['--d-section-py']).toBe('5rem');
  });

  it('combines density_bias and content_gap_shift', () => {
    const tokens = computeSpatialTokens('compact', { density_bias: 2, content_gap_shift: 1 });
    // compact scale=0.65, bias multiplier=(1 + 2/10)=1.2
    // section-py: 5 × 0.65 × 1.2 = 3.9
    // content_gap: 1 × 0.65 × 1.2 = 0.78, + 1 × 0.25 = 1.03
    expect(tokens['--d-section-py']).toBe('3.9rem');
    expect(tokens['--d-content-gap']).toBe('1.03rem');
  });

  it('applies section_padding with density_bias', () => {
    const tokens = computeSpatialTokens('comfortable', {
      section_padding: '64px',
      density_bias: 3,
    });
    // 64px / 16 = 4rem, × 1.0 density × (1 + 3/10) = 4 × 1.3 = 5.2
    expect(tokens['--d-section-py']).toBe('5.2rem');
  });

  it('includes new spatial contract tokens for comfortable density', () => {
    const tokens = computeSpatialTokens('comfortable');
    expect(tokens['--d-label-mb']).toBe('0.75rem');
    expect(tokens['--d-label-px']).toBe('0.75rem');
    expect(tokens['--d-section-gap']).toBe('1.5rem');
    expect(tokens['--d-annotation-mt']).toBe('0.5rem');
  });

  it('scales new spatial contract tokens for compact density (except label-px)', () => {
    const tokens = computeSpatialTokens('compact');
    expect(tokens['--d-label-mb']).toBe('0.488rem');
    expect(tokens['--d-label-px']).toBe('0.75rem');
    expect(tokens['--d-section-gap']).toBe('0.975rem');
    expect(tokens['--d-annotation-mt']).toBe('0.325rem');
  });

  it('scales new spatial contract tokens for spacious density (except label-px)', () => {
    const tokens = computeSpatialTokens('spacious');
    expect(tokens['--d-label-mb']).toBe('1.05rem');
    expect(tokens['--d-label-px']).toBe('0.75rem');
    expect(tokens['--d-section-gap']).toBe('2.1rem');
    expect(tokens['--d-annotation-mt']).toBe('0.7rem');
  });

  it('uses label_content_gap override for --d-label-mb', () => {
    const tokens = computeSpatialTokens('comfortable', { label_content_gap: '1rem' });
    expect(tokens['--d-label-mb']).toBe('1rem');
    expect(tokens['--d-section-py']).toBe('5rem');
  });

  it('uses section_padding as rem string', () => {
    const tokens = computeSpatialTokens('comfortable', { section_padding: '5rem' });
    expect(tokens['--d-section-py']).toBe('5rem');
  });
});
